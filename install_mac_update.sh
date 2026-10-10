#!/bin/sh
set -eu
ROOT="${BD_VAULT_INSTALL_DIR:-$HOME/Documents/vault}"
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ ! -f "$ROOT/vault_server.py" ]; then
  printf '%s\n' 'Vault-Verzeichnis nicht gefunden:' "$ROOT" >&2
  exit 1
fi
if command -v lsof >/dev/null 2>&1 && lsof -nPiTCP:47831 -sTCP:LISTEN 2>/dev/null | grep -q 'LISTEN'; then
  echo 'Bitte laufenden Vault zuerst beenden; Update abgebrochen.' >&2
  exit 1
fi
for f in vault_server.py key_rotation.py update_engine.py build-version.json; do
  if [ ! -f "$HERE/vault/$f" ]; then echo "Paket unvollständig: $f" >&2; exit 1; fi
done
mkdir -p "$ROOT"
for f in vault_server.py key_rotation.py update_engine.py build-version.json; do
  cp "$HERE/vault/$f" "$ROOT/$f.update-tmp"
  mv -f "$ROOT/$f.update-tmp" "$ROOT/$f"
done
printf '\nProgrammdateien aktualisiert. Deine .venv und Daten wurden nicht berührt.\n'
printf 'Starte jetzt: cd "%s" && BD_WHISPER_MODEL=small ./start_vault.sh\n' "$ROOT"
