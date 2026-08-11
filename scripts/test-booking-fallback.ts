import { ruleBasedBookingReply } from "../src/lib/booking-agent/fallback";
import { BARBER_LOUNGE_CONFIG } from "../src/lib/booking-config";
import { checkAvailability } from "../src/lib/appointments-store";

type Msg = { role: "user" | "assistant"; content: string };

const messages: Msg[] = [
  { role: "assistant", content: "Hey — what are you looking to get done?" },
];

let failures = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  }
}

async function step(label: string, userText: string) {
  messages.push({ role: "user", content: userText });
  const result = await ruleBasedBookingReply(messages, BARBER_LOUNGE_CONFIG, checkAvailability);
  messages.push({ role: "assistant", content: result.reply });
  console.log(`\n--- ${label} ---`);
  console.log(`User: "${userText}"`);
  console.log(`Bot: ${result.reply}`);
  console.log("State:", {
    service: result.service,
    preferredDay: result.preferredDay,
    preferredTime: result.preferredTime,
    guestCount: result.guestCount,
    customerName: result.customerName,
    customerPhone: result.customerPhone,
    readyToSubmit: result.readyToSubmit,
    phase: result.phase,
  });
  return result;
}

async function run() {
  console.log("=== Cut only (no null, no closed) ===");
  const cutMessages: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
    { role: "user", content: "cut" },
  ];
  const cutResult = await ruleBasedBookingReply(
    cutMessages,
    BARBER_LOUNGE_CONFIG,
    checkAvailability,
  );
  console.log(`Bot: ${cutResult.reply}`);
  assert(cutResult.phase === "schedule", `expected schedule phase, got ${cutResult.phase}`);
  assert(!cutResult.reply.includes("null"), "reply must not contain null");
  assert(!cutResult.reply.toLowerCase().includes("closed"), "should not say closed for service-only");
  assert(cutResult.service === "Signature Haircut", `expected Signature Haircut, got ${cutResult.service}`);
  assert(cutResult.reply.toLowerCase().includes("day"), "should ask for day/time");
  assert(!cutResult.reply.includes("Signature"), "should not say menu titles");

  console.log("\n=== Design on hair (no menu dump) ===");
  const designMessages: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
    { role: "user", content: "I'm looking to get a design on my hair" },
  ];
  const designResult = await ruleBasedBookingReply(
    designMessages,
    BARBER_LOUNGE_CONFIG,
    checkAvailability,
  );
  console.log(`Bot: ${designResult.reply}`);
  assert(designResult.service === "Signature Haircut", `expected Signature Haircut, got ${designResult.service}`);
  assert(
    /design|pattern|fade|freestyle/i.test(designResult.reply),
    "should mention design/pattern naturally",
  );
  assert(!designResult.reply.includes("Signature Haircut"), "must not dump menu title");
  assert(!designResult.reply.includes("Kids Haircut"), "must not list menu items");

  console.log("\n=== 3 kids tomorrow ===");
  const kidsTomorrow: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
    { role: "user", content: "3 kids tomorrow" },
  ];
  const kidsTomorrowResult = await ruleBasedBookingReply(
    kidsTomorrow,
    BARBER_LOUNGE_CONFIG,
    checkAvailability,
  );
  console.log(`Bot: ${kidsTomorrowResult.reply}`);
  assert(kidsTomorrowResult.service === "Kids Haircut", `expected Kids Haircut, got ${kidsTomorrowResult.service}`);
  assert(kidsTomorrowResult.guestCount === 3, `expected guestCount 3, got ${kidsTomorrowResult.guestCount}`);
  assert(kidsTomorrowResult.preferredDay?.toLowerCase() === "tomorrow", "should capture tomorrow");
  assert(/3 kids|kids cuts/i.test(kidsTomorrowResult.reply), "should mention 3 kids cuts");
  assert(!kidsTomorrowResult.reply.includes("Signature"), "must not dump menu titles");

  console.log("\n=== Booking fallback test flow ===");

  const flowMessages: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
  ];

  async function flowStep(label: string, userText: string) {
    flowMessages.push({ role: "user", content: userText });
    const result = await ruleBasedBookingReply(flowMessages, BARBER_LOUNGE_CONFIG, checkAvailability);
    flowMessages.push({ role: "assistant", content: result.reply });
    console.log(`\n--- ${label} ---`);
    console.log(`User: "${userText}"`);
    console.log(`Bot: ${result.reply}`);
    return result;
  }

  const r1 = await flowStep("1. Service + guests", "haircut for 3 kids");
  assert(r1.service === "Kids Haircut", `expected Kids Haircut, got ${r1.service}`);
  assert(r1.guestCount === 3, `expected guestCount 3, got ${r1.guestCount}`);
  assert(!r1.readyToSubmit, "should not be readyToSubmit yet");
  assert(r1.reply.includes("3 kids cuts"), "should say '3 kids cuts' casually");

  const r2 = await flowStep("2. Day + time", "today after 2pm ?");
  assert(r2.preferredDay?.toLowerCase() === "today", `expected today, got ${r2.preferredDay}`);
  assert(Boolean(r2.preferredTime?.includes("2")), `expected time with 2, got ${r2.preferredTime}`);
  assert(r2.phase === "name" || r2.phase === "confirm", "should ask for name or confirm after availability");
  assert(!r2.reply.includes("null"), "reply must not contain null");

  const r3 = await flowStep("3. Name", "Maria Garcia");
  assert(r3.customerName === "Maria Garcia", `expected name Maria Garcia, got ${r3.customerName}`);
  assert(r3.phase === "phone", "should ask for phone");

  const r4 = await flowStep("4. Phone", "9255551234");
  assert(Boolean(r4.customerPhone), "expected phone captured");
  assert(r4.phase === "confirm", "should ask for final confirm");

  const r5 = await flowStep("5. Confirm", "yes");
  assert(r5.readyToSubmit, "expected readyToSubmit true");
  assert(r5.reply.includes("locking"), "expected locking in message");

  console.log("\n=== Fade + beard one-shot ===");
  const fadeMessages: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
    { role: "user", content: "fade and beard saturday 2pm" },
  ];
  const fadeResult = await ruleBasedBookingReply(
    fadeMessages,
    BARBER_LOUNGE_CONFIG,
    checkAvailability,
  );
  console.log(`Bot: ${fadeResult.reply}`);
  assert(fadeResult.service === "Signature Haircut & Beard", `expected cut+beard, got ${fadeResult.service}`);
  assert(!fadeResult.reply.includes("null"), "reply must not contain null");

  console.log("\n=== Cut tomorrow 2pm ===");
  const cutTomorrow: Msg[] = [
    { role: "assistant", content: "Hey — what are you looking to get done?" },
    { role: "user", content: "cut tomorrow 2pm" },
  ];
  const cutTomorrowResult = await ruleBasedBookingReply(
    cutTomorrow,
    BARBER_LOUNGE_CONFIG,
    checkAvailability,
  );
  console.log(`Bot: ${cutTomorrowResult.reply}`);
  assert(cutTomorrowResult.service === "Signature Haircut", "expected cut service");
  assert(!cutTomorrowResult.reply.includes("null"), "reply must not contain null");

  if (failures === 0) {
    console.log("\n=== All tests passed ===");
  } else {
    console.log(`\n=== ${failures} test(s) failed ===`);
    process.exit(1);
  }
}

void run();
