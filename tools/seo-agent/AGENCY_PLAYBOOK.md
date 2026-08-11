# Local SEO Agency Playbook

**Model:** AI agent produces → you review (~25 min) → VA publishes (~2–3 hrs)  
**Case study #1:** [The Barber Lounge](https://the-barber-lounge.vercel.app) — Antioch, CA barbershop (site + SEO stack built in-house)

---

## How it works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Onboard    │ ──▶ │  seo_agent   │ ──▶ │  You review │ ──▶ │  VA publishes│
│  client     │     │  (15 min)    │     │  (25 min)   │     │  (2–3 hrs)   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

Each month per client, the agent outputs 11 files: keyword research, 4 blog posts, GBP posts, meta tags, schema, on-page audit, competitor report, and client report.

Your job is **quality control + client relationship**. The VA handles all publishing.

---

## Pricing packages

| | **Starter** | **Growth** | **Dominator** |
|---|---|---|---|
| **Price** | $497/mo | $997/mo | $1,497/mo |
| **Best for** | New businesses, tight budget | Most local service businesses | Competitive markets, aggressive growth |
| **Blog posts / month** | 2 | 4 | 4 |
| **GBP posts / month** | 2 | 4 (weekly) | 4 + photo prompts |
| **Keyword research** | ✓ | ✓ | ✓ + quarterly deep dive |
| **Meta tags** | Homepage only | All core pages + blog | All pages + ongoing optimization |
| **Schema markup** | — | ✓ | ✓ + service catalog |
| **On-page audit** | — | ✓ | ✓ + implementation tracking |
| **Competitor report** | — | ✓ | ✓ + 90-day battle plan |
| **Client report (PDF-ready)** | ✓ | ✓ | ✓ + monthly strategy call |
| **Citation building** | — | — | Top 15 directories |
| **Review response** | — | — | ✓ (VA drafts, you approve) |
| **Response time** | 5 business days | 3 business days | 48 hours |

**Annual prepay:** 2 months free (pay 10, get 12).

**Setup fee (one-time):** $297 — covers onboarding, GBP audit, baseline keyword research, first agent run.

---

## Time per client (monthly)

| Task | Who | Time |
|---|---|---|
| Run `seo_agent.py` | You (automated) | ~15 min |
| Review `client_report.md` + spot-check 2 blog posts | You | ~10 min |
| Skim meta tags, schema, audit for accuracy | You | ~15 min |
| Send VA the output folder + `PUBLISHING_CHECKLIST.md` | You | ~5 min |
| Publish 4 blog posts, GBP posts, meta tags, schema | VA | ~2–3 hrs |
| Citation submissions (Dominator only) | VA | ~1 hr |
| **Your total time** | **You** | **~30 min/client** |
| **VA total time** | **VA** | **~2–4 hrs/client** |

At 20 clients, you spend **~10 hours/month** on SEO work. The VA handles the rest.

---

## 20-client math

Assumes mix: 5 Starter + 12 Growth + 3 Dominator (adjust as you scale).

| Line item | Monthly |
|---|---|
| **Revenue** | |
| 5 × Starter ($497) | $2,485 |
| 12 × Growth ($997) | $11,964 |
| 3 × Dominator ($1,497) | $4,491 |
| **Total MRR** | **$18,940** |
| | |
| **Costs** | |
| VA (full-time, Philippines) | $800 |
| Anthropic API (~$5/client) | $100 |
| Serper API (optional, shared) | $50 |
| Tools (Notion, Loom, etc.) | $50 |
| **Total costs** | **~$1,000** |
| | |
| **Net profit** | **~$17,940/mo** |
| **Your hourly** (10 hrs/mo) | **~$1,794/hr** |
| **Profit margin** | **~95%** |

One-time setup fees (20 clients × $297) add **$5,940** in onboarding revenue.

---

## First 5 clients — acquisition plan

| # | Target | How to close | Package |
|---|---|---|---|
| **1** | **The Barber Lounge** (Antioch) | Already built — your live case study. Document before/after rankings, traffic, bookings. | Growth (founder rate) |
| **2** | Barbershop or salon within 10 miles | Walk in with phone: "Your Google listing has X issues — I fixed them for my shop, want to see?" Show the Barber Lounge site + GBP. | Growth |
| **3** | Home services (plumber, HVAC, electrician) | Google Maps search → find businesses with bad photos, no posts, weak descriptions. Cold DM or call owner directly. | Starter → upsell Growth at month 3 |
| **4** | Dentist, chiropractor, or med spa | Same Maps outreach. These niches pay Dominator rates easily. | Dominator |
| **5** | Referral from client #1 or #2 | "Know any other business owners who need more Google calls?" Offer $100 referral credit. | Growth |

**Outreach script (30 seconds):**

> "Hey, I'm [name] — I run local SEO for businesses in [city]. I built the site and Google strategy for The Barber Lounge here in Antioch. I noticed [specific issue on their GBP]. I put together a quick audit — want me to send it over? No charge."

