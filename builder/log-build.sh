#!/usr/bin/env bash
set -u
LEVEL="${1:-info}"
MESSAGE="${2:-Build event}"
[ -z "${SUPABASE_URL:-}" ] && exit 0
jq -n --arg b "$BUILD_ID" --arg u "$BUILD_USER_ID" --arg l "$LEVEL" --arg m "$MESSAGE" '{build_id:$b,user_id:$u,level:$l,message:$m}' >/tmp/build-log.json
curl --silent --show-error -X POST "$SUPABASE_URL/rest/v1/build_logs" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/build-log.json >/dev/null || true
