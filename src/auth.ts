import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { withRetry } from "@/lib/retry";
import { isBlocked, recordFailure, clearFailures } from "@/lib/rate-limit";

// These 4 things are used all over the app:
//   handlers -> the login/logout URLs
//   auth     -> "who is logged in?" (on the server)
//   signIn / signOut -> log in / log out
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Credentials = email + password login
    Credentials({
      async authorize(credentials) {
        // 1. Check the input looks right (never trust the browser)
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();

        // 2. Too many wrong tries? Refuse without checking the database
        if (isBlocked(email)) return null;

        // 3. Find the user in Neon (retries if the database is waking up)
        const user = await withRetry(() =>
          prisma.user.findUnique({ where: { email } })
        );

        // 4. Compare the typed password with the stored hash
        const ok = user
          ? await bcrypt.compare(parsed.data.password, user.passwordHash)
          : false;

        if (!user || !ok) {
          recordFailure(email); // count the failed attempt
          return null;
        }

        // 5. Success: clear the counter. These values go into the session.
        clearFailures(email);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});