# Beziehungsdynamiken Build 15.12.61 – Seifenblasen und persönlicher Rekord

## Neuerungen

- **Großes Spielfeld:** auf Desktop ca. 97 % der Browserbreite und bis 94 % der Viewporthöhe, auf Mobilgeräten nahezu bildschirmfüllend. Spielfeld flexibel; oben eine eigene Satzzeile, unten kompakte Steuerung.
- **Positive Überraschungen:** 86 redaktionell verfasste, vollständig geprüfte 3-teilige Sätze, darunter Mut zur Eigenart, Leichtigkeit, Beziehung, Gelassenheit und sechs sinngemäß übertragene internationale Sprichwörter. Keine automatische freie KI-Satzgenerierung.
- **Satzmoment:** Fragmente werden nur oberhalb der Spielfläche freigeschaltet. Sobald der dritte Teil auftaucht, pausiert die Spielmechanik ca. 3,4 Sekunden und der Satz leuchtet dezent auf, begleitet von einem sanften Klang (nur wenn Plopp-Ton eingeschaltet). Anschließend Fortsetzung ohne weiteren Klick. Keine Erklärungstexte im Feld.
- **Innere Saboteure:** ein separater Schalter, standardmäßig AUS. 25 ausgesuchte selbstabwertende Gedanken; fünf visuell/mechanisch unterschiedliche Störformen: Stachel, Wolke, Knoten, Stein und Wirbel. Beim Auflösen erscheint eine realistische Gegenperspektive oberhalb der Spielfläche; Bonuspunkte ohne Bestrafung. Umschalten während einer Runde entfernt Saboteure sofort, ohne Punktabzug. Schalterstand nur im lokalen Gerätespeicher.
- **Private-Preview-Frontpage:** Mischung kleiner, mittlerer und größerer Bubbles, ruhig, ca. 120 Sekunden, manuell erneut startbar. Die ruhige Serifengestaltung bleibt unangetastet.
- **Seltene Bonusblase:** subtilere Kontur, weniger auffällige Zacken; Sonderklang und Bonuspunkte bleiben.
- **Musik:** die bestehende Wahl zwischen First Light und Calm Track bleibt mit Lautstärkeregler, separatem Pop-Ton-Schalter und automatischem Stopp beim Schließen.
- **Persönlicher geräteübergreifender Rekord:** API und optionale D1-Tabelle ergänzt; die gemeinsame Anzeige funktioniert **erst nach Cloudflare-Worker-Deployment UND D1-Migration**. Daten sind auf den angemeldeten user_id/practice_id beschränkt; keine Client-Daten und keine Cloudanfragen pro Plopp. Offline bleibt lokaler Bestwert erhalten; bei nächstem erfolgreichen Öffnen/Abgleich gewinnt jeweils das Maximum. Keine gemeinsame Team-Rangliste.
- Vorherige Atempause-Fixes (Vorschausymbole, Linkentfernung, verbesserte Scrollleisten) bleiben unverändert erhalten.

## 1) Website aktualisieren (ohne Datenbank-Änderung)

`Beziehungsdynamiken_15.12.61_NUR_WEBSITE.zip` in das GitHub-Pages-Hauptverzeichnis hochladen und gleichnamige Dateien ersetzen. Enthalten sind `index.html`, `beziehungsvielfalt.html`, `site-mode15-5.js`, `private-preview15-12-57.js`, `admin.html`, `cockpit-bubble-game15-12-56.js`, `cockpit-bubble-game15-12-56.css` und diese Anleitung.
Nach Veröffentlichung Browser mit Strg+Umschalt+R neu laden. Diese Website-Dateien allein reichen für die visuelle Spieländerung. Die Rekordsynchronisation bleibt bis Schritt 3 lokal.
Bei parallelen Änderungen an `admin.html` oder `index.html` gegebenenfalls per Diff zusammenführen statt fremde Änderungen zu überschreiben.

## 2) Desktop-App aktualisieren

