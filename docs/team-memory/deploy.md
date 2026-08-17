# Deploy Status

**Last verified:** 2026-08-16  
**Status:** **LIVE** on the Antioch alias  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Share these URLs

**Public site:** https://the-barber-lounge-antioch.vercel.app  
**Staff Hub:** https://the-barber-lounge-antioch.vercel.app/admin  
**Cesar’s Hub:** standalone app `cesars-hub/` — local http://localhost:8743 — **not** on this Vercel project

Do **not** share `https://the-barber-lounge.vercel.app` or `thebarberlounge.com` until NameBright DNS is fixed — those currently park on HugeDomains.

Also works:
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app

---

## Latest fix (resolved)

Vercel framework was **Other** + output dir `.` → empty routing. Fixed via `npx vercel project update` to **Next.js**, redeployed, re-aliased. Deployment: `dpl_4BzeNheB9NRpnVFAcCpZsVRNvhtz`.

**ADMIN_UPLOAD_KEY:** Set in Vercel Production + `.env.local` (check local file for value).

---

## Local vs production

Local build matches production deploy `dpl_gnu4dpympcKPotU6n5YmAbmWEHpk` — **57 routes** live.

---

## Environment variables on Vercel

| Variable | Status |
|----------|--------|
| `ADMIN_UPLOAD_KEY` | **Set** |
| `NTFY_TOPIC` | Add for owner push in prod |
| `DATABASE_URL` | Not connected |
| `TWILIO_*` | Add after KYC |
| `OPENAI_API_KEY` | Add if booking chat needed in prod |

---

## `SITE_URL` in code

Points to `https://the-barber-lounge.vercel.app` until custom domain is live.

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/knowledge/vercel-deploy-status.md` for history.
