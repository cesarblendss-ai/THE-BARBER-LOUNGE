/**
 * Prove Booksy public time_slots match what we map into /book.
 * Run: npx tsx scripts/test-booksy-availability.ts
 */
import assert from "node:assert/strict";

import {
  BOOKSY_ANY_STAFFER_ID,
  fetchAllStafferBooksySlots,
  fetchBooksyTimeSlots,
  formatClockDisplay,
  parseBooksyTime,
  parseClockDisplay,
} from "../src/lib/booksy-availability";
import { BOOKSY_SERVICE_VARIANT, BOOKSY_STAFFER } from "../src/lib/booksy";
import { STAFF_BUSY_PRESETS } from "../src/lib/busy-blocks";

async function main() {
  {
    const clock = parseBooksyTime("11:45");
    assert.ok(clock);
    assert.equal(clock.hour, 11);
    assert.equal(clock.minute, 45);
    assert.equal(clock.displayTime, "11:45 AM");
    assert.equal(formatClockDisplay(13, 0), "1:00 PM");
  }

  {
    const parsed = parseClockDisplay("11:45 AM");
    assert.deepEqual(parsed, { hour: 11, minute: 45 });
    // Must NOT round up to 12 (fuzzy chat parser does; booking must keep :45).
    assert.notEqual(parsed?.hour, 12);
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const end = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const dt = new Date(y, m - 1, d + 3, 12);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  })();

  const cesar = await fetchBooksyTimeSlots({
    stafferId: Number(BOOKSY_STAFFER.cesarSilva),
    serviceVariantId: BOOKSY_SERVICE_VARIANT.signatureHaircut,
    startDate: today,
    endDate: end,
  });
  assert.equal(cesar.ok, true, `Cesar slots failed: ${!cesar.ok ? cesar.error : ""}`);
  if (cesar.ok) {
    console.log(
      `Cesar (${BOOKSY_STAFFER.cesarSilva}) open slots next days:`,
      cesar.days.map((d) => `${d.date}=${d.slots.map((s) => s.booksyTime).join(",")}`).join(" | "),
    );
  }

  const any = await fetchBooksyTimeSlots({
    stafferId: BOOKSY_ANY_STAFFER_ID,
    serviceVariantId: BOOKSY_SERVICE_VARIANT.signatureHaircut,
    startDate: today,
    endDate: end,
  });
  assert.equal(any.ok, true, `Any slots failed: ${!any.ok ? any.error : ""}`);
  if (any.ok) {
    const total = any.days.reduce((n, d) => n + d.slots.length, 0);
    console.log(`Any staffer open slot count: ${total}`);
    assert.ok(total > 0, "Expected at least one open slot shop-wide");
  }

  const pull = await fetchAllStafferBooksySlots({
    dayCount: 4,
    staffers: STAFF_BUSY_PRESETS,
  });
  console.log(
    "Staffer coverage:",
    STAFF_BUSY_PRESETS.map((s) => {
      const days = pull.byStafferId[s.booksyStafferId] ?? [];
      const n = days.reduce((sum, d) => sum + d.slots.length, 0);
      return `${s.name.split(" ")[0]}=${n}`;
    }).join(" · "),
  );
  for (const staff of STAFF_BUSY_PRESETS) {
    assert.ok(
      staff.booksyStafferId in pull.byStafferId ||
        pull.errors.some((e) => e.startsWith(staff.booksyStafferId)),
      `missing staffer result ${staff.name}`,
    );
  }

  console.log("test-booksy-availability: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
