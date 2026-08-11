"use client";

import { useState } from "react";

import { EditableText } from "@/components/EditableText";
import type { FaqItem } from "@/lib/site-content-types";

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={`faq-${index}`}>
            <h2>
              <button
                type="button"
                id={`faq-trigger-${index}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-bone/50 focus-visible:outline-none"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <EditableText
                  path={`FAQ.${index}.q`}
                  defaultValue={item.q}
                  as="span"
                  className="font-serif text-lg font-semibold text-charcoal sm:text-xl"
                />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/60 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-bone" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current fill-none">
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-trigger-${index}`}
              hidden={!isOpen}
              className={isOpen ? "block" : "hidden"}
            >
              <p className="px-6 pb-5 text-base leading-relaxed text-charcoal/70">
                <EditableText
                  path={`FAQ.${index}.a`}
                  defaultValue={item.a}
                  as="span"
                  className="text-base leading-relaxed text-charcoal/70"
                  multiline
                />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
