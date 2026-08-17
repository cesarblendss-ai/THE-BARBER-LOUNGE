import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { verifyAdminKey } from "../src/lib/admin-auth";
import {
  buildDefaultWeek,
  currentWeekStart,
  dayNameFromDateStr,
  formatBlockRange,
  formatWeekRangeLabel,
  getWeekDates,
  getWeekStartSunday,
  parseShopWeekUpload,
  sanitizeShopWeek,
  shiftWeekStart,
} from "../src/lib/shop-week";

function test() {
  const sunday = "2026-08-16";
  assert.equal(dayNameFromDateStr(sunday), "Sunday");
  assert.equal(getWeekStartSunday(sunday), sunday);
  assert.equal(getWeekStartSunday("2026-08-19"), sunday);
  assert.equal(getWeekStartSunday("2026-08-22"), sunday);
  assert.deepEqual(getWeekDates(sunday), [
    "2026-08-16",
    "2026-08-17",
    "2026-08-18",
    "2026-08-19",
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
  ]);
  assert.equal(shiftWeekStart(sunday, 1), "2026-08-23");
  assert.equal(formatWeekRangeLabel(sunday), "Aug 16 – Aug 22");

  const defaults = buildDefaultWeek(sunday);
  const tuesday = defaults.days.find((d) => d.dayName === "Tuesday");
  const sundayDay = defaults.days.find((d) => d.dayName === "Sunday");
  assert.equal(tuesday?.status, "closed");
  assert.equal(tuesday?.hours, "Closed");
  assert.equal(sundayDay?.status, "open");
  assert.match(sundayDay?.hours ?? "", /8:00 AM/);

  const uploaded = parseShopWeekUpload(
    JSON.stringify({
      weekStart: "2026-08-19",
      days: [
        {
          date: "2026-08-18",
          status: "closed",
          notes: "Team offsite",
        },
        {
          date: "2026-08-21",
          status: "open",
          hours: "9:00 AM – 5:00 PM",
          notes: "Cesar out after 3",
          blocks: [{ startHour: 14, endHour: 16, label: "Time reservation" }],
        },
      ],
    }),
  );
  assert.equal(uploaded.weekStart, sunday);
  assert.equal(uploaded.days.length, 7);
  assert.equal(uploaded.days[2]?.status, "closed");
  assert.equal(uploaded.days[5]?.notes, "Cesar out after 3");
  assert.equal(uploaded.days[5]?.blocks[0]?.label, "Time reservation");
  assert.equal(formatBlockRange(uploaded.days[5]!.blocks[0]!), "2:00 PM – 4:00 PM");

  const sanitized = sanitizeShopWeek(
    {
      weekStart: sunday,
      days: [
        {
          date: sunday,
          status: "open",
          notes: "x".repeat(400),
          blocks: [{ startHour: 20, endHour: 19, label: "" }],
        },
      ],
    },
    sunday,
  );
  assert.equal(sanitized.days[0]?.notes.length, 280);
  assert.ok(sanitized.days[0]!.blocks[0]!.endHour > sanitized.days[0]!.blocks[0]!.startHour);
  assert.equal(sanitized.days[0]!.blocks[0]!.label, "Time reservation");

  assert.throws(() => parseShopWeekUpload("not-json"), /not valid JSON/);

  const start = currentWeekStart(new Date("2026-08-16T20:00:00Z"));
  assert.equal(getWeekStartSunday(start).length, 10);

  const previousKey = process.env.ADMIN_UPLOAD_KEY;
  process.env.ADMIN_UPLOAD_KEY = "unit-test-admin-key";
  const unauthorized = new NextRequest("http://localhost/api/shop-week", { method: "PUT" });
  assert.equal(verifyAdminKey(unauthorized), false);
  const authorized = new NextRequest("http://localhost/api/shop-week", {
    method: "PUT",
    headers: { "x-admin-key": "unit-test-admin-key" },
  });
  assert.equal(verifyAdminKey(authorized), true);
  const wrongKey = new NextRequest("http://localhost/api/shop-week", {
    method: "PUT",
    headers: { "x-admin-key": "nope" },
  });
  assert.equal(verifyAdminKey(wrongKey), false);
  if (previousKey === undefined) {
    delete process.env.ADMIN_UPLOAD_KEY;
  } else {
    process.env.ADMIN_UPLOAD_KEY = previousKey;
  }

  console.log("shop-week tests passed");
}

test();
