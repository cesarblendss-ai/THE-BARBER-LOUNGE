"use client";

import { useState } from "react";
import { StarIcon } from "./icons";

type Quote = {
  quote: string;
  attribution: string;
};

type TestimonialCarouselProps = {
  quotes: Quote[];
};

export function TestimonialCarousel({ quotes }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const current = quotes[index];

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="flex justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-brass" />
        ))}
      </div>
      <blockquote
        aria-live="polite"
        className="mx-auto mt-6 min-h-[6.5rem] max-w-2xl font-serif text-lg leading-relaxed text-charcoal sm:min-h-[5.5rem] sm:text-xl lg:text-2xl"
      >
        &ldquo;{current.quote}&rdquo;
      </blockquote>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-charcoal/60">
        {current.attribution}
      </p>

      <div className="mt-8 flex items-center justify-center gap-4" aria-label="Testimonial navigation">
        <button
          type="button"
          onClick={() => setIndex((i) => (i === 0 ? quotes.length - 1 : i - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 text-charcoal transition-colors hover:border-brass hover:text-brass"
          aria-label="Previous testimonial"
        >
          ←
        </button>
        <div className="flex gap-2">
          {quotes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-brass" : "w-2 bg-charcoal/20"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => (i === quotes.length - 1 ? 0 : i + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 text-charcoal transition-colors hover:border-brass hover:text-brass"
          aria-label="Next testimonial"
        >
          →
        </button>
      </div>
    </div>
  );
}
