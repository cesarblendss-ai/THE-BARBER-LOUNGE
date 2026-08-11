"use client";

import { useCallback, useState } from "react";

type CopyBlockProps = {
  code: string;
  label?: string;
};

export function CopyBlock({ code, label }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }, [code]);

  return (
    <div className="group relative">
      {label ? (
        <p className="mb-2 text-sm font-medium text-bone/70">{label}</p>
      ) : null}
      <div className="relative overflow-hidden rounded-xl border border-bone/15 bg-black/40">
        <pre className="overflow-x-auto p-4 pr-24 font-mono text-sm leading-relaxed text-bone sm:text-base">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-lg bg-brass px-3 py-1.5 text-xs font-semibold text-charcoal transition hover:bg-brass/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
