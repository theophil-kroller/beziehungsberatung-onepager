# Beziehungsdynamiken · Installation 15.12.73

**Basis: 15.12.72 FULL.** Dies ist ein tatsächlicher Entwicklungsstand mit getrennten Trainingsseiten unter einer gemeinsamen responsiven Journey Map. Kein Live-Deployment und keine Datenbankmigration.

## Neue Academy
- Eine gemeinsame Startseite `academy-journey15-12-73.html` für Desktop und Mobilgeräte, zehn thematische Kompetenzwelten und insgesamt 52 Modelle/Trainingspunkte. Zwölf vorhandene Einstiegspunkte führen zu aktiven Übungen (mehrere Pfade verwenden dasselbe 20-Level-Mastery-System). Vierzig Methoden bleiben bewusst grau und **nicht anklickbar**, u. a. Gottman, RLT, EFCT/EFIT/EFFT, IBCT, Imago, PACT, Somatic Experiencing, NARM und Somatica.
- **Keine Journey-Sperren:** Alle aktiven Module direkt frei anwählbar. Innerhalb von Skill Mastery bestehen unverändert die progressiven 20 Levels mit Rollenvariabilität und bestehendem lokalen Fortschritt.
- Die früher eigenständigen Gross-, Bindungsstil- und Mastery-Trainings sind über die gemeinsame Karte erreichbar und haben einen Rückweg zur Academy. Für Gross und Bindung werden die bisherigen didaktischen Modi und Fortschrittssysteme erhalten – **kein neu erfundenes 20-Level-System**. Ein Wechsel zwischen ihnen läuft derzeit über gemeinsame Navigation, **nicht** durch automatische Fall-/Statusübergabe mitten in einem Dialog.
- Die mechanische linke Mastery-Sidebar ist ausgeblendet. Der Levelpfad ist zuklappbar; die Trainingsfläche erhält mehr Raum. Die Journey scrollt auf Mobilgeräten als ganze Seite und hat eine feste untere Kurz-Navigation.
- Cockpit-Training und Capture-Training starten auf der gemeinsamen Journey Map. Die Capture-Kopplungsprüfung bleibt unverändert.
- Der Fortschritt wird weiterhin unter den vorhandenen Browser-LocalStorage-Schlüsseln gespeichert; keine Migration und keine Veränderung an Vault-, Klienten-, D1- oder API-Strukturen.

## Audio / Voice Manager
- Zentraler Stimmenmanager `voice-manager73.js` für Mastery, Gross und Bindungsstile. Listet nur die vom **jeweiligen Browser** bereitgestellten deutschen Stimmen. Manuelle Zuordnung pro Charakter sowie für generische weibliche/männliche Stimmen und Testfunktion.
- Bei automatischer Auswahl werden nur in den Stimmnamen eindeutig erkennbare männliche/weibliche Stimmen gewählt. Wenn keine passende Stimme angeboten wird, erfolgt **kein blindes Gender-Fallback** und eine erklärende Meldung statt falscher Ausgabe. Benutzer können manuell eine gewünschte Stimme prüfen und zuordnen.
- Microsoft Natural Voices werden **nicht** installiert, aktiviert oder heruntergeladen. Chrome kann unter Windows andere Stimmen anbieten als Microsoft Edge. Testpanel im Browser öffnen und nachsehen. Dies ist Browser-TTS, keine synthetisierte einzigartige Cloud-KI-Stimme.

## Installation Website (GitHub Pages)
1. `Beziehungsdynamiken_15.12.73_NUR_WEBSITE.zip` entpacken.
2. Enthaltene Dateien mit ihrer relativen Struktur **auf den bestehenden Website-Projektstand** übertragen (kein Löschen anderer bestehender Dateien). Dabei die Cockpit- und Capture-Dateien ersetzen, die neuen `academy-*73*` und `voice-manager73.js` ergänzen sowie `training-assets/` belassen.
3. Aktualisierung veröffentlichen und `academy-journey15-12-73.html` aufrufen. Im Cockpit Trainings-Button klicken, in Capture erst koppeln und dann Training starten.
4. Bei unerwartet alten Seiten einen gezielten Reload durchführen; **nicht** pauschal Browser-/App-Daten löschen, da lokale Trainingsstände und offline gespeicherte Captures dadurch verloren gehen können.
5. Neuer PWA-Cache `bd-capture-15-12-73` für die neuen Academy-Shell-Dateien. Falls das Offline-Caching auf einem älteren lokalen Deploy unvollständig ist, Server-Dateipfade und Serviceworker-Installationsfehler prüfen.

