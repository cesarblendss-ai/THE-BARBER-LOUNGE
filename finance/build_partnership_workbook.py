#!/usr/bin/env python3
"""Build The Barber Lounge partnership capital / expense true-up workbook."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).with_name("partnership-split-model.xlsx")

# --- styles ---
thin = Border(
    left=Side(style="thin", color="CCCCCC"),
    right=Side(style="thin", color="CCCCCC"),
    top=Side(style="thin", color="CCCCCC"),
    bottom=Side(style="thin", color="CCCCCC"),
)
header_fill = PatternFill("solid", fgColor="1A1A1A")
header_font = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
title_font = Font(name="Calibri", bold=True, size=16, color="1A1A1A")
section_font = Font(name="Calibri", bold=True, size=12, color="1A1A1A")
label_font = Font(name="Calibri", size=11)
input_fill = PatternFill("solid", fgColor="FFF3CD")  # editable yellow
calc_fill = PatternFill("solid", fgColor="E8F4EA")  # calculated green
warn_fill = PatternFill("solid", fgColor="F8D7DA")
ok_fill = PatternFill("solid", fgColor="D1E7DD")
muted_fill = PatternFill("solid", fgColor="F5F5F5")
blue_fill = PatternFill("solid", fgColor="D6EAF8")
money = '"$"#,##0.00'
pct = "0%"
number = "0.00"


def style_header_row(ws, row, start_col, end_col):
    for col in range(start_col, end_col + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", wrap_text=True, vertical="center")
        cell.border = thin


def money_cell(cell, formula=None, value=None, editable=False):
    if formula is not None:
        cell.value = formula
    elif value is not None:
        cell.value = value
    cell.number_format = money
    cell.border = thin
    cell.fill = input_fill if editable else calc_fill
    cell.alignment = Alignment(horizontal="right")


def label(cell, text, bold=False):
    cell.value = text
    cell.font = Font(name="Calibri", bold=bold, size=11)
    cell.alignment = Alignment(vertical="center", wrap_text=True)


def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


def build():
    wb = Workbook()

    # ========== SUMMARY ==========
    ws = wb.active
    ws.title = "Summary"
    ws.sheet_view.showGridLines = False

    ws["A1"] = "The Barber Lounge — Partnership Economics"
    ws["A1"].font = title_font
    ws.merge_cells("A1:F1")

    ws["A2"] = (
        "Ownership locked to capital: Cesar 75% / Omi 25% ($45k / $15k). "
        "YourMoney shows how much of YOUR revenue share paid rent and expenses."
    )
    ws["A2"].font = Font(name="Calibri", italic=True, size=10, color="555555")
    ws.merge_cells("A2:F2")
    ws.row_dimensions[2].height = 36

    ws["A4"] = "HOW TO USE"
    ws["A4"].font = section_font
    ws["A5"] = (
        "Yellow cells are editable inputs. Green cells are calculated. "
        "Update Assumptions, then fill Monthly Tracker with real months. "
        "True-Up shows what Partner owes Cesar under a fair ownership split."
    )
    ws["A5"].alignment = Alignment(wrap_text=True)
    ws.merge_cells("A5:F5")
    ws.row_dimensions[5].height = 48

    # Snapshot from Assumptions
    ws["A7"] = "OWNERSHIP SNAPSHOT"
    ws["A7"].font = section_font

    headers = ["", "Cesar (You)", "Partner", "Total / Note"]
    for i, h in enumerate(headers, 1):
        ws.cell(row=8, column=i, value=h)
    style_header_row(ws, 8, 1, 4)

    rows = [
        ("Ownership %", "=Assumptions!B5", "=Assumptions!C5", "Must equal 100%"),
        ("Startup capital put in", "=Assumptions!B6", "=Assumptions!C6", "=Assumptions!D6"),
        ("% of capital funded", "=Assumptions!B7", "=Assumptions!C7", "Should match ownership"),
        ("Share of expenses they SHOULD pay", "=Assumptions!B5", "=Assumptions!C5", "By ownership"),
        ("Share of expenses they ACTUALLY fund (current)", "=Assumptions!B12", "=Assumptions!C12", "Current practice"),
    ]
    for r, (lab, a, b, c) in enumerate(rows, 9):
        label(ws.cell(row=r, column=1), lab)
        ws.cell(row=r, column=1).border = thin
        for col, val in enumerate([a, b, c], 2):
            cell = ws.cell(row=r, column=col, value=val)
            cell.border = thin
            cell.fill = calc_fill
            if r in (9, 11, 12, 13):
                cell.number_format = pct
            elif r == 10:
                cell.number_format = money
            if col == 4 and r != 10:
                cell.number_format = "@"
                cell.fill = muted_fill

    ws["A15"] = "THE PROBLEM (plain English)"
    ws["A15"].font = section_font
    ws["A16"] = (
        "1) Capital + ownership: Cesar $45,000 (75%) / Omi $15,000 (25%) = $60,000.\n"
        "2) Rent + expenses come out of the shop bank account first (recently always).\n"
        "3) Profit draws (when leftover exists) follow 75/25.\n"
        "4) At break-even, leftover = $0 so draws = $0 — but revenue still paid the bills.\n"
        "5) 'How much of my revenue went to rent/expenses?' = your 75% ownership share of whatever "
        "revenue was used to cover bills (at break-even ≈ 75% of total expenses).\n"
        "6) Omi should fund 25% of the monthly burn going forward (~$625/mo at current rent/ops)."
    )
    ws["A16"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells("A16:F16")
    ws.row_dimensions[16].height = 110

    ws["A18"] = "BOTTOM-LINE NUMBERS (from Monthly Tracker)"
    ws["A18"].font = section_font

    for i, h in enumerate(["Metric", "Amount", "Meaning"], 1):
        ws.cell(row=19, column=i, value=h)
    style_header_row(ws, 19, 1, 3)

    metrics = [
        ("Total revenue logged", "=MonthlyTracker!B37", "All months entered"),
        ("Total expenses logged (rent + ops)", "=MonthlyTracker!B38", "Paid from joint account"),
        ("Total leftover / 'profit' logged", "=MonthlyTracker!B39", "After expenses"),
        ("Cesar capital in (startup)", "=Assumptions!B6", "Your $45k"),
        ("Omi capital in (startup)", "=Assumptions!C6", "His $15k"),
        ("Expense true-up Omi → Cesar", "=TrueUp!B12", "If he underfunded his 25%"),
        ("Extra profit Omi took vs 25%", "=TrueUp!B18", "If past draws exceeded ownership"),
        ("TOTAL Omi owes Cesar (suggested)", "=TrueUp!B20", "True-up total"),
        ("YOUR revenue that paid rent/ops", "=YourMoney!B16", "75% of revenue applied to bills"),
    ]
    for r, (lab, formula, meaning) in enumerate(metrics, 20):
        label(ws.cell(row=r, column=1), lab)
        ws.cell(row=r, column=1).border = thin
        money_cell(ws.cell(row=r, column=2), formula=formula)
        label(ws.cell(row=r, column=3), meaning)
        ws.cell(row=r, column=3).border = thin
        ws.cell(row=r, column=3).fill = muted_fill
        if r in (25, 26, 27, 28):
            ws.cell(row=r, column=2).fill = warn_fill

    ws["A30"] = "RECOMMENDATION (for the conversation)"
    ws["A30"].font = section_font
    ws["A31"] = (
        "Ownership = capital = 75/25. Expenses and profit draws follow that.\n\n"
        "Going forward: Omi transfers 25% of rent+ops into the shop account each month "
        "(~$625 at $2,500 burn). Cesar covers 75% (~$1,875).\n"
        "If the account is already funded by revenue, you are not 'paying half' — you are applying "
        "75% of shop revenue to bills. Track that on YourMoney.\n"
        "Only go 50/50 on expenses if ownership becomes 50/50 via buy-up."
    )
    ws["A31"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells("A31:F31")
    ws.row_dimensions[31].height = 110

    ws["A33"] = "Legend:"
    ws["B33"] = "Editable input"
    ws["B33"].fill = input_fill
    ws["C33"] = "Calculated"
    ws["C33"].fill = calc_fill
    ws["D33"] = "Money Partner likely owes / your revenue to bills"
    ws["D33"].fill = warn_fill

    set_widths(ws, [48, 18, 18, 42, 14, 14])

    # ========== ASSUMPTIONS ==========
    wa = wb.create_sheet("Assumptions")
    wa.sheet_view.showGridLines = False
    wa["A1"] = "Assumptions (edit yellow cells)"
    wa["A1"].font = title_font
    wa.merge_cells("A1:D1")

    wa["A3"] = "OWNERSHIP & STARTUP CAPITAL"
    wa["A3"].font = section_font
    for i, h in enumerate(["", "Cesar", "Partner", "Total"], 1):
        wa.cell(row=4, column=i, value=h)
    style_header_row(wa, 4, 1, 4)

    label(wa["A5"], "Ownership %", True)
    money_cell(wa["B5"], value=0.75, editable=True)
    wa["B5"].number_format = pct
    money_cell(wa["C5"], value=0.25, editable=True)
    wa["C5"].number_format = pct
    wa["D5"] = "=B5+C5"
    wa["D5"].number_format = pct
    wa["D5"].fill = calc_fill
    wa["D5"].border = thin

    label(wa["A6"], "Startup capital contributed ($)", True)
    money_cell(wa["B6"], value=45000, editable=True)
    money_cell(wa["C6"], value=15000, editable=True)
    money_cell(wa["D6"], formula="=B6+C6")

    label(wa["A7"], "% of capital funded")
    wa["B7"] = '=IF(D6=0,0,B6/D6)'
    wa["C7"] = '=IF(D6=0,0,C6/D6)'
    wa["D7"] = 1
    for col in ("B", "C", "D"):
        wa[f"{col}7"].number_format = pct
        wa[f"{col}7"].fill = calc_fill
        wa[f"{col}7"].border = thin

    wa["A9"] = "CURRENT (BROKEN) PRACTICE"
    wa["A9"].font = section_font
    wa["A10"] = (
        "Expenses paid from joint account in proportion to who funded the account (default = ownership). "
        "Profit leftover was split at the rates below (default 50/50)."
    )
    wa["A10"].alignment = Alignment(wrap_text=True)
    wa.merge_cells("A10:D10")
    wa.row_dimensions[10].height = 36

    for i, h in enumerate(["", "Cesar", "Partner", "Total"], 1):
        wa.cell(row=11, column=i, value=h)
    style_header_row(wa, 11, 1, 4)

    label(wa["A12"], "Who actually funds expenses today", True)
    money_cell(wa["B12"], value=0.75, editable=True)
    wa["B12"].number_format = pct
    money_cell(wa["C12"], value=0.25, editable=True)
    wa["C12"].number_format = pct
    wa["D12"] = "=B12+C12"
    wa["D12"].number_format = pct
    wa["D12"].fill = calc_fill
    wa["D12"].border = thin

    label(wa["A13"], "How leftover profit was split", True)
    money_cell(wa["B13"], value=0.75, editable=True)
    wa["B13"].number_format = pct
    money_cell(wa["C13"], value=0.25, editable=True)
    wa["C13"].number_format = pct
    wa["D13"] = "=B13+C13"
    wa["D13"].number_format = pct
    wa["D13"].fill = calc_fill
    wa["D13"].border = thin

    wa["A15"] = "FAIR RULE (target)"
    wa["A15"].font = section_font
    for i, h in enumerate(["", "Cesar", "Partner", "Total"], 1):
        wa.cell(row=16, column=i, value=h)
    style_header_row(wa, 16, 1, 4)

    label(wa["A17"], "Fair expense split (= ownership)", True)
    wa["B17"] = "=B5"
    wa["C17"] = "=C5"
    wa["D17"] = "=B17+C17"
    for col in ("B", "C", "D"):
        wa[f"{col}17"].number_format = pct
        wa[f"{col}17"].fill = calc_fill
        wa[f"{col}17"].border = thin

    label(wa["A18"], "Fair profit split (= ownership)", True)
    wa["B18"] = "=B5"
    wa["C18"] = "=C5"
    wa["D18"] = "=B18+C18"
    for col in ("B", "C", "D"):
        wa[f"{col}18"].number_format = pct
        wa[f"{col}18"].fill = calc_fill
        wa[f"{col}18"].border = thin

    wa["A20"] = "OPTIONAL: monthly rent / baseline ops (for Scenario examples)"
    wa["A20"].font = section_font
    label(wa["A21"], "Example monthly rent")
    money_cell(wa["B21"], value=1700, editable=True)
    label(wa["A22"], "Example other monthly expenses")
    money_cell(wa["B22"], value=800, editable=True)
    label(wa["A23"], "Example monthly revenue (break-even case)")
    money_cell(wa["B23"], value=2500, editable=True)
    label(wa["A24"], "Example monthly revenue (profit case)")
    money_cell(wa["B24"], value=5000, editable=True)
    label(wa["A25"], "Months open (for quick estimate)")
    money_cell(wa["B25"], value=6, editable=True)
    wa["B25"].number_format = "0"

    wa["A27"] = "Notes"
    wa["A27"].font = section_font
    wa["A28"] = (
        "• Ownership = capital = Cesar 75% / Omi 25% ($45k / $15k of $60k).\n"
        "• Expense funding and profit draws both follow 75/25.\n"
        "• YourMoney answers: how much of Cesar's revenue share paid rent/expenses.\n"
        "• This workbook is a negotiation tool, not legal advice. Put the final deal in writing."
    )
    wa["A28"].alignment = Alignment(wrap_text=True)
    wa.merge_cells("A28:D28")
    wa.row_dimensions[28].height = 70

    set_widths(wa, [46, 16, 16, 14])

    # ========== SCENARIOS ==========
    ws2 = wb.create_sheet("Scenarios")
    ws2.sheet_view.showGridLines = False
    ws2["A1"] = "Side-by-side: one month under current vs fair rules"
    ws2["A1"].font = title_font
    ws2.merge_cells("A1:G1")

    ws2["A3"] = "BREAK-EVEN MONTH (uses Assumptions example revenue/expenses)"
    ws2["A3"].font = section_font

    for i, h in enumerate(
        ["", "Current practice", "Fair 80/20", "Difference (Fair − Current for Cesar)"], 1
    ):
        ws2.cell(row=4, column=i, value=h)
    style_header_row(ws2, 4, 1, 4)

    # Revenue / expenses
    label(ws2["A5"], "Revenue")
    money_cell(ws2["B5"], formula="=Assumptions!B23")
    money_cell(ws2["C5"], formula="=Assumptions!B23")
    money_cell(ws2["D5"], formula="=C5-B5")

    label(ws2["A6"], "Rent + expenses")
    money_cell(ws2["B6"], formula="=Assumptions!B21+Assumptions!B22")
    money_cell(ws2["C6"], formula="=Assumptions!B21+Assumptions!B22")
    money_cell(ws2["D6"], formula="=C6-B6")

    label(ws2["A7"], "Leftover after expenses", True)
    money_cell(ws2["B7"], formula="=B5-B6")
    money_cell(ws2["C7"], formula="=C5-C6")
    money_cell(ws2["D7"], formula="=C7-B7")

    label(ws2["A8"], "Cesar's share of leftover")
    money_cell(ws2["B8"], formula="=IF(B7>0,B7*Assumptions!B13,0)")
    money_cell(ws2["C8"], formula="=IF(C7>0,C7*Assumptions!B18,0)")
    money_cell(ws2["D8"], formula="=C8-B8")

    label(ws2["A9"], "Partner's share of leftover")
    money_cell(ws2["B9"], formula="=IF(B7>0,B7*Assumptions!C13,0)")
    money_cell(ws2["C9"], formula="=IF(C7>0,C7*Assumptions!C18,0)")
    money_cell(ws2["D9"], formula="=C9-B9")

    label(ws2["A10"], "Cesar economic cost of expenses (funded share)", True)
    money_cell(ws2["B10"], formula="=B6*Assumptions!B12")
    money_cell(ws2["C10"], formula="=C6*Assumptions!B17")
    money_cell(ws2["D10"], formula="=C10-B10")

    label(ws2["A11"], "Partner economic cost of expenses (funded share)", True)
    money_cell(ws2["B11"], formula="=B6*Assumptions!C12")
    money_cell(ws2["C11"], formula="=C6*Assumptions!C17")
    money_cell(ws2["D11"], formula="=C11-B11")

    label(ws2["A12"], "Cesar net this month (leftover share − expense cost)")
    money_cell(ws2["B12"], formula="=B8-B10")
    money_cell(ws2["C12"], formula="=C8-C10")
    money_cell(ws2["D12"], formula="=C12-B12")
    ws2["B12"].fill = warn_fill
    ws2["C12"].fill = ok_fill

    label(ws2["A13"], "Partner net this month")
    money_cell(ws2["B13"], formula="=B9-B11")
    money_cell(ws2["C13"], formula="=C9-C11")
    money_cell(ws2["D13"], formula="=C13-B13")

    ws2["A15"] = "PROFIT MONTH"
    ws2["A15"].font = section_font
    for i, h in enumerate(
        ["", "Current practice", "Fair 80/20", "Difference (Fair − Current for Cesar)"], 1
    ):
        ws2.cell(row=16, column=i, value=h)
    style_header_row(ws2, 16, 1, 4)

    label(ws2["A17"], "Revenue")
    money_cell(ws2["B17"], formula="=Assumptions!B24")
    money_cell(ws2["C17"], formula="=Assumptions!B24")
    money_cell(ws2["D17"], formula="=C17-B17")

    label(ws2["A18"], "Rent + expenses")
    money_cell(ws2["B18"], formula="=Assumptions!B21+Assumptions!B22")
    money_cell(ws2["C18"], formula="=Assumptions!B21+Assumptions!B22")
    money_cell(ws2["D18"], formula="=C18-B18")

    label(ws2["A19"], "Leftover after expenses", True)
    money_cell(ws2["B19"], formula="=B17-B18")
    money_cell(ws2["C19"], formula="=C17-C18")
    money_cell(ws2["D19"], formula="=C19-B19")

    label(ws2["A20"], "Cesar's share of leftover")
    money_cell(ws2["B20"], formula="=IF(B19>0,B19*Assumptions!B13,0)")
    money_cell(ws2["C20"], formula="=IF(C19>0,C19*Assumptions!B18,0)")
    money_cell(ws2["D20"], formula="=C20-B20")

    label(ws2["A21"], "Partner's share of leftover")
    money_cell(ws2["B21"], formula="=IF(B19>0,B19*Assumptions!C13,0)")
    money_cell(ws2["C21"], formula="=IF(C19>0,C19*Assumptions!C18,0)")
    money_cell(ws2["D21"], formula="=C21-B21")

    label(ws2["A22"], "Cesar economic cost of expenses")
    money_cell(ws2["B22"], formula="=B18*Assumptions!B12")
    money_cell(ws2["C22"], formula="=C18*Assumptions!B17")
    money_cell(ws2["D22"], formula="=C22-B22")

    label(ws2["A23"], "Partner economic cost of expenses")
    money_cell(ws2["B23"], formula="=B18*Assumptions!C12")
    money_cell(ws2["C23"], formula="=C18*Assumptions!C17")
    money_cell(ws2["D23"], formula="=C23-B23")

    label(ws2["A24"], "Cesar net this month")
    money_cell(ws2["B24"], formula="=B20-B22")
    money_cell(ws2["C24"], formula="=C20-C22")
    money_cell(ws2["D24"], formula="=C24-B24")
    ws2["B24"].fill = warn_fill
    ws2["C24"].fill = ok_fill

    label(ws2["A25"], "Partner net this month")
    money_cell(ws2["B25"], formula="=B21-B23")
    money_cell(ws2["C25"], formula="=C21-C23")
    money_cell(ws2["D25"], formula="=C25-B25")

    ws2["A27"] = "Buy-up to 50/50 (if Partner wants equal splits)"
    ws2["A27"].font = section_font
    label(ws2["A28"], "Total startup capital")
    money_cell(ws2["B28"], formula="=Assumptions!D6")
    label(ws2["A29"], "50% of capital")
    money_cell(ws2["B29"], formula="=B28*0.5")
    label(ws2["A30"], "Partner already put in")
    money_cell(ws2["B30"], formula="=Assumptions!C6")
    label(ws2["A31"], "Cash Partner must add to reach 50%", True)
    money_cell(ws2["B31"], formula="=MAX(0,B29-B30)")
    ws2["B31"].fill = warn_fill
    ws2["A32"] = (
        "If they pay that buy-up (and agree expenses + profits go 50/50 from then on), "
        "equal splits are fair. Until then, 50/50 profit while you carry 80% of capital is the imbalance."
    )
    ws2["A32"].alignment = Alignment(wrap_text=True)
    ws2.merge_cells("A32:D32")
    ws2.row_dimensions[32].height = 40

    # Chart data
    ws2["F4"] = "Break-even net"
    ws2["F5"] = "Cesar current"
    ws2["G5"] = "=B12"
    ws2["F6"] = "Partner current"
    ws2["G6"] = "=B13"
    ws2["F7"] = "Cesar fair"
    ws2["G7"] = "=C12"
    ws2["F8"] = "Partner fair"
    ws2["G8"] = "=C13"
    for r in range(5, 9):
        ws2.cell(row=r, column=7).number_format = money

    chart = BarChart()
    chart.type = "col"
    chart.title = "Break-even month: net economic result"
    chart.y_axis.title = "Net $"
    data = Reference(ws2, min_col=7, min_row=4, max_row=8)
    cats = Reference(ws2, min_col=6, min_row=5, max_row=8)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.shape = 4
    chart.style = 10
    ws2.add_chart(chart, "A34")

    set_widths(ws2, [52, 18, 16, 40, 4, 18, 14])

    # ========== MONTHLY TRACKER ==========
    wt = wb.create_sheet("MonthlyTracker")
    wt.sheet_view.showGridLines = False
    wt["A1"] = "Monthly Tracker — enter real numbers (yellow)"
    wt["A1"].font = title_font
    wt.merge_cells("A1:N1")
    wt["A2"] = (
        "For each month: revenue, rent, other expenses, any profit already paid out, "
        "and any personal cash each partner put in that month. "
        "Leave unused months blank (or zero)."
    )
    wt["A2"].alignment = Alignment(wrap_text=True)
    wt.merge_cells("A2:N2")
    wt.row_dimensions[2].height = 36

    headers = [
        "Month",
        "Revenue",
        "Rent",
        "Other expenses",
        "Total expenses",
        "Leftover",
        "Profit paid to Cesar",
        "Profit paid to Partner",
        "Cesar personal cash in",
        "Partner personal cash in",
        "Cesar should fund (80%)",
        "Partner should fund (20%)",
        "Cesar overfunded expenses",
        "Partner profit overpay vs 20%",
    ]
    for i, h in enumerate(headers, 1):
        wt.cell(row=4, column=i, value=h)
    style_header_row(wt, 4, 1, 14)
    wt.row_dimensions[4].height = 40

    # Six real-ish months at $1700 rent + $800 other; break-even revenue = expenses
    # Profit draws 0 (break-even). Personal cash 0 until Cesar says otherwise.
    sample = [
        ("2025-03", 2500, 1700, 800, 0, 0, 0, 0),
        ("2025-04", 2500, 1700, 800, 0, 0, 0, 0),
        ("2025-05", 2500, 1700, 800, 0, 0, 0, 0),
        ("2025-06", 2500, 1700, 800, 0, 0, 0, 0),
        ("2025-07", 2500, 1700, 800, 0, 0, 0, 0),
        ("2025-08", 2500, 1700, 800, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
        ("", 0, 0, 0, 0, 0, 0, 0),
    ]

    for idx, (month, rev, rent, other, p_cesar, p_partner, c_cash, p_cash) in enumerate(sample):
        r = 5 + idx
        wt.cell(row=r, column=1, value=month).fill = input_fill
        wt.cell(row=r, column=1).border = thin
        for col, val in enumerate([rev, rent, other], 2):
            money_cell(wt.cell(row=r, column=col), value=val, editable=True)
        # Total expenses
        money_cell(wt.cell(row=r, column=5), formula=f"=C{r}+D{r}")
        # Leftover
        money_cell(wt.cell(row=r, column=6), formula=f"=B{r}-E{r}")
        money_cell(wt.cell(row=r, column=7), value=p_cesar, editable=True)
        money_cell(wt.cell(row=r, column=8), value=p_partner, editable=True)
        money_cell(wt.cell(row=r, column=9), value=c_cash, editable=True)
        money_cell(wt.cell(row=r, column=10), value=p_cash, editable=True)
        # Should fund by ownership (of expenses), net of personal cash already paid
        money_cell(
            wt.cell(row=r, column=11),
            formula=f"=E{r}*Assumptions!$B$17-I{r}",
        )
        money_cell(
            wt.cell(row=r, column=12),
            formula=f"=E{r}*Assumptions!$C$17-J{r}",
        )
        # Cesar overfunded = what Partner should have funded but didn't
        # Economic funding from joint account assumed ownership-funded, then personal cash adjusts.
        # Overfund by Cesar relative to fair = Partner shortfall = MAX(0, Partner should fund)
        # Actually: if expenses paid from joint (80/20 capital), Partner's fair share is 20%*E.
        # Credit Partner personal cash. Shortfall = max(0, fair - personal).
        # Cesar overfunded that shortfall (because joint account is mostly Cesar).
        money_cell(wt.cell(row=r, column=13), formula=f"=MAX(0,L{r})")
        # Partner profit overpay vs ownership: actual profit paid - fair share of leftover
        money_cell(
            wt.cell(row=r, column=14),
            formula=f"=H{r}-MAX(0,F{r})*Assumptions!$C$18",
        )

    # Totals row
    total_row = 34
    label(wt.cell(row=total_row, column=1), "TOTALS", True)
    wt.cell(row=total_row, column=1).fill = header_fill
    wt.cell(row=total_row, column=1).font = header_font
    for col in range(2, 15):
        letter = get_column_letter(col)
        money_cell(
            wt.cell(row=total_row, column=col),
            formula=f"=SUM({letter}5:{letter}33)",
        )
        wt.cell(row=total_row, column=col).fill = PatternFill("solid", fgColor="1A1A1A")
        wt.cell(row=total_row, column=col).font = Font(name="Calibri", bold=True, color="FFFFFF")

    # Summary hooks in a free area (do not collide with column totals)
    wt["A36"] = "Summary hooks (do not edit)"
    wt["A36"].font = Font(italic=True, color="888888", size=9)
    wt["A37"] = "Total revenue"
    money_cell(wt["B37"], formula="=B34")
    wt["A38"] = "Total expenses"
    money_cell(wt["B38"], formula="=E34")
    wt["A39"] = "Total leftover"
    money_cell(wt["B39"], formula="=F34")

    wt["A41"] = (
        "Uses Cesar's ballpark: $1,700 rent + ~$800 other × 6 months, break-even revenue. "
        "Overwrite with bank/statement totals when you have them."
    )
    wt["A41"].font = Font(name="Calibri", italic=True, color="A94442", size=10)
    wt.merge_cells("A41:N41")

    widths = [12, 12, 11, 14, 14, 12, 14, 14, 14, 14, 14, 14, 16, 16]
    set_widths(wt, widths)

    # ========== TRUE-UP ==========
    tu = wb.create_sheet("TrueUp")
    tu.sheet_view.showGridLines = False
    tu["A1"] = "True-Up — what Partner should pay Cesar"
    tu["A1"].font = title_font
    tu.merge_cells("A1:D1")

    tu["A3"] = "1) EXPENSE TRUE-UP"
    tu["A3"].font = section_font
    tu["A4"] = (
        "Partner's fair share of all logged expenses (by ownership), minus what they already paid from personal cash. "
        "That shortfall was effectively covered by your capital in the joint account."
    )
    tu["A4"].alignment = Alignment(wrap_text=True)
    tu.merge_cells("A4:D4")
    tu.row_dimensions[4].height = 40

    for i, h in enumerate(["Item", "Amount"], 1):
        tu.cell(row=6, column=i, value=h)
    style_header_row(tu, 6, 1, 2)

    items = [
        (7, "Total expenses (all months)", "=MonthlyTracker!E34"),
        (8, "Partner fair share of expenses", "=MonthlyTracker!E34*Assumptions!C17"),
        (9, "Partner personal cash already paid in", "=MonthlyTracker!J34"),
        (10, "Partner still owes for expenses", "=MAX(0,B8-B9)"),
        (11, "Cesar fair share of expenses", "=MonthlyTracker!E34*Assumptions!B17"),
        (12, "Expense true-up Partner → Cesar", "=B10"),
    ]
    for r, lab, formula in items:
        label(tu.cell(row=r, column=1), lab, bold=(r in (10, 12)))
        tu.cell(row=r, column=1).border = thin
        money_cell(tu.cell(row=r, column=2), formula=formula)
        if r in (10, 12):
            tu.cell(row=r, column=2).fill = warn_fill

    tu["A14"] = "2) PROFIT CATCH-UP (if past leftovers were split 50/50)"
    tu["A14"].font = section_font
    tu["A15"] = (
        "If Partner was paid 50% of leftovers while only owning 20%, they were overpaid relative to ownership. "
        "Set to $0 on Assumptions if you already agreed profits were intentionally 50/50 as sweat equity — "
        "then only use the expense true-up."
    )
    tu["A15"].alignment = Alignment(wrap_text=True)
    tu.merge_cells("A15:D15")
    tu.row_dimensions[15].height = 48

    for i, h in enumerate(["Item", "Amount"], 1):
        tu.cell(row=17, column=i, value=h)
    style_header_row(tu, 17, 1, 2)

    label(tu["A18"], "Partner profit overpay vs 20% ownership (sum)", True)
    money_cell(tu["B18"], formula="=MAX(0,MonthlyTracker!N34)")
    tu["B18"].fill = warn_fill
    label(tu["A19"], "Include profit catch-up in total? (1=yes, 0=no)", True)
    money_cell(tu["B19"], value=1, editable=True)
    tu["B19"].number_format = "0"

    label(tu["A20"], "TOTAL suggested true-up Partner pays Cesar", True)
    money_cell(tu["B20"], formula="=B12+B19*B18")
    tu["B20"].fill = warn_fill
    tu["B20"].font = Font(name="Calibri", bold=True, size=14)

    tu["A22"] = "3) GOING FORWARD — pick a written rule"
    tu["A22"].font = section_font
    tu["A23"] = (
        "Option A — Stay 80/20: every month, Partner transfers 20% of rent+ops to the joint account "
        "(or you invoice them). Profit distributions also 80/20.\n"
        "Option B — Buy up to 50/50: Partner pays the capital buy-up on Scenarios!B31, then expenses and profits split 50/50.\n"
        "Option C — Loan: record Cesar's excess capital as a loan; no profit distributions to Partner until loan is current.\n\n"
        "Until one of these is written down, keep logging months in Monthly Tracker so the true-up number stays current."
    )
    tu["A23"].alignment = Alignment(wrap_text=True, vertical="top")
    tu.merge_cells("A23:D23")
    tu.row_dimensions[23].height = 110

    tu["A25"] = "Simple talk track"
    tu["A25"].font = section_font
    tu["A26"] = (
        "\"Ownership is 75/25 — same as the $45k / $15k we put in. "
        "Bills come out of the shop account first. At break-even my revenue share still paid "
        "about 75% of rent and expenses, and there's nothing left to draw. "
        "Going forward you put in 25% of the monthly burn (~$625) so the account isn't only my money.\""
    )
    tu["A26"].alignment = Alignment(wrap_text=True)
    tu.merge_cells("A26:D26")
    tu.row_dimensions[26].height = 80

    set_widths(tu, [52, 18, 14, 14])

    # ========== CAPITAL ACCOUNTS ==========
    ca = wb.create_sheet("CapitalAccounts")
    ca.sheet_view.showGridLines = False
    ca["A1"] = "Capital Accounts (running picture)"
    ca["A1"].font = title_font
    ca.merge_cells("A1:D1")
    ca["A2"] = (
        "Starting capital → minus fair share of expenses → plus profit allocations → plus personal cash. "
        "If Partner's balance goes negative vs fair contributions, that's the debt."
    )
    ca["A2"].alignment = Alignment(wrap_text=True)
    ca.merge_cells("A2:D2")
    ca.row_dimensions[2].height = 36

    for i, h in enumerate(["", "Cesar", "Partner", "Combined"], 1):
        ca.cell(row=4, column=i, value=h)
    style_header_row(ca, 4, 1, 4)

    rows_ca = [
        (5, "Starting capital", "=Assumptions!B6", "=Assumptions!C6", "=B5+C5"),
        (6, "+ Personal cash contributed (tracker)", "=MonthlyTracker!I34", "=MonthlyTracker!J34", "=B6+C6"),
        (7, "− Fair share of expenses", "=MonthlyTracker!E34*Assumptions!B17", "=MonthlyTracker!E34*Assumptions!C17", "=B7+C7"),
        (8, "+ Fair share of positive leftovers", "=MAX(0,MonthlyTracker!F34)*Assumptions!B18", "=MAX(0,MonthlyTracker!F34)*Assumptions!C18", "=B8+C8"),
        (9, "− Profit already distributed", "=MonthlyTracker!G34", "=MonthlyTracker!H34", "=B9+C9"),
        (10, "Ending capital (model)", "=B5+B6-B7+B8-B9", "=C5+C6-C7+C8-C9", "=B10+C10"),
    ]
    for r, lab, b, c, d in rows_ca:
        label(ca.cell(row=r, column=1), lab, bold=(r in (5, 10)))
        ca.cell(row=r, column=1).border = thin
        money_cell(ca.cell(row=r, column=2), formula=b)
        money_cell(ca.cell(row=r, column=3), formula=c)
        money_cell(ca.cell(row=r, column=4), formula=d)
        if r == 10:
            for col in range(2, 5):
                ca.cell(row=r, column=col).fill = blue_fill
                ca.cell(row=r, column=col).font = Font(name="Calibri", bold=True)

    ca["A12"] = "Partner capital gap vs 20% of combined ending capital"
    ca["A12"].font = section_font
    label(ca["A13"], "Partner should hold (ownership × combined)")
    money_cell(ca["B13"], formula="=D10*Assumptions!C5")
    label(ca["A14"], "Partner actually holds (model)")
    money_cell(ca["B14"], formula="=C10")
    label(ca["A15"], "Gap (positive = Partner under-capitalized / owes value)", True)
    money_cell(ca["B15"], formula="=B13-B14")
    ca["B15"].fill = warn_fill

    set_widths(ca, [48, 16, 16, 14])

    # ========== BUILDOUT (card statements → total shop cost) ==========
    bd = wb.create_sheet("Buildout", 0)
    bd.sheet_view.showGridLines = False
    bd["A1"] = "Shop buildout cost — paste card / Amex statement lines here"
    bd["A1"].font = title_font
    bd.merge_cells("A1:H1")

    bd["A2"] = (
        "Goal: one number for what it cost to BUILD the shop (not monthly rent/ops). "
        "Export Amex + other cards as CSV, paste rows below, tag Category + Buildout?=Yes. "
        "Do NOT paste full card numbers — last4 in Card column is enough."
    )
    bd["A2"].font = Font(name="Calibri", italic=True, size=10, color="555555")
    bd["A2"].alignment = Alignment(wrap_text=True)
    bd.merge_cells("A2:H2")
    bd.row_dimensions[2].height = 40

    bd["A4"] = "HOW TO PULL STATEMENTS"
    bd["A4"].font = section_font
    bd["A5"] = (
        "1) Amex → Statements & Activity → Download / Export CSV (from first build month through open).\n"
        "2) Repeat for every other card/bank used (Visa, debit, Chase, etc.).\n"
        "3) Paste Date, Description, Amount into columns A–D (or copy from CSV).\n"
        "4) Set Buildout? = Yes for chairs, build, deposits, signage, stations, etc.\n"
        "5) Set Buildout? = No for rent, utilities, product restocks, personal stuff.\n"
        "6) Paid by = Cesar / Omi / Shop so capital true-up stays honest."
    )
    bd["A5"].alignment = Alignment(wrap_text=True)
    bd.merge_cells("A5:H5")
    bd.row_dimensions[5].height = 95

    # Totals block
    bd["A7"] = "TOTALS"
    bd["A7"].font = section_font
    for i, h in enumerate(["Metric", "Amount"], 1):
        bd.cell(row=8, column=i, value=h)
    style_header_row(bd, 8, 1, 2)

    label(bd["A9"], "TOTAL BUILDOUT (Yes rows)", True)
    money_cell(bd["B9"], formula='=SUMIF(F14:F513,"Yes",D14:D513)')
    bd["B9"].fill = warn_fill
    bd["B9"].font = Font(name="Calibri", bold=True, size=14)

    label(bd["A10"], "All pasted lines (Yes + No)")
    money_cell(bd["B10"], formula="=SUM(D14:D513)")

    label(bd["A11"], "Buildout paid by Cesar")
    money_cell(bd["B11"], formula='=SUMIFS(D14:D513,F14:F513,"Yes",G14:G513,"Cesar")')

    label(bd["A12"], "Buildout paid by Omi")
    money_cell(bd["B12"], formula='=SUMIFS(D14:D513,F14:F513,"Yes",G14:G513,"Omi")')

    # Category rollup
    bd["D7"] = "BY CATEGORY (buildout only)"
    bd["D7"].font = section_font
    for i, h in enumerate(["Category", "Total"], 4):
        bd.cell(row=8, column=i, value=h)
    style_header_row(bd, 8, 4, 5)

    categories = [
        "Lease deposit / first-last",
        "Construction / contractor / permits",
        "Plumbing / electrical / HVAC",
        "Flooring / paint / finishes",
        "Barber chairs / stations / mirrors",
        "Waiting area / furniture",
        "Signage / exterior / branding",
        "POS / computers / cameras / WiFi",
        "Opening supplies / inventory",
        "Licenses / legal / LLC / insurance setup",
        "Marketing / grand opening",
        "Other buildout",
    ]
    for idx, cat in enumerate(categories):
        r = 9 + idx
        label(bd.cell(row=r, column=4), cat)
        bd.cell(row=r, column=4).border = thin
        money_cell(
            bd.cell(row=r, column=5),
            formula=f'=SUMIFS($D$14:$D$513,$F$14:$F$513,"Yes",$E$14:$E$513,D{r})',
        )

    # Line item table
    bd["A13"] = "STATEMENT LINES (paste / type below — 500 rows)"
    bd["A13"].font = section_font
    headers = [
        "Date",
        "Card (Amex/Visa/etc + last4)",
        "Description (from statement)",
        "Amount",
        "Category",
        "Buildout? (Yes/No)",
        "Paid by (Cesar/Omi/Shop)",
        "Notes",
    ]
    for i, h in enumerate(headers, 1):
        bd.cell(row=14, column=i, value=h) if False else None
    # header is row 14? Better: headers on 14, data from 15... but formulas use 14:513 including header.
    # Fix: headers on row 13 area, data starts 15, formulas D15:D514
    # Simpler: put headers on row 14, data 15-514, update formulas.

    # Actually I already used F14:F513 — include header in range is bad for SUMIF if header isn't Yes.
    # Header text won't match Yes so OK. Amount header isn't a number. Fine.
    # But Date column header in row 14 — data should start row 15.

    for i, h in enumerate(headers, 1):
        bd.cell(row=14, column=i, value=h)
    style_header_row(bd, 14, 1, 8)
    bd.row_dimensions[14].height = 36

    # Example starter rows (yellow) — Cesar replaces
    examples = [
        ("", "Amex-1009", "EXAMPLE — Home Depot build materials", 0, "Flooring / paint / finishes", "Yes", "Cesar", "Delete/replace"),
        ("", "Amex-1009", "EXAMPLE — Barber chair vendor", 0, "Barber chairs / stations / mirrors", "Yes", "Cesar", ""),
        ("", "Visa-4321", "EXAMPLE — Monthly rent (NOT buildout)", 0, "Other buildout", "No", "Shop", "Ops — exclude from buildout total"),
    ]
    for idx, row in enumerate(examples):
        r = 15 + idx
        for c, val in enumerate(row, 1):
            cell = bd.cell(row=r, column=c, value=val)
            cell.border = thin
            cell.fill = input_fill
            if c == 4:
                cell.number_format = money

    # Leave remaining rows empty for paste (format first 100 for guidance)
    for r in range(18, 115):
        for c in range(1, 9):
            cell = bd.cell(row=r, column=c, value=None)
            cell.border = thin
            cell.fill = input_fill
            if c == 4:
                cell.number_format = money

    # Category list on a tiny helper sheet (avoids Excel 255-char list limit)
    lists = wb.create_sheet("_Lists")
    for i, cat in enumerate(categories, 1):
        lists.cell(row=i, column=1, value=cat)
    lists.sheet_state = "hidden"

    dv_cat = DataValidation(
        type="list",
        formula1="=_Lists!$A$1:$A$12",
        allow_blank=True,
    )
    dv_cat.error = "Pick a category"
    dv_cat.errorTitle = "Category"
    bd.add_data_validation(dv_cat)
    dv_cat.add("E15:E514")

    dv_yes = DataValidation(type="list", formula1='"Yes,No"', allow_blank=True)
    bd.add_data_validation(dv_yes)
    dv_yes.add("F15:F514")

    dv_paid = DataValidation(type="list", formula1='"Cesar,Omi,Shop"', allow_blank=True)
    bd.add_data_validation(dv_paid)
    dv_paid.add("G15:G514")

    # Fix totals to start at row 15 (skip header). Header amount isn't numeric so SUMIF was ok,
    # but Paid by SUMIFS on row 14 is fine. Update to 15:514 for clarity.
    bd["B9"] = '=SUMIF(F15:F514,"Yes",D15:D514)'
    bd["B9"].number_format = money
    bd["B9"].fill = warn_fill
    bd["B9"].font = Font(name="Calibri", bold=True, size=14)
    bd["B9"].border = thin

    bd["B10"] = "=SUM(D15:D514)"
    bd["B10"].number_format = money
    bd["B10"].fill = calc_fill
    bd["B10"].border = thin

    bd["B11"] = '=SUMIFS(D15:D514,F15:F514,"Yes",G15:G514,"Cesar")'
    bd["B11"].number_format = money
    bd["B11"].fill = calc_fill
    bd["B11"].border = thin

    bd["B12"] = '=SUMIFS(D15:D514,F15:F514,"Yes",G15:G514,"Omi")'
    bd["B12"].number_format = money
    bd["B12"].fill = calc_fill
    bd["B12"].border = thin

    for idx in range(len(categories)):
        r = 9 + idx
        bd.cell(
            row=r,
            column=5,
            value=f'=SUMIFS($D$15:$D$514,$F$15:$F$514,"Yes",$E$15:$E$514,D{r})',
        )
        bd.cell(row=r, column=5).number_format = money
        bd.cell(row=r, column=5).fill = calc_fill
        bd.cell(row=r, column=5).border = thin

    bd.freeze_panes = "A15"
    set_widths(bd, [12, 22, 42, 12, 36, 16, 18, 28])

    # Hook on Assumptions for reference
    # (optional) — skip

    # ========== YOUR MONEY ==========
    ym = wb.create_sheet("YourMoney", 0)
    ym.sheet_view.showGridLines = False
    ym["A1"] = "How much of YOUR revenue paid rent & expenses?"
    ym["A1"].font = title_font
    ym.merge_cells("A1:C1")

    ym["A2"] = (
        "Rule: ownership = capital = 75% Cesar / 25% Omi. "
        "Bills come out of the shop account first. Your revenue toward rent = "
        "your 75% share of the revenue that covered bills."
    )
    ym["A2"].font = Font(name="Calibri", italic=True, size=10, color="555555")
    ym["A2"].alignment = Alignment(wrap_text=True)
    ym.merge_cells("A2:C2")
    ym.row_dimensions[2].height = 40

    ym["A4"] = "INPUTS (yellow = edit)"
    ym["A4"].font = section_font
    for i, h in enumerate(["Input", "Amount", "Notes"], 1):
        ym.cell(row=5, column=i, value=h)
    style_header_row(ym, 5, 1, 3)

    label(ym["A6"], "Monthly rent")
    money_cell(ym["B6"], formula="=Assumptions!B21")
    label(ym["C6"], "$1,700")

    label(ym["A7"], "Other monthly expenses")
    money_cell(ym["B7"], formula="=Assumptions!B22")
    label(ym["C7"], "~$800")

    label(ym["A8"], "Months paying from account")
    money_cell(ym["B8"], formula="=Assumptions!B25")
    ym["B8"].number_format = "0"
    label(ym["C8"], "~6")

    label(ym["A9"], "Total shop revenue (all months)", True)
    money_cell(ym["B9"], value=15000, editable=True)
    label(ym["C9"], "Default $15,000 = break-even (= burn). Replace with real deposits if different.")

    label(ym["A10"], "Optional: YOUR personal chair $ deposited")
    money_cell(ym["B10"], value=0, editable=True)
    label(ym["C10"], "Leave 0 to use 75% of shop revenue. Fill only if you track your cuts separately.")

    ym["A12"] = "RESULTS — revenue that paid the bills"
    ym["A12"].font = section_font
    for i, h in enumerate(["What", "Amount", "Meaning"], 1):
        ym.cell(row=13, column=i, value=h)
    style_header_row(ym, 13, 1, 3)

    label(ym["A14"], "Total rent + expenses (burn)")
    money_cell(ym["B14"], formula="=(B6+B7)*B8")
    label(ym["C14"], "What left the shop account for bills")

    label(ym["A15"], "Shop revenue used to cover bills")
    money_cell(ym["B15"], formula="=MIN(B9,B14)")
    label(ym["C15"], "Revenue applied to bills (capped at burn)")

    label(ym["A16"], "YOUR revenue that paid rent/expenses (75%)", True)
    money_cell(ym["B16"], formula="=B15*Assumptions!B5")
    ym["B16"].fill = warn_fill
    ym["B16"].font = Font(name="Calibri", bold=True, size=14)
    label(ym["C16"], "THE NUMBER — your ownership share of revenue that covered bills")

    label(ym["A17"], "OMI's revenue that paid rent/expenses (25%)")
    money_cell(ym["B17"], formula="=B15*Assumptions!C5")
    label(ym["C17"], "His ownership share of revenue that covered bills")

    label(ym["A18"], "Leftover after bills (shop-level)")
    money_cell(ym["B18"], formula="=B9-B14")
    label(ym["C18"], "~$0 at break-even = no draw")

    label(ym["A19"], "Your possible draw (75% of leftover)")
    money_cell(ym["B19"], formula="=MAX(0,B18)*Assumptions!B5")
    label(ym["C19"], "Why it feels like $0 take-home right now")

    label(ym["A20"], "Chair-deposit version (only if B10 > 0)")
    money_cell(ym["B20"], formula="=IF(B10>0,MIN(B10,B14*Assumptions!B5),B16)")
    label(ym["C20"], "Optional alternate if you track personal cuts")

    ym["A22"] = "Monthly going forward (75/25)"
    ym["A22"].font = section_font
    label(ym["A23"], "Monthly burn")
    money_cell(ym["B23"], formula="=B6+B7")
    label(ym["A24"], "You cover (75%)")
    money_cell(ym["B24"], formula="=B23*Assumptions!B5")
    label(ym["A25"], "Omi covers (25%)")
    money_cell(ym["B25"], formula="=B23*Assumptions!C5")
    ym["B25"].fill = ok_fill

    ym["A27"] = "How to read this"
    ym["A27"].font = section_font
    ym["A28"] = (
        "At break-even, shop revenue ≈ rent+expenses. No leftover to take home.\n"
        "Your 75% ownership means ~75% of that revenue was your economic share — and it paid bills.\n"
        "On the $15k / 6-month ballpark: about $11,250 of YOUR revenue went to rent & expenses.\n"
        "Omi's 25% ≈ $3,750. Going forward he should fund ~$625/mo (25% of $2,500)."
    )
    ym["A28"].alignment = Alignment(wrap_text=True)
    ym.merge_cells("A28:C28")
    ym.row_dimensions[28].height = 75

    set_widths(ym, [52, 16, 62])

    # ========== README ==========
    rd = wb.create_sheet("Readme", 0)
    rd.sheet_view.showGridLines = False
    rd["A1"] = "Read me first"
    rd["A1"].font = title_font
    rd["A3"] = "Sheets"
    rd["A3"].font = section_font
    rd["A4"] = (
        "1. Buildout — paste Amex/card lines → TOTAL shop build cost (start for buildout question)\n"
        "2. YourMoney — how much of YOUR revenue paid rent/expenses\n"
        "3. Summary — story + bottom-line numbers\n"
        "4. Assumptions — 75/25 ownership, $45k/$15k, rent/ops\n"
        "5. Scenarios / MonthlyTracker / TrueUp / CapitalAccounts"
    )
    rd["A4"].alignment = Alignment(wrap_text=True, vertical="top")
    rd.merge_cells("A4:B4")
    rd.row_dimensions[4].height = 100

    rd["A6"] = "Two different questions"
    rd["A6"].font = section_font
    rd["A7"] = (
        "A) BUILDOUT COST (one-time): what did it cost to open the shop? → Buildout sheet + Amex/CSVs.\n"
        "B) MONTHLY BURN / REVENUE: what did operations cost after open? → YourMoney / MonthlyTracker.\n\n"
        "Ownership = 75/25 ($45k / $15k). At break-even ballpark, ~$11,250 of Cesar's revenue share paid bills.\n"
        "Do not mix rent/utilities into Buildout — mark those Buildout?=No."
    )
    rd["A7"].alignment = Alignment(wrap_text=True, vertical="top")
    rd.merge_cells("A7:B7")
    rd.row_dimensions[7].height = 110

    set_widths(rd, [100, 20])

    # freeze panes
    wt.freeze_panes = "B5"
    wa.freeze_panes = "A5"

    wb.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
