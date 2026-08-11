"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type DragEvent } from "react";

import type { HeroVideoSlotNumber } from "@/lib/hero-video";

const ACCEPT = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";
const MAX_BYTES = 50 * 1024 * 1024;

type HeroVideoUploadProps = {
  slot: HeroVideoSlotNumber;
  label: string;
  initialVideoSrc: string;
  posterSrc: string;
  hasVideo: boolean;
  filename: string;
  authRequired: boolean;
  authKey?: string;
};

type UploadState = "idle" | "uploading" | "success" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HeroVideoUpload({
  slot,
  label,
  initialVideoSrc,
  posterSrc,
  hasVideo: initialHasVideo,
  filename,
  authRequired,
  authKey: initialAuthKey,
}: HeroVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState(initialVideoSrc);
  const [hasVideo, setHasVideo] = useState(initialHasVideo);
  const [authKey, setAuthKey] = useState(initialAuthKey ?? "");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const validateFile = useCallback((nextFile: File): string | null => {
    if (!nextFile.type.startsWith("video/")) {
      return "Please choose an MP4, WebM, or MOV video.";
    }
    if (nextFile.size > MAX_BYTES) {
      return `File is too large (${formatBytes(nextFile.size)}). Maximum is 50 MB.`;
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
      setMessage("Choose a video file first.");
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
    formData.append("video", file);
    formData.append("slot", String(slot));
    if (authKey.trim()) {
      formData.append("key", authKey.trim());
    }

    const params = new URLSearchParams({ slot: String(slot) });
    if (authKey.trim()) {
      params.set("key", authKey.trim());
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/upload-hero-video?${params.toString()}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText) as {
            success?: boolean;
            path?: string;
            version?: number;
            error?: string;
          };

          if (xhr.status >= 200 && xhr.status < 300 && response.success && response.path) {
            const nextSrc = response.version
              ? `${response.path}?v=${response.version}`
              : response.path;
            setPreviewSrc(nextSrc);
            setHasVideo(true);
            setUploadState("success");
            setMessage(`${label} updated. Refresh the homepage to see it live.`);
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
          reject(new Error(response.error ?? "Upload failed"));
        } catch {
          setUploadState("error");
          setMessage("Upload failed.");
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => {
        setUploadState("error");
        setMessage("Network error during upload.");
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    }).catch(() => undefined);
  }

  const previewVideoSrc = localPreviewUrl ?? previewSrc;

  return (
    <div className="space-y-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
      <div>
        <p className="section-label text-brass">{label}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal">
          {hasVideo || localPreviewUrl ? (
            <video
              key={previewVideoSrc}
              src={previewVideoSrc}
              poster={posterSrc}
              controls
              muted
              playsInline
              className="aspect-[9/16] w-full object-cover"
            />
          ) : (
            <div className="relative flex aspect-[9/16] w-full items-center justify-center bg-charcoal">
              <p className="px-4 text-center text-sm text-bone/70">
                No video yet — the homepage shows black until a clip is uploaded.
              </p>
            </div>
          )}
        </div>
      </div>

      {authRequired && !initialAuthKey ? (
        <div>
          <label htmlFor={`upload-key-${slot}`} className="section-label text-brass">
            Upload key
          </label>
          <input
            id={`upload-key-${slot}`}
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
          Portrait clip for column {slot}. MP4, WebM, or MOV — max ~50 MB.
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
          <p className="font-serif text-base text-charcoal">Drop video here</p>
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploadState === "uploading"}
            className="inline-flex items-center justify-center rounded-full bg-brass px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-bone transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadState === "uploading" ? "Uploading…" : `Upload ${label}`}
          </button>
        </div>
      </div>

      <p className="text-xs text-charcoal/45">
        Saves to <code className="text-charcoal/60">public/gallery/{filename}</code>
      </p>
    </div>
  );
}

export function HeroVideoUploadFooter() {
  return (
    <p className="mt-8 text-center text-xs text-charcoal/45">
      <Link href="/" className="text-brass hover:underline">
        View homepage
      </Link>
    </p>
  );
}
