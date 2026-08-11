# Database Backups — The Barber Lounge

**Last verified:** 2026-08-10  
**Database:** Vercel Postgres (Neon) via `DATABASE_URL` / `TBLDB_*` env vars  
**Schema:** `prisma/schema.prisma` — analytics, appointments, retail products

This doc covers what Neon’s **free tier** actually protects, how to take **manual exports**, and how to set a **weekly reminder** so backups do not depend on memory alone.

---

## Why manual backups matter

On Neon’s **Free** plan you get:

| Feature | Free tier limit |
|---------|-----------------|
| **Instant restore (PITR)** | **6 hours** of change history (capped at 1 GB) |
| **Manual snapshots** | **1** snapshot per project |
| **Scheduled snapshots** | **Not available** (paid plans only) |

That means a mistake from yesterday, a bad migration, or losing Neon/Vercel access is **not** covered by platform backups alone. A weekly `pg_dump` to local disk (or OneDrive) is cheap insurance.

**Also back up JSON fallback data** while appointments may still live in `data/appointments.json` on serverless (see `docs/knowledge/tech-stack-decisions.md`). Copy that file into the same backup folder when Postgres is not yet the source of truth for bookings.

---

## What is in the database

| Area | Prisma models | Notes |
|------|---------------|-------|
| Site analytics | `Session`, `PageView`, `ClickEvent` | Anonymous traffic; no PII unless linked to booking flow |
| Appointments | `Appointment`, `BlockedSlot` | Used when `DATABASE_URL` is connected |
| Retail | `Product`, `ProductSale` | Shop log / admin inventory |

Until `DATABASE_URL` is connected on Vercel, bookings and some admin data may exist only in JSON files under `data/`.

---

## Prerequisites

1. **Neon database connected** to the Vercel project (`DATABASE_URL` injected). See `docs/team-memory/deploy.md` and `docs/team-memory/current-session.md` for dashboard steps.
2. **Connection strings pulled locally:**
   ```powershell
   cd C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge
   npx vercel env pull .env.production.local
   ```
