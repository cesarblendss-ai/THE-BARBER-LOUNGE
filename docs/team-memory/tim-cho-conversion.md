# Tim Cho Conversion — Mapping & Status

**Last verified:** 2026-11-05  
**Integration branch:** `cursor/apply-tim-stack-c298`  
**Live host:** https://thebarberloungeca.com

---

## Tim → shipped

| Tim’s point | What we shipped | Layer |
|-------------|-----------------|-------|
| 1. Weak Book CTA / funnel | Stronger orange primary CTAs (“Book Your Cut”), sticky mobile bar, header Book + Call Now → **`/book`** | Frontend |
| 2. Off-site drop | Primary path is **same-site `/book`** funnel; lead modal kept for opt-in / callback and continues to `/book` (Booksy is fallback) | Frontend |
| 3. Reviews after book-intent | Homepage order stays **hero → services/book → testimonials → final CTA** | Frontend |
| 4. Transparent prices | Kept $50 / $65 on service cards (Booksy-confirmed) | Frontend |
| 5. Capture name/phone before handoff | `/book` contact step + lead modal → `POST /api/lead` / appointment-request | Frontend + backend |
| 6. SMS + email campaigns / CRM notes | **Hooks only** — `smsOptIn` / `emailOptIn` + notes on leads; campaigns **blocked** (Twilio KYC + no email provider) | Backend + docs |
| 7. Phone obvious at book intent | Call Now on hero, header, sticky bar, services, final CTA, `/book` (`tel:+19252095995`) | Frontend |

### Tim Chao “start now” plays applied (from transcript archive)

| Play | Applied? | Notes |
|------|----------|-------|
| Same-page book (don’t dump off-site first) | ✅ | `/book` is primary CTA |
| Capture opt-in with contact | ✅ | `/book` step 4 + lead modal checkboxes |
| Obvious Call CTA | ✅ | `tel:+19252095995` everywhere book intent shows |
| SMS/CRM follow-up loop | 🟡 Hooks only | Store prefs + notes; **do not claim SMS live** until KYC |
| Full CRM haircut notes UI | ❌ Deferred | Notes field exists; staff CRM UI later |

---

## What Cesar must turn on

| Capability | Status | Cesar action |
|------------|--------|--------------|
| **Lead capture + ntfy alert** | Code live; ntfy works when `NTFY_TOPIC` set on Vercel | Confirm ntfy still receiving “New lead” / booking pushes |
| **Customer SMS campaigns** | **Blocked** — Twilio error 20003 Trust Hub KYC | Complete Trust Hub with EIN `41-3512174`; mirror `TWILIO_*` on Vercel; see `twilio-sms-status.md` |
| **Email campaigns** | **Not wired** — Resend backup exists for owner booking alerts only | Add email provider (`RESEND_API_KEY` + `OWNER_EMAIL`) then campaign tooling |
| **CRM haircut notes** | **Not built** — leads JSON has notes field only | Future: staff CRM UI + Postgres |
| **Booksy API booking** | **Impossible** — no public create-appointment API | Keep deep links + internal requests |
| **JSON lead persistence on Vercel** | Ephemeral filesystem (same as appointments) | Prefer Postgres/KV for durable leads in prod |

Admin: `/admin/leads` (key = `ADMIN_UPLOAD_KEY` from Vercel / `.env.local` — never paste in chat).

---

## Key paths

| Path | Role |
|------|------|
| `src/components/book/TimBookWizard.tsx` | Primary `/book` funnel + opt-in |
| `src/components/LeadCaptureModal.tsx` | Opt-in / callback modal → continues to `/book` |
| `src/lib/booking-events.ts` | `tbl:open-lead` / `tbl:open-booking-chat` |
| `src/app/api/lead/route.ts` | Lead POST (public) + GET (admin) |
| `src/lib/leads-store.ts` | `data/leads.json` (+ `/tmp` on Vercel) |
| `src/components/StickyBookButton.tsx` | Mobile Call + Book → `/book` |
| `docs/team-memory/twilio-sms-status.md` | SMS blocker ground truth |
