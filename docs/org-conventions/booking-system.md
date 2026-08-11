# Booking System

**Last verified:** 2026-08-08

How website booking works — wizard UI, persistence, notifications, and portable agent module.

---

## Architecture

```
BookingChatbot (FAB wizard)
    → POST /api/appointment-request
        → appointments-store (JSON file)
        → sendBookingNotifications (Twilio SMS)
        → notifyOwnerOfBooking (ntfy push)

Optional: BookingChat /api/booking-chat
    → booking-agent module (OpenAI or rule fallback)
    → same appointment-request on submit
```

**Not integrated:** Booksy API. Website captures **requests**; staff confirms in Booksy separately.

---

## Wizard flow (primary UX)

**Component:** `src/components/BookingChatbot.tsx`  
**FAB label:** "Book your cut →"

| Step | Prompt | User action |
|------|--------|-------------|
| 1 `service` | "Hey, what are you trying to get done?" | Tap service chip (from `WIZARD_SERVICES`) |
| 2 `day` | "What day and time works best?" | Pick day from `/api/availability?upcomingDays=N` |
| 3 `time` | "Pick a time that works for you." | Pick slot from `/api/availability?date=YYYY-MM-DD` |
| 4 `phone` | "Got it. What's the best number to reach you?" | Enter phone (name inferred or collected per flow) |
| 5 `done` | Receipt shown | `BookingReceipt` component |

**Availability source:** Internal engine — shop `HOURS` + existing appointments + blocked slots in `data/appointments.json`. **Not** live Booksy calendar.

**Conflict handling:** If slot taken → HTTP 409 with alternative slots.

---

## Receipt

**Component:** `src/components/BookingReceipt.tsx`

Shows after successful `POST /api/appointment-request`:

- Confirmation code (e.g. `TBL-XXXX`)
- Service, day, time
- Customer name + phone
- Whether customer SMS was sent (`customerSmsSent`)

**Calendar download:** `/api/appointments/[code]/calendar` (ICS)

---

## SMS + owner notifications

**API:** `src/app/api/appointment-request/route.ts`

Order on successful booking:

1. Save appointment
2. **Twilio SMS** — customer, then owner (`sendBookingNotifications`)
3. **ntfy push** — owner (`notifyOwnerOfBooking`)

**Owner-first priority in ops (not send order):**

- Owner SMS failure → logged **`CRITICAL`**
- ntfy push is backup when SMS blocked
- Owner always targeted at `+19252095995` unless `OWNER_PHONE` overrides

SMS templates: `src/lib/sms-receipt.ts`  
Push: `src/lib/notifications.ts` → `https://ntfy.sh/{NTFY_TOPIC}`

See `docs/team-memory/twilio-sms-status.md` for current SMS blocker.

---

## Data storage

| File | Purpose |
|------|---------|
| `data/appointments.json` | Appointments + blocked slots |
| `src/lib/appointments-store.ts` | CRUD, availability engine, confirmation codes |

**Appointment fields:** id, confirmationCode, service, preferredDay/Time, slotDate/Hour, name, phone, guestCount, status, timestamps.

**Admin:** `/admin/appointments` — view/manage requests.

**Vercel warning:** JSON file writes are ephemeral on serverless — migrate to Postgres/KV for production persistence.

---

## Portable booking-agent module

**Location:** `src/lib/booking-agent/`  
**Docs:** `src/lib/booking-agent/README.md`

```
types.ts        — BookingAgentConfig
format.ts       — Day/time labels
availability.ts — Slot parsing + alternatives
fallback.ts     — Rule-based flow (no OpenAI)
agent.ts        — GPT-4o-mini + check_availability tool
index.ts        — createBookingAgent(config)
```

**This shop's config:** `src/lib/booking-config.ts` → `BARBER_LOUNGE_CONFIG`

**Plug into another site (3 steps):**

1. Copy `booking-agent/` + create site-specific `booking-config.ts`
2. Wire `src/app/api/booking-chat/route.ts` with your `checkAvailability`
3. Point chat UI at `/api/booking-chat`

**AI vs fallback:**

| Path | When |
|------|------|
| OpenAI | `OPENAI_API_KEY` set and API responds |
| Fallback | No key, 429, or API error — same phases, no null labels |

Test fallback: `npx tsx scripts/test-booking-fallback.ts`

---

## AI chat flow (optional alternate UI)

**Route:** `src/app/api/booking-chat/route.ts`  
**Phases:** greet → service → day/time → availability check → name → phone → confirm → submit

Uses `check_availability` tool against same internal store as wizard.

---

## Public Booksy link

Primary marketing CTAs still use Booksy:

```
BOOKING_URL in src/lib/content.ts
https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch
```

Website wizard is an **additional** capture path — not a replacement for Booksy scheduling until staff workflow is defined.

---

## Related API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/appointment-request` | POST | Create booking + notify |
| `/api/availability` | GET | Days, slots, check day+time |
| `/api/appointments` | GET/POST | Admin appointment ops |
| `/api/appointments/[code]/calendar` | GET | ICS file |
| `/api/booking-chat` | POST | AI chat turn |

---

## Services offered in wizard

From `src/lib/wizard-helpers.ts` / `WIZARD_SERVICES` — aligned with published menu (Signature Haircut, Signature Haircut & Beard, etc.). Multi-guest ("3 kids") supported via `guestCount`.
