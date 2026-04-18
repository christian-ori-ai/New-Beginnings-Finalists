#!/bin/zsh
# START_DEMO_MAC.command
# Double-click to start a local server in this folder and open the site.

cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 was not found. Install Python from https://www.python.org/downloads/"
  exit 1
fi

VERSION_NAME="v8"
START_PORT=8080
END_PORT=8089

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

open "http://localhost:${SELECTED_PORT}/index.html?demo=${VERSION_NAME}-$(date +%s)"
echo ""
echo "${VERSION_NAME} demo is running at: http://localhost:${SELECTED_PORT}"
echo "To stop: close this Terminal window."
echo ""
exec python3 -m http.server ${SELECTED_PORT}
