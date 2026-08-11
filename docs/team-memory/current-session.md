# Session Progress — Aug 10, 2026 (launch checklist)

## Completed this session

| Task | Result |
|------|--------|
| **Production deploy** | ✅ `dpl_6e98ZSAxZT2VtqCAX144sUsLPPM7` — 63 routes, build OK (Aug 10, 2026 ~5:37 PM PT) |
| **Deploy URL** | https://the-barber-lounge-antioch.vercel.app (200 OK) · alias https://thebarberlounge.com |
| **site-content.json** | Already synced from `content.ts` (prior session) |
| **Vercel env audit** | `ADMIN_UPLOAD_KEY`, `NTFY_TOPIC`, `TWILIO_*`, `OWNER_PHONE` — **all set on Production** |
| **Custom domain (Vercel side)** | ✅ `thebarberlounge.com` + `www.thebarberlounge.com` added to project `the-barber-lounge` |

**Deploy command used:** `npm run build` → `npx vercel --prod --yes` (Aug 10, 2026 ~5:37 PM PT)  
**Inspect:** https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/6e98ZSAxZT2VtqCAX144sUsLPPM7  
**Verified 200:** `/shop-log`, `/admin/products`

**Note:** `SITE_URL` in code later set to `https://thebarberlounge.com` — one more deploy syncs sitemap/canonical JSON-LD to custom domain.

---

**Operations runbooks:** `docs/operations/` — Booksy SOP, Friday retail reconcile, OneDrive migration guide (print for back room).

---

### 1. Vercel Postgres — `DATABASE_URL` not connected

CLI cannot create Postgres (`vercel postgres` / `vercel storage` not available in CLI 58.x). No `DATABASE_URL` in `npx vercel env ls`.

**3-click dashboard steps** (project: **`the-barber-lounge`**, team: `cesarblendss-7234s-projects`):

1. https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/stores → **Create Database** → **Postgres**
2. **Connect to Project** → select **`the-barber-lounge`** (auto-injects `DATABASE_URL`)
3. Redeploy, then locally:
   ```powershell
   npx vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

Until then: site works; analytics + Postgres appointments use JSON fallback.

### 2. Custom domain DNS — NameBright

Domain registered at **NameBright** (nameservers: `nsg1.namebrightdns.com`, `nsg2.namebrightdns.com`).  
`www` currently points to HugeDomains parking (`traff-https.hugedomains.com`).

**At NameBright DNS, set:**

| Type | Host | Value |
|------|------|-------|
| **A** | `@` | `216.198.79.1` |
| **A** | `@` | `64.29.17.1` |
| **CNAME** | `www` | `c3fb3b80101fec65.vercel-dns-017.com` |

*(Alternative: single A `@` → `76.76.21.21`, or change nameservers to `ns1.vercel-dns.com` + `ns2.vercel-dns.com`.)*

After DNS propagates:
```powershell
npx vercel domains verify thebarberlounge.com
npx vercel domains verify www.thebarberlounge.com
```
Then update `SITE_URL` in `src/lib/constants.ts` → `https://thebarberlounge.com` and redeploy.

### 3. Git + GitHub — not installed

- `git` not on PATH; not found in `Program Files\Git`
- `gh` CLI not installed
- No `.git` directory yet (`.gitignore` exists)

**Install Git for Windows:** https://git-scm.com/download/win  
Then:
```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
git init
git add .
git commit -m "Barber Lounge — production-ready site"
# Install gh: winget install GitHub.cli
gh auth login
gh repo create the-barber-lounge --private --source=. --push
```

### 4. Twilio SMS — Trust Hub KYC (error 20003)

Env vars are on Vercel; SMS still blocked until Trust Hub approves. See **Twilio guidance** below.

---

## Twilio EIN troubleshooting (for Cesar)

**Should you call the IRS? → No.** This is not an IRS problem. Twilio rejected the profile because the **registration ID type didn't match the number entered**.

