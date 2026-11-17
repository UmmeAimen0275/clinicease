import { PrismaClient } from "@prisma/client";

// In development, Next.js reloads often. Without this trick, every reload
// would open a NEW database connection and you would run out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reuse the existing connection, or create a new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Remember the connection (development only)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
