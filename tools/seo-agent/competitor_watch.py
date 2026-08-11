"""
Competitor watch — lightweight Serper scrape of top barbershops in Antioch, CA.
Saves snapshots to memory/competitor_snapshots.jsonl for the SEO brain.
"""

from __future__ import annotations

import json
import os
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

from memory_store import append_competitor_snapshot, load_competitor_snapshots

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

load_dotenv(SCRIPT_DIR / ".env")
if not os.getenv("SERPER_API_KEY"):
    load_dotenv(PROJECT_ROOT / ".env.local")

SERPER_KEY = os.getenv("SERPER_API_KEY", "").strip()

DEFAULT_QUERY = "best barbershop Antioch CA"
DEFAULT_CITY = "Antioch"
DEFAULT_STATE = "CA"
TOP_N = 3


def search_competitors(query: str, num: int = 10) -> list[dict[str, str]]:
    if not SERPER_KEY:
        return []

    import requests

    r = requests.post(
        "https://google.serper.dev/search",
        headers={"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"},
        json={
            "q": query,
            "num": num,
            "gl": "us",
            "hl": "en",
            "location": f"{DEFAULT_CITY}, {DEFAULT_STATE}, United States",
        },
        timeout=12,
    )
    r.raise_for_status()
    data = r.json()

    hits: list[dict[str, str]] = []
    for section, key in (("places", "places"), ("local", "localResults"), ("organic", "organic")):
        for item in data.get(key) or []:
            title = (item.get("title") or item.get("name") or "").strip()
            url = (item.get("link") or item.get("website") or item.get("url") or "").strip()
            snippet = (item.get("snippet") or item.get("address") or "").strip()
            if not title:
                continue
            if "barber lounge" in title.lower():
                continue
            hits.append(
                {
                    "title": title,
                    "url": url,
                    "snippet": snippet[:200],
                    "source": section,
                }
            )

    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for h in hits:
        key = h["title"].lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(h)
        if len(unique) >= TOP_N:
            break
    return unique


def run_competitor_watch(query: str = DEFAULT_QUERY, dry_run: bool = False) -> dict:
    print(f"\nCompetitor Watch — top {TOP_N} for: {query}")

    if dry_run or not SERPER_KEY:
        print("  SERPER_API_KEY not set — using placeholder snapshot.")
        competitors = [
            {"title": "Fades & Blades Antioch", "url": "", "snippet": "manual", "source": "known"},
            {"title": "Executive Cuts Antioch", "url": "", "snippet": "manual", "source": "known"},
            {"title": "Local Booksy barbershops", "url": "", "snippet": "manual", "source": "known"},
        ]
    else:
        competitors = search_competitors(query)
        if not competitors:
            print("  No results from Serper — check API key or quota.")

    for i, c in enumerate(competitors, 1):
        print(f"  {i}. {c['title']}")
        if c.get("url"):
            print(f"     {c['url'][:70]}")

    record = append_competitor_snapshot(
        query=query,
        competitors=competitors,
        notes=f"top_{TOP_N}_barbershops_{DEFAULT_CITY.lower()}",
    )

    out_path = SCRIPT_DIR / "memory" / f"competitor_watch_{datetime.now().strftime('%Y_%m_%d')}.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved to memory: {out_path.name}")
    return record


def show_history(limit: int = 5) -> None:
    snaps = load_competitor_snapshots(limit=limit)
    if not snaps:
        print("No competitor snapshots in memory yet.")
        return
    print(f"\nLast {len(snaps)} competitor snapshots:")
    for s in snaps:
        names = [c.get("title", "?") for c in s.get("competitors", [])]
        print(f"  {s.get('timestamp', '?')}: {', '.join(names)}")


def main() -> int:
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv
    if "--history" in sys.argv:
        show_history()
        return 0

    query = DEFAULT_QUERY
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    if args:
        query = " ".join(args)

    run_competitor_watch(query=query, dry_run=dry_run)
    if SERPER_KEY and not dry_run:
        time.sleep(0.3)
    return 0


if __name__ == "__main__":
    sys.exit(main())
