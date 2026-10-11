# Beziehungsdynamiken 15.12.59 – ruhige Bubbles & seltene Spezialblase

## Änderungen

- **Private-Preview-Startseite:** Premium-Layout und direkter Beziehungstext wie bisher. Die Seifenblasen rechts sind nun auf kleine, dezente Größen begrenzt (auch während ihrer Verformung); weniger gleichzeitige Blasen, weniger gesättigte Konturen, weniger neue Blasen. 30 Sekunden interaktiv, Klick zum Platzen, „Noch einmal“ bleibt.
- **Cockpit:** Herz, Stern, Mond, Sonne, Wolken stehen nun länger als erkennbare Form. Die Motive halten ca. 7 Sekunden, danach platzen die Blasen gestaffelt über ca. 5,4 Sekunden, mit längeren sichtbaren Ringeffekten; insgesamt rund 14,4 Sekunden. Das Motiv „frei“ bleibt kürzer (ca. 7 Sekunden). Reaktion auf reduzierte Bewegung bleibt vorhanden.
- **Seifenblasen-Pause:** Dezente Spezialblase mit leicht gezacktem/irisierendem Rand erscheint selten (nach etwa 15–23 neu erzeugten Blasen, nicht zu Beginn). Anklicken: 12 Bonuspunkte, helles dreistimmiges Kling statt tiefem Plopp sowie ein etwas längerer goldener Pop mit Lichtpunkten. Normaler Pop-Sound und Ton-an/aus bleiben. Der Sound wird lokal per Web Audio erstellt, ohne externe Datei und ohne Cloud-Anfrage.
- Keine Änderungen an Cloudflare Worker, D1-Migration, Vault-Daten, Workspace-Schlüssel, Newsletter oder Methodensynchronisation.

## Einspielen auf der Website (GitHub Pages)

Die folgenden Dateien aus `Beziehungsdynamiken_15.12.59_NUR_WEBSITE.zip` ins Hauptverzeichnis des GitHub-Pages-Branches aktualisieren:

1. `index.html`, `site-mode15-5.js` – Versionsparameter für neue Preview-Dateien
2. `private-preview15-12-57.js`, `private-preview15-12-57.css` – zurückhaltende kleine Seifenblasen
3. `admin.html` – Versionsparameter der Animationsdateien
4. `cockpit-bubbles15-12-55.js` – längere Cockpit-Motive
5. `cockpit-bubble-game15-12-56.js` – Spezialblase, Bonus, dreistimmiger Ton

**Dateinamen bleiben absichtlich stabil**, um keine verwaisten Referenzen zu hinterlassen. Bei zwischenzeitlichen Änderungen an `index.html` oder `admin.html` die Versionseinträge gezielt zusammenführen, nicht blind ältere Dateien hochladen.

Nach GitHub-Pages-Deployment Seite mit Strg+Umschalt+R neu laden; im Private Preview die Startseite und unter `admin.html#dashboard` die Cockpit-Animation prüfen.

## Desktop-Apps

Windows: `Beziehungsdynamiken_WINDOWS_15.12.59.zip`, nach Beenden der alten App die EXE ersetzen. Mac Apple Silicon: `Beziehungsdynamiken_MAC_M1_15.12.59.zip` enthält eine `.app` und `DMG_ERSTELLEN_M1.command` (erfordert macOS). Die App ist **nicht signiert/notarisiert**; kein fertiges signiertes DMG.

**Vault-Daten nicht neu initialisieren!** Der getrennt laufende lokale Python-Vault wird durch den App-Austausch nicht aktualisiert. Der bestehende Workspace-Zugang bleibt unverändert.

## Tests & Grenzen

- Syntaxprüfung aller geänderten JS-Dateien erfolgreich.
- Playwright/Chromium: Preview bei 1366×768 ohne vertikalen Scrollbalken, Mobilansicht 390×844 ohne horizontalen Überlauf; Spieltreffer erhöhen Punktestand und Dialog schließt korrekt.
- Go-Unit-Tests erfolgreich; Windows amd64- und Mac arm64-Binary kompiliert.
- Echte GUI-Tests auf euren Windows-/Mac-Geräten fehlen. Der dreistimmige Bonus-Sound wurde technisch integriert, aber noch nicht auf euren Lautsprechern beurteilt.
- Release `v15.12.59` auf GitHub ist optional für die Verteilung der Desktop-Apps. Veröffentlichung eines Releases allein aktualisiert weder Website noch installierte App automatisch.
