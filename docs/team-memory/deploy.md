# Deploy Status

**Last verified:** 2026-11-03  
**Status:** **LIVE** (production) + **PREVIEW** for Tim Cho conversion  
**Production:** https://thebarberloungeca.com (`main` Halloween cinematic)  
**Conversion preview:** branch `cursor/tim-cho-conversion-c298` → deploy `dpl_Dvvx2GXZLNjwP32zLDe5tgZf2BLk`  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Tim Cho conversion preview (2026-11-03)

Open PR from: https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/compare/main...cursor/tim-cho-conversion-c298  

Preview host (git branch alias):  
https://the-barber-lounge-git-cursor-tim-cho-conversion-c298-cesarblendss-7234s-projects.vercel.app  

Inspector: https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/Dvvx2GXZLNjwP32zLDe5tgZf2BLk  

Ships: lead capture modal, stronger Book/Call CTAs, `/api/lead`, `/admin/leads`. SMS campaigns still blocked — see `tim-cho-conversion.md`.

---

## Share these URLs (Halloween live)

**Primary custom domain (verified):** https://thebarberloungeca.com  

Also works:
- https://the-barber-lounge-antioch.vercel.app
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app
- https://the-barber-lounge.vercel.app → **307 → thebarberloungeca.com** (no longer parks on HugeDomains)

Note: `https://thebarberlounge.com` is still **DNS-parked at HugeDomains** — do not share it until NameBright DNS is fixed. Prefer **thebarberloungeca.com**.

---

## Halloween match (2026-10-28)

Public aliases had drifted to an older deploy (`dpl_9fjUY…`) without HalloweenDecor. Re-aliased antioch / team / `thebarberloungeca.com` / `www` to the Halloween + landscape-hero production deployment.

Verified markers on public hosts:
- `🎃` pumpkin accents + `halloween-*` keyframes (spider webs / hanging spiders)
- Landscape `16/9` hero media plane between nav and address strip
- Booksy service variant deep links + staffer deep links on `/about`
- Sticky mobile Book bar

---

## Google / SEO discoverability

| Item | Status |
|------|--------|
| Public HTTP 200 | ✅ antioch + thebarberloungeca.com |
| `SITE_URL` / canonical / sitemap / robots | Point at **`https://thebarberloungeca.com`** (code updated; redeploy required for sitemap locs) |
| GA4 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` set on Vercel Production; `GoogleAnalytics` loader restored in layout |
| Search Console | **Cesar:** add property for `thebarberloungeca.com`, submit `https://thebarberloungeca.com/sitemap.xml` (no API credentials in repo) |
| `thebarberlounge.com` | Still parked — keep out of Google until DNS fixed |

---

## Environment variables on Vercel

| Variable | Status |
|----------|--------|
| `ADMIN_UPLOAD_KEY` | **Set** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Set** (Production) |
| `NTFY_TOPIC` | **Set** |
| `DATABASE_URL` / `TBLDB_*` | Neon store connected |
| `TWILIO_*` | Add after KYC |
| `OPENAI_API_KEY` | Add if booking chat needed in prod |
| `STRIPE_SECRET_KEY` | **Not set** — estimate deposits |
| `STRIPE_WEBHOOK_SECRET` | **Not set** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Not set** |
| `NEXT_PUBLIC_SITE_URL` | Optional override; code `SITE_URL` is ca.com |

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/knowledge/vercel-deploy-status.md` for history.
