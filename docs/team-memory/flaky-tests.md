# Flaky Tests & Local Dev Issues

**Last verified:** 2026-08-08

Known issues that aren't production bugs but waste agent/user time locally. Update when fixed or new quirks found.

---

## OneDrive `.next` corruption

**Cause:** Repo at `C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge`. OneDrive sync races with Next.js writing `.next/` during `npm run dev` or `npm run build`.

**Symptoms:**

- `EINVAL` / file lock errors during build
- Dev server crashes; `ERR_CONNECTION_REFUSED` on localhost:3000
- Hot reload / webpack corruption
- Intermittent "Cannot find module" after seemingly successful compile

**Mitigations:**

1. **Preferred:** Move repo outside OneDrive (e.g. `C:\dev\the-barber-lounge`)
2. **Quick fix:** Delete `.next` folder and restart dev server
3. **Verify builds:** Copy to `%TEMP%` and build there if Desktop build fails
4. **Vercel remote builds** are unaffected (no OneDrive on build servers)

**Agent note:** If `npm run build` fails with file lock errors on this machine, suggest deleting `.next` or building on Vercel — don't assume code is broken.

---

## Dev server stops unexpectedly

**Cesar’s Hub (port 8743):** this is `python3 cesars-hub/server.py`, not `next dev`. If something else is already bound to 8743 (a leftover Next server), stop it before launching the Python hub.

**Often related to:** OneDrive corruption above, or port 3000 already in use.

**Quick recovery:**

```powershell
# Kill stale node processes if needed, then:
Remove-Item -Recurse -Force .next
npm run dev
```

If still failing, try `npm run build` in a temp copy outside OneDrive.

---

## SEO agent v1 table bug — **FIXED**

**Issue (v1 run):** `seo_agent.py` parsed markdown table rows from keyword research as blog post titles. Output folder `the_barber_lounge_2026_08_08/` has garbage topics.

**Fix (v2):** JSON array from LLM + barbershop fallback topics. Use:

```
tools/seo-agent/output/the_barber_lounge_2026_08_08_v2/
```

**Do not use v1 folder** for publishing. See `docs/org-conventions/local-seo-playbook.md` for v1 vs v2 comparison.

---

## Prisma generate on clean clone

If `npm run build` fails on missing Prisma client:

```bash
npm run db:generate   # or: npx prisma generate
```

Analytics works without `DATABASE_URL` — generate still required for build.

---

## SMS test script

`npm run test:sms` sends real SMS when Twilio is configured. Will fail with **20003** until KYC cleared — expected, not a test flake.

---

## No automated test suite

Project has script-based tests (`scripts/test-sms.ts`, `scripts/test-booking-fallback.ts`) but no CI test runner. "Flaky tests" here means **environment/tooling issues**, not Jest failures.
