# Move Repo Off OneDrive

**Last verified:** 2026-08-10  
**Audience:** Cesar (manual steps — agents should not move files for you)  
**Target path:** `C:\dev\the-barber-lounge`

---

## Why move?

The repo currently lives at:

```
C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
```

OneDrive sync and Next.js dev/build both write thousands of small files under `.next/` at the same time. That race causes intermittent local failures that look like code bugs but are environment issues.

**Production is fine.** Vercel builds on remote servers with no OneDrive. This guide is only for reliable **local** `npm run dev` and `npm run build`.

Related quick reference: [`docs/team-memory/flaky-tests.md`](../team-memory/flaky-tests.md)

---

## Why OneDrive breaks `.next`

Next.js writes a large, constantly changing cache under `.next/` during dev and build:

| Activity | What Next.js does |
|----------|-------------------|
| `npm run dev` | Hot reload, webpack chunks, server manifests — files created/deleted every save |
| `npm run build` | Full compile output, type checks, static assets |

OneDrive treats that folder like normal user documents and tries to sync every change. That causes:

1. **File locks** — OneDrive holds files open while uploading; Next.js can't read/write them → `EINVAL`, `EBUSY`, or "resource busy" errors.
2. **Partial writes** — A file may be synced mid-write, producing corrupt webpack chunks or manifests.
3. **Sync churn** — Thousands of tiny files trigger constant CPU/disk use and sync queue backlog.
4. **Placeholder files** — Files-on-demand can leave `.next` entries as cloud-only stubs until opened, breaking Node's synchronous reads.

**Typical symptoms:**

- `npm run build` fails with file lock or `EINVAL` errors
- Dev server dies; browser shows `ERR_CONNECTION_REFUSED` on `localhost:3000`
- Hot reload stops working or shows "Cannot find module" after a successful compile
- Errors disappear after deleting `.next`, then return within minutes

Deleting `.next` is a **temporary** fix. Moving the repo outside OneDrive is the **permanent** fix.

---

## Before you start

