import { NextRequest, NextResponse } from "next/server";

import {
  classifyGalleryImage,
  isGalleryAiEnabled,
} from "@/lib/gallery-classify";
import { checkAdminUploadKey } from "@/lib/hero-video";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const urlKey = request.nextUrl.searchParams.get("key");
  if (!checkAdminUploadKey(urlKey)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ aiEnabled: isGalleryAiEnabled() });
}

export async function POST(request: NextRequest) {
  const urlKey = request.nextUrl.searchParams.get("key");

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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const classification = await classifyGalleryImage(buffer, file.type);

    return NextResponse.json({
      success: true,
      ...classification,
    });
  } catch (error) {
    console.error("Gallery classify failed:", error);
    return NextResponse.json(
      { error: "Failed to classify image. Check server logs." },
      { status: 500 },
    );
  }
}
