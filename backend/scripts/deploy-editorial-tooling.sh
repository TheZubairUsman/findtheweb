#!/usr/bin/env bash
set -Eeuo pipefail
app=/opt/findtheweb-backend
candidate=/opt/findtheweb-editorial-safety1-20261027
backup=$app/rollback-editorial-tooling-safety1-20261027
test -f "$candidate/editorialRelease.js"
test -f "$candidate/editorial-batch.cjs"
test ! -e "$backup"
mkdir -m 700 "$backup"
cp "$app/src/services/editorialRelease.js" "$backup/editorialRelease.js"
cp "$app/scripts/editorial-batch.cjs" "$backup/editorial-batch.cjs"
restore() {
 cp "$backup/editorialRelease.js" "$app/src/services/editorialRelease.js"
 cp "$backup/editorial-batch.cjs" "$app/scripts/editorial-batch.cjs"
}
trap 'restore' ERR
cp "$candidate/editorialRelease.js" "$app/src/services/editorialRelease.js.candidate"
mv "$app/src/services/editorialRelease.js.candidate" "$app/src/services/editorialRelease.js"
cp "$candidate/editorial-batch.cjs" "$app/scripts/editorial-batch.cjs.candidate"
mv "$app/scripts/editorial-batch.cjs.candidate" "$app/scripts/editorial-batch.cjs"
chmod 600 "$app/editorial-releases/safety1-20261027.json"
docker exec findtheweb-backend node scripts/editorial-batch.cjs preview safety1-20261027 > "$candidate/preview.json"
trap - ERR
echo 'Editorial operator tooling installed; preview passed; web process unchanged'
