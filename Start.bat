@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install LTS from https://nodejs.org then double-click Start.bat again.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo Put Start.bat inside your the-barber-lounge folder, then double-click it.
  echo Expected folder: Desktop\the-barber-lounge
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting The Barber Lounge on http://localhost:3847
echo Keep this window open while you use the site.
start "" "http://localhost:3847"
call npx next dev -p 3847 -H 0.0.0.0
pause
