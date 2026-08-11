"""
Publish check — diff SEO agent blog output vs live site blog-posts.ts.
Reports missing slugs, unpublished posts, and meta mismatches.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

if sys.platform == "win32":
    import os

    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
BLOG_POSTS_TS = PROJECT_ROOT / "src" / "lib" / "blog-posts.ts"
OUTPUT_DIR = SCRIPT_DIR / "output"


@dataclass
class AgentBlog:
    source_file: str
    slug: str
    title: str = ""
    meta_description: str = ""
    topic: str = ""


@dataclass
class SiteBlog:
    slug: str
    title: str
    description: str


@dataclass
class PublishReport:
    agent_posts: list[AgentBlog] = field(default_factory=list)
    site_posts: list[SiteBlog] = field(default_factory=list)
    missing_on_site: list[AgentBlog] = field(default_factory=list)
    on_site_only: list[str] = field(default_factory=list)
    output_folder: str = ""


def _parse_agent_blog(path: Path) -> AgentBlog | None:
    text = path.read_text(encoding="utf-8")
    slug_m = re.search(r"^SLUG:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
    if not slug_m:
        return None
    slug = slug_m.group(1).strip().strip("`")
    title_m = re.search(r"^TITLE:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
    meta_m = re.search(r"^META DESCRIPTION:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
    topic_m = re.search(r"^Topic:\s*(.+)$", text, re.MULTILINE)
    return AgentBlog(
        source_file=path.name,
        slug=slug,
        title=title_m.group(1).strip() if title_m else "",
        meta_description=meta_m.group(1).strip() if meta_m else "",
        topic=topic_m.group(1).strip() if topic_m else "",
    )


def _parse_site_blog_posts() -> list[SiteBlog]:
    if not BLOG_POSTS_TS.is_file():
        return []
    text = BLOG_POSTS_TS.read_text(encoding="utf-8")
    posts: list[SiteBlog] = []
    for block in re.finditer(
        r"\{\s*slug:\s*\"([^\"]+)\".*?title:\s*\"([^\"]+)\".*?description:\s*\n?\s*\"([^\"]+)\"",
        text,
        re.DOTALL,
    ):
        posts.append(SiteBlog(slug=block.group(1), title=block.group(2), description=block.group(3)))
    return posts


def _latest_output_with_blogs() -> Path | None:
    if not OUTPUT_DIR.is_dir():
        return None
    candidates = [
        p
        for p in OUTPUT_DIR.iterdir()
        if p.is_dir() and any(p.glob("blog_post_*.md"))
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def run_publish_check(output_folder: Path | None = None) -> PublishReport:
    folder = output_folder or _latest_output_with_blogs()
    report = PublishReport()

    if folder is None:
        return report

    report.output_folder = str(folder)
    for path in sorted(folder.glob("blog_post_*.md")):
        blog = _parse_agent_blog(path)
        if blog:
            report.agent_posts.append(blog)

    report.site_posts = _parse_site_blog_posts()
    site_slugs = {p.slug for p in report.site_posts}
    agent_slugs = {p.slug for p in report.agent_posts}

    report.missing_on_site = [p for p in report.agent_posts if p.slug not in site_slugs]
    report.on_site_only = sorted(site_slugs - agent_slugs)
    return report


def format_report(report: PublishReport) -> str:
    lines = [
        "PUBLISH CHECK — SEO output vs site",
        f"Output folder: {report.output_folder or '(none found)'}",
        f"Site registry: {BLOG_POSTS_TS.relative_to(PROJECT_ROOT)}",
        "",
        f"Agent blog posts: {len(report.agent_posts)}",
        f"Site blog posts:  {len(report.site_posts)}",
        "",
    ]

    if not report.agent_posts:
        lines.append("No blog_post_*.md files found in latest output folder.")
        return "\n".join(lines)

    lines.append("Agent slugs:")
    for p in report.agent_posts:
        status = "OK" if p.slug in {s.slug for s in report.site_posts} else "MISSING"
        lines.append(f"  [{status}] {p.slug} — {p.title[:60] or p.topic[:60]}")

    if report.missing_on_site:
        lines.extend(["", f"Missing on site ({len(report.missing_on_site)}):"])
        for p in report.missing_on_site:
            lines.append(f"  • {p.slug} ({p.source_file})")

    if report.on_site_only:
        lines.extend(["", f"On site but not in latest agent output ({len(report.on_site_only)}):"])
        for slug in report.on_site_only:
            lines.append(f"  • {slug}")

    lines.extend(["", "Meta comparison (site vs agent):"])
    site_by_slug = {p.slug: p for p in report.site_posts}
    for p in report.agent_posts:
        site = site_by_slug.get(p.slug)
        if not site:
            continue
        title_match = p.title.lower()[:40] in site.title.lower() or site.title.lower()[:40] in p.title.lower()
        lines.append(f"  {p.slug}: title {'match' if title_match else 'DIFFERS'}")

    return "\n".join(lines)


def main() -> int:
    folder_arg = None
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    if args:
        folder_arg = Path(args[0])
        if not folder_arg.is_absolute():
            folder_arg = OUTPUT_DIR / folder_arg

    report = run_publish_check(folder_arg)
    print(format_report(report))

    if not report.agent_posts:
        return 1
    if report.missing_on_site:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
