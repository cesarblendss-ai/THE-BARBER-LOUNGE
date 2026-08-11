# Yes We Can — Repo Split Plan

**Goal:** Fork `the-barber-lounge` into a standalone **`yes-we-can-mobile`** repo for Jose's site rebuild.  
**Trigger:** **After Jose sends raw canning video** — hero edit + Week 1 SEO can proceed on the live WordPress site first; the repo split starts once footage is in hand (see [KICKOFF_CHECKLIST.md](./KICKOFF_CHECKLIST.md)).  
**Target timeline:** Phase 2 of [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) — **Week 3–6** after kickoff.  
**Budget line:** $200 API/hosting (one-time setup) · [BUDGET.md](./BUDGET.md)

---

## Why split (not a monorepo client folder)

| Reason | Detail |
|--------|--------|
| **Separate domain** | `yeswecanmobile.com` — own Vercel project, DNS, env vars |
| **Different business logic** | Quote wizard (beverage type → volume → date), not haircut booking |
| **Client ownership** | Jose gets his own repo + deploy history; barber-lounge stays shop-only |
| **SEO agent stays centralized** | Monthly runs stay in `the-barber-lounge/tools/seo-agent/` — copy output into the client repo at publish time |

---

## When to fork

### Do **not** fork yet if:

- [ ] Jose has **not** sent raw canning video ([ASSET_REQUEST.md](./ASSET_REQUEST.md))
- [ ] Hero on live site still AI image with no replacement footage queued

### Fork when **all** of these are true:

| # | Gate | Why |
|---|------|-----|
| 1 | **Raw video received** from Jose (at least one line-run clip) | Hero + `/process` gallery need real assets before the new site is worth deploying |
| 2 | **Week 1 SEO applied** on current site (title, meta, schema from v2) | Avoids a blank new deploy competing with in-progress fixes |
| 3 | **Business email confirmed** | Lead alerts + `OWNER_EMAIL` on Vercel |
| 4 | **Brand basics** — logo and/or colors (even rough) | Tailwind theme + header before first preview deploy |

### Parallel work allowed before fork

These do **not** require the split:

- Publish v2 blogs on current CMS
- GBP Week 1–4 posts
- Edit hero + social clips from Jose's footage
- Draft `content.ts` / quote config in a local branch (do not merge into barber-lounge `main`)

---

## How to fork — step by step

### 1. Create the GitHub repo

```powershell
# From Desktop (outside the-barber-lounge)
cd C:\Users\Cesar\OneDrive\Desktop
git clone C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge yes-we-can-mobile
cd yes-we-can-mobile
git remote remove origin
git remote add origin https://github.com/<your-org>/yes-we-can-mobile.git
```

Or: GitHub → **New repository** → import from local folder after `git init`.

**Repo name:** `yes-we-can-mobile`  
**Default branch:** `main`  
**Visibility:** Private (recommended until launch)

### 2. Strip barber-lounge–specific code

Delete or replace — do **not** ship these in the client repo:

| Remove / replace | Path | Notes |
|------------------|------|-------|
| Shop copy | `src/lib/content.ts` | Yes We Can services, testimonials (Shanty Shack, J.L. Rosillo), can formats |
| Booking config | `src/lib/booking-config.ts` | → `quote-config.ts` (see booking-agent reuse below) |
| Wizard services | `src/lib/wizard-helpers.ts` | Beverage types, case volumes, not haircuts |
| Appointments JSON | `data/appointments.json` | → Postgres leads table (see below) |
| Retail / shop-log | `src/app/shop-log/`, `src/lib/retail-config.ts`, product APIs | Barber-only |
| Booksy references | `BOOKING_URL`, barber CTAs | Replace with quote CTA + `(707) 738-6502` |
| Barber blog posts | `src/lib/blog-posts.ts` | Seed from v2 SEO output slugs |
| Barber schema / constants | `src/lib/constants.ts` | Antioch mobile canning, `yeswecanmobile.com` |
| Admin pages not needed | `/admin/products`, retail routes | Keep: edit, hero, gallery, leads admin |
| SEO agent | `tools/seo-agent/` | **Keep a copy** for convenience OR pull blogs from parent repo — do not run agency billing twice |

Update `package.json`:

```json
"name": "yes-we-can-mobile"
```

### 3. Reuse the booking-agent module (quote wizard)

The portable module lives at `src/lib/booking-agent/`. For Yes We Can, reuse the **pattern**, not the barber copy.

**Copy as-is (no edits inside the module):**

```
src/lib/booking-agent/
  types.ts
  format.ts
  availability.ts
  fallback.ts
  agent.ts
  index.ts
  README.md
```

**Create site-specific config** — `src/lib/quote-config.ts`:

