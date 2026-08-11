import {
  formatPhoneDisplay,
  normalizePhoneE164,
} from "../src/lib/sms-receipt";

let failures = 0;

function assertEqual(actual: string | null, expected: string | null, label: string) {
  if (actual !== expected) {
    console.error(`FAIL: ${label}`);
    console.error(`  expected: ${expected}`);
    console.error(`  actual:   ${actual}`);
    failures++;
  } else {
    console.log(`OK: ${label}`);
  }
}

const cases: Array<{ input: string; e164: string | null; display?: string }> = [
  { input: "9255551234", e164: "+19255551234", display: "(925) 555-1234" },
  { input: "(925) 555-1234", e164: "+19255551234", display: "(925) 555-1234" },
  { input: "+19255551234", e164: "+19255551234", display: "(925) 555-1234" },
  { input: "1-925-555-1234", e164: "+19255551234", display: "(925) 555-1234" },
  { input: "123", e164: null },
  { input: "", e164: null },
];

for (const { input, e164, display } of cases) {
  assertEqual(normalizePhoneE164(input), e164, `E.164: "${input}"`);
  if (display) {
    assertEqual(formatPhoneDisplay(input), display, `display: "${input}"`);
  }
}

if (failures === 0) {
  console.log("\n=== All phone normalize tests passed ===");
} else {
  console.log(`\n=== ${failures} test(s) failed ===`);
  process.exit(1);
}
