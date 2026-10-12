# Beziehungsdynamiken Academy 15.12.77.1 – FOKUS-HOTFIX

**Basis: Build 15.12.77.** Dieser Hotfix behebt das Deida-Modul, nicht die fachliche Fallbibliothek. Alle anderen Planeten, Trainings, Vault-Daten und Lernfortschritte bleiben unverändert.

## Korrigiert
- Die Deida-Trainingsansicht arbeitet jetzt als **vollflächige Trainingsbühne nach Vorbild Gross**, nicht als lang scrollende Webseite. Das große Modul-Hero, ausgedehnte Levelkarten, große Figurenbilder, wiederholte Methodik-Infobox und Fußzeile fallen während einer Übung weg.
- Desktop: Dialog auf der linken Seite, Aufgabe mit vier Antworten gleichzeitig rechts. Schmale/mobile Fenster: kompakte übereinander liegende Bühne. Der Hintergrund behält die Glut-und-Ozean-Atmosphäre.
- **Antwort prüfen:** Die Erklärung und ein direkt sichtbares **Weiter** erscheinen in einem zentrierten Rückmeldedialog, unabhängig davon, welche Antwort ausgewählt wurde. Ein falscher erster Schritt bietet eine Wiederholung; ein bestandener Fall zählt erst nach beiden Schritten.
- Profilwahl heißt jetzt **Mann / Frau**, passend für eure privaten Lernprofile. Intern bleiben die bisherigen, persönlichen Speicher-IDs `bd-deida77-ich` und `bd-deida77-partnerin` erhalten (keine Fortschrittsmigration). Die Wahl beeinflusst die simulierten Charaktergeschlechter **nicht**.
- Levelübersicht über den kleinen Button **◎ Level**, fachliche Einordnung über **ⓘ** erreichbar, statt die Trainingsbühne zu überladen.
- PWA-Serviceworker-Cache von Capture erhöht, damit das Update eher korrekt geladen wird.

## Installieren
1. Für die Website das Website-ZIP über eure **vorhandene 15.12.77-Website** legen. Bereits bestehende Dateipfade überschreiben, keine anderen Dateien löschen.
2. Das PATCH-ZIP über eine **Kopie des 15.12.77-Full-Projektordners** legen. Das Paket enthält geänderte Webdateien für Root und `desktop/app/web/`, plus eine neu kompilierte Windows-Desktop-EXE.
3. Alternativ das vollständige Full-Projekt verwenden. Der kleine Windows-ZIP enthält die neu kompilierte Desktop-App. Für macOS Apple Silicon wurde neu cross-kompiliert (nicht signiert, nicht notarisiert).
4. **Wichtig:** Vor App-Ersatz Backup des Vaults erstellen. Nicht pauschal Browserdaten löschen; dadurch könnten lokale Capture- oder Trainingsdaten verloren gehen.
5. Nach dem Website-Upload ggf. gezielt hart neu laden (Strg+F5) und `Welt der Glut → Polarität, Begehren & erotische Spannung` öffnen.

## QA
- Node-JavaScript-Syntaxprüfung und simulierte 14 vollständige Begegnungen bestanden; Level 2 wurde erst nach 10 unterschiedlichen Fällen freigeschaltet; Lernprofilwechsel geprüft.
- Go-Tests und Windows-amd64/macOS-arm64-Kompilierungen ausgeführt.
- **Ein visueller Browser-End-to-End-Test konnte nicht durchgeführt werden:** Chromium verweigert auf dem Testsystem lokale HTTP-Seiten mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Darum ist die pixelgenaue Darstellung auf euren Geräten noch zu prüfen.
- Die zugrundeliegenden Fallsimulationen sind weiterhin regelbasiert, nicht frei improvisierende KI. Fachliche Einordnung zu Deida bleibt erhalten, im optionalen Info-Dialog.

## Empfohlener Kurztest
1. Deida-Modul öffnen → der Fall, die Frage und alle Antwortmöglichkeiten müssen ohne Scrollen erreichbar sein.
2. Eine falsche Option anklicken → `Antwort prüfen` → Rückmeldungsdialog erscheint sichtbar → `Fall neu versuchen`.
3. Eine korrekte Option → Rückmeldung → `Nächster Schritt`. Zweiten Schritt erfolgreich absolvieren → neuer Fall.
4. Levelübersicht / Info öffnen und schließen, Frau-Profil wählen → getrennten Lernstand kontrollieren.
5. Auf kleinem Smartphonefenster mit 390px Breite prüfen; bei sehr kurzen/zoombasierten Ansichten können noch Layout-Anpassungen erforderlich sein.
