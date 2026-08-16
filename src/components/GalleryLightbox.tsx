"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GalleryImage } from "@/lib/gallery";

type GalleryLightboxProps = {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
};

export function GalleryLightbox({ images, columns = 4 }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setActiveIndex(null);
    previouslyFocusedRef.current?.focus();
  }, []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const elements = Array.from(focusable);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, showNext, showPrev]);

  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <>
      <div className={`grid gap-3 sm:gap-4 ${gridCols}`}>
        {images.map((image, index) => (
          <button
            key={image.filename}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View enlarged: ${image.alt}`}
            className="group relative aspect-square overflow-hidden rounded-2xl"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery image: ${images[activeIndex].alt}`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-bone/10 px-3 py-1 text-sm text-bone hover:bg-bone/20"
            aria-label="Close gallery"
          >
            Close
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-bone/10 px-3 py-2 text-bone hover:bg-bone/20"
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-bone/10 px-3 py-2 text-bone hover:bg-bone/20"
            aria-label="Next image"
          >
            ›
          </button>

          <div
            className="relative h-[min(80vh,720px)] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <p className="absolute bottom-4 left-1/2 max-w-xl -translate-x-1/2 px-4 text-center text-sm text-bone/70">
            {images[activeIndex].alt}
          </p>
        </div>
      ) : null}
    </>
  );
}
