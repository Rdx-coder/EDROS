#!/usr/bin/env bash

# db-migrate.sh
# Pre-deployment migration script checking schema state and rolling forward database schema definitions.

set -euo pipefail

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Executing pre-deployment database integrity checks..."

if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [ERROR] DATABASE_URL environment variable is unset. Migration terminated." >&2
    exit 1
fi

# Run Prisma schema migrations safely on startup / deploy
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Applying pending Prisma database migrations..."
if ! npx prisma migrate deploy; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [FATAL] Prisma migration rollout failed! Aborting deployment lifecycle." >&2
    exit 1
fi

# Generate client schemas to keep dependencies fresh
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Regenerating local Prisma client typings..."
npx prisma generate

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Database migrations successfully applied and validated."
