import fs from "fs";
import path from "path";

import { HERO_VIDEOS, type HeroVideoSlot } from "./gallery";

const GALLERY_DIR = path.join(process.cwd(), "public/gallery");
const LEGACY_HERO_VIDEO_FILE = path.join(GALLERY_DIR, "hero-video.mp4");
const VERSION_FILE = path.join(GALLERY_DIR, "hero-video-version.json");

export const MAX_HERO_VIDEO_BYTES = 50 * 1024 * 1024;

export type HeroVideoSlotNumber = HeroVideoSlot["slot"];

type HeroVideoVersionData = {
  v?: number;
  slots?: Partial<Record<`${HeroVideoSlotNumber}`, number>>;
};

export function getHeroVideoFile(slot: HeroVideoSlotNumber = 1): string {
  const config = HERO_VIDEOS.find((entry) => entry.slot === slot);
  if (!config) {
    throw new Error(`Invalid hero video slot: ${slot}`);
  }
  return path.join(GALLERY_DIR, config.filename);
}

/** @deprecated Use getHeroVideoFile(1) */
export const HERO_VIDEO_FILE = getHeroVideoFile(1);

export function withHeroVideoCacheBust(
  src: string,
  version?: number,
  slot?: HeroVideoSlotNumber,
): string {
  const v = version ?? getHeroVideoVersion(slot);
  return v ? `${src}?v=${v}` : src;
}

function readVersionData(): HeroVideoVersionData {
  try {
    if (!fs.existsSync(VERSION_FILE)) return {};
    return JSON.parse(fs.readFileSync(VERSION_FILE, "utf-8")) as HeroVideoVersionData;
  } catch {
    return {};
  }
}

export function getHeroVideoVersion(slot?: HeroVideoSlotNumber): number | undefined {
  const data = readVersionData();

  if (slot) {
    const slotVersion = data.slots?.[`${slot}`];
    if (typeof slotVersion === "number") return slotVersion;
  }

  return typeof data.v === "number" ? data.v : undefined;
}

export function writeHeroVideoVersion(version: number, slot?: HeroVideoSlotNumber): void {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });

  const data = readVersionData();
  const slots: Partial<Record<`${HeroVideoSlotNumber}`, number>> = {
    ...(data.slots ?? {}),
  };

  if (slot) {
    slots[`${slot}`] = version;
  } else {
    slots["1"] = version;
    slots["2"] = version;
    slots["3"] = version;
  }

  fs.writeFileSync(
    VERSION_FILE,
    JSON.stringify({
      v: version,
      slots,
    }),
  );
}

export function heroVideoExists(slot: HeroVideoSlotNumber = 1): boolean {
  return fs.existsSync(getHeroVideoFile(slot));
}

export function ensureHeroVideoPlaceholders(): void {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });

  const legacyExists = fs.existsSync(LEGACY_HERO_VIDEO_FILE);
  const sourceFile =
    legacyExists
      ? LEGACY_HERO_VIDEO_FILE
      : HERO_VIDEOS.map(({ slot }) => getHeroVideoFile(slot)).find((file) => fs.existsSync(file));

  if (!sourceFile) return;

  for (const { slot } of HERO_VIDEOS) {
    const target = getHeroVideoFile(slot);
    if (!fs.existsSync(target)) {
      fs.copyFileSync(sourceFile, target);
    }
  }
}

export type HeroVideoPreview = {
  slot: HeroVideoSlotNumber;
  label: string;
  videoSrc: string;
  posterSrc: string;
  hasVideo: boolean;
  filename: string;
};

const SLOT_LABELS: Record<HeroVideoSlotNumber, string> = {
  1: "Video 1",
  2: "Video 2",
  3: "Video 3",
};

export function getHeroVideoPreviews(): HeroVideoPreview[] {
  ensureHeroVideoPlaceholders();

  return HERO_VIDEOS.map((entry) => {
    const version = getHeroVideoVersion(entry.slot);
    return {
      slot: entry.slot,
      label: SLOT_LABELS[entry.slot],
      hasVideo: heroVideoExists(entry.slot),
      videoSrc: withHeroVideoCacheBust(entry.src, version, entry.slot),
      posterSrc: entry.poster,
      filename: entry.filename,
    };
  });
}

/** @deprecated Use getHeroVideoPreviews()[0] */
export function getHeroVideoPreviewSrc(): {
  videoSrc: string;
  posterSrc: string;
  hasVideo: boolean;
} {
  const [preview] = getHeroVideoPreviews();
  return {
    hasVideo: preview.hasVideo,
    videoSrc: preview.videoSrc,
    posterSrc: preview.posterSrc,
  };
}

export function parseHeroVideoSlot(value: string | null | undefined): HeroVideoSlotNumber | null {
  if (value === "1" || value === "2" || value === "3") return Number(value) as HeroVideoSlotNumber;
  return null;
}

export function checkAdminUploadKey(providedKey: string | null | undefined): boolean {
  const requiredKey = process.env.ADMIN_UPLOAD_KEY;
  if (!requiredKey) return true;
  return providedKey === requiredKey;
}