- Windows: `Beziehungsdynamiken_WINDOWS_15.12.61.zip`. App vollständig schließen, EXE ersetzen; Secure Practice Vault, Workspace-Schlüssel und Datenverzeichnisse **nicht löschen**.
- Mac Apple Silicon M1/M2/M3: `Beziehungsdynamiken_MAC_M1_15.12.61.zip`, enthält `Beziehungsdynamiken.app` und `DMG_ERSTELLEN_M1.command`. Das signierte/notarisierte Apple-DMG ist **nicht** enthalten. Für ein lokales DMG das beiliegende Skript auf einem Mac ausführen.
- **Achtung:** Website-Upload aktualisiert NICHT die Go-Desktop-App automatisch. Mac/Windows enthalten gebündelte Webinhalte.
- Der Python-Vault wird durch dieses Update nicht aktualisiert oder neu eingerichtet. Die Build-Zahl des lokalen Vaults kann daher abweichen.

## 3) Optional: persönlichen Rekord über Geräte synchronisieren

`Beziehungsdynamiken_15.12.61_CLOUDFLARE_REKORDSYNC.zip` enthält nur:
- `cloudflare-worker/worker.js` (bestehender Worker **inklusive** der neuen Route `/admin/game/record`)
- `database/migrations/016_12_61_bubble_records.sql` (neue separate D1-Tabelle `bubble_game_records`)

**Vorher Sicherung und Konfiguration kontrollieren.** Der Worker ist ein vollständiger Stand auf Basis der 15.12.60-Projektquelle, nicht ein isoliertes diff; bei zwischenzeitlichen Änderungen an Produktion diese vor einem Deployment zusammenführen. Verbindliche Praxis-Konfigurationswerte, Secrets, KV, D1- und R2-Bindings dürfen nicht überschrieben werden.

Zuerst die einzige additive Migration `016_12_61_bubble_records.sql` in die richtige Praxis-D1-Datenbank einspielen und verifizieren. Bei Wrangler kann sie mit `npx wrangler d1 execute <DEIN_DB_NAME> --remote --file=database/migrations/016_12_61_bubble_records.sql` ausgeführt werden (Datenbankname und Projekt-Konfiguration selbst einsetzen). Anschließend den bestehenden Worker mit seinem bisherigen Projekt/Binding/Secrets-Kontext deployen und `GET /admin/game/record` mit gültiger Praxisanmeldung testen. **Nicht nur die worker.js Datei im GitHub-Pages-Branch hochladen**; Worker-Deployment erfolgt separat. Ein Worker-Deployment wurde von mir nicht durchgeführt.

Wenn du nur die Website und Desktop-Apps aktualisierst, läuft das Spiel vollständig; jeder Geräte-Bestwert bleibt zunächst lokal. Der Browser fragt beim Öffnen die Cloud maximal einmal ab und sendet nur einen verbesserten Bestwert, nicht jeden Treffer. Durch angemeldete persönliche API können Theo und Ilona getrennte Bestwerte haben. Die D1-Tabelle enthält nur `practice_id`, `user_id`, `best`, `updated_at`.

## Testumfang

- `node --check` von Spiel, Frontpage und Worker ohne Syntaxfehler.
- Browser-/Chromium-Tests: 1600×900, 1366×768, 1280×720, 1024×640, 390×844 und 375×667; kein zusätzlicher horizontaler Scrollbereich oder innerer Scrollzwang im Spiel. Satzpause, Fortsetzung, Saboteur aktivieren/deaktivieren, Gegenperspektive, Schließen getestet.
- 120-s-Animation nach Zeitvorlauf und Neustart getestet; Mischung größerer/kleinerer Blasen nachgewiesen.
- `go test ./...` erfolgreich, Windows amd64 und Mac arm64 cross-kompiliert. ZIP-Integrität überprüft.
- **Noch offen:** reale Windows-/Mac-Installation und Live-Test der Rekord-D1-API nach Deployment. Musik klanglich nicht auf euren Lautsprechern bewertet. Keine Änderungen an persönlichen Clientdaten.
