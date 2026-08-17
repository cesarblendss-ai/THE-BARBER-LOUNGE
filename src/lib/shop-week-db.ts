/**
 * Postgres persistence for the Staff Hub week calendar.
 * Used when DATABASE_URL or Neon TBLDB_* vars are set.
 */
import type { Prisma } from "@prisma/client";

import { getPrisma } from "./db";
import { sanitizeShopWeek, type ShopWeek } from "./shop-week";

export async function dbLoadShopWeek(weekStart: string): Promise<ShopWeek | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const row = await prisma.shopWeek.findUnique({ where: { id: weekStart } });
  if (!row) return null;

  return sanitizeShopWeek(
    {
      weekStart: row.id,
      days: row.days,
      updatedAt: row.updatedAt.toISOString(),
    },
    weekStart,
  );
}

export async function dbSaveShopWeek(week: ShopWeek): Promise<ShopWeek> {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("Database configured but Prisma client unavailable");
  }

  const row = await prisma.shopWeek.upsert({
    where: { id: week.weekStart },
    create: {
      id: week.weekStart,
      days: week.days as unknown as Prisma.InputJsonValue,
    },
    update: {
      days: week.days as unknown as Prisma.InputJsonValue,
    },
  });

  return sanitizeShopWeek(
    {
      weekStart: row.id,
      days: row.days,
      updatedAt: row.updatedAt.toISOString(),
    },
    week.weekStart,
  );
}
