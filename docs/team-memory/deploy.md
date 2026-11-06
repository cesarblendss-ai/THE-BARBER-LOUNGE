# Deploy Status

**Last verified:** 2026-11-06  
**Status:** **LIVE** (book-first). Booksy **auto-book handoff** shipping on `cursor/booksy-auto-book-c298`.  
**Production host:** https://thebarberloungeca.com  
**Branch:** `cursor/booksy-auto-book-c298`  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## What shipped / shipping

| Item | Live? |
|------|-------|
| `/` permanent redirect → `/book` (Tim funnel IS the website) | ✅ |
| Live Booksy open-slot pull (public customer API, no password) | ✅ |
| `/book` → Booksy deep-link handoff (`do=open-widget` + service/staffer/date/time) | ✅ (this ship) |
| Receipt primary CTA **Finish on Booksy** | ✅ (this ship) |
| ntfy Click = prefilled Booksy URL (one-tap for staff) | ✅ (this ship) |
| Admin calendar-sync **Open Booksy →** per web booking | ✅ (this ship) |
| Server auto-create inside Booksy | ❌ Needs customer session token — not used |

Staffers: Alexis `1124582`, Braulio `1740160`, Cesar `1653463`, Kristian `1659337`, Sebastian `1691142`.

---

## Share these URLs

**Primary custom domain:** https://thebarberloungeca.com → **/book**  
**Book online:** https://thebarberloungeca.com/book  
**Admin one-tap Booksy:** https://thebarberloungeca.com/admin/calendar-sync  

Prefer **thebarberloungeca.com** (`.com` still DNS-parked).

---

## Deploy commands

```powershell
npm run build
npx vercel --prod --yes
```

See `docs/team-memory/calendar-sync-agent.md` + `docs/operations/booksy-workflow.md`.
