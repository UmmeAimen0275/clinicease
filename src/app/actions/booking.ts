"use server"; // runs ONLY on the server

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  doctorId: z.string().min(1),
  slotStart: z.string().datetime(),
  reason: z.string().max(300).optional(),
});

export async function bookAppointment(input: unknown) {
  // 1. SECURITY: only a logged-in PATIENT can book
  const session = await auth();
  if (!session || session.user.role !== "PATIENT")
    return { ok: false, error: "Please log in as a patient." };

  // 2. Validate the input (never trust the browser)
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid booking request." };
  const { doctorId, reason } = parsed.data;
  const slot = new Date(parsed.data.slotStart);

  if (slot.getTime() <= Date.now())
    return { ok: false, error: "That time has already passed." };

  // 3. The slot must be inside the doctor's working hours, on the hour
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return { ok: false, error: "Doctor not found." };
  const hourPk = (slot.getUTCHours() + 5) % 24;
  if (slot.getUTCMinutes() !== 0 || hourPk < doctor.workStart || hourPk >= doctor.workEnd)
    return { ok: false, error: "That slot is outside working hours." };

  // 4. Save. The DATABASE rule @@unique([doctorId, slotStart]) blocks double booking.
  try {
    await prisma.appointment.create({
      data: { doctorId, slotStart: slot, reason, patientId: session.user.id },
    });
  } catch (e) {
    // P2002 = "unique rule broken" = someone else just took this slot
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: "Sorry, that slot was just taken. Please pick another." };
    throw e;
  }

  revalidatePath("/patient");
  return { ok: true };
}

export async function cancelAppointment(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT")
    return { ok: false, error: "Not allowed." };

  // SECURITY: a patient can only cancel THEIR OWN appointment
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.patientId !== session.user.id)
    return { ok: false, error: "Appointment not found." };
  if (appt.status !== "BOOKED")
    return { ok: false, error: "Only booked appointments can be cancelled." };

  // We DELETE the row so the slot becomes free again (the unique rule would
  // otherwise block rebooking). We write an audit log first, in one transaction.
  await prisma.$transaction([
    prisma.auditLog.create({
      data: { userId: session.user.id, action: "APPOINTMENT_CANCELLED", targetId: id },
    }),
    prisma.appointment.delete({ where: { id } }),
  ]);

  revalidatePath("/patient");
  return { ok: true };
}