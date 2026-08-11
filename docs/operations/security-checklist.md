# Security checklist — Vercel env & admin routes

**Last audited:** 2026-08-10  
**Scope:** `ADMIN_UPLOAD_KEY`, `RETAIL_LOG_PIN`, `/admin/*`, `/shop-log` Team log

Related: [Security conventions](../org-conventions/security.md) · [Retail tracking](../retail-tracking.md) · [Friday reconcile](./friday-reconcile.md)

---

## Quick status (Production)

| Variable | Vercel Production | Impact if missing |
|----------|-------------------|-------------------|
| `ADMIN_UPLOAD_KEY` | ✅ Set (2026-08-08) | Admin APIs + uploads open to anyone |
| `RETAIL_LOG_PIN` | ❌ **Not set** | `/shop-log` Team log has **no PIN gate** |
| `NTFY_TOPIC` | ✅ Set | No owner push on bookings |
| `TWILIO_*` / `OWNER_PHONE` | ✅ Set | SMS receipts fail (ntfy still works) |
| `DATABASE_URL` | ❌ Not connected | Bookings/analytics/retail may fail on prod filesystem |

**Immediate action:** Add `RETAIL_LOG_PIN` on Vercel Production → redeploy → share code with barbers only (not in git or docs).

---

## Required Vercel environment variables

Set in **Vercel → Project `the-barber-lounge` → Settings → Environment Variables → Production**.  
After any change: **Redeploy** (`npx vercel --prod --yes` or push to main).

### Security-critical (must be set for production)

| Variable | Format | Protects |
|----------|--------|----------|
| `ADMIN_UPLOAD_KEY` | Long random hex/string (≥32 chars) | Admin APIs, file uploads, edit mode, retail admin |
| `RETAIL_LOG_PIN` | Exactly **4 digits** (`0000`–`9999`) | `/shop-log` Team log + `POST /api/product-sales` |

**Do not commit values.** Copy from `.env.local` or generate new secrets; store only in Vercel and local `.env.local`.

### Operational (not route auth, but required for prod features)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres — bookings, analytics, retail persistence (auto-injected when Vercel Postgres connected) |
| `NTFY_TOPIC` | Owner push notifications (secret topic name) |
| `TWILIO_ACCOUNT_SID` | SMS receipts |
| `TWILIO_AUTH_TOKEN` | SMS receipts (high sensitivity) |
| `TWILIO_PHONE_NUMBER` | Outbound SMS sender |
| `OWNER_PHONE` | Shop owner SMS destination |
| `TWILIO_TRIAL_MODE` | `0` = full SMS body; `1` = trial template |

### Optional

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | AI booking chat, gallery auto-sort |
| `CABINET_WEBHOOK_SECRET` | `POST /api/cabinet-event` (door sensor) |
| `RESEND_API_KEY` / `OWNER_EMAIL` | Email backup for bookings |
| `SITE_URL` | Canonical URLs (defaults to production domain in code) |

Full reference names: repo root `.env.example`.

---

## `ADMIN_UPLOAD_KEY` — how protection works

**Source:** `src/lib/admin-auth.ts`, `src/lib/hero-video.ts` (`checkAdminUploadKey`)

When `ADMIN_UPLOAD_KEY` is **set** (production):

1. Client sends key via query `?key=…`, header `x-admin-key`, or httpOnly cookie `tbl_admin_key` (set by `/api/admin/edit-auth`).
2. Server compares to env var; mismatch → `401 Unauthorized`.

When **unset** (local dev only): all admin checks pass (`return true`).

### Protected APIs

| Endpoint | Methods | Auth |
|----------|---------|------|
| `/api/upload-gallery` | POST, DELETE | Key required |
| `/api/upload-hero-video` | POST | Key required |
| `/api/classify-gallery` | GET, POST | Key required |
| `/api/admin/edit-auth` | POST (if key set), DELETE | Key required |
| `/api/site-content` | PUT | Cookie or header |
| `/api/analytics/summary` | GET | Cookie or header |
| `/api/appointments` | GET, PATCH | Query `key` or header |
| `/api/products` | POST | Query `key` or header |
| `/api/product-sales` | GET, PATCH | Query `key` or header |
| `/api/sms-test` | GET | Key required |

### Admin pages (`/admin/*`)

