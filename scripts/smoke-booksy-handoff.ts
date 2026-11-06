/**
 * Smoke: handoff URL encodes prefill params and Booksy profile accepts them.
 * Run: npx tsx scripts/smoke-booksy-handoff.ts
 */
import {
  getBooksyHandoffFromBooking,
} from "../src/lib/booksy-handoff";

async function main() {
  const url = getBooksyHandoffFromBooking({
    service: "Signature Haircut with Cesar Silva",
    preferredTime: "11:45 AM",
    slotDate: "2026-11-10",
  });
  console.log("handoffUrl", url);

  const parsed = new URL(url);
  const required = ["do", "variantId", "stafferId", "date", "time"] as const;
  for (const key of required) {
    if (!parsed.searchParams.get(key)) {
      throw new Error(`missing query param: ${key}`);
    }
  }
  if (parsed.searchParams.get("do") !== "open-widget") {
    throw new Error("do must be open-widget");
  }

  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TBL-HandoffSmoke/1.0)" },
  });
  const text = await res.text();
  console.log("http", res.status, res.url);
  if (!res.ok) throw new Error(`Booksy handoff HTTP ${res.status}`);
  for (const needle of ["open-widget", "16190327", "1653463", "2026-11-10"]) {
    if (!text.includes(needle)) {
      throw new Error(`Booksy HTML missing ${needle}`);
    }
  }
  console.log("smoke-booksy-handoff: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
