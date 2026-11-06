# Codex Handoff — The Barber Lounge

**Owner:** Cesar Silva (`cesarblendss`)  
**Prepared:** 2026-11-06  
**Repo:** `cesarblendss-ai/THE-BARBER-LOUNGE`  
**Live site:** https://thebarberloungeca.com → `/book` **is** the website

---

## COPY FROM HERE

```
You are Codex working on The Barber Lounge (Antioch, CA) for Cesar Silva.

LIVE: https://thebarberloungeca.com  ( / → /book ). Repo: cesarblendss-ai/THE-BARBER-LOUNGE
Stack: Next.js (App Router) + Vercel + Twilio (KYC blocked) + ntfy owner alerts + Booksy (no public create API) + internal appointments/leads JSON (+ Neon Postgres for CMS/analytics).

WHAT'S LIVE
- Book-first site: / redirects to /book (Tim Cho 4-step funnel)
- Lead capture: POST /api/lead + /admin/leads
- Calendar sync + shop-wide busy blocks: /admin/calendar-sync
- Booksy LIVE AVAILABILITY sync for all staffers (PR #20 MERGED) — cron every 5 min via public customer time_slots API (no Booksy password)
- Prices: Signature Haircut $50 · Haircut & Beard $65 ONLY
- Call Now: tel:+19252095995
- Owner alerts: ntfy says CONFIRM IN BOOKSY

#1 BOTTLENECK
Website bookings still may need MANUAL Booksy entry (no official create-appointment API). Agent work to eliminate double-entry is on cursor/booksy-auto-book / related (deep-link handoff / create paths — do not invent a fake Booksy create API).

TIM SAUCE (do not dump 34 transcripts into context)
- Tim Cho conversion map: docs/team-memory/tim-cho-conversion.md + docs/team-memory/tim-book-ui.md
- Tim Chao (@thetimchao) YouTube captions: docs/team-memory/tim-chao-youtube/ (INDEX.md + transcripts/ + ALL-TRANSCRIPTS.md). Themes: same-page book, CRM/SMS follow-up, capture contact before handoff, obvious Call CTA. Read INDEX + the conversion docs first.

CONSTRAINTS
- NEVER print secrets from .env.local / Vercel (ADMIN_UPLOAD_KEY, TWILIO_*, DATABASE_URL, Booksy passwords). See docs/org-conventions/security.md
- Never invent prices beyond $50 / $65
- Style: barbershop front desk Antioch — NO "Bet", no Gen-Z filler (docs/org-conventions/style-guide.md)
- Staffer Booksy IDs: Alexis 1124582 · Braulio 1740160 · Cesar 1653463 · Kristian 1659337 · Sebastian 1691142 · Business 1180862
- Prefer thebarberloungeca.com (thebarberlounge.com still DNS-parked)

MEMORY ORDER
1) docs/org-conventions/  2) docs/team-memory/  3) AGENTS.md / docs/knowledge/INDEX.md

YOUR NEXT JOBS (pick in order unless Cesar says otherwise)
1. Eliminate Booksy double-entry safely — finish deep-link / handoff so staff (or customer) lands on the exact Booksy slot without retyping; never store Booksy Biz passwords
2. Keep /book slots = Booksy opens (verify cron + booksyLiveSync; harden CRON_SECRET if missing)
3. Durable leads/appointments on Postgres/KV (JSON is ephemeral on Vercel)
4. SMS campaigns only after Twilio Trust Hub KYC — do not claim SMS live
5. Optional: Stripe deposit env for estimates; CRM haircut notes UI later

Read the full brief below this paste if present, or docs/team-memory/CODEX-HANDOFF.md in-repo.
```

## COPY TO HERE

---

# Full brief (for Codex + humans)

## 1. Who / what

| | |
|--|--|
| **Business** | The Barber Lounge — barbershop, Antioch CA |
| **Address** | 1518 A St, Antioch, CA 94509 |
| **Phone** | (925) 209-5995 · `tel:+19252095995` |
| **Owner / operator** | Cesar Silva (`cesarblendss`, IG) |
| **Team** | Alexis Franco, Braulio Gómez, Cesar Silva, Kristian Guerra, Sebastian Guardado |
| **Primary URL** | https://thebarberloungeca.com |
| **Canonical book** | https://thebarberloungeca.com/book |
| **Booksy business** | `1180862` — https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch |
| **Vercel project** | `cesarblendss-7234s-projects/the-barber-lounge` |

