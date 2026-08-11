# Local SEO Agent — Ultimate Brain

Automated monthly local SEO production for local service businesses. Uses OpenAI (default: `gpt-4o-mini`) to generate keyword research, blog posts, GBP posts, meta tags, schema markup, audits, and client reports. Anthropic is supported as an optional fallback.

**Architecture:** See [BRAIN.md](./BRAIN.md) for the full "Ultimate Brain" vision — memory loop, script catalog, and extension guide.

**Case study #1:** [The Barber Lounge](https://the-barber-lounge.vercel.app) — Antioch, CA barbershop.

## Agency docs

| Doc | Purpose |
|---|---|
| [AGENCY_PLAYBOOK.md](./AGENCY_PLAYBOOK.md) | Business model, pricing, scaling to 20 clients, VA hiring, upsells |
| [PUBLISHING_CHECKLIST.md](./PUBLISHING_CHECKLIST.md) | VA step-by-step: publish blogs, GBP, meta, schema |
| [CLIENT_ONBOARDING.md](./CLIENT_ONBOARDING.md) | Intake form fields for new clients |

## Service packages

| Package | Price | Includes |
|---|---|---|
| **Starter** | $497/mo | 2 blog posts, 2 GBP posts, keyword research, client report |
| **Growth** | $997/mo | 4 blog posts, 4 GBP posts, meta tags, schema, audit, competitor report |
| **Dominator** | $1,497/mo | Everything in Growth + citations, review responses, strategy call |

See [AGENCY_PLAYBOOK.md](./AGENCY_PLAYBOOK.md) for full deliverable breakdown, 20-client math, and upsell stack.

## Quick start

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge\tools\seo-agent
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set OPENAI_API_KEY (or use project root .env.local)
python run.py test
python run.py seo "The Barber Lounge" --memory
```

Output is written to:

```
tools/seo-agent/output/the_barber_lounge_YYYY_MM_DD/
```

Run history is appended to:

```
tools/seo-agent/memory/runs.jsonl
```

## Master CLI (`run.py`)

Single entry point for the entire SEO brain:

| Command | What it does |
|---------|----------------|
| `python run.py test` | Smoke test all tools (imports, dry-runs, LLM test) |
| `python run.py full "The Barber Lounge"` | SEO 8-step + rank scan + publish check |
| `python run.py seo "The Barber Lounge"` | Content generation only |
| `python run.py seo "The Barber Lounge" --memory` | Content with prior run context |
| `python run.py rank` | Local rank scan (10 East Bay cities) |
| `python run.py rank --dry-run` | Rank scan without API calls |
| `python run.py memory` | Last 5 runs + suggestions for next run |
| `python run.py publish-check` | Diff SEO output vs `src/lib/blog-posts.ts` |
| `python run.py competitor-watch` | Top 3 Antioch barbershops via Serper |

## Commands reference

### `seo_agent.py` — monthly SEO content (8 steps)

| Command | What it does |
|---------|----------------|
| `python seo_agent.py --test` | Smoke test: one short LLM call (~5 s). Does **not** run the full pipeline. |
| `python seo_agent.py` | Full run for all clients in `CLIENTS` (The Barber Lounge). ~5–15 min. |
| `python seo_agent.py "The Barber Lounge"` | Full run for one client by name. |
| `python seo_agent.py "The Barber Lounge" --suffix v2` | Same, output folder gets `_v2` suffix. |
| `python seo_agent.py "The Barber Lounge" --memory` | Load prior run context; avoid duplicate topics. |
| `python seo_agent.py "The Barber Lounge" --resume` | Skip steps already saved in today's output folder. |

**Requires:** `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY` fallback).  
**Optional:** `SERPER_API_KEY` for live Google results in keyword + competitor steps.

### `publish_check.py` — verify blogs are on the site

| Command | What it does |
|---------|----------------|
| `python publish_check.py` | Compare latest output folder slugs vs `src/lib/blog-posts.ts` |
| `python run.py publish-check` | Same via master CLI |

Reports missing slugs, site-only posts, and title match status.

### `competitor_watch.py` — top Antioch barbershops

| Command | What it does |
|---------|----------------|
| `python competitor_watch.py` | Serper scrape top 3 competitors; save to `memory/` |
| `python competitor_watch.py --dry-run` | Placeholder snapshot without API |
| `python run.py competitor-watch` | Same via master CLI |

### Memory system

Each run appends to `memory/runs.jsonl`. Rank scans and competitor watches have their own JSONL files.

```powershell
python run.py memory          # view last 5 runs + next-run suggestions
```

When using `--memory`, the agent:
- Avoids blog topics from prior runs
- References rank-gap cities from prior scans
- Builds on keywords already targeted

See [BRAIN.md](./BRAIN.md) for architecture details.

### `local_rank_scan.py` — local visibility grid (~20 mi from Antioch)

Bird's-eye scan: searches `barbershop [city] CA` across 10 East Bay cities and reports where **The Barber Lounge** appears vs not visible.

| Command | What it does |
|---------|----------------|
| `python local_rank_scan.py` | Scan all cities via Serper (if key set) or manual Google links only. |
| `python local_rank_scan.py --dry-run` | Skip API calls; output city list + manual check URLs. |

**Output:** `tools/seo-agent/output/local_rank_scan_YYYY_MM_DD.md`  
**Requires for live ranks:** `SERPER_API_KEY` ([serper.dev](https://serper.dev/))  
**Without Serper:** script still writes the report with manual Google search links per city.

**Scan cities:** Antioch, Pittsburg, Brentwood, Oakley, Concord, Martinez, Bay Point, Discovery Bay, Pleasant Hill, Walnut Creek.

**Optional paid visual grid** (map heatmap overlay, like Local Falcon demos):  
[Local Falcon](https://www.localfalcon.com/) — also consider BrightLocal Local Rank Tracker and Semrush Local Grid.

## Requirements

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes* | OpenAI API for all content generation (primary) |
| `ANTHROPIC_API_KEY` | No | Claude fallback if OpenAI fails or is unset |
| `SERPER_API_KEY` | No | Live Google search results for competitor/keyword research |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` (use `gpt-4o` for higher quality) |
| `ANTHROPIC_MODEL` | No | Fallback model; defaults to `claude-sonnet-4-20250514` |

