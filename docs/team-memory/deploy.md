# Deploy Status

**Last verified:** 2026-11-06  
**Status:** **LIVE** — Booksy live availability sync on production (`booksyLiveSync:true`).  
**Production host:** https://thebarberloungeca.com  
**Production deployment:** GitHub Production deploy id `7606581110` @ merge `f7ae5db` (PR #20)  
**Vercel status:** success — https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/EwhBLogHBQ59oima1anFTxAHGXHr  
**Branch / PR:** `main` ← merged [`#20`](https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/20) (`cursor/booksy-live-availability-c298`)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Prod proof (2026-11-06)

| Check | Result |
|-------|--------|
| `GET https://thebarberloungeca.com/api/availability?meta=1` | `booksyLiveSync: true`, `source: "booksy-live+website-appointments"`, `dayCount: 7`, `stafferCount: 5`, `totalOpenSlots: 75`, `booksySyncErrors: []` |
| `GET /api/cron/sync-booksy` (no secret) | **401** `{"error":"Unauthorized"}` — route **exists** (was 404 pre-merge); needs `CRON_SECRET` / Vercel Cron header |
| Vercel commit status on `f7ae5db` | `success` — “Deployment has completed” |

---

## What shipped / shipping

| Item | Live? |
|------|-------|
| `/` permanent redirect → `/book` (Tim funnel IS the website) | ✅ |
| HalloweenDecor removed from public site | ✅ |
| All primary Book CTAs → `/book` | ✅ |
| Call Now `tel:+19252095995` | ✅ |
| Availability refresh agent (cron every 5 min + 60s TTL + client poll) | ✅ |
| Cron rebuilds **all staffers** + shop-wide from **Booksy live opens** | ✅ **prod** |
| Admin force refresh + busy-block backup `/admin/calendar-sync` | ✅ |
| `/book` filters availability by selected barber | ✅ |
| 7-day public book window + request/confirm copy | ✅ |
| ntfy **CONFIRM IN BOOKSY** (any staffer, not Alexis-only) | ✅ |
| `lastSyncedAt` + `booksyLiveSync` on `/api/availability` + `/book` | ✅ **prod** |
| Appointment submit → Twilio/ntfy path | ✅ Code live (SMS Phase 2 KYC) |
| Live Booksy open-slot pull (public customer API, no password) | ✅ **prod** |
| Auto-create appointments inside Booksy | ❌ No public create API (deep-link handoff instead) |

Staffers: Alexis `1124582`, Braulio `1740160`, Cesar `1653463`, Kristian `1659337`, Sebastian `1691142`.

---

## Share these URLs

**Primary custom domain (verified):** https://thebarberloungeca.com → redirects to **/book**  
**Book online (canonical):** https://thebarberloungeca.com/book  

Also works:
- https://the-barber-lounge-antioch.vercel.app
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app
- https://the-barber-lounge.vercel.app → **307 → thebarberloungeca.com**

Note: `https://thebarberlounge.com` is still **DNS-parked at HugeDomains** — do not share it until NameBright DNS is fixed. Prefer **thebarberloungeca.com**.

---

## Google / SEO discoverability

| Item | Status |
|------|--------|
| Homepage | Soft-landing: `/` → `/book` (308). Canonical book metadata: “Book The Barber Lounge Antioch” |
| Sitemap | `/book` priority 1, changeFrequency hourly |
| `SITE_URL` / robots | Point at **`https://thebarberloungeca.com`** |
| GA4 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` set on Vercel Production |
| Search Console | **Cesar:** add/confirm property for `thebarberloungeca.com`, submit sitemap |
| `thebarberlounge.com` | Still parked — keep out of Google until DNS fixed |

---

## Environment variables on Vercel

| Variable | Status |
|----------|--------|
| `ADMIN_UPLOAD_KEY` | **Set** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Set** (Production) |
| `NTFY_TOPIC` | **Set** |
| `DATABASE_URL` / `TBLDB_*` | Neon store connected |
| `CRON_SECRET` | **Add** for cron auth hardening (optional; cron also accepts `x-vercel-cron`) |
| `TWILIO_*` | Add after KYC |
| `OPENAI_API_KEY` | Add if booking chat needed in prod |
| `STRIPE_*` | **Not set** — estimate deposits |
| `NEXT_PUBLIC_SITE_URL` | Optional override; code `SITE_URL` is ca.com |

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/team-memory/calendar-sync-agent.md` for the shop-wide refresh agent.
