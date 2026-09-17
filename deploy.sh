#!/usr/bin/env bash
# Redeploy de producción. Se ejecuta como leugiim en /srv/pokemon-dmg-calculator.
set -euo pipefail

git pull
pnpm install
pnpm build

# adapter-static borra y recrea build/ en cada pnpm build, lo que deja
# colgado el bind mount de Caddy sobre el build/ anterior (ver compose.yaml
# del repo devops) — hay que reiniciar el contenedor para que lo vuelva a
# resolver contra el directorio nuevo.
docker restart caddy
