#!/usr/bin/env python3
"""
Barber SEO Brain — master CLI orchestrator.
Single entry point for the entire SEO agent ecosystem.

USAGE:
    python run.py test                    # smoke test all tools
    python run.py full "The Barber Lounge" # seo + rank + report
    python run.py seo "The Barber Lounge"  # content only
    python run.py rank                     # local rank scan
    python run.py memory                   # last 5 runs + suggestions
    python run.py publish-check            # diff output vs blog-posts.ts
    python run.py competitor-watch         # top 3 Antioch barbershops
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
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

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

# ANSI colors (work in modern Windows Terminal / PowerShell)
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
CYAN = "\033[36m"


def c(text: str, color: str) -> str:
    return f"{color}{text}{RESET}"


def ok(msg: str) -> None:
    print(c(f"  ✓ {msg}", GREEN))


def fail(msg: str) -> None:
    print(c(f"  ✗ {msg}", RED), file=sys.stderr)


def info(msg: str) -> None:
    print(c(f"  → {msg}", CYAN))


def warn(msg: str) -> None:
    print(c(f"  ! {msg}", YELLOW))


def header(title: str) -> None:
    print(f"\n{c(BOLD + title, BLUE)}")
    print(c("─" * min(len(title) + 4, 60), DIM))


def run_python(script: str, args: list[str] | None = None, check: bool = True) -> int:
    cmd = [sys.executable, str(SCRIPT_DIR / script)] + (args or [])
    info(" ".join(cmd))
    result = subprocess.run(cmd, cwd=str(SCRIPT_DIR))
    if check and result.returncode != 0:
        fail(f"{script} exited with code {result.returncode}")
    return result.returncode


def cmd_test(_args: argparse.Namespace) -> int:
    header("Smoke Test — All Tools")
    failures = 0

    # 1. Import checks
    header("Module imports")
    modules = ["memory_store", "publish_check", "competitor_watch", "seo_agent", "local_rank_scan"]
    for mod in modules:
        try:
            __import__(mod)
            ok(f"import {mod}")
        except Exception as e:
            fail(f"import {mod}: {e}")
            failures += 1

    # 2. Memory store
    header("Memory store")
    try:
        from memory_store import ensure_memory_dir, append_run, load_runs, suggest_next_run

        ensure_memory_dir()
        ok("memory/ directory ready")
        ok(f"{len(load_runs())} prior runs in memory")
        ok(f"{len(suggest_next_run())} suggestions available")
    except Exception as e:
        fail(f"memory_store: {e}")
        failures += 1

    # 3. Publish check (no API)
    header("Publish check")
    try:
        from publish_check import run_publish_check, format_report

        report = run_publish_check()
        print(format_report(report)[:500])
        ok("publish_check ran")
    except Exception as e:
        fail(f"publish_check: {e}")
        failures += 1

    # 4. Competitor watch dry-run
    header("Competitor watch (dry-run)")
    if run_python("competitor_watch.py", ["--dry-run"], check=False) != 0:
        failures += 1
    else:
        ok("competitor_watch dry-run")

    # 5. Rank scan dry-run
    header("Rank scan (dry-run)")
    if run_python("local_rank_scan.py", ["--dry-run"], check=False) != 0:
        failures += 1
    else:
        ok("local_rank_scan dry-run")

    # 6. SEO agent smoke test (needs API key)
    header("SEO agent (--test)")
    from seo_agent import _has_openai_key, _has_anthropic_key

    if not _has_openai_key() and not _has_anthropic_key():
        warn("No LLM API key — skipping seo_agent --test")
    else:
        if run_python("seo_agent.py", ["--test"], check=False) != 0:
            failures += 1
        else:
            ok("seo_agent --test")

    print()
    if failures:
        print(c(f"FAILED — {failures} check(s) failed", RED))
        return 1
    print(c("ALL TESTS PASSED", GREEN + BOLD))
    return 0


def cmd_seo(args: argparse.Namespace) -> int:
    client = args.client or "The Barber Lounge"
    cli_args = [client]
    if args.memory:
        cli_args.append("--memory")
    if args.suffix:
        cli_args.extend(["--suffix", args.suffix])
    if args.resume:
        cli_args.append("--resume")
    return run_python("seo_agent.py", cli_args)


def cmd_rank(args: argparse.Namespace) -> int:
    rank_args = ["--dry-run"] if args.dry_run else []
    code = run_python("local_rank_scan.py", rank_args, check=False)
    if code == 0 and not args.dry_run:
        _record_rank_scan_from_output()
    return code


def _record_rank_scan_from_output() -> None:
    """Parse latest rank scan markdown and append to memory."""
    from memory_store import append_rank_scan

    out_dir = SCRIPT_DIR / "output"
    scans = sorted(out_dir.glob("local_rank_scan_*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not scans:
        return
    text = scans[0].read_text(encoding="utf-8")
    visible: list[str] = []
    gaps: list[str] = []
    for line in text.splitlines():
        m = re.search(r"\*\*Visible \(\d+ cities\):\*\* (.+)", line)
        if m:
            for part in m.group(1).split(","):
                city_m = re.match(r"(\w+)", part.strip())
                if city_m and city_m.group(1) != "None":
                    visible.append(city_m.group(1))
        m2 = re.search(r"\*\*Not in top results \(\d+ cities\):\*\* (.+)", line)
        if m2:
            for part in m2.group(1).split(","):
                city = part.strip()
                if city and city != "None":
                    gaps.append(city)
    append_rank_scan(
        report_path=str(scans[0]),
        visible_cities=visible,
        gap_cities=gaps,
    )
    info(f"Rank scan saved to memory ({len(visible)} visible, {len(gaps)} gaps)")


def cmd_full(args: argparse.Namespace) -> int:
    client = args.client or "The Barber Lounge"
    header(f"Full Pipeline — {client}")
    start = time.time()

    info("Step 1/3 — SEO content generation")
    if cmd_seo(args) != 0:
        fail("SEO step failed — aborting full pipeline")
        return 1
    ok("SEO content complete")

    info("Step 2/3 — Local rank scan")
    rank_args = argparse.Namespace(dry_run=args.dry_run)
    if cmd_rank(rank_args) != 0:
        warn("Rank scan failed — continuing to publish check")
    else:
        ok("Rank scan complete")

    info("Step 3/3 — Publish check")
    if run_python("publish_check.py", check=False) != 0:
        warn("Publish check found gaps (expected if blogs not imported yet)")
    else:
        ok("Publish check passed")

    elapsed = int(time.time() - start)
    print(c(f"\nFull pipeline done in {elapsed // 60}m {elapsed % 60}s", GREEN + BOLD))
    return 0


def cmd_memory(_args: argparse.Namespace) -> int:
    from memory_store import load_runs, load_rank_scans, load_competitor_snapshots, suggest_next_run

    header("SEO Brain Memory")

    runs = load_runs(limit=5)
    if not runs:
        warn("No runs in memory yet. Run `python run.py seo \"The Barber Lounge\"` first.")
    else:
        print(c(f"\nLast {len(runs)} runs:", BOLD))
        for r in reversed(runs):
            ts = r.get("timestamp", "?")[:19]
            cmd = r.get("command", "?")
            topics = r.get("blog_topics") or []
            print(f"  {ts}  [{cmd}]  {r.get('client', '?')}")
            if topics:
                print(f"    topics: {', '.join(t[:40] for t in topics[:2])}...")
            if r.get("output_dir"):
                print(f"    output: {Path(r['output_dir']).name}")

    scans = load_rank_scans(limit=3)
    if scans:
        print(c("\nRecent rank scans:", BOLD))
        for s in scans:
            gaps = s.get("gap_cities") or []
            print(f"  {s.get('timestamp', '?')[:19]}  gaps: {', '.join(gaps) or 'none'}")

    comps = load_competitor_snapshots(limit=2)
    if comps:
        print(c("\nRecent competitor snapshots:", BOLD))
        for s in comps:
            names = [c.get("title", "?")[:30] for c in s.get("competitors", [])[:3]]
            print(f"  {s.get('timestamp', '?')[:19]}  {', '.join(names)}")

    suggestions = suggest_next_run()
    print(c("\nSuggestions for next run:", BOLD))
    for i, s in enumerate(suggestions, 1):
        print(f"  {i}. {s}")

    return 0


def cmd_publish_check(_args: argparse.Namespace) -> int:
    return run_python("publish_check.py", check=False)


def cmd_competitor_watch(args: argparse.Namespace) -> int:
    watch_args = ["--dry-run"] if args.dry_run else []
    return run_python("competitor_watch.py", watch_args, check=False)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="run.py",
        description="Barber SEO Brain — master CLI for the SEO agent ecosystem",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("test", help="Smoke test all tools")

    p_seo = sub.add_parser("seo", help="Run SEO content generation (8 steps)")
    p_seo.add_argument("client", nargs="?", default="The Barber Lounge")
    p_seo.add_argument("--memory", action="store_true", help="Use prior run context")
    p_seo.add_argument("--resume", action="store_true", help="Resume incomplete output folder")
    p_seo.add_argument("--suffix", default="", help="Output folder suffix (e.g. v2)")

    p_full = sub.add_parser("full", help="Full pipeline: seo + rank + publish-check")
    p_full.add_argument("client", nargs="?", default="The Barber Lounge")
    p_full.add_argument("--memory", action="store_true")
    p_full.add_argument("--resume", action="store_true")
    p_full.add_argument("--suffix", default="")
    p_full.add_argument("--dry-run", action="store_true", help="Rank scan dry-run only")

    p_rank = sub.add_parser("rank", help="Local rank scan (~20 mi from Antioch)")
    p_rank.add_argument("--dry-run", action="store_true")

    sub.add_parser("memory", help="Show last 5 runs + suggestions")
    sub.add_parser("publish-check", help="Diff SEO output vs blog-posts.ts")

    p_comp = sub.add_parser("competitor-watch", help="Top 3 Antioch barbershops via Serper")
    p_comp.add_argument("--dry-run", action="store_true")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    print(c(f"\n{'═' * 50}", BLUE))
    print(c("  BARBER SEO BRAIN", BOLD + BLUE))
    print(c(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}", DIM))
    print(c(f"{'═' * 50}", BLUE))

    handlers = {
        "test": cmd_test,
        "seo": cmd_seo,
        "full": cmd_full,
        "rank": cmd_rank,
        "memory": cmd_memory,
        "publish-check": cmd_publish_check,
        "competitor-watch": cmd_competitor_watch,
    }
    return handlers[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