\*The agent reads `OPENAI_API_KEY` from `tools/seo-agent/.env` first, then falls back to the project root `.env.local`. At least one of `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` must be set.

## What you get (11 files)

| File | Description |
|------|-------------|
| `keyword_research.md` | Primary/secondary/long-tail keywords, clusters, quick wins |
| `blog_post_1.md` … `blog_post_4.md` | Full SEO articles (1,200–1,500 words each) |
| `gbp_posts.md` | 4 weeks of Google Business Profile posts |
| `meta_tags.md` | Title tags + meta descriptions for homepage, services, contact, blog posts |
| `schema_markup.json` | JSON-LD LocalBusiness schema ready to review |
| `onpage_audit.md` | Actionable on-page + GBP + citation checklist |
| `competitor_report.md` | Competitor gaps and 90-day outrank strategy |
| `client_report.md` | Client-facing monthly summary |

Typical run time: ~5–15 minutes depending on API latency.

## Client config

**The Barber Lounge** profile lives in two places (keep in sync):

- `clients/the_barber_lounge.json` — machine-readable config (future CLI: `python seo_agent.py --client clients/the_barber_lounge.json`)
- `seo_agent.py` → `CLIENTS` list — used by the agent today

Run by name:

```powershell
python seo_agent.py "The Barber Lounge"
```

Profile details:

- **Address:** 1518 A St, Antioch, CA 94509
- **Phone:** (925) 209-5995
- **Website:** https://the-barber-lounge.vercel.app
- **Hours:** Sun 8–7, Mon 10–7, Tue closed, Wed–Fri 9–7, Sat 8–7
- **Schema type:** `BarberShop` (matches site)

## Site integration checklist

After the agent runs, apply outputs to the Next.js site in this order:

### 1. Meta tags → page metadata

Copy title/description pairs from `meta_tags.md` into each page's `buildPageMetadata()` call:

