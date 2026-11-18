import type { NextAuthConfig } from "next-auth";

// WHY a separate file: the middleware (our security guard) runs in a limited
// environment that cannot use Prisma or bcrypt. So the RULES live here,
// and the database login check lives in auth.ts.
export const authConfig = {
  // If a visitor is not logged in, send them to /login
  pages: { signIn: "/login" },

  // Keep the session inside a signed cookie (signed with AUTH_SECRET)
  session: { strategy: "jwt" },

  // The login method is added in auth.ts
  providers: [],

  callbacks: {
    // Runs at login: copy id and role into the cookie token
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },

    // Copy id and role from the token into the session,
    // so our pages can read session.user.role
    // Copy id and role from the token into the session,
    // so our pages can read session.user.role
    session({ session, token }) {
      // "as" tells TypeScript: trust me, this is the right type
      session.user.id = token.id as string;
      session.user.role = token.role as "PATIENT" | "DOCTOR" | "ADMIN";
      return session;
    },

    // Runs on EVERY page request: who may open which URL?
   authorized({ auth, request: { nextUrl } }) {
  const role = auth?.user?.role;
  const path = nextUrl.pathname;

  // Already logged in? Skip the login and register pages
  if ((path === "/login" || path === "/register") && auth?.user)
    return Response.redirect(new URL("/dashboard", nextUrl));

  if (path.startsWith("/admin")) return role === "ADMIN";
  if (path.startsWith("/doctor")) return role === "DOCTOR";
  if (path.startsWith("/patient")) return role === "PATIENT";
  if (path.startsWith("/dashboard")) return !!auth?.user;

  return true; // every other page is public
},
  },
} satisfies NextAuthConfig;
