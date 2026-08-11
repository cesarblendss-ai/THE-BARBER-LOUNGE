"""
LOCAL SEO AGENT
===============
Handles one client in a single run.
Give it the client info. It does everything.
You review. VA publishes.

WHAT IT PRODUCES (saved to output/CLIENT_NAME_DATE/):
  1. keyword_research.md     — target keywords + competitor gap
  2. blog_post_1.md          — full article, SEO optimized
  3. blog_post_2.md
  4. blog_post_3.md
  5. blog_post_4.md
  6. gbp_posts.md            — 4 weeks of Google Business Profile posts
  7. meta_tags.md            — title tags + meta descriptions for all posts
  8. schema_markup.json      — LocalBusiness schema ready to paste
  9. onpage_audit.md         — exactly what to fix on their site
 10. competitor_report.md    — what competitors are doing, gaps to exploit
 11. client_report.md        — the PDF-ready summary you send the client

SETUP:
    pip install -r requirements.txt
    Copy .env.example to .env and add OPENAI_API_KEY
    Optional: ANTHROPIC_API_KEY (fallback), SERPER_API_KEY (serper.dev)

USAGE:
    python seo_agent.py "The Barber Lounge"
    python seo_agent.py "The Barber Lounge" --memory   # use prior run context
    python seo_agent.py "The Barber Lounge" --resume   # skip completed steps
    python seo_agent.py --test   # smoke test (one short LLM call)

Or use the master CLI:
    python run.py seo "The Barber Lounge" --memory
    python run.py full "The Barber Lounge"
"""

import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

from dotenv import load_dotenv

from memory_store import (
    append_run,
    build_memory_context,
    detect_completed_steps,
    extract_slugs_from_output,
    extract_topics_from_output,
    format_memory_prompt,
)

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

load_dotenv(SCRIPT_DIR / ".env")
if not os.getenv("OPENAI_API_KEY"):
    load_dotenv(PROJECT_ROOT / ".env.local")

SERPER_KEY = os.getenv("SERPER_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

BARBERSHOP_FALLBACK_TOPICS = [
    "How to Choose the Best Barber in Antioch, CA",
    "Fade vs Taper: What's the Difference and Which Is Right for You",
    "Kids Haircuts in Antioch — What Parents Should Know",
    "Haircut and Beard Grooming Tips from The Barber Lounge",
]

_openai_client = None
_anthropic_client = None
_memory_context: dict | None = None


def _step_banner(step: int, total: int, label: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{ts}] STEP {step}/{total} — {label}")
    print("─" * 45)


def _step_done(label: str, elapsed: float) -> None:
    print(f"  ✓ {label} ({elapsed:.1f}s)")


def _has_openai_key() -> bool:
    return bool(os.getenv("OPENAI_API_KEY", "").strip())


def _has_anthropic_key() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY", "").strip())


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set.")
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client


def get_anthropic_client():
    global _anthropic_client
    if _anthropic_client is None:
        from anthropic import Anthropic

        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set.")
        _anthropic_client = Anthropic(api_key=api_key)
    return _anthropic_client


def _call_openai(system: str, prompt: str, max_tokens: int) -> str:
    r = get_openai_client().chat.completions.create(
        model=OPENAI_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    )
    return (r.choices[0].message.content or "").strip()


def _call_anthropic(system: str, prompt: str, max_tokens: int) -> str:
    r = get_anthropic_client().messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return r.content[0].text.strip()


# ── SEARCH (real data if you have Serper, simulated if not) ───────────────────


def search_web(query: str, num: int = 10) -> list:
    """
    Pulls real Google search results via Serper API.
    If no Serper key, returns empty list and the LLM reasons from training data.
    """
    if not SERPER_KEY:
        return []

    try:
        import requests

        r = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": num, "gl": "us"},
            timeout=8,
        )
        r.raise_for_status()
        results = r.json().get("organic", [])
        return [
            {
                "title": x.get("title", ""),
                "url": x.get("link", ""),
                "snippet": x.get("snippet", ""),
            }
            for x in results
        ]
    except Exception as e:
        print(f"  Search error: {e}")
        return []


# ── LLM CALL ──────────────────────────────────────────────────────────────────


