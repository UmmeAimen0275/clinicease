import { redirect } from "next/navigation";
import { auth } from "@/auth";

// WHY: after login, everyone goes to /dashboard.
// This page checks the role and sends them to their own area.
export default async function Dashboard() {
  const session = await auth(); // who is logged in?
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");
  if (role === "DOCTOR") redirect("/doctor");
  redirect("/patient");
}
