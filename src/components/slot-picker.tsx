"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { bookAppointment } from "@/app/actions/booking";
import { formatDay, formatTime } from "@/lib/format";
import type { SlotDay } from "@/lib/slots";

export function SlotPicker({ doctorId, days }: { doctorId: string; days: SlotDay[] }) {
  const router = useRouter();
  const [dayIdx, setDayIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition(); // shows the loading state

  const day = days[dayIdx];

  function confirm() {
    if (!selected) return;
    startTransition(async () => {
      const res = await bookAppointment({ doctorId, slotStart: selected, reason });
      if (!res.ok) {
        toast.error(res.error); // e.g. "slot was just taken"
        setSelected(null);
        router.refresh(); // reload the slots so the taken one turns grey
        return;
      }
      toast.success("Appointment booked!");
      router.push("/patient");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Step 1: choose a day */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <CalendarDays className="h-4 w-4 text-teal-600" /> 1. Choose a day
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d, i) => {
              const free = d.slots.filter((s) => !s.taken).length;
              return (
                <button
                  key={d.dayIso}
                  onClick={() => {
                    setDayIdx(i);
                    setSelected(null);
                  }}
                  className={`min-w-24 shrink-0 rounded-xl border px-4 py-3 text-center text-sm transition ${
                    dayIdx === i
                      ? "border-teal-600 bg-teal-600 text-white shadow-md"
                      : "bg-card hover:border-teal-400"
                  }`}
                >
                  <div className="font-semibold">{formatDay(d.dayIso)}</div>
                  <div className={`text-xs ${dayIdx === i ? "text-teal-100" : "text-muted-foreground"}`}>
                    {free} free
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: choose a time */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Clock className="h-4 w-4 text-teal-600" /> 2. Choose a time
          </h2>
          {day.slots.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No slots left on this day. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {day.slots.map((s) => (
                <button
                  key={s.iso}
                  disabled={s.taken}
                  onClick={() => setSelected(s.iso)}
                  className={`rounded-xl border py-3 text-sm font-medium transition ${
                    s.taken
                      ? "cursor-not-allowed bg-muted text-muted-foreground line-through opacity-60"
                      : selected === s.iso
                      ? "scale-105 border-teal-600 bg-teal-600 text-white shadow-md"
                      : "bg-card hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                  }`}
                >
                  {formatTime(s.iso)}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Step 3: confirm (sticky summary card) */}
      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-semibold">3. Confirm</h2>
        {selected ? (
          <div className="flex items-start gap-2 rounded-lg bg-teal-50 p-3 text-sm dark:bg-teal-950/30">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-600" />
            <div>
              <div className="font-medium">{formatDay(selected)}</div>
              <div className="text-muted-foreground">{formatTime(selected)}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pick a day and a time to continue.</p>
        )}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Reason for visit (optional)"
          aria-label="Reason for visit"
          className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={confirm}
          disabled={!selected || pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Booking..." : "Confirm appointment"}
        </button>
      </aside>
    </div>
  );
}