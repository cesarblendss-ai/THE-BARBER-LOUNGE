"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { GalleryCategoryId } from "@/lib/gallery";
import { postGalleryUpload } from "@/lib/gallery-upload-client";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type GallerySlotUploadProps = {
  category: GalleryCategoryId;
  filename: string;
  slotLabel?: string;
};

export function GallerySlotUpload({
  category,
  filename,
  slotLabel = "Add photo",
}: GallerySlotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max 10 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const data = await postGalleryUpload(category, file, { filename });

      if (!data.success) {
        setError(data.error ?? "Upload failed.");
        setUploading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Upload failed.");
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 border border-dashed border-charcoal/15 bg-bone/80 p-1 text-center transition-colors hover:border-brass/50 hover:bg-brass/5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex h-full w-full flex-col items-center justify-center gap-0.5 disabled:opacity-50"
        aria-label={`${slotLabel}: ${filename}`}
      >
        <span className="text-xl font-light leading-none text-brass">+</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-charcoal/45 sm:text-[10px]">
          {uploading ? "…" : "Add"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error ? (
        <p className="px-1 text-[9px] leading-tight text-burgundy">{error}</p>
      ) : (
        <Link
          href={`/admin/gallery?category=${category}`}
          className="text-[9px] text-charcoal/35 hover:text-brass sm:text-[10px]"
          onClick={(e) => e.stopPropagation()}
        >
          or admin
        </Link>
      )}
    </div>
  );
}
