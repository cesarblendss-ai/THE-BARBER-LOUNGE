# Current Blockers

**Last verified:** 2026-11-06 (book-first + calendar sync)

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **`thebarberlounge.com` DNS** | Still **HugeDomains parking**. Prefer live **`https://thebarberloungeca.com`** (verified on Vercel) + antioch alias. Fix NameBright only if Cesar wants the `.com` brand live. |
| **Booksy live calendar** | No public create/list API — website syncs from **internal** appointments + HOURS only; Booksy deep links remain fallback. Cesar paste/export or future integration for true Booksy chairs. | `calendar-sync-agent.md`, `booking-system.md` |
| **Stripe deposit env** | Code is in; **Cesar** still needs Stripe account + bank + Vercel `STRIPE_*` + webhook URL before Pay deposit works in production | `estimates-stripe.md` |
| **SMS / email campaigns** | Lead opt-ins stored (`/api/lead`); **campaigns not live** until Twilio KYC + email provider | `twilio-sms-status.md`, `tim-cho-conversion.md` |
| **CRM haircut notes** | Not built — leads JSON has optional notes only | `tim-cho-conversion.md` |
| **Durable lead storage** | `data/leads.json` ephemeral on Vercel — same constraint as appointments | `tim-cho-conversion.md` |

---

## Phase 2 (deferred — not blocking launch)

| Item | Detail | Doc |
|------|--------|-----|
| **Twilio SMS — error 20003** | Trust Hub KYC not approved. Owner alerts via **ntfy (primary)**. Required before customer SMS campaigns. | `twilio-sms-status.md` |

---

## Partially working

| Item | Status |
|------|--------|
| **RETAIL_LOG_PIN on Vercel** | Not set — shop log unlocked; see `security-checklist.md` |

---

## Resolved (2026-08-11 audit)

| Blocker | Resolved |
|---------|----------|
| **ADMIN_UPLOAD_KEY broken on prod** | Was literal placeholder `[SENSITIVE]` — rotated to real key, redeployed. Use key in `.env.local`. |
| **ntfy push ByteString error** | Em dash in `Title` header crashed fetch — fixed `asciiHeader()` in `notifications.ts` |
| **Postgres schema** | Build-time `db:push` confirms schema in sync on Neon |
| **Admin appointments cookie auth** | `795b3ab` deployed — `/api/appointments` accepts edit-mode cookie |
| **Site content Postgres persistence** | `d7aa1d1` + Neon `TBLDB_*` vars on Vercel Production |
| **Owner ntfy push** | `NTFY_TOPIC` set on Vercel Production |
| **Site deploy** | **LIVE** — 64 routes, `main` @ latest, prod deploy `dpl_2yqYkdEoNyFTHknp1G9bEPEwyP7P` |

---

## Next actions (Cesar clicks)

**→ Full list:** `docs/operations/LAUNCH-CHECKLIST.md`

1. Confirm prod: `https://thebarberloungeca.com` opens **`/book`** (no Halloween webs)
2. Optional: set **`CRON_SECRET`** on Vercel Production for cron auth hardening
3. **NameBright DNS** for `thebarberlounge.com` (A + CNAME per launch checklist) — live site is `thebarberloungeca.com`
4. **Stripe for estimates** — account + bank + Vercel env + webhook (`docs/team-memory/estimates-stripe.md`)
5. **Phone ntfy test** — confirm booking + **new lead** pushes still arrive
6. **`RETAIL_LOG_PIN`** on Vercel Production (optional security)
7. **Phase 2:** Twilio Trust Hub (EIN `41-3512174`) before SMS campaigns
8. **Email provider** (`RESEND_API_KEY` + `OWNER_EMAIL`) before email campaigns
9. Review `/admin/leads` + `/admin/calendar-sync` after traffic
10. If Booksy chairs drift: paste busy blocks as admin blocked slots (no live Booksy API)
