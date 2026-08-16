import { SERVICE_HAIRCUT_BEARD, SERVICE_REGULAR } from "./content";

export type GalleryCategoryId =
  | "signatureHaircut"
  | "signatureHaircutBeard"
  | "kids"
  | "general";

export type GalleryImage = {
  src: string;
  alt: string;
  filename: string;
};

export type GalleryGridSlot = {
  definition: GalleryImage;
  filled: boolean;
};

export type HeroVideoSlot = {
  slot: 1 | 2 | 3;
  src: string;
  poster: string;
  alt: string;
  filename: string;
};

/** Section headings for the full gallery page */
export const GALLERY_CATEGORY_LABELS: Record<GalleryCategoryId, string> = {
  signatureHaircut: "Signature Cuts",
  signatureHaircutBeard: "Beard Work",
  kids: "Kids Cuts",
  general: "Shop & Team",
};

/** Primary featured images — used for about section, service cards, gallery, etc. */
export const GALLERY = {
  hero: {
    src: "/gallery/hero-interior.png",
    alt: "Client with a precision fade inside The Barber Lounge barbershop in Antioch, California",
    filename: "hero-interior.png",
  },
  signatureHaircut: {
    src: "/gallery/skin-fade-closeup.png",
    alt: "Close-up of a high skin fade with sharp line-up at The Barber Lounge",
    filename: "skin-fade-closeup.png",
  },
  signatureHaircutBeard: {
    src: "/gallery/haircut-beard-service.png",
    alt: "Client with a low skin fade and beard trim inside The Barber Lounge",
    filename: "haircut-beard-service.png",
  },
  razorLineup: {
    src: "/gallery/razor-lineup.png",
    alt: "Barber performing precision razor line-up edge work at The Barber Lounge",
    filename: "razor-lineup.png",
  },
} as const satisfies Record<string, GalleryImage>;

/**
 * All gallery images grouped by category.
 * Drop files into public/gallery/ using the filenames below — missing files are hidden automatically.
 */
