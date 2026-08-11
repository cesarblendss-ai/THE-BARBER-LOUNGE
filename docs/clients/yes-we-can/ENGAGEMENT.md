# Yes We Can Solutions — Engagement

**Client:** Yes We Can Solutions  
**Website:** https://yeswecanmobile.com  
**Phone:** (707) 738-6502  
**Contact:** Jose (Tio Jose — uncle)  
**Niche:** **Craft beverage mobile canning** — beer, cider, wine, RTD cocktails (NOT home food canning)  
**Capabilities:** 3 mobile lines (~45 cans/min each), 15+ yrs packaging, nitrogen dosing, date coding, labeling, cans/lids/trays  
**Can formats:** 8.4 oz slim · 12 oz sleek · 12 oz standard · 16 oz standard  
**Min run:** 200 cases (24-pack) or ~600 gallons  
**Service area:** Northern California — Paso Robles, Oakland, Napa, Vallejo, Fairfield, Concord, Antioch, Pittsburg, Redding, Anderson Valley  
**Featured testimonial:** Shanty Shack Brewing (Brandon Padilla)  

---

## Contract (closed 2026-08-08)

| Item | Amount |
|------|--------|
| **Upfront (startup / Month 1 setup)** | **$1,000** |
| **Monthly retainer** | **$200/mo** |
| **SEO agent profile** | `tools/seo-agent/clients/yes_we_can_solutions.json` |
| **Full budget breakdown** | [BUDGET.md](./BUDGET.md) |

### What's included in $1,000 upfront

| Deliverable | Budget line |
|-------------|-------------|
| Next.js site rebuild kickoff | $300 — hero video, quote form → DB, process gallery |
| 6 edited social/process videos | $480 — Reels/TikTok/site clips from Jose's raw footage |
| API / hosting setup | $200 — Serper, Vercel, Postgres/lead APIs |
| AI tooling (one-time) | $60 — copy/meta/schema assist (not recurring) |
| SEO Month 1 (beverage canning) | Included — use **v2** output, not v1 |

### What's included monthly ($200/mo retainer)

- **Site maintenance** — deploys, content updates, lead DB
- **Review management** — GBP reviews, response drafts
- **Trends + SEO** — keyword refresh, 4 blogs, 4 GBP posts, meta/schema, audit, competitor snapshot, client report
- **Video editing** — Jose's weekend footage as it arrives (beyond launch batch of 6)

### Expanded scope (pitched, not separate contract)

Beyond SEO, Jose agreed to a **site rebuild + content engine** bundled in the $1k upfront:

| Workstream | Status | Doc |
|------------|--------|-----|
| Next.js site (hero video, quote DB, process gallery) | Not started | [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) |
| 6 launch videos from raw canning footage | Waiting on Jose's footage | [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) |
| Weekend social edits (Reels/TikTok) | Ongoing as footage arrives | $200/mo retainer |
| AI copy assist + lead notifications | Phase 2 | Same stack as Barber Lounge |

**Site problem today:** Hero on yeswecanmobile.com is an AI image — needs real process video from Jose's line.

### Your time (~30 min/mo SEO + ad-hoc video)

1. Run `python run.py seo "Yes We Can Mobile" --memory`
2. Review `client_report.md` + spot-check 1 blog
3. Send owner GBP posts + publish blogs (or VA)
4. Edit weekend footage when Jose sends it

---

## Output folders

| Run | Path | Use? |
|-----|------|------|
| Month 1 v1 (wrong niche) | `tools/seo-agent/output/yes_we_can_solutions_2026_08_08/` | ❌ Do not publish |
| **Month 1 v2 (beverage canning)** | `tools/seo-agent/output/yes_we_can_mobile_solutions_2026_08_08_v2/` | ✅ Publish from this |

---

## Open items from owner

- [ ] Physical address (for GBP + schema)
- [ ] Business email
- [ ] Instagram / social URLs
- [ ] Google Business Profile access (Manager)
- [ ] Website CMS login (WordPress/Webflow/etc.)
- [ ] Confirm 10% offer in GBP Week 4 before posting
- [ ] Real Google review link when available

---

## Commands

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge\tools\seo-agent
python run.py seo "Yes We Can Mobile" --memory
python run.py publish-check   # when site has blog slugs
```
