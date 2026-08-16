import assert from "node:assert/strict";

import { getOpenTodayLabel, getShopWeekday, googleMapsSearchUrl } from "../src/lib/shop-hours";

function test() {
  const tuesday = new Date("2026-08-18T18:00:00Z"); // 11 AM PT
  assert.equal(getShopWeekday(tuesday), "Tuesday");
  const tue = getOpenTodayLabel(tuesday);
  assert.equal(tue.closed, true);
  assert.match(tue.line, /Closed today/);
  assert.match(tue.line, /Wednesday/);

  const sunday = new Date("2026-08-16T20:00:00Z"); // 1 PM PT
  assert.equal(getShopWeekday(sunday), "Sunday");
  const sun = getOpenTodayLabel(sunday);
  assert.equal(sun.closed, false);
  assert.match(sun.line, /Open today until 7:00 PM/);

  const maps = googleMapsSearchUrl("1518 A St, Antioch, CA 94509");
  assert.match(maps, /maps\/search/);
  assert.match(maps, /1518/);

  console.log("shop-hours tests passed");
}

test();
