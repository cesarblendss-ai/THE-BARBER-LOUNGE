# Calendar refresh + Booksy live availability (shop-wide)

**Last verified:** 2026-11-06

## Root cause (solved for availability)

Alexis Franco (`lexblendzz`, staffer `1124582`) and the full team take real clients on Booksy. Website `/book` used to know only HOURS + website appointments + busy blocks, so it could offer times Booksy already filled.

**Now:** `/book` offers the same open slots a customer sees on Booksy’s public booking widget — for every staffer — via Booksy’s customer `time_slots` API (no login / no password).

## What it does

| Piece | Detail |
|-------|--------|
| Booksy client | `src/lib/booksy-availability.ts` |
| Sync module | `src/lib/availability-sync.ts` |
| Cron routes | `GET/POST /api/cron/sync-booksy` (alias: `/api/cron/refresh-availability`) |
| Schedule | Vercel Cron every **5 minutes** (`vercel.json` → `*/5 * * * *` on sync-booksy) |
| TTL | In-memory snapshot **60s** — next API hit rebuilds if older |
| Cache-Control | Availability API `max-age=30` |
| Client poll | `/book` step 3 polls every **2 minutes** + manual Refresh |
| After book | `POST /api/appointment-request` forces a rebuild |
| Admin UI | `/admin/calendar-sync` — lastSyncedAt + Force refresh + busy paste backup |
| Status field | `lastSyncedAt` + `booksyLiveSync` on `/api/availability` |
| Book window | `BOOKABLE_WINDOW_DAYS` (7 open days) |

## How live sync works

1. Cron (or `/book` / admin force) calls `refreshAvailabilitySnapshot`.
2. For each staffer id + “Any” (`staffer_id: -1`), POST to Booksy:

   `https://us.booksy.com/core/v2/customer_api/me/businesses/1180862/appointments/time_slots`

   Body: `{ subbookings: [{ service_variant_id: 16190327, staffer_id, combo_children: [] }], start_date, end_date }`

   Headers: Booksy’s **public** web `X-Api-Key` + `X-Fingerprint` (UUID). **No** `x-access-token`, **no** Booksy password.

3. Map Booksy `HH:MM` opens into `/book` slots (preserves `:45` starts).
4. Overlay website appointments / busy blocks as taken (hour granularity).
5. If Booksy is unreachable → fall back to HOURS + store + busy paste.

## Staffers covered

| Barber | Booksy staffer id |
|--------|-------------------|
| Alexis Franco | `1124582` |
| Braulio Gómez | `1740160` |
| Cesar Silva | `1653463` |
| Kristian Guerra | `1659337` |
| Sebastian Guardado | `1691142` |

Bryant (`1860726`) is on Booksy but **not** on `ABOUT.team` — omit until added to roster.

## Security

- **Never** ask for or store Booksy Biz passwords in chat, git, or env.
- `BOOKSY_WEB_API_KEY` optional override — Booksy’s publishable browser constant, not a shop secret.
- See `docs/org-conventions/security.md`.

## Still impossible without Booksy partnership

- Push website bookings **into** Booksy automatically (no public create API)
- Biz-panel appointment list / ICS export for third parties

Website bookings remain **requests** — ntfy says CONFIRM IN BOOKSY so staff enter them and the next sync stays accurate.

## Auth for cron

| Caller | How |
|--------|-----|
| Vercel Cron | `Authorization: Bearer $CRON_SECRET` and/or `x-vercel-cron: 1` |
| Admin force | `ADMIN_UPLOAD_KEY` via cookie / `x-admin-key` / `?key=` |
| Local dev | Allowed when `CRON_SECRET` unset and `NODE_ENV !== production` |

Set `CRON_SECRET` in Vercel Production (see `.env.example`).
