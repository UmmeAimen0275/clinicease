import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayRangePK } from "@/lib/day";
import { formatTime } from "@/lib/format";
import { QueueActions } from "@/components/queue-actions";
import { CalendarX2 } from "lucide-react";

const badge: Record<string, string> = {
  BOOKED: "bg-sky-100 text-sky-700",
  CHECKED_IN: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default async function DoctorHome() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({ where: { userId: session!.user.id } });
  if (!doctor) return <p>Doctor profile not found.</p>;

  const { start, end } = todayRangePK();
  const appts = await prisma.appointment.findMany({
    where: { doctorId: doctor.id, slotStart: { gte: start, lt: end } },
    include: { patient: { select: { name: true } } },
    orderBy: { slotStart: "asc" },
  });

  const waiting = appts.filter((a) => a.status === "CHECKED_IN").length;
  const done = appts.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{session!.user.name}</h1>
        <p className="text-muted-foreground">{doctor.specialty} · today's queue</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Today", v: appts.length },
          { l: "Waiting", v: waiting },
          { l: "Completed", v: done },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-sky-700">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {appts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          <CalendarX2 className="mx-auto mb-2 h-8 w-8" />
          No appointments today.
        </div>
      ) : (
        <div className="space-y-3">
          {appts.map((a) => (
            <div key={a.id} className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{a.patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(a.slotStart)}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.token && <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white">#{a.token}</span>}
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[a.status]}`}>
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <QueueActions id={a.id} status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}