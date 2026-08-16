# Gallery Assets

Drop barbershop photos and the homepage hero video in **`public/gallery/`**. The site auto-discovers every JPG, PNG, and WebP in this folder — no code edit required for new photos.

## Quick start — add ~50 photos

### Option A: Bulk admin upload (recommended)

1. Open **`/admin/gallery`** (or **Manage Gallery** in the site footer).
2. Use **Bulk upload with AI sort** — drag 50+ files at once.
3. AI assigns each image to Signature Cuts, Beard Work, Kids Cuts, or Shop & Team.
4. Click **Upload** — files save as auto-numbered names in `public/gallery/`.

If `ADMIN_UPLOAD_KEY` is set, append `?key=YOUR_KEY` or enter the key in the form.

### Option B: Manual file drop

1. Copy your images into **`public/gallery/`** using the naming convention below.
2. Refresh `/gallery` or the homepage — new files appear automatically.
3. Optional: add entries in `src/lib/gallery.ts` only if you want custom SEO alt text.

## Naming convention

| Category | Filename pattern | Example |
|---|---|---|
| Regular haircut / fades | `signature-haircut-NN.jpg` | `signature-haircut-02.jpg` |
| Haircut & beard | `signature-beard-NN.jpg` | `signature-beard-03.jpg` |
| Kids cuts | `kids-NN.jpg` | `kids-05.jpg` |
| Shop & team | `gallery-NN.jpg` | `gallery-12.jpg` |

Any other image filename still shows in the gallery under **Shop & Team**.

Legacy filenames still work:

| File | Category |
|---|---|
| `hero-interior.png` | Shop & Team |
| `skin-fade-closeup.png` | Signature Cuts |
| `haircut-beard-service.png` | Beard Work |
| `razor-lineup.png` | Shop & Team |

## Where photos appear

| Location | What shows |
|---|---|
| `/gallery` | All photos by category, lightbox on click |
| Homepage | Teaser grid (12 photos) + link to full gallery |
| `/services` | Collages on the two service cards |
| Service cards | Multi-image strips per service category |

## Homepage hero video

Upload at **`/admin/hero`**. Recommended: 10–30s loop, muted, 1920×1080 or 1280×720, under ~50 MB.

### Production (Vercel)

Filesystem uploads persist during local dev only. On Vercel, commit images to the repo or use persistent storage (e.g. Vercel Blob). Bulk upload at `/admin/gallery` works locally; commit the resulting files for production.

## Capacity

Upload slots support **99 images per category** (signature-haircut-01 through -99, etc.). The gallery page handles 50+ images with lazy-loaded `next/image` and a click-to-enlarge lightbox.