**Product reality:** The marketing homepage soft-lands into booking. `/` permanent-redirects to `/book`. The Tim Cho four-step funnel **is** the site.

---

## 2. Stack

| Layer | Choice |
|-------|--------|
| App | Next.js App Router (`src/app`) |
| Host | Vercel |
| Booking UI | `TimBookWizard` on `/book` (+ older FAB `BookingChatbot` still in tree) |
| Availability | Booksy public customer `time_slots` + internal appointments + busy blocks |
| Persistence | `data/appointments.json`, `data/leads.json` (ephemeral on Vercel) · Neon/Postgres for CMS/analytics |
| Owner alert | **ntfy** (`NTFY_TOPIC`) — primary while Twilio KYC blocked |
| Customer SMS | Twilio — **not live** (Trust Hub / error 20003) |
| Booksy | Live **read** of open slots. **No** official public create-appointment API |
| Analytics | GA4 + admin analytics |

Key docs:

- `docs/org-conventions/tech-stack-decisions.md`
- `docs/org-conventions/booking-system.md`
- `docs/team-memory/calendar-sync-agent.md`
- `docs/team-memory/deploy.md`
- `docs/team-memory/current-blockers.md`

---

## 3. Tim Cho audit + Tim Chao YouTube transcripts

### Tim Cho (conversion / UI)

Shipped from Tim Cho AABLENDZ-style audit:

