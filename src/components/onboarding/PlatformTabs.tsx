"use client";

import { useState, type ReactNode } from "react";

type Platform = "mac" | "windows";

type PlatformTabsProps = {
  mac: ReactNode;
  windows: ReactNode;
  defaultPlatform?: Platform;
};

export function PlatformTabs({ mac, windows, defaultPlatform = "mac" }: PlatformTabsProps) {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);

  return (
    <div>
      <div
        className="mb-4 inline-flex rounded-xl border border-bone/15 bg-black/30 p-1"
        role="tablist"
        aria-label="Choose your computer"
      >
        {(["mac", "windows"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={platform === key}
            onClick={() => setPlatform(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
              platform === key
                ? "bg-brass text-charcoal"
                : "text-bone/70 hover:text-bone"
            }`}
          >
            {key === "mac" ? "Mac" : "Windows"}
          </button>
        ))}
      </div>
      <div role="tabpanel">{platform === "mac" ? mac : windows}</div>
    </div>
  );
}
