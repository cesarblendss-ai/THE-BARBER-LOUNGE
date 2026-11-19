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

call "%DEST%\Make-Desktop-Shortcut.bat" /silent
if errorlevel 1 (
  echo Shortcut create failed.
  pause
  exit /b 1
)

echo.
echo Done.
echo Folder: %DEST%
echo Desktop shortcut: %SHORTCUT_NAME%  (with Barber Lounge logo)
echo Double-click "%SHORTCUT_NAME%" on your Desktop to start.
pause
