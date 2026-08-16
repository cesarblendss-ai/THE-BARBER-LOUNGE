import type { Metadata } from "next";
import Link from "next/link";

import { NtfyTestButton } from "@/components/NtfyTestButton";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";
import { HUB_SECTION_CLASS } from "@/lib/hub";
import { getNtfySubscribeUrl, getNtfyTopicForDisplay } from "@/lib/notifications";

export const metadata: Metadata = {
  title: `Notifications Setup — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  const topic = getNtfyTopicForDisplay();
  const subscribeUrl = topic ? getNtfySubscribeUrl(topic) : null;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className={HUB_SECTION_CLASS}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <SectionLabel>Cesar’s Hub</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            Phone Notifications
          </h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Get a push on your phone every time someone books through the website chat.
          </p>
        </div>

        <div className="mt-10 space-y-8 rounded-2xl border border-charcoal/10 bg-bone p-6 sm:p-8">
          <div>
            <h2 className="font-serif text-xl text-charcoal">Setup (5 minutes)</h2>
            <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-charcoal/80">
              <li>
                Install the free{" "}
                <a
                  href="https://ntfy.sh/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  ntfy app
                </a>{" "}
                on your iPhone or Android.
              </li>
              <li>
                Add to your <code className="text-charcoal">.env.local</code>:
                <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal/5 p-3 text-xs">
                  NTFY_TOPIC=barber-lounge-bookings-your-secret-here
                </pre>
                Pick a unique secret topic name — anyone who knows it can subscribe, so don&apos;t
                use something guessable.
              </li>
              <li>Restart the dev server (or redeploy) so the env var loads.</li>
              <li>
                In the ntfy app, tap <strong>+</strong> → Subscribe to topic → enter your exact{" "}
                <code className="text-charcoal">NTFY_TOPIC</code> value.
              </li>
              <li>
                Send a test booking through the site chat — you should get a push like{" "}
                <em>New booking: Maria — 3 kids cuts, Today 2pm — TBL-XXXX</em>.
              </li>
            </ol>
          </div>

          {topic ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-brass/30 bg-brass/5 p-4">
                <p className="text-sm font-medium text-charcoal">Your topic is configured:</p>
                <p className="mt-1 font-mono text-sm text-charcoal/80">{topic}</p>
                <p className="mt-2 text-xs text-charcoal/60">
                  Subscribe to this exact topic in the ntfy app — not a generic name like{" "}
                  <code>the-barber-lounge-bookings</code>.
                </p>
                {subscribeUrl && (
                  <a
                    href={subscribeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-brass hover:underline"
                  >
                    Open subscribe link →
                  </a>
                )}
              </div>
              <NtfyTestButton authRequired={authRequired} />
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>NTFY_TOPIC not set.</strong> Add it to <code>.env.local</code> and restart.
              Bookings still save — notifications log to the server console until this is configured.
            </div>
          )}

          <div>
            <h2 className="font-serif text-xl text-charcoal">SMS text receipts</h2>
            <p className="mt-2 text-sm text-charcoal/70">
              Customers and the shop get a text when someone books through the chat. Twilio needs
              your Auth Token in <code>.env.local</code>.
            </p>
            <Link
              href="/hub/sms-setup"
              className="mt-3 inline-block text-sm font-medium text-brass hover:underline"
            >
              SMS setup guide →
            </Link>
          </div>

          <div>
            <h2 className="font-serif text-xl text-charcoal">Optional email backup</h2>
            <p className="mt-2 text-sm text-charcoal/70">
              Set <code>RESEND_API_KEY</code> and <code>OWNER_EMAIL</code> in{" "}
              <code>.env.local</code> for email copies. Console logging always works as fallback.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl text-charcoal">Booksy note</h2>
            <p className="mt-2 text-sm text-charcoal/70">
              Booksy does not offer a public iCal export for live availability. This site maintains
              its own schedule in <code>data/appointments.json</code>. After you get a push,
              enter the appointment in Booksy manually, then confirm it on the{" "}
              <Link href="/hub/appointments" className="text-brass hover:underline">
                appointments admin
              </Link>{" "}
              page.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-charcoal/45">
          <Link href="/hub/sms-setup" className="text-brass hover:underline">
            SMS setup
          </Link>
          {" · "}
          <Link href="/hub/appointments" className="text-brass hover:underline">
            Appointments admin
          </Link>
          {" · "}
          <Link href="/hub/products" className="text-brass hover:underline">
            Retail products
          </Link>
          {" · "}
          <Link href="/admin/gallery" className="text-brass hover:underline">
            Gallery admin
          </Link>
          {" · "}
          <Link href="/hub/analytics" className="text-brass hover:underline">
            Analytics
          </Link>
        </div>
      </div>
    </section>
  );
}
