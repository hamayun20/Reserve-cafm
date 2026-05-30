#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${POSTGRES_URL:-}" ]; then
    export DATABASE_URL="$POSTGRES_URL"
  elif [ -n "${POSTGRES_PRISMA_URL:-}" ]; then
    export DATABASE_URL="$POSTGRES_PRISMA_URL"
  elif [ -n "${DATABASE_PRIVATE_URL:-}" ]; then
    export DATABASE_URL="$DATABASE_PRIVATE_URL"
  fi
fi

if [ -n "${DATABASE_URL:-}" ]; then
  DB_HOST="$(printf '%s' "$DATABASE_URL" | sed -E 's#^[^@]*@([^/:?]+).*#\1#')"
  echo "Database URL found. Preparing Prisma schema for host: ${DB_HOST}"

  attempt=1
  max_attempts=20
  until ./node_modules/.bin/prisma db push; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "Database schema push failed after ${max_attempts} attempts. Starting app so health checks and logs remain available."
      break
    fi
    echo "Database not ready yet. Retrying schema push in 3 seconds... (${attempt}/${max_attempts})"
    attempt=$((attempt + 1))
    sleep 3
  done

  if ./node_modules/.bin/prisma db seed; then
    echo "Database seed completed."
  else
    echo "Database seed skipped or failed. App will still start; check /api/health for DB status."
  fi
else
  echo "No database URL found. Starting in demo mode without database initialization."
fi

exec node server.js
