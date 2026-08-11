# Click Here — Git + Vercel Setup (One Time)

**Do these steps in order. Each box is one step. Copy one PowerShell block, paste, press Enter, then move on.**

Your site already works on Vercel. This connects GitHub so every future change auto-deploys when you push.

**Links:**
- [Vercel — Git settings](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/git)
- [GitHub login](https://github.com/login)

---

## Step 1 — Log into GitHub on this computer

- [ ] Open **PowerShell** (Windows key, type `PowerShell`, press Enter)
- [ ] Paste this and press Enter:

``powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\GitHub CLI\gh.exe" auth login
``

- [ ] When asked, pick: **GitHub.com** — **HTTPS** — **Login with a web browser**
- [ ] Copy the one-time code, press Enter, paste in browser, click **Authorize**
- [ ] Confirm login:

``powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth status
``

You should see: **Logged in to github.com account YOUR-USERNAME**. Write that username down — you need it in Step 2. (Cesar's account is **`cesarblendss-ai`**, not `cesarblendss`.)

---

## Step 2 — Put your code on GitHub (one time)

Replace `YOUR-USERNAME` below with what Step 1 showed (e.g. `cesarblendss-ai`).

- [ ] Paste:

``powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" branch -M main
``

- [ ] Create the repo and push (**always try this first**):

``powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo create the-barber-lounge --private --source=. --remote=origin --push
``

**If `gh` says "not a git repository" (OneDrive quirk):**

``powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo create the-barber-lounge --private
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/YOUR-USERNAME/the-barber-lounge.git
& "C:\Program Files\Git\bin\git.exe" push -u origin main
``

**Only if create says "already exists"** — do NOT use this when you get "Repository not found":

``powershell
& "C:\Program Files\GitHub CLI\gh.exe" repo set-default YOUR-USERNAME/the-barber-lounge
& "C:\Program Files\Git\bin\git.exe" remote remove origin
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/YOUR-USERNAME/the-barber-lounge.git
& "C:\Program Files\Git\bin\git.exe" push -u origin main
``

**If push is rejected (unrelated histories / non-fast-forward)** — your local folder is the real site; overwrite GitHub:

``powershell
& "C:\Program Files\Git\bin\git.exe" push -u origin main --force-with-lease
``

- [ ] Open `https://github.com/YOUR-USERNAME/the-barber-lounge` — you should see your files.

---

## Step 3 — Connect Vercel to GitHub

Go to: https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge/settings/git

**If you see a repo name already listed (connected to GitHub):**
- [ ] Check that **Production Branch** says **main**
- [ ] Skip to Step 4

**If you see "Connect Git Repository":**
- [ ] Click **Connect Git Repository**
- [ ] Click **GitHub**
- [ ] Authorize Vercel for the **same account as Step 1** (`cesarblendss-ai`)
- [ ] Find and click **the-barber-lounge**
- [ ] Set **Production Branch** to **main** — **Save**

---

## Step 4 — Test that auto-deploy works

``powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
ship.cmd test
``

*(If you prefer `run.ps1`, use `powershell -NoProfile -ExecutionPolicy Bypass -File .\run.ps1 ship test` — Windows often blocks `.\run.ps1` directly.)*

- [ ] Wait ~30 seconds — [Vercel deployments](https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge) — new **Production** build should start.

**Done.** From now on: `ship.cmd "what you changed"` (or `run.ps1` with `-ExecutionPolicy Bypass` as above)

---

## After setup — your normal workflow

``powershell
cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
ship.cmd "Describe your change here"
``

---

## Laptop question ($3000 vs cheaper)

A faster laptop makes **local** work snappier. It does **not** change Cursor AI speed or token usage. OneDrive can slow local builds — see [move-off-onedrive.md](./move-off-onedrive.md).

---

## Stuck?

| Problem | What to do |
|---------|------------|
| "not logged in" | Redo Step 1 |
| **"Repository not found"** | Repo doesn't exist OR wrong username — run **`gh repo create`** in Step 2; use **`cesarblendss-ai`**, not `cesarblendss` |
| "repo already exists" | Use the **only if already exists** blocks in Step 2 |
| Push rejected / unrelated history | Use `--force-with-lease` block in Step 2 |
| Push works but no Vercel deploy | Redo Step 3 — connect **`cesarblendss-ai/the-barber-lounge`** |
| **Author identity unknown** / unable to auto-detect email | In repo folder only (**NOT** `--global`): `& "C:\Program Files\Git\bin\git.exe" config user.name "Cesar"` then `& "C:\Program Files\Git\bin\git.exe" config user.email "cesar@users.noreply.github.com"` (from `cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge`) |
| **`running scripts is disabled`** / execution policy | Use **`ship.cmd`** in repo root (no admin settings needed) |
| Build errors locally only | See [move-off-onedrive.md](./move-off-onedrive.md) |

More detail: [git-deploy-workflow.md](./git-deploy-workflow.md)
