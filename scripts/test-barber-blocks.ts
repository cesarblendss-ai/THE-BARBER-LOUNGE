import assert from "node:assert/strict";
import { promises as fs } from "fs";
import path from "path";

import {
  getAvailableSlotsForDate,
  isSlotTaken,
  listAppointments,
  setBlockedHoursForDate,
  toggleBlockedSlot,
} from "../src/lib/appointments-store";

async function withTempStore(fn: () => Promise<void>) {
  const dataPath = path.join(process.cwd(), "data", "appointments.json");
  const backupPath = `${dataPath}.test-backup`;
  let hadBackup = false;
  try {
    await fs.copyFile(dataPath, backupPath);
    hadBackup = true;
  } catch {
    /* no existing file */
  }

  try {
    await fs.writeFile(dataPath, JSON.stringify({ appointments: [], blockedSlots: [] }, null, 2));
    await fn();
  } finally {
    if (hadBackup) {
      await fs.rename(backupPath, dataPath);
    } else {
      await fs.writeFile(dataPath, JSON.stringify({ appointments: [], blockedSlots: [] }, null, 2));
    }
  }
}

void withTempStore(async () => {
  delete process.env.DATABASE_URL;
  delete process.env.TBLDB_POSTGRES_URL;

  const date = "2099-06-15"; // Sunday — shop open

  await setBlockedHoursForDate(date, [10, 11], {
    mode: "replace",
    barberName: "Alexis Franco",
    reason: "Booksy · Alexis Franco",
  });

  const store = await listAppointments();
  assert.equal(isSlotTaken(store, date, 10, "Alexis Franco"), true);
  assert.equal(isSlotTaken(store, date, 10, "Cesar Silva"), false, "Cesar should stay open");
  assert.equal(isSlotTaken(store, date, 10, null), false, "Any available if other chairs free");

  await setBlockedHoursForDate(date, [10], {
    mode: "add",
    barberName: "",
    reason: "Booksy busy (shop-wide)",
  });
  const store2 = await listAppointments();
  assert.equal(isSlotTaken(store2, date, 10, "Cesar Silva"), true, "shop-wide blocks Cesar");
  assert.equal(isSlotTaken(store2, date, 10, null), true, "shop-wide blocks Any");

  await toggleBlockedSlot(date, 10, undefined, "");
  await setBlockedHoursForDate(date, [], { mode: "replace", barberName: "Alexis Franco" });

  const slots = await getAvailableSlotsForDate(date, new Date("2099-06-14T12:00:00"), "Alexis Franco");
  assert.ok(slots.some((s) => s.hour === 10), "Alexis 10am open after clear");

  console.log("barber-scoped blocks ok");
});