def llm(system: str, prompt: str, max_tokens: int = 4000) -> str:
    """Single LLM call. OpenAI primary, Anthropic optional fallback."""
    if _has_openai_key():
        try:
            return _call_openai(system, prompt, max_tokens)
        except Exception as e:
            print(f"  OpenAI error: {e}")
            if _has_anthropic_key():
                print("  Falling back to Anthropic...")
                try:
                    return _call_anthropic(system, prompt, max_tokens)
                except Exception as e2:
                    print(f"  Anthropic error: {e2}")
                    return f"Error: {e2}"
            return f"Error: {e}"

    if _has_anthropic_key():
        try:
            return _call_anthropic(system, prompt, max_tokens)
        except Exception as e:
            print(f"  Anthropic error: {e}")
            return f"Error: {e}"

    raise RuntimeError(
        "No LLM API key set. Add OPENAI_API_KEY to .env (or project .env.local)."
    )


def active_llm_provider() -> str:
    if _has_openai_key():
        return f"openai ({OPENAI_MODEL})"
    if _has_anthropic_key():
        return f"anthropic ({ANTHROPIC_MODEL})"
    return "none"


# ── SYSTEM PROMPT — the persona ───────────────────────────────────────────────

SEO_SYSTEM = """You are an elite local SEO strategist with 10 years experience
ranking local businesses in competitive markets. You know exactly what Google
wants for local search in 2024-2025: E-E-A-T, local intent, topical authority,
schema markup, and Google Business Profile optimization.

You write content that:
- Ranks for local intent keywords (city + service)
- Answers the exact questions people search before hiring
- Builds topical authority through interconnected content
- Includes natural keyword placement without stuffing
- Has proper H1/H2/H3 structure
- Converts readers into leads

You are direct, specific, and practical. No fluff. Every recommendation
must be actionable. Every piece of content must serve a ranking purpose."""


# ── CLIENT LOADING ────────────────────────────────────────────────────────────


def load_client_from_json(name: str) -> dict | None:
    """Load client profile from clients/*.json if present."""
    clients_dir = SCRIPT_DIR / "clients"
    if not clients_dir.is_dir():
        return None
    target = name.lower().strip()
    for path in sorted(clients_dir.glob("*.json")):
        if path.name.startswith("_"):
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if target in data.get("name", "").lower():
            return data
    return None


def discover_clients() -> list[dict]:
    """Load all client profiles from clients/*.json (skips _template.json)."""
    clients_dir = SCRIPT_DIR / "clients"
    found: list[dict] = []
    if not clients_dir.is_dir():
        return list(CLIENTS)
    for path in sorted(clients_dir.glob("*.json")):
        if path.name.startswith("_"):
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if data.get("name"):
            found.append(data)
    return found if found else list(CLIENTS)


def merge_client(base: dict, override: dict | None) -> dict:
    if not override:
        return base
    merged = {**base, **override}
    for key in ("services", "competitors"):
        if key in override and override[key]:
            merged[key] = override[key]
    return merged


def _parse_json_string_array(text: str) -> list[str]:
    try:
        start = text.find("[")
        end = text.rfind("]") + 1
        if start < 0 or end <= start:
            return []
        arr = json.loads(text[start:end])
        if not isinstance(arr, list):
            return []
        return [str(x).strip() for x in arr if str(x).strip()]
    except (json.JSONDecodeError, TypeError, ValueError):
        return []


def _is_garbage_topic(topic: str) -> bool:
    """Reject markdown table rows and cluster headings mistaken as titles."""
    if not topic or len(topic) < 10:
        return True
    if "|" in topic:
        return True
    lower = topic.lower()
    if lower.startswith("cluster"):
        return True
    if "content type" in lower or "informational|" in lower:
        return True
    return False


def extract_blog_topics(biz: dict, keywords_text: str) -> list[str]:
    """Ask LLM for 4 clean blog titles; fall back to niche defaults."""
    print("  -> Extracting blog post topics...")

    memory_block = ""
    if _memory_context:
        memory_block = format_memory_prompt(_memory_context) + "\n\n"

    prompt = f"""
{memory_block}Based on this keyword research for {biz['name']} ({biz['niche']} in {biz['city']}, {biz['state']}):

{keywords_text[:4000]}

Return exactly 4 publish-ready blog post titles as a JSON array of strings.
Each title must be a clean headline — no markdown, no pipes, no table columns, no intent labels.
Focus on local SEO for {biz['city']} and services: {', '.join(biz.get('services', [biz['niche']]))}.
Do NOT repeat topics listed in prior run memory above.

Return ONLY a JSON array, for example:
["Title One", "Title Two", "Title Three", "Title Four"]
"""
    result = llm(SEO_SYSTEM, prompt, max_tokens=500)
    topics = [t for t in _parse_json_string_array(result) if not _is_garbage_topic(t)]

    if len(topics) >= 4:
        return topics[:4]

    print("  -> Topic extraction fallback (LLM returned invalid titles)")
    if biz.get("niche") == "barbershop":
        return BARBERSHOP_FALLBACK_TOPICS.copy()

    return [
        f"How to Choose the Best {biz['niche'].title()} in {biz['city']}, {biz['state']}",
        f"{biz['niche'].title()} Services in {biz['city']}: What to Expect and What It Costs",
        f"Top Signs You Need a {biz['niche'].title()} Right Now",
        f"Why Local {biz['city']} Residents Choose {biz['name']}",
    ]


