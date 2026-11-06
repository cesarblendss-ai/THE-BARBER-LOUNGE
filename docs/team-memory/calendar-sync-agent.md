# Calendar refresh + Booksy busy blocks (shop-wide)

**Last verified:** 2026-11-06

## Root cause

Alexis Franco (`lexblendzz`, staffer `1124582`) and the full team take real clients on Booksy. Website `/book` only knows HOURS + website appointments + busy blocks. Booksy has **no** public list/create API and **no** staff ICS export (Booksy only imports ICS). Without busy blocks, `/book` can double-book — this project’s #1 bottleneck.

## What it does

Keeps website booking availability fresh so walk-in / concurrent `/book` submits don't double-book from stale slots — **for every Booksy staffer**, not Alexis alone.

| Piece | Detail |
|-------|--------|
| Sync module | `src/lib/availability-sync.ts` |
| Busy helpers | `src/lib/busy-blocks.ts` — paste parser + staffer presets |
| Cron route | `GET/POST /api/cron/refresh-availability` |
| Schedule | Vercel Cron every **10 minutes** (`vercel.json` → `*/10 * * * *`) |
| TTL | In-memory snapshot **60s** — next API hit rebuilds if older |
| Cache-Control | Availability API `max-age=30` |
| Client poll | `/book` step 3 polls every **2 minutes** + manual Refresh |
| After book | `POST /api/appointment-request` forces a rebuild |
| Admin UI | `/admin/calendar-sync` — lastSyncedAt + Force refresh + **per-barber busy paste** |
| Status field | `lastSyncedAt` on `/api/availability` responses |
| Book window | `BOOKABLE_WINDOW_DAYS` (3 open days) |

## Staffers covered by cron + admin

| Barber | Booksy staffer id |
|--------|-------------------|
| Alexis Franco | `1124582` |
| Braulio Gómez | `1740160` |
| Cesar Silva | `1653463` |
| Kristian Guerra | `1659337` |
| Sebastian Guardado | `1691142` |

Bryant (`1860726`) is **not** on `ABOUT.team` — omit until added to roster.

Cron rebuilds:

1. Shop-wide / “Any available” slice
2. One availability slice **per staffer** above

`/book` passes `?barber=<Full Name>` after the customer picks a barber so day/time slots respect that chair’s busy blocks.

## Source of truth

Rebuilds from:

1. Shop `HOURS` (`src/lib/content.ts` → booking config)
2. Website appointments (`appointments-store` / Postgres when configured)
3. **Busy blocks** — shop-wide (`barberName=""`) or per-barber (`barberName="Alexis Franco"` etc.)

**Not** live Booksy calendar.

## What is still impossible without Booksy

Booksy has **no public create/list calendar API** for third parties. The website cannot:

- Pull chairs already booked only in Booksy
- Push website bookings into Booksy automatically
- Guarantee zero conflicts with Booksy-only appointments

**Workarounds for Cesar (shop-wide — every staffer with Booksy appts):**

- Treat website bookings as **requests** staff confirm in Booksy (current flow + ntfy “CONFIRM IN BOOKSY”)
- On `/admin/calendar-sync`, select **each** barber with Booksy appointments and paste/tap busy hours (`10am-1pm, 3pm` or ICS paste)
- Use **Shop-wide** only when every chair is full / shop closed
- Do **not** scrape Booksy — ToS-risk / unreliable
- Zapier/Make: no official Booksy “appointment created” trigger for third-party sites; if Booksy adds webhooks later, POST to `PATCH /api/appointments` (`paste-busy` / `set-blocks`) with admin key
- Future: official Booksy partnership / staff calendar CSV/ICS export if they offer one

## Day-to-day SOP

1. Open https://thebarberloungeca.com/admin/calendar-sync
2. For **each** barber with Booksy appointments today/tomorrow (Alexis, Braulio, Cesar, Kristian, Sebastian) → Open on Booksy
3. Paste/tap that staffer’s busy hours (scoped to their name — does not wipe other barbers)
4. `/book` hides those hours when that barber is selected (~30s; Force refresh if needed)
5. ntfy alerts on every web request — confirm in Booksy before holding the chair

## Auth for cron

| Caller | How |
|--------|-----|
| Vercel Cron | `Authorization: Bearer $CRON_SECRET` and/or `x-vercel-cron: 1` |
| Admin force | `ADMIN_UPLOAD_KEY` via cookie / `x-admin-key` / `?key=` |
| Local dev | Allowed when `CRON_SECRET` unset and `NODE_ENV !== production` |

Set `CRON_SECRET` in Vercel Production (see `.env.example`).
