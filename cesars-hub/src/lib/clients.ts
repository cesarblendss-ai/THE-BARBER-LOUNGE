import { promises as fs } from "fs";
import path from "path";

import { getRepoRoot } from "@/lib/repo-paths";

export type SeoClient = {
  slug: string;
  file: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  package?: string;
  website?: string;
  phone?: string;
  notes?: string;
};

const FILE_TO_SLUG: Record<string, string> = {
  "the_barber_lounge.json": "barber-lounge",
  "yes_we_can_solutions.json": "yes-we-can",
};

export function slugToFile(slug: string): string | null {
  const hit = Object.entries(FILE_TO_SLUG).find(([, value]) => value === slug);
  return hit ? hit[0] : null;
}

function clientsDir(): string {
  return path.join(getRepoRoot(), "tools", "seo-agent", "clients");
}

function outputDir(): string {
  return path.join(getRepoRoot(), "tools", "seo-agent", "output");
}

export async function listSeoClients(): Promise<SeoClient[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(clientsDir())).filter(
      (name) => name.endsWith(".json") && !name.startsWith("_"),
    );
  } catch {
    return [];
  }

  const clients: SeoClient[] = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(clientsDir(), file), "utf8");
      const parsed = JSON.parse(raw) as Partial<SeoClient> & { name?: string };
      clients.push({
        slug: FILE_TO_SLUG[file] ?? file.replace(/\.json$/, "").replace(/_/g, "-"),
        file,
        name: parsed.name ?? file,
        niche: parsed.niche ?? "",
        city: parsed.city ?? "",
        state: parsed.state ?? "",
        package: parsed.package,
        website: parsed.website,
        phone: parsed.phone,
        notes: parsed.notes,
      });
    } catch {
      continue;
    }
  }

  return clients.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSeoClient(slug: string | null | undefined): Promise<SeoClient | null> {
  const clients = await listSeoClients();
  if (!slug) return clients[0] ?? null;
  return clients.find((client) => client.slug === slug) ?? clients[0] ?? null;
}

export async function listClientSeoRuns(slug: string): Promise<string[]> {
  const file = slugToFile(slug);
  const prefix = (file ?? slug).replace(/\.json$/, "");
  let entries: string[] = [];
  try {
    entries = await fs.readdir(outputDir());
  } catch {
    return [];
  }
  return entries
    .filter((name) => name.startsWith(prefix) || name.startsWith(slug.replace(/-/g, "_")))
    .sort()
    .reverse();
}

export function hubQuery(biz: string | null, production: string | null): string {
  const params = new URLSearchParams();
  if (biz) params.set("biz", biz);
  if (production) params.set("production", production);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
