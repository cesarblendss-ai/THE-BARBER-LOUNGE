import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function normalizePostgresUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("prisma+postgres")) {
    return trimmed.replace(/^prisma\+/, "");
  }
  if (trimmed.startsWith("postgres")) return trimmed;
  return undefined;
}

/** Resolve Neon/Vercel Postgres URL from common env var names. */
export function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.TBLDB_POSTGRES_PRISMA_URL,
    process.env.TBLDB_DATABASE_URL,
    process.env.TBLDB_POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ];

  for (const candidate of candidates) {
    const url = normalizePostgresUrl(candidate);
    if (url) return url;
  }

  return undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseUrl());
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient | null {
  const url = resolveDatabaseUrl();
  if (!url) return null;

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
