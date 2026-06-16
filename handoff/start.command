#!/bin/bash
# Everyday �?double-click launcher (macOS / Linux)
# Starts a local server in ./www and opens the app full-screen in your browser.
# First time on macOS: right-click �?Open (to bypass the unidentified-dev warning),
# or run once in Terminal:  chmod +x start.command

cd "$(dirname "$0")/www" || { echo "www/ folder not found next to this script."; read -r -p "Press enter to close"; exit 1; }

PORT=8080
URL="http://localhost:${PORT}/index.html?app=1"
echo "──────────────────────────────────────────────"
echo "  Everyday is starting at:"
echo "  $URL"
echo "  (Leave this window open. Press Ctrl+C to stop.)"
echo "──────────────────────────────────────────────"

# Open the browser shortly after the server boots.
( sleep 1; open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx --yes serve -l "$PORT"
else
  echo "You need Python or Node.js installed to run a local server."
  echo "Install Python from https://python.org then double-click this again."
  read -r -p "Press enter to close"
fi