def keyword_sets_for_biz(biz: dict) -> list[list[str]]:
    city = biz["city"]
    niche = biz["niche"]
    if niche == "barbershop":
        return [
            [f"best barber {city}", f"barbershop {city}", f"choose a barber {city}"],
            [f"fade vs taper {city}", f"fade haircut {city}", f"taper haircut {city}"],
            [f"kids haircut {city}", f"children haircut {city}", f"barbershop {city}"],
            [
                f"beard trim {city}",
                f"haircut and beard {city}",
                f"grooming tips {city}",
            ],
        ]
    return [
        [f"{niche} {city}", f"best {niche} {city}", f"{niche} near me"],
        [f"{niche} services {city}", f"{niche} cost {city}", f"affordable {niche}"],
        [f"{niche} tips {city}", f"{niche} guide", f"local {niche} {city}"],
        [f"{city} {niche} reviews", f"local {niche} {city}", f"{niche} company {city}"],
    ]


# ── STEP 1: KEYWORD RESEARCH ──────────────────────────────────────────────────


def research_keywords(biz: dict) -> str:
    print("  -> Researching keywords...")

    memory_block = ""
    if _memory_context:
        memory_block = format_memory_prompt(_memory_context) + "\n\n"

    search_results = []
    if SERPER_KEY:
        q1 = f"best {biz['niche']} in {biz['city']} {biz['state']}"
        q2 = f"{biz['niche']} near me {biz['city']}"
        search_results = search_web(q1, 10) + search_web(q2, 5)

    competitors_txt = ""
    if biz.get("competitors"):
        competitors_txt = f"\nKnown competitors: {', '.join(biz['competitors'])}"

    search_txt = ""
    if search_results:
        search_txt = "\nTop Google results right now:\n"
        for r in search_results[:8]:
            search_txt += f"- {r['title']} | {r['url']}\n  {r['snippet']}\n"

    business_txt = f"""
BUSINESS DETAILS (use these for accurate, local recommendations):
- Website: {biz.get('website', 'N/A')}
- Address: {biz.get('address', 'N/A')}
- Phone: {biz.get('phone', 'N/A')}
- Booking URL: {biz.get('booking_url', 'N/A')}
- Hours: {biz.get('hours', 'N/A')}
- Price range: {biz.get('price_range', 'N/A')}
- Instagram: {biz.get('instagram', 'N/A')}
"""

    prompt = f"""
{memory_block}CLIENT: {biz['name']}
NICHE: {biz['niche']}
LOCATION: {biz['city']}, {biz['state']}
SERVICE AREA: {biz.get('service_area', biz['city'] + ' and surrounding areas')}
SERVICES: {', '.join(biz.get('services', [biz['niche']]))}
{business_txt}
{competitors_txt}
{search_txt}

Produce a complete keyword research document with these sections:

## PRIMARY KEYWORDS (10 keywords)
The money keywords — high local intent, people ready to hire.
Format: | Keyword | Est. Monthly Searches | Competition | Priority |

## SECONDARY KEYWORDS (15 keywords)
Supporting keywords — informational, build topical authority.
Format: | Keyword | Intent | Content Type |

## LONG-TAIL KEYWORDS (20 keywords)
Question-based, low competition, easy wins.
Format: | Keyword | Search Intent |

## COMPETITOR GAP ANALYSIS
Based on the top competitors, what keywords are they ranking for
that this client is NOT? What's the fastest path to page 1?

## CONTENT CLUSTERS
Group the keywords into 4 topic clusters for this month's blog posts.
Each cluster = one blog post topic.

## QUICK WINS
3 keywords this client could rank for within 30 days with minimal effort.
Explain exactly why.

Be specific. Use real keyword variations people actually search in {biz['city']}.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=3000)


# ── STEP 2: BLOG POST ─────────────────────────────────────────────────────────


def write_blog_post(biz: dict, topic: str, keywords: list, post_num: int) -> str:
    print(f"  -> Writing blog post {post_num}: {topic[:50]}...")

    prompt = f"""
