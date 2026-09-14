/**
 * Postgres persistence for estimates — used when DATABASE_URL is set.
 * Falls back to JSON file via estimates.ts when not configured.
 */
import { Prisma } from "@prisma/client";

import type { Estimate, EstimateLineItem, EstimateStatus } from "./estimates-types";
import { getPrisma } from "./db";

type EstimateRow = {
  id: string;
  token: string;
  clientName: string;
  lineItems: unknown;
  amountCents: number;
  depositAmountCents: number;
  notes: string;
  status: string;
  openedAt: Date | null;
  signedAt: Date | null;
  signedName: string | null;
  paidAt: Date | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function parseLineItems(value: unknown): EstimateLineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { description?: unknown; amountCents?: unknown };
      if (typeof record.description !== "string" || typeof record.amountCents !== "number") {
        return null;
      }
      return { description: record.description, amountCents: record.amountCents };
    })
    .filter((item): item is EstimateLineItem => item !== null);
}

function mapEstimate(row: EstimateRow): Estimate {
  return {
    id: row.id,
    token: row.token,
    clientName: row.clientName,
    lineItems: parseLineItems(row.lineItems),
    amountCents: row.amountCents,
    depositAmountCents: row.depositAmountCents,
    notes: row.notes,
    status: row.status as EstimateStatus,
    openedAt: row.openedAt?.toISOString() ?? null,
    signedAt: row.signedAt?.toISOString() ?? null,
    signedName: row.signedName,
    paidAt: row.paidAt?.toISOString() ?? null,
    stripeCheckoutSessionId: row.stripeCheckoutSessionId,
    stripePaymentIntentId: row.stripePaymentIntentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function requirePrisma() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("Database configured but Prisma client unavailable");
  }
  return prisma;
}

function toDbData(estimate: Estimate) {
  return {
    id: estimate.id,
    token: estimate.token,
    clientName: estimate.clientName,
    lineItems: estimate.lineItems as Prisma.InputJsonValue,
    amountCents: estimate.amountCents,
    depositAmountCents: estimate.depositAmountCents,
    notes: estimate.notes,
    status: estimate.status,
    openedAt: estimate.openedAt ? new Date(estimate.openedAt) : null,
    signedAt: estimate.signedAt ? new Date(estimate.signedAt) : null,
    signedName: estimate.signedName,
    paidAt: estimate.paidAt ? new Date(estimate.paidAt) : null,
    stripeCheckoutSessionId: estimate.stripeCheckoutSessionId,
    stripePaymentIntentId: estimate.stripePaymentIntentId,
    createdAt: new Date(estimate.createdAt),
    updatedAt: new Date(estimate.updatedAt),
  };
}

export async function dbListEstimates(): Promise<Estimate[]> {
  const prisma = requirePrisma();
  const rows = await prisma.estimate.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapEstimate);
}

export async function dbGetEstimateByToken(token: string): Promise<Estimate | null> {
  const prisma = requirePrisma();
  const row = await prisma.estimate.findUnique({ where: { token } });
  return row ? mapEstimate(row) : null;
}

export async function dbGetEstimateByCheckoutSessionId(
  checkoutSessionId: string,
): Promise<Estimate | null> {
  const prisma = requirePrisma();
  const row = await prisma.estimate.findFirst({
    where: { stripeCheckoutSessionId: checkoutSessionId },
  });
  return row ? mapEstimate(row) : null;
}

export async function dbCreateEstimate(estimate: Estimate): Promise<void> {
  const prisma = requirePrisma();
  await prisma.estimate.create({ data: toDbData(estimate) });
}

export async function dbUpdateEstimate(estimate: Estimate): Promise<Estimate> {
  const prisma = requirePrisma();
  const { id, ...data } = toDbData(estimate);
  const row = await prisma.estimate.update({
    where: { id },
    data,
  });
  return mapEstimate(row);
}
