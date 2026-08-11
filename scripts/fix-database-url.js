const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const prodPath = path.join(root, ".env.production.local");
const localPath = path.join(root, ".env.local");

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function protocol(val) {
  if (!val) return "(empty)";
  const m = val.match(/^(\w+):/);
  return m ? m[1] : "(invalid)";
}

const prod = fs.existsSync(prodPath) ? parseEnv(fs.readFileSync(prodPath, "utf8")) : {};
const local = fs.existsSync(localPath) ? parseEnv(fs.readFileSync(localPath, "utf8")) : {};

const candidates = [
  "TBLDB_POSTGRES_PRISMA_URL",
  "TBLDB_DATABASE_URL",
  "TBLDB_POSTGRES_URL",
  "DATABASE_URL",
];

console.log("Current DATABASE_URL in .env.local:", protocol(local.DATABASE_URL), "len=" + (local.DATABASE_URL?.length ?? 0));

let source = null;
for (const key of candidates) {
  const val = prod[key] || local[key];
  if (val && (val.startsWith("postgresql://") || val.startsWith("postgres://"))) {
    source = { key, val };
    console.log("Found valid Postgres URL:", key, "protocol=" + protocol(val));
    break;
  }
}

if (!source) {
  console.error("No valid Postgres URL found in .env.production.local");
  process.exit(1);
}

if (local.DATABASE_URL === source.val) {
  console.log("DATABASE_URL already correct in .env.local");
  process.exit(0);
}

let content = fs.existsSync(localPath) ? fs.readFileSync(localPath, "utf8") : "";
const newLine = `DATABASE_URL="${source.val.replace(/"/g, '\\"')}"`;

if (/^DATABASE_URL=/m.test(content)) {
  content = content.replace(/^DATABASE_URL=.*$/m, newLine);
} else {
  content = content.trimEnd() + (content.endsWith("\n") ? "" : "\n") + newLine + "\n";
}

fs.writeFileSync(localPath, content);
console.log("Updated .env.local DATABASE_URL from", source.key);
