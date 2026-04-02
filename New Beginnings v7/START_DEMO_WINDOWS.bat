@echo off
REM START_DEMO_WINDOWS.bat
REM Double-click to start a local server in this folder and open the site.

setlocal
cd /d "%~dp0"
set "VERSION_NAME=v7"
set "START_PORT=8070"
set "END_PORT=8079"

set "PY_CMD="
where py >nul 2>nul
if %errorlevel%==0 set "PY_CMD=py -3"
if not defined PY_CMD (
  where python >nul 2>nul
  if %errorlevel%==0 set "PY_CMD=python"
)

if not defined PY_CMD (
  echo.
  echo Python was not found.
  echo Install Python from https://www.python.org/downloads/ and enable "Add Python to PATH"
  echo Then run this file again.
  echo.
  pause
  exit /b 1
)

set "PORT="
for /L %%P in (%START_PORT%,1,%END_PORT%) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul
  if errorlevel 1 (
    if not defined PORT set "PORT=%%P"
  )
)

if not defined PORT (
  echo.
  echo Could not find a free port between %START_PORT% and %END_PORT%.
  echo.
  pause
  exit /b 1
)

start "" "http://localhost:%PORT%/index.html?demo=%VERSION_NAME%-%RANDOM%"
echo %VERSION_NAME% demo is running at: http://localhost:%PORT%
%PY_CMD% -m http.server %PORT%
