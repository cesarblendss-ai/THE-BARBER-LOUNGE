import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EstimatePublicView } from "@/components/EstimatePublicView";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import {
  getEstimateByToken,
  markEstimatePaid,
  recordEstimateOpened,
  toPublicEstimate,
} from "@/lib/estimates";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const estimate = await getEstimateByToken(token);
  if (!estimate) {
    return { title: `Estimate — ${SITE.name}`, robots: { index: false, follow: false } };
  }

  return {
    title: `Estimate for ${estimate.clientName} — ${SITE.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicEstimatePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const query = await searchParams;

  if (query.checkout === "success" && query.session_id && isStripeConfigured()) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(query.session_id);
        if (session.payment_status === "paid" && session.metadata?.estimateToken === token) {
          await markEstimatePaid({
            token,
            checkoutSessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          });
        }
      } catch (error) {
        console.error("[estimates] success-page session lookup failed", error);
      }
    }
  }

  const opened = await recordEstimateOpened(token);
  if (!opened) notFound();

  const checkoutState =
    query.checkout === "success" || query.checkout === "cancel" ? query.checkout : null;

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <SectionLabel>{SITE.name}</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Your estimate
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Review the details, sign your name, then pay the deposit to lock it in.
          </p>
        </div>
        <EstimatePublicView
          token={token}
          initialEstimate={toPublicEstimate(opened)}
          stripeConfigured={isStripeConfigured()}
          checkoutState={checkoutState}
        />
      </div>
    </section>
  );
}
