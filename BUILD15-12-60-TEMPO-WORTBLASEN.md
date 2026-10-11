# Beziehungsdynamiken 15.12.60 – Tempo & Wort-Blasen

## Änderungen

- **Cockpit:** Die zweite Beschriftung „Praxis-Cockpit“ direkt über „Braucht deine Aufmerksamkeit“ wurde entfernt. Die obere Bereichsbeschriftung bleibt.
- **Seifenblasen-Spiel:** Temporegler 0–100 unter dem Spielfeld, Startwert 35 („Entspannt“). Der Regler steuert die tatsächliche Blasenbewegung und in moderatem Umfang die Nachschubfrequenz. Er reagiert sofort und merkt sich den gewählten Wert lokal im Browser (sofern Speicherung erlaubt ist). Bei Tempo 0 schweben Blasen weiterhin langsam.
- **Wort-Blasen:** Nach einigen platzen gelassenen Blasen erscheint gelegentlich ein positiver Begriff bzw. ein Teil eines vollständigen, redaktionell ausgewählten Satzes. Satzteile bleiben oberhalb des Spielfelds sichtbar, bis nach drei Treffern der ganze Satz entsteht. Anschließend beginnt eine neue Formulierung. Keine zufälligen, grammatisch unsinnigen Wortkombinationen.
- **Satzbeispiele:** „Heute darf’s auch mal leicht sein.“, „Freude braucht nicht immer einen Anlass.“, „Ein bisschen Luft tut manchmal richtig gut.“ und „Mehr Luft. Mehr Leichtigkeit. Mehr du.“
- **Atemraum-UX:** Link „Advanced Stimmen“ entfernt, Atempause-Header in „Atemraum“ geändert, eigene Vorschausymbole für alle Katalog-Übungen, Bildausfall-Fallback und eingebettete Übungsansicht ohne doppelte Scrollleisten bei üblichen Bildschirmgrößen. Die Anleitung bleibt verfügbar.
- Keine Änderung an Cloudflare Worker, D1, Newsletter, Methodensynchronisation, Workspace, Vault oder Private-Preview-Startseite.

## Website installieren

ZIP `Beziehungsdynamiken_15.12.60_NUR_WEBSITE.zip` enthält `admin.html`, die beiden Spiel-Dateien und zusätzlich `admin-breath-pause15-12-18.js`, `admin-breath-pause15-12-18.css` und `breath-standalone15-12-18.html`. In das GitHub-Pages-Hauptverzeichnis hochladen; vorhandene Dateien ersetzen. `admin.html` bekommt neue Cache-Busting-Versionsparameter, damit der Browser die aktualisierten Dateien lädt.

**Wichtig:** Wenn deine `admin.html` seit 15.12.59 zusätzlich verändert wurde, diese Änderungen vorher sichern bzw. die CSS-/JS-Versionsverweise und das Entfernen der Doppelüberschrift gezielt zusammenführen. Kein Worker-Deployment und keine Migration nötig.

## Desktop-App installieren

- Windows: `Beziehungsdynamiken_WINDOWS_15.12.60.zip` enthält die aktualisierte EXE.
- Mac M1: `Beziehungsdynamiken_MAC_M1_15.12.60.zip` enthält eine `.app` sowie `DMG_ERSTELLEN_M1.command`. Für ein echtes DMG `hdiutil` auf einem Mac verwenden. Die Mac-App ist weiterhin unsigniert/nicht notarisiert.
- Laufende Desktop-App vor Ersetzen vollständig schließen.
- Secure Practice Vault, Zugangsdaten, Workspace-Schlüssel und lokale Praxisdaten **nicht** löschen oder neu initialisieren.
- Der getrennt laufende Python-Vault wird durch das Desktop-Update nicht aktualisiert.

## Teststatus

- `node --check` der veränderten JS-Datei erfolgreich.
- Browserprüfung für 1366 × 768 und 390 × 844: Regler, Treffer, Wort-/Satzteile, Neue Runde und Schließen ohne JavaScript-Fehler.
- Go-Unit-Tests erfolgreich; Windows amd64 und macOS arm64 cross-kompiliert.
- Keine echte GUI-Installation auf den Geräten der beiden Praxisnutzer getestet. Echtzeit-Synchronisation nicht erneut verändert oder getestet.
- Die ZIP-Archive wurden auf beschädigte Einträge geprüft.

Release auf GitHub ist optional für die App-Verteilung; das Hochladen allein installiert noch keine Updates automatisch.
