import Link from "next/link";
import { signOut } from "@/auth";
import { HeartPulse, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-background dark:from-teal-950/20">
      {/* Sticky top bar with a blur effect */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/patient" className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white">
              <HeartPulse className="h-4 w-4" />
            </span>
            ClinicEase
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/patient" className="rounded-md px-3 py-2 hover:bg-muted">
              My appointments
            </Link>
            <Link href="/patient/doctors" className="rounded-md px-3 py-2 hover:bg-muted">
              Find doctors
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Log out</span>
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}