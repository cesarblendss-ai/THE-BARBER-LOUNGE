import path from "path";

/**
 * Repo root of THE-BARBER-LOUNGE.
 * Cesar’s Hub (`cesars-hub/`) sets HUB_REPO_ROOT=.. so calendar, retail, and
 * gallery still read the shop JSON and public files.
 */
export function getRepoRoot(): string {
  const fromEnv = process.env.HUB_REPO_ROOT?.trim();
  if (fromEnv) return path.resolve(process.cwd(), fromEnv);
  return process.cwd();
}

export function getDataDir(): string {
  return path.join(getRepoRoot(), "data");
}

export function getPublicDir(): string {
  return path.join(getRepoRoot(), "public");
}
