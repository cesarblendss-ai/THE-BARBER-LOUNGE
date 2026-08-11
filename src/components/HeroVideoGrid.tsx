"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";

const FADE_DURATION_MS = 3000;
const MAX_WAIT_MS = 8000;

type HeroVideoItem = {
  src: string;
  alt: string;
};

type HeroVideoGridProps = {
  videos: HeroVideoItem[];
  ctaHref: string;
  ctaLabel?: string;
};

type HeroVideoCellProps = HeroVideoItem & {
  onReady: () => void;
};

function HeroVideoCell({ src, alt, onReady }: HeroVideoCellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportedReady = useRef(false);
  const [failed, setFailed] = useState(false);

  const reportReady = useCallback(() => {
    if (reportedReady.current) return;
    reportedReady.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    reportedReady.current = false;
    setFailed(false);

    const video = videoRef.current;
    if (!video) return;

    const markReady = () => reportReady();

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.load();
    void video.play().catch(() => {
      // Autoplay can be deferred; black overlay stays until frames are ready.
    });

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, [src, reportReady]);

  if (failed) {
    return <div className="h-full w-full bg-charcoal" aria-label={alt} />;
  }

  return (
    <div className="relative h-full w-full bg-charcoal">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        onError={() => {
          setFailed(true);
          reportReady();
        }}
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
  const readyCountRef = useRef(0);
  const [fadeOut, setFadeOut] = useState(false);

  const handleCellReady = useCallback(() => {
    readyCountRef.current += 1;
    if (readyCountRef.current >= videos.length) {
      requestAnimationFrame(() => setFadeOut(true));
    }
  }, [videos.length]);

  useEffect(() => {
    readyCountRef.current = 0;
    setFadeOut(false);

    const timeout = window.setTimeout(() => {
      setFadeOut(true);
    }, MAX_WAIT_MS);

    return () => window.clearTimeout(timeout);
  }, [videos]);

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-charcoal sm:min-h-[80vh]" aria-label="Featured barbershop videos">
      <div className="absolute inset-0 grid grid-cols-3">
        {videos.map((video) => (
          <div key={video.src} className="relative h-full min-h-[70vh] sm:min-h-[80vh]">
            <HeroVideoCell {...video} onReady={handleCellReady} />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-charcoal/40" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-charcoal transition-opacity ease-out"
        style={{
          opacity: fadeOut ? 0 : 1,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 sm:min-h-[80vh]">
        <Button href={ctaHref} external size="lg" variant="glass">
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