### What actually fixes Trust Hub rejection

1. Open [Primary Compliance Profile](https://console.twilio.com/us1/develop/trusthub/compliance-profiles/primary)
2. **Legal business name:** `The Barber Lounge LLC` (exact match to SOS filing)
3. **Business address:** `1518 A St, Antioch, CA 94509`
4. **Registration ID — pick the correct type:**

| What you have | Field to use | Value |
|---------------|--------------|-------|
| IRS EIN (9 digits) | Type: **EIN** | From CP 575 / 147c letter or **ZenBusiness dashboard** |
| CA SOS entity only | Type: **State registration / business license** (not EIN) | `B20250377078` |

**Common mistake:** Entering `B20250377078` in the **EIN** field. That is the **California Secretary of State entity number**, not a federal EIN. Twilio validates format and rejects the mismatch.

### State entity # vs federal EIN

- **CA entity `B20250377078`** = proof the LLC exists in California (SOS)
- **IRS EIN** = separate 9-digit number (XX-XXXXXXX) assigned by IRS for tax/banking
- ZenBusiness typically obtains both when forming the LLC — check their portal before calling anyone

### Sole proprietor path?

**Not applicable** — The Barber Lounge is an **LLC**. Use the **Business** profile (not Sole Proprietor). If Twilio asks for business type, select LLC / Limited Liability Company.

### After Trust Hub approves

1. Test: `npm run test:sms` or `/admin/sms-setup`
2. Register **A2P 10DLC** if texts still fail (error 30034) → [A2P registration](https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-10dlc)
3. Owner push already works via **ntfy** (`NTFY_TOPIC` on Vercel)

---

## Still optional / later

- `OPENAI_API_KEY` on Vercel (only if prod booking chat needed)
- `SERPER_API_KEY` for live SEO rank scans
- Confirm kids/beard/shave pricing (draft rows hidden from public)
- Shop pricing in `content.ts`

---

## Hero fade fix (Aug 10)

Stale gallery posters removed from live hero; homepage opens **charcoal black** → **3s fade** into videos when ready. Deployed with [Hero fade + cleanup images](7df3589b-0514-43a1-82f0-48edd67f2c85).

---

## Booking widget fix (Aug 10)

**Root cause:** No `DATABASE_URL` on Vercel → appointment write to JSON fails (read-only FS) → empty 500 → client `json()` crash.

**Fixed in code:** `appointments-store.ts`, `appointment-request/route.ts`, `BookingChatbot.tsx`, `fetch-json.ts` — returns JSON 503 + friendly message until Postgres connected.

**Deployed** (Aug 10 ~5:37 PM PT) + Vercel Postgres (3-click) → `db:push` → `db:seed`.

---

## Retail product tracker (Aug 10)

Built Tier 0 MVP — see `docs/retail-tracking.md`

| Route | Purpose |
|-------|---------|
| `/shop-log` | Barbers log product grabs (mobile) |
| `/admin/products` | Inventory, sales, mark paid, weekly balance |
| `POST /api/cabinet-event` | Door sensor webhook → ntfy (Tier 1) |

**Inventory seeded (Aug 10):** 8 products, 50 units — **$18.00 each** (`priceCents: 1800`) in `data/products.json`.

**Live (Aug 10 deploy):** `/shop-log` (public product grid + Team log PIN gate), `/admin/products` — both 200 on prod.

**Barber PIN:** Add `RETAIL_LOG_PIN` on Vercel (4-digit code) → redeploy → share with barbers only. Until set, Team log is open on prod. Dev default: `1847`.

**Next:** Set PIN on Vercel → bookmark `/shop-log` on barber phones → Friday reconcile unpaid in admin.

---

## Quick reference

```powershell
.\run.ps1 build
.\run.ps1 deploy          # or: npx vercel --prod --yes
npx vercel env ls         # audit env vars
npx vercel domains verify thebarberlounge.com
```
