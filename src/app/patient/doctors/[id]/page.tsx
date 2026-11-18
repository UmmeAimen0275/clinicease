import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSlots } from "@/lib/slots";
import { initials } from "@/lib/format";
import { SlotPicker } from "@/components/slot-picker";

// In Next.js 15, params is a Promise, so we "await" it
export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!doctor) notFound();

  // Slots that are already booked (cancelled ones are deleted, so they are free again)
  const taken = await prisma.appointment.findMany({
    where: { doctorId: id, slotStart: { gte: new Date() } },
    select: { slotStart: true },
  });

  const days = getSlots(doctor.workStart, doctor.workEnd, taken.map((t) => t.slotStart));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-xl font-bold text-white">
          {initials(doctor.user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{doctor.user.name}</h1>
          <p className="font-medium text-teal-700 dark:text-teal-400">{doctor.specialty}</p>
          <p className="text-sm text-muted-foreground">
            Rs {doctor.fee.toLocaleString()} per visit
          </p>
        </div>
      </div>
      <SlotPicker doctorId={doctor.id} days={days} />
    </div>
  );
}