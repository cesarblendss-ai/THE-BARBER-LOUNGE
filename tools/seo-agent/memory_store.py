"""
Persistent memory for the SEO agent brain.
Stores run history, keywords, blog topics, rank gaps, and competitor snapshots.
Each run appends to memory/runs.jsonl; next runs read and build on prior context.
"""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
MEMORY_DIR = SCRIPT_DIR / "memory"
RUNS_FILE = MEMORY_DIR / "runs.jsonl"
COMPETITOR_FILE = MEMORY_DIR / "competitor_snapshots.jsonl"
RANK_SCANS_FILE = MEMORY_DIR / "rank_scans.jsonl"

STEP_FILES = [
    "keyword_research.md",
    "blog_post_1.md",
    "blog_post_2.md",
    "blog_post_3.md",
    "blog_post_4.md",
    "gbp_posts.md",
    "meta_tags.md",
    "schema_markup.json",
    "onpage_audit.md",
    "competitor_report.md",
    "client_report.md",
]


def ensure_memory_dir() -> Path:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    return MEMORY_DIR


def _read_jsonl(path: Path, limit: int | None = None) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    if limit is not None:
        return rows[-limit:]
    return rows


def _append_jsonl(path: Path, record: dict[str, Any]) -> None:
    ensure_memory_dir()
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def append_run(
    *,
    client: str,
    command: str,
    output_dir: str | None = None,
    deliverables: list[str] | None = None,
    blog_topics: list[str] | None = None,
    blog_slugs: list[str] | None = None,
    keywords_used: list[str] | None = None,
    notes: str = "",
    duration_seconds: int | None = None,
    steps_completed: list[str] | None = None,
) -> dict[str, Any]:
    record: dict[str, Any] = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "client": client,
        "command": command,
        "output_dir": output_dir,
        "deliverables": deliverables or [],
        "blog_topics": blog_topics or [],
        "blog_slugs": blog_slugs or [],
        "keywords_used": keywords_used or [],
        "notes": notes,
        "duration_seconds": duration_seconds,
        "steps_completed": steps_completed or [],
    }
    _append_jsonl(RUNS_FILE, record)
    return record


def append_rank_scan(
    *,
    report_path: str,
    visible_cities: list[str],
    gap_cities: list[str],
    notes: str = "",
) -> dict[str, Any]:
    record = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "report_path": report_path,
        "visible_cities": visible_cities,
        "gap_cities": gap_cities,
        "notes": notes,
    }
    _append_jsonl(RANK_SCANS_FILE, record)
    return record


def append_competitor_snapshot(
    *,
    query: str,
    competitors: list[dict[str, str]],
    notes: str = "",
) -> dict[str, Any]:
    record = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "query": query,
        "competitors": competitors,
        "notes": notes,
    }
    _append_jsonl(COMPETITOR_FILE, record)
    return record


def load_runs(limit: int | None = None) -> list[dict[str, Any]]:
    return _read_jsonl(RUNS_FILE, limit=limit)


def load_rank_scans(limit: int | None = None) -> list[dict[str, Any]]:
    return _read_jsonl(RANK_SCANS_FILE, limit=limit)


def load_competitor_snapshots(limit: int | None = None) -> list[dict[str, Any]]:
    return _read_jsonl(COMPETITOR_FILE, limit=limit)


def get_used_topics() -> list[str]:
    topics: list[str] = []
    for run in load_runs():
        for t in run.get("blog_topics") or []:
            if t and t not in topics:
                topics.append(t)
    return topics


def get_used_slugs() -> list[str]:
    slugs: list[str] = []
    for run in load_runs():
        for s in run.get("blog_slugs") or []:
            if s and s not in slugs:
                slugs.append(s)
    return slugs


def get_used_keywords() -> list[str]:
    keywords: list[str] = []
    for run in load_runs():
        for k in run.get("keywords_used") or []:
            if k and k not in keywords:
                keywords.append(k)
    return keywords


def get_rank_gaps() -> list[str]:
    scans = load_rank_scans(limit=3)
    gaps: list[str] = []
    for scan in reversed(scans):
        for city in scan.get("gap_cities") or []:
            if city and city not in gaps:
                gaps.append(city)
    return gaps


def build_memory_context() -> dict[str, Any]:
    """Aggregate prior run data for injection into LLM prompts."""
    runs = load_runs(limit=10)
    return {
        "prior_runs_count": len(load_runs()),
        "used_topics": get_used_topics(),
        "used_slugs": get_used_slugs(),
        "used_keywords": get_used_keywords()[:30],
        "rank_gaps": get_rank_gaps(),
        "recent_runs": runs[-5:],
        "competitor_snapshots": load_competitor_snapshots(limit=3),
    }


