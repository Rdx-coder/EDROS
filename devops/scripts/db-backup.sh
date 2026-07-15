#!/usr/bin/env bash

# db-backup.sh
# Production Automated Database Backup Utility for EDROS Primary Core Database (PostgreSQL)
# Implements full streaming gzip compressions and modern logging checks.

set -euo pipefail

# Enterprise Defaults
BACKUP_DIR="${BACKUP_DIR:-/var/backups/edros}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_DB:-edros_production}"
DB_USER="${DATABASE_USER:-edros_cluster_admin}"
RETENTION_DAYS=30

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Starting backup operation of database: '${DB_NAME}'"

# Ensure Output Directory Exists
mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/edros_${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

# Run Backup using pg_dump with custom parameters for max speed & compression
export PGCONNECT_TIMEOUT=15
if ! pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -F p | gzip -c > "${BACKUP_FILE}"; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [ERROR] Database dump failed!" >&2
    exit 1
fi

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Backup successfully completed: ${BACKUP_FILE}"

# Calculate file sizes and integrity metadata
FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Backup Size: ${FILESIZE}"

# Purge backups exceeding standard retention days to preserve storage namespaces
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Cleaning up archives older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "edros_${DB_NAME}_backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Backup engine workflow successfully finalized."
