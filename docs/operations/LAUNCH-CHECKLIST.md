# Launch Checklist — The Barber Lounge

**Production URL:** https://the-barber-lounge-antioch.vercel.app  
**Custom domain (pending DNS):** https://thebarberlounge.com  
**Last updated:** 2026-08-11

---

## Done in code (no clicks needed)

| Item | Status |
|------|--------|
| Next.js production build (63 routes) | ✅ Passes locally |
| ESLint | ✅ Clean |
| Vercel Analytics (`<Analytics />` in `layout.tsx`) | ✅ Installed |
| Custom analytics tracker (`AnalyticsTracker` → `/api/analytics`) | ✅ Wired; persists when `DATABASE_URL` set |
| Booking conversion event (`track('booking_submitted')`) | ✅ Vercel Analytics custom event on wizard submit |
| Homepage, services, blog, SEO pages | ✅ Live |
| Booking chatbot wizard | ✅ Live (FAB on every page) |
| `/book` → Booksy redirect | ✅ `next.config.ts` |
| Retail tracker `/shop-log` + `/admin/products` | ✅ Live |
| JSON → Postgres lazy-seed for products | ✅ Auto-imports `data/products.json` when DB empty |
| Owner booking alerts (ntfy) | ✅ `NTFY_TOPIC` on Vercel |
| Admin upload key | ✅ `ADMIN_UPLOAD_KEY` on Vercel |
| Git + Vercel auto-deploy from `main` | ✅ Connected |
| Sitemap + robots.txt | ✅ `/sitemap.xml`, `/robots.txt` |
| `.env.example` documents `RETAIL_LOG_PIN` | ✅ |

---

## Cesar clicks once (max 5)

### 1. NameBright DNS — point domain to Vercel

**Status (2026-08-11):** Domain is registered at **NameBright** (nameservers `nsg1.namebrightdns.com` / `nsg2.namebrightdns.com`). DNS still points to **HugeDomains parking** (`54.243.117.197`, `13.223.25.84`) — not Vercel. The site works at **https://the-barber-lounge-antioch.vercel.app** until DNS is fixed.

Vercel already has `thebarberlounge.com` + `www.thebarberlounge.com` on the project. **You only need to fix DNS at NameBright.**

#### Option A — DNS records (recommended, keep NameBright nameservers)

