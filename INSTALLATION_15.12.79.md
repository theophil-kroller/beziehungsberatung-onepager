# Installation und Qualitätssicherung – Beziehungsdynamiken 15.12.79

Basis: **15.12.78.1**. Diese Version verändert nur Academy-Darstellung, Aufgabenlogik und fachliche Falltexte. **Keine D1-Migration, kein Cloudflare-Worker-Update und keine Änderung an Ilonas Mac notwendig.**

## Neuerungen
- Gemeinsame lokale Exercise Engine für **Deida / Welt der Glut**, **Professionelle Gesprächsführung (Skill Mastery)** und **Zwischen den Zeilen**.
- Pro Durchlauf genau vier zufällig gemischte Antworten aus fachlich entwickelten Antwortpools. In Deida im Test **15–16 Kandidaten pro Auswahlaufgabe**; keine Behauptung, dass alle völlig fallspezifisch sind. Die bestehenden drei anderen Module (Gross, Gottman, Bindungsstile) behalten ihre bisherigen Übungslogiken.
- Bewertungsgrade: besonders passend, vertretbar mit Vorbehalt, teilweise hilfreich und verfrüht/problematisch. Mehrdeutigkeit und Kontext werden erläutert. Keine automatische KI-Bewertung von Freitext.
- Dialogvarianten in der Deida-Welt je nach fiktiver Figur; drei Formulierungen je Grundfall, keine echt verzweigenden generativen Dialoge.
- Feedback vergleicht **Deine Antwort** mit einer **möglichen Intervention bzw. Hypothese**. Bei freier Antwort wird die eigene Formulierung zur Selbstreflexion angezeigt.
- 💪-Training erhält falsche bzw. teilpassende Auswahlantworten; bei einer Speicherstörung darf Navigation nicht hängen bleiben.
- Deida-Fallbibliothek: bisher 48, jetzt **60** unabhängig formulierte Grunddialoge: 12 neue Fälle, inspiriert von Kapiteln 6/7, 10, 14, 17, 19–21, 26, 31, 35–40 aus *The Way of the Superior Man* (1997), als **kritisch reflektierte Beratungsfälle**. Die Buchpassagen wurden **nicht kopiert**. Weder essentialistische Geschlechterannahmen noch Druck/Grenzüberschreitungen gelten als fachlicher Standard; empirische Wirksamkeit wird nicht aus dem Buch abgeleitet.

## Installation
1. Projekt/Vault vor Änderung sichern. Für bestehende GitHub Pages die Dateien aus **NUR_WEBSITE.zip** im Website-Root darüberkopieren (nicht das Repo oder einen Vault löschen). Bei bestehender Version 15.12.78.1 reicht das **MINI_PATCH_WEBSITE.zip** mit den geänderten Website-Dateien.
2. GitHub-Pages-Deployment abwarten. Webseite per **Strg + F5** neu laden; durch Query-Version 15.12.79 werden neue JS/CSS-Versionen angefordert.
3. Im Deida-Modul eine falsche Antwort wählen, **Antwort prüfen**, Vergleich lesen, **Weiter** drücken. Dann richtige und teilpassende Varianten prüfen. 💪-Button testen. Danach Gesprächsführung und „Zwischen den Zeilen“ ausprobieren.
4. Desktop-PC nur bei Bedarf ersetzen; Desktop-App bündelt ihren Webcode und muss für neue Module manuell aktualisiert werden. Ilonas bewährte Mac-Installation bleibt unverändert. Mac-Build ist nicht Apple-signiert/notarisiert.

## Teststatus
- JavaScript-Syntax (`node --check`) für die Website und Engine-Property-Tests: BESTANDEN.
- Native Chromium-Browser-DOM-Tests (lokal eingebundene Originaldateien): Deida 30 aufeinanderfolgende Antworten inklusive Fehlern und Teilbewertungen, Vergleichs-Overlay, Weiterklicken, Mobilansicht; Mastery & Zwischen den Zeilen je gewählte Antwort / Vergleich / nächster Schritt: BESTANDEN.
- Go `go test ./...`, Cross-Compile für Windows amd64/macOS arm64, Archivintegrität: werden durch Release-Skript durchgeführt.
- **Nicht getestet**: reale produktive Cloudflare-Server-Verbindung, echte Windows-/Mac-Geräte, produktiver GitHub-Pages-Test oder abschließende fachliche Expertenvalidierung sämtlicher automatisch zusammengestellter Antwortkombinationen. Die 15–16 Kandidaten sind teils generische methodische Antwortoptionen und sollten später fallspezifisch redaktionell ausgebaut werden.
- Lokale Nutzerprofile sind nicht allein dadurch identisch mit bestätigter Cloud-Synchronisation. Dieser Build verändert keine D1-Schemata.
