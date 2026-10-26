#!/usr/bin/env bash
set -Eeuo pipefail
app=/opt/findtheweb-backend
candidate=/opt/findtheweb-seo-20261027-render1
backup=$app/rollback-seo-20261027-render1
file=src/models/BlogPost.js
test -f "$candidate/$file"
test -f "$backup/database.sqlite"
test ! -e "$backup/$file"
mkdir -p "$backup/src/models"
cp "$app/$file" "$backup/$file"
restore() { cp "$backup/$file" "$app/$file"; docker restart findtheweb-backend >/dev/null; }
trap 'restore' ERR
cp "$candidate/$file" "$app/$file"
docker restart findtheweb-backend >/dev/null
for attempt in $(seq 1 40); do
 if curl -fsS http://127.0.0.1:5000/health >/dev/null; then break; fi
 sleep 1
done
docker exec findtheweb-backend node scripts/seo-runtime.cjs verify
trap - ERR
echo 'Readership no longer changes editorial modification dates'
