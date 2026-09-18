Beziehungsdynamiken BUILD 12
============================

Frontend / GitHub (manuell hochladen):
- admin.html
- admin-build9.js
- admin-build10.js
- admin-vault.js
- admin-build12.js
- admin-build12.css

Cloudflare:
- cloudflare-worker/worker.js neu deployen
- KEINE neue D1-Migration

Lokal:
- vault/vault_server.py in deinen bestehenden SecurePracticeVault-Ordner kopieren
- data/ NICHT ersetzen
- Vault neu starten
- /health sollte version 3.0 melden

Wenn Autostart bereits funktioniert, musst du ihn nicht erneut installieren.
Die funktionierenden Autostart-Dateien sind trotzdem im vault/-Ordner enthalten.
