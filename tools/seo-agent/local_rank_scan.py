"""
LOCAL RANK SCAN — The Barber Lounge
====================================
Bird's-eye view of "barbershop" visibility across East Bay cities (~20 mi from Antioch).

Uses Serper (google.serper.dev) when SERPER_API_KEY is set; otherwise prints setup
instructions and writes manual Google search links.

USAGE:
    cd tools/seo-agent
    python local_rank_scan.py
    python local_rank_scan.py --dry-run   # no API calls, manual links only
"""

from __future__ import annotations

import os
import re
import sys
import time
import urllib.parse
from dataclasses import dataclass, field
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

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

load_dotenv(SCRIPT_DIR / ".env")
if not os.getenv("SERPER_API_KEY"):
    load_dotenv(PROJECT_ROOT / ".env.local")

SERPER_KEY = os.getenv("SERPER_API_KEY", "").strip()

# Center: Antioch, CA — ~20 mile radius East Bay scan points
CENTER = {"city": "Antioch", "state": "CA", "lat": 37.9959, "lng": -121.8058}

SCAN_LOCATIONS = [
    {"city": "Antioch", "state": "CA", "lat": 37.9959, "lng": -121.8058},
    {"city": "Pittsburg", "state": "CA", "lat": 38.0280, "lng": -121.8847},
    {"city": "Brentwood", "state": "CA", "lat": 37.9319, "lng": -121.6958},
    {"city": "Oakley", "state": "CA", "lat": 37.9974, "lng": -121.7125},
    {"city": "Concord", "state": "CA", "lat": 37.9780, "lng": -122.0311},
    {"city": "Martinez", "state": "CA", "lat": 38.0194, "lng": -122.1341},
    {"city": "Bay Point", "state": "CA", "lat": 38.0291, "lng": -121.9616},
    {"city": "Discovery Bay", "state": "CA", "lat": 37.9085, "lng": -121.6002},
    {"city": "Pleasant Hill", "state": "CA", "lat": 37.9480, "lng": -122.0609},
    {"city": "Walnut Creek", "state": "CA", "lat": 37.9101, "lng": -122.0652},
    {"city": "Clayton", "state": "CA", "lat": 37.9410, "lng": -121.9358},
    {"city": "Danville", "state": "CA", "lat": 37.8216, "lng": -122.0000},
    {"city": "San Ramon", "state": "CA", "lat": 37.7799, "lng": -121.9780},
    {"city": "Lafayette", "state": "CA", "lat": 37.8858, "lng": -122.1180},
    {"city": "Hercules", "state": "CA", "lat": 38.0171, "lng": -122.2886},
    {"city": "Livermore", "state": "CA", "lat": 37.6819, "lng": -121.7680},
]

BUSINESS_NAME = "The Barber Lounge"
BUSINESS_CITY = "Antioch"

# Domains / patterns that indicate our listing
MATCH_PATTERNS = [
    r"thebarberlounge\.com",
    r"the-barber-lounge\.vercel\.app",
    r"the-barber-lounge-antioch\.vercel\.app",
    r"booksy\.com/.+the-barber-lounge",
    r"booksy\.com/en-us/\d+_the-barber-lounge",
    r"google\.com/maps/.+barber.?lounge",
    r"google\.com/maps/place/.+1518",
]

MATCH_TEXT = [
    "the barber lounge",
    "barber lounge antioch",
]


@dataclass
class SearchHit:
    rank: int
    title: str
    url: str
    source: str  # organic | places | knowledgeGraph


@dataclass
class CityResult:
    city: str
    state: str
    query: str
    barber_lounge_rank: int | None = None
    barber_lounge_found: bool = False
    match_detail: str = ""
    top_competitors: list[str] = field(default_factory=list)
    manual_url: str = ""
    all_hits: list[SearchHit] = field(default_factory=list)
    error: str = ""


def _location_string(loc: dict) -> str:
    return f"{loc['city']}, {loc['state']}, United States"


def _build_query(city: str, state: str) -> str:
    if city.lower() == BUSINESS_CITY.lower():
        return f"barbershop {city} {state}"
    return f"barbershop near {city} {state}"


def _manual_google_url(query: str) -> str:
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"


def _matches_barber_lounge(title: str, url: str, snippet: str = "") -> bool:
    blob = f"{title} {url} {snippet}".lower()
    for pat in MATCH_PATTERNS:
        if re.search(pat, blob, re.I):
            return True
    for text in MATCH_TEXT:
        if text in blob:
            return True
    return False


