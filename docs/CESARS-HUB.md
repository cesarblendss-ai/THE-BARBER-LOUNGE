# Cesar’s Hub — use this without Cursor

**This is the shop operating system.** It lives on the live Barber Lounge website, in GitHub, and on Vercel. Cursor is optional. If Cursor is frozen, locked, or gone, the hub still works.

**Last verified:** 2026-08-16

---

## Bookmark this (phone home screen)

**https://the-barber-lounge-antioch.vercel.app/hub**

Do **not** use `the-barber-lounge.vercel.app` or `thebarberlounge.com` until DNS is fixed — those currently park on HugeDomains.

The hub is its own app: no public-site header, no Book Now bar, no chatbot. Add to Home Screen and it opens standalone.

### First-time unlock

1. Open the URL above.
2. Enter the hub key (`ADMIN_UPLOAD_KEY` in Vercel → Production). Never paste it in chat.
3. Share → Add to Home Screen.
4. Cookie lasts 7 days. Unlock again if it expires.

That’s the whole product. No agent required.

In-hub copy of this guide: **`/hub/manual`**

---

## What is whose

| Surface | Who | URL |
|---------|-----|-----|
| **Cesar’s Hub** | You (owner) | `/hub` — calendar, bookings, retail, analytics, alerts, shop manual |
| **Staff Hub** | Floor | `/admin` — this week (read), reviews, website uploads |
| **Public site** | Clients | `/` — marketing + Booksy |

Old operator URLs (`/admin/products`, `/admin/appointments`, …) redirect into `/hub`.

---

## What’s inside the hub

| Tile | What you do |
|------|-------------|
| Shop manual | URLs, recovery, hours — stored in the hub, not in Cursor |
| This week | See the floor calendar |
| Set this week | Open/closed, notes, blocked slots |
| Appointments | Website booking requests → enter in Booksy |
| Retail | Inventory, unpaid barber grabs, Friday settle |
| Shop log | Barbers log product (`/shop-log`) |
| Site traffic | Anonymous visits (not Google Maps call taps) |
| Phone push | ntfy when someone books |
| SMS setup | Twilio status |
| Review QR | Print card for the shop |
| Website tools | Edit copy, hero, gallery (`/admin`) |

---

## Where it is stored (so you cannot “lose the folders”)

| Copy | Where |
|------|--------|
| Code | GitHub: `cesarblendss-ai/THE-BARBER-LOUNGE` — branch/PR then `main` |
| Live app | Vercel project `the-barber-lounge` |
| Shop data | Postgres (`DATABASE_URL` / `TBLDB_*`) when connected; otherwise JSON under `data/` (ephemeral on Vercel) |
| This guide | `docs/CESARS-HUB.md` in the same repo **and** `/hub/manual` on the live site |

Cursor chats and local OneDrive folders are **not** the source of truth. GitHub + the live `/hub` URL are.

---

## If you lose Cursor tomorrow

1. Open the bookmark: https://the-barber-lounge-antioch.vercel.app/hub
2. Unlock with the Vercel key.
3. Run the shop from the tiles. Open **Shop manual** if you need URLs or hours.
4. Code backup: GitHub → THE-BARBER-LOUNGE.

You do not need an agent to take a booking, log retail, or post the week.

---

## Optional: website vs hub

Need to change homepage copy or photos? Hub → **Website tools**, or `/admin/edit`, `/admin/hero`, `/admin/gallery`.

Need to run the business? Stay in `/hub`.
