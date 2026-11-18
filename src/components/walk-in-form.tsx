"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";
import { createWalkIn } from "@/app/actions/admin";

type Opt = { id: string; label: string };

const field =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500";

export function WalkInForm({ doctors, patients }: { doctors: Opt[]; patients: Opt[] }) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [patientId, setPatientId] = useState("");
  const [newName, setNewName] = useState("");
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState<number | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createWalkIn({
        doctorId,
        patientId: patientId || undefined,
        newName: patientId ? undefined : newName,
        reason: reason || undefined,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      setTicket(res.token ?? null);
      toast.success(`Checked in. Token #${res.token}`);
      setNewName("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <label htmlFor="doc" className="text-sm font-medium">Doctor</label>
          <select id="doc" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={field}>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pat" className="text-sm font-medium">Patient</label>
          <select id="pat" value={patientId} onChange={(e) => setPatientId(e.target.value)} className={field}>
            <option value="">New patient (type name below)</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {!patientId && (
          <div className="space-y-1.5">
            <label htmlFor="nn" className="text-sm font-medium">New patient name</label>
            <input id="nn" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className={field} />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="rs" className="text-sm font-medium">Reason (optional)</label>
          <input id="rs" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className={field} />
        </div>

        <button
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
          Check in and get token
        </button>
      </form>

      {/* Big ticket after success */}
      <div className="grid place-items-center rounded-2xl border border-dashed bg-card p-8 text-center">
        {ticket ? (
          <div className="animate-[fade-up_0.5s_ease-out_both]">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Queue token</p>
            <div className="text-8xl font-extrabold text-violet-600">#{ticket}</div>
            <p className="text-sm text-muted-foreground">Patient is now on the live queue board.</p>
          </div>
        ) : (
          <p className="text-muted-foreground">The token will appear here.</p>
        )}
      </div>
    </div>
  );
}