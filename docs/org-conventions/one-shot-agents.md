# One-Shot Agents Playbook

**Last verified:** 2026-08-08  
**Related:** [`AGENTS.md`](../../AGENTS.md) · [`local-seo-playbook.md`](local-seo-playbook.md) · [`docs/team-memory/`](../team-memory/README.md)

How to delegate full tasks to Cursor agents in **one message** — no back-and-forth, no user-as-API. The Barber Lounge uses this for SEO runs, deploys, bug fixes, and memory updates.

---

## How to one-shot (not back-and-forth)

### 1. Front-load the spec

Put everything the agent needs in **one message**:

| Include | Example |
|---------|---------|
| **Goal** | Fix flaky SEO v1 table parsing; ship v2 output only |
| **Success criteria** | `npm run build` passes; 11 files in output folder; no markdown table rows as blog titles |
| **Files to touch** | `tools/seo-agent/seo_agent.py`, `docs/team-memory/flaky-tests.md` |
| **What NOT to do** | Do not edit org-conventions; do not commit `.env.local`; do not publish `client_report.md` to the site |
| **Env constraints** | Windows + OneDrive path; use PowerShell; API keys in `tools/seo-agent/.env` |

**Real example — SEO agent (single run, 11 files out):**

> Run `python seo_agent.py "The Barber Lounge" --suffix v2` from `tools/seo-agent/`. Success = folder `output/the_barber_lounge_2026_08_08_v2/` with all 11 deliverables (keyword research, 4 blog posts, GBP posts, meta tags, schema, audit, competitor report, client report). Update `flaky-tests.md` if v1 bug still documented. Return output path + file list. Do not publish blogs to the site.

One message. Agent runs to completion.

---

### 2. Memory files first

Agents **must read before acting** (wired in [`AGENTS.md`](../../AGENTS.md)):

1. **`docs/org-conventions/`** — style, security, architecture (read-only)
2. **`docs/team-memory/`** — deploy status, blockers, flaky tests (read-write after changes)

**Order:** conventions first (what *should* be true), then team-memory (what *is* true now).

Include in your one-shot prompt when relevant:

> Read `docs/org-conventions/security.md` and `docs/team-memory/deploy.md` before changing env or deploying.

---

### 3. Cursor Multitask / background agents

For tasks that take more than a few minutes, delegate to a **background subagent**:

- Parent agent: coordinates, sets spec, reviews deliverables
- Subagent: `run_in_background: true` — owns investigate → fix → test → report
- User ends turn; Cursor notifies when the subagent finishes

**Pattern:**

> Background one-shot: investigate Twilio SMS 30007 on booking confirm. Read `docs/team-memory/twilio-sms-status.md`. Fix if code issue; otherwise document blocker. Return: root cause, files changed, test result, team-memory updates.

Do **not** micromanage step-by-step in chat. Trust the checklist deliverables (section 5).

---

### 4. Scripts over chat

Repeatable work belongs in **code or CLI**, not conversational loops:

| Task | One-shot command |
|------|------------------|
| Monthly SEO content | `cd tools/seo-agent && python seo_agent.py "The Barber Lounge"` |
| Production build check | `npm run build` |
| Deploy | `vercel --prod` (see `docs/team-memory/deploy.md`) |
| SMS smoke test | `npx tsx scripts/test-sms.ts` |

Chat is for **novel** work: new features, debugging unknowns, architecture decisions. Once a workflow repeats, extract it to a script and one-shot the script.

---

### 5. Checklist deliverables

Tell the agent **exactly what to return** so it knows when it's done without asking you:

```
Return:
- [ ] Production URL (or "not deployed")
- [ ] Files changed (paths)
- [ ] Test result (`npm run build`, lint, or named script)
- [ ] team-memory files updated (if status changed)
- [ ] Blockers remaining (if any)
```

Agents stop when the checklist is complete — not when they run out of ideas.

---

### 6. Batch related work

One agent owns the **full loop** in one session:

```
investigate → fix → test → deploy → update team-memory → report
```

**Don't split across 5 user messages:**

| Bad (back-and-forth) | Good (one-shot) |
|----------------------|-----------------|
| "Look at the build error" → "OK fix it" → "Run tests" → "Deploy" → "Update docs" | "Fix build error, verify `npm run build`, deploy to Vercel, update `deploy.md`, return report" |

---

### 7. Cursor Automations (optional)

For **scheduled** one-shots (e.g. monthly SEO run), use **Cursor Automations** (`/automations` in the Agents Window):

