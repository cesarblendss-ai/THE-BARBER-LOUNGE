#!/usr/bin/env python3
"""Import Amex activity exports, classify buildout vs ops, refresh partnership workbook Buildout sheet."""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

STATEMENTS = Path(__file__).resolve().parents[1] / "statements"
OUT_XLSX = Path(__file__).resolve().parents[1] / "partnership-split-model.xlsx"
OUT_CLASSIFIED = Path(__file__).resolve().parents[1] / "amex-buildout-classified.xlsx"

thin = Border(
    left=Side(style="thin", color="CCCCCC"),
    right=Side(style="thin", color="CCCCCC"),
    top=Side(style="thin", color="CCCCCC"),
    bottom=Side(style="thin", color="CCCCCC"),
)
header_fill = PatternFill("solid", fgColor="1A1A1A")
header_font = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
title_font = Font(name="Calibri", bold=True, size=16)
section_font = Font(name="Calibri", bold=True, size=12)
input_fill = PatternFill("solid", fgColor="FFF3CD")
calc_fill = PatternFill("solid", fgColor="E8F4EA")
warn_fill = PatternFill("solid", fgColor="F8D7DA")
ok_fill = PatternFill("solid", fgColor="D1E7DD")
muted_fill = PatternFill("solid", fgColor="F5F5F5")
money = '"$"#,##0.00'


def load_transactions(paths: list[Path]) -> list[dict]:
    rows: list[dict] = []
    seen_refs: set[str] = set()
    for path in paths:
        wb = load_workbook(path, data_only=True)
        ws = wb["Transaction Details"]
        period = ws["B1"].value or path.name
        header = None
        for row in ws.iter_rows(values_only=True):
            if row[0] == "Date":
                header = row
                continue
            if not header or not row[0]:
                continue
            (
                date,
                _receipt,
                desc,
                member,
                _acct,
                amount,
                ext,
                _appears,
                _addr,
                _city,
                _zipc,
                _country,
                ref,
                cat,
            ) = row[:14]
            if amount is None:
                continue
            ref_s = str(ref or "").strip()
            # Dedupe exact statement duplicates across overlapping exports
            key = ref_s or f"{date}|{desc}|{amount}|{member}"
            if key in seen_refs:
                continue
            seen_refs.add(key)
            if hasattr(date, "isoformat"):
                date_s = date.isoformat()[:10]
            else:
                date_s = str(date)[:10]
            rows.append(
                {
                    "date": date_s,
                    "desc": (desc or "").strip(),
                    "member": (member or "").strip(),
                    "amount": float(amount),
                    "ext": (ext or "").strip(),
                    "amex_cat": (cat or "").strip(),
                    "ref": ref_s,
                    "source": path.name,
                    "period": str(period),
                }
            )
    rows.sort(key=lambda r: (r["date"], r["desc"]))
    return rows


