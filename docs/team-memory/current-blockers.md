# Current Blockers

**Last verified:** 2026-08-11

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **Postgres schema + seed** | Neon connected; prod APIs **200** via JSON fallback (`/api/products` 8 items, `/api/availability`). Run `db:push` + seeds once in your terminal for durable Postgres data. |
| **Custom domain DNS** | **NOT LIVE** — `thebarberlounge.com` resolves to **HugeDomains parking** (AWS IPs). Domain on **NameBright**; Vercel side done. Fix A/CNAME per `LAUNCH-CHECKLIST.md`. Use `the-barber-lounge-antioch.vercel.app` until fixed. |
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
| **Site deploy** | **LIVE** — 63 routes, `main` @ `c26094b` — analytics + retail lazy-seed |
| **Owner ntfy push (primary)** | `NTFY_TOPIC` set on Vercel Production — every booking alerts owner |
| **Retail tracker** | **LIVE** — `/shop-log` + `/admin/products` deployed Aug 10 |
| **RETAIL_LOG_PIN on Vercel** | Not set — Team log unlocked; see `docs/operations/security-checklist.md` |

---

## Resolved

| Blocker | Resolved |
|---------|----------|
| Vercel Output Directory / framework | 2026-08-08 — Next.js preset fixed |
| Deployment Protection | 2026-08-08 — off |
| Short URL 404 | 2026-08-08 — returns 200 |
| `ADMIN_UPLOAD_KEY` on Vercel | 2026-08-08 — set |
| 57-route prod deploy | 2026-08-10 — `dpl_DQALJMamyCWckQbpCcTKTiXsumrX` |
| Prod API 500 (products/availability) | 2026-08-08 — DB→JSON fallback deploy `dpl_Dhnh3d7rf9c4fdEVEojc8LWK2BYk`; verified 200 |
| `NTFY_TOPIC` on Vercel | 2026-08-08 — set |
| Domain added to Vercel project | 2026-08-10 — DNS at NameBright pending |
| Git + GitHub push | 2026-08-10 — `cesarblendss-ai/the-barber-lounge`, `main` @ `66a9008` synced |
| Vercel Git auto-deploy | 2026-08-10 — connected `cesarblendss-ai/THE-BARBER-LOUNGE`, branch `main` |
| Git deploy smoke test | 2026-08-10 — `.\ship.cmd test` → `1445c99` on `main`; Vercel auto-deploy verified |
| PowerShell `run.ps1` blocked | 2026-08-10 — use **`.\ship.cmd`** / **`.\deploy.cmd`** (ExecutionPolicy bypass) |
| Local git identity | 2026-08-10 — repo `user.name` / `user.email` set (not global) |
| Production launch (code) | 2026-08-11 — `c26094b` on `main`; see `docs/operations/LAUNCH-CHECKLIST.md` |
| Vercel Analytics + booking conversion | 2026-08-11 — layout + `booking_submitted` event |

---

## Next actions

**→ Full list:** `docs/operations/LAUNCH-CHECKLIST.md`

1. NameBright DNS for `thebarberlounge.com`
2. `RETAIL_LOG_PIN` on Vercel Production
3. `db:push` + `db:seed` once in your terminal
4. Confirm analytics in Vercel dashboard after a site visit
5. **Phase 2:** Twilio Trust Hub (optional)
