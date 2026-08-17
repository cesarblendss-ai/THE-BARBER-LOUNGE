import fs from "fs";
import path from "path";

import { SERVICE_HAIRCUT_BEARD, SERVICE_REGULAR } from "./content";
import { getPublicDir } from "./repo-paths";
import { withGalleryCacheBust } from "./gallery-admin";
import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_ORDER,
  GALLERY_GENERAL,
  GALLERY_UPLOAD_PREFIX,
  SERVICE_GALLERIES,
  type GalleryCategoryId,
  type GalleryImage,
  type GalleryGridSlot,
} from "./gallery";

const GALLERY_DIR = path.join(getPublicDir(), "gallery");

const SKIP_FILENAMES = new Set([
  "gallery-version.json",
  "hero-video-version.json",
  "README.md",
]);

const LEGACY_CATEGORY: Record<string, GalleryCategoryId> = {
  "hero-interior.png": "general",
  "skin-fade-closeup.png": "signatureHaircut",
  "haircut-beard-service.png": "signatureHaircutBeard",
  "razor-lineup.png": "general",
};

function resolveGalleryImage(image: GalleryImage): GalleryImage {
  return {
    ...image,
    src: withGalleryCacheBust(image.src, image.filename),
  };
}

function isGalleryImageFile(filename: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(filename) && !SKIP_FILENAMES.has(filename);
}

function categorizeFilename(filename: string): GalleryCategoryId {
  if (filename.startsWith(GALLERY_UPLOAD_PREFIX.signatureHaircut)) return "signatureHaircut";
  if (filename.startsWith(GALLERY_UPLOAD_PREFIX.signatureHaircutBeard)) {
    return "signatureHaircutBeard";
  }
  if (filename.startsWith(GALLERY_UPLOAD_PREFIX.kids)) return "kids";
  if (filename.startsWith(GALLERY_UPLOAD_PREFIX.general)) return "general";
  return LEGACY_CATEGORY[filename] ?? "general";
}

function altFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return `${base} at The Barber Lounge barbershop in Antioch, CA`;
}

function sortFilenames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function buildRegisteredLookup(): Map<string, GalleryImage> {
  const lookup = new Map<string, GalleryImage>();
  for (const category of GALLERY_CATEGORY_ORDER) {
    for (const image of GALLERY_CATEGORIES[category]) {
      lookup.set(image.filename, image);
    }
  }
  return lookup;
}

/** All image files on disk in public/gallery/, merged with registered metadata when available. */
export function discoverGalleryImages(): GalleryImage[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];

  const registered = buildRegisteredLookup();
  const filenames = fs
    .readdirSync(GALLERY_DIR)
    .filter(isGalleryImageFile)
    .sort(sortFilenames);

  return filenames.map((filename) => {
    const registeredImage = registered.get(filename);
    if (registeredImage) return resolveGalleryImage(registeredImage);

    return resolveGalleryImage({
      filename,
      src: `/gallery/${filename}`,
      alt: altFromFilename(filename),
    });
  });
}

export function discoverImagesByCategory(category: GalleryCategoryId): GalleryImage[] {
  return discoverGalleryImages().filter(
    (image) => categorizeFilename(image.filename) === category,
  );
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
  const registered = filterExistingImages(GALLERY_CATEGORIES[category]);
  const discovered = discoverImagesByCategory(category);
  const seen = new Set<string>();
  const merged: GalleryImage[] = [];

  for (const image of [...registered, ...discovered]) {
    if (seen.has(image.filename)) continue;
    seen.add(image.filename);
    merged.push(image);
  }

  return merged.sort((a, b) => sortFilenames(a.filename, b.filename));
}

export function getResolvedServiceGalleries(): Record<
  keyof typeof SERVICE_GALLERIES,
  GalleryImage[]
> {
  return {
    [SERVICE_REGULAR]: getExistingImagesByCategory("signatureHaircut"),
    [SERVICE_HAIRCUT_BEARD]: getExistingImagesByCategory("signatureHaircutBeard"),
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
    images: getExistingImagesByCategory(id),
  })).filter((section) => section.images.length > 0);
}

export function getResolvedGeneralGallery(): GalleryImage[] {
  const registered = filterExistingImages(GALLERY_GENERAL);
  const discovered = discoverImagesByCategory("general");
  const seen = new Set<string>();
  const merged: GalleryImage[] = [];

  for (const image of [...registered, ...discovered]) {
    if (seen.has(image.filename)) continue;
    seen.add(image.filename);
    merged.push(image);
  }

  return merged.sort((a, b) => sortFilenames(a.filename, b.filename));
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
  return discoverGalleryImages();
}

export function listGalleryFilenames(): string[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((name) => isGalleryImageFile(name))
    .sort(sortFilenames);
}
