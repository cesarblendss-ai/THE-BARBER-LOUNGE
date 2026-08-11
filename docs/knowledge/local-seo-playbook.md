> **Canonical copy:** [`docs/org-conventions/local-seo-playbook.md`](../org-conventions/local-seo-playbook.md) — update there, not here.

# Local SEO Playbook

**Last verified:** 2026-08-08  
**Full agency SOP:** `tools/seo-agent/AGENCY_PLAYBOOK.md`  
**VA publish steps:** `tools/seo-agent/PUBLISHING_CHECKLIST.md`  
**Technical run guide:** `tools/seo-agent/README.md`

---

## Service packages

| Package | Price/mo | Blog posts | GBP posts | Extras |
|---------|----------|------------|-----------|--------|
| **Starter** | $497 | 2 | 2 | Keyword research + client report |
| **Growth** | $997 | 4 | 4 (weekly) | + meta tags, schema, on-page audit, competitor report |
| **Dominator** | $1,497 | 4 | 4 + photo prompts | + citations (top 15 dirs), review responses, strategy call |

- **Setup fee (one-time):** $297  
- **Annual prepay:** 2 months free (pay 10, get 12)  
- **The Barber Lounge** is on **Growth** (founder/case-study client).

---

## 11 deliverables per agent run

Saved to `tools/seo-agent/output/{client_slug}_{YYYY_MM_DD}/` (optional `--suffix`):

| # | File | Purpose |
|---|------|---------|
| 1 | `keyword_research.md` | Primary/secondary/long-tail keywords, clusters |
| 2 | `blog_post_1.md` | Full SEO article (~1,200–1,500 words) |
| 3 | `blog_post_2.md` | Full SEO article |
| 4 | `blog_post_3.md` | Full SEO article |
| 5 | `blog_post_4.md` | Full SEO article |
| 6 | `gbp_posts.md` | 4 weeks of Google Business Profile posts |
| 7 | `meta_tags.md` | Title + meta description for core pages + blog |
| 8 | `schema_markup.json` | JSON-LD LocalBusiness — review against live site |
| 9 | `onpage_audit.md` | Actionable site + GBP checklist |
| 10 | `competitor_report.md` | Gaps + 90-day outrank strategy |
| 11 | `client_report.md` | Client-facing monthly summary (email/PDF — **do not publish to website**) |

Typical run time: **~5–15 minutes** (API latency).

---

## How to run `seo_agent.py`

```powershell
cd tools/seo-agent
pip install -r requirements.txt
copy .env.example .env
# Set OPENAI_API_KEY in tools/seo-agent/.env OR use project root .env.local

python seo_agent.py --test                    # smoke test
python seo_agent.py "The Barber Lounge"       # full run
python seo_agent.py "The Barber Lounge" --suffix v2   # alternate output folder
```

**Client config:** `tools/seo-agent/clients/the_barber_lounge.json`  
**Competitors in profile:** Fades & Blades Antioch, Executive Cuts Antioch, local Booksy barbershops.

### Required / optional env vars

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes* | Primary LLM (`gpt-4o-mini` default) |
| `ANTHROPIC_API_KEY` | No | Fallback if OpenAI fails |
| `SERPER_API_KEY` | No | **Live Google search** via serper.dev |
| `OPENAI_MODEL` | No | Override model |
| `ANTHROPIC_MODEL` | No | Fallback model |

\*Reads `tools/seo-agent/.env` first, then project `.env.local`.

---

## Serper (live Google data)

- API: `https://google.serper.dev/search`
- Used in `seo_agent.py` → `search_web()` for competitor/keyword research.
- **Without `SERPER_API_KEY`:** competitor report and keyword volumes are LLM estimates only — agent prints a warning.
- **With key:** real organic results (title, URL, snippet) feed the prompts.

---

## Owner + VA workflow (monthly)

From `AGENCY_PLAYBOOK.md`:

| Role | Task | Time |
|------|------|------|
| **You** | Run `seo_agent.py` | ~15 min |
| **You** | Review `client_report.md` + spot-check 2 blog posts | ~10 min |
| **You** | Skim meta tags, schema, audit | ~15 min |
| **You** | Send VA output folder + `PUBLISHING_CHECKLIST.md` | ~5 min |
| **You total** | | **~30 min/client/month** |
| **VA** | Publish 4 posts, GBP, meta, schema | ~2–3 hrs |
| **VA (Dominator only)** | Citation submissions | ~1 hr |

At **20 clients:** ~10 hrs/month owner time; VA handles publishing.

**VA rule:** Publish agent output exactly — no rewriting headlines or body copy unless owner approves.

---

## The Barber Lounge — output folders

| Run | Folder | Notes |
|-----|--------|-------|
| v1 (buggy topics) | `tools/seo-agent/output/the_barber_lounge_2026_08_08/` | Blog topics parsed from markdown table garbage |
| **v2 (fixed)** | `tools/seo-agent/output/the_barber_lounge_2026_08_08_v2/` | Use this run — proper titles, real business context injected |

**Do not paste full blog posts into chat.** Point to the output folder. Sample v2 topics:

- How to Choose the Best Barber in Antioch, CA  
- Fade vs Taper (kids haircuts guide)  
- How to Maintain Your Fade  
- Beard trim grooming routine  

---

## Applying output to the Next.js site

Order (from `tools/seo-agent/README.md`):

1. **Meta tags** → `buildPageMetadata()` in each `src/app/*/page.tsx`
2. **Schema** → merge into `LOCAL_BUSINESS_SCHEMA` / `buildLocalBusinessJsonLd()` — keep real review counts from `SITE.rating` / `SITE.reviewCount`
3. **Blog posts** → add to `src/lib/blog-posts.ts` or MDX routes under `src/app/blog/[slug]/`
4. **GBP posts** → manual publish in Google Business Profile (separate from Booksy)
5. **Audit + competitor report** → task list, not necessarily code changes

**Live blog post (code):** `/blog/best-fades-barbershop-antioch` — data in `src/lib/blog-posts.ts`.

**Domain note:** `SITE_URL` in `src/lib/constants.ts` is still `https://thebarberlounge.com` — update when custom domain goes live or canonicals will be wrong.

---

## Known agent issues (fixed in v2)

| Issue | v1 behavior | v2 fix |
|-------|-------------|--------|
| Topic extraction | Parsed markdown table rows as titles | JSON array from LLM + barbershop fallback topics |
| Business context | Placeholder address in audit | Injects real address/phone from client JSON |
| Competitor data | Pure LLM guesswork without Serper | Serper warning + better prompts |
| client_report.md | Hallucinated different blog titles | Should match generated posts after fix |
