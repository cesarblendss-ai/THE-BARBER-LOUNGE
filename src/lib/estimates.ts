import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

import { isDatabaseConfigured } from "@/lib/db";
import {
  dbCreateEstimate,
  dbGetEstimateByCheckoutSessionId,
  dbGetEstimateByToken,
  dbListEstimates,
  dbUpdateEstimate,
} from "@/lib/estimates-db";
import { dollarsToCents } from "@/lib/money";
import { SITE } from "@/lib/content";
import type {
  CreateEstimateInput,
  Estimate,
  EstimateLineItem,
  EstimateStatus,
  PublicEstimate,
} from "@/lib/estimates-types";

export type {
  CreateEstimateInput,
  Estimate,
  EstimateLineItem,
  EstimateStatus,
  PublicEstimate,
} from "@/lib/estimates-types";

type EstimatesFile = {
  estimates: Estimate[];
};

const DATA_PATH = path.join(process.cwd(), "data", "estimates.json");

const STATUS_RANK: Record<EstimateStatus, number> = {
  created: 0,
  opened: 1,
  signed: 2,
  paid: 3,
};

function generateToken(): string {
  return randomBytes(18).toString("base64url");
}

function generateId(): string {
  return randomBytes(8).toString("hex");
}

function maxStatus(current: EstimateStatus, next: EstimateStatus): EstimateStatus {
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current;
}

