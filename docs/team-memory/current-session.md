# Current Session

**Last verified:** 2026-11-05

## Finished
- Integrated Tim stack onto `cursor/apply-tim-stack-c298` for production ship
  - PR #16 Tim `/book` four-step funnel (primary Book path)
  - PR #15 conversion: Call CTAs + lead/opt-in capture + `/admin/leads` (Book CTAs retargeted to `/book`)
  - PR #17 Tim Chao transcript archive (docs reference)
- Homepage / header / sticky / services / footer Book CTAs → `/book`
- `/book` contact step stores SMS/email opt-in prefs via `POST /api/lead` (campaigns still Phase 2)

## In flight
- Production deploy + verify `https://thebarberloungeca.com/book`

## User notes
- Cesar: “now apply everything to our website to start.”
- Prefer Tim `/book` as primary Book path; keep Call + lead capture ideas
- Do not invent Twilio as live

## Blockers
- Twilio SMS Phase 2 (KYC 20003) — opt-in stored, campaigns not live
- Booksy has no API — staff confirms website requests manually
- See `current-blockers.md`
