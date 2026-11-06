# Tim Cho on-page booking UI (`/book`)

**Last verified:** 2026-11-06

## What shipped (production)

Tim Cho AABLENDZ-style booking funnel for The Barber Lounge — **this IS the website** (Cesar 2026-11). `/` permanent-redirects to `/book`.

| Item | Detail |
|------|--------|
| Route | `/book` (canonical landing). `/` → `/book` (308) |
| UI | Black / gold / white; 4-step funnel fully wired |
| Services | Real menu only — Signature Haircut $50, Haircut & Beard $65 (`BOOKABLE_SERVICES`) |
| Barber | Real `ABOUT.team` + avatars + Booksy `?staffer=` deep links |
| Day/time | `GET /api/availability` + calendar sync agent (`calendar-sync-agent.md`) |
| Submit | `POST /api/appointment-request` → on-screen `BookingReceipt` |
| Opt-in | SMS/email checkboxes on step 4 → `POST /api/lead` (campaigns Phase 2) |
| Call Now | Header, sticky, receipt — `tel:+19252095995` |
| Chrome | HalloweenDecor **removed site-wide**; sticky Book bar + FAB hidden on `/book` |
| CTAs | All primary Book paths → `/book` |
| Booksy | Fallback on receipt + per-barber staffer links on step 2 |

## Funnel status

| Step | Status |
|------|--------|
| 1 Service → Continue | ✅ $50 / $65 only |
| 2 Barber | ✅ Alexis, Braulio, Cesar, Kristian, Sebastian + Any available |
| 3 Day/time | ✅ `/api/availability` |
| 4 Contact → receipt | ✅ `POST /api/appointment-request` returns `TBL-…` receipt |

## Production

- **Live:** https://thebarberloungeca.com/book
- Integration branch: `cursor/apply-tim-stack-c298`
- Source PR: https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/16

## Blockers / notes

| Item | Status |
|------|--------|
| Twilio customer SMS | Phase 2 — receipt may show text unavailable; ntfy is owner primary (`twilio-sms-status.md`) |
| Booksy API | None — website captures **requests**; staff confirms in Booksy. Calendar agent syncs **internal** store only. |
| Invented menu prices | Do not invent extra prices beyond $50 / $65 |
