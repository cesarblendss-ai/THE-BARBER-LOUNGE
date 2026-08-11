import type { GalleryCategoryId } from "@/lib/gallery";
import type { GalleryClassificationConfidence } from "@/lib/gallery-classify";

export type GalleryUploadResponse = {
  success?: boolean;
  category?: GalleryCategoryId;
  filename?: string;
  path?: string;
  version?: number;
  error?: string;
};

export type GalleryClassifyResponse = {
  success?: boolean;
  category?: GalleryCategoryId;
  confidence?: GalleryClassificationConfidence;
  reason?: string;
  aiEnabled?: boolean;
  error?: string;
};

export async function postGalleryUpload(
  category: GalleryCategoryId,
  file: File,
  options?: { filename?: string; key?: string },
): Promise<GalleryUploadResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("category", category);
  if (options?.filename) formData.append("filename", options.filename);
  if (options?.key) formData.append("key", options.key);

  const params = new URLSearchParams({ category });
  if (options?.filename) params.set("filename", options.filename);
  if (options?.key) params.set("key", options.key);

  const res = await fetch(`/api/upload-gallery?${params.toString()}`, {
    method: "POST",
    body: formData,
  });

  return (await res.json()) as GalleryUploadResponse;
}

export async function postGalleryClassify(
  file: File,
  options?: { key?: string },
): Promise<GalleryClassifyResponse> {
  const formData = new FormData();
  formData.append("image", file);
  if (options?.key) formData.append("key", options.key);

  const params = new URLSearchParams();
  if (options?.key) params.set("key", options.key);

  const query = params.toString();
  const res = await fetch(`/api/classify-gallery${query ? `?${query}` : ""}`, {
    method: "POST",
    body: formData,
  });

  return (await res.json()) as GalleryClassifyResponse;
}

export async function getGalleryClassifyStatus(
  options?: { key?: string },
): Promise<{ aiEnabled: boolean }> {
  const params = new URLSearchParams();
  if (options?.key) params.set("key", options.key);

  const query = params.toString();
  const res = await fetch(`/api/classify-gallery${query ? `?${query}` : ""}`);
  const data = (await res.json()) as { aiEnabled?: boolean };
  return { aiEnabled: Boolean(data.aiEnabled) };
}

export function galleryPathWithVersion(path: string, version?: number): string {
  if (!version) return path;
  const base = path.split("?")[0];
  return `${base}?v=${version}`;
}
