import Link from "next/link";
import { auth } from "@/auth";
import { CountUp } from "@/components/count-up";
import { HowItWorks, DemoAccounts } from "@/components/landing-extras";
import { HeartPulse, CalendarCheck2, ShieldCheck, MonitorSmartphone, BellRing, ArrowRight } from "lucide-react";

const features = [
  { icon: CalendarCheck2, title: "Smart booking", text: "Live slots. No double booking, ever." },
  { icon: ShieldCheck, title: "Secure by design", text: "Role-based access and hashed passwords." },
  { icon: BellRing, title: "Live queue", text: "A waiting-room board that updates itself." },
  { icon: MonitorSmartphone, title: "Works everywhere", text: "Phone, tablet or desktop." },
];

export default async function Home() {
  const session = await auth(); // is someone logged in?

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white">
              <HeartPulse className="h-4 w-4" />
            </span>
            ClinicEase
          </span>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/queue" className="hidden rounded-md px-3 py-2 hover:bg-muted sm:block">Live queue</Link>
            {session ? (
              <Link href="/dashboard" className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 hover:bg-muted">Log in</Link>
                <Link href="/register" className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 animate-[float_6s_ease-in-out_infinite] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute -right-20 top-40 h-80 w-80 animate-[float_8s_ease-in-out_infinite] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <span className="animate-[fade-up_0.6s_ease-out_both] rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-teal-700">
            Modern clinic management
          </span>
          <h1 className="mt-6 animate-[fade-up_0.7s_ease-out_0.1s_both] text-4xl font-extrabold tracking-tight sm:text-6xl">
            Healthcare, booked in{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">seconds</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-[fade-up_0.7s_ease-out_0.2s_both] text-lg text-muted-foreground">
            Find a doctor, pick a time and skip the waiting-room chaos. One simple app for patients, doctors and clinics.
          </p>
          <div className="mt-8 flex animate-[fade-up_0.7s_ease-out_0.3s_both] flex-wrap justify-center gap-3">
            <Link href="/register" className="group flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-teal-700">
              Book appointment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/queue" className="rounded-xl border bg-card px-6 py-3 font-medium transition hover:border-teal-400">
              View live queue
            </Link>
          </div>

          {/* Animated stats */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { n: 3, s: "+", l: "Specialties" },
              { n: 100, s: "%", l: "No double bookings" },
              { n: 24, s: "/7", l: "Online booking" },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="text-3xl font-bold text-teal-700"><CountUp to={x.n} suffix={x.s} /></div>
                <div className="text-xs text-muted-foreground">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Everything a clinic needs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-700">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-50/60 px-4 py-16 dark:bg-teal-950/10">
        <h2 className="mb-8 text-center text-3xl font-bold">How it works</h2>
        <HowItWorks />
      </section>

      <section className="px-4 py-16">
        <DemoAccounts />
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ClinicEase
      </footer>
    </div>
  );
}