import Image from "next/image";

import { GalleryGridSlotFilled } from "@/components/GalleryGridSlotFilled";
import { GallerySlotUpload } from "@/components/GallerySlotUpload";
import type { GalleryCategoryId, GalleryImage, GalleryGridSlot } from "@/lib/gallery";

export type GridSlot = GalleryGridSlot;

type CollageLayout = "collage" | "grid-3x3";

type ServiceImageCollageProps = {
  images: GalleryImage[];
  className?: string;
  sizes?: string;
  layout?: CollageLayout;
  gridSlots?: GridSlot[];
  uploadCategory?: GalleryCategoryId;
};

export function ServiceImageCollage({
  images,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  layout = "collage",
  gridSlots,
  uploadCategory,
}: ServiceImageCollageProps) {
  if (layout === "grid-3x3" && gridSlots && gridSlots.length > 0) {
    return (
      <div
        className={`grid aspect-square grid-cols-3 grid-rows-3 gap-1 overflow-hidden rounded-2xl ${className}`}
      >
        {gridSlots.map((slot, index) => (
          <div
            key={slot.definition.filename}
            className="relative aspect-square min-h-0 bg-charcoal/5"
          >
            {slot.filled && uploadCategory ? (
              <GalleryGridSlotFilled
                image={slot.definition}
                category={uploadCategory}
                sizes={sizes}
                priority={index === 0}
              />
            ) : slot.filled ? (
              <CollageImage
                image={slot.definition}
                sizes={sizes}
                priority={index === 0}
              />
            ) : uploadCategory ? (
              <GallerySlotUpload
                category={uploadCategory}
                filename={slot.definition.filename}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  if (layout === "grid-3x3") {
    const slots = Array.from({ length: 9 }, (_, i) => images[i] ?? null);

    return (
      <div
        className={`grid aspect-square grid-cols-3 grid-rows-3 gap-1 overflow-hidden rounded-2xl ${className}`}
      >
        {slots.map((image, index) => (
          <div
            key={image?.filename ?? `empty-${index}`}
            className="relative aspect-square min-h-0 bg-charcoal/5"
          >
            {image ? (
              <CollageImage image={image} sizes={sizes} priority={index === 0} />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  const count = Math.min(images.length, 4);
  const visible = images.slice(0, count);

  if (count === 1) {
    return (
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[3/4] ${className}`}
      >
        <CollageImage image={visible[0]} sizes={sizes} priority />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div
        className={`grid aspect-[4/5] grid-cols-2 gap-1 overflow-hidden rounded-2xl sm:aspect-[3/4] ${className}`}
      >
        {visible.map((image) => (
          <div key={image.filename} className="relative min-h-0">
            <CollageImage image={image} sizes={sizes} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid aspect-[4/5] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-2xl sm:aspect-[3/4] ${className}`}
    >
      {visible.map((image, index) => (
        <div
          key={image.filename}
          className={`relative min-h-0 ${count === 3 && index === 2 ? "col-span-2" : ""}`}
        >
          <CollageImage image={image} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}

function CollageImage({
  image,
  sizes,
  priority = false,
}: {
  image: GalleryImage;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}
