# Tim Cho Conversion — Mapping & Status

**Last verified:** 2026-11-03  
**Branch:** `cursor/tim-cho-conversion-c298`  
**Live host:** https://thebarberloungeca.com (production after merge)

---

## Tim → shipped

| Tim’s point | What we shipped | Layer |
|-------------|-----------------|-------|
| 1. Weak Book CTA / funnel | Stronger orange primary CTAs (“Book Your Cut”), sticky mobile bar, header Book + Call Now | Frontend |
| 2. Booksy page drop | Same-page **lead capture modal** before Booksy; service cards open modal (not raw off-site); BookingChatbot still available | Frontend |
| 3. Reviews after book-intent | Homepage order stays **hero → services/book → testimonials → final CTA** so CTAs dominate before social proof | Frontend |
| 4. Transparent prices | Kept $50 / $65 on service cards (Booksy-confirmed) | Frontend (unchanged facts) |
| 5. Capture name/phone/email before Booksy | Modal collects name + phone (+ optional email) → `POST /api/lead` → then Booksy handoff or callback | Frontend + backend |
| 6. SMS + email campaigns / CRM notes | **Hooks only** — leads stored with `smsOptIn` / `emailOptIn`; campaigns **blocked** (Twilio KYC + no email provider) | Backend + docs |
| 7. Phone obvious at book intent | Call Now on hero, header, sticky bar, services, lead modal, final CTA (`tel:+19252095995`) | Frontend |

---

## What Cesar must turn on

| Capability | Status | Cesar action |
|------------|--------|--------------|
| **Lead capture + ntfy alert** | Code ready; ntfy works when `NTFY_TOPIC` set on Vercel | Confirm ntfy still receiving “New lead” pushes |
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
| `src/components/LeadCaptureModal.tsx` | Opt-in modal |
| `src/lib/booking-events.ts` | `tbl:open-lead` / `tbl:open-booking-chat` |
| `src/app/api/lead/route.ts` | Lead POST (public) + GET (admin) |
| `src/lib/leads-store.ts` | `data/leads.json` |
| `src/components/StickyBookButton.tsx` | Mobile Call + Book |
| `docs/team-memory/twilio-sms-status.md` | SMS blocker ground truth |
