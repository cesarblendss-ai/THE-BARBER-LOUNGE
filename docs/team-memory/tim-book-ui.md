# Tim Cho on-page booking UI (`/book`)

**Last verified:** 2026-11-05

## What shipped (preview — not prod)

Tim Cho AABLENDZ-style booking funnel recreated for The Barber Lounge on branch `cursor/tim-book-ui-c298`.

| Item | Detail |
|------|--------|
| Route | `/book` (removed former Booksy redirect in `next.config.ts`) |
| UI | Black / gold / white, Step 1 pixel-matched to Tim mock; steps 2–4 scaffolded (barber → day/time → contact) |
| Services | Real menu only — Signature Haircut $50, Haircut & Beard $65 (from `BOOKABLE_SERVICES`) |
| Submit | `POST /api/appointment-request` (same engine as FAB wizard) |
| Chrome | Halloween overlay, sticky Book bar, and booking FAB **hidden** on `/book` |
| CTAs | Header / sticky / home / services / about primary Book paths → `/book` |
| Booksy | Kept as fallback link on receipt + deep links on barber cards |

## Do not

- Prod-deploy this UI until Cesar signs off on the Tim design specifically
- Invent extra menu prices to fill the mock’s 6-service grid

## Preview

- Branch: `cursor/tim-book-ui-c298`
- Deploy: `dpl_6n9CDy3K79oBiUMeWQjreLDzrdYs` (READY)
- URL: https://the-barber-lounge-fzibjjjtm-cesarblendss-7234s-projects.vercel.app/book
- Compare / open PR: https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/compare/main...cursor/tim-book-ui-c298

## Screenshots (local artifacts)

- `/opt/cursor/artifacts/mock_tim_aablendz_book.png` — Tim reference
- `/opt/cursor/artifacts/book_step1_desktop.png` — our Step 1 desktop
- `/opt/cursor/artifacts/book_step1_mobile.png` — our Step 1 mobile
- `/opt/cursor/artifacts/compare_book_step1_vs_mock_desktop.png` — same desktop capture for side-by-side
