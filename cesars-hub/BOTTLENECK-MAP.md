# Bottleneck map — Phase 1

**Last verified:** 2026-08-17

Structural bottlenecks from the original single-file hub. Partially resolved by this Python + vanilla split.

| Bottleneck | Status |
|------------|--------|
| Everything in one HTML file | Split: `index.html` shell, `styles.css`, `js/hub.js`, `js/estimate-wizard.js`, `js/estimate-pdf.js` |
| Business list duplicated | `/api/businesses` from `data/businesses.json` is source of truth; `FALLBACK_BUSINESSES` remains for offline |
| Estimates saved as `.txt` only | PDF pipeline added (`html2canvas` + `jsPDF`); `.txt` still saved as the canonical plain copy |
| UI metadata (colors/flags) not on server | Still merged on the client — add new businesses in both JSON and the HTML fallback |
| No modules / build | Intentional — stdlib Python + vanilla JS |
