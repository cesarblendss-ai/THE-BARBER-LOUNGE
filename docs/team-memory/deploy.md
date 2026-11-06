# Deploy Status

**Last verified:** 2026-11-06  
**Status:** **LIVE** (book-first). Booksy **live availability** sync pushed on `cursor/booksy-live-availability-c298` @ `bc0261c`. Prod deploy blocked on Vercel team re-auth; PR open blocked (GitHub write).  
**Production host:** https://thebarberloungeca.com  
**Production deployment:** pending — approve Vercel team access then `npx vercel --prod` / MCP deploy  
**Branch:** `cursor/booksy-live-availability-c298`  
**PR draft URL:** https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/new/cursor/booksy-live-availability-c298  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## What shipped / shipping

| Item | Live? |
|------|-------|
| `/` permanent redirect → `/book` (Tim funnel IS the website) | ✅ |
| HalloweenDecor removed from public site | ✅ |
| All primary Book CTAs → `/book` | ✅ |
| Call Now `tel:+19252095995` | ✅ |
| Availability refresh agent (cron every 5 min + 60s TTL + client poll) | ✅ (this ship) |
| Cron rebuilds **all staffers** + shop-wide from **Booksy live opens** | ✅ (this ship) |
| Admin force refresh + busy-block backup `/admin/calendar-sync` | ✅ |
| `/book` filters availability by selected barber | ✅ |
| 7-day public book window + request/confirm copy | ✅ (this ship) |
| ntfy **CONFIRM IN BOOKSY** (any staffer, not Alexis-only) | ✅ |
| `lastSyncedAt` + `booksyLiveSync` on `/api/availability` + `/book` | ✅ (this ship) |
| Appointment submit → Twilio/ntfy path | ✅ Code live (SMS Phase 2 KYC) |
| Live Booksy open-slot pull (public customer API, no password) | ✅ (this ship) |
| Auto-create appointments inside Booksy | ❌ No public create API |

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
