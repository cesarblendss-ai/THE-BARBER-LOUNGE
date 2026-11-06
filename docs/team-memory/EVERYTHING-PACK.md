# THE BARBER LOUNGE — EVERYTHING PACK
**Owner:** Cesar Silva · **Last verified:** 2026-11-06 · **NO SECRETS**

Paste this into Codex / ChatGPT. API key **values** stay in Vercel / `.env.local` only — names below.

Also see: [`CODEX-HANDOFF.md`](./CODEX-HANDOFF.md) (short paste block + full brief).

---

## 0) Two different “sites” — do not confuse

| Property | URL | Wired to Vercel / Twilio / Booksy live? |
|----------|-----|-----------------------------------------|
| **REAL production** | https://thebarberloungeca.com | **YES** — source of truth |
| Book funnel | https://thebarberloungeca.com/book | YES |
| ChatGPT Site (private) | https://barber-lounge-antioch-booking.just-pike-8105.chatgpt.site | **NO** — prototype only; Booksy confirm still manual; no live avail / leads / SMS |

Existing website is unchanged by the ChatGPT Site. Keep shipping on **ca.com**.

---

## 1) Shop facts

| | |
|--|--|
| Legal | The Barber Lounge LLC |
| Address | 1518 A St, Antioch, CA 94509 |
| Phone | (925) 209-5995 · `tel:+19252095995` |
| IG | @thebarberlounges1 |
| Team | Alexis Franco, Braulio Gómez, Cesar Silva, Kristian Guerra, Sebastian Guardado |
| Services ONLY | Signature Haircut **$50** · Haircut & Beard **$65** |
| EIN (Twilio) | **41-3512174** |
| CA entity # | B20250377078 (state — **not** EIN) |

---

## 2) GitHub

| | |
|--|--|
| Repo | https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE |
| Default branch | `main` |
| Clone | `git clone https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE.git && cd THE-BARBER-LOUNGE && npm install && npm run dev` |

