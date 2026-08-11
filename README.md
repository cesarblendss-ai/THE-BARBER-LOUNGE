# The Barber Lounge

Modern marketing website for The Barber Lounge — a premium barbershop in Antioch, CA.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Vercel Postgres (Neon) + Prisma — anonymous site analytics
- Deploy-ready for Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Analytics work without a database (graceful no-op). To persist metrics locally or in production, set `DATABASE_URL` — see [Analytics](#analytics-vercel-postgres) below.

## Analytics (Vercel Postgres)

The site tracks anonymous visits, page views, button clicks, and time-on-page. No IP addresses or PII are stored unless a customer completes the booking wizard.

### Enable on Vercel

1. Open your project at [vercel.com](https://vercel.com) → **Storage** → **Create Database** → **Postgres**.
2. Click **Connect to Project** and select this repo. Vercel injects `DATABASE_URL` automatically.
3. After the first deploy with Postgres connected, run migrations from your machine (or Vercel CLI):

   ```bash
   npx prisma db push
   ```

4. View metrics at **`/admin/analytics`** (requires `ADMIN_UPLOAD_KEY` cookie when that env var is set).

### Local development

Copy your Neon connection string into `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

Then push the schema:

```bash
npm run db:push
```

Without `DATABASE_URL`, the site runs normally; the tracker logs a one-time console warning and events are not saved.

### Admin dashboard

| Metric | Description |
|---|---|
| Visitors (7d / 30d) | Unique anonymous `tbl_vid` cookies |
| Sessions today | New browser sessions started today |
| Top pages | Page views by path, ranked |
| Top clicks | Buttons/links/chips with `data-analytics-label` |
| Avg time on page | From heartbeats every 30s and route changes |
| Visitors over time | Daily unique visitors, last 30 days |

Privacy note shown in admin: *Anonymous analytics — no personal data unless they book.*

## Placeholders to Update Before Launch

Search the codebase for these markers:

| Constant | File | What to swap |
|---|---|---|
| `BOOKING_URL` | `src/lib/content.ts` | Final Booksy / booking link |
| `SITE.phone` | `src/lib/content.ts` | Real phone number |
| `SITE.email` | `src/lib/content.ts` | Real email address |
| `SITE_URL` | `src/lib/constants.ts` | Production domain |
| `GEO` | `src/lib/constants.ts` | Exact lat/lng coordinates |
| `LOGO` | `public/logo.png` | Shop logo (replace file; path in `src/lib/constants.ts`) |

## Deploy on Vercel

### Before first deploy

1. **Commit static assets** — gallery photos, hero videos, and `public/logo.png` must be in git. Local uploads under `public/gallery/` are not included automatically; copy them from your dev machine if needed (`gallery-version.json` lists filenames that were uploaded).
2. **Set production env vars** in the Vercel project (Settings → Environment Variables):
   - `ADMIN_UPLOAD_KEY` — protect `/admin/*` upload routes and analytics API
   - `DATABASE_URL` — auto-injected when you connect Vercel Postgres (Storage → Postgres)
   - `NTFY_TOPIC` — optional owner push notifications
   - Twilio vars (`TWILIO_*`) — skip until SMS approval; booking wizard still saves appointments
   - `OPENAI_API_KEY` — optional, for booking chat fallback only
3. **Confirm** `SITE_URL` in `src/lib/constants.ts` matches your live domain.

### Deploy

```bash
npm run build          # verify locally first
npx vercel             # preview
npx vercel --prod      # production
```

Or push to GitHub and import the repo in Vercel — no extra config needed for a standard Next.js App Router project.

**Note:** Filesystem uploads on Vercel are ephemeral. Commit gallery images to the repo (or use Vercel Blob) so photos persist across deploys.