CLIENT: {biz['name']} — {biz['niche']} in {biz['city']}, {biz['state']}
POST TOPIC: {topic}
PRIMARY KEYWORD: {keywords[0] if keywords else topic}
SECONDARY KEYWORDS: {', '.join(keywords[1:4]) if len(keywords) > 1 else ''}
TARGET WORD COUNT: 1,200-1,500 words
TONE: Professional but approachable. Like a trusted local expert, not a corporation.

Write a complete, publish-ready SEO blog post with this structure:

---
TITLE: [SEO-optimized title with primary keyword]
META DESCRIPTION: [155 characters max, includes keyword, compelling CTA]
SLUG: [url-friendly slug]
---

[Full article content with proper H1, H2, H3 structure]

Requirements:
- H1 contains primary keyword naturally
- First paragraph mentions {biz['city']} and the service within first 100 words
- Include 3-4 H2 sections answering real questions people ask before hiring
- Natural keyword placement — primary keyword 4-6 times, secondary 2-3 times each
- Include one section specifically about WHY to choose a local {biz['city']} {biz['niche']} vs national chains
- End with a clear CTA: call {biz['name']} at {biz.get('phone', '[PHONE]')} or visit {biz.get('website', '[WEBSITE]')}
- Include an FAQ section at the end (3 questions, schema-ready)
- Internal linking suggestions: [suggest 2 other blog posts this should link to]

The article should genuinely help someone who just searched this keyword.
Google can tell the difference.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=4000)


# ── STEP 3: GOOGLE BUSINESS PROFILE POSTS ────────────────────────────────────


def write_gbp_posts(biz: dict) -> str:
    print("  -> Writing GBP posts...")

    prompt = f"""
CLIENT: {biz['name']}
NICHE: {biz['niche']}
CITY: {biz['city']}, {biz['state']}
PHONE: {biz.get('phone', '[PHONE]')}
WEBSITE: {biz.get('website', '[WEBSITE]')}
SERVICES: {', '.join(biz.get('services', [biz['niche']]))}

Write 4 weeks of Google Business Profile posts (one per week).

GBP POST RULES:
- 150-300 words each
- Include a call-to-action button type: CALL, BOOK, LEARN MORE, or OFFER
- Natural keyword inclusion (city + service)
- Feels like a real local business, not a robot
- Mix of post types: tip, promotion, behind-the-scenes, testimonial highlight

Format each post:

---
WEEK [N] — [POST TYPE]
CTA BUTTON: [type]
---
[Post content]
---

Week 1: Educational tip (builds trust)
Week 2: Service spotlight (drives calls)
Week 3: Local angle (builds community connection)
Week 4: Social proof / results (converts fence-sitters)
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=2000)


# ── STEP 4: META TAGS ─────────────────────────────────────────────────────────


def write_meta_tags(biz: dict, post_topics: list) -> str:
    print("  -> Writing meta tags...")

    topics_txt = "\n".join([f"{i + 1}. {t}" for i, t in enumerate(post_topics)])

    prompt = f"""
CLIENT: {biz['name']} — {biz['niche']} in {biz['city']}, {biz['state']}
WEBSITE: {biz.get('website', '[WEBSITE]')}

Write SEO meta tags for:

1. HOMEPAGE
2. SERVICES PAGE
3. CONTACT/QUOTE PAGE
4-7. Each of these blog posts:
{topics_txt}

For each page provide:
- Title Tag (50-60 characters, includes primary keyword + location)
- Meta Description (145-155 characters, compelling, includes keyword + CTA)
- H1 Suggestion
- Primary Keyword Target

Format as a clean table for easy copy-paste into WordPress/Webflow.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=2000)


# ── STEP 5: SCHEMA MARKUP ─────────────────────────────────────────────────────


