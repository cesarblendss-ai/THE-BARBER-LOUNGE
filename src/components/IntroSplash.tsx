"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { LOGO } from "@/lib/constants";

const INTRO_SEEN_KEY = "intro-seen";
const ZOOM_DURATION_MS = 1800;
const FADE_DURATION_MS = 700;
const TOTAL_DURATION_MS = ZOOM_DURATION_MS + FADE_DURATION_MS;

type IntroPhase = "idle" | "zoom" | "fade" | "done";

export function IntroSplash() {
  const [phase, setPhase] = useState<IntroPhase>("idle");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || sessionStorage.getItem(INTRO_SEEN_KEY)) {
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

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bone transition-opacity ease-out"
      style={{
        opacity: phase === "fade" ? 0 : 1,
        transitionDuration: `${FADE_DURATION_MS}ms`,
      }}
      aria-hidden="true"
    >
      <Image
        src={LOGO.src}
        alt=""
        width={LOGO.width}
        height={LOGO.height}
        priority
        sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, 420px"
        className={`h-auto w-[280px] object-contain sm:w-[360px] md:w-[420px] ${
          phase === "zoom" ? "animate-intro-logo-zoom" : ""
        }`}
      />
    </div>
  );
}
