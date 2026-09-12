# HIPAA Readiness Tool

Local checklist for small covered entities and business associates (clinics, dentists, therapists, med spas, billing vendors). **Not part of the public Barber Lounge site.**

**Bookmark:** http://127.0.0.1:8755

This is a readiness worksheet, not legal advice and not a HIPAA certification. Do not enter patient names or any other PHI — practice names and vendor names only.

## Run

Windows: double-click `start.bat` (or `python server.py`).

Linux/macOS:

```bash
cd tools/hipaa
python3 server.py
```

Opens nothing automatically. Visit http://127.0.0.1:8755. Override the port with `HIPAA_PORT=8760`.

## What it does

- Practice profile (covered entity / business associate)
- Privacy Rule, administrative / physical / technical safeguards, BAA, and breach checklist
- Live score with high-priority gaps
- Business Associate register
- Printable report (browser Print → Save as PDF)
- JSON saved under `tools/hipaa/storage/` (gitignored)

## Tests

```bash
cd tools/hipaa
python3 test_score.py
```

## Honest language

Do not tell a client they are “HIPAA certified” or “lawsuit-proof.” Say: readiness checklist completed, gaps listed, counsel should review before any public claim.

Internal sales copy: `docs/HIPAA-READINESS-OFFERING.md`.
