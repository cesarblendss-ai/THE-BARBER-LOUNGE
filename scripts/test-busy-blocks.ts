/**
 * Quick checks for shop-wide busy paste + per-barber slot rules.
 * Run: npx tsx scripts/test-busy-blocks.ts
 */
import assert from "node:assert/strict";

import { isSlotTaken, type Appointment, type BlockedSlot } from "../src/lib/appointments-store";
import {
  appointmentMatchesBarber,
  parseBusyPaste,
  STAFF_BUSY_PRESETS,
} from "../src/lib/busy-blocks";

function store(blockedSlots: BlockedSlot[], appointments: Appointment[] = []) {
  return { appointments, blockedSlots };
}

{
  const parsed = parseBusyPaste("10am-12pm, 2pm, 4-6");
  assert.deepEqual(parsed.hours, [10, 11, 14, 16, 17]);
  assert.equal(parsed.unmatched.length, 0);
}

{
  const parsed = parseBusyPaste("10:00 AM – 1:00 PM");
  assert.deepEqual(parsed.hours, [10, 11, 12]);
}

{
  assert.ok(STAFF_BUSY_PRESETS.length >= 5);
  const ids = STAFF_BUSY_PRESETS.map((s) => s.booksyStafferId).sort();
  assert.deepEqual(ids, ["1124582", "1653463", "1659337", "1691142", "1740160"].sort());
}

{
  assert.equal(appointmentMatchesBarber("Signature Haircut with Alexis Franco", "Alexis Franco"), true);
  assert.equal(appointmentMatchesBarber("Signature Haircut with Braulio Gómez", "Alexis Franco"), false);
}

{
  const s = store([{ date: "2026-11-10", hour: 10, barberName: "Alexis Franco", reason: "Booksy · Alexis Franco" }]);
  assert.equal(isSlotTaken(s, "2026-11-10", 10, "Alexis Franco"), true);
  assert.equal(isSlotTaken(s, "2026-11-10", 10, "Braulio Gómez"), false);
  // Any available: only Alexis busy → still open
  assert.equal(isSlotTaken(s, "2026-11-10", 10, null), false);
}

{
  const s = store([{ date: "2026-11-10", hour: 11, barberName: "", reason: "Shop closed lunch" }]);
  assert.equal(isSlotTaken(s, "2026-11-10", 11, "Alexis Franco"), true);
  assert.equal(isSlotTaken(s, "2026-11-10", 11, "Cesar Silva"), true);
  assert.equal(isSlotTaken(s, "2026-11-10", 11, null), true);
}

{
  const allBusy = store(
    STAFF_BUSY_PRESETS.map((staff) => ({
      date: "2026-11-10",
      hour: 15,
      barberName: staff.name,
      reason: `Booksy · ${staff.name}`,
    })),
  );
  assert.equal(isSlotTaken(allBusy, "2026-11-10", 15, null), true);
  assert.equal(isSlotTaken(allBusy, "2026-11-10", 15, "Kristian Guerra"), true);
}

{
  const withAppt = store([], [
    {
      id: "1",
      confirmationCode: "TBL-TEST",
      service: "Signature Haircut with Sebastian Guardado",
      preferredDay: "Monday",
      preferredTime: "2:00 PM",
      slotDate: "2026-11-10",
      slotHour: 14,
      name: "Guest",
      phone: "(925) 555-0100",
      guestCount: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  assert.equal(isSlotTaken(withAppt, "2026-11-10", 14, "Sebastian Guardado"), true);
  assert.equal(isSlotTaken(withAppt, "2026-11-10", 14, "Alexis Franco"), false);
}

console.log("test-busy-blocks: ok");
console.log(
  "staffers:",
  STAFF_BUSY_PRESETS.map((s) => `${s.name} (${s.booksyStafferId})`).join(", "),
);
