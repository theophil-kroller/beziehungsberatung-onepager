# Beziehungsdynamiken Build 15.12.68 – Cockpit-Training und Capture-Cache-Fix

**Basis:** kumulativer Original-Build 15.12.67 (inkl. Visual Skill Game). Keine Rücksetzung auf ältere Funktionsstände.

## Neu

- Cockpit: eigener Gehirn-Button neben Atemraum und Seifenblasen. Öffnet den identischen visuellen Bindungsstil-Trainer direkt im Praxis-Fenster; er ist kein Link über Capture. Training schließt als modales Fenster; beim Schließen wird das eingebettete iframe entladen und etwaige Sprachausgabe beendet.
- Capture-PWA: Trainer unter neuem Dateinamen `bindungsstile-trainer15-12-68.html`. `capture.js` referenziert nur noch diesen Namen, so wird eine versehentlich aus früheren Releases gecachte Trainingsseite nicht wiederbenutzt.
- PWA-Service Worker (`bd-capture-15-12-68`) aktualisiert. Für Capture-Shell und Trainer gilt Netzwerk-vor-Cache mit Offline-Rückfall; Caches älterer `bd-capture-*` Versionen werden nach Aktivierung bereinigt.
- Trainingsinhalt, 48 Fälle, Bilder, Skill-Fortschritt und XP aus 15.12.67 bleiben unverändert. Lokale Speicherwerte `bd_bindung_skill_v1`, `bd_binding_game_xp_v2` und `bd_binding_game_settings_v2` werden **nicht** gelöscht.
- Kein D1- oder Cloudflare-Worker-Update erforderlich; keine Änderung an klientenbezogenen Vault-Daten.

## Installation

### Handy / Capture-PWA
1. Das ZIP `Beziehungsdynamiken_15.12.68_NUR_WEBSITE.zip` im GitHub-Pages-Repo in der obersten Ebene entpacken/hochladen. Die darin enthaltenen Dateien und Ordner direkt ersetzen bzw. hinzufügen, **keinen Unterordner** für die Release-Dateien anlegen.
2. Warten, bis GitHub Pages die Änderungen veröffentlicht hat. Direkt im Browser `https://beziehungsdynamiken.at/bindungsstile-trainer15-12-68.html` prüfen: die neue Spielansicht muss kommen. (Diese URL selbst bleibt öffentlich abrufbar; siehe Sicherheit.)
3. Capture-PWA **vollständig schließen**, aus der App-Übersicht entfernen und neu öffnen. Browser-Cache einmal durch normales Neuladen aktualisieren, falls nötig. **Nicht Website-Daten löschen, App-Speicher zurücksetzen oder PWA deinstallieren:** dort liegen lokale Erfassungen, Pairing und Lernstand.
4. Das Gehirn-Symbol in Capture anklicken und prüfen: keine Intro-Seite, direkt erste Frage und bebilderte Antworten.

### Cockpit / Desktop
- Für das Website-Cockpit werden `admin.html`, `admin-skill-training15-12-68.js`, `.css` und `bindungsstile-trainer15-12-68.html` auf GitHub Pages veröffentlicht.
- Für die **installierte** Windows- oder Mac-App ist zusätzlich die jeweilige neue Desktop-App nötig, da deren lokale eingebettete Webdateien nicht durch Website-Uploads geändert werden. App schließen und EXE bzw. `.app` ersetzen, **nicht** lokalen Vault oder Klientendaten löschen.
- Mac-M1-Paket beinhaltet unsignierte `.app` und ein `.command`-Skript, um lokal auf einem Mac ein DMG zu erstellen. Weder signiert noch notarisiert. Keine unbeaufsichtigte automatische Installation.

## Prüfungen / Grenzen
- JS-Syntax `node --check`: Capture, Capture-Service Worker, Cockpit-Trainingslauncher bestanden.
- Isolierte Chromium-Prüfung bei 390×844 und 1366×768: Gehirn-Button öffnet und schließt Dialog ohne JavaScript-Fehler; Trainingsseite bei 360×740, 390×844, 1366×768: vier bebilderte Antworten, Antwort-Feedback, Skill-Übersicht, kein Seiten-Scrollen.
- `go test ./...`: bestanden; Windows x64 (PE) und macOS ARM64 (Mach-O) mit aktuellem eingebettetem Frontend kompiliert; Archivintegrität CRC-geprüft.
- Direkter Live-Webserver-Playwright-Test scheiterte in dieser Umgebung an `ERR_BLOCKED_BY_ADMINISTRATOR`, daher **keine reale PWA/Service-Worker-Aktualisierung** oder Nutzer-Login verifiziert. Auf echten Android-/Windows-/Mac-Geräten nicht getestet.
- **Sicherheit:** Eine lokale Pairing-Prüfung in Capture schützt nur die Bedienoberfläche, nicht die öffentlich auf GitHub Pages liegenden Trainer-/Atem-Mediendateien. Für echten Zugriffsschutz braucht es serverseitige Berechtigungsprüfung und private Asset-Auslieferung.
- **Cockpit:** Der neue Button erscheint erst nach normalem Admin-Login. Die einzelne Trainings-HTML liegt noch als öffentliche Website-Datei vor.
- Letzten funktionierenden Stand 15.12.67 behalten, bis du auf dem Gerät getestet hast.

## Vorschlag für spätere Lernspielvarianten (noch nicht implementiert)
- Schnelle Zuordnung per Drag-and-drop, Dialog vervollständigen, Schlüsselhinweise markieren, Hypothesen-Duell, richtige Anschlussfrage auswählen, abwechselnde Kurzrunden. Motivierende, aber nicht manipulative Gamification. Zuerst den Grundablauf auf echten Geräten evaluieren.
