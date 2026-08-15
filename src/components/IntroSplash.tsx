"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { LOGO } from "@/lib/constants";

const INTRO_SEEN_KEY = "intro-seen";
const ZOOM_DURATION_MS = 1400;
const FADE_DURATION_MS = 850;
const TOTAL_DURATION_MS = ZOOM_DURATION_MS + FADE_DURATION_MS;

type IntroPhase = "idle" | "zoom" | "fade" | "done";

export function IntroSplash() {
  const [phase, setPhase] = useState<IntroPhase>("idle");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    // Skip splash on mobile — most IG/Google traffic; blocks tap-to-call/book for ~2s.
    if (reducedMotion || isMobile || sessionStorage.getItem(INTRO_SEEN_KEY)) {
      setPhase("done");
      return;
    }

    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    setPhase("zoom");

    const fadeTimer = window.setTimeout(() => setPhase("fade"), ZOOM_DURATION_MS);
    const doneTimer = window.setTimeout(() => setPhase("done"), TOTAL_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "idle" || phase === "done") return null;

  const isFading = phase === "fade";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bone transition-opacity ease-in-out"
      style={{
        opacity: isFading ? 0 : 1,
        transitionDuration: `${FADE_DURATION_MS}ms`,
      }}
      aria-hidden="true"
    >
      <div
        className="intro-splash-gradient pointer-events-none absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: isFading ? 1 : 0,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      />

      <Image
        src={LOGO.src}
        alt=""
        width={LOGO.width}
        height={LOGO.height}
        priority
        sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, 420px"
        className={`relative z-10 h-auto w-[280px] object-contain transition-opacity ease-in-out sm:w-[360px] md:w-[420px] ${
          phase === "zoom" ? "animate-intro-logo-zoom" : "intro-logo-settled"
        }`}
        style={{
          opacity: isFading ? 0 : undefined,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      />
    </div>
  );
}
