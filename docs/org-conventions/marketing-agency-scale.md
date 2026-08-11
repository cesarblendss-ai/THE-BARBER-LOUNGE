# Marketing Agency Scale

**Last verified:** 2026-08-08  
**Source:** `tools/seo-agent/AGENCY_PLAYBOOK.md`

---

## Business model

```
Onboard client → seo_agent.py (~15 min) → You review (~30 min) → VA publishes (~2–3 hrs)
```

- **Your job:** Quality control + client relationship.  
- **VA job:** Publishing only — no writing.  
- **Case study #1:** The Barber Lounge (Antioch) — full site + booking + SEO stack.

---

## Pricing packages (summary)

| Package | Price | Best for |
|---------|-------|----------|
| Starter | $497/mo | New businesses, tight budget |
| Growth | $997/mo | Most local service businesses |
| Dominator | $1,497/mo | Competitive markets, aggressive growth |

Setup fee: **$297** one-time per client.

See `local-seo-playbook.md` for deliverable breakdown.

---

## 20-client math

**Assumed mix:** 5 Starter + 12 Growth + 3 Dominator

| Line item | Monthly |
|-----------|---------|
| 5 × Starter ($497) | $2,485 |
| 12 × Growth ($997) | $11,964 |
| 3 × Dominator ($1,497) | $4,491 |
| **Total MRR** | **$18,940** |
| VA (Philippines, full-time) | −$800 |
| Anthropic/OpenAI (~$5/client) | −$100 |
| Serper (optional) | −$50 |
| Tools (Notion, Loom, etc.) | −$50 |
| **Net profit** | **~$17,940/mo** |
| **Owner time** (~10 hrs/mo at 20 clients) | **~$1,794/hr effective** |
| **Margin** | **~95%** |

**Onboarding bump:** 20 × $297 setup = **$5,940** one-time.

---

## First 5 clients — acquisition

| # | Target | How to close | Package |
|---|--------|--------------|---------|
| 1 | **The Barber Lounge** (Antioch) | Already built — document before/after | Growth (founder rate) |
| 2 | Barbershop/salon within 10 miles | Walk in, show fixed GBP + site | Growth |
| 3 | Home services (plumber, HVAC) | Maps search → bad photos/descriptions → cold call | Starter → upsell Growth month 3 |
| 4 | Dentist, chiro, med spa | Maps outreach | Dominator |
| 5 | Referral from #1 or #2 | $100 referral credit | Growth |

**30-second outreach script:**

> "Hey, I'm [name] — I run local SEO for businesses in [city]. I built the site and Google strategy for The Barber Lounge here in Antioch. I noticed [specific GBP issue]. I put together a quick audit — want me to send it over? No charge."

**Close rate target:** 1 in 5 conversations → signed client.

---

## VA hiring (OnlineJobs.ph)

| Platform | Rate | Notes |
|----------|------|-------|
| [OnlineJobs.ph](https://www.onlinejobs.ph) | $5–8/hr | Best for long-term Filipino VAs |
| Upwork | $8–15/hr | Good for trial projects |
| Facebook VA groups | $4–6/hr | "Virtual Assistant Philippines" |

**Job title:** SEO Publishing VA — No Writing Required (Content Provided)

**Tasks:** Publish blog posts, GBP posts, meta tags, schema, citations (Dominator).

**Pay:** $6–8/hr USD, weekly via Wise/PayPal.

**Paid test:** Send sample `blog_post_1.md` from any output folder; candidate publishes to test site in under 45 min without changing copy.

**Onboarding:**

1. Share `PUBLISHING_CHECKLIST.md`
2. Loom walkthrough using Barber Lounge as example
3. CMS + GBP Manager access (not Owner)
4. Week 1: owner reviews every publish
5. Month 2+: spot-check 1 in 4 clients

---

## Upsell stack (month 2–3)

| Upsell | Price | What | Effort |
|--------|-------|------|--------|
| Website build | $2,500–$5,000 once | Next.js site like Barber Lounge | Templated — swap `content.ts` |
| Booking chatbot + SMS | $297/mo | Wizard + SMS + owner alerts | Deploy existing stack |
| Analytics dashboard | $97/mo (or in Dominator) | `/admin/analytics` | Vercel Postgres |
| Google Ads management | $500/mo + spend | Local search ads from agent keywords | ~2 hrs/mo |
| Review generation | $197/mo | Post-service review requests | Twilio flow |
| ADA audit | $500 once | WCAG report | axe/Lighthouse |
| Social repurpose | $497/mo | Blog + GBP → IG/FB | VA task |

**Bundle pitch:** Growth SEO + Booking + Analytics = **$1,291/mo**.

---

## Monthly workflow (per client)

| Week | Actions |
|------|---------|
| 1 | Run agent → review output → send VA folder |
| 2 | VA publishes blogs, meta, schema; schedules GBP (1/week) |
| 3 | VA works audit quick wins; send `client_report.md` to client |
| 4 | Check-in call/Loom (Growth/Dominator); note upsells |

---

## Tools stack

| Tool | Cost | Purpose |
|------|------|---------|
| `seo_agent.py` | ~$5/client/mo | Content production |
| Serper.dev | $50/mo optional | Live Google data |
| OnlineJobs.ph VA | $800/mo | Publishing |
| Notion | Free | Client tracker |
| Loom | Free tier | VA training |
| Google Drive | Free | Output delivery |
| Stripe | 2.9% + $0.30 | Billing |
