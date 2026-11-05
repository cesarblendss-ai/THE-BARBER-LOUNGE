import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export type LeadIntent = "book" | "booksy" | "callback" | "opt_in";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  source: string;
  intent: LeadIntent;
  smsOptIn: boolean;
  emailOptIn: boolean;
  notes: string | null;
  createdAt: string;
};

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string | null;
  service?: string | null;
  source?: string;
  intent?: LeadIntent;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  notes?: string | null;
};

type LeadsFile = {
  leads: Lead[];
};

/** Local repo path (gitignored runtime writes OK). On Vercel, `data/` is read-only. */
const LOCAL_DATA_PATH = path.join(process.cwd(), "data", "leads.json");
const VERCEL_TMP_PATH = path.join("/tmp", "tbl-leads.json");

function resolveDataPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return VERCEL_TMP_PATH;
  }
  return LOCAL_DATA_PATH;
}

async function readStore(): Promise<LeadsFile> {
  const candidates = [resolveDataPath(), LOCAL_DATA_PATH, VERCEL_TMP_PATH];
  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as LeadsFile;
      return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
    } catch {
      /* try next */
    }
  }
  return { leads: [] };
}

async function writeStore(store: LeadsFile): Promise<void> {
  const primary = resolveDataPath();
  try {
    await fs.mkdir(path.dirname(primary), { recursive: true });
    await fs.writeFile(primary, JSON.stringify(store, null, 2), "utf8");
    return;
  } catch (error) {
    if (primary !== VERCEL_TMP_PATH) {
      await fs.mkdir(path.dirname(VERCEL_TMP_PATH), { recursive: true });
      await fs.writeFile(VERCEL_TMP_PATH, JSON.stringify(store, null, 2), "utf8");
      console.warn("[leads] wrote to /tmp fallback after primary write failed", error);
      return;
    }
    throw error;
  }
}

function newId(): string {
  return `lead_${randomBytes(6).toString("hex")}`;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const store = await readStore();
  const lead: Lead = {
    id: newId(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    service: input.service?.trim() || null,
    source: input.source?.trim() || "website",
    intent: input.intent ?? "opt_in",
    smsOptIn: Boolean(input.smsOptIn),
    emailOptIn: Boolean(input.emailOptIn),
    notes: input.notes?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  store.leads.unshift(lead);
  await writeStore(store);
  return lead;
}

export async function listLeads(limit = 200): Promise<Lead[]> {
  const store = await readStore();
  return store.leads.slice(0, Math.max(1, Math.min(limit, 500)));
}
