"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { SITE } from "@/lib/content";

type HeroVideoItem = {
  src: string;
  alt: string;
};

type HeroVideoGridProps = {
  videos: HeroVideoItem[];
  ctaHref: string;
  ctaLabel?: string;
  headline?: string;
};

function HeroVideoCell({ src, alt }: HeroVideoItem) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);

    const video = videoRef.current;
    if (!video) return;

    video.load();
    void video.play().catch(() => {
      // Autoplay may be deferred by the browser; beige background shows until frames render.
    });
  }, [src]);

  if (failed) {
    return <div className="h-full w-full bg-bone" aria-label={alt} />;
  }

  return (
    <div className="relative h-full w-full bg-bone">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

export function HeroVideoGrid({
  videos,
  ctaHref,
  ctaLabel = "Book Now",
  headline = "Sharp Cuts. Zero Compromise.",
}: HeroVideoGridProps) {
  const bookLabel = ctaLabel.toLowerCase().includes("book") ? "Book Now" : ctaLabel;

  return (
    <section
      className="relative min-h-[70vh] overflow-hidden bg-charcoal sm:min-h-[80vh]"
      aria-label="Featured barbershop videos"
    >
      <div className="absolute inset-0 grid grid-cols-3">
        {videos.map((video) => (
          <div key={video.src} className="relative h-full min-h-[70vh] sm:min-h-[80vh]">
            <HeroVideoCell {...video} />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/45 to-charcoal/15"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[70vh] flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[80vh] sm:pb-10">
        <div className="mx-auto w-full max-w-md text-center">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-bone sm:text-4xl">
            {headline}
          </h1>
          <p className="mt-2 text-sm leading-snug text-bone/85 sm:text-base">
            Antioch · By appointment &amp; walk-in
          </p>
          <p className="mt-1 text-xs text-bone/55">{SITE.address}</p>

          <div className="pointer-events-auto mt-6 flex flex-col gap-3">
            <Button
              href={ctaHref}
              external
              size="lg"
              variant="primary"
              className="w-full shadow-lg"
              analyticsLabel="Book Now (hero)"
            >
              {bookLabel}
            </Button>
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call Now (hero)"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-bone bg-bone/15 px-6 py-4 text-base font-semibold text-bone backdrop-blur-sm transition-colors hover:bg-bone/25 active:scale-[0.98]"
            >
              Call {SITE.phone}
            </a>
          </div>

          <p className="mt-4 text-xs text-bone/75">
            {SITE.rating}★ · {SITE.reviewCount}+ reviews
          </p>
        </div>
      </div>
    </section>
  );
}
