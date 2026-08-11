# Git deploy workflow — edit → push → auto deploy

**Last updated:** 2026-08-10  
**Production:** https://the-barber-lounge-antioch.vercel.app · https://thebarberlounge.com (DNS pending)  
**Vercel project:** `cesarblendss-7234s-projects/the-barber-lounge`

---

## Daily workflow (after one-time setup)

1. **Edit** code or content locally.
2. **Commit** — `.\run.ps1 ship "Short description of change"` or manual git commands below.
3. **Push** to `main` on GitHub — Vercel builds and deploys to Production automatically.
4. **Verify** — check the Vercel dashboard or hit the live URL. No manual deploy needed.

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge

# Option A — one command (recommended)
.\run.ps1 ship "Update shop hours on homepage"

# Option B — manual
git add -A
git commit -m "Update shop hours on homepage"
git push origin main
```

**Do not run `npx vercel --prod` for normal releases.** Git push is the source of truth. Use manual Vercel CLI only for emergencies (see below).

---

## Branch strategy

| Branch | Purpose | Deploy target |
|--------|---------|---------------|
| **`main`** | Production-ready code | **Production** (auto on every push) |
| Feature branches (optional) | WIP / experiments | Vercel Preview deploys (if enabled) |

- Keep `main` deployable at all times.
- Merge or push directly to `main` for shop updates.
- Never force-push `main` unless you know exactly why.

---

## One-time setup (Cesar — do once)

### Step 1 — GitHub CLI login

Open a **new PowerShell window** (refreshes PATH after winget install), then:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login
```

Choose:

1. **GitHub.com**
2. **HTTPS**
3. **Login with a web browser** (easiest) — copy the one-time code, press Enter, complete login in browser
4. Authenticate as **cesarblendss** (or your GitHub account)

Verify:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth status
```

You should see: `Logged in to github.com as …`

### Step 2 — Create repo and push

From the project folder:

```powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge

# Ensure default branch is main (Vercel expects main)
& "C:\Program Files\Git\bin\git.exe" branch -M main

# Create private repo and push (only run once)
& "C:\Program Files\GitHub CLI\gh.exe" repo create the-barber-lounge --private --source=. --remote=origin --push
```

Expected result: **https://github.com/cesarblendss/the-barber-lounge** (private).

If the repo already exists on GitHub:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo set-default cesarblendss/the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/cesarblendss/the-barber-lounge.git
& "C:\Program Files\Git\bin\git.exe" push -u origin main
```

### Step 3 — Connect Vercel to GitHub

**Dashboard (recommended — one click flow):**

1. Open [Vercel → the-barber-lounge → Settings → Git](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/git)
2. Click **Connect Git Repository**
3. Choose **GitHub** → authorize Vercel if prompted
4. Select **`cesarblendss/the-barber-lounge`**
5. Confirm **Production Branch** = **`main`**
6. Save — future pushes to `main` trigger Production deploys

**CLI alternative:**

```powershell
npx vercel git connect
```

Follow prompts to link the GitHub repo to the existing Vercel project.

### Step 4 — Confirm auto-deploy

After connecting Git:

```powershell
# Small test commit
.\run.ps1 ship "Test git auto-deploy"
```

Watch [Vercel Deployments](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge) — a new Production deployment should start within ~30 seconds of push.

---

## Emergency manual deploy

Use only when Git/Vercel integration is broken or you need an immediate hotfix before push works:

```powershell
.\run.ps1 build
.\run.ps1 deploy    # runs: npx vercel --prod --yes
```

After fixing Git integration, return to push-based deploys so history stays aligned.

---

## What never goes in git

Per `.gitignore`:

- `.env*` (secrets, API keys, `DATABASE_URL`)
- `.vercel/` (local project link)
- `node_modules/`, `.next/`

Set secrets in **Vercel → Settings → Environment Variables**. See [security-checklist.md](./security-checklist.md).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `gh: not logged in` | Run `gh auth login` (Step 1) |
| `git push` rejected | `git pull --rebase origin main` then push again |
| Push succeeds, no Vercel deploy | Re-check Git connection in Vercel Settings → Git |
| Wrong branch deployed | Set Production Branch to `main` in Vercel Git settings |
| OneDrive sync conflicts | Consider [move-off-onedrive.md](./move-off-onedrive.md) |

---

## Related docs

- [security-checklist.md](./security-checklist.md) — env vars before deploy
- [team-memory/current-blockers.md](../team-memory/current-blockers.md) — active blockers
- [move-off-onedrive.md](./move-off-onedrive.md) — optional repo relocation
