# Deploy Status

**Last verified:** 2026-10-26  
**Status:** **LIVE** — production deployment `c47e901` (hero landscape 16:9 media plane)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Share this URL

**https://the-barber-lounge-antioch.vercel.app**

Also works:
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app

Note: `https://the-barber-lounge.vercel.app` currently **307 → thebarberlounge.com**, and the custom domain is still parked at HugeDomains — use the antioch / team aliases above until DNS is fixed.

---

## Latest ship (2026-10-26)

**Hero landscape framing (Cesar):** media plane stays between the fixed header nav and the address / phone / walk-ins strip, now **16:9 landscape** (`min(94cqw, 85cqh×16/9)` + `object-cover object-center`) so native landscape clips are less face-cropped / milder zoom. Branch `cursor/hero-landscape-a9f2` fast-forwarded to `main` → Vercel Production.

Prior: portrait 9:16 middle-band framing (`67117f1`), then cinematic homepage + Halloween decor.

---

## Latest fix (resolved earlier)

Vercel framework was **Other** + output dir `.` → empty routing. Fixed via `npx vercel project update` to **Next.js**, redeployed, re-aliased.

**ADMIN_UPLOAD_KEY:** Set in Vercel Production + `.env.local` (check local file for value).

---

## Environment variables on Vercel

| Variable | Status |
|----------|--------|
| `ADMIN_UPLOAD_KEY` | **Set** |
| `NTFY_TOPIC` | Add for owner push in prod |
| `DATABASE_URL` | Not connected |
| `TWILIO_*` | Add after KYC |
| `OPENAI_API_KEY` | Add if booking chat needed in prod |
| `STRIPE_SECRET_KEY` | **Not set** — needed for estimate deposits |
| `STRIPE_WEBHOOK_SECRET` | **Not set** — webhook signing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Not set** — Checkout publishable key |

---

## `SITE_URL` in code

Points to `https://the-barber-lounge.vercel.app` until custom domain is live (see alias note above).

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/knowledge/vercel-deploy-status.md` for history.
