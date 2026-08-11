# Current Blockers

**Last verified:** 2026-08-10

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **Postgres on Vercel** | `DATABASE_URL` not connected — **bookings fail to save on prod** (EROFS on JSON file); widget now shows friendly error instead of JSON crash after code fix | `deploy.md` |
| **Custom domain DNS** | **LIVE** — `thebarberlounge.com` returns 200; `SITE_URL` updated in code (redeploy for sitemap/canonical) |
| **Booksy integration** | No API — manual Booksy entry | `booking-system.md` |

---

## Phase 2 (deferred — not blocking launch)

| Item | Detail | Doc |
|------|--------|-----|
| **Twilio SMS — error 20003** | Trust Hub KYC not approved. EIN is **41-3512174** (not CA entity `B20250377078`). **Do not call the IRS** — fix the Twilio form. Owner alerts already work via **ntfy (primary)**. | `twilio-sms-status.md` |

---

## Partially working

| Item | Status |
|------|--------|
| **Site deploy** | **LIVE** — 57 routes, redeployed Aug 10 (`dpl_DQALJMamyCWckQbpCcTKTiXsumrX`) |
| **Owner ntfy push (primary)** | `NTFY_TOPIC` set on Vercel Production — every booking alerts owner |
| **Retail tracker** | **LIVE** — `/shop-log` + `/admin/products` deployed Aug 10 |
| **RETAIL_LOG_PIN on Vercel** | Not set — Team log unlocked on prod. Paste 4-digit PIN in Vercel → redeploy. See `docs/operations/security-checklist.md` |

---

## Resolved

| Blocker | Resolved |
|---------|----------|
| Vercel Output Directory / framework | 2026-08-08 — Next.js preset fixed |
| Deployment Protection | 2026-08-08 — off |
| Short URL 404 | 2026-08-08 — returns 200 |
| `ADMIN_UPLOAD_KEY` on Vercel | 2026-08-08 — set |
| 57-route prod deploy | 2026-08-10 — `dpl_DQALJMamyCWckQbpCcTKTiXsumrX` |
| `NTFY_TOPIC` on Vercel | 2026-08-08 — set |
| Domain added to Vercel project | 2026-08-10 — DNS at NameBright pending |

---

## Next actions

1. NameBright DNS for `thebarberlounge.com` (see `current-session.md`)
2. Vercel Postgres connect + `db:push` + `db:seed`
3. Install Git → GitHub push
4. Add `SERPER_API_KEY` for live rank scans (optional)
5. **Phase 2:** Twilio Trust Hub KYC with EIN **41-3512174** (see `twilio-sms-status.md`)
