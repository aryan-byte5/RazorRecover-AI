import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is present in the environment
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if (!hasDatabaseUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️ Warning: DATABASE_URL environment variable is not set. RazorRecover AI will run in resilient Demo Mode. To connect persistent cloud storage, add DATABASE_URL in your Vercel Project Settings."
  );
}

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
