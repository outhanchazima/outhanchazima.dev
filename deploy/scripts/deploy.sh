#!/usr/bin/env bash
#
# Build and (re)deploy outhanchazima.dev on a Linux server.
# Idempotent: safe to re-run. Pulls latest images, rebuilds the app, and
# performs a rolling restart behind the Cloudflare tunnel.
#
# Usage:
#   ./deploy/scripts/deploy.sh            # build + up -d
#   ./deploy/scripts/deploy.sh --no-build # just restart with existing image

set -euo pipefail

# Resolve repo root regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${ROOT_DIR}"

COMPOSE_FILE="deploy/docker-compose.yml"
ENV_FILE="deploy/.env"
COMPOSE=(docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}")

log() { printf '\033[0;36m▶ %s\033[0m\n' "$*"; }
die() { printf '\033[0;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

[[ -f "${ENV_FILE}" ]] || die "Missing ${ENV_FILE}. Copy deploy/.env.example and fill it in."

command -v docker >/dev/null 2>&1 || die "docker is not installed."
docker compose version >/dev/null 2>&1 || die "docker compose v2 is required."

if [[ "${1:-}" == "--no-build" ]]; then
  log "Restarting stack (no rebuild)…"
  "${COMPOSE[@]}" up -d --remove-orphans
else
  log "Pulling base images…"
  "${COMPOSE[@]}" pull cloudflared || true
  log "Building and starting the stack…"
  "${COMPOSE[@]}" up -d --build --remove-orphans
fi

log "Pruning dangling images…"
docker image prune -f >/dev/null 2>&1 || true

log "Current status:"
"${COMPOSE[@]}" ps

log "Waiting for the web container to report healthy…"
for _ in $(seq 1 30); do
  status="$("${COMPOSE[@]}" ps --format '{{.Health}}' web 2>/dev/null || true)"
  if [[ "${status}" == "healthy" ]]; then
    log "✓ Deployed. outhanchazima.dev is live via the Cloudflare tunnel."
    exit 0
  fi
  sleep 2
done

die "Web container did not become healthy in time. Check: ${COMPOSE[*]} logs web"
