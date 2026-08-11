# Current Blockers

**Last verified:** 2026-08-10

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **Postgres schema + seed** | Neon connected; prod APIs **200** via JSON fallback (`/api/products` 8 items, `/api/availability`). Run `db:push` + seeds once in your terminal for durable Postgres data. |
| **Custom domain DNS** | **NOT LIVE on apex** — `thebarberlounge.com` still resolves to **HugeDomains parking** (not Vercel). Fix NameBright A/CNAME per `current-session.md`. Vercel app works at `the-barber-lounge-antioch.vercel.app`. |
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
| **Site deploy** | **LIVE** — 57 routes, latest `dpl_Dhnh3d7rf9c4fdEVEojc8LWK2BYk` (DB→JSON fallback) |
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
| Git deploy smoke test | 2026-08-10 — `ship.cmd test` → commit `469e9d1` pushed; Vercel Production deploy triggered |
| PowerShell `run.ps1` blocked | 2026-08-10 — `ship.cmd` / `deploy.cmd` wrappers added (ExecutionPolicy bypass) |

---

## Next actions

1. NameBright DNS for `thebarberlounge.com` (see `current-session.md`)
2. Vercel Postgres: `db:push` + `db:seed` if not done
3. Add `RETAIL_LOG_PIN` on Vercel Production
4. **Phase 2:** Twilio Trust Hub KYC with EIN **41-3512174** (see `twilio-sms-status.md`)

Detail runbook (optional): `docs/operations/git-deploy-workflow.md`
