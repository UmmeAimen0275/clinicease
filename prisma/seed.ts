import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password once. All demo accounts share it.
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // upsert = create if missing, skip if it exists (safe to run many times)
  await prisma.user.upsert({
    where: { email: "admin@clinicease.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@clinicease.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const doctors = [
    {
      name: "Dr. Ayesha Khan",
      email: "ayesha@clinicease.com",
      specialty: "Cardiology",
      fee: 3000,
      bio: "10 years of experience in heart care.",
    },
    {
      name: "Dr. Bilal Ahmed",
      email: "bilal@clinicease.com",
      specialty: "Dermatology",
      fee: 2000,
      bio: "Skin, hair and cosmetic care.",
    },
    {
      name: "Dr. Sara Malik",
      email: "sara@clinicease.com",
      specialty: "Pediatrics",
      fee: 1500,
      bio: "Caring for children of all ages.",
    },
  ];

  for (const d of doctors) {
    // First the login account (role DOCTOR)...
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: { name: d.name, email: d.email, passwordHash, role: Role.DOCTOR },
    });
    // ...then the doctor details linked to that account
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialty: d.specialty,
        fee: d.fee,
        bio: d.bio,
      },
    });
  }

  for (const p of [
    { name: "Ali Raza", email: "ali@example.com" },
    { name: "Fatima Noor", email: "fatima@example.com" },
  ]) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, passwordHash, role: Role.PATIENT },
    });
  }

  console.log("Seeded.");
}

// Run main, then always close the connection
main().finally(() => prisma.$disconnect());
