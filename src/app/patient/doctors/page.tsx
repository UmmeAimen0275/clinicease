import { prisma } from "@/lib/prisma";
import { DoctorSearch } from "@/components/doctor-search";
export const dynamic = "force-dynamic"; // always read fresh data, never at build time

export default async function DoctorsPage() {
  // Read all doctors from Neon, with their names
  const doctors = await prisma.doctor.findMany({
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find a doctor</h1>
        <p className="text-muted-foreground">Pick a specialist and book in seconds.</p>
      </div>
      <DoctorSearch
        doctors={doctors.map((d) => ({
          id: d.id,
          name: d.user.name,
          specialty: d.specialty,
          bio: d.bio,
          fee: d.fee,
        }))}
      />
    </div>
  );
}