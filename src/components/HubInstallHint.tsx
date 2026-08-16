"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hub-install-hint-dismissed";

function isStandaloneDisplay(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function HubInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || window.localStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-6 rounded-2xl border border-brass/40 bg-white px-4 py-4 text-left text-sm text-charcoal/80">
      <p className="font-sans text-xs font-semibold uppercase tracking-label text-brass">
        Put this on your phone
      </p>
      <p className="mt-2">
        Share → Add to Home Screen. After that, Cesar’s Hub opens like an app. Cursor is not
        required.
      </p>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="mt-3 text-xs font-semibold uppercase tracking-wider text-charcoal/50 hover:text-charcoal"
      >
        Got it
      </button>
    </div>
  );
}
