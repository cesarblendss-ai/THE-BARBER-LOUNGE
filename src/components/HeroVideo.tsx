"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FADE_DURATION_MS = 3000;
const MAX_WAIT_MS = 8000;

type HeroVideoProps = {
  src: string;
  alt: string;
};

export function HeroVideo({ src, alt }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const startFade = useCallback(() => {
    requestAnimationFrame(() => setFadeOut(true));
  }, []);

  useEffect(() => {
    setFailed(false);
    setFadeOut(false);

    const video = videoRef.current;
    if (!video) return;

    const markReady = () => startFade();

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.load();
    void video.play().catch(() => {
      // Autoplay can be deferred; black overlay stays until frames are ready.
    });

    const timeout = window.setTimeout(startFade, MAX_WAIT_MS);

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      window.clearTimeout(timeout);
    };
  }, [src, startFade]);

  if (failed) {
    return <div className="relative h-full w-full bg-charcoal" aria-label={alt} />;
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
          startFade();
        }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-charcoal transition-opacity ease-out"
        style={{
          opacity: fadeOut ? 0 : 1,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
        aria-hidden
      />
    </div>
  );
}
