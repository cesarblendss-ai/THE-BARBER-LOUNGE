# Click Here — Git + Vercel Setup

**Status:** Setup complete. Daily deploy: `.\ship.cmd "what you changed"`

**Links:**
- [Vercel Git settings](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/git)
- [GitHub repo](https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE)

Account: **`cesarblendss-ai`** (not `cesarblendss`).

---

## One-time git identity (repo only — NOT `--global`)

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" config user.name "Cesar"
& "C:\Program Files\Git\bin\git.exe" config user.email "cesar@users.noreply.github.com"
```

---

## Daily workflow

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
.\ship.cmd "Describe your change"
```

Emergency Vercel-only (no git): `.\deploy.cmd`

**"nothing to commit, working tree clean"** = you're synced; that's success, not an error.

---

## Stuck?

| Problem | What to do |
|---------|------------|
| **`ship.cmd` not found** / command not recognized | Use **`.\ship.cmd`** in PowerShell (dot + backslash required) |
| **Author identity unknown** | Run the two `git config` lines above (no `--global`) |
| **`running scripts is disabled`** | Use **`.\ship.cmd`** — not `.\run.ps1` |
| **Repository not found** | Wrong username — repo is **`cesarblendss-ai/THE-BARBER-LOUNGE`** |
| **Name already exists** on `repo create` | Repo exists — set remote and push (or you're already done) |
| Push works but no Vercel deploy | Vercel Git → connect **`cesarblendss-ai/THE-BARBER-LOUNGE`**, branch **`main`** |

More detail: [git-deploy-workflow.md](./git-deploy-workflow.md)
