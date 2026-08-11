import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

import {
  dbInsertSale,
  dbLoadRetailStore,
  dbMarkSalePaid,
  dbUpsertProduct,
} from "@/lib/retail-db";
import { isDatabaseConfigured } from "@/lib/db";

export type Product = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductSale = {
  id: string;
  productId: string;
  barberName: string;
  quantity: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
};

type RetailFile = {
  products: Product[];
  sales: ProductSale[];
};

const DATA_PATH = path.join(process.cwd(), "data", "products.json");

async function readStore(): Promise<RetailFile> {
  const fromDb = await dbLoadRetailStore();
  if (fromDb) return fromDb;

  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as RetailFile;
    return {
      products: parsed.products ?? [],
      sales: parsed.sales ?? [],
    };
  } catch {
    return { products: [], sales: [] };
  }
}

async function writeStore(data: RetailFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  const tempPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, DATA_PATH);
}

export async function listProducts(activeOnly = false): Promise<Product[]> {
  const store = await readStore();
  const products = store.products.sort((a, b) => a.name.localeCompare(b.name));
  return activeOnly ? products.filter((p) => p.active && p.stock > 0) : products;
}

export async function listSales(): Promise<ProductSale[]> {
  const store = await readStore();
  return store.sales.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type UpsertProductInput = {
  id?: string;
  name: string;
  priceCents: number;
  stock: number;
  active?: boolean;
};

export async function upsertProduct(input: UpsertProductInput): Promise<Product> {
  const store = await readStore();
  const existing = input.id ? store.products.find((p) => p.id === input.id) : undefined;
  const now = new Date().toISOString();
  const product: Product = {
    id: input.id ?? randomBytes(8).toString("hex"),
    name: input.name.trim(),
    priceCents: Math.max(0, Math.round(input.priceCents)),
    stock: Math.max(0, Math.round(input.stock)),
    active: input.active ?? true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (isDatabaseConfigured()) {
    await dbUpsertProduct(product);
    return product;
  }

  const index = store.products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    store.products[index] = product;
  } else {
    store.products.push(product);
  }
  await writeStore(store);
  return product;
}

export type CreateSaleInput = {
  productId: string;
  barberName: string;
  quantity?: number;
};

export async function createProductSale(
  input: CreateSaleInput,
): Promise<{ ok: true; sale: ProductSale } | { ok: false; reason: string }> {
  const quantity = Math.max(1, Math.round(input.quantity ?? 1));
  const store = await readStore();
  const product = store.products.find((p) => p.id === input.productId);

  if (!product || !product.active) {
    return { ok: false, reason: "product_not_found" };
  }
  if (product.stock < quantity) {
    return { ok: false, reason: "insufficient_stock" };
  }

  const now = new Date().toISOString();
  const sale: ProductSale = {
    id: randomBytes(8).toString("hex"),
    productId: product.id,
    barberName: input.barberName.trim(),
    quantity,
    paid: false,
    createdAt: now,
    updatedAt: now,
  };

  if (isDatabaseConfigured()) {
    await dbInsertSale(sale);
    return { ok: true, sale };
  }

  product.stock -= quantity;
  store.sales.push(sale);
  await writeStore(store);
  return { ok: true, sale };
}

export async function markSalePaid(id: string): Promise<ProductSale | null> {
  const updatedAt = new Date().toISOString();
  if (isDatabaseConfigured()) {
    return dbMarkSalePaid(id, updatedAt);
  }

  const store = await readStore();
  const sale = store.sales.find((s) => s.id === id);
  if (!sale) return null;
  sale.paid = true;
  sale.updatedAt = updatedAt;
  await writeStore(store);
  return sale;
}

export type RetailSummary = {
  unpaidTotalCents: number;
  unpaidByBarber: Record<string, number>;
  unpaidCount: number;
};

export async function getRetailSummary(): Promise<RetailSummary> {
  const [products, sales] = await Promise.all([listProducts(), listSales()]);
  const priceById = new Map(products.map((p) => [p.id, p.priceCents]));

  let unpaidTotalCents = 0;
  let unpaidCount = 0;
  const unpaidByBarber: Record<string, number> = {};

  for (const sale of sales) {
    if (sale.paid) continue;
    const lineTotal = (priceById.get(sale.productId) ?? 0) * sale.quantity;
    unpaidTotalCents += lineTotal;
    unpaidCount += 1;
    unpaidByBarber[sale.barberName] = (unpaidByBarber[sale.barberName] ?? 0) + lineTotal;
  }

  return { unpaidTotalCents, unpaidByBarber, unpaidCount };
}
