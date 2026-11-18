"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createDoctor } from "@/app/actions/admin";

const field =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500";

export function AddDoctorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    start(async () => {
      const res = await createDoctor({
        name: String(f.get("name")),
        email: String(f.get("email")),
        password: String(f.get("password")),
        specialty: String(f.get("specialty")),
        fee: String(f.get("fee")),
        bio: String(f.get("bio") ?? ""),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      toast.success("Doctor added");
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus className="h-4 w-4" /> Add doctor
      </button>
    );

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:grid-cols-2">
      <input name="name" placeholder="Dr. Full name" required aria-label="Name" className={field} />
      <input name="email" type="email" placeholder="Email" required aria-label="Email" className={field} />
      <input name="password" type="password" minLength={8} placeholder="Temporary password" required aria-label="Password" className={field} />
      <input name="specialty" placeholder="Specialty (e.g. Neurology)" required aria-label="Specialty" className={field} />
      <input name="fee" type="number" min={0} placeholder="Fee (Rs)" required aria-label="Fee" className={field} />
      <input name="bio" placeholder="Short bio (optional)" aria-label="Bio" className={field} />
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save doctor
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}