Recent merges (ground truth): conversion · /book UI · Tim Chao transcripts · book-first · shop-wide blocks · Booksy live opens (#20) · Booksy deep-link handoff · docs.

---

## 3) Vercel

| | |
|--|--|
| Team | `cesarblendss-7234s-projects` |
| Project | `the-barber-lounge` |
| Dashboard | https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge |
| Framework | Next.js (App Router) |
| Prod domain | **thebarberloungeca.com** |
| Aliases | `the-barber-lounge-antioch.vercel.app` · `the-barber-lounge-cesarblendss-7234s-projects.vercel.app` · `the-barber-lounge.vercel.app` → 307 → ca.com |
| Cron | `*/5 * * * *` → `/api/cron/sync-booksy` (`vercel.json`) |

```bash
npm run build
npx vercel --prod --yes
```

**Parked — do not share:** thebarberlounge.com (HugeDomains).  
**Old Google result to kill:** thebarberlounge925.website → 301 + GBP + GSC → ca.com.

---

## 4) Booksy (full IDs + what works)

| | |
|--|--|
| Profile | https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch |
| Business id | `1180862` |
| Signature Haircut | variant `16190327` ($50) |
| Haircut & Beard | variant `16190328` ($65) |

| Barber | Staffer ID |
|--------|------------|
| Alexis Franco | `1124582` |
| Braulio Gómez | `1740160` |
| Cesar Silva | `1653463` |
| Kristian Guerra | `1659337` |
| Sebastian Guardado | `1691142` |

Bryant `1860726` exists on Booksy but is **not** on public roster.

| Capability | Status |
|------------|--------|
| Read live open slots (public `time_slots`) | ✅ prod `booksyLiveSync: true` |
| Cron every 5 min | ✅ `/api/cron/sync-booksy` |
| Deep-link handoff `?do=open-widget&variantId&stafferId&date&time` | ✅ guest finishes on Booksy |
| Server **create** appointment | ❌ 403 without customer `x-access-token` |
| Manual busy paste | ✅ `/admin/calendar-sync` |

Code: `src/lib/booksy.ts` · `src/lib/booksy-availability.ts` · `src/lib/booksy-handoff.ts` · `src/lib/availability-sync.ts`

---

## 5) Twilio — WHOLE STATUS (Phase 2 blocked)

**Primary owner alerts NOW = ntfy (`NTFY_TOPIC`), not SMS.**

| Item | Value |
|------|-------|
| From | +1 (737) 232-4091 |
| Owner | +1 (925) 209-5995 |
| Blocker | Error **20003** Trust Hub KYC |
| Trust Hub | https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary |
| Admin UI | `/admin/sms-setup` |
| Code | `src/lib/sms-receipt.ts` · `/api/appointment-request` · `/api/lead` |
| Full doc | `docs/team-memory/twilio-sms-status.md` |

**Env names only:** `TWILIO_ACCOUNT_SID` · `TWILIO_AUTH_TOKEN` · `TWILIO_PHONE_NUMBER` · `OWNER_PHONE` · `TWILIO_TRIAL_MODE`

**KYC fix:** type **EIN** → `41-3512174`. Do **not** put CA entity `B20250377078` in the EIN field. Do not call the IRS.

**Phase 2 checklist:** active SMS number → Trust Hub EIN → A2P 10DLC if still blocked → mirror env on Vercel Production → redeploy.

**Flow on `POST /api/appointment-request`:**
1. Save `data/appointments.json`
2. **ntfy** owner (primary) — “CONFIRM IN BOOKSY”
3. Twilio customer + owner SMS (blocked until KYC)
4. On-screen receipt + Booksy widget handoff

**Local SMS test:** `npm run test:sms` → `scripts/test-sms.ts`

Other codes: 572006 trial template · 30034 A2P · 21606 not SMS-capable.

---

## 6) Env var NAMES (from `.env.example` — never paste values)

```
ADMIN_UPLOAD_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
DATABASE_URL          # (+ TBLDB_* Neon)
NTFY_TOPIC
CRON_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
OWNER_PHONE
# TWILIO_TRIAL_MODE=   # unset = production SMS bodies
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# BOOKSY_WEB_API_KEY=  # optional public web key override — NOT Biz password
# BOOKSY_ACCESS_TOKEN= # optional customer session — prefer deep-link; never Biz password
```

---

## 7) Architecture + key paths

```
Customer → thebarberloungeca.com/book (Tim Cho 4-step)
  → availability: Booksy live opens + website appointments + busy blocks
  → submit: POST /api/appointment-request (+ optional POST /api/lead)
  → owner: ntfy CONFIRM IN BOOKSY (+ Twilio when KYC done)
  → customer: on-screen receipt + Booksy widget deep-link (prefilled)
Staff finishes confirmation in Booksy
```

| Path | Role |
|------|------|
| `/book` | Primary product (Tim funnel) |
| `/admin` | Hub — needs `ADMIN_UPLOAD_KEY` |
| `/admin/calendar-sync` | Force sync + busy paste |
| `/admin/leads` | Opt-in leads |
| `/admin/sms-setup` | Twilio status UI |
| `/api/availability` | Slots + `booksyLiveSync` meta |
| `/api/cron/sync-booksy` | 5-min Booksy pull |
| `/api/cron/refresh-availability` | Rebuild cache |
| `/api/appointment-request` | Booking request |
| `/api/lead` | Marketing opt-in |
| `src/components/book/TimBookWizard.tsx` | Funnel UI |
| `docs/operations/booksy-workflow.md` | Staff SOP |
| `docs/operations/LAUNCH-CHECKLIST.md` | Launch |

---

## 8) Scripts (whole catalog)

```bash
npm run dev
npm run build
npm run lint
npm run test:sms
npm run test:phone
npm run test:busy-blocks
npm run test:barber-blocks
npm run test:booksy-availability
npm run test:booksy-handoff
npm run smoke:booksy-handoff
npm run test:estimates
npm run db:push
npm run db:seed
npm run db:seed-products
npm run db:studio
```

Script files under `scripts/`: `test-sms.ts`, `test-booksy-availability.ts`, `test-booksy-handoff.ts`, `smoke-booksy-handoff.ts`, `smoke-booksy-sync.ts`, `test-busy-blocks.ts`, `test-barber-blocks.ts`, `test-appointment-api.ts`, `test-booking-fallback.ts`, `test-phone-normalize.ts`, `test-estimates.ts`, `seed-appointments.ts`, `seed-products.ts`, Neon helpers (`with-neon-env.mjs`, `maybe-db-push.mjs`, …).

---

## 9) Tim Cho / Tim Chao

| Asset | Path |
|-------|------|
| Conversion map | `docs/team-memory/tim-cho-conversion.md` |
| Book UI | `docs/team-memory/tim-book-ui.md` |
| YouTube INDEX | `docs/team-memory/tim-chao-youtube/INDEX.md` |
| All transcripts | `docs/team-memory/tim-chao-youtube/ALL-TRANSCRIPTS.md` (**huge — don't dump into Codex**) |
| Zip | `docs/team-memory/tim-chao-youtube/tim-chao-youtube-transcripts.zip` |

Themes: same-page book · capture contact before handoff · Call CTA · CRM/SMS follow-up · no dinosaur multi-page drop-off.

Org conventions first: `docs/org-conventions/` (style — **no "Bet"** · security · booking-system · barber-lounge-facts).

---

## 10) Codex paste (short)

```
You are Codex working on The Barber Lounge (Antioch, CA) for Cesar Silva.

LIVE: https://thebarberloungeca.com  ( / → /book ). Repo: cesarblendss-ai/THE-BARBER-LOUNGE
Stack: Next.js + Vercel + Twilio (KYC 20003 blocked) + ntfy owner alerts + Booksy live READ (no public create) + JSON leads/appointments (+ Neon).

ChatGPT Site barber-lounge-antioch-booking.just-pike-8105.chatgpt.site is SEPARATE and NOT wired — do not treat it as production.

WHAT'S LIVE: book-first Tim funnel, leads, calendar-sync, Booksy live opens all staffers (cron 5m), deep-link handoff, ntfy CONFIRM IN BOOKSY, $50/$65 only, Call tel:+19252095995.

#1 BOTTLENECK: finish Booksy handoff so guest zero-types the slot; never invent Booksy create without customer token; never store Biz passwords.

CONSTRAINTS: no secrets from .env; no "Bet"; prices $50/$65 only; don't claim SMS live; prefer thebarberloungeca.com.

MEMORY: docs/org-conventions/ → docs/team-memory/EVERYTHING-PACK.md + CODEX-HANDOFF.md → AGENTS.md

NEXT: (1) harden Booksy handoff (2) durable Postgres leads (3) Twilio Trust Hub EIN 41-3512174 (4) GBP/301 old .website domain
```

---

## 11) Smoke

```bash
curl -s 'https://thebarberloungeca.com/api/availability?meta=1' | head -c 500
# expect booksyLiveSync: true

curl -sI 'https://thebarberloungeca.com/' | head
# expect 308 → /book
```

---

**End of pack.** Secrets never belong in this file.