def _extract_title(hit: dict, fallback: str = "") -> str:
    return (hit.get("title") or hit.get("name") or fallback).strip()


def _extract_url(hit: dict) -> str:
    return (hit.get("link") or hit.get("website") or hit.get("url") or "").strip()


def _competitor_label(hit: SearchHit) -> str:
    title = hit.title[:60] + ("…" if len(hit.title) > 60 else "")
    return title or hit.url[:50]


def serper_search(query: str, location: str, num: int = 10) -> dict:
    import requests

    r = requests.post(
        "https://google.serper.dev/search",
        headers={"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"},
        json={
            "q": query,
            "num": num,
            "gl": "us",
            "hl": "en",
            "location": location,
        },
        timeout=15,
    )
    r.raise_for_status()
    return r.json()


def parse_serper_response(data: dict, query: str) -> CityResult:
    """Merge organic + places/local pack into one ranked list for visibility."""
    hits: list[SearchHit] = []
    rank = 0

    for section, key in (("places", "places"), ("local", "localResults")):
        for item in data.get(key) or []:
            rank += 1
            hits.append(
                SearchHit(
                    rank=rank,
                    title=_extract_title(item),
                    url=_extract_url(item),
                    source=section,
                )
            )

    for item in data.get("organic") or []:
        rank += 1
        hits.append(
            SearchHit(
                rank=rank,
                title=_extract_title(item),
                url=_extract_url(item),
                source="organic",
            )
        )

    bl_rank: int | None = None
    match_detail = ""
    for hit in hits:
        snippet = ""
        if _matches_barber_lounge(hit.title, hit.url, snippet):
            bl_rank = hit.rank
            match_detail = f"{hit.source}: {hit.title}"
            break

    competitors: list[str] = []
    for hit in hits:
        if _matches_barber_lounge(hit.title, hit.url):
            continue
        label = _competitor_label(hit)
        if label and label not in competitors:
            competitors.append(label)
        if len(competitors) >= 3:
            break

    return CityResult(
        city="",
        state="",
        query=query,
        barber_lounge_rank=bl_rank,
        barber_lounge_found=bl_rank is not None,
        match_detail=match_detail,
        top_competitors=competitors,
        all_hits=hits[:15],
    )


def scan_city(loc: dict, dry_run: bool = False) -> CityResult:
    city, state = loc["city"], loc["state"]
    query = _build_query(city, state)
    manual_url = _manual_google_url(query)
    result = CityResult(city=city, state=state, query=query, manual_url=manual_url)

    if dry_run or not SERPER_KEY:
        return result

    try:
        data = serper_search(query, _location_string(loc))
        parsed = parse_serper_response(data, query)
        result.barber_lounge_rank = parsed.barber_lounge_rank
        result.barber_lounge_found = parsed.barber_lounge_found
        result.match_detail = parsed.match_detail
        result.top_competitors = parsed.top_competitors
        result.all_hits = parsed.all_hits
    except Exception as e:
        result.error = str(e)

    return result


def rank_display(rank: int | None, found: bool) -> str:
    if found and rank is not None:
        if rank == 1:
            return f"**#{rank}**"
        return f"#{rank}"
    return "Not visible"


def found_display(found: bool) -> str:
    return "Yes" if found else "No"


def print_setup_instructions() -> None:
    print("\n" + "=" * 60)
    print("  SERPER_API_KEY not set — live rank data unavailable")
    print("=" * 60)
    print("\nTo enable automated rank scanning:")
    print("  1. Sign up at https://serper.dev/ (free tier: 2,500 queries/mo)")
    print("  2. Copy tools/seo-agent/.env.example to .env if needed")
    print("  3. Add: SERPER_API_KEY=your_key_here")
    print("  4. Re-run: python local_rank_scan.py")
    print("\nOptional paid visual grid tools (map overlay):")
    print("  - Local Falcon: https://www.localfalcon.com/")
    print("  - BrightLocal:  https://www.brightlocal.com/local-rank-tracker/")
    print("  - Semrush:      https://www.semrush.com/local/")
    print("\nThis run will still output city list + manual Google check links.\n")


