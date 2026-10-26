#!/usr/bin/env bash
set -Eeuo pipefail
app=/opt/findtheweb-backend
candidate=/opt/findtheweb-seo-20261027-render1
backup=$app/rollback-seo-20261027-render1
test -f "$candidate/src/index.js"
test -f "$candidate/node_modules/sanitize-html/package.json"
test ! -e "$backup"
docker exec findtheweb-backend node scripts/seo-runtime.cjs backup
restore() {
 docker stop findtheweb-backend >/dev/null || true
 if test -d "$backup/node_modules"; then
  if test -d "$app/node_modules"; then mv "$app/node_modules" "$candidate/failed-node_modules"; fi
  mv "$backup/node_modules" "$app/node_modules"
 fi
 for file in package.json package-lock.json src/index.js src/routes/seo.js src/services/editorialSeo.js src/data/social-covers.json; do
  if test -f "$backup/$file"; then cp "$backup/$file" "$app/$file"; else rm -f "$app/$file"; fi
 done
 docker start findtheweb-backend >/dev/null
}
trap 'restore' ERR
docker stop findtheweb-backend >/dev/null
mv "$app/node_modules" "$backup/node_modules"
mv "$candidate/node_modules" "$app/node_modules"
for file in package.json package-lock.json src/index.js src/routes/seo.js src/services/editorialSeo.js src/data/social-covers.json; do
 mkdir -p "$(dirname "$app/$file")"
 cp "$candidate/$file" "$app/$file"
done
docker start findtheweb-backend >/dev/null
for attempt in $(seq 1 40); do
 if curl -fsS http://127.0.0.1:5000/health >/dev/null; then break; fi
 sleep 1
done
docker exec findtheweb-backend node scripts/seo-runtime.cjs verify
trap - ERR
echo 'SEO backend activated with rollback retained'
