#!/usr/bin/env bash
set -Eeuo pipefail
app=/opt/findtheweb-backend
release_id="${1:-safety1-20261027}"
[[ "$release_id" =~ ^[a-z0-9][a-z0-9-]{2,71}$ ]]
candidate=/opt/findtheweb-editorial-$release_id
backup=$app/rollback-editorial-tooling-$release_id
test ! -e "$backup/editorialSeo.js"
test -f "$candidate/editorialSeo.js"
test -f "$candidate/social-covers.json"
mkdir -p -m 700 "$backup"
chmod 700 "$backup"
cp "$app/src/services/editorialSeo.js" "$backup/editorialSeo.js"
cp "$app/src/data/social-covers.json" "$backup/social-covers.json"
restore() {
 cp "$backup/editorialSeo.js" "$app/src/services/editorialSeo.js"
 cp "$backup/social-covers.json" "$app/src/data/social-covers.json"
 docker restart findtheweb-backend >/dev/null
}
trap 'restore' ERR
cp "$candidate/editorialSeo.js" "$app/src/services/editorialSeo.js.candidate"
mv "$app/src/services/editorialSeo.js.candidate" "$app/src/services/editorialSeo.js"
cp "$candidate/social-covers.json" "$app/src/data/social-covers.json.candidate"
mv "$app/src/data/social-covers.json.candidate" "$app/src/data/social-covers.json"
docker restart findtheweb-backend >/dev/null
for attempt in $(seq 1 40); do
 if curl -fsS http://127.0.0.1:5000/health >/dev/null 2>&1; then break; fi
 sleep 1
done
docker exec findtheweb-backend node scripts/seo-runtime.cjs verify > "$candidate/runtime.json"
docker exec findtheweb-backend node scripts/editorial-batch.cjs preview "$release_id" > "$candidate/preview.json"
trap - ERR
echo 'Reading/social metadata deployed; integrity, counts and editorial preview verified'
