#!/bin/zsh
# db-reset.sh: Destroys and recreates all Vizier SQLite databases from schema/seed
# Usage: sh db/db-reset.sh

set -e

cd "$(dirname "$0")"

echo "[db-reset] Removing old databases..."
rm -f auth.db chat.db vizier.db

echo "[db-reset] Initializing auth.db..."
sqlite3 auth.db < auth.schema.sql

echo "[db-reset] Initializing chat.db..."
sqlite3 chat.db < chat.schema.sql

echo "[db-reset] Initializing vizier.db..."
sqlite3 vizier.db < schema.sql
sqlite3 vizier.db < seed.sql

echo "[db-reset] Done."
echo "[db-reset] Reminder: Restart your Bun server before running tests or using the app!"
