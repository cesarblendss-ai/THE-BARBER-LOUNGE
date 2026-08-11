import { readFileSync } from "fs";

const content = readFileSync(".env.local", "utf8");
for (const key of [
  "TBLDB_PGHOST",
  "TBLDB_PGUSER",
  "TBLDB_PGPASSWORD",
  "TBLDB_PGDATABASE",
  "TBLDB_POSTGRES_PRISMA_URL",
]) {
  const quoted = content.match(new RegExp(`^${key}="([^"]*)"`, "m"))?.[1];
  const status =
    quoted === undefined
      ? "missing"
      : quoted === "[SENSITIVE]"
        ? "REDACTED"
        : `real len=${quoted.length}`;
  console.log(`${key}: ${status}`);
}
