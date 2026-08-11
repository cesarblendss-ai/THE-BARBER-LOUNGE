import type { Metadata } from "next";
import Link from "next/link";
import path from "path";

import { SectionLabel } from "@/components/SectionLabel";
import { SmsSetupStatus } from "@/components/SmsSetupStatus";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `SMS Setup — ${SITE.name}`,
  robots: { index: false, follow: false },
};

const TWILIO_VERIFIED_URL =
  "https://console.twilio.com/us1/develop/phone-numbers/manage/verified";
const TWILIO_AUTH_TOKEN_URL =
  "https://console.twilio.com/account/keys-credentials/api-keys";
const TWILIO_PHONE_NUMBERS_URL =
  "https://console.twilio.com/us1/develop/phone-numbers/manage/incoming";
const TWILIO_A2P_URL =
  "https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc";

export default function AdminSmsSetupPage() {
  const envLocalPath = path.join(process.cwd(), ".env.local");

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <SectionLabel>Admin</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            SMS Setup
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Text message receipts when someone books through the website chat.
          </p>
        </div>

        <div className="mt-10 space-y-8 rounded-2xl border border-charcoal/10 bg-bone p-6 sm:p-8">
          <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-50 p-5 text-sm text-charcoal/90">
            <h2 className="font-serif text-xl text-charcoal">You upgraded! Do these 2 clicks:</h2>
            <ol className="mt-3 list-decimal space-y-3 pl-5 leading-relaxed">
              <li>
                Confirm your number <strong>+1 (737) 232-4091</strong> is active for SMS →{" "}
                <a
                  href={TWILIO_PHONE_NUMBERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brass hover:underline"
                >
                  Active Phone Numbers
                </a>
              </li>
              <li>
                Register for US texting (A2P 10DLC) if customers don&apos;t receive texts →{" "}
                <a
                  href={TWILIO_A2P_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brass hover:underline"
                >
                  A2P 10DLC Registration
                </a>
              </li>
            </ol>
            <p className="mt-3 text-xs text-charcoal/60">
              <code className="text-charcoal">TWILIO_TRIAL_MODE=0</code> is set — bookings send
              full branded receipts, not the trial template.
            </p>
          </div>

          <div className="rounded-xl border border-charcoal/10 bg-charcoal/5 p-4">
            <h2 className="font-serif text-lg text-charcoal">Configuration status</h2>
            <div className="mt-3">
              <SmsSetupStatus />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl text-charcoal">Setup steps</h2>
            <ol className="mt-4 list-decimal space-y-5 pl-5 text-sm leading-relaxed text-charcoal/80">
              <li>
                <strong>Verify your phone in Twilio</strong> (so Twilio can text you during
                testing). Open{" "}
                <a
                  href={TWILIO_VERIFIED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Twilio Verified Caller IDs
                </a>
                , click <strong>Add a new Caller ID</strong>, and enter your cell number. Twilio
                will text you a code — enter it to confirm.
              </li>
              <li>
                <strong>Copy your Auth Token from Twilio.</strong> Open{" "}
                <a
                  href={TWILIO_AUTH_TOKEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Twilio Auth Tokens
                </a>
                . On the <strong>Live credentials</strong> tab, find <strong>Auth Token</strong>{" "}
                and click the copy icon (or show + copy). Keep this secret — like a password.
              </li>
              <li>
                <strong>Open your settings file in Cursor.</strong> In Cursor:{" "}
                <strong>File → Open File…</strong> and open:
                <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal/5 p-3 text-xs text-charcoal">
                  {envLocalPath}
                </pre>
                Copy the Auth Token, open <code className="text-charcoal">.env.local</code> in
                Cursor, and paste it right after{" "}
                <code className="text-charcoal">TWILIO_AUTH_TOKEN=</code> on that line. Save the
                file (<strong>Ctrl+S</strong>).
              </li>
              <li>
                <strong>Check the line looks like this</strong> (your token will be different — a
                long random string, no quotes):
                <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal/5 p-3 text-xs">
                  TWILIO_AUTH_TOKEN=paste_your_token_here_no_quotes
                </pre>
                <code className="text-charcoal">TWILIO_ACCOUNT_SID</code> and{" "}
                <code className="text-charcoal">TWILIO_PHONE_NUMBER</code> should already be filled
                in. If not, copy Account SID and your Twilio phone number from the same Twilio
                console pages.
              </li>
              <li>
                <strong>Restart the dev server</strong> so the new token loads. In the terminal
                where the site is running, press <strong>Ctrl+C</strong>, then run{" "}
                <code className="text-charcoal">npm run dev</code> again. Refresh this page — all
                three checks above should turn green.
              </li>
              <li>
                <strong>Send a test booking</strong> through the site chat with your phone number.
                You should get a confirmation text. If not, double-check your number is verified in
                Twilio (step 1).
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-charcoal/80">
            <p className="font-medium text-charcoal">Twilio trial account limits</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Verified numbers only:</strong> SMS can only go to numbers listed under{" "}
                <a
                  href={TWILIO_VERIFIED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Verified Caller IDs
                </a>
                . Add +19252095995 (owner) and any test customer numbers.
              </li>
              <li>
                <strong>No custom message text:</strong> Trial accounts must use Twilio&apos;s
                predefined templates. Keep{" "}
                <code className="text-charcoal">TWILIO_TRIAL_MODE=1</code> in{" "}
                <code className="text-charcoal">.env.local</code> until you upgrade — then remove
                it for full branded receipts.
              </li>
              <li>
                <strong>Upgrade for production:</strong>{" "}
                <a
                  href="https://console.twilio.com/billing/upgrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Upgrade your Twilio account
                </a>{" "}
                to send custom SMS to any US number.
              </li>
              <li>
                <strong>Trust Hub (if you see error 20003):</strong> Complete your{" "}
                <a
                  href="https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Primary Compliance Profile
                </a>{" "}
                in Trust Hub if Twilio blocks sends for KYC.
              </li>
            </ul>
            <p className="mt-3 text-xs text-charcoal/60">
              Dev test: <code className="text-charcoal">npm run test:sms</code> or{" "}
              <code className="text-charcoal">GET /api/sms-test</code>
            </p>
          </div>

          <div className="rounded-xl border border-brass/30 bg-brass/5 p-4 text-sm text-charcoal/80">
            <p className="font-medium text-charcoal">Quick reminder</p>
            <p className="mt-2">
              Copy the Auth Token → open{" "}
              <code className="text-charcoal">.env.local</code> in Cursor → paste after{" "}
              <code className="text-charcoal">TWILIO_AUTH_TOKEN=</code> → save → restart dev
              server.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-charcoal/45">
          <Link href="/admin/notifications" className="text-brass hover:underline">
            Push notifications setup
          </Link>
          {" · "}
          <Link href="/admin/appointments" className="text-brass hover:underline">
            Appointments admin
          </Link>
        </div>
      </div>
    </section>
  );
}
