# Click Here — Git + Vercel Setup (One Time)

**Status (Aug 10):** Steps 1–4 complete. Daily deploy: `.\ship.cmd "what you changed"`

**Links:**
- [Vercel → Git settings](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/git)
- [GitHub repo](https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE)

---

## Step 1 — Log into GitHub (done if `gh auth status` works)

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\GitHub CLI\gh.exe" auth login
& "C:\Program Files\GitHub CLI\gh.exe" auth status
```

Account: **`cesarblendss-ai`** (not `cesarblendss`).

---

## Step 2 — Code on GitHub (done)

Repo: **`cesarblendss-ai/THE-BARBER-LOUNGE`**

If starting fresh on a new PC, use **`YOUR-USERNAME`** from Step 1:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo create the-barber-lounge --private --source=. --remote=origin --push
```

**"Repository not found"** → repo doesn't exist yet; run **`repo create`** first (don't use fallback blocks).

**Push rejected (unrelated history):**

```powershell
& "C:\Program Files\Git\bin\git.exe" push -u origin main --force-with-lease
```

---

## Step 3 — Vercel connected (done)

Vercel → Git → **`cesarblendss-ai/THE-BARBER-LOUNGE`**, Production branch **`main`**.

---

## Step 4 — Test auto-deploy

**One-time git identity** (repo only — NOT `--global`):

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" config user.name "Cesar"
& "C:\Program Files\Git\bin\git.exe" config user.email "cesar@users.noreply.github.com"
```

**Ship (PowerShell needs `.\` prefix):**

```powershell
.\ship.cmd test
```

---

## Daily workflow

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
.\ship.cmd "Describe your change"
```

Emergency Vercel-only (no git): `.\deploy.cmd`

---

## Stuck?

| Problem | What to do |
|---------|------------|
| **Author identity unknown** | Run the two `git config` lines above (no `--global`) |
| **`.\ship.cmd` not found** | Use **`.\ship.cmd`** in PowerShell (note the dot and backslash) |
| **`running scripts is disabled`** | Use **`.\ship.cmd`** — not `.\run.ps1` |
| **Repository not found** | Wrong username — use **`cesarblendss-ai`**, run `gh repo create` |
| Push works but no Vercel deploy | Vercel Git settings → connect **`cesarblendss-ai/THE-BARBER-LOUNGE`** |

More detail: [git-deploy-workflow.md](./git-deploy-workflow.md)
