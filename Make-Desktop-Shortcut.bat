@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "SHORTCUT_NAME=The Barber Lounge"
set "SHORTCUT=%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk"
set "TARGET=%~dp0Start.bat"
set "ICON=%~dp0BarberLounge.ico"
if not exist "%ICON%" set "ICON=%~dp0public\BarberLounge.ico"

if not exist "%TARGET%" (
  echo Start.bat not found next to this file.
  if /I not "%~1"=="/silent" pause
  exit /b 1
)

if not exist "%ICON%" (
  echo BarberLounge.ico not found. Using default icon.
  set "ICON=shell32.dll,137"
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$s = $ws.CreateShortcut('%SHORTCUT%');" ^
  "$s.TargetPath = '%TARGET%';" ^
  "$s.WorkingDirectory = '%~dp0';" ^
  "$s.WindowStyle = 1;" ^
  "$s.Description = 'The Barber Lounge';" ^
  "$s.IconLocation = '%ICON%';" ^
  "$s.Save()"

if errorlevel 1 (
  echo Could not create Desktop shortcut.
  if /I not "%~1"=="/silent" pause
  exit /b 1
)

echo Desktop shortcut ready: %SHORTCUT%
echo Name: %SHORTCUT_NAME%
echo Logo: %ICON%
if /I not "%~1"=="/silent" (
  echo.
  echo You can delete any old URL shortcut you made by hand.
  pause
)
exit /b 0