export const GALLERY_CATEGORIES: Record<GalleryCategoryId, GalleryImage[]> = {
  signatureHaircut: [
    GALLERY.signatureHaircut,
    {
      src: "/gallery/signature-haircut-02.jpg",
      alt: "Precision fade haircut at The Barber Lounge in Antioch, CA",
      filename: "signature-haircut-02.jpg",
    },
    {
      src: "/gallery/signature-haircut-03.jpg",
      alt: "Clean taper and line-up at The Barber Lounge barbershop",
      filename: "signature-haircut-03.jpg",
    },
    {
      src: "/gallery/signature-haircut-04.jpg",
      alt: "Signature haircut with hot lather finish in Antioch, California",
      filename: "signature-haircut-04.jpg",
    },
    {
      src: "/gallery/signature-haircut-05.jpg",
      alt: "Modern fade styled at The Barber Lounge",
      filename: "signature-haircut-05.jpg",
    },
    {
      src: "/gallery/signature-haircut-06.jpg",
      alt: "Skin fade and line-up at The Barber Lounge in Antioch",
      filename: "signature-haircut-06.jpg",
    },
    {
      src: "/gallery/signature-haircut-07.jpg",
      alt: "Signature taper fade at The Barber Lounge barbershop",
      filename: "signature-haircut-07.jpg",
    },
    {
      src: "/gallery/signature-haircut-08.jpg",
      alt: "Fresh signature cut at The Barber Lounge, Antioch CA",
      filename: "signature-haircut-08.jpg",
    },
    {
      src: "/gallery/signature-haircut-09.jpg",
      alt: "Precision haircut finish at The Barber Lounge",
      filename: "signature-haircut-09.jpg",
    },
  ],
  signatureHaircutBeard: [
    GALLERY.signatureHaircutBeard,
    {
      src: "/gallery/signature-beard-01.jpg",
      alt: "Signature haircut and beard profile at The Barber Lounge in Antioch",
      filename: "signature-beard-01.jpg",
    },
    {
      src: "/gallery/signature-beard-06.jpg",
      alt: "Precision fade with beard sculpting at The Barber Lounge",
      filename: "signature-beard-06.jpg",
    },
    {
      src: "/gallery/signature-beard-02.jpg",
      alt: "Signature haircut and beard trim at The Barber Lounge in Antioch",
      filename: "signature-beard-02.jpg",
    },
    {
      src: "/gallery/signature-beard-03.jpg",
      alt: "Hot towel beard grooming with precision fade at The Barber Lounge",
      filename: "signature-beard-03.jpg",
    },
    {
      src: "/gallery/signature-beard-04.jpg",
      alt: "Beard line-up and fade combo at The Barber Lounge barbershop",
      filename: "signature-beard-04.jpg",
    },
    {
      src: "/gallery/signature-beard-05.jpg",
      alt: "Full signature haircut and beard service in Antioch, CA",
      filename: "signature-beard-05.jpg",
    },
    {
      src: "/gallery/signature-beard-07.jpg",
      alt: "Signature haircut and beard line-up in Antioch, CA",
      filename: "signature-beard-07.jpg",
    },
    {
      src: "/gallery/signature-beard-08.jpg",
      alt: "Hot towel beard finish with skin fade at The Barber Lounge",
      filename: "signature-beard-08.jpg",
    },
    {
      src: "/gallery/signature-beard-09.jpg",
      alt: "Complete signature haircut and beard service at The Barber Lounge",
      filename: "signature-beard-09.jpg",
    },
  ],
  kids: [
    {
      src: "/gallery/kids-01.jpg",
      alt: "Kids haircut at The Barber Lounge in Antioch, CA",
      filename: "kids-01.jpg",
    },
    {
      src: "/gallery/kids-02.jpg",
      alt: "Child fade and line-up at The Barber Lounge barbershop",
      filename: "kids-02.jpg",
    },
    {
      src: "/gallery/kids-03.jpg",
      alt: "Kid-friendly cut at The Barber Lounge in Antioch, California",
      filename: "kids-03.jpg",
    },
    {
      src: "/gallery/kids-04.jpg",
      alt: "Youth haircut with precision finish at The Barber Lounge",
      filename: "kids-04.jpg",
    },
    {
      src: "/gallery/kids-05.jpg",
      alt: "Kids cut in a welcoming barbershop environment in Antioch, CA",
      filename: "kids-05.jpg",
    },
    {
      src: "/gallery/kids-06.jpg",
      alt: "Fresh kids fade at The Barber Lounge barbershop",
      filename: "kids-06.jpg",
    },
    {
      src: "/gallery/kids-07.jpg",
      alt: "Young client haircut at The Barber Lounge in Antioch",
      filename: "kids-07.jpg",
    },
    {
      src: "/gallery/kids-08.jpg",
      alt: "Kids taper and style at The Barber Lounge, Antioch CA",
      filename: "kids-08.jpg",
    },
    {
      src: "/gallery/kids-09.jpg",
      alt: "Child haircut result at The Barber Lounge barbershop",
      filename: "kids-09.jpg",
    },
    {
      src: "/gallery/kids-10.jpg",
      alt: "Kids cuts at The Barber Lounge — Antioch's premier barbershop",
      filename: "kids-10.jpg",
    },
  ],
  general: [
    GALLERY.hero,
    GALLERY.razorLineup,
    {
      src: "/gallery/gallery-03.jpg",
      alt: "The Barber Lounge interior — upscale barbershop in Antioch, CA",
      filename: "gallery-03.jpg",
    },
    {
      src: "/gallery/gallery-04.jpg",
      alt: "Barber chair and shop atmosphere at The Barber Lounge",
      filename: "gallery-04.jpg",
    },
    {
      src: "/gallery/gallery-05.jpg",
      alt: "Precision barbering tools at The Barber Lounge",
      filename: "gallery-05.jpg",
    },
    {
      src: "/gallery/gallery-06.jpg",
      alt: "Client experience at The Barber Lounge in Antioch",
      filename: "gallery-06.jpg",
    },
    {
      src: "/gallery/gallery-07.jpg",
      alt: "The Barber Lounge team at work in Antioch, California",
      filename: "gallery-07.jpg",
    },
    {
      src: "/gallery/gallery-08.jpg",
      alt: "Fresh cut result at The Barber Lounge barbershop",
      filename: "gallery-08.jpg",
    },
    {
      src: "/gallery/gallery-09.jpg",
      alt: "Shop details and barbershop vibe at The Barber Lounge",
      filename: "gallery-09.jpg",
    },
    {
      src: "/gallery/gallery-10.jpg",
      alt: "The Barber Lounge — Antioch's premier barbershop experience",
      filename: "gallery-10.jpg",
    },
  ],
};

