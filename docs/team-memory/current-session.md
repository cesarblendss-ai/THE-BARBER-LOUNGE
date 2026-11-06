# Current session

**Last verified:** 2026-11-06

## Finished this session

- Cesar: still has real Booksy appointments — wants `/book` to match Booksy opens for **all** barbers via public site/API (no password).
- Inspected Booksy public customer API: `POST .../appointments/time_slots` works with publishable web `X-Api-Key` only.
- Shipped live sync on `cursor/booksy-live-availability-c298`:
  - `src/lib/booksy-availability.ts` + wired into `availability-sync.ts`
  - Cron `/api/cron/sync-booksy` every 5 min (alias refresh-availability)
  - `/book` shows Booksy lastSyncedAt; 7-day window
  - Busy paste kept as backup; security docs: never store Booksy passwords

## In flight

- PR + production deploy for live Booksy availability

## Blockers for Cesar

- Confirm Booksy creates still need manual CONFIRM IN BOOKSY (no public create API)
