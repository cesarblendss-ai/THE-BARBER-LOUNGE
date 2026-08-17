/**
 * Local smoke test for estimate tracker (no Stripe keys required).
 * Run: npx tsx scripts/test-estimates.ts
 */
import {
  attachCheckoutSession,
  createEstimate,
  getEstimateByToken,
  markEstimatePaid,
  recordEstimateOpened,
  signEstimate,
} from "../src/lib/estimates";

async function main() {
  const created = await createEstimate({
    clientName: "Smoke Test Client",
    lineItems: [{ description: "Signature haircut", amount: "50" }],
    depositAmount: "25",
    notes: "Saturday morning if possible.",
  });
  if (!created.ok) {
    throw new Error(`create failed: ${created.reason}`);
  }

  const token = created.estimate.token;
  const opened = await recordEstimateOpened(token);
  if (!opened || opened.status !== "opened") {
    throw new Error(`open failed: ${opened?.status}`);
  }

  const signed = await signEstimate(token, "Smoke Test Client");
  if (!signed.ok || signed.estimate.status !== "signed") {
    throw new Error("sign failed");
  }

  await attachCheckoutSession(token, "cs_test_smoke");
  const paid = await markEstimatePaid({
    token,
    checkoutSessionId: "cs_test_smoke",
    paymentIntentId: "pi_test_smoke",
  });
  if (!paid || paid.status !== "paid") {
    throw new Error(`paid failed: ${paid?.status}`);
  }

  const again = await markEstimatePaid({
    token,
    checkoutSessionId: "cs_test_smoke",
  });
  if (!again || again.status !== "paid" || again.paidAt !== paid.paidAt) {
    throw new Error("idempotent paid failed");
  }

  const fetched = await getEstimateByToken(token);
  if (!fetched?.openedAt || !fetched.signedAt || !fetched.paidAt) {
    throw new Error("missing timestamps");
  }

  console.log("ok", {
    token,
    status: fetched.status,
    openedAt: fetched.openedAt,
    signedAt: fetched.signedAt,
    paidAt: fetched.paidAt,
  });

  // Keep data/estimates.json clean — remove the smoke record from JSON fallback.
  const fs = await import("fs/promises");
  const path = await import("path");
  const dataPath = path.join(process.cwd(), "data", "estimates.json");
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as { estimates?: Array<{ token: string }> };
    const remaining = (parsed.estimates ?? []).filter((item) => item.token !== token);
    await fs.writeFile(dataPath, JSON.stringify({ estimates: remaining }, null, 2) + "\n", "utf8");
  } catch {
    // ignore — Postgres path or missing file
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
