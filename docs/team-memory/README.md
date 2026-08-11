# Team Memory — Working State

**Update after each session when status changes.**

This folder is **read-write** for agents. It holds what's true *right now* — deploy URLs, open blockers, flaky tests, SMS status. Org conventions (`docs/org-conventions/`) define how things should be; this folder tracks reality.

## When to update

| Event | Update |
|-------|--------|
| End of session / "what are we doing" | `current-session.md` — snapshot of finished, in-flight, blockers |
| Production deploy | `deploy.md` — URL, date, what shipped |
| Blocker fixed or new blocker found | `current-blockers.md` |
| Twilio KYC progress, SMS test result | `twilio-sms-status.md` |
| Dev/build quirk discovered | `flaky-tests.md` |
| New major path or route added | `repo-layout.md` |

## Files

| File | Purpose |
|------|---------|
| `current-session.md` | Session snapshot — what just finished, in flight, user questions, blockers |
| `deploy.md` | LIVE status, Vercel URLs, env vars on prod, last deploy |
| `repo-layout.md` | Key paths map — src/, tools/, API routes, admin |
| `current-blockers.md` | Open issues — Twilio KYC, Postgres, domain, etc. |
| `flaky-tests.md` | Known local/dev issues — OneDrive, SEO v1 bug, dev server |
| `twilio-sms-status.md` | SMS delivery state, error codes, KYC checklist |

## Agent workflow

1. **Read** `docs/org-conventions/` first (style, security, architecture)
2. **Read** this folder for current state before advising on deploy/SMS/blockers
3. **Write** here when you change or verify status — add **Last verified** date
4. Do **not** edit org-conventions casually; propose convention changes to Cesar

**One-shot tasks:** See [`docs/org-conventions/one-shot-agents.md`](../org-conventions/one-shot-agents.md) — front-load specs, batch investigate/fix/test/deploy, return checklist deliverables (no back-and-forth).

## Permissioning

| Folder | Access |
|--------|--------|
| `docs/org-conventions/` | Read-only (unless explicitly asked to change conventions) |
| `docs/team-memory/` | Read-write |
