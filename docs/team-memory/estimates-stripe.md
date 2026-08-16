# Estimates + Stripe deposit (MVP)

**Last verified:** 2026-08-16  
**Code:** shipped on branch (admin `/admin/estimates`, public `/e/[token]`, webhook `/api/stripe/webhook`)  
**Stripe env on Vercel:** **not set yet** — Cesar connects Stripe Dashboard + bank, then adds env vars.

---

## What it does

Cesar creates an estimate in Staff Hub → shareable link `/e/[token]`. Client opens (tracked), types name to e-sign, then pays a deposit on **Stripe Checkout** (card; Apple Pay shows on Checkout when the phone supports it). Payouts go to Cesar’s Stripe → bank. Webhook marks the estimate **paid**.

Storage: Postgres (`Estimate` in Prisma) when `DATABASE_URL` is set; otherwise `data/estimates.json` (ephemeral on Vercel).

---

## Cesar setup (no secret values in chat)

1. **Stripe account** — [stripe.com](https://stripe.com) → sign up / log in.
2. **Bank payouts** — Stripe Dashboard → Settings → Payouts / Bank accounts → add Cesar’s bank. Complete identity verification if Stripe asks.
3. **API keys** — Developers → API keys. Copy **Secret key** and **Publishable key** (test keys first, live keys when ready).
4. **Vercel env** (Project → Settings → Environment Variables → Production):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (after step 5)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Optional: `NEXT_PUBLIC_SITE_URL` = `https://the-barber-lounge-antioch.vercel.app` until the custom domain is live
5. **Webhook** — Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://the-barber-lounge-antioch.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`
   - Paste the signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel
6. **Redeploy** after env changes (`npx vercel --prod --yes` or Vercel dashboard redeploy).
7. **Smoke test** — `/admin/estimates` (same `ADMIN_UPLOAD_KEY` as other admin) → create estimate → open link → sign → Pay deposit. Tracker should show opened / signed / paid.

Apple Pay: no extra domain setup for hosted Stripe Checkout. It appears on Safari/Wallet when Stripe enables wallets for the account.

**Never paste key values into chat or git.** Names only — see `.env.example`.
