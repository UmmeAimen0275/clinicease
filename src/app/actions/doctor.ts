"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayRangePK } from "@/lib/day";

// SECURITY: every action first proves the caller is a DOCTOR
async function getDoctor() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") return null;
  return prisma.doctor.findUnique({ where: { userId: session.user.id } });
}

export async function checkInPatient(id: string) {
  const doctor = await getDoctor();
  if (!doctor) return { ok: false, error: "Not allowed." };

  // The doctor can only touch THEIR OWN appointments
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.doctorId !== doctor.id) return { ok: false, error: "Not found." };
  if (appt.status !== "BOOKED") return { ok: false, error: "Already checked in." };

  // Next token number for this doctor today
  const { start, end } = todayRangePK();
  const last = await prisma.appointment.aggregate({
    where: { doctorId: doctor.id, slotStart: { gte: start, lt: end } },
    _max: { token: true },
  });

  await prisma.appointment.update({
    where: { id },
    data: { status: "CHECKED_IN", token: (last._max.token ?? 0) + 1 },
  });
  revalidatePath("/doctor");
  return { ok: true };
}

export async function completeVisit(id: string, notes: string) {
  const doctor = await getDoctor();
  if (!doctor) return { ok: false, error: "Not allowed." };

  const parsed = z.string().max(2000).safeParse(notes);
  if (!parsed.success) return { ok: false, error: "Notes are too long." };

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.doctorId !== doctor.id) return { ok: false, error: "Not found." };
  if (appt.status !== "CHECKED_IN") return { ok: false, error: "Check the patient in first." };

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id },
      data: { status: "COMPLETED", notes: parsed.data },
    }),
    // Audit log: who wrote medical notes
    prisma.auditLog.create({
      data: { userId: doctor.userId, action: "VISIT_COMPLETED", targetId: id },
    }),
  ]);
  revalidatePath("/doctor");
  return { ok: true };
}