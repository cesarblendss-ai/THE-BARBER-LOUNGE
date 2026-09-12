# Silva's Handyman — estimate wizard rates

Repo source of truth for **labor rates, material markup, and profit margin**.

The original Cesar's Hub wizard lives on Desktop, not this GitHub repo (`docs/team-memory/current-session.md` from Aug 17). Cloud agents cannot read that config. Edit `wizard-pricing.json` if Cesar's live rates differ.

## Rules

- **Profit margin** (`profitMarginPercent`) is applied on top of every cost line — labor, materials, and dump fee. Nothing is quoted at raw cost.
- **Materials** also get `materialMarkupPercent` first, then profit margin.
- Demo for the siding job is **one $1,000 lump** (siding + chimney + all window trims), then margin. Dump/disposal is a separate fee.

## Generate the siding demo / reinstall estimate

```bash
cd tools/silvas-handyman
python3 generate.py
python3 -m unittest test_estimate_engine.py
```

Output:

- `output/siding-demo-reinstall.md`
- `output/siding-demo-reinstall.html`
- `output/siding-demo-reinstall.json`
