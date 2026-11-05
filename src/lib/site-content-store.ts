import fs from "fs";
import path from "path";

import { BOOKING_URL, SITE_BOOK_PATH } from "./content";
import { isDatabaseConfigured } from "./db";
import { dbLoadSiteContent, dbSaveSiteContent } from "./site-content-db";
import { getDefaultSiteContent } from "./site-content-defaults";
import type { SiteContent } from "./site-content-types";

/** Legacy CMS/Booksy deep links → same-site `/book` (primary Tim funnel). */
function rewriteBooksyBookingHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;
  if (trimmed === BOOKING_URL) return SITE_BOOK_PATH;
  if (trimmed.startsWith("https://booksy.com/en-us/1180862_the-barber-lounge")) {
    return SITE_BOOK_PATH;
  }
  return trimmed;
}

function preferSiteBookPath(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => preferSiteBookPath(item));
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) {
      if (key === "href" && typeof child === "string") {
        next[key] = rewriteBooksyBookingHref(child);
      } else {
        next[key] = preferSiteBookPath(child);
      }
    }
    return next;
  }
  return value;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const result = { ...base };

  for (const key of Object.keys(patch) as Array<keyof T>) {
    const patchValue = patch[key];
    const baseValue = base[key];

    if (Array.isArray(patchValue)) {
      result[key] = patchValue as T[keyof T];
      continue;
    }

    if (
      patchValue &&
      typeof patchValue === "object" &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        patchValue as Record<string, unknown>,
      ) as T[keyof T];
      continue;
    }

    if (patchValue !== undefined) {
      result[key] = patchValue as T[keyof T];
    }
  }

  return result;
}

export function readSiteContentFile(): SiteContent | null {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return null;
    const raw = fs.readFileSync(CONTENT_FILE, "utf-8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
}

export function writeSiteContentFile(content: SiteContent): void {
  ensureDataDir();
  fs.writeFileSync(CONTENT_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf-8");
}

/** Load merged content; bootstraps Postgres or local JSON from defaults on first run. */
export async function loadSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContent();
  let content: SiteContent = defaults;

  if (isDatabaseConfigured()) {
    try {
      const fromDb = await dbLoadSiteContent();
      if (fromDb) {
        content = deepMerge(defaults, fromDb);
      } else {
        const fromFile = readSiteContentFile();
        content = fromFile ? deepMerge(defaults, fromFile) : defaults;
        await dbSaveSiteContent(content);
      }
      return preferSiteBookPath(content) as SiteContent;
    } catch (error) {
      console.error("[site-content] db read failed, falling back to JSON", error);
    }
  }

  const stored = readSiteContentFile();
  if (!stored) {
    try {
      writeSiteContentFile(defaults);
    } catch {
      // Read-only filesystem (e.g. Vercel without Postgres) — serve defaults only.
    }
    return preferSiteBookPath(defaults) as SiteContent;
  }

  return preferSiteBookPath(deepMerge(defaults, stored)) as SiteContent;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (isDatabaseConfigured()) {
    await dbSaveSiteContent(content);
    return;
  }

  try {
    writeSiteContentFile(content);
  } catch {
    throw new Error(
      "Site content cannot be saved on this host. Configure DATABASE_URL (Postgres) for production persistence.",
    );
  }
}

export const SITE_CONTENT_FILE = CONTENT_FILE;
