# Click Here — Git + Vercel Setup

**Status: DONE (Aug 10, 2026).** You do not need to redo Steps 1–3.

| What | Value |
|------|-------|
| GitHub account | **cesarblendss-ai** |
| Repo | https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE |
| Vercel Git | Connected, branch **main** |
| Latest commit | check with `git log -1 --oneline` |

---

## Daily deploy (the only command you need)

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
.\ship.cmd "Describe your change"
```

Emergency Vercel-only (no git): `.\deploy.cmd`

**"nothing to commit, working tree clean"** = synced. Not an error.

---

## One-time git identity (only if ship fails with "Author identity unknown")

Repo only — NOT `--global`:

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" config user.name "Cesar"
& "C:\Program Files\Git\bin\git.exe" config user.email "cesar@users.noreply.github.com"
```

---

## Stuck?

| Problem | Fix |
|---------|-----|
| **`ship.cmd` not found** | Use **`.\ship.cmd`** (dot + backslash) |
| **`running scripts is disabled`** | Use **`.\ship.cmd`** — never `.\run.ps1` |
| **Author identity unknown** | Run git config lines above |
| **Repository not found** | Wrong username — use **cesarblendss-ai** |

Reference: [git-deploy-workflow.md](./git-deploy-workflow.md)
