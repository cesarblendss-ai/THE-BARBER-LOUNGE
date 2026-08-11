"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";

import {
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_ORDER,
  type GalleryCategoryId,
} from "@/lib/gallery";
import type { GalleryClassificationConfidence } from "@/lib/gallery-classify";
import {
  getGalleryClassifyStatus,
  postGalleryClassify,
  postGalleryUpload,
} from "@/lib/gallery-upload-client";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type BulkItemStatus = "pending" | "classifying" | "ready" | "uploading" | "done" | "error";

type BulkUploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: BulkItemStatus;
  category: GalleryCategoryId;
  confidence?: GalleryClassificationConfidence;
  reason?: string;
  aiEnabled?: boolean;
  savedFilename?: string;
  error?: string;
};

type GalleryBulkUploadProps = {
  authRequired: boolean;
  authKey?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Use JPG, PNG, or WebP.";
  }
  if (file.size > MAX_BYTES) {
    return `Max 10 MB (${formatBytes(file.size)}).`;
  }
  return null;
}

function confidenceBadge(confidence?: GalleryClassificationConfidence): string {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

export function GalleryBulkUpload({ authRequired, authKey: initialAuthKey }: GalleryBulkUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<BulkUploadItem[]>([]);

  const [items, setItems] = useState<BulkUploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [authKey, setAuthKey] = useState(initialAuthKey ?? "");
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"idle" | "classifying" | "uploading">("idle");
  const [banner, setBanner] = useState<string | null>(null);

  itemsRef.current = items;

  useEffect(() => {
    void getGalleryClassifyStatus({ key: authKey.trim() || undefined }).then((status) => {
      setAiEnabled(status.aiEnabled);
    });
  }, [authKey]);

  const updateItem = useCallback((id: string, patch: Partial<BulkUploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const classifyItem = useCallback(
    async (item: BulkUploadItem) => {
      updateItem(item.id, { status: "classifying", error: undefined });

      try {
        const result = await postGalleryClassify(item.file, {
          key: authKey.trim() || undefined,
        });

        if (!result.success || !result.category) {
          updateItem(item.id, {
            status: "ready",
            category: "signatureHaircut",
            error: result.error ?? "Classification failed — pick a category.",
            aiEnabled: false,
          });
          return;
        }

        updateItem(item.id, {
          status: "ready",
          category: result.category,
          confidence: result.confidence,
          reason: result.reason,
          aiEnabled: result.aiEnabled,
        });
      } catch {
        updateItem(item.id, {
          status: "ready",
          category: "signatureHaircut",
          error: "Classification failed — pick a category.",
          aiEnabled: false,
        });
      }
    },
    [authKey, updateItem],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      const valid: BulkUploadItem[] = [];
      const errors: string[] = [];

      for (const file of incoming) {
        const validationError = validateImageFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          continue;
        }

        valid.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
          category: "signatureHaircut",
        });
      }

      if (errors.length) {
        setBanner(errors.join(" "));
      } else {
        setBanner(null);
      }

      if (!valid.length) return;

      setItems((current) => [...current, ...valid]);

      if (authRequired && !authKey.trim()) {
        setBanner("Enter the upload key, then classify or upload.");
        return;
      }

      void (async () => {
        setPhase("classifying");
        for (const item of valid) {
          await classifyItem(item);
        }
        setPhase("idle");
      })();
    },
    [authKey, authRequired, classifyItem],
  );

  async function handleClassifyAll() {
    if (authRequired && !authKey.trim()) {
      setBanner("Enter the upload key to continue.");
      return;
    }

    const pending = itemsRef.current.filter(
      (item) => item.status === "pending" || item.status === "error",
    );
    if (!pending.length) return;

    setPhase("classifying");
    setBanner(null);

    for (const item of pending) {
      await classifyItem(item);
    }

    setPhase("idle");
  }

  async function handleUploadAll() {
    if (authRequired && !authKey.trim()) {
      setBanner("Enter the upload key to continue.");
      return;
    }

    const toUpload = itemsRef.current.filter((item) => item.status === "ready");
    if (!toUpload.length) {
      setBanner("Classify photos first, or fix any errors.");
      return;
    }

    setPhase("uploading");
    setBanner(null);

    for (const item of toUpload) {
      updateItem(item.id, { status: "uploading", error: undefined });

      try {
        const result = await postGalleryUpload(item.category, item.file, {
          key: authKey.trim() || undefined,
        });

        if (!result.success || !result.filename) {
          updateItem(item.id, {
            status: "error",
            error: result.error ?? "Upload failed.",
          });
          continue;
        }

        updateItem(item.id, {
          status: "done",
          savedFilename: result.filename,
        });
      } catch {
        updateItem(item.id, {
          status: "error",
          error: "Upload failed.",
        });
      }
    }

    setPhase("idle");
    router.refresh();
  }

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
    if (event.dataTransfer.files.length) {
      addFiles(event.dataTransfer.files);
    }
  }

  function clearCompleted() {
    setItems((current) => {
      const remaining = current.filter((item) => item.status !== "done");
      for (const removed of current) {
        if (removed.status === "done") {
          URL.revokeObjectURL(removed.previewUrl);
        }
      }
      return remaining;
    });
  }

  const readyCount = items.filter((item) => item.status === "ready").length;
  const doneCount = items.filter((item) => item.status === "done").length;
  const hasPending = items.some((item) => item.status === "pending");

  return (
    <div className="mt-12 rounded-2xl border border-charcoal/10 bg-white/80 p-6 sm:p-8">
      <div className="text-center sm:text-left">
        <p className="section-label text-brass">Smart Upload</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal sm:text-3xl">
          Bulk upload with AI sort
        </h2>
        <p className="mt-3 text-sm text-charcoal/70 sm:text-base">
          Drop multiple photos at once. AI assigns each image to Signature Cuts, Beard Work, Kids
          Cuts, or Shop &amp; Team — then saves to the next open slot in that gallery.
        </p>
        {aiEnabled === false ? (
          <p className="mt-3 rounded-xl border border-brass/30 bg-brass/5 px-4 py-3 text-sm text-charcoal/80">
            Add <code className="text-charcoal">OPENAI_API_KEY</code> to{" "}
            <code className="text-charcoal">.env.local</code> for auto-sort. Without it, pick a
            category for each photo after upload.
          </p>
        ) : null}
      </div>

      {authRequired && !initialAuthKey ? (
        <div className="mt-6">
          <label htmlFor="bulk-gallery-key" className="section-label text-brass">
            Upload key
          </label>
          <input
            id="bulk-gallery-key"
            type="password"
            value={authKey}
            onChange={(event) => setAuthKey(event.target.value)}
            placeholder="Enter ADMIN_UPLOAD_KEY"
            className="mt-3 w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-3 text-sm text-charcoal outline-none ring-brass focus:ring-2"
          />
        </div>
      ) : null}

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
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
          dragActive
            ? "border-brass bg-brass/5"
            : "border-charcoal/20 bg-bone hover:border-brass/60"
        }`}
      >
        <p className="font-serif text-lg text-charcoal">Drop photos here</p>
        <p className="mt-1 text-sm text-charcoal/60">or click to select multiple JPG, PNG, or WebP files</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {banner ? <p className="mt-4 text-sm text-burgundy">{banner}</p> : null}

      {items.length ? (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-charcoal/70">
              {items.length} photo{items.length === 1 ? "" : "s"}
              {doneCount ? ` · ${doneCount} uploaded` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {hasPending ? (
                <button
                  type="button"
                  onClick={() => void handleClassifyAll()}
                  disabled={phase !== "idle"}
                  className="inline-flex items-center justify-center rounded-full border border-charcoal/20 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "classifying" ? "Classifying…" : "Classify all"}
                </button>
              ) : null}
              {readyCount ? (
                <button
                  type="button"
                  onClick={() => void handleUploadAll()}
                  disabled={phase !== "idle"}
                  className="inline-flex items-center justify-center rounded-full bg-brass px-5 py-2 text-xs font-semibold uppercase tracking-wider text-bone transition-all hover:bg-brass/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "uploading" ? "Uploading…" : `Upload ${readyCount}`}
                </button>
              ) : null}
              {doneCount ? (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
                >
                  Clear uploaded
                </button>
              ) : null}
            </div>
          </div>

          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-charcoal/10 bg-bone/50 p-3 sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-charcoal">{item.file.name}</p>
                  <p className="text-xs text-charcoal/50">{formatBytes(item.file.size)}</p>
                  {item.reason ? (
                    <p className="mt-1 text-xs text-charcoal/65">
                      {item.aiEnabled ? "AI: " : ""}
                      {item.reason}
                      {item.confidence ? ` · ${confidenceBadge(item.confidence)}` : ""}
                    </p>
                  ) : null}
                  {item.savedFilename ? (
                    <p className="mt-1 text-xs text-charcoal/55">
                      Saved as <code className="text-charcoal/70">{item.savedFilename}</code>
                    </p>
                  ) : null}
                  {item.error ? (
                    <p className="mt-1 text-xs text-burgundy">{item.error}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <label className="sr-only" htmlFor={`category-${item.id}`}>
                    Gallery category
                  </label>
                  <select
                    id={`category-${item.id}`}
                    value={item.category}
                    disabled={item.status === "uploading" || item.status === "done"}
                    onChange={(event) =>
                      updateItem(item.id, {
                        category: event.target.value as GalleryCategoryId,
                        status: item.status === "pending" ? "ready" : item.status,
                      })
                    }
                    className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-brass focus:ring-2 disabled:opacity-60"
                  >
                    {GALLERY_CATEGORY_ORDER.map((categoryId) => (
                      <option key={categoryId} value={categoryId}>
                        {GALLERY_CATEGORY_LABELS[categoryId]}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">
                    {item.status === "pending"
                      ? "Waiting"
                      : item.status === "classifying"
                        ? "Classifying…"
                        : item.status === "uploading"
                          ? "Uploading…"
                          : item.status === "done"
                            ? "Uploaded"
                            : item.status === "error"
                              ? "Error"
                              : "Ready"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
