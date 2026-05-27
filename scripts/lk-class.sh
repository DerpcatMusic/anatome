#!/usr/bin/env bash
# Inspect a class LiveKit room: list room metadata + participants.
# Usage: bun run lk:class -- kd7dfr344ckvh676bf8xkp6bpx87faqa
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lk-env.sh
source "$ROOT/scripts/lk-env.sh"

CLASS_ID="${1:?Usage: lk-class.sh <liveClassId>}"
PREFIX="${LIVEKIT_ROOM_PREFIX:-homebody}"
ROOM="${PREFIX}_liveClass_${CLASS_ID}"

echo "Convex class:  $CLASS_ID"
echo "LiveKit room:  $ROOM"
echo "Server:        $LIVEKIT_URL"
echo ""

echo "=== Room (active sessions only) ==="
if lk room list "$ROOM" --json 2>/dev/null | jq -e . >/dev/null 2>&1; then
  lk room list "$ROOM" --json | jq .
else
  lk room list "$ROOM" 2>&1 || echo "(no active room — class may be ended or nobody connected)"
fi

echo ""
echo "=== Participants ==="
if lk room participants list "$ROOM" --json 2>/dev/null | jq -e . >/dev/null 2>&1; then
  lk room participants list "$ROOM" --json | jq .
else
  lk room participants list "$ROOM" 2>&1 || echo "(none)"
fi
