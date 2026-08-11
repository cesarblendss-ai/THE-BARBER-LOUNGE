import fs from "fs";
import path from "path";

import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_ORDER,
  GALLERY_UPLOAD_PREFIX,
  type GalleryCategoryId,
} from "@/lib/gallery";

const GALLERY_DIR = path.join(process.cwd(), "public/gallery");
const VERSION_FILE = path.join(GALLERY_DIR, "gallery-version.json");

export const MAX_GALLERY_IMAGE_BYTES = 10 * 1024 * 1024;

type GalleryVersionData = {
  files?: Record<string, number>;
};

function readGalleryVersionData(): GalleryVersionData {
  try {
    if (!fs.existsSync(VERSION_FILE)) return {};
    return JSON.parse(fs.readFileSync(VERSION_FILE, "utf-8")) as GalleryVersionData;
  } catch {
    return {};
  }
}

export function getGalleryImageVersion(filename: string): number | undefined {
  const version = readGalleryVersionData().files?.[filename];
  if (typeof version === "number") return version;

  const filePath = path.join(GALLERY_DIR, filename);
  if (!fs.existsSync(filePath)) return undefined;

  try {
    return Math.floor(fs.statSync(filePath).mtimeMs);
  } catch {
    return undefined;
  }
}

export function writeGalleryImageVersion(filename: string, version: number): void {
  ensureGalleryDir();
  const data = readGalleryVersionData();
  const files = { ...(data.files ?? {}), [filename]: version };
  fs.writeFileSync(VERSION_FILE, JSON.stringify({ files }));
}

export function withGalleryCacheBust(src: string, filename: string): string {
  const version = getGalleryImageVersion(filename);
  if (!version) return src;
  const base = src.split("?")[0];
  return `${base}?v=${version}`;
}

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function parseGalleryCategory(
  value: string | null | undefined,
): GalleryCategoryId | null {
  if (
    value === "signatureHaircut" ||
    value === "signatureHaircutBeard" ||
    value === "kids" ||
    value === "general"
  ) {
    return value;
  }
  return null;
}

export function getGalleryCategoryLabel(category: GalleryCategoryId): string {
  return GALLERY_CATEGORY_LABELS[category];
}

export function getNextGalleryFilename(
  category: GalleryCategoryId,
  extension: string,
): string {
  const prefix = GALLERY_UPLOAD_PREFIX[category];
  const normalizedExt = extension.toLowerCase() === ".jpeg" ? ".jpg" : extension.toLowerCase();

  for (let slot = 1; slot <= 20; slot += 1) {
    const filename = `${prefix}${String(slot).padStart(2, "0")}${normalizedExt}`;
    if (!fs.existsSync(path.join(GALLERY_DIR, filename))) {
      return filename;
    }
  }

  const timestamp = Date.now();
  return `${prefix}${timestamp}${normalizedExt}`;
}

export function isAllowedGalleryFilename(
  category: GalleryCategoryId,
  filename: string,
): boolean {
  const allowed = GALLERY_CATEGORIES[category].some((img) => img.filename === filename);
  if (allowed) return true;
  const prefix = GALLERY_UPLOAD_PREFIX[category];
  return (
    filename.startsWith(prefix) &&
    /\.(jpe?g|png|webp)$/i.test(filename)
  );
}

export function getGalleryUploadPath(filename: string): string {
  return path.join(GALLERY_DIR, filename);
}

export function isAllowedGalleryExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.has(extension.toLowerCase());
}

export function ensureGalleryDir(): void {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

export type GalleryUploadPreview = {
  category: GalleryCategoryId;
  label: string;
  prefix: string;
  existingCount: number;
};

export function getGalleryUploadPreviews(): GalleryUploadPreview[] {
  ensureGalleryDir();
  const files = fs.readdirSync(GALLERY_DIR);

  const categories: GalleryCategoryId[] = [...GALLERY_CATEGORY_ORDER];

  return categories.map((category) => {
    const prefix = GALLERY_UPLOAD_PREFIX[category];
    const existingCount = files.filter((name) => name.startsWith(prefix)).length;

    return {
      category,
      label: getGalleryCategoryLabel(category),
      prefix,
      existingCount,
    };
  });
}