| Page | UI | Data/API |
|------|-----|----------|
| `/admin/edit` | Key form when env set | Sets edit cookie on success |
| `/admin/gallery` | Key field or `?key=` for uploads | Upload APIs enforce key |
| `/admin/hero` | Key field or `?key=` for uploads | Upload APIs enforce key |
| `/admin/products` | Page public | **API returns 401** without `?key=` |
| `/admin/appointments` | Page public | **API returns 401** without `?key=` |
| `/admin/analytics` | Page public | **⚠ Gap:** page SSR loads summary without key check; API is protected |
| `/admin/notifications` | Setup docs only | No sensitive data |
| `/admin/sms-setup` | Setup docs only | `/api/sms-setup-status` is public (booleans only) |

**Bookmark pattern for owner:**

```text
https://thebarberlounge.com/admin/products?key=YOUR_ADMIN_KEY
https://thebarberlounge.com/admin/appointments?key=YOUR_ADMIN_KEY
```

Replace `YOUR_ADMIN_KEY` with the value from Vercel (never paste in chat, docs, or git).

**No Next.js middleware** — pages are reachable by URL; security is enforced on mutating APIs and upload flows.

---

## `RETAIL_LOG_PIN` — Team log on `/shop-log`

**Source:** `src/lib/retail-config.ts`, `src/app/api/retail-log-auth/route.ts`, `src/app/api/product-sales/route.ts`

### Behavior by environment

| Environment | `RETAIL_LOG_PIN` | Team log |
|-------------|------------------|----------|
| Local dev | unset | Dev default **1847** (`DEV_DEFAULT_RETAIL_LOG_PIN`) |
| Local dev | set | Your 4-digit code |
| **Production** | **unset** | **No PIN — anyone can log sales** |
| Production | set on Vercel | PIN required to unlock Team log and submit sales |

### Flow

1. Public catalog at `/shop-log` — product names, prices, stock (intentionally public).
2. **Team log** button → if PIN required, 4-digit form → `POST /api/retail-log-auth`.
3. On success, client stores unlock in **sessionStorage** (`shop-log-unlocked`) for the browser tab.
4. `POST /api/product-sales` re-validates PIN on every sale when PIN is required.

### What is *not* protected

- `GET /api/products?active=1` — public product list (by design).
- Session unlock is client-side only — clearing sessionStorage or a new browser bypasses UI until PIN re-entered; server still requires PIN on POST when env is set.

### Rollout steps

1. Generate a random 4-digit code (avoid `1234`, `0000`, and dev default `1847`).
2. Vercel → Production → add `RETAIL_LOG_PIN` → redeploy.
3. Test `/shop-log` → Team log → wrong code fails, correct code unlocks.
4. Share code verbally or secure channel with barbers only.
5. Optional: rotate PIN by updating Vercel and redeploying.

---

## Pre-launch verification checklist

- [ ] `ADMIN_UPLOAD_KEY` set on Vercel Production (already done)
- [ ] **`RETAIL_LOG_PIN` set on Vercel Production** (blocking retail accountability)
- [ ] Redeploy after env changes
- [ ] `/admin/products?key=…` loads data; without key → error state
- [ ] `/shop-log` → Team log → PIN prompt appears in production
- [ ] Wrong PIN → “Wrong team code”; correct PIN → log form
- [ ] `POST /api/product-sales` without PIN → `401 Invalid PIN` when env set
- [ ] Upload at `/admin/gallery` without key → `401 Unauthorized`
- [ ] Owner bookmarked admin URLs with `?key=` (key not shared with barbers)

---

## Known gaps (future hardening)

| Gap | Risk | Mitigation today |
|-----|------|------------------|
| `/admin/analytics` SSR without auth | Anyone with URL sees analytics summary | Low traffic + `robots: noindex`; fix: gate page like other admin routes |
| Admin pages reachable without login page | Obscurity only | APIs enforce key; use unguessable `ADMIN_UPLOAD_KEY` |
| Team log session in sessionStorage | Tab-level unlock | Server validates PIN on each sale POST |
| 4-digit PIN entropy | Brute-force theoretically possible | Acceptable for internal barber tool; rotate if abused |

---

## Agent / doc rules

1. Never commit or paste real `ADMIN_UPLOAD_KEY`, `RETAIL_LOG_PIN`, or Twilio tokens.
2. In docs use placeholders: `YOUR_ADMIN_KEY`, `XXXX` (4-digit).
3. When rotating secrets, update Vercel Production and `.env.local`, then redeploy.
