# Beziehungsdynamiken 15.12.64 – Freiraum / Local Vault Hotfix

## Behoben

- Der Freiraum lädt das lokale Board `/knowledge/idea-board?id=main` unabhängig von KI-Analyse, Concepts, Overview und Content Session.
- Ein Fehler eines der vier ergänzenden Endpunkte löscht/versteckt die Karten nicht mehr.
- Ein gescheiterter Board-Abruf bei entsperrtem Vault zeigt die korrekte Fehlermeldung und eine Schaltfläche **Erneut laden**, nicht mehr „Wartet auf Entsperren“.
- Wenn zuvor geladene Freiraum-Karten bei einer Aktualisierung nicht erneut geladen werden können, bleiben sie sichtbar.
- Ein Entsperren des Vault (`bd:vault-unlocked`) lädt den Freiraum automatisch neu; erneuter Versuch nach vorübergehend offline/gesperrt und beim Zurückkehren in den Tab.
- Auch bei Klick auf den grünen Vault-Status wird jetzt der Freiraum wirklich neu geladen, statt nur die Statusanzeige zu aktualisieren.
- Externe JS-Cache-Version für hub-build14-6.js angehoben.
- Keine Änderung an Vault-Daten, Cloudflare Worker oder D1; Spiel und Teamkalender bleiben unverändert.

## Installation

1. **Website:** Nur `hub.html` und `hub-build14-6.js` aus `Beziehungsdynamiken_15.12.64_NUR_WEBSITE.zip` im Website-Repository aktualisieren und deployen. Der ZIP enthält zusätzlich diese Anleitung. Anschließend Hub neu öffnen; ggf. **Strg+Umschalt+R**.
2. **Windows Desktop:** Desktop-App schließen und die neue EXE aus `Beziehungsdynamiken_WINDOWS_15.12.64.zip` ersetzen. Die eigentlichen lokalen Vault-Daten und Dateien nicht ersetzen oder löschen.
3. **Mac Apple Silicon:** Die neue unsignierte `Beziehungsdynamiken.app` aus `Beziehungsdynamiken_MAC_M1_15.12.64.zip` installieren (nicht notarisiert).
4. **Patch/Full:** Patch enthält nur die betroffenen UI-Dateien, eingebettete UI-Dateien, Versionen und die Windows-EXE; Full ist der komplette, kumulative Quellstand. Vor eventuellem Überschreiben anderer, neuerer eigener Änderungen vergleichen.

**Wichtig:** Diese Version aktualisiert den Cloudflare Worker **nicht**. Die Kalenderkorrektur aus 15.12.63 benötigt weiterhin den damals bereitgestellten Teamkalender-Worker, wenn er noch nicht installiert ist. Die persönliche Rekordsynchronisation benötigt weiterhin das gesonderte Update 15.12.61.

## Tests

- JS-Syntax via `node --check` für den geänderten Freiraum-Code erfolgreich.
- Chromium mit simuliertem Local Vault: Board wird trotz ausgefallener KI-Schnittstellen angezeigt; vorhandene Karten bleiben bei Refresh-Fehlern erhalten; erneutes Freiraum-Laden nach Vault-Unlock; verständliche Fehlermeldung statt „gesperrt“ und funktionierender Retry-Button.
- Desktop `go test ./...` erfolgreich, Windows amd64 und macOS arm64 erfolgreich kompiliert.
- ZIPs mit CRC geprüft.

**Noch offen:** Prüfung mit deinem tatsächlichen lokalen Vault und seinen vorhandenen Freiraum-Daten. Weil keine echte Verbindung zu deinem Rechner besteht, ist nicht bestätigt, ob dort zusätzlich der Board-Endpunkt oder eine Vault-Version eine Störung verursacht. In diesem Fall zeigt die neue Ansicht den konkreten Ladefehler statt ihn als „gesperrt“ zu verschleiern.
