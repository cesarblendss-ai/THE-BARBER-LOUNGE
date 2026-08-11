/**
 * One-time import: data/products.json → Postgres (when DATABASE_URL is set).
 *
 * Usage:
 *   npx vercel env pull .env.local   # optional — get DATABASE_URL
 *   npm run db:push
 *   npm run db:seed-products
 */
import { readFileSync } from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

type JsonProduct = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type JsonStore = {
  products: JsonProduct[];
  sales: unknown[];
};

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL not set. Connect Vercel Postgres first.");
    process.exit(1);
  }

  const dataPath = path.join(process.cwd(), "data", "products.json");
  const raw = readFileSync(dataPath, "utf8");
  const store = JSON.parse(raw) as JsonStore;

  const prisma = new PrismaClient();

  let productCount = 0;
  for (const p of store.products ?? []) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        name: p.name,
        priceCents: p.priceCents,
        stock: p.stock,
        active: p.active,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
      update: {
        name: p.name,
        priceCents: p.priceCents,
        stock: p.stock,
        active: p.active,
        updatedAt: new Date(p.updatedAt),
      },
    });
    productCount++;
  }

  console.log(`Seeded ${productCount} products.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
