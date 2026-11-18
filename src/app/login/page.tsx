"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, signIn, signOut } from "next-auth/react";
import { HeartPulse, Loader2, UserRound, Stethoscope, ShieldCheck, Wand2 } from "lucide-react";

const roles = {
  PATIENT: { label: "Patient", icon: UserRound, demo: "ali@example.com", hint: "Book and manage your appointments." },
  DOCTOR: { label: "Doctor", icon: Stethoscope, demo: "ayesha@clinicease.com", hint: "Doctor accounts are created by the clinic admin." },
  ADMIN: { label: "Admin", icon: ShieldCheck, demo: "admin@clinicease.com", hint: "Staff only. Manage the clinic." },
} as const;

type RoleKey = keyof typeof roles;

const field =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleKey>("PATIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Wrong email or password");
      setLoading(false);
      return;
    }

    // Did they pick the right door?
    const session = await getSession();
    if (session?.user.role !== role) {
      await signOut({ redirect: false });
      setError(`This is not a ${roles[role].label} account. Choose the right tab above.`);
      setLoading(false);
      return;
    }

    router.push("/dashboard"); // sends each role to its own area
    router.refresh();
  }

  const R = roles[role];

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-background p-4">
      <div className="w-full max-w-md space-y-5 rounded-3xl border bg-card p-6 shadow-lg">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white">
            <HeartPulse className="h-4 w-4" />
          </span>
          ClinicEase
        </Link>

        {/* Three doors */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1" role="tablist">
          {(Object.keys(roles) as RoleKey[]).map((k) => {
            const Icon = roles[k].icon;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={role === k}
                onClick={() => { setRole(k); setError(""); }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
                  role === k ? "bg-teal-600 text-white shadow" : "hover:bg-background"
                }`}
              >
                <Icon className="h-4 w-4" /> {roles[k].label}
              </button>
            );
          })}
        </div>

        <div>
          <h1 className="text-xl font-bold">{R.label} login</h1>
          <p className="text-sm text-muted-foreground">{R.hint}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30">{error}</p>}

          <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : `Log in as ${R.label}`}
          </button>
        </form>

        {/* One-click demo for judges */}
        <button
          type="button"
          onClick={() => { setEmail(R.demo); setPassword("Password123!"); setError(""); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm text-teal-700 transition hover:bg-teal-50"
        >
          <Wand2 className="h-4 w-4" /> Fill demo {R.label.toLowerCase()} account
        </button>

        {role === "PATIENT" && (
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link href="/register" className="underline">Create a patient account</Link>
          </p>
        )}
      </div>
    </main>
  );
}