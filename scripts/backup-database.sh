#!/bin/bash

# Database backup script for AMHSJ
set -e

BACKUP_DIR="/backups/amhsj"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="amhsj_backup_${DATE}.sql"

echo "📦 Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress the backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "amhsj_backup_*.sql.gz" -mtime +30 -delete

echo "🧹 Old backups cleaned up"
