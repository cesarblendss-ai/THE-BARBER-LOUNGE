# Yes We Can — Phase 2 Scope & Boundaries

**Client:** Jose (Tio Jose) · Yes We Can Mobile Solutions  
**Contract closed:** 2026-08-08  
**Budget (source of truth):** [BUDGET.md](./BUDGET.md)  
**Site plan:** [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) · **Engagement:** [ENGAGEMENT.md](./ENGAGEMENT.md)

This doc exists so Cesar and Jose stay aligned on **what is paid for** vs **what requires a new quote**. When in doubt, [BUDGET.md](./BUDGET.md) wins.

---

## Contract summary

| | Amount | Status |
|---|--------|--------|
| **Upfront (startup)** | **$1,000** | ✅ Paid |
| **Monthly retainer** | **$200/mo** | ✅ Active (Aug 2026+) |

No other line items were closed on the pizza-box budget. Anything not listed below is **out of scope** until Jose approves a written add-on quote.

---

## Phase map (what “Phase 2” means here)

| Phase | Timing | Paid by | Doc section |
|-------|--------|---------|-------------|
| **Phase 1** | Week 1–2 | $1k upfront | Quick wins on current site + launch video batch |
| **Phase 2** | Week 3–6 | Remainder of $300 site line in $1k | Full Next.js rebuild (Barber Lounge stack pattern) |
| **Phase 3** | Ongoing | $200/mo retainer | Maintenance, SEO, reviews, light video edits |

**Phase 2** = clone the barber-lounge **marketing site pattern** for mobile beverage canning — not every feature Cesar built for The Barber Lounge.

---

## ✅ Included — $1,000 upfront

