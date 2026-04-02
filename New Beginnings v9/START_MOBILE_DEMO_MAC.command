#!/bin/zsh
# START_MOBILE_DEMO_MAC.command
# Double-click to start a LAN-accessible server and open the mobile demo URL.

cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 was not found. Install Python from https://www.python.org/downloads/"
  exit 1
fi

VERSION_NAME="v9-mobile"
START_PORT=8090
END_PORT=8099

SELECTED_PORT=""
for ((PORT=START_PORT; PORT<=END_PORT; PORT++)); do
  if lsof -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
    continue
  fi

  SELECTED_PORT=${PORT}
  break
done

if [ -z "${SELECTED_PORT}" ]; then
  echo "Could not start a local server on ports ${START_PORT}-${END_PORT}."
  exit 1
fi

LOCAL_IP="$(python3 - <<'PY'
import socket

ip = "127.0.0.1"
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]
except Exception:
    pass
finally:
    s.close()

print(ip)
PY
)"

URL="http://${LOCAL_IP}:${SELECTED_PORT}/index.html?demo=${VERSION_NAME}-$(date +%s)"
open "${URL}"

echo ""
echo "v9 mobile demo is running at: ${URL}"
echo "Use a phone/tablet on the same Wi-Fi network."
echo "If macOS prompts for firewall access, allow incoming connections for Python."
echo "To stop: close this Terminal window."
echo ""

exec python3 -m http.server ${SELECTED_PORT} --bind 0.0.0.0
