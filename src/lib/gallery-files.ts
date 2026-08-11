import fs from "fs";
import path from "path";

import { withGalleryCacheBust } from "./gallery-admin";
import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_ORDER,
  GALLERY_GENERAL,
  SERVICE_GALLERIES,
  type GalleryCategoryId,
  type GalleryImage,
  type GalleryGridSlot,
} from "./gallery";

const GALLERY_DIR = path.join(process.cwd(), "public/gallery");

function resolveGalleryImage(image: GalleryImage): GalleryImage {
  return {
    ...image,
    src: withGalleryCacheBust(image.src, image.filename),
  };
}

export function galleryImageExists(filename: string): boolean {
  return fs.existsSync(path.join(GALLERY_DIR, filename));
}

export function filterExistingImages(images: GalleryImage[]): GalleryImage[] {
  return images
    .filter((image) => galleryImageExists(image.filename))
    .map(resolveGalleryImage);
}

export { resolveGalleryImage };

export function getExistingImagesByCategory(
  category: GalleryCategoryId,
): GalleryImage[] {
  return filterExistingImages(GALLERY_CATEGORIES[category]);
}

export function getResolvedServiceGalleries(): Record<
  keyof typeof SERVICE_GALLERIES,
  GalleryImage[]
> {
  return {
    "Signature Haircut": filterExistingImages(SERVICE_GALLERIES["Signature Haircut"]),
    "Signature Haircut & Beard": filterExistingImages(
      SERVICE_GALLERIES["Signature Haircut & Beard"],
    ),
  };
}

export function getResolvedGallerySections(): {
  id: GalleryCategoryId;
  label: string;
  images: GalleryImage[];
}[] {
  return GALLERY_CATEGORY_ORDER.map((id) => ({
    id,
    label: GALLERY_CATEGORY_LABELS[id],
    images: filterExistingImages(GALLERY_CATEGORIES[id]),
  })).filter((section) => section.images.length > 0);
}

export function getResolvedGeneralGallery(): GalleryImage[] {
  return filterExistingImages(GALLERY_GENERAL);
}

export type GridSlot = GalleryGridSlot;

/** Nine fixed slots for Signature Haircut 3×3 grid (upload targets empty cells). */
export function getSignatureHaircutGridSlots(): GalleryGridSlot[] {
  return GALLERY_CATEGORIES.signatureHaircut.slice(0, 9).map((definition) => ({
    definition: resolveGalleryImage(definition),
    filled: galleryImageExists(definition.filename),
  }));
}

/** Nine fixed slots for Signature Haircut & Beard 3×3 grid. */
export function getSignatureHaircutBeardGridSlots(): GalleryGridSlot[] {
  return GALLERY_CATEGORIES.signatureHaircutBeard.slice(0, 9).map((definition) => ({
    definition: resolveGalleryImage(definition),
    filled: galleryImageExists(definition.filename),
  }));
}

export function getResolvedAllGallery(): GalleryImage[] {
  const seen = new Set<string>();
  const all: GalleryImage[] = [];

  for (const category of GALLERY_CATEGORY_ORDER) {
    for (const image of filterExistingImages(GALLERY_CATEGORIES[category])) {
      if (seen.has(image.filename)) continue;
      seen.add(image.filename);
      all.push(image);
    }
  }

  return all;
}

export function listGalleryFilenames(): string[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
}
