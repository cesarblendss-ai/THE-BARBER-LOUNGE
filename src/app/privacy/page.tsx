import type { Metadata } from "next";
import Link from "next/link";

import { LegalDoc, LegalH2, LegalP, LegalUl } from "@/components/LegalDoc";
import { SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How The Barber Lounge in Antioch, CA collects and uses contact and booking information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDoc label="Legal" title="Privacy Policy" updated="November 7, 2026">
      <LegalP>
        {SITE.name} (“we,” “us”) operates the website at thebarberloungeca.com and related booking
        tools for our barbershop at {SITE.address}. This policy explains what information we collect
        and how we use it when you visit our site, request an appointment, opt in to messages, or
        message us through Google / RCS business messaging.
      </LegalP>

      <div className="space-y-3">
        <LegalH2>Information we collect</LegalH2>
        <LegalUl>
          <li>
            <strong className="text-charcoal">Contact details</strong> you provide — name, phone
            number, and email (if you share one).
          </li>
          <li>
            <strong className="text-charcoal">Booking details</strong> — service, preferred barber,
            date/time, guest count, and notes you enter on our book flow.
          </li>
          <li>
            <strong className="text-charcoal">Message preferences</strong> — whether you opt in to
            SMS or email updates about appointments or shop news.
          </li>
          <li>
            <strong className="text-charcoal">Technical basics</strong> — standard web logs and
            analytics (for example Google Analytics) such as device type, pages viewed, and
            approximate location derived from IP. We do not use this to sell your identity.
          </li>
        </LegalUl>
      </div>

      <div className="space-y-3">
        <LegalH2>How we use it</LegalH2>
        <LegalUl>
          <li>Confirm and manage appointment requests.</li>
          <li>
            Hand you off to Booksy or call you back so a barber can finish your booking when needed.
          </li>
          <li>
            Send transactional messages about your request (and marketing texts/emails only if you
            opted in).
          </li>
          <li>Respond when you message the shop through Google Business Messaging / RCS.</li>
          <li>Improve the website and keep the shop running safely.</li>
        </LegalUl>
      </div>

      <div className="space-y-3">
        <LegalH2>Who we share with</LegalH2>
        <LegalP>
          We share information only as needed to run the shop — for example hosting (Vercel),
          database hosting, booking tools (Booksy), messaging providers (such as Twilio or Google),
          and analytics. We do <strong className="text-charcoal">not</strong> sell your personal
          information.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Texts and calls</LegalH2>
        <LegalP>
          If you give us your phone number for a booking or opt in to SMS, we (or our messaging
          providers) may text or call you about that request. Message and data rates may apply.
          Reply STOP to opt out of marketing texts where that option is offered. Transactional
          booking messages may still be needed to complete a request you started.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Cookies and analytics</LegalH2>
        <LegalP>
          Our site may use cookies or similar tools for basic function and traffic measurement
          (including Google Analytics when enabled). You can control cookies in your browser
          settings.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Retention</LegalH2>
        <LegalP>
          We keep booking and lead records as long as needed for the shop’s operations, legal
          duties, and dispute handling, then delete or anonymize them when they are no longer
          needed.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Your choices</LegalH2>
        <LegalP>
          To review, correct, or delete contact information we hold, or to ask a privacy question,
          email{" "}
          <a href={`mailto:${SITE.email}`} className="text-holly hover:underline">
            {SITE.email}
          </a>{" "}
          or call {SITE.phone}. California residents may have additional rights under the CCPA;
          contact us to make a request.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Kids</LegalH2>
        <LegalP>
          Our site is for adults booking haircuts (including for kids who come in with a guardian).
          We do not knowingly collect personal information online from children under 13 without a
          parent or guardian.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Changes</LegalH2>
        <LegalP>
          We may update this policy. The “Last updated” date at the top will change when we do. Keep
          using the site after an update means you accept the revised policy.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Contact</LegalH2>
        <LegalP>
          {SITE.name}
          <br />
          {SITE.address}
          <br />
          {SITE.phone}
          <br />
          <a href={`mailto:${SITE.email}`} className="text-holly hover:underline">
            {SITE.email}
          </a>
          <br />
          <Link href="/terms" className="text-holly hover:underline">
            Terms of Service
          </Link>
        </LegalP>
      </div>
    </LegalDoc>
  );
}
