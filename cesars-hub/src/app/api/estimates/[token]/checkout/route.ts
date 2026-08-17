import { NextRequest, NextResponse } from "next/server";

import {
  attachCheckoutSession,
  estimateProductDescription,
  getEstimateByToken,
  getEstimateShareUrl,
  markEstimatePaid,
} from "@/lib/estimates";
import { HUB } from "@/lib/brand";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  const estimate = await getEstimateByToken(token);

  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
  }

  if (estimate.status === "paid") {
    return NextResponse.json({ alreadyPaid: true, url: getEstimateShareUrl(token) });
  }

  if (!estimate.signedAt || !estimate.signedName) {
    return NextResponse.json(
      { error: "Sign the estimate before paying the deposit." },
      { status: 409 },
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Card payments are not set up yet. Card payments are not set up yet." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Card payments are not set up yet." }, { status: 503 });
  }

  const origin = request.nextUrl.origin;
  const returnBase = `${origin}/e/${token}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: estimate.depositAmountCents,
            product_data: {
              name: `Deposit — ${HUB.name}`,
              description: `${estimate.clientName} · ${estimateProductDescription(estimate)}`,
            },
          },
        },
      ],
      metadata: {
        estimateId: estimate.id,
        estimateToken: estimate.token,
      },
      client_reference_id: estimate.id,
      success_url: `${returnBase}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnBase}?checkout=cancel`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }

    await attachCheckoutSession(token, session.id);

    if (session.payment_status === "paid") {
      await markEstimatePaid({
        token,
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[estimates] checkout session failed", error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }
}
