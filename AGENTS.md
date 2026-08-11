# Agent Instructions — The Barber Lounge

Before answering questions about this project, **read the relevant memory files**.

## Start here

1. **Org conventions (read-only):** [`docs/org-conventions/README.md`](docs/org-conventions/README.md) — style, security, architecture, [one-shot agents](docs/org-conventions/one-shot-agents.md)  
2. **Team memory (read-write):** [`docs/team-memory/README.md`](docs/team-memory/README.md) — deploy status, blockers, current state  
3. **Topic index:** [`docs/knowledge/INDEX.md`](docs/knowledge/INDEX.md) — quick routing table  
4. **SEO Brain:** [`tools/seo-agent/BRAIN.md`](tools/seo-agent/BRAIN.md) — memory loop, CLI orchestrator, script catalog  

**Order:** org-conventions first (what should be true), then team-memory (what is true now).

## Rules

- **Facts over opinion** — cite paths, URLs, and documented status; do not invent hours, pricing, or deployment state  
- **No secrets** — never output values from `.env.local` (see `docs/org-conventions/security.md`)  
- **No blog spam** — reference SEO output folders under `tools/seo-agent/output/`, don't duplicate full posts  
- **SEO Brain CLI** — use `python run.py memory` for prior runs; `python run.py publish-check` before importing blogs  
- **Update team-memory** when you fix or change blockers (SMS live, domain connected, Postgres, deploy)  
- **Do not casually edit org-conventions** — stable reference only

## Memory structure

```
docs/
├── org-conventions/          # READ-ONLY — read before advising
│   ├── README.md
│   ├── style-guide.md        # Brand, tone, no "Bet"
│   ├── security.md           # Env vars, ADMIN_UPLOAD_KEY
│   ├── barber-lounge-facts.md
│   ├── booking-system.md
│   ├── local-seo-playbook.md
│   ├── marketing-agency-scale.md
│   ├── tech-stack-decisions.md
│   ├── one-shot-agents.md      # One-message agent delegation playbook
│   └── notes/
└── team-memory/              # READ-WRITE — update after sessions
    ├── README.md
    ├── deploy.md             # LIVE status, Vercel URLs
    ├── repo-layout.md        # Key paths map
    ├── current-blockers.md   # Open issues
    ├── flaky-tests.md        # OneDrive, SEO v1, dev server
    └── twilio-sms-status.md
```

Legacy redirects remain in `docs/knowledge/` for old links.

## Source of truth hierarchy

1. `docs/org-conventions/` + `docs/team-memory/` — project status + decisions  
2. `src/lib/content.ts` — public site copy  
3. `tools/seo-agent/clients/the_barber_lounge.json` — SEO client profile  
4. `tools/seo-agent/AGENCY_PLAYBOOK.md` — full agency SOP
