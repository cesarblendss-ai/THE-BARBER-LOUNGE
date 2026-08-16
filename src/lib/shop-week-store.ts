import { promises as fs } from "fs";
import path from "path";

import { isDatabaseConfigured } from "./db";
import { dbLoadShopWeek, dbSaveShopWeek } from "./shop-week-db";
import {
  buildDefaultWeek,
  currentWeekStart,
  getWeekStartSunday,
  isDateStr,
  sanitizeShopWeek,
  type ShopWeek,
  type ShopWeekPersistence,
} from "./shop-week";

const DATA_PATH = path.join(process.cwd(), "data", "shop-week.json");

type ShopWeekFile = {
  weeks: Record<string, ShopWeek>;
};

export type ShopWeekLoadResult = {
  week: ShopWeek;
  persistence: ShopWeekPersistence;
  saved: boolean;
};

async function readJsonFile(): Promise<ShopWeekFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as ShopWeekFile;
    const weeks =
      parsed && typeof parsed === "object" && parsed.weeks && typeof parsed.weeks === "object"
        ? parsed.weeks
        : {};
    return { weeks };
  } catch {
    return { weeks: {} };
  }
}

async function writeJsonFile(data: ShopWeekFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  const tempPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, DATA_PATH);
}

function resolveWeekStart(weekStart?: string): string {
  if (weekStart && isDateStr(weekStart)) return getWeekStartSunday(weekStart);
  return currentWeekStart();
}

export function getShopWeekPersistence(): ShopWeekPersistence {
  return isDatabaseConfigured() ? "postgres" : "json";
}

export async function loadShopWeek(weekStart?: string): Promise<ShopWeekLoadResult> {
  const start = resolveWeekStart(weekStart);
  const defaults = buildDefaultWeek(start);
  const persistence = getShopWeekPersistence();

  if (isDatabaseConfigured()) {
    try {
      const fromDb = await dbLoadShopWeek(start);
      if (fromDb) {
        return { week: fromDb, persistence, saved: Boolean(fromDb.updatedAt) };
      }

      const file = await readJsonFile();
      const fromFile = file.weeks[start];
      if (fromFile) {
        const migrated = sanitizeShopWeek(fromFile, start);
        try {
          const saved = await dbSaveShopWeek(migrated);
          return { week: saved, persistence, saved: true };
        } catch (error) {
          console.error("[shop-week] migrate JSON → Postgres failed", error);
          return { week: { ...migrated, updatedAt: migrated.updatedAt }, persistence, saved: true };
        }
      }

      return { week: defaults, persistence, saved: false };
    } catch (error) {
      console.error("[shop-week] db read failed, falling back to JSON", error);
    }
  }

  const file = await readJsonFile();
  const stored = file.weeks[start];
  if (!stored) {
    return { week: defaults, persistence: "json", saved: false };
  }

  const week = sanitizeShopWeek(stored, start);
  return { week, persistence: "json", saved: Boolean(week.updatedAt) };
}

export async function saveShopWeek(input: unknown, weekStart?: string): Promise<ShopWeekLoadResult> {
  const start = resolveWeekStart(weekStart);
  const week = sanitizeShopWeek(input, start);
  const persistence = getShopWeekPersistence();

  if (isDatabaseConfigured()) {
    const saved = await dbSaveShopWeek(week);
    return { week: saved, persistence, saved: true };
  }

  try {
    const file = await readJsonFile();
    const withStamp: ShopWeek = {
      ...week,
      updatedAt: new Date().toISOString(),
    };
    file.weeks[week.weekStart] = withStamp;
    await writeJsonFile(file);
    return { week: withStamp, persistence: "json", saved: true };
  } catch (error) {
    console.error("[shop-week] JSON write failed", error);
    throw new Error(
      "Shop calendar cannot be saved on this host. Set DATABASE_URL or TBLDB_* (Postgres) on Vercel Production, then redeploy.",
    );
  }
}

export const SHOP_WEEK_FILE = DATA_PATH;