def build_markdown(results: list[CityResult], serper_used: bool) -> str:
    date_str = datetime.now().strftime("%Y-%m-%d")
    lines = [
        f"# Local Rank Scan — {BUSINESS_NAME}",
        "",
        f"**Date:** {date_str}  ",
        f"**Center:** {CENTER['city']}, {CENTER['state']} ({CENTER['lat']}, {CENTER['lng']})  ",
        f"**Radius:** ~20 miles (East Bay scan points)  ",
        f"**Query pattern:** `barbershop [city] CA` or `barbershop near [city] CA`  ",
        f"**Data source:** {'Serper API (live Google)' if serper_used else 'Manual links only (no SERPER_API_KEY)'}  ",
        "",
        "## Summary table",
        "",
        "| City | Rank | Top 3 competitors | Barber Lounge found? |",
        "|------|------|-------------------|----------------------|",
    ]

    for r in results:
        comps = ", ".join(r.top_competitors) if r.top_competitors else "—"
        if r.error:
            comps = f"Error: {r.error}"
        lines.append(
            f"| {r.city} | {rank_display(r.barber_lounge_rank, r.barber_lounge_found)} "
            f"| {comps} | {found_display(r.barber_lounge_found)} |"
        )

    visible = [r for r in results if r.barber_lounge_found]
    not_visible = [r for r in results if not r.barber_lounge_found and not r.error]

    lines.extend(
        [
            "",
            "## Bird's-eye summary",
            "",
            f"- **Visible ({len(visible)} cities):** "
            + (", ".join(f"{r.city} (#{r.barber_lounge_rank})" for r in visible) or "None"),
            f"- **Not in top results ({len(not_visible)} cities):** "
            + (", ".join(r.city for r in not_visible) or "None"),
            "",
            "## Manual check URLs",
            "",
            "Open each link in an incognito window (or use a geo VPN near the city) for ground truth:",
            "",
        ]
    )

    for r in results:
        lines.append(f"- **{r.city}:** [{r.query}]({r.manual_url})")

    if serper_used:
        lines.extend(["", "## Detail by city", ""])
        for r in results:
            lines.append(f"### {r.city}, {r.state}")
            lines.append(f"- Query: `{r.query}`")
            if r.match_detail:
                lines.append(f"- Match: {r.match_detail}")
            elif not r.error:
                lines.append("- Match: not found in organic/places top results")
            if r.error:
                lines.append(f"- Error: {r.error}")
            if r.all_hits:
                lines.append("- Top results:")
                for hit in r.all_hits[:10]:
                    marker = " **← Barber Lounge**" if _matches_barber_lounge(hit.title, hit.url) else ""
                    lines.append(f"  {hit.rank}. [{hit.title}]({hit.url}) ({hit.source}){marker}")
            lines.append("")

    lines.extend(
        [
            "## Notes",
            "",
            "- Serper returns Google organic + local pack for the given `location`; this is an approximation of a rank grid, not GPS-precise Local Falcon pins.",
            "- For map-style heatmaps, use [Local Falcon](https://www.localfalcon.com/) or similar.",
            "- Match signals: `thebarberlounge.com`, Vercel site, Booksy listing, Google Maps, or title containing \"Barber Lounge Antioch\".",
            "",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv
    serper_used = bool(SERPER_KEY) and not dry_run

    print(f"\nLocal Rank Scan — {BUSINESS_NAME}")
    print(f"Scan points: {len(SCAN_LOCATIONS)} cities (~20 mi from Antioch)")
    print(f"Center: {CENTER['lat']}, {CENTER['lng']}\n")

    if not serper_used:
        print_setup_instructions()

    results: list[CityResult] = []
    for i, loc in enumerate(SCAN_LOCATIONS):
        print(f"  [{i + 1}/{len(SCAN_LOCATIONS)}] {loc['city']}, {loc['state']}...", end=" ")
        result = scan_city(loc, dry_run=not serper_used)
        results.append(result)
        if result.error:
            print(f"ERROR: {result.error}")
        elif result.barber_lounge_found:
            print(f"found #{result.barber_lounge_rank}")
        elif serper_used:
            print("not visible")
        else:
            print("manual link only")
        if serper_used and i < len(SCAN_LOCATIONS) - 1:
            time.sleep(0.5)

    date_slug = datetime.now().strftime("%Y_%m_%d")
    out_dir = SCRIPT_DIR / "output"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"local_rank_scan_{date_slug}.md"
    md = build_markdown(results, serper_used)
    out_path.write_text(md, encoding="utf-8")

    print(f"\nReport saved: {out_path}")
    print("\nQuick table:")
    print(f"{'City':<16} {'Rank':<12} {'Found?':<8} Top competitors")
    print("-" * 70)
    for r in results:
        rank = f"#{r.barber_lounge_rank}" if r.barber_lounge_found else "—"
        comps = ", ".join(r.top_competitors[:2]) if r.top_competitors else "(manual check)"
        print(f"{r.city:<16} {rank:<12} {found_display(r.barber_lounge_found):<8} {comps[:40]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