```ts
import type { BookingAgentConfig } from "@/lib/booking-agent";

export const YES_WE_CAN_QUOTE_CONFIG: BookingAgentConfig = {
  businessName: "Yes We Can Mobile Solutions",
  address: "Antioch, CA — Northern California mobile service",
  phone: "(707) 738-6502",
  timezone: "America/Los_Angeles",
  hours: [
    { day: "Monday", hours: "8:00 AM – 6:00 PM" },
    // … quote response hours, not canning run hours
  ],
  services: [
    { name: "Craft Beer", price: "Quote", time: "Min 200 cases", description: "Mobile canning — 8.4/12/16 oz" },
    { name: "Cider", price: "Quote", time: "Min 200 cases", description: "…" },
    { name: "Wine", price: "Quote", time: "Min 200 cases", description: "…" },
    { name: "RTD Cocktails", price: "Quote", time: "Min 200 cases", description: "…" },
  ],
  extraServiceNames: ["Labeling", "Date coding", "Nitrogen dosing"],
  tone: "Professional packaging partner — clear, brewery-friendly, no fluff.",
};
```

**Adapt the flow for quotes (not appointments):**

| Barber Lounge | Yes We Can |
|---------------|------------|
| `POST /api/appointment-request` | `POST /api/quote-request` |
| `appointments-store.ts` (JSON) | `leads-store.ts` → **Postgres** (`Lead` model) |
| `checkAvailability(day, time)` | Optional: preferred canning date + lead time check |
| `BookingChatbot` FAB | `QuoteWizard` on `/quote` |
| Confirmation code `TBL-XXXX` | Quote ref `YWC-XXXX` |
| SMS receipt to customer | Email or SMS: "We received your quote request" |

**Wire the API route** (same 3-step pattern as [booking-agent README](../../../src/lib/booking-agent/README.md)):

1. Copy `booking-agent/` + add `quote-config.ts`
2. Add `src/app/api/quote-chat/route.ts` (mirror `booking-chat/route.ts`)
3. Point wizard UI at `/api/quote-chat`; on `readyToSubmit`, POST to `/api/quote-request`

**Rule-based fallback works without OpenAI** — important for the $200 hosting budget if API spend is tight.

### 4. Pages to ship (Phase 2)

From [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md):

| Route | Source in barber-lounge | Yes We Can change |
|-------|-------------------------|-------------------|
| `/` | `src/app/page.tsx` | Hero **video**, 3 lines, testimonials, quote CTA |
| `/services` | `services/page.tsx` | Canning, labeling, formats (8.4/12/16 oz) |
| `/process` | New or gallery pattern | Video gallery — canning run clips |
| `/areas` | `areas/[city]/page.tsx` | Northern CA cities from SEO v2 |
| `/blog` | `blog/` | v2 posts — slugs in [KICKOFF_CHECKLIST.md](./KICKOFF_CHECKLIST.md) |
| `/quote` | Wizard from `BookingChatbot` | Quote wizard |
| `/admin` | Admin shell | Leads list, copy edit, video upload |

---

## Vercel project setup

Create a **new Vercel project** — do not add yeswecanmobile.com as a second domain on `the-barber-lounge`.

### Create project

