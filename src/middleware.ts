import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// The security guard: runs before every page and applies
// the "authorized" rules from auth.config.ts
export default NextAuth(authConfig).auth;

// Skip API routes, static files and images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
