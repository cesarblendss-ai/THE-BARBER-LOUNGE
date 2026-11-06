# Calendar refresh agent

**Last verified:** 2026-11-06

## What it does

Keeps website booking availability fresh so walk-in / concurrent `/book` submits don't double-book from stale slots.

| Piece | Detail |
|-------|--------|
| Sync module | `src/lib/availability-sync.ts` |
| Cron route | `GET/POST /api/cron/refresh-availability` |
| Schedule | Vercel Cron every **10 minutes** (`vercel.json` → `*/10 * * * *`) |
| TTL | In-memory snapshot **60s** — next API hit rebuilds if older |
| Cache-Control | Availability API `max-age=30` |
| Client poll | `/book` step 3 polls every **2 minutes** + manual Refresh |
| After book | `POST /api/appointment-request` forces a rebuild |
| Admin UI | `/admin/calendar-sync` — lastSyncedAt + Force refresh |
| Status field | `lastSyncedAt` on `/api/availability` responses |

## Source of truth

Rebuilds from:

1. Shop `HOURS` (`src/lib/content.ts` → booking config)
2. Website appointments + blocked slots (`appointments-store` / Postgres when configured)

**Not** live Booksy calendar.

## What is still impossible without Booksy

Booksy has **no public create/list calendar API** for third parties. The website cannot:

- Pull chairs already booked only in Booksy
- Push website bookings into Booksy automatically
- Guarantee zero conflicts with Booksy-only appointments

**Workarounds for Cesar:**

- Treat website bookings as **requests** staff confirm in Booksy (current flow)
- Paste/export busy blocks into admin blocked slots when needed
- Future: official Booksy partnership / staff calendar CSV import if they offer one

## Auth for cron

| Caller | How |
|--------|-----|
| Vercel Cron | `Authorization: Bearer $CRON_SECRET` and/or `x-vercel-cron: 1` |
| Admin force | `ADMIN_UPLOAD_KEY` via cookie / `x-admin-key` / `?key=` |
| Local dev | Allowed when `CRON_SECRET` unset and `NODE_ENV !== production` |

Set `CRON_SECRET` in Vercel Production (see `.env.example`).
