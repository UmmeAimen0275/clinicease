"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayRangePK } from "@/lib/day";

// SECURITY: every admin action first proves the caller is an ADMIN
async function requireAdmin() {
  const session = await auth();
  return session && session.user.role === "ADMIN" ? session : null;
}

/* ---------- WALK-IN: register + assign slot + check in, in one step ---------- */

const walkInSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().optional(),
  newName: z.string().min(2).max(60).optional(),
  reason: z.string().max(300).optional(),
});

export async function createWalkIn(input: unknown) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not allowed." };

  const parsed = walkInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fill in the form." };
  const { doctorId, patientId, newName, reason } = parsed.data;
  if (!patientId && !newName)
    return { ok: false, error: "Choose a patient or type a new name." };

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return { ok: false, error: "Doctor not found." };

  // 1. Find the first free hourly slot for this doctor from now until closing
  const { start, end } = todayRangePK();
  const taken = await prisma.appointment.findMany({
    where: { doctorId, slotStart: { gte: start, lt: end } },
    select: { slotStart: true },
  });
  const takenSet = new Set(taken.map((t) => t.slotStart.getTime()));
  const nowHourPk = new Date(Date.now() + 5 * 3600_000).getUTCHours();

  let slot: Date | null = null;
  for (let h = Math.max(nowHourPk, doctor.workStart); h < doctor.workEnd; h++) {
    const candidate = new Date(start.getTime() + h * 3600_000); // h o'clock PK
    if (!takenSet.has(candidate.getTime())) {
      slot = candidate;
      break;
    }
  }
  if (!slot) return { ok: false, error: "No free slots left today for this doctor." };

  // 2. Existing patient, or create a quick walk-in account
  let pid = patientId;
  if (pid) {
    const p = await prisma.user.findUnique({ where: { id: pid } });
    if (!p || p.role !== "PATIENT") return { ok: false, error: "Patient not found." };
  } else {
    const u = await prisma.user.create({
      data: {
        name: newName!,
        email: `walkin-${randomBytes(4).toString("hex")}@clinicease.local`,
        passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), 10),
        role: "PATIENT",
      },
    });
    pid = u.id;
  }

  // 3. Next queue token for this doctor today
  const last = await prisma.appointment.aggregate({
    where: { doctorId, slotStart: { gte: start, lt: end } },
    _max: { token: true },
  });
  const token = (last._max.token ?? 0) + 1;

  // 4. Save as CHECKED_IN. The unique rule still protects us from clashes.
  try {
    const appt = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: pid!,
        slotStart: slot,
        status: "CHECKED_IN",
        token,
        reason: reason ?? "Walk-in",
      },
    });
    await prisma.auditLog.create({
      data: { userId: admin.user.id, action: "WALK_IN_CREATED", targetId: appt.id },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: "Slot was just taken. Please try again." };
    throw e;
  }

  revalidatePath("/admin");
  revalidatePath("/doctor");
  return { ok: true, token, doctor: doctor.specialty };
}

/* ---------- ADD DOCTOR ---------- */

const doctorSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specialty: z.string().min(2).max(40),
  fee: z.coerce.number().int().min(0).max(100000),
  bio: z.string().max(300).optional(),
});

export async function createDoctor(input: unknown) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not allowed." };

  const parsed = doctorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  const email = d.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } }))
    return { ok: false, error: "This email is already registered." };

  // Creates the login user AND the doctor profile together
  await prisma.user.create({
    data: {
      name: d.name,
      email,
      passwordHash: await bcrypt.hash(d.password, 10),
      role: "DOCTOR",
      doctor: { create: { specialty: d.specialty, fee: d.fee, bio: d.bio || null } },
    },
  });
  await prisma.auditLog.create({
    data: { userId: admin.user.id, action: "DOCTOR_CREATED", targetId: email },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}