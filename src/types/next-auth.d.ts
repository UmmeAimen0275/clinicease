import type { DefaultSession } from "next-auth";

type Role = "PATIENT" | "DOCTOR" | "ADMIN";

// WHY: TypeScript does not know our users have a "role".
// This file teaches it, so we don't get red errors.
declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
