# Twilio SMS Status

**Last verified:** 2026-08-10  
**Phase:** **Phase 2** — SMS is not required for launch. **ntfy push is the primary owner notification channel.**  
**Admin UI:** `/admin/sms-setup` → `src/app/admin/sms-setup/page.tsx`  
**Code:** `src/lib/sms-receipt.ts`, `src/app/api/sms-setup-status/route.ts`

---

## Notification priority

| Phase | Channel | Status | Role |
|-------|---------|--------|------|
| **Phase 1 (now)** | **ntfy push** | **Working** — `NTFY_TOPIC` set on Vercel Production | **Primary** owner booking alerts |
| **Phase 1 (now)** | On-screen receipt | Live | Customer confirmation in booking wizard |
| **Phase 2 (later)** | Twilio SMS | Blocked — error 20003 (Trust Hub KYC) | Customer + owner SMS receipts |

**Do not block launch on SMS.** Owner already gets every booking via ntfy. Complete Twilio KYC when ready for customer-facing text confirmations.

---

## Current state

| Item | Status |
|------|--------|
| **Owner notifications (primary)** | **ntfy push** — working when `NTFY_TOPIC` set |
| Twilio account | **Upgraded** (~$50 credit added per project history) |
| `TWILIO_TRIAL_MODE` | **Not set** in `.env.local` → treated as **production mode** (custom receipt SMS) |
| Twilio credentials | Set locally (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) |
| From number | **+1 (737) 232-4091** |
| Owner SMS target | **+1 (925) 209-5995** (`OWNER_PHONE`) |
| SMS delivery | **BLOCKED — error 20003** (Trust Hub / KYC) — **Phase 2** |

---

## Error 20003 — Trust Hub KYC

When SMS send fails, `sms-receipt.ts` logs:

```
[sms] Trust Hub KYC not approved — complete your primary compliance profile
```

**Console link:** https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary

**Meaning:** Twilio requires business identity verification before sending SMS from a paid account. This is **Phase 2** work — ntfy covers owner alerts in the meantime.

---

## EIN vs California entity number

User hit **registration ID mismatch** in Twilio Trust Hub. The correct values are now known:

| Field | Correct value |
|-------|---------------|
| Legal business name | **The Barber Lounge LLC** |
| Business address | **1518 A St, Antioch, CA 94509** |
| IRS EIN | **41-3512174** (type: **EIN**) |
| CA Secretary of State entity # | **B20250377078** (type: **State registration** — not EIN) |

**When completing Trust Hub (Phase 2):**

- Select type **EIN**
- Enter **`41-3512174`** (9-digit IRS EIN)
- **Do not** enter `B20250377078` in the EIN field — that is the **California state entity number**, not an EIN

### Do not call the IRS

**Should you call the IRS? → No.**

This is not an IRS problem. Twilio rejected the profile because the **registration ID type didn't match the number entered** (CA entity # was used where EIN was required). The EIN **`41-3512174`** is already assigned — check the ZenBusiness dashboard or CP 575 / 147c letter if you need to confirm the digits. Fix the Twilio form; do not contact the IRS.

---

## Trial vs production mode

| Mode | `TWILIO_TRIAL_MODE` | SMS body | Recipients |
|------|---------------------|----------|------------|
| **Trial** | `1` / `true` | Predefined template `sms_appointment_reminders` only | Verified numbers in Twilio console |
| **Production** | unset or `0` | Full branded receipt (`formatReceiptSms` / `formatOwnerReceiptSms`) | Any valid US number |

**After upgrade:** Remove `TWILIO_TRIAL_MODE` or set `TWILIO_TRIAL_MODE=0`.

Trial limits (from `/admin/sms-setup`):

- SMS only to **Verified Caller IDs**  
- No custom message text  
- Upgrade link: https://console.twilio.com/billing/upgrade  

---

## Phase 2 checklist (when ready for SMS)

From admin SMS setup page — account upgraded but SMS still blocked on KYC:

1. Confirm **+1 (737) 232-4091** is active for SMS → [Active Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Complete **Trust Hub Primary Compliance Profile** with EIN **`41-3512174`** (fixes 20003)
3. Register **A2P 10DLC** if customers still don't receive texts after KYC → [A2P 10DLC Registration](https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc)
4. Mirror env vars on **Vercel Production** (not just `.env.local`)
5. Redeploy after env changes

---

## Other Twilio error codes to watch

| Code | Meaning |
|------|---------|
| **20003** | KYC / Trust Hub not approved |
| **572006** | Trial template restriction |
| **30034** | A2P 10DLC campaign not registered |
| **21606** | From number not SMS-capable |

Code references in `src/lib/sms-receipt.ts` → `logTwilioError()`.

---

## Booking notification flow

On `POST /api/appointment-request`:

1. Appointment saved to `data/appointments.json`
2. **`notifyOwnerOfBooking()` → ntfy push (primary)** — owner alerted immediately
3. `sendBookingNotifications()` → customer SMS, then owner SMS (**Phase 2** — currently blocked)
4. Owner SMS failure logged as **`CRITICAL`** in server logs (expected until KYC cleared)

**Receipt format (production mode, Phase 2):**

- Customer: branded confirmation with code, service, time, address, shop phone  
- Owner: `NEW BOOKING — {code}` + name, phone, service/time + pointer to `/admin/appointments`

---

## Testing locally

```bash
npm run test:sms          # scripts/test-sms.ts → +19252095995
GET /api/sms-test         # dev-only route
```

Status UI: `/admin/sms-setup` → `SmsSetupStatus` component polls `/api/sms-setup-status`.

**Do not paste `TWILIO_AUTH_TOKEN` into chat or docs.**