1. [vercel.com/new](https://vercel.com/new) → Import **`yes-we-can-mobile`** GitHub repo  
2. **Framework preset:** Next.js (auto-detected)  
3. **Root directory:** `/` (repo root)  
4. **Build command:** `npm run build` (same as `vercel.json` in template)  
5. **Install command:** `npm install`

Or CLI:

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\yes-we-can-mobile
npx vercel link          # create new project: yes-we-can-mobile
npx vercel --prod --yes  # first production deploy
```

### Domain

| Record | Value |
|--------|-------|
| **Apex** `yeswecanmobile.com` | Vercel A `@` → `76.76.21.21` **or** nameservers → `ns1.vercel-dns.com` / `ns2.vercel-dns.com` |
| **www** | CNAME → `cname.vercel-dns.com` (Vercel shows exact target after add) |

```powershell
npx vercel domains add yeswecanmobile.com
npx vercel domains add www.yeswecanmobile.com
```

Set in code after DNS propagates:

```ts
// src/lib/constants.ts
export const SITE_URL = "https://yeswecanmobile.com";
```

Redeploy so sitemap, canonical URLs, and schema use the production domain.

### Postgres (leads + optional analytics)

**Do not use JSON file persistence on Vercel** — same EROFS issue as barber-lounge prod ([current-blockers.md](../../team-memory/current-blockers.md)).

1. Vercel project → **Storage** → **Create Database** → **Postgres** (Neon)  
2. Connect to `yes-we-can-mobile` → `DATABASE_URL` auto-injected  
3. Extend `prisma/schema.prisma`:

   - `Lead` — quote requests (name, brewery, beverage, volume, phone, preferred date, status)  
   - Reuse `AnalyticsEvent` pattern from barber-lounge if desired  

4. Deploy hooks:

```powershell
npx vercel env pull .env.local
npm run db:push
# optional seed script for blog posts
npx vercel --prod --yes
```

### Cutover from WordPress / current host

| Step | Action |
|------|--------|
| 1 | Preview deploy on `*.vercel.app` — Jose sign-off |
| 2 | Lower TTL on DNS 24h before switch |
| 3 | Point `yeswecanmobile.com` to Vercel |
| 4 | 301 map any old URLs (contact → `/quote`, services → `/services`) |
| 5 | Search Console → change of address / resubmit sitemap |

---

## Environment variables

Copy from barber-lounge **pattern**, generate **new secrets** for Yes We Can (never reuse barber ntfy topic or admin key).

### Required for launch

| Variable | Example / notes | Vercel env |
|----------|-----------------|------------|
| `ADMIN_UPLOAD_KEY` | New random string — protects `/admin/*`, uploads | Production + Preview |
| `DATABASE_URL` | Auto from Vercel Postgres connect | Production (+ Preview if testing leads) |
| `NTFY_TOPIC` | Unique, e.g. `yes-we-can-leads-m8k2p4` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://yeswecanmobile.com` | Production |

### Lead notifications (pick at least one)

| Variable | Purpose |
|----------|---------|
| `NTFY_TOPIC` | **Primary** — push to Jose's phone when quote submitted (same pattern as barber-lounge) |
| `OWNER_PHONE` | Jose's mobile E.164 — SMS via Twilio |
| `TWILIO_ACCOUNT_SID` | Only if SMS enabled |
| `TWILIO_AUTH_TOKEN` | |
| `TWILIO_PHONE_NUMBER` | Shared Twilio number OK across clients |
| `TWILIO_TRIAL_MODE` | `1` until Twilio account upgraded |
| `RESEND_API_KEY` | Optional email backup |
| `OWNER_EMAIL` | Jose's business email (from asset request) |

### Optional

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Quote chat AI path; fallback works without it |
| `PUSH_NOTIFICATION_URL` | Override ntfy endpoint |
| `SERPER_API_KEY` | Rank scans — stays in **seo-agent** parent repo, not client site |

### Not needed for Yes We Can

| Variable | Why skip |
|----------|----------|
| `RETAIL_LOG_PIN` | Barber shop-log only |
| `CABINET_WEBHOOK_SECRET` | Retail door sensor |
| Barber `OWNER_PHONE` default | Replace with Jose's number |

### Local dev template

Create `.env.example` in the new repo (never commit `.env.local`):

```env
ADMIN_UPLOAD_KEY=
DATABASE_URL=
OPENAI_API_KEY=
NTFY_TOPIC=yes-we-can-leads-dev
OWNER_PHONE=+17077386502
OWNER_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_TRIAL_MODE=1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Pull production vars locally:

```powershell
npx vercel env pull .env.local
```

---

## What stays in `the-barber-lounge`

| Asset | Location | Workflow |
|-------|----------|----------|
| Client docs | `docs/clients/yes-we-can/` | This plan, budget, kickoff |
| SEO agent + profile | `tools/seo-agent/` | `python run.py seo "Yes We Can Mobile" --memory` |
| v2 output | `tools/seo-agent/output/yes_we_can_mobile_solutions_2026_08_08_v2/` | Copy blogs/meta into `yes-we-can-mobile` at publish |
| Agency playbook | `tools/seo-agent/AGENCY_PLAYBOOK.md` | Unchanged |

**No submodule required** for v1 — copy-on-publish keeps the client repo simple. Revisit git submodule or shared `@org/site-kit` package only if a third client site clones the same stack.

---

## Launch checklist (repo split complete)

| # | Task | Done |
|---|------|------|
| 1 | GitHub repo `yes-we-can-mobile` created, barber-specific code removed | ☐ |
| 2 | `quote-config.ts` + `/quote` wizard + `/api/quote-request` → Postgres | ☐ |
| 3 | Hero video from Jose's footage on `/` | ☐ |
| 4 | Vercel project + Postgres connected | ☐ |
| 5 | Env vars set (new `ADMIN_UPLOAD_KEY`, `NTFY_TOPIC`, Jose `OWNER_*`) | ☐ |
| 6 | Preview URL reviewed by Jose | ☐ |
| 7 | DNS cutover `yeswecanmobile.com` | ☐ |
| 8 | v2 blogs live on new `/blog` slugs | ☐ |
| 9 | Test quote submit → Jose gets ntfy (and SMS if Twilio live) | ☐ |
| 10 | Search Console sitemap submitted | ☐ |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) | Phases, pages, content cadence |
| [KICKOFF_CHECKLIST.md](./KICKOFF_CHECKLIST.md) | Week 1 before fork |
| [ASSET_REQUEST.md](./ASSET_REQUEST.md) | Video + email ask for Jose |
| [ENGAGEMENT.md](./ENGAGEMENT.md) | Contract, domain, phone |
| [booking-agent README](../../../src/lib/booking-agent/README.md) | Module plug-in steps |
| [booking-system.md](../../org-conventions/booking-system.md) | Reference architecture to adapt |

---

## Text to send Jose (after video received)

> Got your footage — editing the homepage hero now. Next I'm moving the site to our new stack (same setup I use for high-performance local business sites). You'll get a preview link before we switch yeswecanmobile.com over. Quote form will text you when a brewery inquires.
