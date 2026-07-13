#!/usr/bin/env bash
# Local dev loop: rebuild on change + serve public/ with clean URLs.
#
# Rebuilds the site with the Rust SSG and serves the output. If `cargo-watch`
# and `watchexec` are unavailable it falls back to a simple polling rebuild.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-8000}"
URL="http://localhost:${PORT}/"

build() {
  ( cd ssg && SSG_ROOT="$ROOT" cargo run --quiet )
}

echo "Dev server will be available at ${URL} (set PORT to override)."
echo "Initial build..."
build

# Serve public/ in the background (python http.server resolves dir/index.html,
# giving Netlify-like clean URLs for /projects/<slug>/ etc.).
python3 -m http.server "$PORT" --directory public &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
echo "Serving ${URL}"

# Watch for changes.
if command -v watchexec >/dev/null 2>&1; then
  watchexec -w content -w templates -w static -w ssg/src -- \
    bash -c 'cd ssg && SSG_ROOT="'"$ROOT"'" cargo run --quiet'
elif command -v cargo-watch >/dev/null 2>&1; then
  ( cd ssg && SSG_ROOT="$ROOT" cargo watch -w ../content -w ../templates -w ../static -w src -x run )
else
  echo "Tip: install 'watchexec' or 'cargo-watch' for change detection."
  echo "Falling back to 2s polling rebuild. Ctrl-C to stop."
  LAST=""
  while true; do
    NOW="$(find content templates static ssg/src -type f -newer /tmp 2>/dev/null -printf '%T@ %p\n' 2>/dev/null | sort | md5 2>/dev/null || \
           find content templates static ssg/src -type f 2>/dev/null -exec stat -f '%m %N' {} + | sort | md5)"
    if [ "$NOW" != "$LAST" ]; then
      build || true
      LAST="$NOW"
    fi
    sleep 2
  done
fi
