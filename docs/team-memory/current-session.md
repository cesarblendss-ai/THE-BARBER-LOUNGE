# Session Progress — Aug 16, 2026 (separate Cesar’s Hub)

**The hub is independent of Cursor.** Bookmark it, Add to Home Screen, run the shop from the live URL.

**https://the-barber-lounge-antioch.vercel.app/hub**

Guide: `docs/CESARS-HUB.md` · in-app: `/hub/manual`

- Operator tools live under `/hub` (gated). Own chrome — no public header, sticky Book bar, or chatbot.
- PWA manifest so it installs as **Cesar’s Hub**.
- Staff Hub `/admin` stays floor-facing.
- GitHub is the backup — not Cursor chats or OneDrive folders.

**PR:** https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/7

Until this PR is merged and Vercel deploys, `/hub` is not on production yet. After merge, use the Antioch alias above.

**Old local hub:** `http://localhost:8743/?biz=barber-lounge&production=1` only runs on Cesar’s PC. Live site now sends `?biz=barber-lounge` to `/hub`.

---

# Prior session — Aug 10, 2026 (launch checklist)

## Completed this session

| Task | Result |
|------|--------|
| **Production deploy** | ? `dpl_91a1tGXTddPnan3885sJEy8mg1ss` ? SITE_URL `thebarberlounge.com` (Aug 10, 2026) |
| **Deploy URL** | https://the-barber-lounge-antioch.vercel.app (200 OK) ? alias https://thebarberlounge.com |
| **site-content.json** | Already synced from `content.ts` (prior session) |
| **Vercel env audit** | `ADMIN_UPLOAD_KEY`, `NTFY_TOPIC`, `TWILIO_*`, `OWNER_PHONE` ? **all set on Production** |
| **Custom domain (Vercel side)** | ? `thebarberlounge.com` + `www.thebarberlounge.com` added to project `the-barber-lounge` |

**Deploy command used:** `npm run build` ? `npx vercel --prod --yes` (Aug 10, 2026 ~5:37 PM PT)  
**Inspect:** https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/6e98ZSAxZT2VtqCAX144sUsLPPM7  
**Verified 200:** `/shop-log`, `/admin/products`

**Note:** `SITE_URL` synced ? redeploy `dpl_91a1tGXTddPnan3885sJEy8mg1ss`. Verify `https://thebarberlounge.com/sitemap.xml` serves XML (not parking HTML) once DNS fully propagates.

---

**Operations runbooks:** `docs/operations/` ? Booksy SOP, Friday retail reconcile, OneDrive migration guide (print for back room).

---

### 1. Vercel Postgres ? connected; seed + deploy API fix

Neon connected on Vercel (`TBLDB_*` vars). Schema push + seeds need **your terminal** (secrets not in pulled `.env.local`):

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
npx vercel env run -e production -- npm run db:push
npx vercel env run -e production -- npm run db:seed
npx vercel env run -e production -- npm run db:seed-products
```

**Or:** next deploy runs `maybe-db-push.mjs` during build (schema only ? seeds still manual once).

Local scripts use `scripts/with-neon-env.mjs` for `npm run db:*`.

### 2. Custom domain DNS ? NameBright (URGENT)

Smoke test: **`thebarberlounge.com` still shows HugeDomains parking**, not the barber site. Vercel app is live at **`the-barber-lounge-antioch.vercel.app`**.

**At NameBright DNS, set:**

| Type | Host | Value |
|------|------|-------|
| **A** | `@` | `216.198.79.1` |
| **A** | `@` | `64.29.17.1` |
| **CNAME** | `www` | `c3fb3b80101fec65.vercel-dns-017.com` |

Remove HugeDomains parking records. After propagate: `npx vercel domains verify thebarberlounge.com`

### 3. Git + GitHub ? setup complete

**Checklist:** [`docs/operations/CLICK-HERE-SETUP.md`](../operations/CLICK-HERE-SETUP.md) ? Steps **1?4 done**.

- Git 2.55 + gh 2.97; logged in as **`cesarblendss-ai`**
- Remote: `https://github.com/cesarblendss-ai/the-barber-lounge.git`
- **`main`** @ **`1445c99`** ? git identity + `.\ship.cmd` verified
- **`.\ship.cmd`** / **`.\deploy.cmd`** ? use instead of `.\run.ps1` (Windows execution policy)

**Daily deploy:**

```cmd
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
.\ship.cmd "Describe your change"
```

