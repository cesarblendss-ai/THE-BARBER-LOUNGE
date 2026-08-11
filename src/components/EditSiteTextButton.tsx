"use client";

import Link from "next/link";

import { useEditMode } from "./EditModeProvider";

export function EditSiteTextButton() {
  const editMode = useEditMode();

  if (editMode) return null;

  return (
    <Link
      href="/admin/edit"
      className="fixed bottom-24 left-4 z-[55] inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-charcoal px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-brass shadow-lg transition-colors hover:border-brass hover:bg-charcoal/95 hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bone md:bottom-6"
      aria-label="Edit site text"
      title="Edit site text"
    >
      <span aria-hidden="true">✎</span>
      Edit
    </Link>
  );
}
