# Beziehungsdynamiken 15.12.66 – Capture UI und Bindungsstil-Trainingslabor

**Basis:** Vollständiger, unveränderter Quellstand 15.12.65 aus der Dateiablage plus gezielte Änderungen.

## Neuer Zugang in Capture
Unten stehen drei kleine Symbole: ☕ Atemraum, ◌ Seifenblasen und 🧠 Bindungsstile-Training. Jeder Menüpunkt unter den drei Punkten führt zum gleichen Ziel. Die Seifenblasen starten über eine direkte Engine-Funktion, nicht mehr über den simulierten Klick auf eine andere Schaltfläche.

**Atemraum/Training:** Die Capture-Oberfläche erlaubt den Einstieg nur bei lokal gespeichertem Praxis-Pairing. Ohne Kopplung erscheint eine verständliche Meldung. Alle Capture-Dokumentations- und Verschlüsselungsfunktionen bleiben unverändert. Das Seifenblasen-Pausenspiel ist weiterhin frei erreichbar.

**Sicherheitsgrenze:** Die lokale Paarungsprüfung ist ein UX-Zugangsschutz, aber keine vollständige serverseitige Autorisierung. Die momentan öffentlich bereitgestellten Audio-, JavaScript- und Trainingsdateien sind weiterhin direkt abrufbar. Um die Atembibliothek/Trainingsbank vollständig privat zu machen, müssen die Inhalte außerhalb des öffentlichen Pages-Deployments liegen und über authentifizierte, autorisierte (und ggf. offline zwischengespeicherte) Bereitstellung zugänglich werden. Das ist **nicht** in 15.12.66 enthalten. Kopplungstokens vertraulich halten.

## Bindungsstile-Skilltrainer
48 synthetische, nicht echte Klientendialoge, zwölf Fälle je Runde, Schwierigkeitsstufen, optional erst anhören, dann Text anzeigen, Zuordnungsblasen, Sicherheitseinschätzung, Kontext und Gegenhypothesen, nächste Beraterfrage, Wiederholungsgewichtung. Ein eigenes modales Trainingsfenster, beim Schließen wird die Iframe-Seite entladen, wodurch auch Audio endet. Lernfortschritt bleibt lokal im Browser.

Die Inhalte sind ein **fachlich zu prüfender Prototyp**, kein Diagnosetool und keine Kompetenzzertifizierung. Bindungsangst/Vermeidung sind Dimensionen und einzelne Aussagen keine stabile Stil-Zuordnung. Quellen sind im Trainingsfenster verlinkt.

## Installation
1. `Beziehungsdynamiken_15.12.66_NUR_WEBSITE.zip` auf dem bestehenden GitHub-Pages-Repository in die Wurzel hochladen (Dateien ersetzen, nicht einen neuen Unterordner anlegen), Deployment abwarten.
2. Capture-PWA neu laden und den Service-Worker die neue Version `bd-capture-15-12-66` übernehmen lassen. Eventuell den PWA-Tab vollständig schließen und erneut öffnen. **Nicht** lokale PWA-Daten/Website-Speicher löschen: dort liegen Captures und der Pairing-Schlüssel.
3. Als ungekuppeltes Testgerät Atemraum/Training anklicken (Hinweis auf Kopplung erwartet). Auf bereits gekoppeltem Gerät beide Menüpunkte und das Gehirn-Symbol testen. Menü und untere Symbole sollen identisches Verhalten haben.
4. Für eingebettete Desktop-Oberflächen Windows-/Mac-Launcher einzeln ersetzen. Bestehende Vault-Daten niemals überschreiben; unsignierte Mac-App kann erneut Gatekeeper-Hinweis auslösen. Ein Mac-DMG kann auf macOS mit dem beigelegten Skript erstellt werden.
5. Es gibt **keine neue D1-Migration und keinen Worker-Code in diesem Build**. Echte Backend-Autorisierung für Schulungsinhalte bleibt offen (siehe oben).

## Prüfungen
- JavaScript syntax via Node.js, HTML-Struktur und Trainerfall-Datensatz-Checks.
- Go `go test ./...`; Windows amd64 und macOS arm64 Cross-Compilation.
- ZIP-CRC und SHA-256-Digests.
- **Nicht durchführbar:** GUI-Test in Chromium (Test-Browser blockiert lokale URLs); reale Android-PWA; reale Mac-/Windows-Oberfläche; vollständige serverseitige Zugriffsprüfung.

Bitte bestehende 15.12.65-Installationen bis zum erfolgreichen Praxistest als Rückfallversion aufbewahren.
