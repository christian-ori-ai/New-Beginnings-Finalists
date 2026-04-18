@echo off
REM START_MOBILE_DEMO_WINDOWS.bat
REM Double-click to start a LAN-accessible server and open the mobile demo URL.

setlocal
cd /d "%~dp0"
set "VERSION_NAME=v8-mobile"
set "START_PORT=8080"
set "END_PORT=8089"

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

set "LOCAL_IP="
for /f %%I in ('powershell -NoProfile -Command "$ip=(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue ^| Where-Object { $_.IPAddress -notlike ''169.254*'' -and $_.IPAddress -ne ''127.0.0.1'' } ^| Select-Object -First 1 -ExpandProperty IPAddress); if(-not $ip){$ip='127.0.0.1'}; Write-Output $ip"') do (
  if not defined LOCAL_IP set "LOCAL_IP=%%I"
)

if not defined LOCAL_IP set "LOCAL_IP=127.0.0.1"

set "URL=http://%LOCAL_IP%:%PORT%/index.html?demo=%VERSION_NAME%-%RANDOM%"
start "" "%URL%"

echo %VERSION_NAME% demo is running at: %URL%
echo Use a phone/tablet on the same Wi-Fi network.
echo If Windows Firewall prompts for Python, allow access on Private networks.
echo To stop: close this Command Prompt window or press Ctrl + C.

%PY_CMD% -m http.server %PORT% --bind 0.0.0.0
