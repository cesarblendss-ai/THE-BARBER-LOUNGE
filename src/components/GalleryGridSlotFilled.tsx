"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { GalleryCategoryId, GalleryImage } from "@/lib/gallery";
import {
  galleryPathWithVersion,
  postGalleryUpload,
} from "@/lib/gallery-upload-client";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type GalleryGridSlotFilledProps = {
  image: GalleryImage;
  category: GalleryCategoryId;
  sizes?: string;
  priority?: boolean;
};

export function GalleryGridSlotFilled({
  image,
  category,
  sizes = "(max-width: 768px) 33vw",
  priority = false,
}: GalleryGridSlotFilledProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [displaySrc, setDisplaySrc] = useState(image.src);
  const [removing, setRemoving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplaySrc(image.src);
  }, [image.src]);

  async function handleRemove() {
    if (!window.confirm("Remove this photo from the grid?")) return;

    setRemoving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/upload-gallery?category=${category}&filename=${encodeURIComponent(image.filename)}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not remove photo.");
        setRemoving(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not remove photo.");
      setRemoving(false);
    }
  }

  async function handleReplace(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max 10 MB.");
      return;
    }

    setReplacing(true);
    setError(null);

    try {
      const data = await postGalleryUpload(category, file, { filename: image.filename });

      if (!data.success) {
        setError(data.error ?? "Upload failed.");
        setReplacing(false);
        return;
      }

      if (data.path) {
        setDisplaySrc(galleryPathWithVersion(data.path, data.version));
      }

      setReplacing(false);
      router.refresh();
    } catch {
      setError("Upload failed.");
      setReplacing(false);
    }
  }

  const busy = removing || replacing;

  return (
    <div className="group/slot relative h-full w-full">
      <Image
        src={displaySrc}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <div className="absolute right-1 top-1 z-10 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/slot:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/75 text-[10px] font-bold text-bone shadow-sm backdrop-blur-sm transition-colors hover:bg-brass disabled:opacity-50"
          aria-label={`Replace ${image.filename}`}
          title="Replace photo"
        >
          {replacing ? "…" : "↻"}
        </button>
        <button
          type="button"
          onClick={() => void handleRemove()}
          disabled={busy}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/75 text-xs font-bold text-bone shadow-sm backdrop-blur-sm transition-colors hover:bg-burgundy disabled:opacity-50"
          aria-label={`Remove ${image.filename}`}
          title="Remove photo"
        >
          {removing ? "…" : "×"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleReplace(file);
          e.target.value = "";
        }}
      />
      {error ? (
        <p className="absolute bottom-0 left-0 right-0 bg-burgundy/90 px-1 py-0.5 text-center text-[9px] leading-tight text-bone">
          {error}
        </p>
      ) : null}
    </div>
  );
}
