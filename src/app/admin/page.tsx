import { prisma } from "@/lib/prisma";
import { todayRangePK } from "@/lib/day";
import { formatDay, formatTime } from "@/lib/format";
import { AdminCharts } from "@/components/admin-charts";
import { Users, Stethoscope, CalendarDays, CheckCheck, UserX, Activity } from "lucide-react";
export const dynamic = "force-dynamic"; // always show fresh numbers

const DAY = 86_400_000;
const shortDay = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" }).format(d);

export default async function AdminHome() {
  const { start, end } = todayRangePK();
  const now = new Date();
  const rangeStart = new Date(start.getTime() - 3 * DAY);
  const rangeEnd = new Date(end.getTime() + 3 * DAY);

  // All queries run at the same time (faster)
  const [patients, doctors, todayCount, completed, pastTotal, pastBooked, rangeAppts, byDoctor, logs] =
    await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.doctor.count(),
      prisma.appointment.count({ where: { slotStart: { gte: start, lt: end } } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { slotStart: { lt: now } } }),
      // A past appointment that was never checked in = no-show
      prisma.appointment.count({ where: { slotStart: { lt: now }, status: "BOOKED" } }),
      prisma.appointment.findMany({
        where: { slotStart: { gte: rangeStart, lt: rangeEnd } },
        select: { slotStart: true },
      }),
      prisma.appointment.groupBy({ by: ["doctorId"], _count: { _all: true } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

  const noShowRate = pastTotal ? Math.round((pastBooked / pastTotal) * 100) : 0;

  // Chart 1: 7 days (3 before today, today, 3 after)
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(start.getTime() + (i - 3) * DAY);
    const dayEnd = new Date(dayStart.getTime() + DAY);
    return {
      label: shortDay(new Date(dayStart.getTime() + 12 * 3600_000)),
      count: rangeAppts.filter((a) => a.slotStart >= dayStart && a.slotStart < dayEnd).length,
    };
  });

  // Chart 2: appointments per doctor
  const docs = await prisma.doctor.findMany({
    where: { id: { in: byDoctor.map((b) => b.doctorId) } },
    include: { user: { select: { name: true } } },
  });
  const perDoctor = byDoctor
    .map((b) => ({
      label: (docs.find((d) => d.id === b.doctorId)?.user.name ?? "?").replace(/^Dr\.?\s+/i, ""),
      count: b._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const stats = [
    { l: "Patients", v: patients, i: Users, c: "text-violet-600 bg-violet-100" },
    { l: "Doctors", v: doctors, i: Stethoscope, c: "text-teal-600 bg-teal-100" },
    { l: "Today", v: todayCount, i: CalendarDays, c: "text-sky-600 bg-sky-100" },
    { l: "Completed visits", v: completed, i: CheckCheck, c: "text-emerald-600 bg-emerald-100" },
    { l: "No-show rate", v: `${noShowRate}%`, i: UserX, c: "text-rose-600 bg-rose-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Clinic overview</h1>
        <p className="text-muted-foreground">Live numbers from your database.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${s.c}`}>
              <s.i className="h-5 w-5" />
            </span>
            <div className="text-2xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <AdminCharts perDay={perDay} perDoctor={perDoctor} />

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4 text-violet-600" /> Recent activity (audit log)
        </h3>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between py-2">
                <span className="font-mono text-xs">{l.action}</span>
                <span className="text-muted-foreground">
                  {formatDay(l.createdAt)}, {formatTime(l.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}