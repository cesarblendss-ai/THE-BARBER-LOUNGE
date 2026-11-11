import type { Metadata } from "next";
import Link from "next/link";

import { LegalDoc, LegalH2, LegalP, LegalUl } from "@/components/LegalDoc";
import { SITE } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms for using The Barber Lounge website, booking tools, and Google business messaging in Antioch, CA.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDoc label="Legal" title="Terms of Service" updated="November 7, 2026">
      <LegalP>
        These Terms of Service (“Terms”) govern your use of {SITE.name}’s website
        (thebarberloungeca.com), online booking tools, and business messaging (including Google /
        RCS). By using our site or messaging us, you agree to these Terms.
      </LegalP>

      <div className="space-y-3">
        <LegalH2>The shop</LegalH2>
        <LegalP>
          {SITE.name} is a barbershop at {SITE.address}. Phone: {SITE.phone}. Email:{" "}
          <a href={`mailto:${SITE.email}`} className="text-holly hover:underline">
            {SITE.email}
          </a>
          .
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Services and prices</LegalH2>
        <LegalP>
          Public bookable services on our site are Signature Haircut ($50) and Haircut &amp; Beard
          ($65), unless we post a different price. Hours, availability, and barber schedules can
          change. The website shows openings when available; Booksy or a phone confirmation may
          still be required to lock in your appointment.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Booking requests</LegalH2>
        <LegalUl>
          <li>
            Submitting a request on our site or through messaging is a <strong className="text-charcoal">request</strong>, not a
            guaranteed appointment until the shop or Booksy confirms it.
          </li>
          <li>
            You agree to provide accurate name and phone information so we can reach you.
          </li>
          <li>
            We may send you to Booksy to finish booking. Booksy’s own terms apply when you use their
            product.
          </li>
          <li>
            Walk-ins and phone bookings follow the same shop rules for courtesy, late arrivals, and
            cancellations that our team communicates at the time of booking.
          </li>
        </LegalUl>
      </div>

      <div className="space-y-3">
        <LegalH2>Messages</LegalH2>
        <LegalP>
          If you message us on Google Business Messaging / RCS or opt in to SMS, you agree we may
          reply about your appointment, hours, location, and related shop questions. Marketing
          messages require your opt-in. Message and data rates may apply.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Acceptable use</LegalH2>
        <LegalP>
          Don’t misuse the site or messaging channels — no spam, harassment, scraping that harms the
          service, or attempts to break security. We may refuse service or block access when needed
          to protect the shop or other guests.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Website content</LegalH2>
        <LegalP>
          Photos, copy, and branding on this site belong to {SITE.name} or our licensors. You may
          browse for personal use. Don’t copy the site for a competing business without permission.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Disclaimer</LegalH2>
        <LegalP>
          The site and messaging tools are provided “as is.” We work to keep information accurate
          (hours, prices, openings), but availability and third-party services (Booksy, maps,
          messaging networks) can fail or change. To the fullest extent allowed by law, we are not
          liable for indirect or consequential damages from use of the site or messaging.
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Privacy</LegalH2>
        <LegalP>
          How we handle personal information is described in our{" "}
          <Link href="/privacy" className="text-holly hover:underline">
            Privacy Policy
          </Link>
          .
        </LegalP>
      </div>

      <div className="space-y-3">
        <LegalH2>Changes</LegalH2>
        <LegalP>
          We may update these Terms. The “Last updated” date will change when we do. Continued use
          of the site or messaging after an update means you accept the new Terms.
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
        </LegalP>
      </div>
    </LegalDoc>
  );
}
