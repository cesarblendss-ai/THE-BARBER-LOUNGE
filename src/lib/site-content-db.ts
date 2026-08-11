/**
 * Postgres persistence for site content — used when DATABASE_URL (or Neon TBLDB_* vars) is set.
 * Falls back to JSON file via site-content-store.ts when not configured.
 */
import type { Prisma } from "@prisma/client";

import { getPrisma } from "./db";
import type { SiteContent } from "./site-content-types";

const SITE_CONTENT_ID = "default";

export async function dbLoadSiteContent(): Promise<SiteContent | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const row = await prisma.siteContent.findUnique({ where: { id: SITE_CONTENT_ID } });
  if (!row) return null;

  return row.content as SiteContent;
}

export async function dbSaveSiteContent(content: SiteContent): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  const payload = content as Prisma.InputJsonValue;

  await prisma.siteContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: { id: SITE_CONTENT_ID, content: payload },
    update: { content: payload },
  });
}
