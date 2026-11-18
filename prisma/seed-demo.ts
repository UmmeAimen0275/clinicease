import { PrismaClient, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany();
  const patients = await prisma.user.findMany({ where: { role: "PATIENT" } });
  if (!doctors.length || !patients.length) throw new Error("Run the main seed first.");

  // Today in Pakistan time
  const pk = new Date(Date.now() + 5 * 3600_000);
  const y = pk.getUTCFullYear(), m = pk.getUTCMonth(), d = pk.getUTCDate();
  const reasons = ["Checkup", "Follow-up", "Fever", "Skin rash", "Chest pain", "Consultation"];

  const data = [];
  for (let off = -6; off <= 3; off++) {
    for (const doc of doctors) {
      // 2 to 5 random hours inside the doctor's working hours
      const count = 2 + Math.floor(Math.random() * 4);
      const hours = new Set<number>();
      while (hours.size < count)
        hours.add(doc.workStart + Math.floor(Math.random() * (doc.workEnd - doc.workStart)));

      for (const h of hours) {
        const slotStart = new Date(Date.UTC(y, m, d + off, h - 5));
        const past = slotStart.getTime() < Date.now();
        // Past: mostly completed, a few never came (no-shows). Future: booked.
        const status = past && Math.random() < 0.85 ? Status.COMPLETED : Status.BOOKED;
        data.push({
          doctorId: doc.id,
          patientId: patients[Math.floor(Math.random() * patients.length)].id,
          slotStart,
          status,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          notes: status === Status.COMPLETED ? "Advised rest, fluids and a follow-up if needed." : null,
        });
      }
    }
  }

  const res = await prisma.appointment.createMany({ data, skipDuplicates: true });
  console.log(`Created ${res.count} demo appointments.`);
}

main().finally(() => prisma.$disconnect());