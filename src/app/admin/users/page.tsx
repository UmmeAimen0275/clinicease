import { prisma } from "@/lib/prisma";
import { formatDay } from "@/lib/format";
import { AddDoctorForm } from "@/components/add-doctor-form";
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [doctors, patients] = await Promise.all([
    prisma.doctor.findMany({
      include: { user: { select: { name: true, email: true } }, _count: { select: { appointments: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, name: true, email: true, createdAt: true, _count: { select: { appointments: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const th = "px-4 py-2 text-left font-medium text-muted-foreground";
  const td = "px-4 py-2.5";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">People</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Doctors ({doctors.length})</h2>
        </div>
        <AddDoctorForm />
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr><th className={th}>Name</th><th className={th}>Specialty</th><th className={th}>Fee</th><th className={th}>Appointments</th></tr>
            </thead>
            <tbody className="divide-y">
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td className={td}>{d.user.name}<div className="text-xs text-muted-foreground">{d.user.email}</div></td>
                  <td className={td}>{d.specialty}</td>
                  <td className={td}>Rs {d.fee.toLocaleString()}</td>
                  <td className={td}>{d._count.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Patients ({patients.length})</h2>
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Joined</th><th className={th}>Visits</th></tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className={td}>{p.name}</td>
                  <td className={`${td} text-muted-foreground`}>{p.email}</td>
                  <td className={td}>{formatDay(p.createdAt)}</td>
                  <td className={td}>{p._count.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Privacy: admins see names and emails only. Medical notes are visible to the treating doctor and the patient.
        </p>
      </section>
    </div>
  );
}