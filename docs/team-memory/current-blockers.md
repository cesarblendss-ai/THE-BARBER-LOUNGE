# Current Blockers

**Last verified:** 2026-08-11 (pre-flight audit)

---

## Active blockers

| Blocker | Detail | Doc |
|---------|--------|-----|
| **Custom domain DNS** | **NOT LIVE** — `thebarberlounge.com` resolves to **HugeDomains parking** (AWS IPs `54.243.117.197`, `13.223.25.84`). Vercel project has domain + SSL queued; **NameBright DNS** still wrong. Use `the-barber-lounge-antioch.vercel.app` until fixed. |
| **Booksy integration** | No API — manual Booksy entry after each website booking | `booking-system.md` |

---

## Phase 2 (deferred — not blocking launch)

| Item | Detail | Doc |
|------|--------|-----|
| **Twilio SMS — error 20003** | Trust Hub KYC not approved. Owner alerts work via **ntfy (primary)**. | `twilio-sms-status.md` |

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

1. **NameBright DNS** for `thebarberlounge.com` (A + CNAME per launch checklist)
2. **Phone ntfy test** — `/admin/notifications` → Send test notification (use new `ADMIN_UPLOAD_KEY` from `.env.local`)
3. **`RETAIL_LOG_PIN`** on Vercel Production (optional security)
4. Confirm analytics in Vercel dashboard after a site visit
5. **Phase 2:** Twilio Trust Hub (optional)
