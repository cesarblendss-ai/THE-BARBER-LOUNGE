import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export type LeadIntent = "booksy" | "callback" | "opt_in";

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

const DATA_PATH = path.join(process.cwd(), "data", "leads.json");

async function readStore(): Promise<LeadsFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as LeadsFile;
    return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
  } catch {
    return { leads: [] };
  }
}

async function writeStore(store: LeadsFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
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