def classify(r: dict) -> tuple[str, str, str, str]:
    """Return (bucket, category, buildout Yes/No/Review, note)."""
    d = r["desc"].upper()
    c = r["amex_cat"].upper()
    amt = r["amount"]

    # Card payments (not spend)
    if "MOBILE PAYMENT" in d or "ONLINE PAYMENT" in d or "AUTOPAY" in d:
        return "Ignore", "Card payment", "No", "Payment to Amex — not spend"

    # Personal / food / fuel / liquor
    personal_kw = [
        "DOORDASH",
        "UBER EATS",
        "IN-N-OUT",
        "ARACELYS",
        "SMOKE SHOP",
        "ARCO#",
        "7-ELEVEN",
        "GREAT PETROLEUM",
        "CIELO SUPERMARKET",
        "SUBWAY",
        "PANDA EXPRESS",
        "CHEVRON",
        "HILLCREST VALERO",
        "JOES LIQUOR",
        "WENDY",
        "JAMBA",
        "HONOR KITCHEN",
        "SAMS MARKET & LIQUOR",
        "WEST KETTLEMAN",  # gas-looking Lodi charge label
    ]
    if any(k in d for k in personal_kw):
        return "Personal", "Personal / non-shop", "No", "Personal"
    if "TRANSPORTATION-FUEL" in c or "RESTAURANT" in c:
        return "Personal", "Personal / non-shop", "No", "Food/fuel"
    if d.strip() == "UBER" or d.startswith("UBER "):
        return "Personal", "Personal / non-shop", "No", "Rideshare"
    if "CA DMV" in d or "STATE OF CALIF DMV" in d:
        return "Personal", "Personal / non-shop", "No", "DMV — confirm if shop vehicle"

    if "MEMBERSHIP FEE" in d:
        return "Ops", "Fees (Amex)", "No", "Amex annual fee — ops/overhead not buildout"

    # Ops / utilities
    if any(k in d for k in ["AT&T", "UVERSE", "PACIFIC GAS", "PG&E", "EZ PAY FEE PGE"]):
        return "Ops", "Ops / utilities", "No", "Utility"
    if "CONTRA COSTA WASTE" in d:
        return "Ops", "Ops / utilities", "No", "Waste — ops (or dumpster; confirm)"
    if "APPLE.COM/BILL" in d:
        return "Ops", "Ops / software", "No", "Subscription"

    # Buildout — construction / glass / contractor
    if "FNR CONSULT" in d or "FNR CONSU" in d:
        return "Buildout", "Construction / contractor / permits", "Yes", "FNR consulting / contractor"
    if "CONCORD G" in d or "CONCORD GLASS" in d:
        return "Buildout", "Plumbing / electrical / HVAC", "Yes", "Concord Glass — shop glass"
    if "OMNIHOME" in d:
        return "Buildout", "Waiting area / furniture", "Yes", "Omnihome — furniture/fixtures (confirm)"
    if "FLUOROLITE" in d:
        return "Buildout", "Signage / exterior / branding", "Yes", "Plastics / sign materials"
    if "NLJ TRADERS" in d:
        return "Buildout", "Other buildout", "Yes", "NLJ Traders — confirm item"
    if "IRONCLID" in d or "IRONCLAD" in d:
        return "Buildout", "Other buildout", "Review", "PayPal Ironclid — confirm"

    # Big box / materials
    if "GRANITE EXPO" in d:
        return "Buildout", "Flooring / paint / finishes", "Yes", "Granite Expo"
    if "HOME DEPOT" in d or "HOME DEPO" in d:
        return "Buildout", "Flooring / paint / finishes", "Yes", "Home Depot"
    if "LOWE" in d:
        return "Buildout", "Flooring / paint / finishes", "Yes", "Lowe's"
    if "ANTIOCH ACE" in d or "ACE HARDWARE" in d:
        return "Buildout", "Flooring / paint / finishes", "Yes", "Ace Hardware"
    if "AUTOZONE" in d:
        return "Personal", "Personal / non-shop", "No", "Autozone — likely personal"

    # Furniture / decor
    if "HOBBY LOBBY" in d or "HOMEGOODS" in d or "DD'S DISCOUNTS" in d:
        return "Buildout", "Waiting area / furniture", "Yes", "Decor / waiting area"
    if "CANVA" in d or "FEDEX OFFICE" in d:
        return "Buildout", "Signage / exterior / branding", "Yes", "Branding / print"
    if "APPLE STORE" in d or "BEST BUY" in d:
        return "Buildout", "POS / computers / cameras / WiFi", "Yes", "Electronics / POS"

    # Opening inventory / beauty supply
    if any(
        k in d
        for k in [
            "MINERVA",
            "WAL-MART",
            "WALMART",
            "TARGET",
            "SAM'S CLUB",
            "SAMS CLUB",
            "ULTA",
            "SALONCENTRIC",
        ]
    ):
        return "Buildout", "Opening supplies / inventory", "Yes", "Opening supplies / beauty"
    if "UIBARBOSA" in d or "LEMSQZY" in d:
        return "Buildout", "Opening supplies / inventory", "Review", "Vendor — confirm"

    if "AMAZON" in d:
        return "Buildout", "Other buildout", "Yes", "Amazon — mostly shop setup (spot-check)"

    if amt != 0:
        return "Buildout", "Other buildout", "Review", "Unclassified — Cesar confirm"
    return "Ignore", "Other", "No", "Zero"


