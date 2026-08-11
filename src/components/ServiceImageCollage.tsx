import Image from "next/image";

import type { GalleryImage } from "@/lib/gallery";

type CollageLayout = "collage" | "strip";

type ServiceImageCollageProps = {
  images: GalleryImage[];
  className?: string;
  sizes?: string;
  layout?: CollageLayout;
};

export function ServiceImageCollage({
  images,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  layout = "collage",
}: ServiceImageCollageProps) {
  if (images.length === 0) return null;

  if (layout === "strip") {
    const visible = images.slice(0, 3);
    const count = visible.length;

    return (
      <div
        className={`grid aspect-[3/2] gap-1 overflow-hidden rounded-2xl ${count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-3"} ${className}`}
      >
        {visible.map((image, index) => (
          <div key={image.filename} className="relative min-h-0">
            <CollageImage image={image} sizes={sizes} priority={index === 0} />
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
      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
    />
  );
}
