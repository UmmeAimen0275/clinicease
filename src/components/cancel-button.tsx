"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelAppointment } from "@/app/actions/booking";

export function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false); // step 1 -> step 2
  const [pending, startTransition] = useTransition();

  function doCancel() {
    startTransition(async () => {
      const res = await cancelAppointment(id);
      if (!res.ok) toast.error(res.error);
      else toast.success("Appointment cancelled");
      setConfirming(false);
      router.refresh();
    });
  }

  if (!confirming)
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg border px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        Cancel
      </button>
    );

  return (
    <span className="flex items-center gap-2 text-sm">
      Sure?
      <button
        onClick={doCancel}
        disabled={pending}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-white disabled:opacity-50"
      >
        {pending ? "..." : "Yes"}
      </button>
      <button onClick={() => setConfirming(false)} className="rounded-lg border px-3 py-1.5">
        No
      </button>
    </span>
  );
}