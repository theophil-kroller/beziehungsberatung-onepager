# Build 15.12.69 – Skill-Lab: vier Spielarten, Beziehungskontexte und Lernfortschritt

**Basis:** unverändert vollständig übernommener Projektstand 15.12.68. Dies ist kein Neuaufbau aus älteren Releases.

## Eingebaut

- **Vier Spielmechaniken in einer 12er-Runde:** (1) Hypothesen-Blasen, (2) Hinweisjagd mit zwei Belegstellen, (3) Drei-Aussagen-Zuordnung durch Tippen oder Ziehen, (4) eine hilfreiche nächste Beraterfrage auswählen. Reihenfolge rotiert, kein langes Startformular.
- **116 Übungsaufgaben:** 48 bisherige Fälle + 32 neue Szenen mit Beziehungskonstellationen + 16 Hinweisjagden + 8 Dreier-Zuordnungen + 12 prüfende Beraterfragen. 8 eigens gestaltete SVG-Szenen (Freundin, Mutter/Sohn, Kind/Mutter, Oma/Enkel, Paar, Vater/Tochter, Freund, Schwestern) plus neutrale Grafik. Auch die bisherigen vier abstrahierten Antwortillustrationen bleiben eingebunden.
- **Erklärbares Feedback:** Zeigt immer deine Antwort und die plausiblere Lösung; benennt das Übersehene sowie den Hinweis und optional Gegenhypothese/Folgefrage. Übungs-XP auch bei Fehlern sind ausdrücklich kein Kompetenznachweis.
- **Skills:** Sechs Bereiche, XP-Level und vier Meilensteine. Ein Fall gilt erst nach richtigen, zeitlich getrennten Wiederholungen als gefestigt. Vereinfachtes Spaced Repetition, kein kalibrierter FSRS oder diagnostisches Instrument.
- **Kompakte Mobile-UX:** Bildschirmfüllend, reguläre Aufgabe ohne Seitenscrollen. Detaillierte Erklärung bei Bedarf in einer Bottom-Sheet-Ansicht. Bild, Sprecher und Beziehungskontext sind getrennt von der Bindungshypothese.
- **Cockpit + Capture:** Bestehender Gehirn-Button sowie Capture-Trainingsknopf öffnen dieselbe neue Datei `bindungsstile-trainer15-12-69.html`. Service-Worker-Cache `bd-capture-15-12-69`, neue Spielressourcen werden für Offline-Nutzung vorbereitet. Vorhandener Lernstand wird unter denselben LocalStorage-Keys gelesen, die bisherige Praxis-Capture-Kopplungsprüfung bleibt erhalten.

## Installation / Deployment

1. **Website/Android:** Nur die Dateien aus `Beziehungsdynamiken_15.12.69_NUR_WEBSITE.zip` ins **Wurzelverzeichnis** des bestehenden GitHub-Pages-Repositories übertragen. Keine Unterordner-Ebene hinzufügen. Dateiupload auf GitHub Pages ist **nicht** gleichzeitig ein Update der installierten Desktop-App.
2. Veröffentlichung abwarten. Test-URL: `https://beziehungsdynamiken.at/bindungsstile-trainer15-12-69.html`. Achtung: Die Trainerdatei ist als statische GitHub-Pages-Datei auch ohne Capture-Kopplung direkt öffentlich erreichbar.
3. Capture-PWA vollständig schließen und erneut öffnen; kein Löschen des App-Speichers, sonst könnten lokale Captures, Pairing und Lernfortschritt verloren gehen.
4. **Website-Cockpit:** Im eingeloggten Cockpit den Gehirn-Button öffnen. Dafür müssen `admin.html`, `admin-skill-training15-12-68.js` und neue Trainerdatei ebenfalls veröffentlicht sein.
5. **Windows-Desktop:** Programm vollständig schließen, die neue EXE aus dem Windows-ZIP ersetzen; lokalen Vault-Datenordner unverändert lassen.
6. **Mac M1:** `.app` ersetzen. ZIP enthält optional ein `.command`-Skript zur Erstellung einer DMG **auf dem Mac**. Nicht Apple-signiert oder notarisiert.

## Datenschutz und Grenzen

- Keine Änderung an Cloudflare Worker / D1; keine Migration erforderlich. Keine Änderungen an klientenbezogenen Vault-Daten.
- Capture-Pairing sperrt die normale UI, **nicht** den direkten Abruf öffentlich bereitgestellter Trainerdateien und Atemmedien. Für tatsächlichen Zugriffsschutz sind serverseitige Autorisierung und nicht-öffentliche Auslieferung nötig.
- Achtung bei Einsatz in Supervision/Beratung: Die Fälle sind **synthetisch und didaktisch**, nicht psychometrisch validiert. Personen werden nicht anhand eines Einzelsatzes diagnostiziert; auch andere Erklärungen bleiben möglich, besonders im Familien- und Kinderkontext.
- QA: JavaScript-Syntax und 12er-Runde mit allen vier Spielarten erfolgreich in isoliertem Chromium; 360×740, 375×667, 390×844 und 1366×768 ohne Seitenscrollen. Go-Tests bestanden, Windows x64 und macOS ARM64 kompiliert. Keine realen Gerätetests, Live-PWA-Cacheprüfung oder Cloudflare-Tests.

## Nächste Lernpakete (noch NICHT enthalten)

Relational Life Therapy, EFT/Sue Johnson, Gottman – als eigenständige fachlich geprüfte Lernpakete, nicht in diesem Build. Langfristige Kompetenzentwicklung benötigt zusätzlich reale Praxis, Reflexion und Supervision.
