#!/usr/bin/env bash
set -euo pipefail

echo "[AURABET doctor] Node: $(node -v 2>/dev/null || echo missing)"
echo "[AURABET doctor] npm:  $(npm -v 2>/dev/null || echo missing)"

echo "[AURABET doctor] npm registry: $(npm config get registry 2>/dev/null || echo unknown)"

echo "[AURABET doctor] Proxy env:"
env | rg -i 'proxy' || echo "  (none)"

echo "[AURABET doctor] Connectivity checks"
if curl -I -sS --max-time 5 https://registry.npmjs.org >/dev/null; then
  echo "  - direct npm registry: OK"
else
  echo "  - direct npm registry: FAIL"
fi

if env | rg -qi 'proxy'; then
  if curl -I -sS --max-time 5 --proxy "${HTTPS_PROXY:-${https_proxy:-}}" https://registry.npmjs.org >/dev/null; then
    echo "  - via proxy: OK"
  else
    echo "  - via proxy: FAIL"
  fi
fi

printf "\nIf install fails with 403/ENETUNREACH:\n"
echo "1) Try without proxy:"
echo "   env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY npm install"
echo "2) If your company requires proxy, configure approved proxy credentials in npmrc."