- [ ] Close any terminal running `npm run dev` in the old folder
- [ ] Close Cursor windows opened on the OneDrive path (or you'll copy locked files)
- [ ] Confirm you have ~500 MB free on `C:` (repo + fresh `node_modules`; skip copying old `node_modules`)

**You need to copy manually** — env files (`.env.local`, etc.) are gitignored and won't come back from `git clone` alone.

---

## Step 1 — Create the destination folder

Open **PowerShell** (not inside the repo):

```powershell
New-Item -ItemType Directory -Force -Path C:\dev
```

---

## Step 2 — Copy the repo (exclude heavy/regenerable folders)

Use `robocopy` so you can skip `node_modules` and `.next` (both are rebuilt locally):

```powershell
robocopy `
  "C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge" `
  "C:\dev\the-barber-lounge" `
  /E `
  /XD node_modules .next .git `
  /XF *.log `
  /NFL /NDL /NJH /NJS /nc /ns /np
```

| Flag | Purpose |
|------|---------|
| `/E` | Copy subfolders, including empty ones |
| `/XD node_modules .next .git` | Skip dependencies, build cache, and git metadata (see note below) |
| `/NFL /NDL …` | Quieter output |

**About `/XD .git`:** This copies source + docs + env files but **not** git history. Two options:

| Option | When to use |
|--------|-------------|
| **A — Copy without `.git` (above)** | Fastest. Re-init git or clone from GitHub later if needed. |
| **B — Include `.git`** | Remove `.git` from `/XD` so history, branches, and remotes come along. Slightly slower but keeps `git status` as-is. |

**Env files to verify landed** (gitignored — robocopy copies them unless excluded):

```powershell
Get-ChildItem C:\dev\the-barber-lounge\.env* -Force
```

You should see at least `.env.local`. Copy any missing secrets manually from the OneDrive folder.

**Optional — also skip OneDrive sync on the old copy later:** Once the new path works, archive or delete the Desktop copy so you don't edit the wrong tree.

---

## Step 3 — Install dependencies

```powershell
cd C:\dev\the-barber-lounge
npm install
```

`postinstall` runs `prisma generate` automatically.

If Prisma client errors appear:

```powershell
npx prisma generate
```

---

## Step 4 — Update Cursor workspace

1. **File → Open Folder…** (or **File → Open…** on macOS-style menus)
2. Select `C:\dev\the-barber-lounge`
3. Confirm the window title / Explorer root shows `the-barber-lounge` under `C:\dev`, not `OneDrive\Desktop`
4. Close old Cursor windows pointed at the Desktop path to avoid editing the wrong copy

**Terminal default:** New integrated terminals should open in `C:\dev\the-barber-lounge`. Run `pwd` (PowerShell: `Get-Location`) once to confirm.

**If you use a multi-root workspace (`.code-workspace`):** Edit the `"path"` entry to `"C:\\dev\\the-barber-lounge"` and reopen the workspace file.

**Agent chats:** New chats inherit the open folder. Old chats tied to the OneDrive path may still reference old paths in history — prefer starting a fresh agent session on the new root.

---

## Step 5 — Verify build

Run these in order from `C:\dev\the-barber-lounge`:

```powershell
# 1. Production build (the real test)
npm run build

# 2. Dev server smoke test
npm run dev
```

Then open http://localhost:3000 — homepage should load.

**Success criteria:**

| Check | Expected |
|-------|----------|
| `npm run build` | Completes with no file-lock / `EINVAL` errors |
| `.next` folder | Created under `C:\dev\the-barber-lounge\.next` (not syncing to OneDrive) |
| `npm run dev` | Server stays up; hot reload works after a small edit |
| Lint (optional) | `npm run lint` passes |

Stop the dev server with `Ctrl+C` when done.

---

## Step 6 — Point your habits at the new path

Update bookmarks, shortcuts, and muscle memory:

| Old | New |
|-----|-----|
| `cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge` | `cd C:\dev\the-barber-lounge` |

If you add a PowerShell profile alias:

```powershell
function barber { Set-Location C:\dev\the-barber-lounge }
```

**Docs that mention the old path** (update when you touch them): `docs/team-memory/current-session.md`, `docs/org-conventions/one-shot-agents.md`, and similar runbooks.

---

## After migration — what to do with the OneDrive copy

Pick one — don't keep two live copies:

1. **Rename** the Desktop folder to `the-barber-lounge-OLD` so accidental edits are obvious, or
2. **Delete** it after a week of stable builds on `C:\dev`, or
3. **Leave as read-only archive** — do not run `npm run dev` there again

Do **not** sync `.next` or `node_modules` to OneDrive on any future project. Keep code under `C:\dev\` or another non-synced path.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build still fails with locks | Confirm you're in `C:\dev\...`, not Desktop. Delete `.next`, retry. |
| Missing env vars / API errors locally | Copy `.env.local` from old folder; compare with `.env.example`. |
| Port 3000 in use | `Get-NetTCPConnection -LocalPort 3000` then stop the stale process, or change port in `package.json` temporarily. |
| Wrong folder in Cursor | Re-open folder from Step 4; check terminal `Get-Location`. |
| Need git history | Re-copy with `.git` included, or `git clone <remote>` into `C:\dev\the-barber-lounge` and copy env files over. |

**Temporary workaround** (stay on OneDrive): delete `.next` and restart dev — see [`flaky-tests.md`](../team-memory/flaky-tests.md). This does not fix the underlying sync race.

---

## Quick checklist

```
[ ] Created C:\dev\the-barber-lounge
[ ] Copied repo (skipped node_modules + .next)
[ ] Verified .env.local present
[ ] npm install
[ ] npm run build — success
[ ] npm run dev — localhost:3000 loads
[ ] Cursor opened on C:\dev\the-barber-lounge
[ ] Old OneDrive copy renamed or retired
```