3. **`pg_dump` installed** — ships with [PostgreSQL for Windows](https://www.postgresql.org/download/windows/). Verify:
   ```powershell
   pg_dump --version
   ```
   Use a client version **≥** your Neon Postgres major version.

---

## Option A — Manual export with `pg_dump` (recommended)

`pg_dump` needs a **direct (unpooled)** connection. Pooled hostnames (`-pooler` in the hostname) can fail or produce incomplete dumps.

### Get the direct URL

From `.env.production.local`, use **`TBLDB_DATABASE_URL_UNPOOLED`** (Vercel Neon integration) or the unpooled string from the Neon Console **Connect** widget (toggle **Connection pooling** off).

Do **not** paste connection strings into chat, commits, or docs.

### One-off dump (custom format — best for restore)

```powershell
$date = Get-Date -Format "yyyy-MM-dd"
New-Item -ItemType Directory -Force -Path "backups" | Out-Null

# Replace with your unpooled URL from .env.production.local (never commit this)
$env:NEON_URL = "<TBLDB_DATABASE_URL_UNPOOLED>"

pg_dump -Fc -v -d $env:NEON_URL -f "backups\tbl-$date.dump"
```

### Plain SQL (human-readable)

```powershell
pg_dump -d $env:NEON_URL -f "backups\tbl-$date.sql"
```

### Copy JSON fallback in the same run

```powershell
Copy-Item "data\appointments.json" "backups\appointments-$date.json" -ErrorAction SilentlyContinue
```

### Restore later

Custom format (`.dump`):

```powershell
pg_restore -v -d $env:TARGET_DATABASE_URL --clean --if-exists --no-owner "backups\tbl-2026-08-10.dump"
```

Plain SQL:

```powershell
psql -d $env:TARGET_DATABASE_URL -f "backups\tbl-2026-08-10.sql"
```

Test restores on a **Neon branch** or local Postgres before touching production.

### Helper script (stub)

```powershell
.\scripts\export-db.ps1
```

See `scripts/export-db.ps1`. It reads the unpooled URL from `.env.production.local` and writes timestamped files under `backups/`.

---

## Option B — Neon Console (snapshot or instant restore)

Use the console when you want a quick in-platform checkpoint without local tools.

### Manual snapshot (1 on Free plan)

1. Open [Neon Console](https://console.neon.tech) → your project (linked from Vercel **Storage**).
2. Enable **Enhanced view** if prompted → **Backup & restore**.
3. Click **Create snapshot** on the **production** / root branch before risky changes (schema push, bulk delete, migration).
4. Name it clearly, e.g. `pre-prisma-push-2026-08-10`.

Free plan allows **one manual snapshot** at a time. Delete or restore the old one before creating another, or upgrade for more.

### Instant restore (last 6 hours only)

**Settings → Instant restore** shows the history window (6 h max on Free).

To roll back recent damage:

1. **Backup & restore** → choose timestamp or use **Time Travel** to inspect data first.
2. **Restore** overwrites the branch; Neon keeps a backup branch named `<branch> (old)`.

This does **not** replace off-platform weekly exports.

---

## Where to store backups

| Location | Pros |
|----------|------|
| `backups/` on Desktop (OneDrive-synced folder) | Automatic cloud copy; easy to find |
| External drive / separate cloud account | Survives account lockout or repo loss |

**Never commit** dump files or `.env` files. Add to `.gitignore` if you keep dumps inside the repo folder:

```
/backups/
*.dump
```

Rotate: keep **4 weekly** + **1 monthly** copy; delete older files to save space.

---

## Weekly backup reminder

Pick one method and stick to it. **Suggested day:** Sunday evening or Monday morning (low shop traffic).

### 1. Calendar (simplest)

Create a recurring event:

- **Title:** `TBL — weekly DB backup`
- **When:** Every **Monday 8:00 AM**
- **Notes:** Run `.\scripts\export-db.ps1` · verify `backups\tbl-YYYY-MM-DD.dump` exists · copy `data\appointments.json`

### 2. Windows Task Scheduler

Run the export script every Monday:

1. Open **Task Scheduler** → **Create Task**.
2. **Triggers:** Weekly, Monday, 8:00 AM.
3. **Actions:** Start a program  
   - Program: `powershell.exe`  
   - Arguments: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\Cesar\OneDrive\Desktop\the-barber-lounge\scripts\export-db.ps1"`
4. **Conditions:** Uncheck “Start only if on AC power” if on a laptop.
5. After first run, confirm a new file appears in `backups/`.

Ensure `.env.production.local` exists on that machine (refresh periodically with `npx vercel env pull`).

### 3. ntfy reminder (optional)

If you already use ntfy for booking alerts, schedule a **separate** weekly ntfy ping (cron job, GitHub Action, or phone automation) with body: “Run TBL database backup — see docs/operations/database-backups.md”. This nudges you; it does not run the dump by itself unless you wire Task Scheduler as above.

---

## Pre-flight checklist (weekly, ~2 minutes)

- [ ] `pg_dump --version` works
- [ ] `.env.production.local` has current `TBLDB_DATABASE_URL_UNPOOLED`
- [ ] `.\scripts\export-db.ps1` completes without errors
- [ ] New file in `backups/` is non-zero size
- [ ] `data\appointments.json` copied if still in use
- [ ] Old backups pruned (keep last 4 weeks)

---

## Before risky changes

1. Create a **Neon manual snapshot** (if slot free) **or** run `export-db.ps1`.
2. Run schema changes via `npm run db:push` only after backup.
3. For production data deletes, test on a Neon **branch** first.

---

## Related docs

| Doc | Topic |
|-----|-------|
| `docs/knowledge/tech-stack-decisions.md` | Postgres vs JSON appointments |
| `docs/team-memory/deploy.md` | Vercel env and deploy |
| `scripts/with-neon-env.mjs` | Run arbitrary commands with Neon `DATABASE_URL` |
| [Neon backup & restore](https://neon.com/docs/guides/backup-restore) | Snapshots, PITR, schedules |
| [Neon pg_dump guide](https://neon.com/docs/manage/backup-pg-dump) | Official dump/restore reference |

---

## Upgrading backup coverage (optional)

If analytics and appointments become business-critical:

- **Neon Launch plan** — scheduled snapshots, up to 7-day PITR history.
- **More manual snapshots** — paid plans allow up to 100.
- **Automate** — extend `export-db.ps1` and run via Task Scheduler + upload to encrypted cloud storage.

Until then, **weekly manual `pg_dump` + one Neon snapshot before migrations** is the right free-tier workflow.
