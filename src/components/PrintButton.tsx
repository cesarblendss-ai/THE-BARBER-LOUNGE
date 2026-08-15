"use client";

export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "rounded-full border-2 border-brass px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brass-dark transition-colors hover:bg-brass hover:text-bone"
      }
    >
      Print card
    </button>
  );
}
