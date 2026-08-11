# Project Knowledge Base (Legacy Entry Point)

> **Moved (2026-08-08):** This folder is kept for backward compatibility. Use the new structure:
>
> | Folder | Access | Purpose |
> |--------|--------|---------|
> | [`docs/org-conventions/`](../org-conventions/README.md) | **Read-only** | Style, security, architecture, business facts |
> | [`docs/team-memory/`](../team-memory/README.md) | **Read-write** | Deploy status, blockers, flaky tests, SMS state |
>
> **Start here:** [`INDEX.md`](INDEX.md) — topic → file map for both folders.

---

## How agents should use memory

1. **Read org-conventions first** — how things should be built and written
2. **Read team-memory second** — what's live, blocked, or flaky right now
3. **Update team-memory** after sessions when status changes
4. **Do not casually edit org-conventions** — only when conventions themselves change
5. **Never paste secrets** — see `docs/org-conventions/security.md`

## Related docs (outside docs/)

| Path | Purpose |
|------|---------|
| `tools/seo-agent/AGENCY_PLAYBOOK.md` | Full agency SOP |
| `tools/seo-agent/PUBLISHING_CHECKLIST.md` | VA publish steps |
| `tools/seo-agent/README.md` | How to run `seo_agent.py` |
| `src/lib/booking-agent/README.md` | Portable booking module |
| `AGENTS.md` | Cursor agent entry point |