def generate_schema(biz: dict) -> str:
    print("  -> Generating schema markup...")

    prompt = f"""
Generate complete JSON-LD schema markup for this local business.
Return ONLY valid JSON — no explanation, no markdown fences.

Business details:
- Name: {biz['name']}
- Type: {biz.get('schema_type', 'LocalBusiness')}
- Niche: {biz['niche']}
- City: {biz['city']}
- State: {biz['state']}
- Phone: {biz.get('phone', '')}
- Website: {biz.get('website', '')}
- Address: {biz.get('address', '')}
- Services: {', '.join(biz.get('services', [biz['niche']]))}
- Hours: {biz.get('hours', 'Mon-Fri 8am-6pm')}
- Price Range: {biz.get('price_range', '$$')}

Include:
- LocalBusiness (or specific type if applicable: Plumber, Dentist, Restaurant, etc)
- Address (PostalAddress)
- GeoCoordinates if possible
- OpeningHoursSpecification
- hasOfferCatalog with services
- aggregateRating placeholder (4.9 stars, to be updated)
- sameAs array (leave blank — VA fills in social links)
"""
    result = llm(SEO_SYSTEM, prompt, max_tokens=2000)
    try:
        start = result.find("{")
        end = result.rfind("}") + 1
        if start >= 0:
            json.loads(result[start:end])
            return result[start:end]
    except Exception:
        pass
    return result


# ── STEP 6: ON-PAGE AUDIT ─────────────────────────────────────────────────────


def write_onpage_audit(biz: dict) -> str:
    print("  -> Writing on-page audit...")

    prompt = f"""
Create a practical on-page SEO audit checklist for:
{biz['name']} — {biz['niche']} in {biz['city']}, {biz['state']}
Current website: {biz.get('website', 'Not yet built')}

This is for a VA to execute, so make every item specific and actionable.

## CRITICAL (fix within 48 hours)
Issues that are actively hurting rankings right now.
Each item: What to check | What good looks like | How to fix it

## HIGH PRIORITY (fix this week)
Major ranking factors not in critical range.

## MEDIUM PRIORITY (fix this month)
Content and optimization improvements.

## QUICK WINS (takes < 30 min each)
Easy fixes with high ranking impact.

## GOOGLE BUSINESS PROFILE CHECKLIST
Everything that needs to be set up or optimized on GBP:
- Categories (primary + secondary)
- Services section
- Photos (types and quantity)
- Posts frequency
- Review response strategy
- Q&A section

## LOCAL CITATION CHECKLIST
Top 15 directories this business needs to be listed on.
Priority order. Include the URL for each.

Be specific to {biz['niche']} businesses in {biz['city']}.
A plumber's audit looks different from a dentist's.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=3000)


# ── STEP 7: COMPETITOR REPORT ─────────────────────────────────────────────────


def write_competitor_report(biz: dict) -> str:
    print("  -> Writing competitor report...")

    competitors = biz.get("competitors", [])
    comp_txt = (
        ", ".join(competitors)
        if competitors
        else f"top {biz['niche']} businesses in {biz['city']}"
    )

    search_data = ""
    if SERPER_KEY and competitors:
        for comp in competitors[:3]:
            results = search_web(
                f"{comp} {biz['city']} reviews site:google.com OR site:yelp.com", 3
            )
            if results:
                search_data += f"\n{comp}:\n"
                for r in results:
                    search_data += f"  - {r['title']}: {r['snippet']}\n"

    prompt = f"""
Competitor analysis for:
CLIENT: {biz['name']} — {biz['niche']} in {biz['city']}, {biz['state']}
COMPETITORS TO ANALYZE: {comp_txt}
{search_data}

