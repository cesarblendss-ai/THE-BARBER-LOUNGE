# SEO Brain — Ultimate Brain Architecture

The `tools/seo-agent/` folder is not one script. It is an **ecosystem of Python tools** you run from the terminal with a few words — a persistent, learning SEO brain for local businesses.

## Vision

```
                    ┌─────────────────────────────────┐
                    │         run.py (CLI)            │
                    │   test | full | seo | rank ...  │
                    └───────────────┬─────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
  │ seo_agent   │           │ local_rank  │           │ publish_    │
  │ (8 steps)   │           │ _scan       │           │ check       │
  └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                    ┌─────────────────────────────────┐
                    │      memory/ (learning loop)    │
                    │  runs.jsonl | rank_scans | ...  │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                    Next run READS memory → avoids dupes,
                    targets rank gaps, builds on keywords
```

## Core principle: memory loop

Every run **writes** to `memory/` and the next run **reads** it:

| File | What it stores |
|------|----------------|
| `memory/runs.jsonl` | Timestamp, client, blog topics/slugs, deliverables, duration |
| `memory/rank_scans.jsonl` | Visible cities vs rank gaps from local scans |
| `memory/competitor_snapshots.jsonl` | Top 3 Antioch barbershops from Serper |

The SEO agent injects prior context into keyword research and topic extraction when you pass `--memory`.

## Script catalog

| Script | Role | CLI |
|--------|------|-----|
| **`run.py`** | Master orchestrator | `python run.py <command>` |
| **`seo_agent.py`** | 8-step content engine | `python seo_agent.py "Client" --memory` |
| **`local_rank_scan.py`** | 10-city visibility grid | `python local_rank_scan.py` |
| **`publish_check.py`** | Output vs `blog-posts.ts` diff | `python publish_check.py` |
| **`competitor_watch.py`** | Top-3 competitor scrape | `python competitor_watch.py` |
| **`memory_store.py`** | Memory read/write API | imported by other scripts |

## Typical workflows

### First-time setup
```powershell
cd tools/seo-agent
pip install -r requirements.txt
copy .env.example .env
python run.py test
```

### Monthly content run (with learning)
```powershell
python run.py seo "The Barber Lounge" --memory
python run.py publish-check
```

### Full pipeline (content + rank + verify)
```powershell
python run.py full "The Barber Lounge" --memory
```

### Check what to do next
```powershell
python run.py memory
```

### Resume after failure
```powershell
python seo_agent.py "The Barber Lounge" --resume --memory
```

## Resume on failure

If a run dies mid-pipeline (API timeout, rate limit), re-run with `--resume`. The agent detects existing files in today's output folder and skips completed steps.

## Extending the brain

Add new plug-in scripts alongside existing ones:

1. Create `your_tool.py` with a `main()` entry point
2. Wire it in `run.py` as a subcommand
3. If it produces learnings, append to `memory/` via `memory_store.py`

Future candidates:
- `content_importer.py` — auto-copy blog markdown into `src/app/blog/`
- `citation_checker.py` — verify NAP across directories
- `review_responder.py` — draft GBP review replies

## Agency scaling

Each client gets:
- `clients/<slug>.json` — machine-readable profile
- Shared brain scripts — same CLI, different client name
- Per-client memory — filter `runs.jsonl` by client name

See [AGENCY_PLAYBOOK.md](./AGENCY_PLAYBOOK.md) for pricing and VA handoff.

## Related docs

- [README.md](./README.md) — setup, commands, site integration
- [AGENTS.md](../../AGENTS.md) — project-wide agent instructions
- [PUBLISHING_CHECKLIST.md](./PUBLISHING_CHECKLIST.md) — VA publish steps
