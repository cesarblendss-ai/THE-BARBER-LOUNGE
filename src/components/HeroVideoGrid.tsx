"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";

type HeroVideoItem = {
  src: string;
  alt: string;
};

type HeroVideoGridProps = {
  videos: HeroVideoItem[];
  ctaHref: string;
  ctaLabel?: string;
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
}: HeroVideoGridProps) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-bone sm:min-h-[80vh]" aria-label="Featured barbershop videos">
      <div className="absolute inset-0 grid grid-cols-3">
        {videos.map((video) => (
          <div key={video.src} className="relative h-full min-h-[70vh] sm:min-h-[80vh]">
            <HeroVideoCell {...video} />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 sm:min-h-[80vh]">
        <Button href={ctaHref} external size="lg" variant="glass">
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
