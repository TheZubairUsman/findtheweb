#!/usr/bin/env bash
set -Eeuo pipefail
app=/opt/findtheweb-backend
candidate=/opt/findtheweb-deps-20261027-highfix1
backup="$app/rollback-security-20261027-highfix1"
service=findtheweb-backend
test "$(readlink -f "$app")" = /opt/findtheweb-backend
test "$(readlink -f "$candidate")" = /opt/findtheweb-deps-20261027-highfix1
test -d "$app/node_modules" && test ! -L "$app/node_modules"
test -d "$candidate/node_modules" && test ! -L "$candidate/node_modules"
test -f "$backup/database.sqlite" && test -f "$backup/baseline.json"
test ! -e "$backup/node_modules" && test ! -e "$candidate/node_modules.failed"
old_moved=0
new_moved=0
rollback() {
  trap - ERR
  docker stop -t 5 "$service" || true
  if [ "$new_moved" = 1 ]; then mv "$app/node_modules" "$candidate/node_modules.failed"; fi
  if [ "$old_moved" = 1 ]; then mv "$backup/node_modules" "$app/node_modules"; fi
  cp "$backup/package.json" "$app/package.json"
  cp "$backup/package-lock.json" "$app/package-lock.json"
  docker start "$service"
  echo "Dependency activation failed; old runtime restored. Backup: $backup" >&2
  exit 1
}
trap rollback ERR
docker stop -t 15 "$service"
mv "$app/node_modules" "$backup/node_modules"
old_moved=1
mv "$candidate/node_modules" "$app/node_modules"
new_moved=1
cp "$candidate/package.json" "$app/package.json"
cp "$candidate/package-lock.json" "$app/package-lock.json"
docker start "$service"
docker exec "$service" node /app/scripts/security-runtime.cjs verify
trap - ERR
echo "Security dependency activation verified. Rollback retained: $backup"
