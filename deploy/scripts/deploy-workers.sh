#!/usr/bin/env bash
#
# Build the Angular SSR app as a platform-neutral Worker and deploy it
# to Cloudflare Workers (Workers Assets + SSR fallback).
#
# Usage:
#   bun run deploy:workers
#   ./deploy/scripts/deploy-workers.sh
#   ./deploy/scripts/deploy-workers.sh --dry-run
#
# First time on a machine: bunx wrangler login

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${ROOT_DIR}"

log() { printf '\033[0;36m▶ %s\033[0m\n' "$*"; }
die() { printf '\033[0;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v bun >/dev/null 2>&1 || die "bun is not installed."

if [[ ! -d node_modules/wrangler && ! -d apps/web/node_modules/wrangler ]]; then
  die "wrangler is not installed. Run: bun install"
fi

log "Building the Workers SSR bundle…"
bun run build:workers

log "Deploying to Cloudflare Workers…"
bunx wrangler deploy "$@"

log "✓ Worker deployed. The *.workers.dev URL is live."
log "  Attach outhanchazima.dev as a Worker custom domain when you want this"
log "  to be the public origin (instead of the Cloudflare Tunnel)."
