    #!/usr/bin/env bash
    # startup.sh
    # Entrypoint shell script for containerized EDROS backend runtimes

    set -euo pipefail

    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Bootstrapping EDROS service runtime..."

    # Apply pending database migrations
    if [[ -n "${DATABASE_URL:-}" ]]; then
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Applying database migrations..."
      npx prisma migrate deploy
    else
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [WARNING] DATABASE_URL is unset. Skipping automatic migrations."
    fi

    # Run the compiled backend service
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Launching Express server..."
    exec node dist/server.cjs
