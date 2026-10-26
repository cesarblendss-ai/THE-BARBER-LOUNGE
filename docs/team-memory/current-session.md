# Current Session

**Last verified:** 2026-10-26 (America/Los_Angeles)

## Finished
- Cinematic homepage + Halloween shipped to production (PR #12 / `76242a1`)
- **Hero video sizing fix** (Cesar: “humongous” on live site)
  - Branch `cursor/hero-video-sizing-c298` → fast-forwarded to `main`
  - Portrait 9:16 clips now play in a middle-band media plane (under fixed header, above address/phone strip)
  - Stage ≈ `aspect-[9/16]` at ~90% band height with `object-cover object-center` (no full-viewport cover zoom)
  - Production live: **https://the-barber-lounge-antioch.vercel.app** (`67117f1`)
  - Note: `the-barber-lounge.vercel.app` 307s to parked `thebarberlounge.com` — use antioch / team aliases
- Evidence: `artifacts/hero-video-sizing/before-after-desktop.png`, `before-after-mobile.png`

## In flight
- Custom domain DNS / SSL still parked at HugeDomains
- Twilio KYC / SMS, Postgres, Stripe deposits — unchanged blockers

## User notes
- Cesar runs Windows via Desktop copy + Start.bat; local port may be 3000 or 3847
- Do not invent reviews or AI photos
- Do not paste `.bat` into PowerShell

## Blockers
- See `current-blockers.md` for Twilio/SMS/domain items
