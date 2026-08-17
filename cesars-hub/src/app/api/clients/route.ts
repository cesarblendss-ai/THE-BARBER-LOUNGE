import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { getRepoRoot } from "@/lib/repo-paths";
import { unauthorizedHubResponse, verifyHubKey } from "@hub/lib/hub-auth";

export const runtime = "nodejs";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request: NextRequest) {
  if (!verifyHubKey(request)) return unauthorizedHubResponse();

  let body: {
    name?: string;
    niche?: string;
    city?: string;
    state?: string;
    phone?: string;
    website?: string;
    package?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  const niche = body.niche?.trim();
  const city = body.city?.trim();
  const state = body.state?.trim()?.toUpperCase();
  if (!name || !niche || !city || !state) {
    return NextResponse.json({ error: "name, niche, city, and state are required." }, { status: 400 });
  }

  const slug = toSlug(name);
  const fileName = `${slug.replace(/-/g, "_")}.json`;
  const dir = path.join(getRepoRoot(), "tools", "seo-agent", "clients");
  const filePath = path.join(dir, fileName);

  const profile = {
    name,
    niche,
    schema_type: "LocalBusiness",
    city,
    state,
    service_area: city,
    services: [],
    competitors: [],
    phone: body.phone?.trim() ?? "",
    website: body.website?.trim() ?? "",
    address: "",
    hours: "",
    price_range: "$$",
    email: "",
    instagram: "",
    booking_url: "",
    package: body.package?.trim() || "Growth",
    case_study: false,
    notes: "Created from Cesar’s Hub onboard wizard.",
  };

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true, slug, file: `tools/seo-agent/clients/${fileName}` });
}
