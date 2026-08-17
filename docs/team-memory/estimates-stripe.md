# Estimates — Cesar’s Hub (local files)

**Last verified:** 2026-08-17  
**App:** `cesars-hub/` — local Python hub on **http://localhost:8743**  
**Not** on The Barber Lounge website. **Not** a Vercel/Stripe app.

---

## What it does

Cesar builds an estimate in the guided wizard (or the freeform textarea). On save the hub writes:

- a plain `.txt` copy into that business’s `Estimates/` folder
- a print-ready `.pdf` when html2canvas + jsPDF load from the CDN

The estimates tracker (`Estimates/_status.json`) records **saved / sent / opened** and backfills from files already in the folder.

There is no shareable `/e/[token]` client portal and no Stripe checkout in this hub. Those were a Next.js experiment; the real hub is local-first files.

Shop-floor booking still lives on the Barber Lounge Staff Hub (`/admin`).
