# Current session

**Last verified:** 2026-11-06

## Finished this session

- Cesar clarification: Booksy calendar bottleneck is **shop-wide** (every staffer with Booksy appts), not Alexis-only.
- Checked mid-flight `bc-86679c0f` / `cursor/booksy-calendar-bottleneck-c298` — Alexis-skewed, no PR yet.
- Implemented shop-wide on `cursor/booksy-sync-all-barbers-c298`:
  - Per-barber `barberName` on blocked slots (Prisma + JSON)
  - `/book` passes selected barber into `/api/availability`
  - Cron rebuilds shop-wide + all 5 staffer slices
  - `/admin/calendar-sync` paste/tap busy for each barber + shop-wide
  - ntfy CONFIRM IN BOOKSY for any staffer
  - Docs updated shop-wide (Bryant `1860726` omitted — not on `ABOUT.team`)

## In flight

- PR + production deploy for shop-wide sync

## Blockers for Cesar

- Daily mirror Booksy → busy blocks **per barber** until Booksy offers an official feed/webhook
