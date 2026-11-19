# Deploy Status

**Last verified:** 2026-11-19  
**Status:** **LIVE** — Booksy customer handoff removed; booking ends at on-site receipt (PR #29).  
**Production host:** https://thebarberloungeca.com  
**Branch / PR:** `main` ← merged [`#29`](https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE/pull/29) (`cursor/remove-booksy-handoff-c298`)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## What shipped (2026-11-19)

| Item | Live? |
|------|-------|
| `/book` submit → on-site receipt only (no Booksy popup) | ✅ merging / deploying |
| Customer Booksy CTAs removed (lead modal, about, blogs, legal) | ✅ |
| Owner ntfy/SMS: confirm chair yourself | ✅ |
| Admin Open Booksy helpers (staff confirm) | ✅ kept |
| Booksy live availability sync (backend) | ✅ still available if reachable |

---

## Share these URLs

**Primary custom domain:** https://thebarberloungeca.com → redirects to **/book**  
**Book online (canonical):** https://thebarberloungeca.com/book  

---

## Notes

- Cesar confirms appointments off-site; website stops at the receipt.
- Do not reintroduce customer `window.open` Booksy handoff without an explicit ask.
