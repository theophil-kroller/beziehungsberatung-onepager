# Beziehungsdynamiken 15.12.63 – Saboteure und Teamkalender

## Änderungen

**Spiel**
- Saboteure deutlich weniger dunkel: fünf unterschiedliche Figurentypen mit je vier Konturvariationen und verschiedenen warmen, leicht getrübten Farben. Der negative Satz bleibt auf der Blase lesbar.
- Nachschub folgt nun einem leicht zufälligen, unregelmäßigen Zeitplan mit Mindestabständen und ohne direkt gleiche Figurentypen. Regler **0–5** und Wackeln bleiben wie in 15.12.62 erhalten.
- Beim Anklicken steht der ursprüngliche negative Gedanke **oberhalb** des Spielfelds, während sich die Blase etwa 0,8 Sekunden lang auflöst. Anschließend erscheint **daneben bzw. mobil darunter** die größere positive Gegenperspektive. Beides bleibt zusammen etwa fünf Sekunden sichtbar; erst danach läuft das Spiel weiter.
- Antidot, Abbruch beim Ausschalten, weniger Bewegung und mobile Ansicht geprüft. Bestehende Musik, eigene Bestwerte und Frontpage-Animation unverändert.

**Teamkalender**
- **Behoben:** Angemeldete Teammitglieder sahen unter `/admin/availability/windows` bisher ausschließlich ihre eigenen Zeiten, solange sie keine Praxisleitung waren.
- Neu: Nur angemeldete Mitglieder der **gleichen Praxis** können die Zeitfenster aller **aktiven** Practitioner in ihrem Praxiskalender sehen. Jede Rückgabe wird weiterhin per `practice_id` eingeschränkt.
- `canEdit`: **Eigene Zeitfenster** bleiben bearbeitbar; **fremde Zeitfenster** sind in der Kalenderoberfläche nur lesbar. Die serverseitige Berechtigungsprüfung für Änderungen/Löschen bleibt unverändert restriktiv.
- Das betrifft ausschließlich freigegebene Zeitfenster, **nicht** Klienten- oder Buchungsdetails. Keine D1-Schemaänderung.

## Installation – unbedingt beide Teile für den Teamkalender beachten

1. **Website:** `Beziehungsdynamiken_15.12.63_NUR_WEBSITE.zip` enthält `admin.html`, `admin-build9.js`, die beiden Bubble-Game-Dateien und diese Anleitung. Betroffene Dateien im Website-Repository ersetzen und deployen. Wenn eigene, jüngere Änderungen an `admin.html` oder `admin-build9.js` vorhanden sind, vor dem Ersetzen vergleichen und zusammenführen. Im Browser anschließend Strg+Umschalt+R.
2. **Cloudflare Worker für den Teamkalender:** `Beziehungsdynamiken_15.12.63_CLOUDFLARE_TEAMKALENDER.zip` enthält den vollständigen `cloudflare-worker/worker.js` aus dem Build sowie `TEAMKALENDER-DEPLOY.md`. **Vor dem produktiven Deployment** gegen den aktuellen Live-Worker prüfen und die Änderung **zusammenführen**, um keine zwischenzeitlichen Fixes, OAuth-/CORS-Einstellungen oder Rekordsync-Funktionen zu verlieren. **Nicht blind ersetzen!** Kein D1-Migrationsbefehl erforderlich. Danach mit beiden Team-Accounts testen.
3. **Windows:** `Beziehungsdynamiken_WINDOWS_15.12.63.zip` mit neuer EXE. Desktop vorher beenden und ausschließlich die Anwendung austauschen; die lokalen Vault-Daten und Schlüssel nicht anfassen. Ein Website-Update aktualisiert die eingebettete Desktop-Oberfläche nicht.
4. **Mac Apple Silicon:** `Beziehungsdynamiken_MAC_M1_15.12.63.zip` enthält eine unsignierte/nicht notariserte `Beziehungsdynamiken.app` und optional das lokale DMG-Skript. Eine Mac-App wird nicht allein durch den Website-Upload erneuert.
5. **Patch / Full:** Alternativ `Beziehungsdynamiken_BUILD_15.12.63_PATCH_WINDOWS.zip` für die betroffenen Quelldateien oder `Beziehungsdynamiken_BUILD_15.12.63_FULL_WINDOWS.zip` als kompletter Stand. Alle Pakete sind Quell-/Installationspakete, **keine automatisch vorgenommene Cloud-Migration**.

## Cloud-Rekorde
Die synchronisierten persönlichen Bubble-Rekorde benötigen weiterhin das separate Cloudflare-Update mit D1-Migration aus **15.12.61**, sofern es noch nicht ausgerollt wurde. Der Worker im Teamkalender-ZIP basiert auf dem Quellenstand der Builds bis 15.12.63; daher bei produktiver Rekord-Synchronisation besonders auf Erhalt der vorhandenen Endpunkte achten.

## Tests
- JS-Syntax: Bubble-Spiel, Kalenderoberfläche und Worker (`node --check`) bestanden.
- Browser Chromium: Auflösungsphase, negative/positive Texte gleichzeitig sichtbar, Schließen und Abschalten, 1366×768, 1024×640, 390×844 und 375×667. Kein horizontaler Überlauf, Overlay am Mobilgerät exakt auf Viewport-Höhe.
- Kalender-Funktionstest mit simulierten D1-Antworten: anderes aktives Praxis-Mitglied sichtbar und nicht editierbar, eigenes Fenster editierbar, fremde Praxis komplett ausgeschlossen. **Kein Live-D1- oder Live-Account-Test erfolgt.**
- `go test ./...` erfolgreich. Windows-amd64 und macOS-arm64 kompiliert; ZIP-CRC wird geprüft.
- **Nicht getestet**: Sound am physischen Gerät, Live-Worker-Deployment, reale Anmeldungen von Ilona und Theo; diese erst nach Deployment gegenprüfen.
