> **Canonical copy:** [`docs/team-memory/twilio-sms-status.md`](../team-memory/twilio-sms-status.md) — update there, not here.

# Twilio SMS Status

**Last verified:** 2026-08-08  
**Admin UI:** `/admin/sms-setup` → `src/app/admin/sms-setup/page.tsx`  
**Code:** `src/lib/sms-receipt.ts`, `src/app/api/sms-setup-status/route.ts`

---

## Current state

| Item | Status |
|------|--------|
| Twilio account | **Upgraded** (~$50 credit added per project history) |
| `TWILIO_TRIAL_MODE` | **Not set** in `.env.local` → treated as **production mode** (custom receipt SMS) |
| Twilio credentials | Set locally (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) |
| From number | **+1 (737) 232-4091** |
| Owner SMS target | **+1 (925) 209-5995** (`OWNER_PHONE`) |
| SMS delivery | **BLOCKED — error 20003** (Trust Hub / KYC) |
| ntfy push (backup) | Working when `NTFY_TOPIC` set — owner still gets push on booking |

---

## Error 20003 — Trust Hub KYC

When SMS send fails, `sms-receipt.ts` logs:

```
[sms] Trust Hub KYC not approved — complete your primary compliance profile
```

**Console link:** https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary

**Meaning:** Twilio requires business identity verification before sending SMS from a paid account.

---

## EIN vs California entity number (common blocker)

User hit **registration ID mismatch** in Twilio Trust Hub:

| Field | Correct value |
|-------|---------------|
| Legal business name | **The Barber Lounge LLC** |
| CA Secretary of State entity # | **B20250377078** |
| IRS EIN | **Separate 9-digit number** — NOT the CA entity number |

**If Twilio asks for EIN:**

- Select type **EIN**  
- Enter the **9-digit IRS EIN** (from CP 575 / 147c letter or ZenBusiness dashboard)  
- **Do not** enter `B20250377078` in the EIN field — that is the **California state entity number**, not an EIN

**If no EIN yet:** Use the correct registration ID type for what you actually have (state entity vs EIN) — mismatched type/number causes validation errors.

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

## Post-upgrade checklist (still pending)

From admin SMS setup page — user upgraded but SMS still blocked on KYC:

1. Confirm **+1 (737) 232-4091** is active for SMS → [Active Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Complete **Trust Hub Primary Compliance Profile** (fixes 20003)
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

## Booking SMS flow

On `POST /api/appointment-request`:

1. Appointment saved to `data/appointments.json`
2. `sendBookingNotifications()` → customer SMS, then owner SMS
3. Owner SMS failure logged as **`CRITICAL`** in server logs
4. `notifyOwnerOfBooking()` → ntfy push (parallel backup)

**Receipt format (production mode):**

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
