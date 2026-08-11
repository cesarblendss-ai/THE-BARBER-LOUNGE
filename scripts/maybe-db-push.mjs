/**
 * Run prisma db push when Neon/Postgres env is available (Vercel build).
 * No-op locally when DATABASE_URL / TBLDB_* are unset.
 */
import { spawnSync } from "child_process";

function normalizePostgresUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "[SENSITIVE]") return null;
  if (trimmed.startsWith("prisma+postgres")) return trimmed.replace(/^prisma\+/, "");
  if (trimmed.startsWith("postgres")) return trimmed;
  return null;
}

const url = [
  process.env.DATABASE_URL,
  process.env.TBLDB_POSTGRES_PRISMA_URL,
  process.env.TBLDB_DATABASE_URL,
  process.env.TBLDB_POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
]
  .map(normalizePostgresUrl)
  .find(Boolean);

if (!url) {
  console.log("[build] No Postgres URL — skipping prisma db push");
  process.exit(0);
}

console.log("[build] Pushing Prisma schema to Postgres…");
const result = spawnSync("npx", ["prisma", "db", "push", "--accept-data-loss"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
  shell: true,
});

process.exit(result.status ?? 1);
