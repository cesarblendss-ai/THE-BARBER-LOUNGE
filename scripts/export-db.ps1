# Export Neon Postgres to backups/ (manual weekly backup helper).
# Requires: pg_dump on PATH, .env.production.local with TBLDB_DATABASE_URL_UNPOOLED
# Usage: .\scripts\export-db.ps1
# Docs:  docs/operations/database-backups.md

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Read-EnvValue {
    param([string]$Name, [string]$FilePath)
    $line = Get-Content $FilePath | Where-Object { $_ -match "^\s*$Name\s*=" } | Select-Object -First 1
    if (-not $line) { return $null }
    if ($line -match '^\s*\w+\s*=\s*"([^"]*)"') { return $Matches[1] }
    if ($line -match '^\s*\w+\s*=\s*([^\s#]+)') { return $Matches[1] }
    return $null
}

# --- pg_dump ---
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Error @"
pg_dump not found. Install PostgreSQL client tools:
  https://www.postgresql.org/download/windows/
See docs/operations/database-backups.md
"@
}

$envFile = if ($env:NEON_ENV_FILE) { $env:NEON_ENV_FILE } else { ".env.production.local" }
if (-not (Test-Path $envFile)) {
    Write-Error "Missing $envFile. Run: npx vercel env pull .env.production.local"
}

$urlKeys = @(
    "TBLDB_DATABASE_URL_UNPOOLED",
    "TBLDB_POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
    "TBLDB_DATABASE_URL",
    "DATABASE_URL"
)
$url = $null
foreach ($key in $urlKeys) {
    $candidate = Read-EnvValue -Name $key -FilePath $envFile
    if ($candidate -and $candidate -match "^postgres") {
        if ($candidate -match "-pooler") {
            Write-Warning "Skipping pooled URL from $key (pg_dump needs direct/unpooled connection)."
            continue
        }
        $url = $candidate
        break
    }
}
if (-not $url) {
    Write-Error "No unpooled postgres URL in $envFile. Expected TBLDB_DATABASE_URL_UNPOOLED."
}

$date = Get-Date -Format "yyyy-MM-dd"
$backupDir = Join-Path $Root "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$dumpPath = Join-Path $backupDir "tbl-$date.dump"

Write-Host "Exporting to $dumpPath ..."
& pg_dump -Fc -v -d $url -f $dumpPath
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$sizeKb = [math]::Round((Get-Item $dumpPath).Length / 1KB, 1)
Write-Host "Done. $dumpPath ($sizeKb KB)"

# --- JSON fallback (appointments still on file store) ---
$apptSrc = Join-Path $Root "data\appointments.json"
if (Test-Path $apptSrc) {
    $apptDst = Join-Path $backupDir "appointments-$date.json"
    Copy-Item $apptSrc $apptDst -Force
    Write-Host "Copied $apptDst"
}

Write-Host ""
Write-Host "Next: verify file size, store off-repo, prune backups older than 4 weeks."
Write-Host "See docs/operations/database-backups.md"
