import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import {
  ensureGalleryDir,
  getGalleryUploadPath,
  getNextGalleryFilename,
  isAllowedGalleryExtension,
  isAllowedGalleryFilename,
  MAX_GALLERY_IMAGE_BYTES,
  parseGalleryCategory,
  writeGalleryImageVersion,
} from "@/lib/gallery-admin";
import { checkAdminUploadKey } from "@/lib/hero-video";

export const runtime = "nodejs";

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export async function POST(request: NextRequest) {
  const urlKey = request.nextUrl.searchParams.get("key");
  const urlCategory = parseGalleryCategory(request.nextUrl.searchParams.get("category"));

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

  const formCategory = parseGalleryCategory(
    typeof formData.get("category") === "string" ? String(formData.get("category")) : null,
  );
  const category = urlCategory ?? formCategory;

  if (!category) {
    return NextResponse.json(
      { error: "Invalid category. Use signatureHaircut, signatureHaircutBeard, kids, or general." },
      { status: 400 },
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Invalid file type. Upload a JPG, PNG, or WebP image." },
      { status: 400 },
    );
  }

  const extension = getExtension(file.name);
  if (!isAllowedGalleryExtension(extension)) {
    return NextResponse.json(
      { error: "Invalid file extension. Use .jpg, .jpeg, .png, or .webp." },
      { status: 400 },
    );
  }

  if (file.size > MAX_GALLERY_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 400 },
    );
  }

  try {
    ensureGalleryDir();

    const requestedFilename =
      typeof formData.get("filename") === "string"
        ? String(formData.get("filename"))
        : request.nextUrl.searchParams.get("filename");

    let filename: string;
    if (requestedFilename && isAllowedGalleryFilename(category, requestedFilename)) {
      filename = requestedFilename.replace(/\.jpeg$/i, ".jpg");
    } else {
      filename = getNextGalleryFilename(category, extension);
    }

    const targetFile = getGalleryUploadPath(filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetFile, buffer);

    const version = Date.now();
    writeGalleryImageVersion(filename, version);

    return NextResponse.json({
      success: true,
      category,
      filename,
      path: `/gallery/${filename}`,
      version,
    });
  } catch (error) {
    console.error("Gallery upload failed:", error);
    return NextResponse.json(
      { error: "Failed to save image. Check server logs." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const urlKey = request.nextUrl.searchParams.get("key");
  const providedKey = urlKey ?? null;

  if (!checkAdminUploadKey(providedKey)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const category = parseGalleryCategory(request.nextUrl.searchParams.get("category"));
  const filename = request.nextUrl.searchParams.get("filename");

  if (!category || !filename) {
    return NextResponse.json(
      { error: "Missing category or filename." },
      { status: 400 },
    );
  }

  if (!isAllowedGalleryFilename(category, filename)) {
    return NextResponse.json({ error: "Cannot remove this file." }, { status: 400 });
  }

  const targetFile = getGalleryUploadPath(filename);

  if (!fs.existsSync(targetFile)) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  try {
    fs.unlinkSync(targetFile);
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Gallery delete failed:", error);
    return NextResponse.json({ error: "Failed to remove image." }, { status: 500 });
  }
}
