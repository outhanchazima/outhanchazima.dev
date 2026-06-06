#!/usr/bin/env bash
#
# One-time helper to create a locally-managed Cloudflare Tunnel and wire DNS.
# Only needed if you prefer the config-file approach over the token-based one.
# For the token-based setup, just create the tunnel in the Zero Trust dashboard
# and put TUNNEL_TOKEN in deploy/.env — no script required.
#
# Requires `cloudflared` installed locally and `cloudflared tunnel login` done.
#
# Usage: ./deploy/scripts/setup-tunnel.sh <tunnel-name>   (default: outhanchazima)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CF_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/cloudflared"
TUNNEL_NAME="${1:-outhanchazima}"
DOMAIN="outhanchazima.dev"

log() { printf '\033[0;36m▶ %s\033[0m\n' "$*"; }
die() { printf '\033[0;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v cloudflared >/dev/null 2>&1 || die "Install cloudflared first: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"

mkdir -p "${CF_DIR}"

log "Creating tunnel '${TUNNEL_NAME}'…"
cloudflared tunnel create "${TUNNEL_NAME}" || log "Tunnel may already exist; continuing."

TUNNEL_ID="$(cloudflared tunnel list --name "${TUNNEL_NAME}" --output json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"
[[ -n "${TUNNEL_ID}" ]] || die "Could not resolve tunnel ID."
log "Tunnel ID: ${TUNNEL_ID}"

# Move the credentials JSON into deploy/cloudflared so it can be mounted.
CRED_SRC="${HOME}/.cloudflared/${TUNNEL_ID}.json"
[[ -f "${CRED_SRC}" ]] && cp "${CRED_SRC}" "${CF_DIR}/${TUNNEL_ID}.json"

log "Routing DNS ${DOMAIN} and www.${DOMAIN} → tunnel…"
cloudflared tunnel route dns "${TUNNEL_NAME}" "${DOMAIN}" || true
cloudflared tunnel route dns "${TUNNEL_NAME}" "www.${DOMAIN}" || true

# Render config.yml from the example with the real tunnel ID.
sed "s/<TUNNEL_ID>/${TUNNEL_ID}/g" "${CF_DIR}/config.example.yml" > "${CF_DIR}/config.yml"

log "✓ Done. Credentials + config.yml written to ${CF_DIR}."
log "  Start with: docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.cloudflared-config.yml up -d --build"
