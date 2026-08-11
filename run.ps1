param(
  [Parameter(Position = 0)]
  [string]$Command = "help"
)

$Root = $PSScriptRoot
Set-Location $Root

function Show-Help {
  Write-Host @"
The Barber Lounge — Master CLI

  .\run.ps1 build       npm run build (clears .next first)
  .\run.ps1 dev         npm run dev
  .\run.ps1 seo-test    SEO agent smoke test
  .\run.ps1 seo-full    Full SEO pipeline
  .\run.ps1 seo-rank    Local rank scan
  .\run.ps1 seo-memory  Agent memory + suggestions
  .\run.ps1 deploy      Vercel production deploy (emergency only — prefer ship)
  .\run.ps1 ship [msg]  git add -A, commit, push to main (auto-deploy via Vercel)
  .\run.ps1 db-seed     npm run db:seed (appointments → Postgres)
  .\run.ps1 db-seed-products  npm run db:seed-products (retail inventory → Postgres)
"@
}

switch ($Command.ToLower()) {
  "help" { Show-Help }
  "build" {
    if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
    npm run build
  }
  "dev" { npm run dev }
  "seo-test" {
    Set-Location "$Root\tools\seo-agent"
    python run.py test
  }
  "seo-full" {
    Set-Location "$Root\tools\seo-agent"
    python run.py full "The Barber Lounge"
  }
  "seo-rank" {
    Set-Location "$Root\tools\seo-agent"
    python local_rank_scan.py
  }
  "seo-memory" {
    Set-Location "$Root\tools\seo-agent"
    python run.py memory
  }
  "deploy" {
    npx vercel --prod --yes
  }
  "ship" {
    $Git = "C:\Program Files\Git\bin\git.exe"
    if (-not (Test-Path $Git)) { $Git = "git" }
    $msg = if ($args.Count -gt 0) { $args -join " " } else { Read-Host "Commit message" }
    if ([string]::IsNullOrWhiteSpace($msg)) {
      Write-Host "Aborted: commit message required."
      exit 1
    }
    & $Git add -A
    & $Git commit -m $msg
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Nothing to commit or commit failed."
      exit $LASTEXITCODE
    }
    & $Git push origin main
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Pushed to main — Vercel will auto-deploy Production."
    }
  }
  "db-seed" {
    npm run db:seed
  }
  "db-seed-products" {
    npm run db:seed-products
  }
  default {
    Write-Host "Unknown command: $Command"
    Show-Help
    exit 1
  }
}
