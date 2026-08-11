const fs = require("fs");
const path = require("path");

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

const prod = parseEnv(fs.readFileSync(path.join(__dirname, "..", ".env.production.local"), "utf8"));
for (const [k, v] of Object.entries(prod)) {
  if (/URL|DATABASE/i.test(k)) {
    const proto = v.match(/^([^:]+):/)?.[1] ?? "(empty)";
    console.log(k, "->", proto, "len=" + v.length);
  }
}
