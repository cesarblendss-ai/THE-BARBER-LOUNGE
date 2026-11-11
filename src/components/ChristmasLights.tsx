"use client";

import type { CSSProperties } from "react";

/**
 * Decorative Christmas light string for public pages.
 * Pure CSS bulbs — no images, light motion, barbershop-appropriate.
 */
const BULB_COLORS = [
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
  "var(--light-red)",
  "var(--light-green)",
  "var(--light-warm)",
] as const;

export function ChristmasLights({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-[60] overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="christmas-wire mx-auto flex max-w-7xl items-start justify-between px-2 pt-1 sm:px-4">
        {BULB_COLORS.map((color, i) => (
          <span
            key={i}
            className="christmas-bulb"
            style={
              {
                "--bulb": color,
                animationDelay: `${(i % 7) * 0.22}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
