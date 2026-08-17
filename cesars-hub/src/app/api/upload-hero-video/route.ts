import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { HERO_VIDEOS } from "@/lib/gallery";
import {
  MAX_HERO_VIDEO_BYTES,
  checkAdminUploadKey,
  getHeroVideoFile,
  parseHeroVideoSlot,
  writeHeroVideoVersion,
} from "@/lib/hero-video";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const ALLOWED_MIME_PREFIX = "video/";

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export async function POST(request: NextRequest) {
  const urlKey = request.nextUrl.searchParams.get("key");
  const urlSlot = parseHeroVideoSlot(request.nextUrl.searchParams.get("slot"));

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const formKey = formData.get("key");
  const providedKey =
    typeof urlKey === "string" && urlKey
      ? urlKey
      : typeof formKey === "string"
        ? formKey
        : null;

  if (!checkAdminUploadKey(providedKey)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formSlot = parseHeroVideoSlot(
    typeof formData.get("slot") === "string" ? String(formData.get("slot")) : null,
  );
  const slot = urlSlot ?? formSlot ?? 1;

  const slotConfig = HERO_VIDEOS.find((entry) => entry.slot === slot);
  if (!slotConfig) {
    return NextResponse.json({ error: "Invalid slot. Use 1, 2, or 3." }, { status: 400 });
  }

  const file = formData.get("video");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing video file." }, { status: 400 });
  }

  if (!file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    return NextResponse.json(
      { error: "Invalid file type. Upload an MP4, WebM, or MOV video." },
      { status: 400 },
    );
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      { error: "Invalid file extension. Use .mp4, .webm, or .mov." },
      { status: 400 },
    );
  }

  if (file.size > MAX_HERO_VIDEO_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 50 MB." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const targetFile = getHeroVideoFile(slot);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    const version = Date.now();
    writeHeroVideoVersion(version, slot);

    return NextResponse.json({
      success: true,
      slot,
      path: slotConfig.src,
      version,
    });
  } catch (error) {
    console.error("Hero video upload failed:", error);
    return NextResponse.json(
      { error: "Failed to save video. Check server logs." },
      { status: 500 },
    );
  }
}
