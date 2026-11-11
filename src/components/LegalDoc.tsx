import Link from "next/link";
import type { ReactNode } from "react";

import { SectionLabel } from "@/components/SectionLabel";

type LegalDocProps = {
  label: string;
  title: string;
  updated: string;
  children: ReactNode;
};

/** Shared shell for public Terms / Privacy pages (Google Messaging, app store, etc.). */
export function LegalDoc({ label, title, updated, children }: LegalDocProps) {
  return (
    <>
      <section className="bg-bone px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>{label}</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-charcoal/55">Last updated: {updated}</p>
        </div>
      </section>

      <section className="bg-bone px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="prose-legal mx-auto max-w-3xl space-y-8 text-[15px] leading-relaxed text-charcoal/80">
          {children}
          <p className="border-t border-charcoal/10 pt-8 text-sm text-charcoal/55">
            Questions?{" "}
            <Link href="/contact" className="text-holly hover:underline">
              Contact the shop
            </Link>{" "}
            or call{" "}
            <a href="tel:+19252095995" className="text-holly hover:underline">
              (925) 209-5995
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">{children}</h2>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}
