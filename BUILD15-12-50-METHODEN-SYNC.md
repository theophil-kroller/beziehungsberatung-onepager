# Beziehungsdynamiken – BUILD 15.12.50

**Ausgangsbasis:** Windows FULL 15.12.48, rekonstruiert aus FULL 15.12.44 und PATCH 15.12.45–15.12.48; macOS M1-Launcher 15.12.49. Der Atemraum, die CC0-Musik und die bereits vorhandenen Vault-Daten bleiben unverändert.

## Neu

- Gemeinsame **bestätigte Methoden** werden in der Methodenbibliothek bei aktiver Sitzung automatisch synchronisiert: beim Öffnen, bei erneuter Aktivierung und nach lokalen Änderungen, zusätzlich ungefähr alle fünf Minuten während der aktiven Nutzung.
- Eigener, sichtbarer Sync-Status und Knopf „Jetzt abgleichen“ im Methodenbereich.
- Einmalige Erstübernahme aus dem bestehenden Windows-Vault und anschließender bidirektionaler Abgleich über bestehende, mit AES-256-GCM verschlüsselte D1-Änderungsereignisse.
- Gemeinsame Bearbeitung ohne stilles Last-Writer-Wins: Konflikte werden angezeigt, lokale Änderungen nicht automatisch überschrieben.
- Kurzlebige, **nur lokal und browserursprungsgebundene** Sitzungsübergabe über BroadcastChannel zwischen gleichzeitig geöffneten Desktop-Safari-Tabs, ohne Speicherung von Passwörtern oder Login-Secrets in localStorage; Logout signalisiert andere Tabs. Die tatsächliche Anmeldung bleibt serverseitig geprüft.
- Aktualisierter M1-Launcher und Windows-Desktop-Binary mit eingebetteter Oberfläche. Keine Änderung der lokalen Vault-Datenstruktur und keine neue Vault-Migration.

## Wichtige Grenzen

- Synchronisiert werden **bestätigte Methoden-/Hausübungs-Vorlagen**, nicht unbearbeitete Entwürfe, ursprüngliche Capture-Audios, Klientendaten, klinische Fallakten oder sonstige Creator-/Workshop-Projekte.
- Die Synchronisation ersetzt kein Backup. Favoriten und Archiv-/Löschstatus werden mit dem bisherigen v1-Protokoll noch nicht teamweit gespiegelt.
- Der automatische Abgleich läuft **nur bei geöffneter, authentifizierter und entsperrter Anwendung**. Wenn beide Geräte offline oder gesperrt sind, wartet der nächste Abgleich auf erneute Nutzung; keine systemweite Hintergrundsynchronisation.
- Vor dem ersten Import benötigt Ilonas persönlicher Vault **einmalig den BDW1-Workspace-Schlüssel** vom Owner. Niemals das eigene Vault-Passwort oder TOTP-Secret übertragen.
- GitHub-Vault-Updater ist seit 15.12.30 als signierter Release-Client vorbereitet, aber seine GitHub-Releasequelle muss separat eingerichtet werden; in diesem Build ist kein vollständig eingerichteter Cloud-Update-Kanal enthalten.
- Echte Cloudflare D1- und End-to-End-Mac/Windows-Tests stehen weiter aus. Hierzu sind zwei angemeldete echte Geräte nötig.

## Installation – Reihenfolge

### Cloudflare (nur falls noch nicht erledigt)

1. D1-Backup prüfen/erstellen.
2. In D1 Console prüfen:
   ```sql
   SELECT name FROM sqlite_master
   WHERE type='table' AND name IN ('workspace_method_events','workspace_method_heads');
   ```
3. Falls eine/mehrere Tabellen fehlen: `database/migrations/015_12_30_workspace_methods.sql` aus dem Build auf D1 ausführen (die CREATE-Statements sind idempotent). Die bereits von dir ausgeführte MFA-Migration 015_12_48 ersetzt diese **nicht**.
4. Prüfen, dass mindestens der Cloudflare Worker aus 15.12.48 veröffentlicht ist; seine `/admin/workspace/methods/delta` und `/push`-Routen sind erforderlich. Bei fehlenden Routen Worker aus dem FULL aktualisieren. Kein neuer Worker-Code durch 15.12.50.

