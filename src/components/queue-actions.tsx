"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { checkInPatient, completeVisit } from "@/app/actions/doctor";

export function QueueActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong");
      else toast.success(okMsg);
      router.refresh();
    });
  }

  if (status === "BOOKED")
    return (
      <button
        disabled={pending}
        onClick={() => run(() => checkInPatient(id), "Patient checked in")}
        className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Check in
      </button>
    );

  if (status === "CHECKED_IN")
    return (
      <div className="w-full space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Visit notes / prescription..."
          aria-label="Visit notes"
          className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          disabled={pending}
          onClick={() => run(() => completeVisit(id, notes), "Visit completed")}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Complete visit
        </button>
      </div>
    );

  return null;
}