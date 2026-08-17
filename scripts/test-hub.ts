import assert from "node:assert/strict";

import {
  HUB_DEAD_HOSTS,
  HUB_LEGACY_LOCAL_URL,
  HUB_LIVE_URL,
  HUB_PATH,
  isHubPath,
} from "../src/lib/hub";

function test() {
  assert.equal(HUB_PATH, "/hub");
  assert.equal(HUB_LIVE_URL, "https://the-barber-lounge-antioch.vercel.app/hub");
  assert.equal(isHubPath("/hub"), true);
  assert.equal(isHubPath("/hub/manual"), true);
  assert.equal(isHubPath("/hub/calendar"), true);
  assert.equal(isHubPath("/admin"), false);
  assert.equal(isHubPath("/"), false);
  assert.ok(HUB_DEAD_HOSTS.includes("thebarberlounge.com"));
  assert.ok(HUB_LEGACY_LOCAL_URL.includes("localhost:8743"));
  assert.ok(HUB_LEGACY_LOCAL_URL.includes("biz=barber-lounge"));
  console.log("hub tests passed");
}

test();
