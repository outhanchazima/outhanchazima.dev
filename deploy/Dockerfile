# syntax=docker/dockerfile:1
#
# Multi-stage build for the outhanchazima.dev portfolio.
# Build context is the repository root: `docker build -f deploy/Dockerfile .`
#
# Stage 1 builds the Angular SSR bundle with Bun.
# Stage 2 ships only the self-contained `dist/` output + Bun runtime.

# ---------- Builder ----------
# The Angular CLI requires a recent Node.js (>= v24.15). The `oven/bun:1` image
# bundles an older Node, so we build on a Node base image and bring the Bun
# binary along for fast, lockfile-pinned installs.
FROM oven/bun:1 AS bun
FROM node:24-bookworm-slim AS builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
RUN bun install --frozen-lockfile

# Build the application.
COPY . .
RUN cd apps/web && bun run build

# ---------- Runtime ----------
FROM oven/bun:1-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    NG_ALLOWED_HOSTS=outhanchazima.dev,www.outhanchazima.dev

# The SSR server bundle is self-contained (only Node built-ins), so we copy
# just the build output — no node_modules required at runtime.
COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 4000

# Run as the non-root `bun` user that ships with the image.
USER bun

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun --eval "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "dist/web/server/server.mjs"]
