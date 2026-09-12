#!/usr/bin/env python3
"""Generate formatted Silva's Handyman estimates from wizard pricing + a job file."""

from __future__ import annotations

import argparse
import html
import json
from collections import OrderedDict
from datetime import date
from pathlib import Path

from estimate_engine import (
    LineItem,
    build_siding_demo_reinstall_lines,
    estimate_payload,
    format_usd,
    summarize,
)

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def format_qty(qty: float) -> str:
    if abs(qty - round(qty)) < 1e-9:
        return str(int(round(qty)))
    return f"{qty:.2f}".rstrip("0").rstrip(".")


def qty_label(item: LineItem) -> str:
    if item.unit == "ls":
        return "1 ls"
    return f"{format_qty(item.qty)} {item.unit}"


def kind_label(kind: str) -> str:
    return {"labor": "Labor", "material": "Material", "fee": "Fee"}[kind]


def render_markdown(payload: dict, lines: list[LineItem]) -> str:
    biz = payload["business"]
    job = payload["job"]
    rates = payload["rates"]
    totals = payload["totals"]
    sections: OrderedDict[str, list[LineItem]] = OrderedDict()
    for item in lines:
        sections.setdefault(item.section, []).append(item)

    out: list[str] = []
    out.append(f"# {biz['legalName']} — Estimate")
    out.append("")
    out.append(f"**{job['title']}**")
    out.append("")
    out.append(f"- Prepared: {job['preparedDate']}")
    out.append(f"- Prepared for: {job['clientName']}")
    out.append(f"- Job site: {job['jobSite']}")
    out.append(f"- Contact: {biz['contact']} · {biz['serviceArea']}")
    if biz.get("phone") and biz["phone"] != "TBD":
        out.append(f"- Phone: {biz['phone']}")
    out.append("")
    out.append("## Scope")
    out.append("")
    out.append(f"- House siding: **{job['sidingSf']} sq ft**")
    out.append(
        f"- Chimney: **{job['chimneyHeightFt']} ft height** "
        f"(assumed {job['chimneyWrapGirthFt']} ft wrap = **{job['chimneySf']:g} sq ft**)"
    )
    out.append(f"- Window trims: **{job['windowTrims']}**")
    out.append(
        "- Demo: **one lump** covering siding + chimney + all 13 trims "
        "(not split per surface)"
    )
    out.append("")
    out.append("## Pricing rules used")
    out.append("")
    out.append(
        f"- Labor / fee lines: hard cost × (1 + {rates['profitMarginPercent']:g}% profit margin)"
    )
    out.append(
        f"- Material lines: hard cost × (1 + {rates['materialMarkupPercent']:g}% material markup) "
        f"× (1 + {rates['profitMarginPercent']:g}% profit margin)"
    )
    out.append(f"- Wizard labor hourly (reference): {format_usd(int(rates['laborHourlyCost'] * 100))}/hr")
    out.append("- No line is quoted at raw cost.")
    out.append("")

    out.append("## Line items")
    out.append("")
    out.append("| Section | Description | Type | Qty | Cost | Quoted |")
    out.append("|---|---|---|---:|---:|---:|")
    for item in lines:
        out.append(
            f"| {item.section} | {item.description} | {kind_label(item.kind)} | "
            f"{qty_label(item)} | {format_usd(item.cost_cents)} | {format_usd(item.quoted_cents)} |"
        )
    out.append("")

    out.append("## Labor vs. material")
    out.append("")
    out.append("| | Hard cost | Quoted (after markup / margin) |")
    out.append("|---|---:|---:|")
    out.append(
        f"| Labor | {format_usd(totals['labor_cost_cents'])} | {format_usd(totals['labor_quoted_cents'])} |"
    )
    out.append(
        f"| Materials | {format_usd(totals['material_cost_cents'])} | {format_usd(totals['material_quoted_cents'])} |"
    )
    out.append(
        f"| Fees (dump) | {format_usd(totals['fee_cost_cents'])} | {format_usd(totals['fee_quoted_cents'])} |"
    )
    out.append(
        f"| **Subtotal** | **{format_usd(totals['subtotal_cost_cents'])}** | **{format_usd(totals['subtotal_quoted_cents'])}** |"
    )
    out.append(f"| Built-in margin | | {format_usd(totals['profit_cents'])} |")
    out.append(f"| **Total** | | **{format_usd(totals['total_cents'])}** |")
    out.append("")

    survey = job.get("photoSurvey")
    if survey:
        out.append("## Photo survey")
        out.append("")
        out.append(f"- Date: {survey.get('date', '—')}")
        if survey.get("source"):
            out.append(f"- Source: {survey['source']}")
        for finding in survey.get("findings", []):
            out.append(f"- {finding}")
        out.append("")

    if job.get("scopeNotes"):
        out.append("## Notes")
        out.append("")
        for note in job["scopeNotes"]:
            out.append(f"- {note}")
        out.append("")

    out.append("This is an estimate, not a contract. Prices may change after site inspection.")
    out.append("")
    return "\n".join(out)


