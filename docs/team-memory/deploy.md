# Deploy Status

**Last verified:** 2026-10-26  
**Status:** **LIVE** — production deployment `67117f1` (hero video middle-band framing)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Share this URL

**https://the-barber-lounge-antioch.vercel.app**

Also works:
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app
- Production deployment: https://the-barber-lounge-6ktlnjqcy-cesarblendss-7234s-projects.vercel.app

Note: `https://the-barber-lounge.vercel.app` currently **307 → thebarberlounge.com**, and the custom domain is still parked at HugeDomains — use the antioch / team aliases above until DNS is fixed.

---

## Latest ship (2026-10-26)

**Hero video framing (Cesar):** media plane sits only between the fixed header nav and the address / phone / walk-ins strip. Portrait clips play in a 9:16 stage at ~90% band height (`object-cover object-center`) so the cut is milder and sharper. Branch `cursor/hero-video-sizing-c298` fast-forwarded to `main` → Vercel Production success.

Prior: cinematic homepage + Halloween decor also live on the same project.

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
