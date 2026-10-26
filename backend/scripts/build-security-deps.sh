#!/usr/bin/env bash
set -Eeuo pipefail
candidate=/opt/findtheweb-deps-20261026-criticalfix1
test "$(readlink -f "$candidate")" = /opt/findtheweb-deps-20261026-criticalfix1
test -f "$candidate/package-lock.json"
# Compile native SQLite for Debian Bookworm (GLIBC 2.36), rather than using a
# downloaded SQLite 6 binary that currently requires a newer GLIBC runtime.
# Build tools exist only in this disposable container; the live image is kept.
docker run --rm --network host --name findtheweb-security-deps-builder \
  --mount "type=bind,src=$candidate,dst=/app" -w /app node:22-bookworm-slim \
  bash -lc 'apt-get update -qq && apt-get install -y --no-install-recommends python3 make g++ >/tmp/findtheweb-build-tools.log && npm ci --omit=dev --no-audit --no-fund && npm rebuild sqlite3 --build-from-source'
