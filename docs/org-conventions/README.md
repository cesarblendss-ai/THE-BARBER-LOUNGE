# Org Conventions — Read-Only Reference

**Stable org knowledge. Read before advising — do not edit casually.**

These files define how The Barber Lounge project should be built, written, and secured. They change rarely and only when conventions themselves change (new brand rule, architecture decision, package pricing update).

## When to read

| Before you… | Read |
|-------------|------|
| Write site copy, blog posts, SMS, or chat scripts | `style-guide.md` |
| Touch env vars, admin auth, or API keys | `security.md` |
| Answer questions about the shop (hours, team, services) | `barber-lounge-facts.md` |
| Advise on SEO packages, agent runs, VA workflow | `local-seo-playbook.md` |
| Discuss agency pricing, scaling, client acquisition | `marketing-agency-scale.md` |
| Change booking flow, receipts, or notifications | `booking-system.md` |
| Pick stack choices or explain architecture | `tech-stack-decisions.md` |
| Delegate tasks to Cursor agents (one message, no back-and-forth) | `one-shot-agents.md` |

## Permissioning

| Folder | Agent access | Who updates |
|--------|--------------|-------------|
| `docs/org-conventions/` | **Read-only** — cite, don't rewrite without explicit ask | Cesar or deliberate convention changes |
| `docs/team-memory/` | **Read-write** — update after sessions | Any agent after fixing blockers or deploys |

**Order:** Read org-conventions first (what should be true), then `docs/team-memory/` (what is true right now).

## Related paths

| Path | Purpose |
|------|---------|
| `docs/team-memory/` | Working memory — deploy status, blockers, flaky tests |
| `docs/knowledge/INDEX.md` | Topic → file redirect (legacy entry point) |
| `src/lib/content.ts` | Live site copy source of truth |
| `AGENTS.md` | Cursor agent entry point |
