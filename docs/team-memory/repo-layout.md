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
| `/admin/edit` | `src/app/admin/edit/page.tsx` | Inline CMS |
| `/admin/calendar` | `src/app/admin/calendar/page.tsx` | Set this week's Staff Hub calendar |
| `/admin/hero` | `src/app/admin/hero/page.tsx` | Hero video upload |
| `/admin/gallery` | `src/app/admin/gallery/page.tsx` | Gallery bulk upload |
| `/admin/appointments` | `src/app/admin/appointments/page.tsx` | Booking requests |
| `/admin/analytics` | `src/app/admin/analytics/page.tsx` | Postgres dashboard |
| `/admin/notifications` | `src/app/admin/notifications/page.tsx` | ntfy setup |
| `/admin/sms-setup` | `src/app/admin/sms-setup/page.tsx` | Twilio status UI |

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
| `/api/shop-week` | `shop-week/route.ts` | Staff Hub week calendar (GET public, PUT/POST admin) |
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
| `shop-week.ts` / `shop-week-store.ts` | Staff Hub week calendar (Postgres + JSON fallback) |
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
| `StaffWeekCalendar.tsx` | Staff Hub “this week” tile |
| `AdminWeekCalendarForm.tsx` | Admin week editor + JSON upload |
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
| `data/shop-week.json` | Staff Hub week calendar JSON fallback (ephemeral on Vercel) |
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
