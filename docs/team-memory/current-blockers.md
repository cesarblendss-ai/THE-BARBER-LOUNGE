# Current Blockers

**Last verified:** 2026-08-10

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **Postgres on Vercel** | Connected (Neon) but APIs may 500 until schema seeded OR deploy DB→JSON fallback fix. Run `db:push` + seeds; deploy latest code. |
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
| **Site deploy** | **LIVE** — 57 routes, redeployed Aug 10 (`dpl_DQALJMamyCWckQbpCcTKTiXsumrX`) |
| **Owner ntfy push (primary)** | `NTFY_TOPIC` set on Vercel Production — every booking alerts owner |
| **Retail tracker** | **LIVE** — `/shop-log` + `/admin/products` deployed Aug 10 |
| **RETAIL_LOG_PIN on Vercel** | Not set — Team log unlocked; see `docs/operations/security-checklist.md` |
| **Git repo** | **Local only** — commits on `main`; GitHub push blocked until `gh auth login`. Runbook: `docs/operations/git-deploy-workflow.md` |
| **Vercel Git integration** | **Not connected** — connect after GitHub push (Settings → Git → Connect repo) |

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

1. **`gh auth login`** → `gh repo create the-barber-lounge --private --source=. --remote=origin --push` (see `git-deploy-workflow.md`)
2. **Vercel → Settings → Git** → Connect `cesarblendss/the-barber-lounge`, Production branch `main`
3. NameBright DNS for `thebarberlounge.com` (see `current-session.md`)
4. Vercel Postgres: `db:push` + `db:seed` if not done
5. Add `RETAIL_LOG_PIN` on Vercel Production
6. **Phase 2:** Twilio Trust Hub KYC with EIN **41-3512174** (see `twilio-sms-status.md`)
