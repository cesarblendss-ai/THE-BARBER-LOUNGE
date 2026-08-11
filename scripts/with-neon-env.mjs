/**
 * Load DATABASE_URL from Vercel Neon vars (TBLDB_* prefix) and run a command.
 * Usage: node scripts/with-neon-env.mjs <command...>
 */
import { readFileSync } from "fs";
import { spawnSync } from "child_process";

const envFile = process.env.NEON_ENV_FILE ?? ".env.production.local";
const content = readFileSync(envFile, "utf8");

function readEnvValue(name) {
  const quoted = content.match(new RegExp(`^${name}="([^"]*)"`, "m"))?.[1];
  if (quoted?.length) return quoted;
  const unquoted = content.match(new RegExp(`^${name}=([^\\s#]+)`, "m"))?.[1];
  return unquoted ?? "";
}

const candidates = [
  readEnvValue("DATABASE_URL"),
  readEnvValue("TBLDB_POSTGRES_PRISMA_URL"),
  readEnvValue("TBLDB_DATABASE_URL"),
  readEnvValue("TBLDB_POSTGRES_URL"),
];
function normalizePostgresUrl(value) {
  if (!value) return null;
  if (value.startsWith("postgres")) return value;
  if (value.startsWith("prisma+postgres")) return value.replace(/^prisma\+/, "");
  return null;
}

const fromProcess = [
  process.env.DATABASE_URL,
  process.env.TBLDB_POSTGRES_PRISMA_URL,
  process.env.TBLDB_DATABASE_URL,
  process.env.TBLDB_POSTGRES_URL,
]
  .map(normalizePostgresUrl)
  .find(Boolean);

const url =
  fromProcess ??
  candidates.map(normalizePostgresUrl).find(Boolean);

if (!url) {
  const keys = [
    "DATABASE_URL",
    "TBLDB_POSTGRES_PRISMA_URL",
    "TBLDB_DATABASE_URL",
    "TBLDB_POSTGRES_URL",
  ];
  const found = keys.map((k) => {
    const fromEnv = process.env[k];
    const fromFile = readEnvValue(k);
    const present = Boolean(fromEnv?.length || fromFile.length);
    const prefix = normalizePostgresUrl(fromEnv ?? fromFile)?.split(":")[0] ?? "invalid";
    return `${k}=${present ? prefix : "missing"}`;
  });
  console.error(
    `Could not load Neon DATABASE_URL from ${envFile}. Keys: ${found.join(", ")}`
  );
  process.exit(1);
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage: node scripts/with-neon-env.mjs <command...>");
  process.exit(1);
}

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
  shell: true,
});

process.exit(result.status ?? 1);
