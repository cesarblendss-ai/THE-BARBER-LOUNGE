import fs from "fs";
import path from "path";

import { isSmsConfigured, isTwilioTrialMode, sendTestSms } from "../src/lib/sms-receipt";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

async function main() {
  loadEnvLocal();

  const to = process.argv[2]?.trim() || "+19252095995";
  const message = process.argv[3]?.trim() || "TBL test from debug script";

  console.log("Twilio configured:", isSmsConfigured());
  console.log("Trial mode:", isTwilioTrialMode());
  console.log("Sending test SMS to:", to);

  const result = await sendTestSms(to, message);

  if (result.ok) {
    console.log("OK — message accepted by Twilio.");
    if (result.messageSid) console.log("Message SID:", result.messageSid);
  } else {
    console.error("FAILED — code:", result.errorCode ?? "unknown");
    console.error("Message:", result.errorMessage ?? "no details");
    if (result.errorRaw) console.error("Full Twilio JSON:", result.errorRaw);
    process.exitCode = 1;
  }
}

void main();
