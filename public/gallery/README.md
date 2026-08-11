# Gallery Assets

Drop barbershop photos and the homepage hero video here. Register images in `src/lib/gallery.ts`.

## Quick start — add photos by category

### Option A: Admin upload (recommended for local dev)

1. Open **`/admin/gallery`** — or click **Manage Gallery** in the site footer.
2. Choose a category:
   - **Signature Haircut** → saves as `signature-haircut-01.jpg`, `-02`, etc.
   - **Signature Haircut & Beard** → saves as `signature-beard-01.jpg`, `-02`, etc.
   - **General / Shop & Team** → saves as `gallery-01.jpg`, `-02`, etc.
3. Drag and drop or browse for a JPG, PNG, or WebP (max ~10 MB).
4. Click **Upload**. The next available slot is assigned automatically.
5. Add or update the matching entry in `src/lib/gallery.ts` with descriptive `alt` text (required for SEO).
6. Refresh `/gallery` or the homepage to see the new photo.

If `ADMIN_UPLOAD_KEY` is set in `.env.local`, append `?key=YOUR_KEY` to the URL or enter the key in the form.

### Option B: Manual file drop

1. Save your image to this folder using the naming convention below.
2. Add an entry to the matching array in `GALLERY_CATEGORIES` inside `src/lib/gallery.ts`.
3. Missing files are hidden automatically — only files that exist on disk are shown.

## Naming convention

| Category | Filename pattern | Example |
|---|---|---|
| Signature Haircut | `signature-haircut-NN.jpg` | `signature-haircut-02.jpg` |
| Signature Haircut & Beard | `signature-beard-NN.jpg` | `signature-beard-03.jpg` |
| General / Shop & Team | `gallery-NN.jpg` | `gallery-05.jpg` |

Legacy filenames still work:

| File | Category | Used for |
|---|---|---|
| `hero-interior.png` | General | Homepage hero poster, about page, gallery |
| `skin-fade-closeup.png` | Signature Haircut | Service collage, hero video poster |
| `haircut-beard-service.png` | Signature Haircut & Beard | Service collage, about section |
| `razor-lineup.png` | General | Gallery grid, fallback service image |

## Where photos appear

| Location | What shows |
|---|---|
| `/gallery` | All categories in sections: Signature Cuts, Beard Work, Shop & Team |
| Homepage services | Multi-image collages per signature service |
| `/services` | Same collages on service cards |
| Homepage gallery teaser | Up to 8 general-category photos + link to full gallery |

## Homepage hero video

Upload at **`/admin/hero`**. See hero video section in the previous README or visit `/admin/hero` for instructions.

Recommended: 10–30s loop, muted, 1920×1080 or 1280×720, under ~50 MB for uploads.

### Production (Vercel)

Filesystem uploads only persist during local development. On Vercel, the serverless filesystem is read-only/ephemeral — uploaded files will not survive redeploys. For production, use a persistent store such as [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or commit images to the repo.

## Target capacity

The gallery system supports ~20 images total:

- 5 × Signature Haircut
- 5 × Signature Haircut & Beard
- 10 × General / Shop & Team

Add more slots in `src/lib/gallery.ts` as needed.
