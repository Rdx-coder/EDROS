#!/usr/bin/env bash

# db-restore.sh
# Enterprise Restoration Utility for EDROS PostgreSQL Primary database instances.
# Supports full gzip decompression streams with interactive confirmations and verification checks.

set -euo pipefail

DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_DB:-edros_production}"
DB_USER="${DATABASE_USER:-edros_cluster_admin}"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>" >&2
    exit 1
fi

BACKUP_FILE="$1"

# Validation
if [[ ! -f "${BACKUP_FILE}" ]]; then
    echo "[ERROR] Backup file does not exist: ${BACKUP_FILE}" >&2
    exit 1
fi

echo "[WARNING] This will fully drop, recreate, and restore database: '${DB_NAME}'"
echo "[WARNING] Destination Target: postgres://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
read -r -p "Are you absolutely certain you wish to proceed? (yes/NO): " CONFIRMATION

if [[ "${CONFIRMATION}" != "yes" ]]; then
    echo "Restoration aborted by the systems administrator."
    exit 0
fi

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Terminating all active database connections before restoring..."
export PGPASSWORD="${PGPASSWORD:-}"
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" || true

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Re-creating clear database structures..."
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Streaming backup decompression and database restoration..."
if ! gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [FATAL] Database restoration failed!" >&2
    exit 1
fi

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO] Database successfully restored to previous point-in-time snapshot."
