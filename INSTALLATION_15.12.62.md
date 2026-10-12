# Beziehungsdynamiken 15.12.62 – Saboteur-Intensität und künstlerische Auflösung

## Neu in dieser Version

- Im Seifenblasen-Spiel ersetzt ein **Regler 0–5** die alte Ein/Aus-Checkbox. **0 = aus**, 1 = gelegentlich ein Saboteur, 5 = bis zu fünf gleichzeitig. Die Einstellungen werden im jeweiligen Gerätespeicher gemerkt, bisherige aktivierte Checkbox wird beim ersten Start in Level 2 überführt.
- Die Saboteure erscheinen jetzt nach einem eigenen Zeitplan, **unabhängig vom normalen Blasenzähler**. Das behebt die zuvor seltenen Auftritte nach Bonusblasen. Je höher die Zahl, desto kürzer der Nachschubabstand.
- Beim Treffen bricht eine Saboteur-Blase etwa **0,8 Sekunden** lang sichtbar auf (Filmrisse, verstreuende Kontursegmente, sanfter Ring) und erzeugt ein eigenes, zurückhaltendes Geräusch. Währenddessen steht die Bewegung still.
- Danach erscheint das **Antidot groß über dem Spielfeld**, mit einer warmen Lichtstimmung und einer sanften, dreitönigen Auflösung. Die Spielfläche ruckt kurz um wenige Pixel; nach etwa 3,3 Sekunden wird automatisch weitergespielt.
- Neben dem Regler gibt es **„Wackeln“** zum An-/Ausschalten des Ruck-Effekts. Bei aktiviertem Betriebssystemmodus „Bewegung reduzieren“ bleibt der Bildschirm still, und die Textanimation wird nicht abgespielt.
- Keine Punktabzüge. Das Abschalten der Saboteure entfernt verbleibende Gegner sofort und beendet auch einen eventuell aktiven Auflösungsmoment. Musik/Pop-Audio bleiben getrennt einstellbar und stoppen beim Schließen.
- Alle Änderungen sind **ausschließlich Frontend/Desktop**. Keine neuen D1-Migrationen, Cloudflare-Worker-Änderungen oder Speicherung sensibler Klientendaten.
- Bestehende Verbesserungen von 15.12.61: großes Spielfeld, 86 positive Sätze, Satzmomente, Frontpage-Blasen und optionale Cloud-Rekordsynchronisation bleiben erhalten.

## 1) Website aktualisieren

`Beziehungsdynamiken_15.12.62_NUR_WEBSITE.zip` enthält nur `admin.html`, `cockpit-bubble-game15-12-56.js` und `.css` und diese Anleitung. Diese drei Webdateien im GitHub-Pages-Hauptverzeichnis ersetzen. Danach Website mit Strg+Umschalt+R aktualisieren. **Falls du `admin.html` seit Build 15.12.61 anderweitig verändert hast, vorher vergleichen und zusammenführen.** Die öffentliche Frontpage wird in dieser Version nicht geändert.

## 2) Desktop-App aktualisieren

- Windows: `Beziehungsdynamiken_WINDOWS_15.12.62.zip`, App vorher vollständig schließen, dann die EXE austauschen. Persönliche Vault-Verzeichnisse, lokale Schlüssel und andere Daten **nicht löschen**.
- Mac Apple Silicon: `Beziehungsdynamiken_MAC_M1_15.12.62.zip` mit `Beziehungsdynamiken.app` und optionalem lokalem `DMG_ERSTELLEN_M1.command`. Die App ist nicht Apple-signiert oder notarisiert; ein Mac-DMG lässt sich nur auf macOS erstellen.
- Ein GitHub-Pages-Upload ändert **nicht** die schon installierte Desktop-App. Die Apps enthalten ihre eigene eingebettete Oberfläche.

## 3) Optional: persönliche Rekorde über Geräte

Wenn die Rekord-Synchronisation von 15.12.61 bei dir noch nicht installiert wurde, funktioniert das Spiel trotzdem unverändert lokal. **Für gemeinsame persönliche Rekorde bleiben das gesonderte Worker-Update und die D1-Migration aus 15.12.61 nötig.** In 15.12.62 selbst gibt es keine neue Worker-/D1-Datei. Vor jedem Cloudflare-Deployment die aktuelle produktive Worker-Version und Bindings gegenprüfen.

## QA

- `node --check` der Spiel-JS-Datei erfolgreich, `go test ./...` im Desktop-App-Projekt erfolgreich.
- Chromium-Browsertests: 1366×768, 1024×640, 390×844 und 375×667; mehrere Saboteure bei hoher Dichte, Treffer, verzögertes Antidot, Pausierung und automatische Fortsetzung, Regler 0, während des Reveal ausschalten, Wackeln aus, `prefers-reduced-motion` getestet.
- Windows-amd64- und macOS-arm64-Desktop-Binärdateien frisch aus eingebetteten Webdateien kompiliert. ZIP-Inhalte mit CRC geprüft.
- **Nicht getestet:** echte Windows/Mac-Benutzung, Sound auf Endgeräten, produktive Cloud-Rekord-API. Kein Deployment erfolgt.