| Page | File |
|------|------|
| Homepage | `src/app/layout.tsx` (root `metadata`) or `src/app/page.tsx` |
| Services | `src/app/services/page.tsx` |
| Contact | `src/app/contact/page.tsx` |
| About / FAQ / Testimonials | respective `page.tsx` files |
| Blog posts (future) | `src/app/blog/[slug]/page.tsx` when wired up |

### 2. Schema → layout JSON-LD

Compare `schema_markup.json` with the live schema in `src/lib/content.ts` (`LOCAL_BUSINESS_SCHEMA`) and `src/lib/seo.ts` (`buildLocalBusinessJsonLd()`).

**Already on the site:**

- `@type`: `BarberShop`
- `PostalAddress` (1518 A St, Antioch, CA 94509)
- `telephone`, `priceRange` (`$$`)
- `openingHoursSpecification` from `HOURS` constant
- `aggregateRating` (5.0, 180 reviews)
- `sameAs` (Instagram)
- `url` + `geo` (GeoCoordinates) via `buildLocalBusinessJsonLd()`

**Likely additions from agent output** (merge into `LOCAL_BUSINESS_SCHEMA` if useful):

- `hasOfferCatalog` with individual services (signature haircut, fade, beard trim, etc.)
- `areaServed` for East Contra Costa cities
- `image` / `logo` URL
- `email` (`thebarberlounge00@gmail.com`)

Do **not** replace real review counts with agent placeholders — keep live `SITE.rating` / `SITE.reviewCount`.

Schema is injected in `src/app/layout.tsx` via `<script type="application/ld+json">`.

### 3. Blog posts → `/blog` routes

A placeholder page exists at `/blog` (`src/app/blog/page.tsx`).

When ready to publish agent articles:

1. Convert each `blog_post_*.md` to a page or MDX route under `src/app/blog/`
2. Use the SLUG from each post for the URL (e.g. `/blog/best-fade-antioch-ca`)
3. Add routes to `src/app/sitemap.ts`
4. Link posts from homepage or footer for internal linking

### 4. GBP posts → manual publish

Copy weekly posts from `gbp_posts.md` into Google Business Profile (Booksy listing is separate).

### 5. On-page audit + competitor report

Use `onpage_audit.md` and `competitor_report.md` as your monthly task list — no code changes required unless the audit flags specific fixes.

### 6. Domain note

`src/lib/constants.ts` still has `SITE_URL = "https://thebarberlounge.com"` (production domain TODO). Canonical URLs and schema `url` use that constant — update when the custom domain goes live.

## Schema comparison summary

| Field | Site (`content.ts`) | Agent (`schema_markup.json`) |
|-------|---------------------|------------------------------|
| Type | `BarberShop` | `BarberShop` (configured) |
| Hours | Exact from `HOURS` | Same hours in client profile |
| Rating | Real (5.0 / 180) | Placeholder — keep site values |
| Services catalog | Not in schema | Agent may add `hasOfferCatalog` |
| Geo | In `seo.ts` | Agent may include coordinates |
| Social | Instagram in `sameAs` | Agent leaves blank for VA |

## Files in this folder

```
tools/seo-agent/
├── run.py                    # Master CLI orchestrator
├── seo_agent.py              # Main agent — keywords, blogs, GBP, audits (8 steps)
├── local_rank_scan.py        # Local rank grid scan (Serper or manual links)
├── publish_check.py          # Diff SEO output vs site blog-posts.ts
├── competitor_watch.py       # Top-3 competitor Serper scrape
├── memory_store.py           # Memory read/write API
├── memory/                   # Run history, rank scans, competitor snapshots
│   └── runs.jsonl            # (created on first run)
├── BRAIN.md                  # Ultimate Brain architecture vision
├── AGENCY_PLAYBOOK.md        # Business model + scaling playbook
├── PUBLISHING_CHECKLIST.md   # VA publish guide
├── CLIENT_ONBOARDING.md      # New client intake form
├── clients/
│   └── the_barber_lounge.json
├── requirements.txt
├── .env.example
├── README.md
└── output/                   # Generated reports (local only)
```