## Windows
- Für vollständige Installation `Beziehungsdynamiken_WINDOWS_15.12.73.zip` entpacken und die 15.12.73-EXE starten. Der Vollprojektstand enthält Quellcode, bestehende Vault-/Web-/Worker-Dateien und neue Academy. Patch auf eine Kopie des **15.12.72-Projektstandes** legen, Ordnerstruktur erhalten; keine Vault-Daten überschreiben.
- Die Desktop-App stellt lokale Web-Dateien unter `127.0.0.1:47832` bereit und benötigt den separaten lokalen Vault für Praxisdaten. Vor Updates Backups der produktiven Vault-Daten erstellen; diese Pakete haben keine automatische Update-Prüfung oder Kompatibilitätsgarantie für laufende Vault-Versionen.

## macOS M1/M2/M3/M4
- `Beziehungsdynamiken_MAC_M1_15.12.73.zip` entpacken; Anwendung schließen, dann `Beziehungsdynamiken.app` ersetzen und starten. Die App wurde für Apple Silicon cross-kompiliert, jedoch nicht auf einem realen Mac getestet, signiert oder notarisiert.

## QA und Grenzen
- Bestandene Prüfungen: JavaScript-Syntax aller aktualisierten Skripte; 10 Kompetenzwelten, 52 Methodenknoten, keine fehlenden aktiven Linkziele; Go-Test-Suite; Cross-Compilation Windows amd64 und macOS arm64; ZIP-Inhalts- und Prüfsummenprüfung.
- **Nicht geprüft:** Echtgerät-Installation, korrekte Browserdarstellung in Chrome/Edge/Safari, natürlich klingende Windows-Stimmen und Live-Cloudflare-/GitHub-Pages-Deployment. Automatisierte browserseitige Visualläufe waren in der Ausführungsumgebung durch Administrator-Sperren blockiert.
- Die statischen Trainingsseiten sind nicht serverseitig login-gated; keine echten Klientendaten in Übungen eingeben. Das Skill Lab führt keine Diagnosen durch, verleiht keine klinischen Qualifikationen und bietet keine trauma- oder risikoreiche Selbsterfahrung an.
- Die grau gekennzeichneten Ansätze sind **Bibliotheks-/Roadmap-Einträge**, keine fertigen Inhalte, kein urheberrechtlich geschütztes Ausbildungsmaterial. Insbesondere Somatica-Unterlagen liegen nicht vor; SE, NARM und Somatica sind reservierte Module.

## Regression manuell prüfen
1. Academy Dashboard > Journey öffnen, auf Mobilansicht mit 360–390 px Breite umstellen, nach unten scrollen und einen aktiven Knoten antippen.
2. Gross-Szenario mit vorhandenen Antwortmöglichkeiten spielen und über „Journey“ zurückkehren; Bindungsstiltraining analog.
3. Mastery „Entwertung & Anspruch“ auswählen, Levelweg öffnen, Level 2 muss bis zu den nötigen bestandenen Durchgängen gesperrt bleiben, bestehender Fortschritt der 15.12.72 erhalten.
4. Stimmenmanager in Mastery und Gross öffnen. Männlicher Charakter bekommt **keine** zufällige Frauenstimme; wenn männliche Stimme fehlt, bleibt die Ausgabe aus, bis eine Stimme manuell gewählt wird.
5. Bei Navigation oder Beenden sicherstellen, dass die Sprachausgabe gestoppt wird und keine Vault-Daten verändert werden.
