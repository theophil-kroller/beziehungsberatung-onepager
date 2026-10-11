# Beziehungsdynamiken 15.12.54 – Gemeinsame Methodenbibliothek

Basis: FULL 15.12.53. Windows und macOS M1 mit kleinem Go-Launcher (öffentliche Medien weiterhin separat).

## Behobene Ursachen

1. In Worker 15.12.53 fehlten `/admin/workspace/methods/delta` und `/admin/workspace/methods/push` ganz. Neu: `/status`, `/delta`, `/push` für AES-GCM-verschlüsselte Vorlagen.
2. Die Bibliothek brach ihre Anzeige ab, wenn der unabhängige Capture-Transfer scheiterte. Lokale Methoden werden jetzt trotzdem geladen.
3. Einrichtung ohne Practitioner-Profil: der Button zur klinischen Cloud-Vault-Registrierung wird nicht mehr fälschlich empfohlen; BDW1-Schlüssel genügt für die gemeinsame Methodenbibliothek.
4. Nach erfolgreicher BDW1-Einlösung beginnt der Abgleich automatisch. Statusmeldungen unterscheiden fehlende Cloud-Routen, Migration, Anmeldung und fehlende Kopplung.

## Sicherheits- und Synchronisationsregeln

- Endgeräte verschlüsseln und entschlüsseln mit AES-256-GCM, die Cloud speichert nur `iv` + `ciphertext` und Metadaten.
- Praxisgrenzen werden im Worker überprüft. Teammitglieder benötigen abgeschlossene BDW1-Übergabe; kein Practitioner-Flag nötig. Der Owner initialisiert den Workspace.
- Bei konkurrierenden Bearbeitungen findet **kein** stilles Überschreiben statt. D1-Batch/CAS prüft die jeweilige Remote-Version.
- Nur bestätigte Methodenvorlagen; keine Entwürfe, Klientendaten, Diktate, ursprüngliche Capture-Dateien oder privaten Akten.
- Der synchronisierte Bestand ist **kein Backup**. Lokale Favoriten-/Lösch- und Archivzustände bleiben gemäß v1-Protokoll separat.
- Bei keinem Internet: bestehende lokale Daten bleiben nutzbar. Der Abgleich wird später fortgesetzt.

## Deployment – zwingende Reihenfolge

**1. Sicherung:** Vorher D1-Backup und lokalen Vault-Backup sicherstellen.

**2. D1-Migration:** Im selben Cloudflare-D1-Binding `DB` der bestehenden Worker-Anwendung müssen die Tabellen aus `database/migrations/015_12_30_workspace_methods.sql` vorhanden sein. Bei fehlenden Tabellen die SQL-Datei aus dem Full-Build ausführen. Sie verwendet `CREATE TABLE IF NOT EXISTS`.

**3. Worker:** `cloudflare-worker/worker.js` aus 15.12.54 auf dem **bestehenden** Worker `beziehungsdynamiken-booking` veröffentlichen (nicht nur auf GitHub hochladen). Bindings/Secrets unverändert lassen. Danach `https://beziehungsdynamiken-booking.theophil-kroller.workers.dev/health` prüfen: Build `15.12.54`. Der neue `/admin/workspace/methods/status` benötigt eine gültige Praxisanmeldung; nicht im privaten Browser-Tab ohne Anmeldung testen.

**4. Weboberfläche:** Geänderte statische Dateien auf die vorhandene Website übertragen: `admin.html`, `admin-build15-1.js`, `admin-vault-release.js`, `methods.html`, `methods-build15-11.js`, `workspace-method-sync15-12-50.js`. Die eingebetteten Kopien für Desktop sind bereits kompiliert.

**5. Desktop:** Windows-Launcher ersetzen oder die bestehende Vollversion mit dem Patch aktualisieren. Die Mac-M1-App kann später durch den neuen ZIP ausgetauscht werden. Der Python-Vault und **dessen Datenordner** sind davon getrennt; weder Initialisierung noch Passwortwechsel durchführen. Die Vault-Sync-Endpunkte sind bereits ab der Python-Vault-Codebasis 15.12.30 enthalten. Die bisher angezeigte Vault-Version 15.12.32 ist daher nicht automatisch der Grund für den Methoden-Fehler. App-Version und Python-Vault-Version sind getrennt.

**6. Owner (Windows):** Persönlichen Account anmelden, lokalen Vault entsperren. Sicherstellen, dass der Workspace-Schlüssel unter Secure Vault existiert. Methoden-Seite öffnen, auf „Jetzt abgleichen“ klicken. Zuerst müssen deine bestätigten Methoden auf die Cloud gelangen. Einmalig BDW1-Code **gezielt** für Ilonas vorhandenen Team-Account erzeugen. Den Schlüssel nur über sicheren Kanal übertragen.

**7. Ilona (Mac):** Mit eigenem Praxislogin anmelden, bestehenden Vault entsperren, unter Secure Vault „Workspace-Code einlösen“ ausführen. Es ist **kein fachliches Practitioner-Profil** und kein klinischer Cloud-Vault nötig. Öffnet sie danach die Methoden, sollte der Abgleich stattfinden. Nach einer Teständerung kontrollieren, dass sie auf Windows erscheint und umgekehrt.

## Häufige Meldungen

- `D1-Migration … fehlt` → Cloudflare-D1-Tabelle fehlt, Schritt 2.
- `Cloud-Methodenabgleich nicht installiert` → Worker 15.12.54 noch nicht veröffentlicht, Schritt 3.
- `Workspace-Zugang fehlt` → BDW1-Einmalcode für den tatsächlich angemeldeten Benutzer einlösen.
- `Anderer Workspace-Schlüssel` → Schlüssel-IDs auf beiden Geräten prüfen, keinesfalls neuen Workspace erzeugen.
- `Vault gesperrt` → Vault im gleichen Tab / Desktop-Browser entsperren.
- `Cloud-Anmeldung abgelaufen` → Praxis erneut anmelden.
- `Methodenkonflikt` → keine automatische Überschreibung; Änderungen manuell vergleichen.

## Prüfstatus

- `node --check` Worker, Webmodul und Admin-UI.
- Cloud-Transporttests mit realem SQLite: CAS, Dublettenverhinderung, Konflikte, Nutzer-/Praxisgrenzen, BDW1-Nutzer ohne Practitioner-Profil.
- Python-Tests: AES-GCM-Erstimport, Delta, ACK, Methodenfunktionen.
- Browser-Abgleichtest: Windows upload → Mac import → wiederholter Abgleich.
- Go-Tests und Linux-Smoke-Test lokaler Desktop-Server; Windows und macOS ARM64 cross-kompiliert.
- **Nicht** live an eurem Cloudflare Worker/D1 oder an eurem echten Windows-/Mac-Gerät getestet. Die Fertigstellung hängt vom Deployment und der BDW1-Kopplung ab.
