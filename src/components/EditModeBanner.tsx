"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useEditMode } from "./EditModeProvider";

export function EditModeBanner() {
  const editMode = useEditMode();
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  if (!editMode) return null;

  async function exitEditMode() {
    setExiting(true);
    try {
      await fetch("/api/admin/edit-auth", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setExiting(false);
    }
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] flex max-w-lg -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border-2 border-brass/50 bg-charcoal px-5 py-3 text-center shadow-xl md:bottom-6 md:flex-row md:text-left">
      <span className="text-lg" aria-hidden="true">
        ✎
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-brass">Edit mode on</p>
        <p className="text-sm text-bone/90">Click any highlighted text or the ✎ button to edit</p>
      </div>
      <button
        type="button"
        onClick={() => void exitEditMode()}
        disabled={exiting}
        className="shrink-0 rounded-full border border-bone/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-bone/90 transition-colors hover:border-bone/45 hover:text-bone disabled:opacity-50"
      >
        {exiting ? "Exiting…" : "Exit"}
      </button>
    </div>
  );
}