/** Service name → collage images for service cards */
export const SERVICE_GALLERIES = {
  [SERVICE_REGULAR]: GALLERY_CATEGORIES.signatureHaircut,
  [SERVICE_HAIRCUT_BEARD]: GALLERY_CATEGORIES.signatureHaircutBeard,
} as const;

/** All registered images across categories (deduped by filename) */
export const GALLERY_ALL: GalleryImage[] = dedupeByFilename([
  ...GALLERY_CATEGORIES.signatureHaircut,
  ...GALLERY_CATEGORIES.signatureHaircutBeard,
  ...GALLERY_CATEGORIES.kids,
  ...GALLERY_CATEGORIES.general,
]);

/** Homepage gallery teaser — general category only */
export const GALLERY_GENERAL = GALLERY_CATEGORIES.general;

/** @deprecated Use SERVICE_GALLERIES — kept for gradual migration */
export const SERVICE_IMAGES = {
  [SERVICE_REGULAR]: GALLERY.signatureHaircut,
  [SERVICE_HAIRCUT_BEARD]: GALLERY.signatureHaircutBeard,
} as const;

/**
 * Homepage hero videos — upload at /admin/hero or drop files in public/gallery/.
 * Poster paths are admin-preview fallbacks only; the live homepage uses a black fade-in.
 */
export const HERO_VIDEOS: HeroVideoSlot[] = [
  {
    slot: 1,
    src: "/gallery/hero-video-1.mp4",
    poster: GALLERY.hero.src,
    alt: "Hero video — The Barber Lounge barbershop in Antioch, California",
    filename: "hero-video-1.mp4",
  },
  {
    slot: 2,
    src: "/gallery/hero-video-2.mp4",
    poster: GALLERY.signatureHaircut.src,
    alt: "Signature haircut hero video at The Barber Lounge",
    filename: "hero-video-2.mp4",
  },
  {
    slot: 3,
    src: "/gallery/hero-video-3.mp4",
    poster: GALLERY.signatureHaircutBeard.src,
    alt: "Signature haircut and beard hero video at The Barber Lounge",
    filename: "hero-video-3.mp4",
  },
];

/** @deprecated Use HERO_VIDEOS[0] — kept for backward compatibility */
export const HERO_VIDEO = HERO_VIDEOS[0].src;
/** @deprecated Use HERO_VIDEOS[0].poster — kept for backward compatibility */
export const HERO_VIDEO_POSTER = HERO_VIDEOS[0].poster;

export const GALLERY_CATEGORY_ORDER: GalleryCategoryId[] = [
  "signatureHaircut",
  "signatureHaircutBeard",
  "kids",
  "general",
];

export const GALLERY_UPLOAD_PREFIX: Record<GalleryCategoryId, string> = {
  signatureHaircut: "signature-haircut-",
  signatureHaircutBeard: "signature-beard-",
  kids: "kids-",
  general: "gallery-",
};

function dedupeByFilename(images: GalleryImage[]): GalleryImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.filename)) return false;
    seen.add(image.filename);
    return true;
  });
}
