"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type DragEvent } from "react";

import type { GalleryCategoryId } from "@/lib/gallery";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type GalleryUploadProps = {
  category: GalleryCategoryId;
  label: string;
  prefix: string;
  existingCount: number;
  authRequired: boolean;
  authKey?: string;
};

type UploadState = "idle" | "uploading" | "success" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GalleryUpload({
  category,
  label,
  prefix,
  existingCount,
  authRequired,
  authKey: initialAuthKey,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [authKey, setAuthKey] = useState(initialAuthKey ?? "");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const validateFile = useCallback((nextFile: File): string | null => {
    if (!nextFile.type.startsWith("image/")) {
      return "Please choose a JPG, PNG, or WebP image.";
    }
    if (nextFile.size > MAX_BYTES) {
      return `File is too large (${formatBytes(nextFile.size)}). Maximum is 10 MB.`;
    }
    return null;
  }, []);

  const selectFile = useCallback(
    (nextFile: File | null) => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      if (!nextFile) {
        setFile(null);
        setMessage(null);
        return;
      }

      const error = validateFile(nextFile);
      if (error) {
        setFile(null);
        setMessage(error);
        setUploadState("error");
        return;
      }

      setFile(nextFile);
      setMessage(null);
      setUploadState("idle");
      setLocalPreviewUrl(URL.createObjectURL(nextFile));
    },
    [localPreviewUrl, validateFile],
  );

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Choose an image first.");
      setUploadState("error");
      return;
    }

    if (authRequired && !authKey.trim()) {
      setMessage("Enter the upload key to continue.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    setMessage(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    if (authKey.trim()) {
      formData.append("key", authKey.trim());
    }

    const params = new URLSearchParams({ category });
    if (authKey.trim()) {
      params.set("key", authKey.trim());
    }

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/upload-gallery?${params.toString()}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText) as {
            success?: boolean;
            filename?: string;
            path?: string;
            version?: number;
            error?: string;
          };

          if (xhr.status >= 200 && xhr.status < 300 && response.success && response.filename) {
            setUploadState("success");
            setLastFilename(response.filename);
            const previewPath = response.version && response.path
              ? `${response.path}?v=${response.version}`
              : response.path;
            setMessage(
              `Saved as ${response.filename}${previewPath ? ` (${previewPath})` : ""}. Refresh the gallery page to see the update.`,
            );
            setFile(null);
            if (localPreviewUrl) {
              URL.revokeObjectURL(localPreviewUrl);
              setLocalPreviewUrl(null);
            }
            resolve();
            return;
          }

          setUploadState("error");
          setMessage(response.error ?? "Upload failed.");
          resolve();
        } catch {
          setUploadState("error");
          setMessage("Upload failed.");
          resolve();
        }
      };

      xhr.onerror = () => {
        setUploadState("error");
        setMessage("Network error during upload.");
        resolve();
      };

      xhr.send(formData);
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
      <div>
        <p className="section-label text-brass">{label}</p>
        <p className="mt-2 text-sm text-charcoal/70">
          {existingCount} file{existingCount === 1 ? "" : "s"} in{" "}
          <code className="text-charcoal/80">{prefix}*</code>
        </p>
        {localPreviewUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-charcoal/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={localPreviewUrl} alt="Upload preview" className="aspect-[4/3] w-full object-cover" />
          </div>
        ) : null}
      </div>

      {authRequired && !initialAuthKey ? (
        <div>
          <label htmlFor={`gallery-key-${category}`} className="section-label text-brass">
            Upload key
          </label>
          <input
            id={`gallery-key-${category}`}
            type="password"
            value={authKey}
            onChange={(event) => setAuthKey(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_KEY"
            className="mt-3 w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-3 text-sm text-charcoal outline-none ring-brass focus:ring-2"
          />
        </div>
      ) : null}

      <div>
        <p className="text-sm text-charcoal/70">
          JPG, PNG, or WebP — max ~10 MB. Next available slot is auto-assigned.
        </p>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragActive
              ? "border-brass bg-brass/5"
              : "border-charcoal/20 bg-bone hover:border-brass/60"
          }`}
        >
          <p className="font-serif text-base text-charcoal">Drop image here</p>
          <p className="mt-1 text-xs text-charcoal/60">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          />
        </div>

        {file ? (
          <p className="mt-3 text-sm text-charcoal/70">
            Selected: <span className="font-medium text-charcoal">{file.name}</span> (
            {formatBytes(file.size)})
          </p>
        ) : null}

        {uploadState === "uploading" ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-charcoal/10">
              <div
                className="h-full rounded-full bg-brass transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-charcoal/60">Uploading… {progress}%</p>
          </div>
        ) : null}

        {message ? (
          <p
            className={`mt-3 text-sm ${
              uploadState === "success" ? "text-charcoal" : "text-burgundy"
            }`}
          >
            {message}
          </p>
        ) : null}

        {lastFilename ? (
          <p className="mt-2 text-xs text-charcoal/45">
            Saved to <code className="text-charcoal/60">public/gallery/{lastFilename}</code>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploadState === "uploading"}
            className="inline-flex items-center justify-center rounded-full bg-brass px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-bone transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadState === "uploading" ? "Uploading…" : `Upload to ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryUploadFooter() {
  return (
    <div className="mt-8 space-y-2 text-center text-xs text-charcoal/45">
      <p>
        After uploading, add or update the matching entry in{" "}
        <code className="text-charcoal/60">src/lib/gallery.ts</code> with descriptive alt text.
      </p>
      <p>
        <Link href="/services" className="text-brass hover:underline">
          Services page
        </Link>
        {" · "}
        <Link href="/admin/hero" className="text-brass hover:underline">
          Hero videos admin
        </Link>
        {" · "}
        <Link href="/admin/edit" className="text-brass hover:underline">
          Edit site text
        </Link>
        {" · "}
        <Link href="/" className="text-brass hover:underline">
          Homepage
        </Link>
      </p>
    </div>
  );
}
