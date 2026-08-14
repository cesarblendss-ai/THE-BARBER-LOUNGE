# The Barber Lounge — Ground Truth

**Last verified:** 2026-08-08  
**Source of truth for copy:** `src/lib/content.ts`  
**SEO client profile:** `tools/seo-agent/clients/the_barber_lounge.json`  
**Live deploy URLs:** `docs/team-memory/deploy.md`  
**Current blockers:** `docs/team-memory/current-blockers.md`

---

## Business info

| Field | Value |
|-------|-------|
| **Name** | The Barber Lounge |
| **Address** | 1518 A St, Antioch, CA 94509 |
| **Phone** | (925) 209-5995 (`+19252095995`) |
| **Email** | thebarberlounge00@gmail.com |
| **Instagram** | [@thebarberlounges1](https://www.instagram.com/thebarberlounges1/) |
| **Rating (site copy)** | 5.0★ · 180+ reviews |
| **Booksy booking** | https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch |
| **Planned custom domain** | `thebarberlounge.com` — set in `src/lib/constants.ts` as `SITE_URL` |

### Hours

| Day | Hours |
|-----|-------|
| Sunday | 8:00 AM – 7:00 PM |
| Monday | 10:00 AM – 7:00 PM |
| Tuesday | **Closed** |
| Wednesday | 9:00 AM – 7:00 PM |
| Thursday | 9:00 AM – 7:00 PM |
| Friday | 9:00 AM – 7:00 PM |
| Saturday | 8:00 AM – 7:00 PM |

### Published services (Booksy-confirmed pricing)

| Service | Price | Duration |
|---------|-------|----------|
| Signature Haircut | $50 | 1 hr |
| Signature Haircut & Beard | $65 | 1 hr |

**Draft / unconfirmed** (hidden from public pages — names start with `[` in `content.ts`): Kids Haircut, Beard Trim & Line-Up, Hot Towel Shave.

### Team + Instagram handles

| Name | IG handle |
|------|-----------|
| Alexis Franco | `lexblendzz` |
| Braulio Gómez | `925.liocutz` |
| Cesar Silva | `cesarblendss` |
| Kristian Guerra | `mr.icylinez` |
| Sebastian Guardado | `blendz_bysebas` |

Helper: `instagramProfileUrl()` in `src/lib/content.ts`.

---

## Feature inventory (architecture)

| Feature | Key paths |
|---------|-----------|
| Marketing site (Home, About, Services, FAQ, Testimonials, Contact, Gallery, Blog) | `src/app/**` |
| Booking wizard (tap-to-book FAB) | `src/components/BookingChatbot.tsx`, `src/app/api/appointment-request/route.ts` |
| Internal availability (not Booksy API) | `src/lib/appointments-store.ts`, `src/app/api/availability/route.ts` |
| Portable booking-agent module | `src/lib/booking-agent/` |
| AI booking chat (optional) | `src/app/api/booking-chat/route.ts` |
| SMS receipts (Twilio) | `src/lib/sms-receipt.ts`, `/admin/sms-setup` |
| Owner push (ntfy) | `src/lib/notifications.ts`, `/admin/notifications` |
| Analytics (Vercel Postgres + Prisma) | `prisma/schema.prisma`, `/admin/analytics` |
| Edit mode (inline CMS) | `src/components/EditModeRoot.tsx`, `/admin/edit` |
| Admin: hero video, gallery upload, appointments | `src/app/admin/**` |
| SEO agent (monthly content factory) | `tools/seo-agent/seo_agent.py` |
| Blog | `src/lib/blog-posts.ts`, `src/app/blog/` |
| Local SEO schema (`hasOfferCatalog`, JSON-LD) | `src/lib/content.ts`, `src/lib/seo.ts` |

**Runtime status** (blocked, live, env wired): see `docs/team-memory/current-blockers.md` and `deploy.md`.

---

## Agency context

- **Case study #1** for Cesar's local SEO agency (`case_study: true` in client JSON).
- Package on file: **Growth** ($997/mo tier — see `marketing-agency-scale.md`).
