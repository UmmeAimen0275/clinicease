"use client"; // WHY: this page uses state and click handlers, so it runs in the browser

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(""); // error message to show
  const [loading, setLoading] = useState(false); // disables the button while working

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser's default page reload
    setLoading(true);
    setError("");

    // Read the values typed in the form
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name")),
      email: String(f.get("email")),
      password: String(f.get("password")),
    };

    // 1. Create the account (runs on the server)
    const res = await registerUser(data);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    // 2. Log in automatically
    await signIn("credentials", { ...data, redirect: false });

    // 3. Go to the dashboard, which sends each role to its own page
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