- Trigger: cron (1st of month) or manual
- Prompt: front-loaded spec + checklist deliverables
- Tools: repo access, terminal, optional MCP

Example automation intent: *"On the 1st, run SEO agent smoke test, notify if output folder missing deliverables."*

See Cursor Automations docs for setup. This playbook defines **what** to put in the automation prompt; Automations defines **when** it runs.

---

### 8. Anti-patterns

| Anti-pattern | Why it fails |
|--------------|--------------|
| "Make the site better" | No success criteria — agent guesses, asks you repeatedly |
| "Fix SEO" | Too vague — which layer? agent run, publish, meta tags, deploy? |
| User as API for every decision | "Should I use v1 or v2?" — decide in the spec upfront |
| Splitting investigate/fix/test across turns | Context loss; parent re-explains each time |
| Skipping memory files | Agent reinvents deploy URLs, repeats fixed blockers |
| Editing org-conventions casually | Stable reference; changes belong in team-memory or explicit convention PRs |

**Rule:** If you wouldn't accept this brief from a contractor, don't send it to an agent.

---

## Copy-paste prompt templates

### Template A — Fix + verify + memory + report

```
One-shot: fix [ISSUE].

Goal: [one sentence]
Success: [npm run build passes | test X green | URL returns 200]
Read first: docs/org-conventions/[relevant].md, docs/team-memory/[relevant].md
Touch: [file paths or "investigate src/app/..."]
Do NOT: edit org-conventions; commit secrets; [other constraints]

Do in one pass: investigate → fix → test → update team-memory if status changed.

Return:
- Root cause (1–2 sentences)
- Files changed
- Test/build result
- team-memory updates (paths + what changed)
- Remaining blockers (if any)
```

**Example (filled in):**

```
One-shot: fix blog slug 404 on production.

Goal: /blog/best-fades-barbershop-antioch returns 200 on team Vercel URL.
Success: npm run build passes; curl team URL → 200.
Read first: docs/team-memory/deploy.md, docs/team-memory/repo-layout.md
Touch: src/app/blog/, src/lib/content.ts
Do NOT: redeploy without verifying build; edit org-conventions.

Do in one pass: investigate → fix → npm run build → update deploy.md if redeployed.

Return: root cause, files changed, build output summary, live URL, deploy.md diff summary.
```

---

### Template B — SEO agent + publish + redeploy

```
One-shot: monthly SEO pipeline for The Barber Lounge.

Goal: Fresh agent output + publish 1 blog + redeploy production.
Read first: docs/org-conventions/local-seo-playbook.md, docs/team-memory/flaky-tests.md, docs/team-memory/deploy.md
Do NOT: publish client_report.md to website; use v1 output folder (known bad — use --suffix v2)

Steps (one agent, full loop):
1. cd tools/seo-agent && python seo_agent.py "The Barber Lounge" --suffix v2
2. Verify 11 files in output/the_barber_lounge_[date]_v2/
3. Publish [blog_post_N.md] to src/content/blog/ per PUBLISHING_CHECKLIST.md
4. npm run build
5. vercel --prod
6. Update docs/team-memory/deploy.md (date, what shipped, blog URL)

Return:
- Output folder path + 11-file checklist
- Blog slug published
- Build pass/fail
- Production URL + blog 200 check
- deploy.md summary
```

---

### Template C — Background investigate-only (no deploy)

```
Background one-shot: [TOPIC].

Read docs/org-conventions/ + docs/team-memory/ before acting.
Investigate only — do not deploy or merge unless success criteria met.

Success: [written report with citations to repo paths and memory files]
Do NOT: [constraints]

Return when done: findings, recommended next one-shot prompt (if follow-up needed), team-memory updates.
```

---

## Quick reference — Barber Lounge one-shots

| Workflow | Entry point | Memory to update |
|----------|-------------|------------------|
| SEO content factory | `tools/seo-agent/seo_agent.py` | `flaky-tests.md` if agent quirks |
| Production deploy | `vercel --prod` | `deploy.md` |
| SMS / Twilio | `scripts/test-sms.ts` | `twilio-sms-status.md` |
| Blocker triage | `current-blockers.md` | same + `current-session.md` |
| Session handoff | — | `current-session.md` |

---

## See also

- [`AGENTS.md`](../../AGENTS.md) — agent entry point and memory hierarchy
- [`local-seo-playbook.md`](local-seo-playbook.md) — 11 deliverables, packages, run commands
- [`docs/team-memory/README.md`](../team-memory/README.md) — when to update working state
- `tools/seo-agent/AGENCY_PLAYBOOK.md` — full agency SOP