## COMPETITOR OVERVIEW
For each competitor, analyze:
- Their strongest keywords (what they're likely ranking for)
- Content strategy (how much content, what topics)
- GBP strength (reviews, posts, photos)
- Weaknesses we can exploit

## CONTENT GAPS
Topics competitors are NOT covering that represent opportunities.
These are the easiest wins — write better content on topics they ignore.

## BACKLINK OPPORTUNITIES
Types of local backlinks this niche typically gets.
Specific directories, associations, local publications for {biz['city']}.

## THE FASTEST PATH TO OUTRANK THEM
Based on what you see, what is the single most effective 90-day strategy
to outrank the #1 competitor for the primary money keyword?
Be specific. No generic advice.

## WHAT TO TELL THE CLIENT
A 3-paragraph non-technical summary they can actually understand.
What their competitors are doing, why it's working, and how we beat it.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=3000)


# ── STEP 8: CLIENT REPORT ─────────────────────────────────────────────────────


def write_client_report(biz: dict, keywords_summary: str) -> str:
    print("  -> Writing client report...")

    prompt = f"""
Write a professional client-facing SEO report for:
{biz['name']} — {biz['niche']} in {biz['city']}, {biz['state']}

This is what you send the client each month. It should:
- Look professional (they're paying $800-1500/mo for this)
- Be easy to understand — no jargon
- Show clear value and progress
- Build confidence that the strategy is working

## EXECUTIVE SUMMARY
3 sentences. What we did this month, what it means for their business.

## THIS MONTH'S DELIVERABLES
Checklist of everything completed this month.

## KEYWORD STRATEGY
Which keywords we're targeting and why. Written for a business owner,
not an SEO nerd. Focus on: "these are the searches your customers make
right before calling someone."

## CONTENT PUBLISHED
Summary of the 4 blog posts with their target keywords and what
questions they answer for potential customers.

## GOOGLE BUSINESS PROFILE
What was done this month on GBP and why it matters.

## WHAT TO EXPECT
Timeline: realistic expectations for when they'll see results.
Month 1: Foundation
Month 2-3: Crawling and indexing
Month 3-6: Rankings moving
Month 6+: Leads coming in

## NEXT MONTH PLAN
What we're working on next month and why.

Tone: confident expert, not salesy. Like a trusted advisor, not a vendor.
"""
    return llm(SEO_SYSTEM, prompt, max_tokens=2500)


# ── MAIN AGENT ────────────────────────────────────────────────────────────────


def run_seo_agent(
    biz: dict,
    output_suffix: str = "",
    use_memory: bool = False,
    resume: bool = False,
) -> str:
    """
    Full SEO production run for one client.
    Saves everything to tools/seo-agent/output/CLIENT_SLUG_DATE/
    Optional output_suffix appends _v2 etc. to the folder name.
    """
    global _memory_context
    start_time = time.time()

    if use_memory:
        _memory_context = build_memory_context()
        print(f"  Memory: { _memory_context['prior_runs_count']} prior runs loaded")
        if _memory_context["used_topics"]:
            print(f"  Avoiding {len(_memory_context['used_topics'])} prior topics")
    else:
        _memory_context = None

    slug = re.sub(r"[^a-z0-9]", "_", biz["name"].lower()).strip("_")
    date = datetime.now().strftime("%Y_%m_%d")
    folder = f"{slug}_{date}{('_' + output_suffix) if output_suffix else ''}"
    out = SCRIPT_DIR / "output" / folder
    out.mkdir(parents=True, exist_ok=True)

    completed = set(detect_completed_steps(out)) if resume else set()
    if resume and completed:
        print(f"  Resume: skipping {len(completed)} completed step(s)")

    print(f"\n{'=' * 55}")
    print(f"  SEO AGENT — {biz['name']}")
    print(f"  {biz['niche']} | {biz['city']}, {biz['state']}")
    print(f"  LLM: {active_llm_provider()}")
    if use_memory:
        print("  Memory: enabled")
    if resume:
        print("  Resume: enabled")
    if not SERPER_KEY:
        print("  No live Google data — add SERPER_API_KEY for competitor search")
    else:
        print("  Serper: live Google search enabled")
    print(f"  Output: {out}/")
    print(f"{'=' * 55}\n")

    TOTAL = 8
    keywords = ""
    post_topics: list[str] = []

    # Step 1
    if "keyword_research" in completed:
        keywords = (out / "keyword_research.md").read_text(encoding="utf-8")
        keywords = re.sub(r"^# Keyword Research.*?\n\n", "", keywords, count=1)
        print("  (skipped) keyword_research.md exists")
    else:
        t0 = time.time()
        _step_banner(1, TOTAL, "Keyword Research")
        keywords = research_keywords(biz)
        (out / "keyword_research.md").write_text(
            f"# Keyword Research — {biz['name']}\n\n{keywords}", encoding="utf-8"
        )
        _step_done("keyword_research.md", time.time() - t0)

    post_topics = extract_topics_from_output(out)
    if len(post_topics) < 4:
        post_topics = extract_blog_topics(biz, keywords)
    keyword_sets = keyword_sets_for_biz(biz)

    # Step 2
    _step_banner(2, TOTAL, "Blog Posts")
    for i in range(4):
        fname = f"blog_post_{i + 1}"
        fpath = out / f"{fname}.md"
        if fname in completed:
            print(f"  (skipped) {fname}.md exists")
            continue
        topic = post_topics[i] if i < len(post_topics) else f"{biz['niche']} guide {i + 1}"
        kws = keyword_sets[i] if i < len(keyword_sets) else []
        t0 = time.time()
        post = write_blog_post(biz, topic, kws, i + 1)
        fpath.write_text(f"# Blog Post {i + 1}\nTopic: {topic}\n\n{post}", encoding="utf-8")
        _step_done(f"{fname}.md", time.time() - t0)
        time.sleep(1)

    post_topics = extract_topics_from_output(out) or post_topics

    # Step 3
    if "gbp_posts" in completed:
        print("  (skipped) gbp_posts.md exists")
    else:
        t0 = time.time()
        _step_banner(3, TOTAL, "Google Business Profile Posts")
        gbp = write_gbp_posts(biz)
        (out / "gbp_posts.md").write_text(
            f"# GBP Posts — {biz['name']}\n\n{gbp}", encoding="utf-8"
        )
        _step_done("gbp_posts.md", time.time() - t0)

    # Step 4
    if "meta_tags" in completed:
        print("  (skipped) meta_tags.md exists")
    else:
        t0 = time.time()
        _step_banner(4, TOTAL, "Meta Tags")
        meta = write_meta_tags(biz, post_topics[:4])
        (out / "meta_tags.md").write_text(
            f"# Meta Tags — {biz['name']}\n\n{meta}", encoding="utf-8"
        )
        _step_done("meta_tags.md", time.time() - t0)

    # Step 5
    if "schema_markup" in completed:
        print("  (skipped) schema_markup.json exists")
    else:
        t0 = time.time()
        _step_banner(5, TOTAL, "Schema Markup")
        schema = generate_schema(biz)
        (out / "schema_markup.json").write_text(schema, encoding="utf-8")
        _step_done("schema_markup.json", time.time() - t0)

    # Step 6
    if "onpage_audit" in completed:
        print("  (skipped) onpage_audit.md exists")
    else:
        t0 = time.time()
        _step_banner(6, TOTAL, "On-Page Audit")
        audit = write_onpage_audit(biz)
        (out / "onpage_audit.md").write_text(
            f"# On-Page SEO Audit — {biz['name']}\n\n{audit}", encoding="utf-8"
        )
        _step_done("onpage_audit.md", time.time() - t0)

    # Step 7
    if "competitor_report" in completed:
        print("  (skipped) competitor_report.md exists")
    else:
        t0 = time.time()
        _step_banner(7, TOTAL, "Competitor Analysis")
        competitors = write_competitor_report(biz)
        (out / "competitor_report.md").write_text(
            f"# Competitor Analysis — {biz['name']}\n\n{competitors}", encoding="utf-8"
        )
        _step_done("competitor_report.md", time.time() - t0)

    # Step 8
    if "client_report" in completed:
        print("  (skipped) client_report.md exists")
    else:
        t0 = time.time()
        _step_banner(8, TOTAL, "Client Report")
        report = write_client_report(biz, keywords[:500])
        (out / "client_report.md").write_text(
            f"# Monthly SEO Report — {biz['name']}\n\n{report}", encoding="utf-8"
        )
        _step_done("client_report.md", time.time() - t0)

    elapsed = round(time.time() - start_time)
    mins = elapsed // 60
    secs = elapsed % 60
    blog_slugs = extract_slugs_from_output(out)
    blog_topics = extract_topics_from_output(out)

    append_run(
        client=biz["name"],
        command="seo",
        output_dir=str(out),
        deliverables=[f.replace(".md", "").replace(".json", "") for f in [
            "keyword_research.md", "blog_post_1.md", "blog_post_2.md",
            "blog_post_3.md", "blog_post_4.md", "gbp_posts.md", "meta_tags.md",
            "schema_markup.json", "onpage_audit.md", "competitor_report.md",
            "client_report.md",
        ]],
        blog_topics=blog_topics,
        blog_slugs=blog_slugs,
        notes=f"memory={'on' if use_memory else 'off'} resume={'on' if resume else 'off'}",
        duration_seconds=elapsed,
        steps_completed=detect_completed_steps(out),
    )

    print(f"\n{'=' * 55}")
    print(f"  DONE — {mins}m {secs}s")
    print(f"\n  FILES SAVED TO: {out}/")
    print("  |-- keyword_research.md")
    print("  |-- blog_post_1.md ... blog_post_4.md")
    print("  |-- gbp_posts.md")
    print("  |-- meta_tags.md")
    print("  |-- schema_markup.json")
    print("  |-- onpage_audit.md")
    print("  |-- competitor_report.md")
    print("  `-- client_report.md")
    print(f"  Memory: run appended to memory/runs.jsonl")
    print(f"{'=' * 55}\n")

    return str(out)


def run_smoke_test() -> bool:
    """One short LLM call to verify API wiring."""
    print(f"Smoke test — provider: {active_llm_provider()}")
    biz = CLIENTS[0]
    prompt = (
        f"Write ONLY the opening paragraph (3-4 sentences) for a keyword research "
        f"document for {biz['name']}, a {biz['niche']} in {biz['city']}, {biz['state']}. "
        f"Mention local search intent. No headings, no lists."
    )
    result = llm(SEO_SYSTEM, prompt, max_tokens=200)
    if result.startswith("Error:"):
        print(f"FAIL: {result}")
        return False
    print(f"OK ({len(result)} chars): {result[:200]}{'...' if len(result) > 200 else ''}")
    return True


# ── CLIENT PROFILES ───────────────────────────────────────────────────────────

CLIENTS = [
    {
        "name": "The Barber Lounge",
        "niche": "barbershop",
        "schema_type": "BarberShop",
        "city": "Antioch",
        "state": "CA",
        "service_area": "Antioch, Brentwood, Pittsburg, Oakley, Bay Area East Contra Costa",
        "services": [
            "signature haircut",
            "haircut and beard",
            "kids haircut",
            "fade",
            "line up",
            "beard trim",
        ],
        "competitors": [
            "Fades & Blades Antioch",
            "Executive Cuts Antioch",
            "Local barbershops on Booksy",
        ],
        "phone": "(925) 209-5995",
        "website": "https://the-barber-lounge.vercel.app",
        "address": "1518 A St, Antioch, CA 94509",
        "hours": (
            "Sun 8:00 AM–7:00 PM, Mon 10:00 AM–7:00 PM, Tue Closed, "
            "Wed 9:00 AM–7:00 PM, Thu 9:00 AM–7:00 PM, "
            "Fri 9:00 AM–7:00 PM, Sat 8:00 AM–7:00 PM"
        ),
        "price_range": "$$",
    },
]


# ── RUN ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not _has_openai_key() and not _has_anthropic_key():
        print("ERROR: No LLM API key set.")
        print("Add OPENAI_API_KEY to tools/seo-agent/.env (or project .env.local).")
        sys.exit(1)

    use_memory = "--memory" in sys.argv or "-m" in sys.argv
    resume = "--resume" in sys.argv or "-r" in sys.argv
    skip_flags = ("--test", "-t", "--memory", "-m", "--resume", "-r")
    args = [a for a in sys.argv[1:] if a not in skip_flags]
    output_suffix = ""
    if "--suffix" in args:
        idx = args.index("--suffix")
        if idx + 1 < len(args):
            output_suffix = args[idx + 1].strip("_")
            args = args[:idx] + args[idx + 2 :]

    if len(sys.argv) > 1 and sys.argv[1] in ("--test", "-t"):
        ok = run_smoke_test()
        sys.exit(0 if ok else 1)

    if args:
        target = args[0].lower()
        clients_to_run = [c for c in discover_clients() if target in c["name"].lower()]
        if not clients_to_run:
            print(f"Client '{args[0]}' not found. Available:")
            for c in discover_clients():
                print(f"  - {c['name']}")
            sys.exit(1)
    else:
        clients_to_run = discover_clients()

    print(f"\nRunning SEO agent for {len(clients_to_run)} client(s)...")
    print(f"LLM provider: {active_llm_provider()}\n")
    if not SERPER_KEY:
        print("No live Google data — add SERPER_API_KEY for competitor search\n")

    for biz in clients_to_run:
        json_client = load_client_from_json(biz["name"])
        biz = merge_client(biz, json_client)
        if json_client:
            print(f"Loaded client profile from clients/*.json for {biz['name']}")
        run_seo_agent(
            biz,
            output_suffix=output_suffix,
            use_memory=use_memory,
            resume=resume,
        )
        if len(clients_to_run) > 1:
            print("Waiting 10s before next client...")
            time.sleep(10)

    print("\nAll clients done. Check tools/seo-agent/output/.")
