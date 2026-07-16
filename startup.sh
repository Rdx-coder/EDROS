    #!/usr/bin/env bash
    # startup.sh
    # Entrypoint shell script for containerized EDROS backend runtimes

    set -euo pipefail

    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Bootstrapping EDROS service runtime..."

    # Apply pending database migrations
    if [[ -n "${DATABASE_URL:-}" ]]; then
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Sanitizing DATABASE_URL connection string..."
      export DATABASE_URL=$(node -e "
        const url = process.env.DATABASE_URL;
        if (!url) { process.stdout.write(''); process.exit(0); }
        try {
          const prefix = url.startsWith('postgresql://') ? 'postgresql://' : url.startsWith('postgres://') ? 'postgres://' : '';
          if (!prefix) { process.stdout.write(url); process.exit(0); }
          const dynamicPart = url.substring(prefix.length);
          const questionMarkIndex = dynamicPart.indexOf('?');
          let mainPart = questionMarkIndex !== -1 ? dynamicPart.substring(0, questionMarkIndex) : dynamicPart;
          const queryPart = questionMarkIndex !== -1 ? dynamicPart.substring(questionMarkIndex) : '';
          const lastAtClass = mainPart.lastIndexOf('@');
          if (lastAtClass === -1) { process.stdout.write(url); process.exit(0); }
          const credentials = mainPart.substring(0, lastAtClass);
          const hostDb = mainPart.substring(lastAtClass + 1);
          const colonIndex = credentials.indexOf(':');
          if (colonIndex === -1) { process.stdout.write(url); process.exit(0); }
          const username = credentials.substring(0, colonIndex);
          const password = credentials.substring(colonIndex + 1);
          const decodedPassword = decodeURIComponent(password);
          const encodedPassword = encodeURIComponent(decodedPassword);
          process.stdout.write(prefix + username + ':' + encodedPassword + '@' + hostDb + queryPart);
        } catch (e) {
          process.stdout.write(url);
        }
      ")
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Applying database migrations..."
      npx prisma migrate deploy
    else
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [WARNING] DATABASE_URL is unset. Skipping automatic migrations."
    fi

    # Run the compiled backend service
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Launching Express server..."
    exec node dist/server.cjs
