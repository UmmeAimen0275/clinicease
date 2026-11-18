"use client"; // uses state, so it runs in the browser

import { useState } from "react";
import Link from "next/link";
import { Search, Stethoscope } from "lucide-react";
import { initials } from "@/lib/format";

type Doc = { id: string; name: string; specialty: string; bio: string | null; fee: number };

// Each doctor gets a different gradient for their avatar
const gradients = [
  "from-teal-500 to-emerald-500",
  "from-sky-500 to-indigo-500",
  "from-rose-500 to-orange-400",
  "from-violet-500 to-fuchsia-500",
];

export function DoctorSearch({ doctors }: { doctors: Doc[] }) {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");

  const specialties = ["All", ...Array.from(new Set(doctors.map((d) => d.specialty)))];

  // Filter as the user types (no page reload)
  const shown = doctors.filter(
    (d) =>
      (spec === "All" || d.specialty === spec) &&
      `${d.name} ${d.specialty}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by doctor or specialty..."
          aria-label="Search doctors"
          className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Specialty chips */}
      <div className="flex flex-wrap gap-2">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              spec === s
                ? "border-teal-600 bg-teal-600 text-white"
                : "bg-background hover:border-teal-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {shown.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <Stethoscope className="mx-auto mb-2 h-8 w-8" />
          No doctors match your search.
        </div>
      )}

      {/* Doctor cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((d, i) => (
          <div
            key={d.id}
            className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`mb-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br text-lg font-bold text-white ${
                gradients[i % gradients.length]
              }`}
            >
              {initials(d.name)}
            </div>
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{d.specialty}</p>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{d.bio}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm">
                <span className="font-semibold">Rs {d.fee.toLocaleString()}</span>
                <span className="text-muted-foreground"> / visit</span>
              </span>
              <Link
                href={`/patient/doctors/${d.id}`}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}