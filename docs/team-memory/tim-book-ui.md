# Tim Cho on-page booking UI (`/book`)

**Last verified:** 2026-11-05

## What shipped (preview — not prod)

Tim Cho AABLENDZ-style booking funnel for The Barber Lounge on branch `cursor/tim-book-ui-c298` (PR #16).

| Item | Detail |
|------|--------|
| Route | `/book` (removed former Booksy redirect in `next.config.ts`) |
| UI | Black / gold / white; 4-step funnel fully wired |
| Services | Real menu only — Signature Haircut $50, Haircut & Beard $65 (`BOOKABLE_SERVICES`) |
| Barber | Real `ABOUT.team` + avatars + Booksy `?staffer=` deep links |
| Day/time | `GET /api/availability` (upcoming days + per-date slots) |
| Submit | `POST /api/appointment-request` → on-screen `BookingReceipt` |
| Call Now | Header, hero, mobile sticky, receipt — `tel:+19252095995` |
| Chrome | Halloween overlay, sticky Book bar, and booking FAB **hidden** on `/book` |
| CTAs | Header / sticky / home / services / about primary Book paths → `/book` |
| Booksy | Fallback on receipt + per-barber staffer links on step 2 |

## Funnel status (verified locally 2026-11-05)

| Step | Status |
|------|--------|
| 1 Service → Continue | ✅ $50 / $65 only |
| 2 Barber | ✅ Alexis, Braulio, Cesar, Kristian, Sebastian + Any available |
| 3 Day/time | ✅ `/api/availability` |
| 4 Contact → receipt | ✅ `POST /api/appointment-request` returns `TBL-…` receipt |

## Do not

- Prod-deploy this UI until Cesar signs off on the Tim design specifically
- Invent extra menu prices to fill the mock’s 6-service grid

## Blockers / notes

| Item | Status |
|------|--------|
| Twilio customer SMS | Phase 2 — receipt shows “Text receipt unavailable”; ntfy is owner primary (`twilio-sms-status.md`) |
| Booksy API | None — website captures **requests**; staff confirms in Booksy |
| Vercel preview auth | Some preview aliases may require team login; push redeploy for a fresh public preview URL |
| Postgres on preview | Prod has Neon; preview should inherit project env. If submit returns 503, check `DATABASE_URL` / `TBLDB_*` on Preview |

## Preview

- Branch: `cursor/tim-book-ui-c298`
- PR: https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/16
- Prior deploy: `dpl_6n9CDy3K79oBiUMeWQjreLDzrdYs` — https://the-barber-lounge-fzibjjjtm-cesarblendss-7234s-projects.vercel.app/book
- New preview URL: refresh after this push (Vercel auto-preview on branch)

## Screenshots (local artifacts)

- `/opt/cursor/artifacts/book_func_step1_desktop.png` — Step 1 + Call Now
- `/opt/cursor/artifacts/book_func_step2_desktop.png` / `book_func_step2_barbers_card.png` — barbers + Booksy staffer links
- `/opt/cursor/artifacts/book_func_step3_desktop.png` — day/time
- `/opt/cursor/artifacts/book_func_step4_desktop.png` — contact
- `/opt/cursor/artifacts/book_func_receipt_desktop.png` — TBL receipt
- `/opt/cursor/artifacts/book_func_step1_mobile.png` / `book_func_mobile_sticky.png` — mobile + sticky Call Now