export function toPublicEstimate(estimate: Estimate): PublicEstimate {
  return {
    clientName: estimate.clientName,
    lineItems: estimate.lineItems,
    amountCents: estimate.amountCents,
    depositAmountCents: estimate.depositAmountCents,
    notes: estimate.notes,
    status: estimate.status,
    signedName: estimate.signedName,
    signedAt: estimate.signedAt,
    paidAt: estimate.paidAt,
  };
}

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel.replace(/\/$/, "")}`;
  }

  return "https://the-barber-lounge-antioch.vercel.app";
}

export function getEstimateShareUrl(token: string): string {
  return `${getPublicSiteUrl()}/e/${token}`;
}

async function readJsonStore(): Promise<EstimatesFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as EstimatesFile;
    return { estimates: parsed.estimates ?? [] };
  } catch {
    return { estimates: [] };
  }
}

async function writeJsonStore(data: EstimatesFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  const tempPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, DATA_PATH);
}

function parseLineItems(
  input: CreateEstimateInput,
): { ok: true; lineItems: EstimateLineItem[]; amountCents: number } | { ok: false; reason: string } {
  const rawItems = Array.isArray(input.lineItems) ? input.lineItems : [];
  const lineItems: EstimateLineItem[] = [];

  for (const item of rawItems) {
    const description = item.description?.trim() ?? "";
    const amountCents =
      typeof item.amountCents === "number" ? item.amountCents : dollarsToCents(item.amount);
    if (!description && (amountCents === null || amountCents === 0)) continue;
    if (!description) {
      return { ok: false, reason: "Each line item needs a description." };
    }
    if (amountCents === null || amountCents <= 0) {
      return { ok: false, reason: "Each line item needs an amount greater than $0." };
    }
    lineItems.push({ description, amountCents });
  }

  const summed = lineItems.reduce((total, item) => total + item.amountCents, 0);
  const fallbackAmount =
    typeof input.amountCents === "number" ? input.amountCents : dollarsToCents(input.amount);

  if (lineItems.length > 0) {
    return { ok: true, lineItems, amountCents: summed };
  }

  if (fallbackAmount !== null && fallbackAmount > 0) {
    return {
      ok: true,
      lineItems: [{ description: "Estimate total", amountCents: fallbackAmount }],
      amountCents: fallbackAmount,
    };
  }

  return { ok: false, reason: "Add line items or a total amount." };
}

export function validateCreateEstimateInput(
  input: CreateEstimateInput,
): { ok: true; estimate: Omit<Estimate, "id" | "token" | "createdAt" | "updatedAt"> } | { ok: false; reason: string } {
  const clientName = input.clientName?.trim() ?? "";
  if (!clientName) {
    return { ok: false, reason: "Client name is required." };
  }

  const parsedItems = parseLineItems(input);
  if (!parsedItems.ok) return parsedItems;

  const depositAmountCents =
    typeof input.depositAmountCents === "number"
      ? input.depositAmountCents
      : dollarsToCents(input.depositAmount);

  if (depositAmountCents === null || depositAmountCents <= 0) {
    return { ok: false, reason: "Deposit amount must be greater than $0." };
  }

  if (depositAmountCents > parsedItems.amountCents) {
    return { ok: false, reason: "Deposit cannot be more than the estimate total." };
  }

  return {
    ok: true,
    estimate: {
      clientName,
      lineItems: parsedItems.lineItems,
      amountCents: parsedItems.amountCents,
      depositAmountCents,
      notes: input.notes?.trim() ?? "",
      status: "created",
      openedAt: null,
      signedAt: null,
      signedName: null,
      paidAt: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
    },
  };
}

export async function createEstimate(
  input: CreateEstimateInput,
): Promise<{ ok: true; estimate: Estimate } | { ok: false; reason: string }> {
  const validated = validateCreateEstimateInput(input);
  if (!validated.ok) return validated;

  const now = new Date().toISOString();
  const estimate: Estimate = {
    ...validated.estimate,
    id: generateId(),
    token: generateToken(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (isDatabaseConfigured()) {
      await dbCreateEstimate(estimate);
    } else {
      const store = await readJsonStore();
      store.estimates.unshift(estimate);
      await writeJsonStore(store);
    }
  } catch (error) {
    console.error("[estimates] create failed", error);
    return { ok: false, reason: "Could not save estimate." };
  }

  return { ok: true, estimate };
}

export async function listEstimates(): Promise<Estimate[]> {
  if (isDatabaseConfigured()) {
    try {
      return await dbListEstimates();
    } catch (error) {
      console.error("[estimates] db list failed, falling back to JSON", error);
    }
  }

  const store = await readJsonStore();
  return [...store.estimates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getEstimateByToken(token: string): Promise<Estimate | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  if (isDatabaseConfigured()) {
    try {
      return await dbGetEstimateByToken(trimmed);
    } catch (error) {
      console.error("[estimates] db get failed, falling back to JSON", error);
    }
  }

  const store = await readJsonStore();
  return store.estimates.find((item) => item.token === trimmed) ?? null;
}

async function persistEstimate(next: Estimate): Promise<Estimate> {
  if (isDatabaseConfigured()) {
    return dbUpdateEstimate(next);
  }

  const store = await readJsonStore();
  const index = store.estimates.findIndex((item) => item.id === next.id);
  if (index >= 0) {
    store.estimates[index] = next;
  } else {
    store.estimates.unshift(next);
  }
  await writeJsonStore(store);
  return next;
}

export async function recordEstimateOpened(token: string): Promise<Estimate | null> {
  const estimate = await getEstimateByToken(token);
  if (!estimate) return null;
  if (estimate.openedAt && STATUS_RANK[estimate.status] >= STATUS_RANK.opened) {
    return estimate;
  }

  const now = new Date().toISOString();
  estimate.openedAt = estimate.openedAt ?? now;
  estimate.status = maxStatus(estimate.status, "opened");
  estimate.updatedAt = now;
  return persistEstimate(estimate);
}

export async function signEstimate(
  token: string,
  signedName: string,
): Promise<{ ok: true; estimate: Estimate } | { ok: false; reason: string; status?: number }> {
  const name = signedName.trim();
  if (name.length < 2) {
    return { ok: false, reason: "Type your full name to sign.", status: 400 };
  }

  const estimate = await getEstimateByToken(token);
  if (!estimate) {
    return { ok: false, reason: "Estimate not found.", status: 404 };
  }

  if (estimate.status === "paid") {
    return { ok: true, estimate };
  }

  if (estimate.signedAt && estimate.signedName) {
    return { ok: true, estimate };
  }

  const now = new Date().toISOString();
  estimate.signedName = name;
  estimate.signedAt = now;
  estimate.openedAt = estimate.openedAt ?? now;
  estimate.status = maxStatus(estimate.status, "signed");
  estimate.updatedAt = now;

  return { ok: true, estimate: await persistEstimate(estimate) };
}

export async function attachCheckoutSession(
  token: string,
  checkoutSessionId: string,
): Promise<Estimate | null> {
  const estimate = await getEstimateByToken(token);
  if (!estimate) return null;

  const now = new Date().toISOString();
  estimate.stripeCheckoutSessionId = checkoutSessionId;
  estimate.updatedAt = now;
  return persistEstimate(estimate);
}

export async function markEstimatePaid(input: {
  token?: string | null;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}): Promise<Estimate | null> {
  let estimate: Estimate | null = null;

  if (input.token) {
    estimate = await getEstimateByToken(input.token);
  }

  if (!estimate && input.checkoutSessionId) {
    if (isDatabaseConfigured()) {
      try {
        estimate = await dbGetEstimateByCheckoutSessionId(input.checkoutSessionId);
      } catch (error) {
        console.error("[estimates] db session lookup failed", error);
      }
    }
    if (!estimate) {
      const store = await readJsonStore();
      estimate =
        store.estimates.find((item) => item.stripeCheckoutSessionId === input.checkoutSessionId) ??
        null;
    }
  }

  if (!estimate) return null;

  if (estimate.status === "paid" && estimate.paidAt) {
    if (input.checkoutSessionId && !estimate.stripeCheckoutSessionId) {
      estimate.stripeCheckoutSessionId = input.checkoutSessionId;
      estimate.stripePaymentIntentId =
        input.paymentIntentId ?? estimate.stripePaymentIntentId;
      estimate.updatedAt = new Date().toISOString();
      return persistEstimate(estimate);
    }
    return estimate;
  }

  const now = new Date().toISOString();
  estimate.status = "paid";
  estimate.paidAt = now;
  estimate.openedAt = estimate.openedAt ?? now;
  estimate.stripeCheckoutSessionId = input.checkoutSessionId ?? estimate.stripeCheckoutSessionId;
  estimate.stripePaymentIntentId = input.paymentIntentId ?? estimate.stripePaymentIntentId;
  estimate.updatedAt = now;
  return persistEstimate(estimate);
}

export function estimateProductDescription(estimate: Estimate): string {
  const itemSummary = estimate.lineItems.map((item) => item.description).join(", ");
  return itemSummary || `${SITE.name} estimate deposit`;
}
