# Estimates + Stripe deposit — Cesar’s Hub (standalone)

**Last verified:** 2026-08-17  
**App:** `cesars-hub/` — **not** The Barber Lounge website  
**Local:** http://localhost:8743/?biz=barber-lounge&production=1  
**Stripe env on the hub Vercel project:** not set until Cesar adds keys

---

## What it does

Cesar creates an estimate in Cesar’s Hub → shareable link `/e/[token]`. Client opens (tracked), types name to e-sign, then pays a deposit on **Stripe Checkout**. Payouts go to Cesar’s Stripe → bank.

Storage: `cesars-hub/data/estimates.json` (add Postgres later if needed). JSON is ephemeral on Vercel unless you attach a database.

---

## Cesar setup (no secret values in chat)

1. Deploy **a new Vercel project** with Root Directory `cesars-hub` (do not use the barber lounge domain).
2. Stripe account → bank payouts.
3. Env on **that** project: `HUB_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
4. Webhook URL: `https://YOUR-HUB-DOMAIN/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
5. Smoke test: unlock hub → create estimate → open link → sign → Pay deposit.

**Never paste key values into chat or git.**