def style_header(ws, row, start, end):
    for col in range(start, end + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", wrap_text=True, vertical="center")
        cell.border = thin


def write_classified_workbook(rows: list[dict]) -> dict:
    for r in rows:
        bucket, category, buildout, note = classify(r)
        r["bucket"] = bucket
        r["category"] = category
        r["buildout"] = buildout
        r["note"] = note

    wb = Workbook()

    # ---- Summary ----
    ws = wb.active
    ws.title = "BuildoutSummary"
    ws.sheet_view.showGridLines = False
    ws["A1"] = "The Barber Lounge — Amex spend (first ~3 statement periods)"
    ws["A1"].font = title_font
    ws.merge_cells("A1:D1")
    ws["A2"] = (
        "Source: Business Platinum ending 21008 (Cesar + Alexis cards). "
        "Card payments ignored. Classification is best-effort from merchant names — Review rows need your eyes."
    )
    ws["A2"].alignment = Alignment(wrap_text=True)
    ws.merge_cells("A2:D2")
    ws.row_dimensions[2].height = 40

    buildout_rows = [r for r in rows if r["buildout"] == "Yes"]
    review_rows = [r for r in rows if r["buildout"] == "Review"]
    ops_rows = [r for r in rows if r["bucket"] == "Ops"]
    personal_rows = [r for r in rows if r["bucket"] == "Personal"]
    # Generous = Yes + Review (likely still shop)
    generous_rows = [r for r in rows if r["buildout"] in ("Yes", "Review")]

    def money_cell(cell, value, fill=calc_fill):
        cell.value = value
        cell.number_format = money
        cell.fill = fill
        cell.border = thin

    ws["A4"] = "HEADLINE TOTALS"
    ws["A4"].font = section_font
    for i, h in enumerate(["Metric", "Amount", "Notes"], 1):
        ws.cell(row=5, column=i, value=h)
    style_header(ws, 5, 1, 3)

    metrics = [
        (
            "BUILDOUT (confident Yes)",
            sum(r["amount"] for r in buildout_rows),
            "Merchant clearly shop build/setup",
            warn_fill,
        ),
        (
            "BUILDOUT + Review (generous)",
            sum(r["amount"] for r in generous_rows),
            "Includes Review rows still likely shop",
            warn_fill,
        ),
        (
            "Ops / utilities / fees",
            sum(r["amount"] for r in ops_rows),
            "AT&T, PG&E, waste, Amex fee, software",
            muted_fill,
        ),
        (
            "Personal (food/fuel/etc.)",
            sum(r["amount"] for r in personal_rows),
            "Not shop — exclude from partnership capital",
            muted_fill,
        ),
        (
            "Review rows only",
            sum(r["amount"] for r in review_rows),
            "Confirm these with Cesar",
            input_fill,
        ),
    ]
    for i, (lab, val, note, fill) in enumerate(metrics, 6):
        ws.cell(row=i, column=1, value=lab).border = thin
        money_cell(ws.cell(row=i, column=2), round(val, 2), fill)
        ws.cell(row=i, column=3, value=note).border = thin

    # By category (Yes only)
    ws["A12"] = "BUILDOUT BY CATEGORY (Yes only)"
    ws["A12"].font = section_font
    for i, h in enumerate(["Category", "Amount"], 1):
        ws.cell(row=13, column=i, value=h)
    style_header(ws, 13, 1, 2)
    by_cat = defaultdict(float)
    for r in buildout_rows:
        by_cat[r["category"]] += r["amount"]
    for i, (cat, val) in enumerate(sorted(by_cat.items(), key=lambda x: -abs(x[1])), 14):
        ws.cell(row=i, column=1, value=cat).border = thin
        money_cell(ws.cell(row=i, column=2), round(val, 2))

    # By card member (Yes)
    ws["D12"] = "BUILDOUT BY CARD MEMBER (Yes)"
    ws["D12"].font = section_font
    for i, h in enumerate(["Card member", "Amount"], 4):
        ws.cell(row=13, column=i, value=h)
    style_header(ws, 13, 4, 5)
    by_mem = defaultdict(float)
    for r in buildout_rows:
        by_mem[r["member"] or "Unknown"] += r["amount"]
    for i, (mem, val) in enumerate(sorted(by_mem.items(), key=lambda x: -abs(x[1])), 14):
        ws.cell(row=i, column=4, value=mem).border = thin
        money_cell(ws.cell(row=i, column=5), round(val, 2))

    ws["A26"] = "vs $60k capital story"
    ws["A26"].font = section_font
    ws["A27"] = (
        "Confident Amex buildout above is only what hit THIS Amex. "
        "Lease deposits, cash, other cards, Venmo to contractors, and pre-Jan spend may be missing. "
        "Compare the Yes total to Cesar $45k + Omi $15k — gap = other funding sources still to log."
    )
    ws["A27"].alignment = Alignment(wrap_text=True)
    ws.merge_cells("A27:E27")
    ws.row_dimensions[27].height = 55

    ws.column_dimensions["A"].width = 42
    ws.column_dimensions["B"].width = 14
    ws.column_dimensions["C"].width = 48
    ws.column_dimensions["D"].width = 18
    ws.column_dimensions["E"].width = 14

    # ---- All lines ----
    detail = wb.create_sheet("AllLines")
    headers = [
        "Date",
        "Amount",
        "Bucket",
        "Buildout?",
        "Category",
        "Card member",
        "Description",
        "Note",
        "Amex category",
        "Source file",
        "Reference",
    ]
    for i, h in enumerate(headers, 1):
        detail.cell(row=1, column=i, value=h)
    style_header(detail, 1, 1, len(headers))
    for ri, r in enumerate(rows, 2):
        vals = [
            r["date"],
            r["amount"],
            r["bucket"],
            r["buildout"],
            r["category"],
            r["member"],
            r["desc"],
            r["note"],
            r["amex_cat"],
            r["source"],
            r["ref"],
        ]
        for ci, v in enumerate(vals, 1):
            cell = detail.cell(row=ri, column=ci, value=v)
            cell.border = thin
            if ci == 2:
                cell.number_format = money
        if r["buildout"] == "Yes":
            detail.cell(row=ri, column=4).fill = ok_fill
        elif r["buildout"] == "Review":
            detail.cell(row=ri, column=4).fill = input_fill
        elif r["bucket"] == "Ops":
            detail.cell(row=ri, column=3).fill = muted_fill
            detail.cell(row=ri, column=4).fill = muted_fill
        elif r["bucket"] == "Personal":
            detail.cell(row=ri, column=3).fill = muted_fill
        elif r["bucket"] == "Ignore":
            for ci in range(1, 12):
                detail.cell(row=ri, column=ci).fill = PatternFill("solid", fgColor="EEEEEE")

    detail.auto_filter.ref = f"A1:K{len(rows)+1}"
    detail.freeze_panes = "A2"
    widths = [12, 12, 10, 10, 36, 16, 48, 36, 36, 28, 18]
    for i, w in enumerate(widths, 1):
        detail.column_dimensions[get_column_letter(i)].width = w

    # Buildout-only sheet
    bo = wb.create_sheet("BuildoutOnly")
    for i, h in enumerate(headers, 1):
        bo.cell(row=1, column=i, value=h)
    style_header(bo, 1, 1, len(headers))
    ri = 2
    for r in rows:
        if r["buildout"] not in ("Yes", "Review"):
            continue
        vals = [
            r["date"],
            r["amount"],
            r["bucket"],
            r["buildout"],
            r["category"],
            r["member"],
            r["desc"],
            r["note"],
            r["amex_cat"],
            r["source"],
            r["ref"],
        ]
        for ci, v in enumerate(vals, 1):
            cell = bo.cell(row=ri, column=ci, value=v)
            cell.border = thin
            if ci == 2:
                cell.number_format = money
            if r["buildout"] == "Review":
                cell.fill = input_fill
            else:
                cell.fill = ok_fill
        ri += 1
    bo.auto_filter.ref = f"A1:K{ri-1}"
    bo.freeze_panes = "A2"
    for i, w in enumerate(widths, 1):
        bo.column_dimensions[get_column_letter(i)].width = w

    wb.save(OUT_CLASSIFIED)

    summary = {
        "n": len(rows),
        "buildout_yes": round(sum(r["amount"] for r in buildout_rows), 2),
        "buildout_generous": round(sum(r["amount"] for r in generous_rows), 2),
        "ops": round(sum(r["amount"] for r in ops_rows), 2),
        "personal": round(sum(r["amount"] for r in personal_rows), 2),
        "review": round(sum(r["amount"] for r in review_rows), 2),
        "by_cat": {k: round(v, 2) for k, v in sorted(by_cat.items(), key=lambda x: -abs(x[1]))},
        "by_mem": {k: round(v, 2) for k, v in sorted(by_mem.items(), key=lambda x: -abs(x[1]))},
        "date_min": rows[0]["date"] if rows else None,
        "date_max": rows[-1]["date"] if rows else None,
        "sources": sorted({r["source"] for r in rows}),
    }
    return summary, rows


def patch_partnership_buildout(rows: list[dict], summary: dict) -> None:
    """Replace Buildout sheet data in partnership-split-model.xlsx if present."""
    if not OUT_XLSX.exists():
        return
    # Rebuild partnership model then overwrite Buildout with live data via openpyxl
    from importlib.util import module_from_spec, spec_from_file_location

    builder = Path(__file__).resolve().parents[1] / "build_partnership_workbook.py"
    if builder.exists():
        spec = spec_from_file_location("build_partnership_workbook", builder)
        mod = module_from_spec(spec)
        assert spec.loader
        spec.loader.exec_module(mod)
        mod.build()

    wb = load_workbook(OUT_XLSX)
    if "Buildout" in wb.sheetnames:
        del wb["Buildout"]
    bd = wb.create_sheet("Buildout", 1)  # after Readme
    bd.sheet_view.showGridLines = False
    bd["A1"] = "Shop buildout from Amex (imported)"
    bd["A1"].font = title_font
    bd.merge_cells("A1:H1")
    bd["A2"] = (
        f"Period {summary['date_min']} → {summary['date_max']}. "
        f"Confident buildout ${summary['buildout_yes']:,.2f}. "
        f"With Review rows ${summary['buildout_generous']:,.2f}. "
        "Full line detail also in finance/amex-buildout-classified.xlsx"
    )
    bd["A2"].alignment = Alignment(wrap_text=True)
    bd.merge_cells("A2:H2")
    bd.row_dimensions[2].height = 40

    bd["A4"] = "TOTALS"
    bd["A4"].font = section_font
    for i, h in enumerate(["Metric", "Amount"], 1):
        bd.cell(row=5, column=i, value=h)
    style_header(bd, 5, 1, 2)
    vals = [
        ("BUILDOUT confident (Yes)", summary["buildout_yes"], warn_fill),
        ("BUILDOUT + Review", summary["buildout_generous"], warn_fill),
        ("Ops / utilities / fees", summary["ops"], muted_fill),
        ("Personal excluded", summary["personal"], muted_fill),
    ]
    for i, (lab, val, fill) in enumerate(vals, 6):
        bd.cell(row=i, column=1, value=lab).border = thin
        cell = bd.cell(row=i, column=2, value=val)
        cell.number_format = money
        cell.fill = fill
        cell.border = thin

    bd["D4"] = "BY CATEGORY (Yes)"
    bd["D4"].font = section_font
    for i, h in enumerate(["Category", "Amount"], 4):
        bd.cell(row=5, column=i, value=h)
    style_header(bd, 5, 4, 5)
    for i, (cat, val) in enumerate(summary["by_cat"].items(), 6):
        bd.cell(row=i, column=4, value=cat).border = thin
        cell = bd.cell(row=i, column=5, value=val)
        cell.number_format = money
        cell.fill = calc_fill
        cell.border = thin

    headers = [
        "Date",
        "Card member",
        "Description",
        "Amount",
        "Category",
        "Buildout?",
        "Paid by",
        "Notes",
    ]
    bd["A12"] = "STATEMENT LINES (Yes + Review only)"
    bd["A12"].font = section_font
    for i, h in enumerate(headers, 1):
        bd.cell(row=13, column=i, value=h)
    style_header(bd, 13, 1, 8)

    ri = 14
    for r in rows:
        if r["buildout"] not in ("Yes", "Review"):
            continue
        paid = "Cesar" if "CESAR" in r["member"].upper() else (
            "Alexis" if "ALEXIS" in r["member"].upper() else r["member"]
        )
        vals = [
            r["date"],
            r["member"],
            r["desc"][:80],
            r["amount"],
            r["category"],
            r["buildout"],
            paid,
            r["note"],
        ]
        for ci, v in enumerate(vals, 1):
            cell = bd.cell(row=ri, column=ci, value=v)
            cell.border = thin
            cell.fill = input_fill if r["buildout"] == "Review" else ok_fill
            if ci == 4:
                cell.number_format = money
        ri += 1

    bd.freeze_panes = "A14"
    for i, w in enumerate([12, 16, 48, 12, 36, 12, 12, 36], 1):
        bd.column_dimensions[get_column_letter(i)].width = w

    # Move Readme first if needed
    if "Readme" in wb.sheetnames:
        wb.move_sheet("Readme", offset=-len(wb.sheetnames))
    wb.save(OUT_XLSX)


def main():
    paths = sorted(STATEMENTS.glob("amex-activity*.xlsx"))
    # Drop duplicate identical file if present
    unique = []
    fingerprints = set()
    for p in paths:
        wb = load_workbook(p, data_only=True)
        ws = wb["Transaction Details"]
        fp = (ws["B1"].value, ws.max_row)
        if fp in fingerprints:
            print(f"Skipping duplicate period file: {p.name} ({fp})")
            continue
        fingerprints.add(fp)
        unique.append(p)
    print("Using:", [p.name for p in unique])
    rows = load_transactions(unique)
    summary, rows = write_classified_workbook(rows)
    patch_partnership_buildout(rows, summary)
    print("Wrote", OUT_CLASSIFIED)
    print("Updated", OUT_XLSX)
    print(summary)


if __name__ == "__main__":
    main()
