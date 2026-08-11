# Notification Alternatives — The Barber Lounge

When Twilio SMS is blocked (Trust Hub KYC error 20003), use these channels.

| Channel | Status | Use for |
|---------|--------|---------|
| **ntfy push** | Works locally; add `NTFY_TOPIC` on Vercel | Owner booking alerts |
| **Booking wizard receipt** | Live | Customer confirmation UI + copy + calendar |
| **Email (Resend/Mailchimp)** | Not wired | Welcome drip in `docs/marketing/email/` |
| **WhatsApp Business** | Not set up | Requires Meta Business verification (days/weeks) |
| **Telnyx / MessageBird** | Alternative SMS providers | Only if switching off Twilio |

## Owner notifications (now)

1. **ntfy** — subscribe phone to topic in `NTFY_TOPIC` (see `/admin/notifications`)
2. **Admin appointments** — `/admin/appointments` lists all requests

## Customer notifications (now)

1. **On-screen receipt** — copy confirmation, add to calendar, Booksy link
2. **SMS** — blocked until Twilio KYC cleared (`docs/team-memory/twilio-sms-status.md`)

## After Twilio KYC

Add to Vercel Production: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `OWNER_PHONE`

See `src/lib/sms-receipt.ts` for send flow.
