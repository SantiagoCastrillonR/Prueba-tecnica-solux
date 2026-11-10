#!/bin/sh
set -e

echo "[entrypoint] applying migrations"
node dist/migrate.js

if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] loading demo data (RUN_SEED=true)"
  node dist/seed.js
fi

echo "[entrypoint] starting the API"
exec node dist/main.js
