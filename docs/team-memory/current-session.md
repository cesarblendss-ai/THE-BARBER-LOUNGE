# Current Session

**Last verified:** 2026-11-06

## Finished

- Cesar: manual Booksy re-entry after web bookings is inefficient.
- Explored Booksy create API: `POST .../me/appointments/business/{id}/` needs customer `x-access-token` (dry_run OK anonymously; create = 403 without login).
- Shipped **deep-link handoff** on `cursor/booksy-auto-book-c298`:
  - `src/lib/booksy-handoff.ts` — `do=open-widget` + variantId/stafferId/date/time
  - `/book` auto-opens Booksy after submit; receipt **Finish on Booksy →**
  - ntfy Click = handoff URL (one tap for staff)
  - Admin calendar-sync lists web bookings with **Open Booksy →**
  - SOP: `docs/operations/booksy-workflow.md`

## Cesar workflow now

| Path | Effort |
|------|--------|
| Guest finishes on Booksy | **Zero** manual type |
| Guest abandons | **One tap** ntfy / admin Open Booksy |

## In flight

- Production deploy of handoff branch
- Cesar smoke-test one real /book → Booksy finish
