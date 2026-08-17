# Cesar’s Hub — standalone app (not The Barber Lounge)

This is Cesar’s business OS: **estimates, e-sign, Stripe deposit**.

It is **not** on thebarberlounge.com and **not** on the Barber Lounge Vercel project.

**Last verified:** 2026-08-17

---

## Run it (local)

```bash
cd cesars-hub
cp .env.example .env.local   # set HUB_KEY (never commit the value)
npm install
npm run dev
```

Open:

**http://localhost:8743/?biz=barber-lounge&production=1**

`biz=` is a client label only. This app is Cesar Blends / Cesar’s Hub.

---

## Deploy (own Vercel project)

1. Vercel → **Add New Project**
2. Import `THE-BARBER-LOUNGE` (or a future `cesars-hub` repo)
3. **Root Directory:** `cesars-hub`
4. Do **not** attach this to the `the-barber-lounge` production domain
5. Set env: `HUB_KEY`, Stripe keys (see below)
6. Bookmark the Vercel URL this project gives you (e.g. `cesars-hub.vercel.app`)

Until that project exists, use localhost:8743.

---

## Stripe (names only)

Vercel env for **this** project:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` = the Cesar’s Hub URL (not the barber site)
- Webhook: `https://YOUR-HUB-DOMAIN/api/stripe/webhook`  
  events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`

Never paste key values in chat or git.

---

## What this is vs the shop

| App | URL | What |
|-----|-----|------|
| **Cesar’s Hub** | localhost:8743 / own Vercel project | Estimates, e-sign, deposits |
| **The Barber Lounge** | the-barber-lounge-antioch.vercel.app | Shop website + Staff Hub `/admin` |
