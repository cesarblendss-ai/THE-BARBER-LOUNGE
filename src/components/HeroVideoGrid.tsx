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

    video.defaultPlaybackRate = 1;
    video.playbackRate = 1;
    video.load();
    void video.play().catch(() => {
      // Autoplay may be deferred by the browser; background shows until frames render.
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
      id="work"
      className="relative min-h-[70vh] overflow-hidden bg-black sm:min-h-[80vh]"
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[70vh] flex-col justify-end px-4 pb-10 pt-20 sm:min-h-[80vh] sm:pb-12">
        <div className="mx-auto w-full max-w-md text-center">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {headline}
          </h2>
          <div className="pointer-events-auto mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              href={ctaHref}
              external
              size="lg"
              variant="primary"
              className="w-full shadow-lg sm:w-auto"
              analyticsLabel="Book Now (videos)"
            >
              {bookLabel}
            </Button>
            <a
              href={`tel:${SITE.phoneTel}`}
              data-analytics-label="Call Now (videos)"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-white/70 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-auto"
            >
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
