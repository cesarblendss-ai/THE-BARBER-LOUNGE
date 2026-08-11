# Vercel Deploy Status

**Last verified:** 2026-08-08  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Status: LIVE (production deployed)

Production deploy is **Ready** on Vercel. Aliases are assigned. Deployment Protection is **off** (no Vercel SSO login wall on public URLs).

---

## Share this URL (stable)

**https://the-barber-lounge-antioch.vercel.app**

Also works (same deployment):

| URL | Role |
|-----|------|
| https://the-barber-lounge-antioch.vercel.app | **Primary share URL** |
| https://the-barber-lounge.vercel.app | Short alias → redirects to `-antioch` |
| https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app | Stable team alias |

Hash-based URLs (e.g. `the-barber-lounge-<hash>-cesarblendss-7234s-projects.vercel.app`) change each deploy — use the aliases above for sharing.

---

## Deployment Protection — resolved

Production is **public**. Anonymous visitors should see the site, not a Vercel login wall.

If a URL asks for Vercel login, re-check: Project → **Settings** → **Deployment Protection** → Production → **None**.

---

## Dashboard fix if URLs return 404

If public URLs return `X-Vercel-Error: NOT_FOUND` despite a Ready deploy:

1. Project → **Settings** → **General**
2. **Framework Preset** → **Next.js**
3. **Output Directory** → **clear the field** (leave empty — do not use `.`)
4. Save, then redeploy: `npx vercel --prod --yes`

Misconfigured Output Directory (`.`) causes Vercel to skip Next.js routing even when the build succeeds.

---

## Latest production deploy (2026-08-08)

- Build: Next.js 15.5.x, 37 routes, 4 blog posts, `readyState: READY`
- Primary alias: `the-barber-lounge-antioch.vercel.app`
- Blog: `/blog` + 4 posts (see `src/lib/blog-posts.ts`)
- Inspect: https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/Awmdp2uqTJ9jNsV6qTJzSYksFtN2

---

## Environment variables on Vercel

**Status (2026-08-08):**

| Variable | Local `.env.local` | Vercel Production |
|----------|-------------------|-------------------|
| `ADMIN_UPLOAD_KEY` | Set | Set (added via CLI) |
| `NTFY_TOPIC` | Set | **Add** for owner push in prod |
| `OPENAI_API_KEY` | Set | **Add** if booking chat needed in prod |
| `TWILIO_*` + `OWNER_PHONE` | Set | **Add** after KYC cleared |
| `DATABASE_URL` | Not set | **Not connected** |

Set via: Project → **Settings** → **Environment Variables** → Production.

Or CLI:

```bash
npx vercel env add ADMIN_UPLOAD_KEY production
npx vercel env add NTFY_TOPIC production
# etc.
```

**After adding env vars:** redeploy (`npx vercel --prod --yes`).

**Security:** Admin key lives in `.env.local` — do not print full value in chat. Use it at `/admin/edit`, `/admin/hero`, `/admin/gallery`.

---

## Postgres setup steps (optional — not done)

Analytics code is ready; database not wired on Vercel.

1. Vercel Dashboard → **Storage** → **Create Database** → **Postgres**
2. **Connect to Project** → select `the-barber-lounge` (auto-injects `DATABASE_URL`)
3. From local machine with env pulled:

   ```bash
   npx vercel env pull .env.local   # optional — get DATABASE_URL locally
   npm run db:push                  # prisma db push
   ```

4. Redeploy
5. Verify `/admin/analytics` loads metrics (requires `ADMIN_UPLOAD_KEY` cookie)

**Without `DATABASE_URL`:** Site works; tracker logs one-time warning; events not persisted.

---

## Deploy commands

```bash
npm run build              # verify locally first (watch OneDrive issues)
npx vercel                 # preview
npx vercel --prod --yes    # production
```

**First deploy notes:**

- Commit static assets (`public/gallery/`, hero videos, `logo.png`) — Vercel doesn't have local uploads
- Filesystem uploads on Vercel are **ephemeral** — gallery images must be in git or Vercel Blob
- Remote Vercel build avoids OneDrive `.next` corruption

---

## Canonical URL mismatch

`src/lib/constants.ts`:

```ts
export const SITE_URL = "https://thebarberlounge.com"; // TODO
```

Until custom domain is live:

- Sitemap, Open Graph, and JSON-LD `url` may reference **non-resolving domain**
- **Action:** Update `SITE_URL` to `https://the-barber-lounge-antioch.vercel.app` (or custom domain when ready)

---

## Pages deployed (sample)

Public: `/`, `/about`, `/services`, `/faq`, `/testimonials`, `/contact`, `/gallery`, `/blog`, `/blog/best-fades-barbershop-antioch`, `/blog/fade-vs-taper-haircut-antioch`, `/blog/maintain-your-fade-kids-haircut-antioch`, `/blog/beard-trim-antioch-grooming`

Admin: `/admin/edit`, `/admin/hero`, `/admin/gallery`, `/admin/appointments`, `/admin/analytics`, `/admin/notifications`, `/admin/sms-setup`

API: `/api/appointment-request`, `/api/availability`, `/api/booking-chat`, `/api/analytics`, etc.
