#!/usr/bin/env bash
# List active LiveKit rooms for this deployment (prefix filter).
# Usage: bun run lk:rooms
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lk-env.sh
source "$ROOT/scripts/lk-env.sh"

PREFIX="${LIVEKIT_ROOM_PREFIX:-homebody}"
SEARCH="${PREFIX}_liveClass_"

echo "Active rooms matching: ${SEARCH}*"
echo "Server: $LIVEKIT_URL"
echo ""

if lk room list --json 2>/dev/null | jq -e 'type == "array"' >/dev/null 2>&1; then
  lk room list --json | jq --arg p "$SEARCH" '[.[] | select(.name | startswith($p))]'
else
  lk room list "$SEARCH" 2>&1 || lk room list 2>&1
fi
