#!/usr/bin/env bash
# Load LIVEKIT_* from the linked Convex deployment into the environment for `lk`.
# Usage: source scripts/lk-env.sh   OR   eval "$(scripts/lk-env.sh export)"
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

_load_one() {
  local key="$1"
  local val
  val="$(bunx convex env get "$key" 2>/dev/null | tr -d '\r' || true)"
  if [ -n "$val" ] && [ "$val" != "null" ]; then
    printf '%s=%q\n' "$key" "$val"
  fi
}

_export_block() {
  _load_one LIVEKIT_URL
  _load_one LIVEKIT_WS_URL
  _load_one LIVEKIT_API_KEY
  _load_one LIVEKIT_API_SECRET
  _load_one LIVEKIT_ROOM_PREFIX
}

if [ "${1:-}" = "export" ]; then
  _export_block
  exit 0
fi

# shellcheck disable=SC1090
eval "$(_export_block)"

if [ -z "${LIVEKIT_URL:-}" ] && [ -n "${LIVEKIT_WS_URL:-}" ]; then
  export LIVEKIT_URL="$LIVEKIT_WS_URL"
fi

if [[ "${LIVEKIT_URL:-}" == wss://* ]]; then
  export LIVEKIT_URL="https://${LIVEKIT_URL#wss://}"
elif [[ "${LIVEKIT_URL:-}" == ws://* ]]; then
  export LIVEKIT_URL="http://${LIVEKIT_URL#ws://}"
fi

if [ -z "${LIVEKIT_API_KEY:-}" ] || [ -z "${LIVEKIT_API_SECRET:-}" ] || [ -z "${LIVEKIT_URL:-}" ]; then
  echo "Missing LiveKit env in Convex. Log in (bunx convex dev) and set LIVEKIT_URL or LIVEKIT_WS_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET." >&2
  exit 1
fi