| Point | Status |
|-------|--------|
| Strong Book CTA / funnel | ✅ `/book` is primary |
| Same-site book (don't dump off-site first) | ✅ Booksy is fallback / confirm path |
| Transparent prices $50 / $65 | ✅ |
| Capture name/phone + opt-in | ✅ step 4 + lead modal → `/api/lead` |
| Obvious Call Now | ✅ `tel:+19252095995` |
| SMS/email campaigns + CRM notes | 🟡 hooks only — campaigns blocked |

Docs:

- `docs/team-memory/tim-cho-conversion.md`
- `docs/team-memory/tim-book-ui.md`

### Tim Chao YouTube (`@thetimchao`)

**Path:** `docs/team-memory/tim-chao-youtube/`

| File | Use |
|------|-----|
| `INDEX.md` | 39 public videos, 34 transcribed — start here |
| `transcripts/<id>.md` | Per-video captions |
| `ALL-TRANSCRIPTS.md` | Concat dump — **do not paste whole file into Codex** (~huge) |
| `tim-chao-youtube-transcripts.zip` | Archive |

### Tim sauce — 1-page distilled themes (for Codex)

Use these plays; pull specific transcripts only when needed:

1. **Same-page book** — keep intent on your domain; off-site Booksy is confirm/fallback, not the first click.
2. **Capture contact before handoff** — name/phone (+ SMS/email opt-in) before you lose the lead.
3. **Obvious Call CTA** — phone must be one tap at every book-intent surface.
4. **CRM / follow-up loop** — store prefs + notes; SMS/email campaigns unlock after KYC + email provider (do not fake “SMS live”).
5. **Agency ops flavor** (from Chao archive) — ship fast, prove one local case study (this shop), sell the system later; don’t confuse agency course content with shop product scope unless Cesar asks.

---

## 4. What’s live (ground truth)

| Item | Live? |
|------|-------|
| `/` → `/book` (Tim funnel = website) | ✅ |
| Lead capture + admin leads | ✅ |
| Calendar sync admin + busy-block paste | ✅ |
| Shop-wide Booksy **live availability** sync (all staffers) | ✅ **PR #20 merged** |
| Cron every 5 min `/api/cron/sync-booksy` | ✅ |
| `/book` filters by barber · 7-day window · `lastSyncedAt` / `booksyLiveSync` | ✅ |
| ntfy **CONFIRM IN BOOKSY** on requests | ✅ |
| Auto-create appointments **inside** Booksy | ❌ no public create API |
| Customer SMS campaigns | ❌ Twilio KYC |
| `thebarberlounge.com` | ❌ still HugeDomains parking — use **ca.com** |

**Staffer IDs (Booksy):**

| Barber | ID |
|--------|----|
| Alexis Franco | `1124582` |
| Braulio Gómez | `1740160` |
| Cesar Silva | `1653463` |
| Kristian Guerra | `1659337` |
| Sebastian Guardado | `1691142` |

Bryant `1860726` exists on Booksy but is **not** on public roster — omit until added to `ABOUT.team`.

**Services (public):** Signature Haircut **$50** · Signature Haircut & Beard **$65** (1 hr). Do not invent Kids / Beard-only / Shave prices on public pages.

---

## 5. #1 remaining bottleneck

**Manual Booksy appointment entry / double-entry.**

- Website captures a **request** (`POST /api/appointment-request` → receipt `TBL-…`).
- Staff get ntfy: **CONFIRM IN BOOKSY** and may still retype into Booksy.
- Availability **reads** are solved (PR #20). **Creates** are not.

**In-flight agent work:** `cursor/booksy-auto-book` / related — deep-link handoff (`src/lib/booksy-handoff.ts` pattern: open Booksy widget with service + staffer + date/time) and any safe path that removes staff retyping **without** storing Booksy Biz passwords or inventing a private create API.

Success looks like: customer or staff lands on the correct Booksy slot in one tap; website + Booksy calendars stay aligned via live sync.

---

## 6. Hard constraints

1. **No secrets in chat, commits, or docs** — never print `.env.local` / Vercel values (`ADMIN_UPLOAD_KEY`, `TWILIO_*`, DB URLs, Booksy passwords). Names only. See `docs/org-conventions/security.md`.
2. **No Booksy Biz password** — live availability uses Booksy’s **public** customer `time_slots` + publishable web `X-Api-Key`. Optional override name: `BOOKSY_WEB_API_KEY`.
3. **Prices** — public bookable menu is **$50 / $65** only.
4. **Style** — Antioch barbershop front desk. **Never use “Bet”** or Gen-Z filler on site/SMS/copy (`docs/org-conventions/style-guide.md`).
5. **Don’t claim SMS live** until Twilio Trust Hub KYC is done (`docs/team-memory/twilio-sms-status.md`).
6. **Domain** — share **thebarberloungeca.com**, not parked `.com`.
7. **Memory order** — `docs/org-conventions/` → `docs/team-memory/` → code. Documented status beats guessing.

---

## 7. Codex: your next jobs

Work top-down unless Cesar redirects:

1. **Kill Booksy double-entry** — finish safe handoff/auto-book path on `cursor/booksy-auto-book` (or successor). Prefer customer/staff deep-link into exact Booksy widget slot; document any create limitation honestly.
2. **Verify availability parity** — prod `/book` slots match Booksy per barber; cron healthy; optional `CRON_SECRET` on Vercel.
3. **Durable storage** — move leads/appointments off ephemeral JSON to Postgres/KV for production truth.
4. **Campaigns (Phase 2)** — after Cesar completes Twilio KYC + email provider (`RESEND_API_KEY` / `OWNER_EMAIL`), wire follow-up — do not fake it.
5. **Stripe estimates** — code exists; Cesar still needs Stripe + bank + Vercel `STRIPE_*` + webhook (`docs/team-memory/estimates-stripe.md`).
6. **CRM haircut notes UI** — deferred; notes field exists on leads only.
7. **Keep docs current** — update `docs/team-memory/` (deploy, blockers, session) when status changes; do **not** casually rewrite `docs/org-conventions/`.

### Useful commands / paths

```text
/book                         → primary product
/admin/calendar-sync          → force Booksy sync + busy paste
/admin/leads                  → lead inbox (ADMIN_UPLOAD_KEY)
/api/cron/sync-booksy         → availability cron
src/lib/booksy-availability.ts
src/lib/availability-sync.ts
src/components/book/TimBookWizard.tsx
docs/operations/LAUNCH-CHECKLIST.md
```

### Deploy note

Production host is live at **https://thebarberloungeca.com**. After merges, deploy with `npm run build` then `npx vercel --prod` (or Vercel MCP) when team auth allows. Prefer documented URLs in `docs/team-memory/deploy.md`.

---

**End of handoff.** Cesar: paste the **COPY FROM HERE → COPY TO HERE** block into ChatGPT Codex first; attach or point at this full file / `docs/team-memory/CODEX-HANDOFF.md` for depth.
