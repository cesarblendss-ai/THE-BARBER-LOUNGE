import { NextRequest, NextResponse } from "next/server";

import { getEstimateByToken, toPublicEstimate } from "@/lib/estimates";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  const estimate = await getEstimateByToken(token);
  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
  }

  return NextResponse.json({
    estimate: toPublicEstimate(estimate),
    stripeConfigured: isStripeConfigured(),
  });
}
