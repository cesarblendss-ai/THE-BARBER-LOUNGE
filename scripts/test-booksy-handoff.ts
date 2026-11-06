/**
 * Prove Booksy handoff URLs encode service + staffer + date + time.
 * Run: npx tsx scripts/test-booksy-handoff.ts
 */
import assert from "node:assert/strict";

import {
  getBooksyHandoffFromBooking,
  getBooksyHandoffUrl,
  resolveBooksyServiceVariantId,
  resolveBooksyStafferId,
  toBooksyTimeParam,
} from "../src/lib/booksy-handoff";
import { BOOKSY_SERVICE_VARIANT, BOOKSY_STAFFER } from "../src/lib/booksy";

function main() {
  assert.equal(
    resolveBooksyServiceVariantId("Signature Haircut"),
    BOOKSY_SERVICE_VARIANT.signatureHaircut,
  );
  assert.equal(
    resolveBooksyServiceVariantId("Haircut & Beard with Cesar Silva"),
    BOOKSY_SERVICE_VARIANT.signatureHaircutBeard,
  );
  assert.equal(resolveBooksyStafferId("Cesar Silva"), BOOKSY_STAFFER.cesarSilva);
  assert.equal(resolveBooksyStafferId("Alexis"), BOOKSY_STAFFER.alexisFranco);
  assert.equal(resolveBooksyStafferId("Any available"), null);
  assert.equal(toBooksyTimeParam("11:45 AM"), "11:45");
  assert.equal(toBooksyTimeParam("1:00 PM"), "13:00");

  const url = new URL(
    getBooksyHandoffUrl({
      serviceVariantId: BOOKSY_SERVICE_VARIANT.signatureHaircut,
      stafferId: BOOKSY_STAFFER.cesarSilva,
      date: "2026-11-10",
      time: "11:45",
    }),
  );
  assert.equal(url.searchParams.get("do"), "open-widget");
  assert.equal(url.searchParams.get("variantId"), BOOKSY_SERVICE_VARIANT.signatureHaircut);
  assert.equal(url.searchParams.get("stafferId"), BOOKSY_STAFFER.cesarSilva);
  assert.equal(url.searchParams.get("date"), "2026-11-10");
  assert.equal(url.searchParams.get("time"), "11:45");

  const fromBooking = new URL(
    getBooksyHandoffFromBooking({
      service: "Signature Haircut with Cesar Silva",
      preferredTime: "11:45 AM",
      slotDate: "2026-11-10",
    }),
  );
  assert.equal(fromBooking.searchParams.get("do"), "open-widget");
  assert.equal(
    fromBooking.searchParams.get("variantId"),
    BOOKSY_SERVICE_VARIANT.signatureHaircut,
  );
  assert.equal(fromBooking.searchParams.get("stafferId"), BOOKSY_STAFFER.cesarSilva);
  assert.equal(fromBooking.searchParams.get("date"), "2026-11-10");
  assert.equal(fromBooking.searchParams.get("time"), "11:45");

  console.log("test-booksy-handoff: ok");
  console.log(fromBooking.toString());
}

main();
