"use server"; // WHY: this code runs ONLY on the server, never in the browser

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// The rules for a valid signup
const schema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(input: unknown) {
  // Validate again on the server (the browser can be tricked)
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase();

  // Is this email already used?
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "This email is already registered" };

  // Hash the password. We NEVER store the real one.
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // SECURITY: the role is fixed to PATIENT here.
  // It is NOT taken from the form, so nobody can sign up as ADMIN.
  await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash, role: "PATIENT" },
  });

  return { ok: true };
}
