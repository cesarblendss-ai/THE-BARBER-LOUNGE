# Repo Layout — Key Paths

**Last verified:** 2026-08-16

Quick map for agents navigating the codebase. Architecture rationale: `docs/org-conventions/tech-stack-decisions.md`.

---

## Top level

```
the-barber-lounge/
├── src/                    # Next.js app (pages, components, lib, API routes)
├── public/                 # Static assets (gallery, logo, hero video)
├── data/                   # appointments.json (local persistence)
├── prisma/                 # Analytics schema
├── tools/seo-agent/        # Monthly SEO content factory (Python)
├── docs/
│   ├── org-conventions/    # Read-only reference
│   └── team-memory/        # Working state (this folder)
├── scripts/                # test-sms.ts, booking fallback tests
├── AGENTS.md               # Agent entry point
└── .env.local              # Secrets (gitignored)
```

---

## `src/` — application

### Pages (`src/app/`)

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Homepage |
| `/about` | `src/app/about/page.tsx` | |
| `/services` | `src/app/services/page.tsx` | |
| `/faq` | `src/app/faq/page.tsx` | |
| `/testimonials` | `src/app/testimonials/page.tsx` | |
| `/contact` | `src/app/contact/page.tsx` | |
| `/gallery` | `src/app/gallery/page.tsx` | |
| `/blog` | `src/app/blog/page.tsx` | |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | |
| `/admin` | `src/app/admin/page.tsx` | Staff Hub — floor week + reviews + website tools |
| `/admin/edit` | `src/app/admin/edit/page.tsx` | Inline CMS |
| `/admin/hero` | `src/app/admin/hero/page.tsx` | Hero video upload |
| `/admin/gallery` | `src/app/admin/gallery/page.tsx` | Gallery bulk upload |
| `/hub` | `src/app/hub/page.tsx` | **Cesar’s Hub** — shop OS (gated, own chrome + PWA). Guide: `docs/CESARS-HUB.md` |
| `/hub/estimates` | `src/app/hub/estimates/page.tsx` | Create / track estimates, e-sign, Stripe deposit |
| `/hub/manual` | `src/app/hub/manual/page.tsx` | Recovery + shop facts — works without Cursor |
| `/hub/calendar` | `src/app/hub/calendar/page.tsx` | Set this week |
| `/hub/appointments` | `src/app/hub/appointments/page.tsx` | Booking requests |
| `/hub/products` | `src/app/hub/products/page.tsx` | Retail inventory |
| `/hub/analytics` | `src/app/hub/analytics/page.tsx` | Postgres dashboard |
| `/hub/notifications` | `src/app/hub/notifications/page.tsx` | ntfy setup |
| `/hub/sms-setup` | `src/app/hub/sms-setup/page.tsx` | Twilio status UI |

### API routes (`src/app/api/`)

| Route | File | Purpose |
|-------|------|---------|
| `/api/appointment-request` | `appointment-request/route.ts` | Create booking + notify |
| `/api/availability` | `availability/route.ts` | Slot availability |
| `/api/appointments` | `appointments/route.ts` | Admin CRUD |
| `/api/appointments/[code]/calendar` | `appointments/[code]/calendar/route.ts` | ICS download |
| `/api/booking-chat` | `booking-chat/route.ts` | AI chat turns |
| `/api/analytics` | `analytics/route.ts` | Event ingestion |
| `/api/analytics/summary` | `analytics/summary/route.ts` | Dashboard data |
| `/api/site-content` | `site-content/route.ts` | Edit mode saves |
| `/api/admin/edit-auth` | `admin/edit-auth/route.ts` | Admin cookie auth |
| `/api/estimates` | `estimates/route.ts` | Create / list estimates |
| `/api/estimates/[token]` | `estimates/[token]/route.ts` | Public estimate GET |
| `/api/estimates/[token]/sign` | `estimates/[token]/sign/route.ts` | Typed-name e-sign |
| `/api/estimates/[token]/checkout` | `estimates/[token]/checkout/route.ts` | Stripe Checkout session |
| `/api/stripe/webhook` | `stripe/webhook/route.ts` | Mark estimate paid |
| `/api/upload-gallery` | `upload-gallery/route.ts` | Gallery uploads |
| `/api/upload-hero-video` | `upload-hero-video/route.ts` | Hero video upload |
| `/api/classify-gallery` | `classify-gallery/route.ts` | AI gallery sort |
| `/api/sms-test` | `sms-test/route.ts` | Dev SMS test |
| `/api/sms-setup-status` | `sms-setup-status/route.ts` | Twilio status poll |

### Core lib (`src/lib/`)

| Path | Purpose |
|------|---------|
| `content.ts` | **Site copy source of truth** — hours, team, services, schema data |
| `constants.ts` | `SITE_URL`, geo, logo paths |
| `get-site-content.ts` | Merged static + edit overrides |
| `blog-posts.ts` | Blog post data |
| `seo.ts` | Metadata + JSON-LD helpers |
| `booking-config.ts` | This shop's booking agent config |
| `appointments-store.ts` | Availability engine + JSON persistence |
| `wizard-helpers.ts` | Booking wizard service chips |
| `sms-receipt.ts` | Twilio SMS templates |
| `notifications.ts` | ntfy owner push |
| `booking-agent/` | Portable booking module (reuse on other sites) |

### Key components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `BookingChatbot.tsx` | Tap-to-book FAB wizard |
| `BookingReceipt.tsx` | Post-booking receipt |
| `EditModeRoot.tsx` | Inline edit wrapper |
| `Header.tsx`, `Footer.tsx` | Layout |
| `GalleryUpload.tsx`, `GalleryBulkUpload.tsx` | Admin gallery |
| `HeroVideoUpload.tsx` | Admin hero |
| `AdminAppointments.tsx` | Appointment list |

---

## `tools/seo-agent/`

| Path | Purpose |
|------|---------|
| `seo_agent.py` | Main agent script |
| `clients/the_barber_lounge.json` | Client profile |
| `output/` | Generated deliverables (gitignored) |
| `AGENCY_PLAYBOOK.md` | Full agency SOP |
| `PUBLISHING_CHECKLIST.md` | VA publish steps |
| `README.md` | Run instructions |

Latest good output: `tools/seo-agent/output/the_barber_lounge_2026_08_08_v2/`

---

## Data + config

| Path | Purpose |
|------|---------|
| `data/appointments.json` | Appointments + blocked slots |
| `prisma/schema.prisma` | Analytics DB schema |
| `.env.example` | Documented env var names |
| `tailwind.config.ts` | Brand colors (see `style-guide.md`) |

---

## Docs

| Path | Access | Purpose |
|------|--------|---------|
| `docs/org-conventions/` | Read-only | Style, security, architecture, business facts |
| `docs/team-memory/` | Read-write | Deploy, blockers, flaky tests |
| `docs/knowledge/` | Legacy redirects | Old entry point → new structure |