**Prod API check (Aug 8):** `/api/products?active=1` ? 8 products ? `/api/availability` ? 200 (`dpl_Dhnh3d7rf9c4fdEVEojc8LWK2BYk`)

### 4. Twilio SMS ? Trust Hub KYC (error 20003)

Env vars are on Vercel; SMS still blocked until Trust Hub approves. See **Twilio guidance** below.

---

## Twilio EIN troubleshooting (for Cesar)

**Should you call the IRS? ? No.** This is not an IRS problem. Twilio rejected the profile because the **registration ID type didn't match the number entered**.

### What actually fixes Trust Hub rejection

1. Open [Primary Compliance Profile](https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary)
2. **Legal business name:** `The Barber Lounge LLC` (exact match to SOS filing)
3. **Business address:** `1518 A St, Antioch, CA 94509`
4. **Registration ID ? pick the correct type:**

| What you have | Field to use | Value |
|---------------|--------------|-------|
| IRS EIN (9 digits) | Type: **EIN** | From CP 575 / 147c letter or **ZenBusiness dashboard** |
| CA SOS entity only | Type: **State registration / business license** (not EIN) | `B20250377078` |

**Common mistake:** Entering `B20250377078` in the **EIN** field. That is the **California Secretary of State entity number**, not a federal EIN. Twilio validates format and rejects the mismatch.

### State entity # vs federal EIN

- **CA entity `B20250377078`** = proof the LLC exists in California (SOS)
- **IRS EIN** = separate 9-digit number (XX-XXXXXXX) assigned by IRS for tax/banking
- ZenBusiness typically obtains both when forming the LLC ? check their portal before calling anyone

### Sole proprietor path?

**Not applicable** ? The Barber Lounge is an **LLC**. Use the **Business** profile (not Sole Proprietor). If Twilio asks for business type, select LLC / Limited Liability Company.

### After Trust Hub approves

1. Test: `npm run test:sms` or `/admin/sms-setup`
2. Register **A2P 10DLC** if texts still fail (error 30034) ? [A2P registration](https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc)
3. Owner push already works via **ntfy** (`NTFY_TOPIC` on Vercel)

---

## Still optional / later

- `OPENAI_API_KEY` on Vercel (only if prod booking chat needed)
- `SERPER_API_KEY` for live SEO rank scans
- Confirm kids/beard/shave pricing (draft rows hidden from public)
- Shop pricing in `content.ts`

---

## Hero fade fix (Aug 10)

Stale gallery posters removed from live hero; homepage opens **charcoal black** ? **3s fade** into videos when ready. Deployed with [Hero fade + cleanup images](7df3589b-0514-43a1-82f0-48edd67f2c85).

---

## Booking widget fix (Aug 10)

**Root cause:** No `DATABASE_URL` on Vercel ? appointment write to JSON fails (read-only FS) ? empty 500 ? client `json()` crash.

**Fixed in code:** `appointments-store.ts`, `appointment-request/route.ts`, `BookingChatbot.tsx`, `fetch-json.ts` ? returns JSON 503 + friendly message until Postgres connected.

**Deployed** (Aug 10 ~5:37 PM PT) + Vercel Postgres (3-click) ? `db:push` ? `db:seed`.

---

## Retail product tracker (Aug 10)

Built Tier 0 MVP ? see `docs/retail-tracking.md`

| Route | Purpose |
|-------|---------|
| `/shop-log` | Barbers log product grabs (mobile) |
| `/admin/products` | Inventory, sales, mark paid, weekly balance |
| `POST /api/cabinet-event` | Door sensor webhook ? ntfy (Tier 1) |

**Inventory seeded (Aug 10):** 8 products, 50 units ? **$18.00 each** (`priceCents: 1800`) in `data/products.json`.

**Live (Aug 10 deploy):** `/shop-log` (public product grid + Team log PIN gate), `/admin/products` ? both 200 on prod.

**Barber PIN:** Add `RETAIL_LOG_PIN` on Vercel (4-digit code) ? redeploy ? share with barbers only. Until set, Team log is open on prod. Dev default: `1847`.

**Next:** Set PIN on Vercel ? bookmark `/shop-log` on barber phones ? Friday reconcile unpaid in admin.

---

## Quick reference

```powershell
.\run.ps1 build
.\run.ps1 ship "message"   # git commit + push ? Vercel auto-deploy (preferred)
.\deploy.cmd                  # emergency only: npx vercel --prod --yes
npx vercel env ls          # audit env vars
npx vercel domains verify thebarberlounge.com
```
