#!/usr/bin/env bash
set -Eeuo pipefail
port="${SEO_QA_PORT:-5098}"
case "$port" in 5098|5099) ;; *) exit 1 ;; esac
printf 'Listen 127.0.0.1:%s\n' "$port" > /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost 127.0.0.1:$port>/" /etc/apache2/sites-available/000-default.conf
exec apache2-foreground
