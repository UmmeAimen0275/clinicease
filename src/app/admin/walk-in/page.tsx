import { prisma } from "@/lib/prisma";
import { WalkInForm } from "@/components/walk-in-form";

export default async function WalkInPage() {
  const [doctors, patients] = await Promise.all([
    prisma.doctor.findMany({ include: { user: { select: { name: true } } } }),
    prisma.user.findMany({
      where: { role: "PATIENT", NOT: { email: { endsWith: "@clinicease.local" } } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Walk-in desk</h1>
        <p className="text-muted-foreground">Register a patient who just arrived and give them a token.</p>
      </div>
      <WalkInForm
        doctors={doctors.map((d) => ({ id: d.id, label: `${d.user.name} (${d.specialty})` }))}
        patients={patients.map((p) => ({ id: p.id, label: `${p.name} - ${p.email}` }))}
      />
    </div>
  );
}