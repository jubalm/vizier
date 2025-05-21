#!/bin/zsh
# db-setup.sh: Recreate and initialize all Vizier SQLite databases
# Usage: sh db/db-setup.sh

set -e

cd "$(dirname "$0")"

echo "[db-setup] Removing old databases..."
rm -f auth.db chat.db vizier.db

echo "[db-setup] Initializing auth.db..."
sqlite3 auth.db < auth.schema.sql

echo "[db-setup] Initializing chat.db..."
sqlite3 chat.db < chat.schema.sql

echo "[db-setup] Initializing vizier.db..."
sqlite3 vizier.db < ../src/schema.sql
sqlite3 vizier.db < ../src/seed.sql

echo "[db-setup] Done."
