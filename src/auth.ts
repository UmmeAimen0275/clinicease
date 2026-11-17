import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

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

        // 2. Find this user in Neon
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;

        // 3. Compare the typed password with the stored hash
        const ok = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!ok) return null;

        // 4. Success. These values go into the session.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
