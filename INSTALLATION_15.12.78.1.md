# Beziehungsdynamiken – Hotfix 15.12.78.1

**Basis: Build 15.12.78.** Dieser Hotfix betrifft **die Welt der Glut / Deida-Trainer**. Er enthält **keine neue D1-Migration**, keinen neuen Cloudflare-Worker und keinen Update-Automatismus. Vorhandene Praxis- und Lernstands-Daten bleiben erhalten.

## Fehlerursache
Beim Klick auf **Antwort prüfen** mit einer **falschen Auswahl** wurde zunächst korrekt eine 💪-Wiederholungskarte erzeugt. Danach versuchte die Auswertung, einer der vier Optionskarten eine **leere CSS-Klasse** mit `element.classList.add('')` zuzuweisen. Das führt im Browser zu einer `SyntaxError`/`InvalidCharacterError` und stoppt die Funktion vor der Rückmeldung. Deshalb sah man die Auswahl und den steigenden Muskelzähler, aber keinen Weiter-Dialog. Frühere Testskripte hatten nur **richtige** Antworten durchgespielt und diesen Fehler nicht erkannt.

## Korrekturen
- CSS-Klasse nur setzen, wenn wirklich ein Klassenname vorhanden ist.
- Muskelkarten-Speicherung mit separatem Fehlerfang: Cloud/Browser-Speicherfehler dürfen eine laufende Übung nicht blockieren.
- Spezifischere Fehlerrückmeldung beim Aufgabentyp **„Vorschnelle Deutung“**.
- Browsercache-Abgleich: Version von `deida-game77.js` auf `15.12.78.1` erhöht, gezielter Link zur Trainerseite versioniert, Capture-PWA-Cache erhöht.

## Installation (Website / GitHub Pages – empfohlen)
1. Vorherige Website bzw. GitHub-Repo sichern.
2. **MINI_PATCH_WEBSITE.zip** entpacken: die vier geänderten Dateien im Website-Root **überschreiben**. Keine Ordner komplett ersetzen und vor allem keine lokalen Browser-/Vault-Daten löschen.
3. GitHub-Pages-Veröffentlichung abwarten, dann den Akademie-Tab neu laden; falls erforderlich **Strg+F5**. Die Deida-Trainingsseite lädt jetzt `deida-game77.js?v=15.12.78.1`.
4. Deida-Training öffnen, **bewusst falsche Option** anklicken, **Antwort prüfen** drücken: Rückmeldung muss sofort im Zentrum erscheinen, **Weiter** muss sichtbar und anklickbar sein.
5. Zweimal richtige Antworten durchlaufen, prüfen ob der Fall gezählt wird; 💪-Button öffnen und Karte wiederholen.

## Installation Desktop (nur bei Bedarf)
Das bestehende Windows-Projekt mit PATCH aktualisieren oder das FULL-Paket verwenden. Windows-EXE und macOS-ARM64-App wurden mit denselben korrigierten Website-Dateien neu kompiliert. Vor Austausch der Desktop-App ein Vault-Backup anlegen. Mac-Build weiterhin unsigniert und nicht notarisiert; keine automatische Installation. **Ilonas derzeitige stabile Mac-Version muss für diese Korrektur nicht aktualisiert werden.**

## Teststatus
- Browser-DOM-Test in echtem headless Chromium mit lokal injizierten Originaldateien: 3 falsche Antworten, sichtbare Rückmeldung, sofortiges Retry, kein Doppel-Eintrag im Muskel; provozierter Muskelspeicherfehler ohne Trainingsabbruch; 12 vollständige Fälle und Level-Freischaltung; Muskel-Fenster öffnen, antworten, weiter, schließen; Mobilansicht und keine unbehandelten JS-Fehler: BESTANDEN.
- JavaScript Syntax/Go-Tests, Cross-Compile Windows/macOS, ZIP-Integrität: BESTANDEN.
- **Nicht** durchgeführt: echter Klicktest auf der live veröffentlichten Website und echte Windows/Mac-Endgeräte. Chromium ließ hier den Zugriff auf `localhost` nicht zu; der DOM-Test wurde über `page.set_content` durchgeführt. Nicht als Live-Test ausgeben.
- Diese Korrektur bestätigt **nicht** die Cloudflare-Cloud-Synchronisation zwischen euren beiden Geräten.
