/**
 * Strip TBLDB_* / DATABASE_URL lines from .env.local so `vercel env run`
 * injects real Neon credentials from the cloud instead of local [SENSITIVE] placeholders.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) process.exit(0);

const lines = readFileSync(envPath, "utf8").split("\n");
const kept = lines.filter((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return true;
  const key = trimmed.split("=")[0]?.trim();
  return !(
    key === "DATABASE_URL" ||
    key?.startsWith("TBLDB_") ||
    key?.startsWith("POSTGRES_")
  );
});

writeFileSync(envPath, kept.join("\n"), "utf8");
console.log("Stripped Neon DB vars from .env.local for vercel env run.");
