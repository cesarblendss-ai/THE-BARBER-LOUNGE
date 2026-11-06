# Current Session

**Last verified:** 2026-11-06

## Finished
- Book-first ship on `cursor/book-first-calendar-sync-c298`
  - `/` → `/book` (Tim funnel is the website; cinematic Halloween homepage retired)
  - HalloweenDecor removed site-wide
  - All primary Book CTAs → `/book`
  - Calendar refresh agent: Vercel cron every 10 min + 60s TTL + `/book` 2-min poll + admin force refresh
  - SEO: “Book The Barber Lounge Antioch” metadata; sitemap prioritizes `/book`
- Call Now + appointment-request → ntfy / Twilio path preserved

## In flight
- PR → main, production deploy, verify `/` book-first + cron + Twilio/ntfy submit

## User notes
- Cesar voice: Tim `/book` IS the website; Halloween cinematic is “dinosaur”
- #1 issue: agent that refreshes booking calendar frequently (prefer 5–15 min)
- Walk-in/NPC lead capture → Twilio path is working hella fast — keep it

## Blockers
- Live Booksy calendar sync impossible (no public API) — documented in `calendar-sync-agent.md`
- Twilio SMS Phase 2 (KYC 20003) — opt-in stored, campaigns not live
- See `current-blockers.md`