**Close rate target:** 1 in 5 conversations → signed client.

---

## VA hiring

### Where to hire

| Platform | Cost | Notes |
|---|---|---|
| [OnlineJobs.ph](https://www.onlinejobs.ph) | $5–8/hr | Best for long-term Filipino VAs |
| [Upwork](https://www.upwork.com) | $8–15/hr | Good for trial projects |
| Facebook groups | $4–6/hr | "Virtual Assistant Philippines" groups |

### Job post title

> SEO Publishing VA — No Writing Required (Content Provided)

### Job post body (copy-paste)

> We run a local SEO agency for US small businesses. Each month, our AI generates blog posts, Google Business Profile posts, meta tags, and schema markup. **You do not write anything** — you publish pre-written content.
>
> **Tasks:** Publish blog posts to client websites, post to Google Business Profile, update meta tags, paste schema markup, submit citations (Dominator clients).
>
> **Requirements:** Comfortable with WordPress, Webflow, or Next.js admin panels. Google Business Profile experience. Detail-oriented — you follow checklists exactly. Good English reading comprehension.
>
> **Hours:** 20–40 hrs/week depending on client count.  
> **Pay:** $6–8/hr USD, paid weekly via Wise or PayPal.  
> **Start:** Paid test task (publish 1 sample blog post from our template).

### Paid test task

1. Send candidate a sample `blog_post_1.md` from any agent output folder.
2. Ask them to publish it to a test WordPress/Webflow site (or a Google Doc formatted as a blog post).
3. Grade on: followed slug/title/meta, proper H1/H2 structure, no content changes, completed in under 45 min.

### VA onboarding checklist

- [ ] Share `PUBLISHING_CHECKLIST.md`
- [ ] Walk through one client publish on a Loom video (record yourself doing Barber Lounge)
- [ ] Give access: client CMS, GBP (Manager role, not Owner), shared Google Drive for output folders
- [ ] First week: you review every publish before it goes live
- [ ] Month 2+: spot-check 1 in 4 clients

---

## Upsell stack

Sell these after the client trusts you (usually month 2–3).

| Upsell | Price | What it is | Your effort |
|---|---|---|---|
| **Website build** | $2,500–$5,000 one-time | Modern Next.js site like Barber Lounge — booking, gallery, mobile-first | Already templated — swap content.ts |
| **Booking chatbot + SMS** | $297/mo | Tap-to-book wizard, SMS confirmations, owner notifications | Deploy existing Barber Lounge stack |
| **Analytics dashboard** | $97/mo (or included in Dominator) | Visitor tracking, top pages, button clicks — `/admin/analytics` | Plug in Vercel Postgres |
| **Google Ads management** | $500/mo + ad spend | Local search ads targeting money keywords from agent research | 2 hrs/mo setup + monitor |
| **Review generation system** | $197/mo | Automated review request texts/emails after service | Twilio + simple flow |
| **ADA compliance audit** | $500 one-time | WCAG audit + fix report for their site | Run axe/Lighthouse, deliver report |
| **Social media (IG/FB posts)** | $497/mo | Repurpose blog content + GBP posts for social | VA task — no extra writing |

**Bundle pitch:** "Growth SEO + Booking chatbot + Analytics = $1,291/mo — everything you need to get found and get booked."

---

## Monthly workflow (per client)

### Week 1 — Production

1. Run agent: `python seo_agent.py --client clients/the_barber_lounge.json`
2. Review output folder (~25 min)
3. Send VA the folder + checklist

### Week 2 — Publishing

4. VA publishes blog posts + meta tags + schema
5. VA schedules GBP posts (1 per week for 4 weeks)

### Week 3 — Audit items

6. VA works through `onpage_audit.md` quick wins
7. You send `client_report.md` to client (email or PDF)

### Week 4 — Relationship

8. Quick check-in call or Loom update (Growth/Dominator)
9. Note upsell opportunities for next month

---

## Tools stack

| Tool | Cost | Purpose |
|---|---|---|
| `seo_agent.py` | ~$5/client/mo (Anthropic API) | Content production |
| Serper.dev | $50/mo (optional) | Live Google search data |
| OnlineJobs.ph | $800/mo (VA) | Publishing |
| Notion | Free | Client tracker, SOPs |
| Loom | Free tier | VA training videos |
| Google Drive | Free | Output folder delivery to VA |
| Stripe | 2.9% + $0.30 | Client billing |

---

## Files in this folder

| File | Purpose |
|---|---|
| `AGENCY_PLAYBOOK.md` | This document — business model + scaling |
| `PUBLISHING_CHECKLIST.md` | VA step-by-step publish guide |
| `CLIENT_ONBOARDING.md` | Intake form for new clients |
| `clients/*.json` | Machine-readable client configs |
| `seo_agent.py` | Monthly content production |
| `README.md` | Technical setup + run instructions |
