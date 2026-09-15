@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "CLIENT=CesarBlendss"
set "PROJECT=THE-BARBER-LOUNGE"
set "SHORTCUT_NAME=The Barber Lounge"
set "DEST=%USERPROFILE%\Desktop\Clients\%CLIENT%\%PROJECT%"

echo Installing to:
echo   %DEST%
echo.

if not exist "%USERPROFILE%\Desktop\Clients\%CLIENT%" mkdir "%USERPROFILE%\Desktop\Clients\%CLIENT%"
if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%"

robocopy "%~dp0." "%DEST%" /E /XD node_modules .next .git /XF "THE-BARBER-LOUNGE.zip" /NFL /NDL /NJH /NJS /nc /ns /np
set "RC=%ERRORLEVEL%"
if %RC% GEQ 8 (
  echo Copy failed. robocopy exit code %RC%.
  pause
  exit /b 1
)

set "SHORTCUT=%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%DEST%\Start.bat'; $s.WorkingDirectory = '%DEST%'; $s.IconLocation = 'shell32.dll,137'; $s.Save()"

echo.
echo Done.
echo Folder: %DEST%
echo Shortcut: %SHORTCUT%
echo Double-click "%SHORTCUT_NAME%" on your Desktop, or open Start.bat in that folder.
pause