1. Log in → [NameBright](https://www.namebright.com) → **My Domains** → **thebarberlounge.com** → **DNS Records**
2. **Delete** any parking / HugeDomains / old A records for `@` and `www`
3. **Add** these records (from Vercel → Project → Settings → Domains):

| Type | Host | Value |
|------|------|-------|
| **A** | `@` | `216.198.79.1` |
| **A** | `@` | `64.29.17.1` |
| **CNAME** | `www` | `c3fb3b80101fec65.vercel-dns-017.com` |

4. Save. Propagation: **15 min – 48 hr**
5. Verify:

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
npx vercel domains verify thebarberlounge.com
```

6. Confirm `https://thebarberlounge.com` shows the barber site (not HugeDomains cookie/parking page)

#### Option B — Vercel nameservers (alternative)

At NameBright → change nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. Vercel manages DNS automatically. Use this only if Option A fails.

**Code already done:** `www` → apex redirect in `next.config.ts`, `SITE_URL` = `https://thebarberlounge.com`.

---

### 1b. ntfy phone setup — booking alerts

**Status:** `NTFY_TOPIC` is set on Vercel Production. Code sends push on every `/api/appointment-request`.

**If you are not getting pushes:**

1. Open **https://the-barber-lounge-antioch.vercel.app/admin/notifications** (works even before custom domain)
2. Copy the **exact** topic shown (e.g. `barber-lounge-bookings-x7k9m2`) — do **not** guess
3. Install [ntfy app](https://ntfy.sh/app) → **+** → Subscribe to topic → paste exact value
4. Tap **Send test notification** on that page (enter `ADMIN_UPLOAD_KEY` if prompted)
5. If test works but real bookings don't: customers may be on broken `thebarberlounge.com` (parking) — fix DNS first

**Vercel env vars (Production):**

| Variable | Required | Purpose |
|----------|----------|---------|
| `NTFY_TOPIC` | **Yes** | Secret topic name — subscribe in ntfy app |
| `PUSH_NOTIFICATION_URL` | No | Override default `https://ntfy.sh/{NTFY_TOPIC}` |
| `NEXT_PUBLIC_SITE_URL` | No | Click links in push (defaults to Vercel URL) |
| `ADMIN_UPLOAD_KEY` | Yes | Protects test endpoint + admin routes |

Example topic format (generate your own secret): `barber-lounge-bookings-x7k9m2`

---

### 2. Set `RETAIL_LOG_PIN` on Vercel Production

Until set, **Team log on `/shop-log` is unlocked** (anyone can log barber grabs).

1. [Vercel → the-barber-lounge → Settings → Environment Variables](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/environment-variables)
2. Add **`RETAIL_LOG_PIN`** = your 4-digit code (e.g. `1847`) — **Production only**
3. Redeploy (or push any commit to `main`)

Share the PIN with barbers only. Bookmark `/shop-log` on barber phones.

---

### 3. Seed Postgres (one-time, if not done)

Neon is connected; schema may auto-push on build. **Seeds need your terminal** (secrets not in repo):

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
npx vercel env run -e production -- npm run db:push
npx vercel env run -e production -- npm run db:seed
npx vercel env run -e production -- npm run db:seed-products
```

**Note:** Products auto-seed from `data/products.json` on first API read if DB is empty. Appointments still need `db:seed` for demo slots.

---

### 4. Verify analytics in Vercel dashboard

1. [Vercel → the-barber-lounge → Analytics](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/analytics)
2. Visit the live site, click **Book Now**, submit a test booking
3. Confirm page views appear within ~30 min
4. Custom event **`booking_submitted`** should show under Events (after first real submit)

**Internal dashboard:** `/admin/analytics` (Postgres page views + clicks when `DATABASE_URL` connected).

---

### 5. (Optional) Twilio SMS — Phase 2

SMS env vars are set but **Trust Hub KYC blocked** (error 20003). Owner alerts already work via **ntfy**. Fix when ready: [Twilio Trust Hub](https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary) with EIN **41-3512174**. See `docs/knowledge/twilio-sms-status.md`.

---

## Smoke test after deploy

Run in PowerShell:

```powershell
$base = "https://the-barber-lounge-antioch.vercel.app"
@("/", "/shop-log", "/admin/products", "/book", "/sitemap.xml",
  "/api/products?active=1", "/api/availability?upcomingDays=3") |
  ForEach-Object {
    try {
      $r = Invoke-WebRequest -Uri "$base$_" -MaximumRedirection 0 -ErrorAction Stop
      "$($r.StatusCode) $_"
    } catch {
      if ($_.Exception.Response.StatusCode -eq 'Redirect') {
        "302 $_ → $($_.Exception.Response.Headers.Location)"
      } else { "FAIL $_ : $($_.Exception.Message)" }
    }
  }
```

**Expected:** all 200 (or 302 for `/book` → Booksy). Products API returns 8 items.

---

## Daily deploy

```cmd
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
.\ship.cmd "Describe your change"
```

Emergency only: `.\deploy.cmd` (direct `npx vercel --prod`).

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `docs/operations/CLICK-HERE-SETUP.md` | Git + GitHub setup (done) |
| `docs/operations/security-checklist.md` | Env vars + auth gaps |
| `docs/operations/friday-reconcile.md` | Weekly retail unpaid balance |
| `docs/operations/booksy-workflow.md` | Web booking → Booksy SOP |
| `docs/team-memory/current-blockers.md` | Active blockers snapshot |