Full allocation: [BUDGET.md § $1,000 upfront](./BUDGET.md#1000-upfront--scope--deliverables)

| Deliverable | Budget line | Done when |
|-------------|-------------|-----------|
| **Next.js site rebuild** | $300 | Live site with pages below, real hero **video** (not AI image), mobile-friendly |
| **6 edited launch videos** | $480 ($80 × 6) | Hero + process/social clips from **Jose’s raw footage** |
| **API / hosting setup** | $200 | Vercel, Postgres lead DB, Serper, env wired |
| **AI copy assist (one-time)** | $60 (internal) | Meta/schema drafts from SEO v2 — not a recurring client line |
| **SEO Month 1** | Included in $1k | Publish from **v2** output (beverage canning — not v1 food canning) |

### Phase 2 site pages (in the $300 site line)

| Route | Purpose |
|-------|---------|
| `/` | Hero video, 3-line capability, testimonials, quote CTA |
| `/services` | Mobile canning, labeling, materials, can formats |
| `/process` | Video gallery — canning run start to finish |
| `/areas` | Northern CA service area pages |
| `/blog` | SEO posts from agent |
| `/quote` | Wizard: beverage type → volume → date → contact → **Postgres** |
| `/admin` | View leads, edit copy, upload videos |

### Phase 2 integrations (in the $200 API line + site line)

| Feature | Included? | Notes |
|---------|-----------|-------|
| Quote form → Postgres | ✅ | Core deliverable |
| Owner alert on new lead (**ntfy** push) | ✅ | Same pattern as Barber Lounge |
| SMS to Jose on new lead | ❌ | Twilio Trust Hub = separate Phase 2 effort; ntfy covers launch |
| Online booking / calendar | ❌ | Quote wizard only — not Booksy-style scheduling |
| E-commerce / payments | ❌ | Not in budget |
| Client portal / login for breweries | ❌ | Admin is Cesar/Jose only |

### Video count (hard cap in upfront)

| Item | Included | Not included |
|------|----------|--------------|
| Launch batch | **6 edited videos** from Jose’s raw clips | Video shot on-site by Cesar (unless separately booked) |
| Formats | Reels/TikTok/site-ready exports | Long-form YouTube documentaries, paid ads, TV spots |
| Revisions | 1 round of reasonable edits per video | Unlimited re-cuts, new concepts after approval |

---

## ✅ Included — $200/mo retainer

Full allocation: [BUDGET.md § $200/mo](./BUDGET.md#200mo--recurring-scope--deliverables)

| Deliverable | Cadence | Reasonable expectation |
|-------------|---------|------------------------|
| **Site maintenance** | As needed | Deploy fixes, copy tweaks, form/DB uptime |
| **Review management** | Monthly | GBP review monitoring, response drafts |
| **SEO + trends** | Monthly | Agent run → **4 blogs**, **4 GBP posts**, keyword refresh, competitor snapshot, client report (~30 min Cesar time) |
| **Video editing** | As footage arrives | **Light edits** of Jose’s weekend clips — goodwill / case-study content |

### Retainer video — what “included” actually means

The retainer **does not** mean unlimited production:

| Included in $200/mo | Paid add-on (see below) |
|---------------------|-------------------------|
| 1–2 short social cuts per month **when Jose sends raw footage** | 3+ edited videos in a month |
| Trim, caption, basic color, export for Reels/TikTok | Motion graphics, voiceover, scripting, on-site shoot |
| Clips that support SEO / GBP | Full brand campaign, ad creative packages |

If Jose sends a backlog of 10 weekends of footage, Cesar picks what fits the content plan — **not** “edit everything.”

---

## ❌ Not included — paid add-ons

These are **not** part of $1k + $200/mo. Jose may ask because he’s seen Barber Lounge features or wants “the same thing.” **Default answer: “Happy to quote that separately.”**

### 1. Extra videos (beyond the 6 launch batch)

| Add-on | Suggested price | When to quote |
|--------|-----------------|---------------|
| **Additional edited video** | **$80 each** | 7th launch video, extra hero cut, quarterly case-study reel |
| **On-site shoot day** | Quote separately | Cesar travels with gear to a canning run |
| **Rush / same-week delivery** | +50% on video line | When Jose needs more than 2 deliverables in 7 days |

**Scope creep phrases to redirect:**

- “Can you cut 5 more from this one run?” → *“Launch batch was 6 in the $1k. Additional edits are $80 each — want a quote for how many?”*
- “Edit everything I send every week” → *“Retainer covers 1–2 social cuts a month. Extra volume is add-on work.”*

### 2. Booth rent tracker (and Barber Lounge ops modules)

**What it is:** Payroll / booth-rent / commission tracking built for **The Barber Lounge** (`/admin/products`, future booth rent ~$250/wk per barber). See `docs/retail-tracking.md` Phase 2.

**Why it’s not in Jose’s deal:** Yes We Can is a **mobile canning service**, not a multi-chair shop with booth renters. This module solves a barbershop inventory + rent problem Jose doesn’t have.

| If Jose asks for… | Response |
|-------------------|----------|
| “Can you track my crew’s pay like the barbershop?” | Custom ops dashboard — **new SOW + quote** (estimate **$500–1,500+** setup depending on rules) |
| “Booth rent tracker on my site” | Not applicable to canning; if he means **contractor/crew billing**, that’s a separate build |
| Product inventory / materials tracking | Not in $1k — quote as custom admin module |

**Do not** port Barber Lounge retail/booth code into yes-we-can-mobile unless Jose signs an add-on.

### 3. Motion / door sensor + webhook (“ping when it opens”)

**What it is:** Tier 1 hardware (~$30–80) + `POST /api/cabinet-event` → ntfy alert. Built for a **product cabinet** at The Barber Lounge. **PIR motion alone is explicitly rejected** — door contact only.

**Why it’s not in Jose’s deal:** No cabinet-inventory problem on the canning site. IoT + webhook + hardware setup is **integration work**, not marketing-site scope.

| Add-on component | Suggested handling |
|------------------|-------------------|
| Sensor hardware | Jose buys (or Cesar bills pass-through + markup) |
| Webhook + ntfy wiring | **$150–300** one-time setup if Jose has a real use case (e.g. warehouse door — must define use case first) |
| Ongoing monitoring | Not in $200/mo unless added to retainer |

**Scope creep phrases:**

- “Add the motion sensor like the barbershop” → *“That was for retail inventory, not part of your site contract. If you need alerts for something specific, I’ll quote the integration.”*
- “Can it text me when someone opens the warehouse?” → *“Possible as custom IoT work — not included in $200/mo maintenance.”*

---

## Other common asks — default to “no” or quote

| Request | In contract? | Action |
|---------|--------------|--------|
| Twilio SMS on every lead | ❌ | ntfy included; SMS = add-on after Trust Hub |
| Second website / landing pages per brewery | ❌ | Quote per page or SEO pack |
| CRM migration (HubSpot, Salesforce) | ❌ | Quote integration |
| Paid ads management | ❌ | Not in retainer |
| Logo / brand design from scratch | ❌ | Jose provides assets ([ASSET_REQUEST.md](./ASSET_REQUEST.md)) |
| Unlimited admin training / calls | ❌ | 15-min monthly check-in per [KICKOFF_CHECKLIST.md](./KICKOFF_CHECKLIST.md) |
| Home **food** canning content (SEO v1) | ❌ | Wrong niche — use v2 only |
| Forklift / line scheduling software | ❌ | Out of scope entirely |

---

## Scope creep rules (for Cesar)

1. **No verbal scope expansion.** Friendly uncle ≠ unlimited free work. If it’s not in [BUDGET.md](./BUDGET.md) or this doc’s ✅ sections, it waits for a quote.
2. **Change order before build.** Jose agrees in writing (text OK): *“Add X for $Y — approved.”*
3. **Retainer ≠ dev hours bank.** $200/mo is maintenance + SEO + light video — not a backlog of custom features.
4. **Reuse ≠ free.** Barber Lounge stack is a **template**, not a license to copy every module into Jose’s repo.
5. **Footage gate.** No new video work until Jose sends raw clips ([ASSET_REQUEST.md](./ASSET_REQUEST.md)). Missing assets pause the clock — not extra free labor.
6. **v2 SEO only.** Never publish v1 home-canning content to avoid rework and reputation damage.

---

## Text to send Jose (scope reminder)

Copy/paste if boundaries need a friendly reset:

> Tio — quick scope reminder so we stay on track: the $1k covered the new site, 6 edited videos from your footage, and getting leads into a database with alerts. $200/mo keeps the site running, Google reviews + SEO posts, and light social edits when you send clips. Stuff like extra videos beyond the 6, barbershop-style rent trackers, or sensor hardware aren’t in that package — I’m happy to quote those separately if you want them. Full breakdown is in our budget doc.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [BUDGET.md](./BUDGET.md) | **Pricing source of truth** |
| [SITE_REBUILD_PLAN.md](./SITE_REBUILD_PLAN.md) | Phase 1–3 build plan |
| [ENGAGEMENT.md](./ENGAGEMENT.md) | Contract, commands, open items |
| [KICKOFF_CHECKLIST.md](./KICKOFF_CHECKLIST.md) | Week 1 publish tasks |
| [ASSET_REQUEST.md](./ASSET_REQUEST.md) | What Jose must send before video/site work |
