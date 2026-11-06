# Deploy Status

**Last verified:** 2026-11-06  
**Status:** Code **pushed** on `cursor/booksy-auto-book-c298` @ `3b4c501`. **Prod deploy waiting on Vercel team re-auth.**  
**Production host:** https://thebarberloungeca.com  
**Branch:** `cursor/booksy-auto-book-c298`  
**PR draft:** https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/new/cursor/booksy-auto-book-c298  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## What shipped / shipping

| Item | Live? |
|------|-------|
| `/` → `/book` | ✅ prod |
| Live Booksy open-slot sync | ✅ prod (PR #20) |
| `/book` → Booksy deep-link handoff | ⏳ branch ready — deploy after Vercel auth |
| Receipt **Finish on Booksy** | ⏳ |
| ntfy Click = prefilled Booksy | ⏳ |
| Admin **Open Booksy →** | ⏳ |
| Server auto-create in Booksy | ❌ needs customer `x-access-token` (403 without) |

---

## Proof (this branch)

```
npm run test:booksy-handoff   # ok
npm run smoke:booksy-handoff  # Booksy HTML 200 with open-widget + variant + staffer + date
```

Example handoff URL:

`https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch?do=open-widget&variantId=16190327&stafferId=1653463&date=2026-11-10&time=11:45`

Create API without token → HTTP 403 `access_token` (expected).

---

## Share after prod promote

- https://thebarberloungeca.com/book
- https://thebarberloungeca.com/admin/calendar-sync
