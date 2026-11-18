import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDay, formatTime } from "@/lib/format";
import { CancelButton } from "@/components/cancel-button";
import { CalendarPlus, CalendarCheck2 } from "lucide-react";

// Colors for each status badge
const statusStyle: Record<string, string> = {
  BOOKED: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  CHECKED_IN: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default async function PatientHome() {
  const session = await auth();

  // SECURITY: only THIS patient's appointments (filtered by their own id)
  const appts = await prisma.appointment.findMany({
    where: { patientId: session!.user.id },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { slotStart: "asc" },
  });

  const upcoming = appts.filter((a) => a.status === "BOOKED" || a.status === "CHECKED_IN");
  const history = appts.filter((a) => a.status === "COMPLETED").reverse();
  const firstName = session!.user.name?.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Hello, {firstName} 👋</h1>
          <p className="text-teal-50">
            You have {upcoming.length} upcoming appointment{upcoming.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/patient/doctors"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:scale-105"
        >
          <CalendarPlus className="h-4 w-4" /> Book appointment
        </Link>
      </div>

      {/* Upcoming */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            <CalendarCheck2 className="mx-auto mb-2 h-8 w-8" />
            <p>No upcoming appointments.</p>
            <Link href="/patient/doctors" className="mt-2 inline-block text-teal-700 underline">
              Find a doctor
            </Link>
          </div>
        ) : (
          upcoming.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold">{a.doctor.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {a.doctor.specialty} · {formatDay(a.slotStart)} at {formatTime(a.slotStart)}
                </p>
                {a.token && (
                  <p className="mt-1 text-sm font-medium text-amber-700">Queue token #{a.token}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[a.status]}`}>
                  {a.status.replace("_", " ")}
                </span>
                {a.status === "BOOKED" && <CancelButton id={a.id} />}
              </div>
            </div>
          ))
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">History</h2>
          {history.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-card p-4">
              <p className="font-semibold">
                {a.doctor.user.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {formatDay(a.slotStart)}
                </span>
              </p>
              {a.notes && <p className="mt-1 text-sm text-muted-foreground">Doctor's notes: {a.notes}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}