### Windows – Source Vault

1. Bestehende Vault-Daten und Backups aufbewahren. Keine `data`-Ordner überschreiben.
2. PATCH über den entpackten FULL 15.12.48 legen oder FULL 15.12.50 neu entpacken. Desktop-Programm schließen und mit `downloads/Beziehungsdynamiken-Desktop-15.12.50-windows.exe` starten, falls die Desktop-EXE verwendet wird.
3. Mit Owner-Account anmelden; persönlichen Vault entsperren.
4. Unter **Secure Vault → Workspace-Schlüssel** prüfen, dass der Owner-Schlüssel eingerichtet ist. „Gemeinsamen Schlüssel übergeben“ wählen und **Ilonas persönlichen Benutzeraccount** als Empfänger auswählen.
5. Einen **BDW1-Einmalcode** erzeugen, außerhalb eines ungeschützten Chats sicher übergeben. Er ist 24 Stunden gültig und einmalig nutzbar.
6. „Methoden“ öffnen. Der erste automatische Abgleich lädt alle bestätigten lokalen Methoden (ggf. mehrere Batches) verschlüsselt hoch. Auf den Status „Synchronisiert … übertragen“ achten.

### macOS M1 – Team Vault

1. Bestehende Beziehungsdynamiken-App vollständig beenden, die neue App in Programme ersetzen. Die bestehende Vault-Installation **nicht** neu initialisieren und `~/Library/Application Support/Beziehungsdynamiken/Vault` niemals löschen/überschreiben.
2. Die App ist eine unsignierte **Entwicklungsvorschau**; auf macOS ggf. nach expliziter Vertrauensprüfung die normale Sicherheitsausnahme nutzen. Vor produktivem Rollout sind Apple-Signatur und Notarisierung vorgesehen.
3. Ilona meldet sich mit **ihrem** Account an und entsperrt ihren persönlichen Vault.
4. Unter Secure Vault den Punkt **„Workspace-Zugang übernehmen“** auswählen und den BDW1-Code des Owners einlösen; Workspace-Key-ID sollte anschließend mit Windows übereinstimmen.
5. „Methoden“ öffnen: Die neue Statusleiste zeigt die Synchronisation. Die bestätigten Methoden vom Windows-Vault werden nach erfolgreichem ersten Abgleich lokal verschlüsselt übernommen. Bei Fehlermeldung „Migration fehlt“ Cloudflare Schritt 2/3 kontrollieren.
6. Neue Testmethode auf Ilonas Mac nach Bestätigung speichern; auf Windows im Methodenbereich nach Öffnen/Wechsel zurück sichtbar prüfen. Danach andersherum testen.

## Test- und Sicherheitsnachweise

- `node --check` für neue/geänderte JS-Dateien; `python -m py_compile`.
- `tests/test_build15_11_methods2.py`: bestehende Methodenfunktionen 10/10.
- `tests/test_build15_12_50_method_sync.py`: verschlüsselte Erstübernahme, Bestätigung, Delta, Idempotenz, Konfliktschutz.
- `tests/test_build15_12_50_browser_sync.mjs`: Upload vor Pull auf anderem Vault, wiederholte Aufrufe ohne Dubletten.
- Kompiliert: macOS `darwin/arm64` (M1), Windows `windows/amd64`. **Nicht** auf realem Mac/Windows-Gerät ausgeführt.

### Zu prüfen bei Abnahme

Nach 15.12.50 auf beiden Geräten und erfolgreich eingerichteter Workspace-Kopplung: Anmelden, Vault entsperren, Erstimport und spätere Änderungen; gleichzeitig bearbeiten => kein stilles Überschreiben; Browser-Tabs wechseln => keine weitere E-Mail-Anmeldung; Mac offline, danach wieder online => Catch-up. Frühere lokale Audio-/Whisper- und Newsletter-Probleme sind von diesem Methoden-Sync-Build getrennt.
