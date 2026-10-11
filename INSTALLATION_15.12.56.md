# Beziehungsdynamiken 15.12.56 – Cockpit-Begrüßung & Seifenblasen-Pause

Basis: 15.12.55 mit Hotfix **15.12.55d** (Newsletter) und **15.12.55e** (interaktive Seifenblasen). Die bestehende verschlüsselte Methodensynchronisation bleibt unverändert.

## Neu

- **Cockpit:** 5,2 Sekunden lang 13 organisch schwebende Blasen; ab etwa Sekunde 3,25 platzen die noch vorhandenen Blasen nacheinander. Kein Klickfang im Dashboard. Bei erneutem Öffnen des Dashboards startet der Effekt wieder.
- **Atemraum:** Bisheriges Symbol durch eine dampfende Tasse ersetzt. Der bestehende Button `cockpitBreathPause` und seine Atemraum-Funktion bleiben erhalten.
- **Seifenblasen-Pause:** Eigener Button unmittelbar daneben. Er öffnet ein modales Overlay. Laufend treten Blasen durch eine Öffnung am linken Rand ein. Klick/Touch lässt sie sichtbar platzen. Kleine Blasen: 3 Punkte, mittlere: 2, große: 1. Punktestand, Spielzeit, lokaler Rekord und `Neue Runde`. Ohne Ton und ohne Zeitlimit.
- Native Dialog-Semantik, `Esc`/Schließen, keine Klicks durch das Overlay auf die Praxisverwaltung. Motion-Preference berücksichtigt (kein dekoratives Cockpit bei reduzierter Bewegung; im Spiel langsamere Blasen).
- Kein Zugriff auf Klient:innen-/Vault-Daten und keine Netzwerk-/Worker-Anfragen durch die Animation oder das Spiel.

## Website (kann ohne Desktop-Installation genutzt werden)

Veröffentliche die vier Dateien aus dem PATCH-ZIP im Hauptverzeichnis des GitHub-Pages-Zweigs:

1. `admin.html`
2. `cockpit-bubbles15-12-55.js` (Name zur Kompatibilität beibehalten; Version im HTML ist 15.12.56)
3. `cockpit-bubble-game15-12-56.js`
4. `cockpit-bubble-game15-12-56.css`

Auch `cockpit-bubbles15-12-55.css` wird im Patch mitgeliefert, damit der Stand vollständig ist.

**Wichtig:** Wenn `admin.html` seit dem letzten Build parallel bearbeitet wurde, dessen aktuelle Version nicht blind ersetzen. Stattdessen die zwei neuen Link-/Script-Tags und die beiden Buttons aus der Patch-Datei übernehmen, sodass keine anderen Änderungen verloren gehen.

Nach einem erfolgreichen GitHub-Pages-Deployment Browser-Cache mit `Strg+Umschalt+R` aktualisieren und Cockpit öffnen.

## Desktop

Im Gegensatz zur öffentlichen Website werden die Webdateien in der Desktop-EXE/.app eingebettet. Deshalb muss für **das Spiel im eigenständigen App-Fenster** der neue Desktop-Launcher 15.12.56 installiert werden. Die Installation ersetzt **keine Vault-Daten**. Laufende Programme vor dem Austausch beenden. Vorherige Version als Rückfallversion aufbewahren.

- Windows: `Beziehungsdynamiken_WINDOWS_15.12.56.zip` entpacken; enthaltene EXE starten/ersetzen.
- Mac M1: `Beziehungsdynamiken_MAC_M1_15.12.56.zip` entpacken und `.app` nach Programme ziehen; bestehende App nach vollständigem Beenden ersetzen. Die Mac-App ist noch **nicht signiert und notarisiert**. Enthaltenes `DMG_ERSTELLEN_M1.command` erstellt erst auf macOS mit `hdiutil` ein DMG, kein fertiges signiertes DMG.

## Was NICHT nötig ist

- Keine neue D1-Migration.
- Kein neuer Cloudflare Worker für dieses reine UI-Spiel-Update.
- Kein erneutes Einlösen des BDW1-Workspace-Codes.
- Keine Neuanlage oder Neuinitialisierung eines persönlichen Vaults.

## Tests / Einschränkungen

- Browser-Test: 5,2-s-Begrüßung; interaktives Modal; Klick trifft Blase und erhöht Punktestand; Neue Runde setzt Punktestand zurück; Schließen stoppt Animation. Erfolgreich.
- JavaScript-Syntax: erfolgreich. Go `go test ./...`: erfolgreich. Windows amd64 und macOS arm64 kompiliert.
- Echte Starttests auf euren PCs bzw. auf Ilonas Mac sind noch offen; keine notarisierten Binaries. Automatische Selbstinstallation der Desktop-Updates ist weiterhin nicht verfügbar.

## Release

Wenn gewünscht: `v15.12.56` als GitHub **Pre-release** erstellen und nur beide Desktop-ZIPs als Assets hochladen. GitHub Release allein aktualisiert weder Website noch lokal installierte App automatisch.
