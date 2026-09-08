# Partnership finance tools

## `partnership-split-model.xlsx`

Workbook for Cesar ↔ partner capital / expense true-up at The Barber Lounge.

| Sheet | Use |
|-------|-----|
| Readme | Direct answer + how to use |
| Summary | Story + bottom-line true-up |
| Assumptions | Ownership, capital, split rules (edit yellow) |
| Scenarios | Break-even vs profit month, current vs fair 80/20 |
| MonthlyTracker | Real month-by-month history |
| TrueUp | What partner owes + going-forward options |
| CapitalAccounts | Running capital picture |

Rebuild after editing the generator:

```bash
python3 finance/build_partnership_workbook.py
```

**Important:** MonthlyTracker ships with placeholder months so formulas show numbers. Replace with real books before sharing.
