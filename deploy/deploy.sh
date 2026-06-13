#!/usr/bin/env bash
# PhotoOrder — обновление на VPS.
# Запускать из корня репозитория: bash deploy/deploy.sh

set -euo pipefail

echo "==> git pull"
git pull --ff-only

echo "==> npm ci (root + workspaces)"
npm ci

echo "==> prisma: generate + migrate deploy"
( cd server && npx prisma generate && npx prisma migrate deploy )

echo "==> client: build"
( cd client && npm run build )

echo "==> pm2 reload"
if pm2 describe photoorder >/dev/null 2>&1; then
  pm2 reload photoorder --update-env
else
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
fi

echo "==> done"
pm2 status
