# Partnership finance tools

## `partnership-split-model.xlsx`

Workbook for Cesar ↔ Omi capital, ops burn, and **shop buildout cost**.

| Sheet | Use |
|-------|-----|
| Readme | Two questions: buildout vs monthly burn |
| **Buildout** | Paste Amex/card statement lines → **total shop build cost** |
| YourMoney | How much of Cesar's revenue paid rent/ops |
| Summary | Story + bottom-line numbers |
| Assumptions | 75/25 ownership, $45k/$15k, rent/ops |
| Scenarios | Break-even vs profit month |
| MonthlyTracker | Month-by-month ops history |
| TrueUp | What partner owes + talk track |
| CapitalAccounts | Running capital picture |

Rebuild:

```bash
python3 finance/build_partnership_workbook.py
```

### Buildout workflow
1. Export Amex (+ other cards) CSV from first build month through open
2. Paste into **Buildout** (Date, Card last4, Description, Amount)
3. Tag **Category**, **Buildout?=Yes**, **Paid by**
4. Red total = whole shop buildout cost