def render_html(payload: dict, lines: list[LineItem]) -> str:
    biz = payload["business"]
    job = payload["job"]
    rates = payload["rates"]
    totals = payload["totals"]

    def esc(value: object) -> str:
        return html.escape(str(value))

    row_html = []
    current = None
    for item in lines:
        section_cell = esc(item.section) if item.section != current else ""
        current = item.section
        note = f'<div class="note">{esc(item.notes)}</div>' if item.notes else ""
        row_html.append(
            "<tr>"
            f"<td>{section_cell}</td>"
            f"<td>{esc(item.description)}{note}</td>"
            f"<td>{esc(kind_label(item.kind))}</td>"
            f"<td class='num'>{esc(qty_label(item))}</td>"
            f"<td class='num'>{format_usd(item.cost_cents)}</td>"
            f"<td class='num'><strong>{format_usd(item.quoted_cents)}</strong></td>"
            "</tr>"
        )

    survey = job.get("photoSurvey") or {}
    survey_items = "".join(f"<li>{esc(finding)}</li>" for finding in survey.get("findings", []))
    survey_block = ""
    if survey_items:
        survey_meta = esc(survey.get("date", "—"))
        source = esc(survey["source"]) if survey.get("source") else ""
        survey_block = f"""
    <h2>Photo survey</h2>
    <p class="rules">Date: {survey_meta}{f" · {source}" if source else ""}</p>
    <ul>{survey_items}</ul>
"""
    notes = "".join(f"<li>{esc(note)}</li>" for note in job.get("scopeNotes", []))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(biz['legalName'])} — {esc(job['title'])}</title>
  <style>
    :root {{
      --ink: #2a1c14;
      --muted: #6b5344;
      --line: #e4d3c4;
      --paper: #fffaf4;
      --rust: #c45c26;
      --rust-dark: #8d3d14;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, serif;
      color: var(--ink);
      background: #f3ebe3;
    }}
    .page {{
      max-width: 880px;
      margin: 24px auto;
      background: var(--paper);
      padding: 36px 40px 48px;
      box-shadow: 0 8px 30px rgba(42, 28, 20, 0.08);
    }}
    h1 {{
      margin: 0 0 4px;
      font-size: 28px;
      letter-spacing: 0.02em;
      color: var(--rust-dark);
    }}
    .tag {{
      display: inline-block;
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--rust);
      margin-bottom: 8px;
    }}
    h2 {{
      margin: 28px 0 10px;
      font-size: 16px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--rust-dark);
    }}
    .meta, .scope {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
      color: var(--muted);
      font-size: 15px;
    }}
    .rules {{ color: var(--muted); font-size: 14px; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }}
    th, td {{
      border-bottom: 1px solid var(--line);
      padding: 8px 6px;
      vertical-align: top;
      text-align: left;
    }}
    th {{
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }}
    .num {{ text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }}
    .note {{ color: var(--muted); font-size: 12px; margin-top: 3px; }}
    .totals {{
      width: min(420px, 100%);
      margin-left: auto;
      margin-top: 8px;
    }}
    .totals td {{ border-bottom: none; padding: 5px 6px; }}
    .totals .grand td {{
      border-top: 2px solid var(--ink);
      font-size: 18px;
      padding-top: 10px;
    }}
    ul {{ color: var(--muted); padding-left: 18px; }}
    footer {{
      margin-top: 28px;
      font-size: 13px;
      color: var(--muted);
    }}
    @media print {{
      body {{ background: white; }}
      .page {{ box-shadow: none; margin: 0; padding: 12px; }}
    }}
    @media (max-width: 640px) {{
      .page {{ padding: 20px 16px; }}
      .meta, .scope {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  <article class="page">
    <div class="tag">Estimate</div>
    <h1>{esc(biz['legalName'])}</h1>
    <p><strong>{esc(job['title'])}</strong></p>
    <div class="meta">
      <div>Prepared: {esc(job['preparedDate'])}</div>
      <div>Prepared for: {esc(job['clientName'])}</div>
      <div>Job site: {esc(job['jobSite'])}</div>
      <div>Contact: {esc(biz['contact'])} · {esc(biz['serviceArea'])}</div>
    </div>

    <h2>Scope</h2>
    <div class="scope">
      <div>House siding: <strong>{esc(job['sidingSf'])} sq ft</strong></div>
      <div>Window trims: <strong>{esc(job['windowTrims'])}</strong></div>
      <div>Chimney: <strong>{esc(job['chimneyHeightFt'])} ft</strong> height × {esc(job['chimneyWrapGirthFt'])} ft wrap = <strong>{job['chimneySf']:g} sq ft</strong></div>
      <div>Demo: <strong>one lump</strong> — siding + chimney + all 13 trims</div>
    </div>

    <h2>Pricing rules</h2>
    <p class="rules">
      Labor and dump fee: hard cost × (1 + {rates['profitMarginPercent']:g}% profit margin).
      Materials: hard cost × (1 + {rates['materialMarkupPercent']:g}% material markup)
      × (1 + {rates['profitMarginPercent']:g}% profit margin).
      Wizard labor reference: {format_usd(int(rates['laborHourlyCost'] * 100))}/hr.
      No line is quoted at raw cost.
    </p>

    <h2>Line items</h2>
    <table>
      <thead>
        <tr>
          <th>Section</th>
          <th>Description</th>
          <th>Type</th>
          <th class="num">Qty</th>
          <th class="num">Cost</th>
          <th class="num">Quoted</th>
        </tr>
      </thead>
      <tbody>
        {''.join(row_html)}
      </tbody>
    </table>

    <h2>Labor vs. material</h2>
    <table class="totals">
      <tr><td>Labor (quoted)</td><td class="num">{format_usd(totals['labor_quoted_cents'])}</td></tr>
      <tr><td>Materials (quoted)</td><td class="num">{format_usd(totals['material_quoted_cents'])}</td></tr>
      <tr><td>Dump / disposal (quoted)</td><td class="num">{format_usd(totals['fee_quoted_cents'])}</td></tr>
      <tr><td>Subtotal</td><td class="num">{format_usd(totals['subtotal_quoted_cents'])}</td></tr>
      <tr><td>Hard cost</td><td class="num">{format_usd(totals['subtotal_cost_cents'])}</td></tr>
      <tr><td>Margin included</td><td class="num">{format_usd(totals['profit_cents'])}</td></tr>
      <tr class="grand"><td><strong>Total</strong></td><td class="num"><strong>{format_usd(totals['total_cents'])}</strong></td></tr>
    </table>

    {survey_block}
    <h2>Notes</h2>
    <ul>{notes}</ul>
    <footer>This is an estimate, not a contract. Prices may change after site inspection.</footer>
  </article>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a Silva's Handyman estimate")
    parser.add_argument(
        "--pricing",
        default=str(ROOT / "wizard-pricing.json"),
        help="Wizard pricing JSON",
    )
    parser.add_argument(
        "--job",
        default=str(ROOT / "jobs" / "siding-demo-reinstall.json"),
        help="Job takeoff JSON",
    )
    args = parser.parse_args()

    pricing = load_json(Path(args.pricing))
    job = load_json(Path(args.job))
    if not job.get("preparedDate"):
        job["preparedDate"] = date.today().isoformat()

    lines = build_siding_demo_reinstall_lines(pricing, job)
    payload = estimate_payload(pricing, job, lines)
    totals = summarize(lines)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    stem = job["id"]
    (OUTPUT / f"{stem}.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    (OUTPUT / f"{stem}.md").write_text(render_markdown(payload, lines), encoding="utf-8")
    (OUTPUT / f"{stem}.html").write_text(render_html(payload, lines), encoding="utf-8")

    print(f"Wrote {OUTPUT / stem}.md")
    print(f"Wrote {OUTPUT / stem}.html")
    print(f"Wrote {OUTPUT / stem}.json")
    print(f"Labor quoted:    {format_usd(totals['labor_quoted_cents'])}")
    print(f"Materials quoted:{format_usd(totals['material_quoted_cents'])}")
    print(f"Fees quoted:     {format_usd(totals['fee_quoted_cents'])}")
    print(f"TOTAL:           {format_usd(totals['total_cents'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
