# Deploy Status

**Last verified:** 2026-11-06  
**Status:** **LIVE** — Book-first site (`/` → `/book`) + calendar refresh agent  
**Production host:** https://thebarberloungeca.com  
**Production deployment:** `dpl_GnVj3KPzfCaeJUaWaBSZCem9wmec` (`cursor/book-first-calendar-sync-c298` @ `65744c1`)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## What shipped (book-first + calendar sync)

| Item | Live? |
|------|-------|
| `/` permanent redirect → `/book` (Tim funnel IS the website) | ✅ |
| HalloweenDecor removed from public site | ✅ |
| All primary Book CTAs → `/book` | ✅ |
| Call Now `tel:+19252095995` | ✅ |
| Availability refresh agent (cron every 10 min + 60s TTL + client poll) | ✅ |
| Admin force refresh `/admin/calendar-sync` | ✅ |
| `lastSyncedAt` on `/api/availability` + `/book` day step | ✅ |
| Appointment submit → Twilio/ntfy path | ✅ Code live (SMS Phase 2 KYC) |
| Live Booksy calendar pull | ❌ Impossible — no public API |

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

See `docs/team-memory/calendar-sync-agent.md` for the refresh agent.
