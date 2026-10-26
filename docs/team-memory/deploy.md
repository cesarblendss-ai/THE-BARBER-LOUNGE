# Deploy Status

**Last verified:** 2026-10-26 (America/Los_Angeles)  
**Status:** **LIVE** — production deploy succeeded after PR #12 merge  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`  
**Production commit:** `76242a1` (merge of cinematic homepage + Halloween)

---

## Share this URL

**https://the-barber-lounge.vercel.app**

Also works:
- https://the-barber-lounge-cesarblendss-7234s-projects.vercel.app
- https://the-barber-lounge-antioch.vercel.app (alias)
- Custom domain redirect: `https://thebarberlounge.com/` (configured on Vercel; verify SSL in browser)

**Deploy dashboard:** https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/3mbtVtPwVBToCMWKLDNN6giSd94N

---

## What’s live (2026-10-26)

- Cinematic video hero (3 clips)
- Conversion services + barber Booksy staffer deep links
- Halloween spider-web overlay / orange CTAs
- Clean footer (no public staff management links)

---

## Environment variables on Vercel

| Variable | Status |
|----------|--------|
| `ADMIN_UPLOAD_KEY` | **Set** |
| `NTFY_TOPIC` | Add for owner push in prod |
| `DATABASE_URL` | Not connected |
| `TWILIO_*` | Add after KYC |
| `OPENAI_API_KEY` | Add if booking chat needed in prod |
| `STRIPE_SECRET_KEY` | **Not set** — needed for estimate deposits |
| `STRIPE_WEBHOOK_SECRET` | **Not set** — webhook signing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Not set** — Checkout publishable key |

---

## `SITE_URL` in code

Points to `https://the-barber-lounge.vercel.app` until custom domain SSL is fully verified.

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/knowledge/vercel-deploy-status.md` for history.
