import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { createEstimate, getEstimateShareUrl, listEstimates } from "@/lib/estimates";
import type { CreateEstimateInput } from "@/lib/estimates-types";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const estimates = await listEstimates();
    return NextResponse.json({
      estimates: estimates.map((estimate) => ({
        ...estimate,
        shareUrl: getEstimateShareUrl(estimate.token),
      })),
      stripeConfigured: isStripeConfigured(),
    });
  } catch (error) {
    console.error("[estimates] GET failed", error);
    return NextResponse.json({ error: "Could not load estimates." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  let body: CreateEstimateInput;
  try {
    body = (await request.json()) as CreateEstimateInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createEstimate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    estimate: {
      ...result.estimate,
      shareUrl: getEstimateShareUrl(result.estimate.token),
    },
  });
}
