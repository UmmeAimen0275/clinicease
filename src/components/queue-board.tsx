"use client";
import { useEffect, useState } from "react";

type Row = { id: string; name: string; specialty: string; serving: number | null; waiting: number[] };

export function QueueBoard() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/queue", { cache: "no-store" });
        setRows(await res.json());
      } catch {}
    }
    load();
    const t = setInterval(load, 5000); // refresh every 5 seconds
    return () => clearInterval(t);
  }, []);

  if (!rows) return <p className="text-center text-muted-foreground">Loading...</p>;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-3xl border bg-card p-6 text-center shadow-lg">
          <h2 className="font-semibold">{r.name}</h2>
          <p className="mb-4 text-sm text-teal-700">{r.specialty}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Now serving</p>
          <div
            key={r.serving ?? "none"}
            className="my-2 animate-[fade-up_0.5s_ease-out_both] text-7xl font-extrabold text-teal-600"
          >
            {r.serving ?? "-"}
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Next</p>
          <div className="mt-2 flex min-h-8 flex-wrap justify-center gap-2">
            {r.waiting.length === 0 ? (
              <span className="text-sm text-muted-foreground">No one waiting</span>
            ) : (
              r.waiting.map((t) => (
                <span key={t} className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                  #{t}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}