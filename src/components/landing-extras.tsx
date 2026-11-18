"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, UserRound, Stethoscope, ShieldCheck } from "lucide-react";

const flows = {
  Patient: [
    "Create a free account in seconds",
    "Search doctors by name or specialty",
    "Pick a day and a time slot",
    "Get a queue token when you check in",
  ],
  Doctor: [
    "See today's patient queue",
    "Check patients in as they arrive",
    "Write visit notes and complete the visit",
    "Patients see notes in their history",
  ],
  Admin: [
    "Manage doctors and patients",
    "Check in walk-in patients",
    "Watch the live waiting-room board",
    "Track appointments and no-shows",
  ],
} as const;

export function HowItWorks() {
  const [tab, setTab] = useState<keyof typeof flows>("Patient");
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-center gap-2">
        {(Object.keys(flows) as (keyof typeof flows)[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              tab === k ? "border-teal-600 bg-teal-600 text-white shadow" : "bg-background hover:border-teal-400"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <ol key={tab} className="grid gap-3 sm:grid-cols-2">
        {flows[tab].map((s, i) => (
          <li
            key={s}
            style={{ animationDelay: `${i * 80}ms` }}
            className="flex animate-[fade-up_0.5s_ease-out_both] items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-1 text-sm">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const accounts = [
  { role: "Patient", email: "ali@example.com", icon: UserRound },
  { role: "Doctor", email: "ayesha@clinicease.com", icon: Stethoscope },
  { role: "Admin", email: "admin@clinicease.com", icon: ShieldCheck },
];

export function DemoAccounts() {
  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied: " + text);
  }
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-6 shadow-lg">
      <h3 className="text-center text-xl font-bold">Try the demo</h3>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Password for all accounts:{" "}
        <button onClick={() => copy("Password123!")} className="font-mono font-semibold text-teal-700 underline">
          Password123!
        </button>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {accounts.map((a) => (
          <button
            key={a.role}
            onClick={() => copy(a.email)}
            className="group rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-md"
          >
            <a.icon className="mb-2 h-5 w-5 text-teal-600" />
            <div className="font-semibold">{a.role}</div>
            <div className="flex items-center gap-1 break-all text-xs text-muted-foreground">
              {a.email} <Copy className="h-3 w-3 shrink-0 opacity-0 transition group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5 text-center">
        <Link href="/login" className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
          Go to login
        </Link>
      </div>
    </div>
  );
}