# Tech Stack Decisions

**Last verified:** 2026-08-08

Why this project is built the way it is — and what to watch for locally.

**Deploy/runtime status:** `docs/team-memory/deploy.md`  
**Local dev issues:** `docs/team-memory/flaky-tests.md`

---

## Stack overview

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router) | SSR/SSG, Vercel-native, fast marketing site |
| Language | TypeScript | Type-safe content + API routes |
| Styling | Tailwind CSS | Mobile-first, matches brand system |
| Hosting | **Vercel** | Zero-config Next deploy, Postgres integration |
| Analytics DB | **Vercel Postgres (Neon) + Prisma** | Anonymous sessions, page views, clicks |
| Booking storage | **JSON file** (`data/appointments.json`) | Simple; no DB required for MVP |
| Owner alerts | **ntfy.sh** (free push) | Instant phone notification without SMS cost |
| Customer/owner SMS | **Twilio** | Branded receipt texts on booking |
| AI booking | **OpenAI GPT-4o-mini** (optional) | Chat fallback in `booking-agent` |
| SEO production | **Python `seo_agent.py`** | Offline monthly content factory |
| External booking | **Booksy link** | Shop already runs on Booksy — no migration |

---

## Next.js 15 on Vercel

- App Router with static generation for marketing pages.
- Admin routes under `/admin/*` (robots: noindex).
- API routes for booking, analytics, uploads, SMS test.
- **Deploy:** `npx vercel --prod --yes` from project root (or GitHub import).
- **Build script:** `prisma generate && next build`.

See `docs/team-memory/deploy.md` for current URL/domain status.

---

## Twilio vs ntfy (both used)

| Channel | Recipient | When | Cost |
|---------|-----------|------|------|
| **ntfy push** | Owner phone (subscribe to topic) | Every website booking | Free |
| **Twilio SMS** | Customer + owner | After booking saved | Per message |

**Why both:** ntfy works immediately with a secret topic; SMS needs Twilio KYC + A2P registration but gives customer-facing confirmation texts.

**Owner phone default:** `+19252095995` via `OWNER_PHONE` or `DEFAULT_OWNER_PHONE` in `src/lib/notifications.ts`.

**Twilio from number:** `+17372324091` (when configured).

---

## Internal availability vs Booksy API

**Decision:** No Booksy API integration.

- Availability computed from shop hours (`HOURS` in `content.ts`) + `data/appointments.json` + blocked slots.
- Website bookings are **appointment requests** — staff manually enters confirmed times in Booksy.
- Primary public CTA still links to **Booksy** (`BOOKING_URL` in `content.ts`).
- Admin view: `/admin/appointments` lists website requests with confirmation codes.

**Why:** Booksy API access is restricted; internal engine gives instant UX without OAuth/partner approval.

**Caveat on Vercel:** `data/appointments.json` is **ephemeral** on serverless unless moved to Postgres/KV/Blob.

---

## Postgres analytics

- Schema: `prisma/schema.prisma` — `Session`, `PageView`, `ClickEvent`.
- Tracker no-ops gracefully without `DATABASE_URL`.
- Dashboard: `/admin/analytics` (protected when `ADMIN_UPLOAD_KEY` set).
- **Privacy:** Anonymous `tbl_vid` cookie; no PII unless customer completes booking wizard.

**Status:** Not connected on Vercel production yet — see `docs/team-memory/deploy.md`.

Local setup:

```bash
# .env.local
DATABASE_URL=postgresql://...

npm run db:push
```

---

## OneDrive `.next` corruption warning

**Problem:** Project lives at `C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge`. OneDrive sync races with Next.js writing `.next/` during `npm run dev` or `npm run build`.

See `docs/team-memory/flaky-tests.md` for symptoms and mitigations.

---

## Edit mode

- Enabled when `ADMIN_UPLOAD_KEY` cookie is set via `/api/admin/edit-auth`.
- Inline editing: `EditableText` → `POST /api/site-content`.
- Overrides stored separately from `content.ts` defaults (`getSiteContent()`).
- Banner: `EditModeBanner` — exit clears cookie.

---

## Environment variables

From `.env.example` + project usage. **Never commit real values.** See also `security.md`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_UPLOAD_KEY` | Prod recommended | Protects `/admin/*`, upload APIs, analytics API, edit mode |
| `DATABASE_URL` | Optional | Postgres analytics persistence |
| `OPENAI_API_KEY` | Optional | AI booking chat + gallery auto-sort |
| `NTFY_TOPIC` | Optional | Owner push on new booking (e.g. `barber-lounge-bookings-x7k9m2`) |
| `PUSH_NOTIFICATION_URL` | Optional | Override default `https://ntfy.sh/{NTFY_TOPIC}` |
| `TWILIO_ACCOUNT_SID` | SMS optional | Twilio account |
| `TWILIO_AUTH_TOKEN` | SMS optional | Twilio secret |
| `TWILIO_PHONE_NUMBER` | SMS optional | E.164 from number |
| `OWNER_PHONE` | Optional | Owner SMS target (default +19252095995) |
| `TWILIO_TRIAL_MODE` | Optional | `1` = predefined template only; remove/`0` after upgrade |
| `RESEND_API_KEY` | Optional | Email backup notifications |
| `OWNER_EMAIL` | Optional | Email target (default shop email) |

**SEO agent** (separate `.env` in `tools/seo-agent/`): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SERPER_API_KEY`, model overrides.

---

## Key architecture paths

```
src/lib/content.ts           # Static content source
src/lib/get-site-content.ts  # Merged static + edit overrides
src/lib/appointments-store.ts
src/lib/booking-agent/       # Portable module
src/lib/sms-receipt.ts
src/lib/notifications.ts
tools/seo-agent/seo_agent.py
prisma/schema.prisma
```

Full path map: `docs/team-memory/repo-layout.md`.
