# Beziehungsdynamiken 15.12.55 – Mac-Methodenverbindung & Cockpit-Bubbles

Basis: vollständiger Stand 15.12.54. D1-Migration `015_12_30_workspace_methods.sql` ist **nicht neu** und laut Prüfung des Owners bereits in der produktiven D1 vorhanden.

## Was dieser Build konkret ändert

- Ein enger Ausweichpfad für **drei** Ende-zu-Ende-verschlüsselte Methodenendpunkte: `GET /admin/workspace/methods/status`, `GET /admin/workspace/methods/delta`, `POST /admin/workspace/methods/push`.
- Falls die Mac-/Windows-Desktop-App beim Cloud-Zugriff per lokalem Go-Proxy eine erkennbare **502-Verbindungsfehlermeldung** erhält, versucht der Browser denselben Methodenaufruf direkt an die fest kodierte HTTPS-Adresse des bestehenden Workers. Der neue Worker erlaubt dafür CORS nur von `http://127.0.0.1:47832` oder `http://localhost:47832` und nur für die drei genannten Pfade.
- **Keine** Wiederholung von Cloud-Backups, Login, Zahlungen oder sonstigen Schreibaktionen über den Browser-Ausweichpfad. Die bestehende Authentifizierung per Bearer-Sitzung bleibt erforderlich.
- Neu: „Verbindung prüfen“ im Methodenraum und verständlichere Offline-Meldungen; Backoff bis maximal 30 Minuten bei wiederholten Cloudfehlern statt permanenter Versuche.
- Cockpit: 8 halbtransparente, ruhige Bubbles in Terrakotta, Sand und Creme für etwa 3 Sekunden beim ersten Öffnen einer angemeldeten Sitzung; `prefers-reduced-motion` wird respektiert. Keine Medien, Audio oder zusätzlichen Cloud-Abfragen.
- Desktop-Versionsnummer und separater Python-Vault-Code werden getrennt bezeichnet.

## Reihenfolge für den bestehenden Betrieb

1. **Sichern:** bestehende D1-Datenbank und lokale Vault-Daten sichern; keine neue Vault-Initialisierung.
2. **Worker:** `cloudflare-worker/worker.js` aus dem PATCH/FULL 15.12.55 auf den **bestehenden Worker** deployen. Secrets, Datenbank-Bindings und Auth-Einstellungen unverändert lassen. `/health` sollte Build `15.12.55` melden. **Nicht** einen zweiten Worker anlegen. Für diese Version ist keine neue D1-Migration nötig.
3. **Website:** aktualisiertes `admin.html`, `workspace-method-sync15-12-50.js`, `admin-vault-release.js` plus **neu** `desktop-cloud-recovery15-12-55.js`, `cockpit-bubbles15-12-55.js`, `cockpit-bubbles15-12-55.css` deployen (root). Cache per Versions-Query aktualisiert. Auf GitHub hochladen allein genügt nur, wenn deine GitHub-Pages-Seite tatsächlich von diesem Branch/Ordner veröffentlicht wird.
4. **Windows:** Falls du den vorhandenen Desktop-Launcher ersetzen möchtest, `Beziehungsdynamiken_WINDOWS_15.12.55.zip` installieren. Der Patch enthält außerdem die vollständigen geänderten Web- und Worker-Dateien. Lokalen Vault **nicht** neu einrichten.
5. **Mac M1:** Erst nach Schritt 2 die aktuelle `Beziehungsdynamiken.app` vollständig beenden, bestehende App sichern, neue `.app` aus `Beziehungsdynamiken_MAC_M1_15.12.55.zip` nach `/Applications` verschieben. Wenn macOS „in Verwendung“ sagt, den laufenden Beziehungsdynamiken-Prozess beenden. Die App ist **nicht Apple-signiert oder notarisiert**.
6. **Test:** Auf Ilonas Mac mit bestehendem Team-Account anmelden, denselben Vault entsperren. Workspace-Key-ID muss mit Owner-Gerät übereinstimmen. In „Secure Vault → Updates & gemeinsamer Methodenraum“ auf „Verbindung prüfen“ klicken. Danach „Änderungen jetzt synchronisieren“. Die zwei bereits auf dem Owner-Gerät synchronisierten Methoden sollten erscheinen, sofern die Mac-Verbindung funktioniert und die Berechtigungen passen. Danach eine kontrollierte Teständerung in beide Richtungen.

## Noch offen / ehrlich begrenzt

Die Mac-Verbindungsstörung ist bisher nur aus Screenshots bekannt. Wir wissen, dass sowohl Backup als auch Methoden auf dem Mac eine Cloud-Proxymeldung hatten. Der neue Browser-Ausweichpfad ist für Methoden **simuliert getestet**, aber **noch nicht live auf Ilonas Mac**. Ist die gesamte Internetverbindung oder der Cloudflare-Worker nicht erreichbar, hilft auch der Ausweichpfad nicht. Backup-Ausfälle sind damit **nicht automatisch behoben** und müssen gegebenenfalls mit den lokalen Desktop-Logs weiter untersucht werden.

Die lokalen Vault-Daten, Passwörter und BDW1-Workspace-Schlüssel werden von diesen Dateien nicht überschrieben. Synchronisierte Methoden ersetzen **kein klinisches Backup**.

## Sicherheits- und Teststatus

- Node: Worker-Transporttests (SQLite-CAS, Rollen-/Praxistrennung, E2EE Delta/Push, Konflikte) und Browser-Sync-Tests.
- Node: 15.12.55 Mac-Proxy-Fehler-Simulation, HTTPS-Methoden-Fallback, Auth-Header-Erhalt, strikter CORS-Origin/Pfad, Ausschluss von Backup-Replay, Bubbles/reduced-motion.
- Go `go test ./...` erfolgreich; macOS arm64 und Windows amd64 cross-kompiliert; Linux-lokaler Desktop-Smoke-Test erfolgreich (Start und Auslieferung der neuen Admin-Dateien).
- Kein echter Windows- oder Mac-GUI-Starttest, keine Live-Migration oder Änderung an eurer Cloud durch diese lokale Erstellung.

## GitHub Releases

Erst nach dem Cloudflare/Website-Deployment und einem ersten Mac-Test Release `v15.12.55` als **Pre-release** veröffentlichen. Zwei Desktop-ZIPs als Assets genügen. Worker-/Web-Patch nicht als öffentlicher Installations-Download verteilen, sofern er intern verwaltete Betriebsdateien enthält. Eine GitHub-Release alleine installiert weder Worker noch Vault noch Desktop automatisch.
