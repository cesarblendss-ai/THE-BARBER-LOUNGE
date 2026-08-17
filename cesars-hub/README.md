# Cesar’s Hub — standalone shop OS (not The Barber Lounge website)

This is Cesar’s **Cesar Blends agency OS**: SEO clients, onboard/SEO/estimate wizards, then shop tools for a selected `biz=`.

Black / white chrome — not The Barber Lounge cream and brass.

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

`biz=` picks the SEO client. `production=1` is the live-ops flag.

Clients are loaded from `tools/seo-agent/clients/` (The Barber Lounge, Yes We Can, plus anyone you onboard in the wizard).

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

That bookmark is the hub. Tiles: estimates, calendar, appointments, retail, shop log, analytics, ntfy, SMS, review QR, website tools, shop manual.

---

## Deploy (own Vercel project)

1. Vercel → **Add New Project**
2. Import `THE-BARBER-LOUNGE`
3. **Root Directory:** `cesars-hub`
4. Do **not** attach this to the `the-barber-lounge` production domain
5. Set env: `HUB_KEY` (or `ADMIN_UPLOAD_KEY`), Stripe keys (see below), and shop env the hub needs (`DATABASE_URL` / `TBLDB_*`, `NTFY_TOPIC`, Twilio names)
6. Bookmark the Vercel URL this project gives you

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
| **Cesar’s Hub** | localhost:8743 / own Vercel project | Shop OS — calendar, estimates, retail, alerts |
| **The Barber Lounge** | the-barber-lounge-antioch.vercel.app | Shop website + Staff Hub `/admin` |
