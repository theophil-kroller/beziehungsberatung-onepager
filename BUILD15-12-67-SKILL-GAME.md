# Beziehungsdynamiken 15.12.67 — Visual Skill Game (Bindungsstile)

**Basis:** Vollständiger Original-Build 15.12.66. Kein Rückgriff auf ältere Builds.

## Neu im Bindungsstil-Training
- Beim Öffnen beginnt sofort ein Fall statt einer Intro-/Formularseite.
- Normale Trainingsansicht auf Smartphones ohne vertikales Scrollen (Browserprüfung 360×740, 375×667, 390×844). Vier bildgestützte, leicht antippbare Auswahlkarten mit selbst erzeugten Symbolillustrationen; diese vermitteln keine klinische Diagnostik.
- Kurze Rückmeldung in einer separaten unteren Karte. Gegenhypothese und Anschlussfrage hinter „Warum?“; bei langen Dialogen „Ganzes Gespräch“.
- XP klein im Kopfbereich; gesonderte Skill-Übersicht mit fünf Lernindikatoren und drei Meilensteinen; Einstellungen für Themen und Hörtraining über ⚙.
- Vereinfachter, lokaler spaced-repetition-Zeitplan: erste korrekte Antwort 1 Tag, spätere korrekte Wiederholungen im größer werdenden Abstand; Fehler nach 10 Minuten erneut fällig. Schnelle Wiederholungen am selben Tag verlängern die Erinnerungsstufe nicht. **Kein echter FSRS-Algorithmus und kein validierter Kompetenztest.**
- 48 bestehende Fälle unverändert, 12 pro Runde. Vorhandene lokale Lerneinträge `bd_bindung_skill_v1` bleiben erhalten. Neue Gamification-Daten bleiben lokal (`bd_binding_game_xp_v2`, `bd_binding_game_settings_v2`). Kein Account- oder Cloud-Upload.

## Capture-PWA
Die drei Symbole (Tasse / Seifenblasen / Gehirn) und der funktionsgleiche Drei-Punkte-Menü-Zugang aus 15.12.66 bleiben. Der Trainer verwendet weiterhin einen eigenständigen Dialog. Nur die Traineroberfläche wurde neu umgesetzt. Bestehende Capture-Erfassungen, Verschlüsselung, Vault und Klienten wurden nicht verändert.

**Berechtigungsgrenze wie in 15.12.66:** Die lokale Capture-Pairing-Prüfung ist ein Zugangsschutz in der Bedienoberfläche, **keine serverseitige Dateiautorisierung**. Statische Trainer-/Atem-Dateien sind im öffentlichen GitHub-Pages-Repository weiterhin direkt abrufbar. Für echte Zugriffsbeschränkung müssen sie hinter einen autorisierten Endpunkt verlegt werden.

## Installation
1. `Beziehungsdynamiken_15.12.67_NUR_WEBSITE.zip` entpacken. Dateien und den Ordner `training-assets` im Root des bestehenden GitHub-Pages-Repositories aktualisieren. **Keinen zusätzlichen Unterordner** erstellen. Das Paket enthält nur betroffene statische Dateien, nicht Worker/D1.
2. Nach Deployment die Capture-PWA vollständig schließen und neu öffnen. Service-Worker aktualisiert auf `bd-capture-15-12-67`. **Nicht** „Websitedaten löschen“ oder Capture neu installieren: Dort können Aufnahmen, Entwürfe, Pairing und Lernstand liegen.
3. Am gekoppelten Gerät Gehirn-Symbol öffnen. Teste einen Fall, „Warum?“, „Weiter“, Skill-Symbol und ⚙ sowie später einen längeren Paardialog. Ohne Kopplung bleibt Atemraum/Training in der Capture-Bedienoberfläche gesperrt.
4. Für bereits installierte Windows/macOS-Desktop-Apps jeweilige neue Anwendung manuell austauschen. Sicheren Vault und lokale Daten nicht löschen. Mac-Archiv enthält eine ARM64-App mit Skript zur DMG-Erstellung am Mac; die App ist weder signiert noch notarisiert.
5. GitHub-Release oder Website-Upload aktualisiert lokale Desktop-Apps nicht automatisch. Worker und D1 müssen für diesen Build nicht geändert werden.

## Prüfungen
- Chromium isolierter Browser-Test: 360×740, 375×667, 390×844, 1366×768. Kein Scrollen im Spiel; Antwort → Feedback → Weiter; Statistiken; Einstellungen → Paardialog; keine JavaScript-Fehler. Die tatsächliche Android-PWA und echte Geräte bleiben ungetestet.
- JS-Syntax Node.js, 48 Fall-Datensätze, vier neue Bilddateien; `go test ./...` erfolgreich, Windows x64 und macOS ARM64 kompiliert, ZIP-CRC geprüft.
- Rechte/Cloud-Wirkung unverändert; kein automatischer Installer.

Bitte 15.12.66 als Rückfallversion behalten, bis die Darstellung auf dem Handy überprüft ist.
