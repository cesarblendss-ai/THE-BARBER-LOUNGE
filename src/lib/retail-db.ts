/**
 * Postgres persistence for retail products — used when DATABASE_URL is set.
 * Falls back to JSON file via retail-store.ts when not configured.
 */
import type { Product, ProductSale } from "./retail-store";
import { getPrisma } from "./db";

function mapProduct(row: {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    name: row.name,
    priceCents: row.priceCents,
    stock: row.stock,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapSale(row: {
  id: string;
  productId: string;
  barberName: string;
  quantity: number;
  paid: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductSale {
  return {
    id: row.id,
    productId: row.productId,
    barberName: row.barberName,
    quantity: row.quantity,
    paid: row.paid,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function dbLoadRetailStore(): Promise<{
  products: Product[];
  sales: ProductSale[];
} | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const [products, sales] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.productSale.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    products: products.map(mapProduct),
    sales: sales.map(mapSale),
  };
}

export async function dbUpsertProduct(product: Product): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.product.upsert({
    where: { id: product.id },
    create: {
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      stock: product.stock,
      active: product.active,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    },
    update: {
      name: product.name,
      priceCents: product.priceCents,
      stock: product.stock,
      active: product.active,
      updatedAt: new Date(product.updatedAt),
    },
  });
}

export async function dbInsertSale(sale: ProductSale): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  await prisma.$transaction([
    prisma.productSale.create({
      data: {
        id: sale.id,
        productId: sale.productId,
        barberName: sale.barberName,
        quantity: sale.quantity,
        paid: sale.paid,
        createdAt: new Date(sale.createdAt),
        updatedAt: new Date(sale.updatedAt),
      },
    }),
    prisma.product.update({
      where: { id: sale.productId },
      data: { stock: { decrement: sale.quantity } },
    }),
  ]);
}

export async function dbMarkSalePaid(id: string, updatedAt: string): Promise<ProductSale | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const row = await prisma.productSale.update({
      where: { id },
      data: { paid: true, updatedAt: new Date(updatedAt) },
    });
    return mapSale(row);
  } catch {
    return null;
  }
}
