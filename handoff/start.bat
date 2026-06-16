@echo off
REM Everyday â€?double-click launcher (Windows)
REM Starts a local server in .\www and opens the app full-screen in your browser.

cd /d "%~dp0www"
set PORT=8080
set URL=http://localhost:%PORT%/index.html?app=1

echo --------------------------------------------------
echo   Everyday is starting at:
echo   %URL%
echo   (Leave this window open. Close it to stop.)
echo --------------------------------------------------

start "" "%URL%"

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT%
  goto :eof
)
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT%
  goto :eof
)
where npx >nul 2>nul
if %errorlevel%==0 (
  npx --yes serve -l %PORT%
  goto :eof
)
echo You need Python or Node.js installed to run a local server.
echo Install Python from https://python.org then double-click this again.
pause
