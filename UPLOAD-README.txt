BUILD 10.1 — UPDATE NACH BUILD 10

Wenn BUILD 10 bereits läuft, ist KEINE neue D1-Migration nötig.

1. Cloudflare Worker durch cloudflare-worker/worker.js ersetzen und deployen.
2. Im GitHub-Root mindestens ersetzen:
   - admin.html
   - admin-build9.js
   - admin-build10.js
   - admin-build10.css
   - cart.js
3. Hard Refresh: Ctrl+F5.
4. Testen:
   - Dashboard Finanzkacheln
   - Finanzcockpit
   - Rechnung > Zahlung erfassen > Barzahlung mit Datum + Uhrzeit
   - Session Flow: Vorbereitung → Buchung & Angebote → Nachbereitung
   - Vault gesperrt: Direktlink zur Dokumentation
   - cart.html: „Zum Angebot“
   - index/en: Beziehungsvielfalt ohne redundanten Buchungslink

BEZIEHUNGSDYNAMIKEN BUILD 10 — INSTALLATION
===========================================

VORAUSSETZUNG
BUILD 9 ist bereits installiert und funktioniert.

1) D1 MIGRATION
---------------
Cloudflare -> D1 -> dieselbe Datenbank wie der Booking Worker -> Console.
Gesamten Inhalt aus:
  database/build10-session-flow.sql
einfügen und Execute.

Kontrolle:
  SELECT name FROM sqlite_master
  WHERE type='table'
  AND name IN ('session_flows','session_flow_events')
  ORDER BY name;

Es müssen 2 Zeilen erscheinen.

2) WORKER DEPLOYEN
------------------
Cloudflare Worker „beziehungsdynamiken-booking“ öffnen.
Den bestehenden Code vollständig ersetzen durch:
  cloudflare-worker/worker.js
Deploy.

Danach prüfen:
  /health
muss {"ok":true} liefern.

3) WEBSITE-DATEIEN NACH GITHUB
------------------------------
Folgende Dateien aus BUILD 10 ins Root des bestehenden Repositories hochladen
und vorhandene Dateien ersetzen:

  admin.html
  admin-build10.css
  admin-build10.js
  cart.js
  zugang.html
  access.html

Die bestehenden BUILD-9-Dateien admin-build9.js/admin-build9.css/admin-vault.js
bleiben ebenfalls im Repo. Nicht löschen.

Hinweis zu index.html / en.html:
BUILD 10 ändert das sichtbare Wording der Startseiten über cart.js, das dort
bereits geladen wird. Die großen bestehenden index/en-Dateien müssen deshalb
nicht ersetzt werden.

4) SECURE VAULT
---------------
Keine neue Vault-Migration nötig. Den bestehenden lokalen Vault wie gewohnt
mit vault/start_vault.bat starten und entsperren.

5) HARD REFRESH
---------------
Admin und Website mit Ctrl+F5 neu laden.

6) TESTEN
---------
Siehe BUILD10-TEST-CHECKLIST.txt.
