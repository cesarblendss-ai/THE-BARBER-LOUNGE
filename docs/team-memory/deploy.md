# Deploy Status

**Last verified:** 2026-08-08  
**Status:** **LIVE** — both production URLs return 200  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Share this URL

**https://the-barber-lounge.vercel.app**

Also works:
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app
- https://the-barber-lounge-antioch.vercel.app (alias)

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
