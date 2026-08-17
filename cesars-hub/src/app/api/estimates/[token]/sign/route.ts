import { NextRequest, NextResponse } from "next/server";

import { signEstimate, toPublicEstimate } from "@/lib/estimates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  let body: { signedName?: string };
  try {
    body = (await request.json()) as { signedName?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await signEstimate(token, body.signedName ?? "");
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status ?? 400 });
  }

  return NextResponse.json({ estimate: toPublicEstimate(result.estimate) });
}
