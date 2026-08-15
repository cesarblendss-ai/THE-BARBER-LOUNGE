import type { Metadata } from "next";
import Image from "next/image";

import { PrintButton } from "@/components/PrintButton";
import { LOGO } from "@/lib/constants";
import { SITE } from "@/lib/content";
import {
  getQrCodeImageUrl,
  getReviewLandingUrl,
  getReviewQrTargetUrl,
} from "@/lib/reviews";

export const metadata: Metadata = {
  title: `Review QR — ${SITE.name}`,
  description: "Printable in-shop QR card for Google reviews at The Barber Lounge, Antioch CA.",
  robots: { index: false, follow: false },
};

export default function ReviewQrPage() {
  const qrTarget = getReviewQrTargetUrl();
  const qrSrc = getQrCodeImageUrl(qrTarget, 320);
  const staffLink = getReviewLandingUrl();

  return (
    <>
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print-card { box-shadow: none !important; border: 1px solid #B08D57 !important; }
        }
      `}</style>

      <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="no-print mx-auto mb-10 max-w-md text-center">
          <h1 className="font-serif text-3xl font-semibold text-charcoal">In-shop review QR</h1>
          <p className="mt-3 text-sm text-charcoal/65">
            Print this card and place it at checkout or the mirror. Clients scan → leave a Google
            review.
          </p>
          <PrintButton className="mt-6 rounded-full border-2 border-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brass-dark transition-colors hover:bg-brass hover:text-bone" />
          <p className="mt-4 text-xs text-charcoal/50">
            Staff text link:{" "}
            <a href={staffLink} className="text-brass hover:underline">
              {staffLink}
            </a>
          </p>
        </div>

        <div className="mx-auto flex justify-center">
          <article
            className="print-card w-[340px] rounded-2xl border border-brass/30 bg-bone p-8 text-center shadow-md"
            aria-label="Printable Google review QR card"
          >
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={180}
              height={60}
              className="mx-auto h-auto w-[150px] object-contain"
            />
            <p className="mt-4 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-brass">
              Loved your cut?
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal">
              Scan to review us on Google
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
              {SITE.rating}★ · {SITE.reviewCount}+ reviews · Antioch
            </p>

            <div className="mx-auto mt-6 inline-block rounded-xl border border-charcoal/10 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code linking to Google review for The Barber Lounge"
                width={320}
                height={320}
                className="h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]"
              />
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-charcoal/50">
              {SITE.address}
              <br />
              {SITE.phone}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
