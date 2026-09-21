BUILD 13.5 — INSTALLATION
=========================

Vorbereitung
------------
1. D1-Datenbank sichern.
2. Den lokalen Ordner vault/data sichern.
3. Bestehende Worker-Secrets und Variablen unverändert bereithalten.

Reihenfolge
-----------
1. In Cloudflare D1 einmal ausführen:
   database/build13-5-practice-continuity-programs.sql

2. Den Worker ersetzen und deployen:
   cloudflare-worker/worker.js

3. Die enthaltenen Website- und Admin-Dateien in den GitHub-Webroot kopieren.
   Neue Dateien hinzufügen, gleichnamige Dateien ersetzen.

4. Im lokalen Vault ersetzen/hinzufügen:
   vault/vault_server.py
   vault/offline.html
   vault/offline-practice.css
   vault/offline-practice.js
   vault/README.txt

   WICHTIG: vault/data nicht löschen, ersetzen oder hochladen.

5. Vault neu starten. Prüfen:
   http://127.0.0.1:47831/health
   Erwartet: version 3.5 und offlinePractice true

6. Browser hart neu laden (Strg+F5 bzw. Cmd+Shift+R).

7. Kurztest:
   - CRM → Programme & Gruppen → Angebot anlegen → Vorschau → veröffentlichen
   - booking.html öffnen; öffentlicher Bereich und dynamische Navigation prüfen
   - Testanmeldung mit Rechnung durchführen
   - Testrechnung im CRM als bezahlt markieren; Teilnahme muss bestätigt werden
   - offene Testrechnung → Erinnerung öffnen, Text bearbeiten und nur an eine
     kontrollierte Testadresse senden
   - Secure Vault entsperren → Offline-Praxis öffnen

Dateien im Installationspaket
-----------------------------
- admin.html
- admin-build9.js
- admin-vault.js
- admin-build13-5.css
- admin-build13-5.js
- programs-public.js
- index.html, en.html, booking.html, booking-en.html
- about.html, about-en.html, arbeitsweise.html, approach.html
- beziehungsvielfalt.html, relationship-diversity.html
- angebote.html, offers.html, orientierung.html
- cloudflare-worker/worker.js
- database/build13-5-practice-continuity-programs.sql
- database/README.txt
- vault/vault_server.py
- vault/offline.html
- vault/offline-practice.css
- vault/offline-practice.js
- vault/README.txt
- BUILD13-5-NOTE.txt
- BUILD13-5-TEST-CHECKLIST.txt
- BUILD13-5-TEST-REPORT.txt

Rollback
--------
Website, Admin, Worker und Vault-Programmdateien aus dem Backup wiederherstellen.
Die neue D1-Struktur ist rein additiv und kann bei einem Code-Rollback bestehen
bleiben. Keine Tabellen mit Produktivdaten löschen.