def format_memory_prompt(ctx: dict[str, Any]) -> str:
    """Human-readable block for LLM system/user prompts."""
    if ctx["prior_runs_count"] == 0:
        return ""

    lines = [
        "PRIOR RUN MEMORY (avoid duplicate topics; build on what worked):",
        f"- Total prior runs: {ctx['prior_runs_count']}",
    ]

    if ctx["used_topics"]:
        lines.append("- Blog topics already covered (DO NOT repeat):")
        for t in ctx["used_topics"][-12:]:
            lines.append(f"  • {t}")

    if ctx["used_keywords"]:
        lines.append("- Keywords already targeted:")
        lines.append(f"  • {', '.join(ctx['used_keywords'][:15])}")

    if ctx["rank_gaps"]:
        lines.append("- Cities with rank gaps (prioritize local content for):")
        lines.append(f"  • {', '.join(ctx['rank_gaps'])}")

    recent = ctx.get("recent_runs") or []
    if recent:
        last = recent[-1]
        lines.append(
            f"- Last run: {last.get('timestamp', '?')} — "
            f"{len(last.get('blog_topics') or [])} topics, "
            f"output: {last.get('output_dir', 'n/a')}"
        )

    comps = ctx.get("competitor_snapshots") or []
    if comps:
        latest = comps[-1]
        names = [c.get("title", c.get("name", "?")) for c in latest.get("competitors", [])[:3]]
        if names:
            lines.append(f"- Latest competitor watch: {', '.join(names)}")

    lines.append(
        "\nGenerate NEW angles — adjacent keywords, unanswered questions, "
        "and content targeting rank-gap cities."
    )
    return "\n".join(lines)


def suggest_next_run() -> list[str]:
    """Actionable suggestions based on memory."""
    suggestions: list[str] = []
    ctx = build_memory_context()

    if ctx["prior_runs_count"] == 0:
        suggestions.append("First run — generate full keyword research + 4 blog posts.")
        return suggestions

    if ctx["rank_gaps"]:
        cities = ", ".join(ctx["rank_gaps"][:4])
        suggestions.append(f"Target rank-gap cities in blog titles: {cities}")

    if ctx["used_topics"]:
        suggestions.append(
            f"Avoid repeating {len(ctx['used_topics'])} prior topics — "
            "pick fresh clusters from keyword research."
        )

    slugs = ctx["used_slugs"]
    if slugs:
        suggestions.append(
            f"Check publish status: {len(slugs)} slugs from agent output — "
            "run `python run.py publish-check`."
        )

    last_runs = load_runs(limit=1)
    if last_runs:
        last = last_runs[-1]
        if last.get("command") == "seo" and not last.get("blog_slugs"):
            suggestions.append("Last SEO run may lack slug extraction — re-run with --memory.")

    if not load_rank_scans():
        suggestions.append("No rank scans in memory — run `python run.py rank`.")

    if not load_competitor_snapshots():
        suggestions.append("No competitor snapshots — run `python run.py competitor-watch`.")

    suggestions.append("Use `python run.py full \"The Barber Lounge\"` for end-to-end pipeline.")
    return suggestions


def extract_slugs_from_output(output_dir: Path) -> list[str]:
    slugs: list[str] = []
    for path in sorted(output_dir.glob("blog_post_*.md")):
        text = path.read_text(encoding="utf-8")
        m = re.search(r"^SLUG:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
        if m:
            slug = m.group(1).strip().strip("`")
            if slug and slug not in slugs:
                slugs.append(slug)
    return slugs


def extract_topics_from_output(output_dir: Path) -> list[str]:
    topics: list[str] = []
    for path in sorted(output_dir.glob("blog_post_*.md")):
        text = path.read_text(encoding="utf-8")
        m = re.search(r"^Topic:\s*(.+)$", text, re.MULTILINE)
        if m:
            topic = m.group(1).strip()
            if topic and topic not in topics:
                topics.append(topic)
    return topics


def detect_completed_steps(output_dir: Path) -> list[str]:
    completed: list[str] = []
    for fname in STEP_FILES:
        if (output_dir / fname).is_file() and (output_dir / fname).stat().st_size > 50:
            completed.append(fname.replace(".md", "").replace(".json", ""))
    return completed


def find_latest_output_dir(client_slug: str) -> Path | None:
    out_root = SCRIPT_DIR / "output"
    if not out_root.is_dir():
        return None
    matches = sorted(
        out_root.glob(f"{client_slug}_*"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return matches[0] if matches else None
