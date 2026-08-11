#!/usr/bin/env python3
"""
CONTENT IMPORTER — SEO agent output → site blog registry

Scaffolds blog-posts.ts entries and TSX stub files from seo_agent markdown output.
Does NOT auto-write prose — generates registry + placeholder TSX for human/LLM fill.

USAGE:
    python content_importer.py                          # latest output folder
    python content_importer.py --folder output/the_barber_lounge_2026_08_08_v2
    python content_importer.py --slug best-barber-antioch --dry-run
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
BLOG_POSTS_TS = PROJECT_ROOT / "src" / "lib" / "blog-posts.ts"
BLOG_CONTENT_DIR = PROJECT_ROOT / "src" / "lib" / "blog-content"
BLOG_INDEX = BLOG_CONTENT_DIR / "index.tsx"


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s[:60].strip("-")


def parse_blog_md(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = text.strip().splitlines()
    title = lines[0].lstrip("# ").strip() if lines else path.stem
    # first paragraph after title
    body_lines = []
    for line in lines[1:]:
        if line.strip() and not line.startswith("#"):
            body_lines.append(line.strip())
            if len(body_lines) >= 2:
                break
    excerpt = " ".join(body_lines)[:200]
    slug = slugify(title)
    return {"title": title, "excerpt": excerpt, "slug": slug, "source": path.name}


def find_latest_output() -> Path:
    out = SCRIPT_DIR / "output"
    folders = sorted(out.glob("the_barber_lounge_*"), reverse=True)
    if not folders:
        raise SystemExit("No output folders found. Run seo_agent.py first.")
    return folders[0]


def existing_slugs() -> set[str]:
    if not BLOG_POSTS_TS.exists():
        return set()
    text = BLOG_POSTS_TS.read_text(encoding="utf-8")
    return set(re.findall(r'slug:\s*"([^"]+)"', text))


def component_name(slug: str) -> str:
    parts = slug.split("-")
    return "".join(p.capitalize() for p in parts) + "Content"


def scaffold_tsx(slug: str, title: str) -> str:
    name = component_name(slug)
    return f'''import {{ BookOnlineLink, PhoneLink, ServicesLink }} from "./blog-links";

export function {name}() {{
  return (
    <>
      <p>
        {/* TODO: Import body from tools/seo-agent/output — slug: {slug} */}
        {title}
      </p>
      <p>
        <ServicesLink /> · <BookOnlineLink /> · <PhoneLink />
      </p>
    </>
  );
}}
'''


def main() -> None:
    parser = argparse.ArgumentParser(description="Import SEO blog markdown into site scaffold")
    parser.add_argument("--folder", type=Path, help="Output folder path")
    parser.add_argument("--slug", help="Import single slug from blog_post_N.md match")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    folder = args.folder or find_latest_output()
    if not folder.is_absolute():
        folder = SCRIPT_DIR / folder

    md_files = sorted(folder.glob("blog_post_*.md"))
    if not md_files:
        raise SystemExit(f"No blog_post_*.md in {folder}")

    have = existing_slugs()
    to_add: list[dict] = []

    for md in md_files:
        post = parse_blog_md(md)
        if post["slug"] in have:
            print(f"  [SKIP] {post['slug']} already in blog-posts.ts")
            continue
        if args.slug and post["slug"] != args.slug:
            continue
        to_add.append(post)

    if not to_add:
        print("Nothing new to import.")
        return

    today = date.today().isoformat()
    for post in to_add:
        slug = post["slug"]
        tsx_path = BLOG_CONTENT_DIR / f"{slug}.tsx"
        print(f"  [NEW] {slug}")
        print(f"        TSX: {tsx_path.relative_to(PROJECT_ROOT)}")
        print(f"        Add to blog-posts.ts manually or via --write flag future")

        if args.dry_run:
            continue

        if not tsx_path.exists():
            tsx_path.write_text(scaffold_tsx(slug, post["title"]), encoding="utf-8")
            print(f"        ✓ Wrote TSX stub")

    print(f"\nNext: add entries to blog-posts.ts + index.tsx for: {[p['slug'] for p in to_add]}")
    print(f"Registry: {BLOG_POSTS_TS.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
