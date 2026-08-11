# Yes We Can — Site Rebuild + Content Plan

**Owner:** Tio Jose (uncle)  
**Business:** Full-service **mobile craft beverage canning** — 3 lines, ~45 cans/min each, 15+ yrs packaging  
**Testimonials on site:** Shanty Shack Brewing (Brandon Padilla), J.L. Rosillo  
**Can formats:** 8.4 oz slim · 12 oz sleek · 12 oz standard · 16 oz standard  
**Paid:** $1,000 upfront + $200/mo — see [BUDGET.md](./BUDGET.md)

| Budget line | Amount | This plan |
|-------------|--------|-----------|
| Create site | $300 | Phase 1–2 below |
| 6 videos | $480 | Launch batch — hero + process gallery + social |
| API / hosting | $200 | Quote DB, Serper, Vercel |
| Maintain + reviews + trends | $200/mo | Phase 3 ongoing |

---

## What Jose wants (from texts)

- Part-time marketing guy — edit his weekend videos (CapCut-style)
- More **quality video** on the site — process, ASMR, before/after (not AI hero)
- **New site** with AI integration + database (quotes, leads, maybe booking)
- Blow up the business → your case study for other clients

---

## Phase 1 — Quick wins (Week 1–2) · $300 site + $480 video batch

| Task | Budget | Detail |
|------|--------|--------|
| **Hero video** | Video ($80 × 1) | Replace AI hero with real canning line footage (Jose sends raw → you edit) |
| **5 more launch videos** | Video ($80 × 5) | Process clips, ASMR, before/after for `/process` + social |
| **Homepage meta + schema** | Site ($300) | Beverage canning keywords — **v2 SEO output** |
| **Quote / lead form → database** | Site + API ($200) | Name, brewery, beverage type, case volume, phone → Postgres or simple CRM |
| **GBP + testimonials** | $200/mo scope | Shanty Shack quote already on site — use on GBP |
| **Publish SEO blogs** | Included in $1k | From `yes_we_can_mobile_solutions_2026_08_08_v2/` |

---

## Phase 2 — New site (Week 3–6) · remainder of $300 site line

Clone barber-lounge stack → `yes-we-can-mobile` repo:

| Page | Purpose |
|------|---------|
| `/` | Hero **video**, 3 lines capability, testimonials, CTA quote |
| `/services` | Mobile canning, labeling, materials, formats (8.4/12/16 oz) |
| `/process` | Video gallery — canning run start to finish |
| `/areas` | Northern CA — Oakland, Napa, Paso Robles, etc. |
| `/blog` | SEO posts from agent |
| `/quote` | Wizard: beverage type → volume → date → contact |
| `/admin` | Leads, edit copy, upload videos |

**Stack:** Next.js 15 · Vercel · Postgres · same booking-agent pattern for quote wizard · ntfy/SMS for Jose on new leads

---

## Phase 3 — Content engine (ongoing · $200/mo retainer)

Covers: **maintain site + manage reviews + trends/SEO** (per closed deal).

| Cadence | Content |
|---------|---------|
| **Weekly** | Jose films on weekends → you edit 1 Reels/TikTok + 1 site clip |
| **Monthly** | SEO agent run → 4 blogs + 4 GBP posts + review monitoring |
| **Quarterly** | Before/after brewery case study |

**Video types that perform:** line running ASMR, first-can moment, team on site, brewery owner reaction, 8.4 vs 12 vs 16 oz explainers

---

## SEO correction (important)

Month 1 SEO v1 was generated for **home food canning** — wrong niche.  
Business is **craft beverage mobile canning** (beer, cider, wine, cocktails).

**v2 complete:** `tools/seo-agent/output/yes_we_can_mobile_solutions_2026_08_08_v2/`  
Target keywords: mobile canning Northern California, craft beer canning Oakland, beverage co-packing Napa, mobile canning line rental, etc.

Re-run next month:

```powershell
python run.py seo "Yes We Can Mobile" --memory
```

---

## Text to send Jose (copy/paste)

> Tio — locked in your scope from our budget: $1k covers the new site ($300), 6 edited videos from your line footage ($480), and getting everything wired up (APIs/hosting $200). $200/mo keeps the site maintained, handles Google reviews + trends, and runs SEO blogs/posts every month. Send me raw video from canning runs and I'll start the homepage hero + social clips. Next: quote form so leads hit a database and you get a text when someone inquires.

---

## Need from Jose

- [ ] Raw video from canning runs (phone is fine)
- [ ] Instagram / social handle
- [ ] Email for lead notifications
- [ ] GBP access
- [ ] Logo files + brand colors if any
