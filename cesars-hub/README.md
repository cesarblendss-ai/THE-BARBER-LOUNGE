# Cesar's Hub

Local, private multi-business dashboard. No cloud backend — files stay on disk. **Not** part of the Barber Lounge public website.

**Bookmark:** http://localhost:8743/?biz=barber-lounge&production=1

## Run

Windows: double-click `start.bat` (or `python server.py`).

Linux/macOS:

```bash
python3 server.py
```

Opens http://localhost:8743 automatically. On the same Wi-Fi, the phone can use `http://<lan-ip>:8743`. Set `HUB_NO_BROWSER=1` to skip opening a browser.

First run creates a storage folder (default `cesars-hub/storage`) and writes the path to `hub_path.txt` (machine-specific, gitignored).

## Stack

- Frontend: `index.html` + `styles.css` + vanilla JS (`js/hub.js`, `js/estimate-wizard.js`, `js/estimate-pdf.js`). No framework, no build.
- Backend: `server.py` — Python stdlib only (`http.server`). Port **8743**.
- Config: `data/businesses.json` is the source of truth for id/name/folders. `index.html` keeps `FALLBACK_BUSINESSES` for offline UI metadata.

## What it does

- Hub home: node-graph of businesses (stacked list under 720px). Each business has its own color.
- Per-business folders: Documents, Marketing, Photos, Estimates — drag-and-drop upload, phone camera on Photos.
- Guided estimate wizard (client → category → tasks → prices → review) with bilingual UI for Silva's Handyman. Saves `.txt` plus a PDF when html2canvas/jsPDF load.
- Estimates tracker: saved / sent / opened, backfilled from the Estimates folder.
- PWA: `manifest.json` + icons for a phone home-screen install.
- LAN QR in the header.

Shop-floor tools (week calendar, Booksy, gallery CMS) stay on The Barber Lounge **Staff Hub** at `/admin`. This folder is Cesar's local agency OS only.

## Add a business

Edit **both** `data/businesses.json` and `FALLBACK_BUSINESSES` in `index.html` (colors, flags, snippets). Restart `server.py`.
