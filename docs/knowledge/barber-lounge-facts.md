> **Canonical copy:** [`docs/org-conventions/barber-lounge-facts.md`](../org-conventions/barber-lounge-facts.md) — update there, not here.

# The Barber Lounge — Ground Truth

**Last verified:** 2026-08-08  
**Source of truth for copy:** `src/lib/content.ts`  
**SEO client profile:** `tools/seo-agent/clients/the_barber_lounge.json`

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
| **Vercel URL (share)** | https://the-barber-lounge-antioch.vercel.app |
| **Short Vercel alias** | https://the-barber-lounge.vercel.app → redirects to `-antioch` |
| **Team alias** | https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app |
| **Planned custom domain** | `thebarberlounge.com` — set in `src/lib/constants.ts` as `SITE_URL` but **not live** |

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
| Cesar Silva | `cesarblends` |
| Kristian Guerra | `mr.icylinez` |
| Jose Fuentes | `jfenz_` |
| Sebastian Guardado | `blendz_bysebas` |

Helper: `instagramProfileUrl()` in `src/lib/content.ts`.

---

## What's built

| Feature | Status | Key paths |
|---------|--------|-----------|
| Marketing site (Home, About, Services, FAQ, Testimonials, Contact, Gallery, Blog) | Live in codebase + deployed | `src/app/**` |
| Booking wizard (tap-to-book FAB) | Works locally; saves to JSON store | `src/components/BookingChatbot.tsx`, `src/app/api/appointment-request/route.ts` |
| Internal availability (not Booksy API) | Works | `src/lib/appointments-store.ts`, `src/app/api/availability/route.ts` |
| Portable booking-agent module | Ready to reuse | `src/lib/booking-agent/` |
| AI booking chat (optional) | Works when `OPENAI_API_KEY` set | `src/app/api/booking-chat/route.ts` |
| SMS receipts (Twilio) | **Blocked** — KYC error 20003 | `src/lib/sms-receipt.ts`, `/admin/sms-setup` |
| Owner push (ntfy) | Configured locally (`NTFY_TOPIC` set) | `src/lib/notifications.ts`, `/admin/notifications` |
| Analytics (Vercel Postgres + Prisma) | Code ready; **DB not connected on Vercel** | `prisma/schema.prisma`, `/admin/analytics` |
| Edit mode (inline CMS) | Works with `ADMIN_UPLOAD_KEY` | `src/components/EditModeRoot.tsx`, `/admin/edit` |
| Admin: hero video, gallery upload, appointments | Built | `src/app/admin/**` |
| SEO agent (monthly content factory) | Runs; v2 output fixed | `tools/seo-agent/seo_agent.py` |
| Blog (4 posts live in code) | `/blog` + 4 slugs | `src/lib/blog-posts.ts` |
| Local SEO schema (`hasOfferCatalog`, JSON-LD) | In layout | `src/lib/content.ts`, `src/lib/seo.ts` |

---

## What's blocked / TODO

| Blocker | Detail | Doc |
|---------|--------|-----|
| Twilio SMS | Upgraded account; **error 20003** (Trust Hub KYC). EIN vs CA entity `B20250377078` mismatch caused form errors. | `twilio-sms-status.md` |
| Vercel Output Directory | If URLs 404, clear Output Directory in project settings (see deploy doc) | `vercel-deploy-status.md` |
| Postgres on Vercel | `DATABASE_URL` not connected — analytics no-op in production | `vercel-deploy-status.md` |
| Custom domain | `SITE_URL` still `thebarberlounge.com` — canonical/schema may point at wrong URL until updated | `vercel-deploy-status.md` |
| Booksy integration | No API — website bookings are **requests**; staff enters in Booksy manually | `booking-system.md` |
| Service menu incomplete | Kids / beard / shave pricing still placeholders in `content.ts` | — |

---

## Key file paths (quick reference)

```
src/lib/content.ts              # All public copy, hours, team, services
src/lib/constants.ts            # SITE_URL, GEO, logo
src/lib/booking-config.ts       # Booking agent config for this shop
src/lib/appointments-store.ts   # Availability + appointment persistence
data/appointments.json          # Appointment records (local/Vercel ephemeral)
tools/seo-agent/                # Monthly SEO production
tools/seo-agent/output/         # Generated deliverables (not committed)
```

## Agency context

- **Case study #1** for Cesar's local SEO agency (`case_study: true` in client JSON).
- Package on file: **Growth** ($997/mo tier — see `marketing-agency-scale.md`).
