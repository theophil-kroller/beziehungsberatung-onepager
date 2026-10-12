# Beziehungsdynamiken – Build 15.12.71

**Basis:** vollständige Version 15.12.70. Die klinischen Vault-Daten, lokale Client-Dokumentation und Cloudflare-Datenbankstruktur bleiben unverändert.

## Neue Funktionen

1. **Gross: Emotionsregulation.** Neues eigenständiges, aber mit dem Bindungsstil-Training verknüpftes Skill-Paket. Zwölf sorgfältig formulierte, synthetische sechsphasige Fallmissionen: (1) Geschehen erkennen, (2) Strategiefamilie bestimmen, (3) Unterstrategie erkennen, (4) zwei Ideen selbst formulieren, (5) passende beraterische Intervention wählen, (6) auf neue Informationen reagieren. Jede Mission enthält spezifisches Feedback und eine Abschlussübersicht. Die fünf Gross-Kategorien sind Situationsauswahl, Situationsveränderung, Aufmerksamkeitslenkung, kognitive Veränderung und Reaktionsmodulation. Aufmerksamkeit umfasst unter anderem Distraction, Concentration und Rumination (Letztere nicht automatisch hilfreich).
2. **Strategietöpfe.** 36 Technik-Beispiele, jeweils 4–7 pro Runde, sechs Auswahlkategorien (fünf Prozessfamilien sowie „keine erkennbare Regulationsstrategie“). Ungleiche Verteilung und multiple korrekte Töpfe sind möglich. **Nach jeder abgeschlossenen Runde** folgt eine unmittelbare Übersicht für *jede* Karte: vollständig richtig, teilweise richtig oder noch nicht richtig. Auswahl und passende Kategorien können je Zeile ausgeklappt werden. Per Tipp auf dem Handy bedienbar. XP belohnen Übung, keine klinische Kompetenzbescheinigung.
3. **Beispiele & Kontexte.** Polyamorie/Eifersucht, Freundschaft, Trennungsreaktion/Trauer, Affäre/Vertrauensbruch, Partnerschaft, Familie und Beratungsskepsis. Bei gebrochenen Vereinbarungen oder Bedrohung werden Sicherheit und tatsächliche Beziehungsklärung ausdrücklich von reiner Emotionsregulation unterschieden.
4. **Bindungsstile-Fehlerbehebung.** Alle 16 Hinweisjagd-Fälle haben jetzt vier **wörtlich im Falltext enthaltene Hinweise**, davon zwei entscheidende. Keine erfundenen oder unsinnigen Ablenker wie „Es hat geregnet“. Zusammenhängende, plausible Kontextinformationen statt künstlicher Fremdsätze. Automatisch angepasste Schriftgröße und Raumaufteilung: kein abgeschnittener Satz auf den getesteten Smartphonegrößen. Überschrift bei namenlosen Fällen: „Aussage im Beratungsgespräch“ statt „Ein Fall aus der Beratung“.
5. **Zuordnungsergebnis Bindungsstile.** Nach 4–7 Zuordnungen sofortige Karte-für-Karte-Rückmeldung: vollständig, teilweise oder nicht richtig; „Deine Zuordnung“ und „Passender“ pro Karte. Eine zusätzliche 12-Schritte-Rundenübersicht zeigt auch korrekt gelöste Aufgaben, nicht nur Fehler.
6. **Verknüpfung und Offline-Modus.** In Bindungsstile oben „Gross ↗“, im Gross-Spiel „← Bindung“. Beide Pakete sind über dieselbe Skill-Lab-Oberfläche im Cockpit und gekoppelten Capture erreichbar. Versionierte Dateien umgehen alten PWA-Cache; Capture-Service-Worker `bd-capture-15-12-71` führt beide Trainer inklusive Gross-Daten im Offline-Cache. Vorhandener Bindungsstil-XP/Lernfortschritt bleibt unter den bisherigen LocalStorage-Schlüsseln erhalten; Gross nutzt einen getrennten Fortschrittsbereich.

## Installation

**GitHub Pages / Website & Capture**
- `Beziehungsdynamiken_15.12.71_NUR_WEBSITE.zip` lokal entpacken. Die enthaltenen Dateien und Ordner in den Wurzelordner des GitHub-Pages-Repositories `beziehungsberatung-onepager` übernehmen (nicht nur die ZIP hochladen). Die Veröffentlichung abwarten.
- Auf dem Smartphone Capture vollständig schließen und neu öffnen. Bei hängender alter Version Seite neu laden; **keine Browserdaten/App-Daten löschen** (sonst droht Verlust des lokalen Lernstands, der Capture-Kopplung oder ungesendeter Aufnahmen).
- Neu: `gross-trainer15-12-71.html` und `gross-data71.js` müssen gemeinsam mit `gross-game71.js`, `gross-game71.css` und dem Bindungsstile-Trainer hochgeladen werden.

**Windows**
- Laufende Desktop-App schließen. Die neue EXE aus `Beziehungsdynamiken_WINDOWS_15.12.71.zip` verwenden oder den Patch auf eine bestehende Projektkopie anwenden. Vault und lokale Datenordner unangetastet lassen.

**Mac M1/M2/M3 (ARM64)**
- `Beziehungsdynamiken_MAC_M1_15.12.71.zip` entpacken, `.app` einsetzen. Die App ist nicht signiert oder notarisiert. Enthaltenes `.command`-Skript kann auf dem Mac bei Bedarf lokal ein DMG erstellen.

**Kein** Cloudflare-Worker-/D1-Deployment in diesem Build erforderlich. Das Website-Deployment installiert *keine* Desktop-Binaries.

## Technik, Grenzen und Prüfungen

- JavaScript-Syntax und Go-Tests erfolgreich. Windows AMD64 PE und Mac ARM64 Mach-O kompiliert.
- Beide Trainer mit Playwright-Chromium bei 360×640, 375×667, 390×844 und 1366×768 durchgespielt. Eine vollständige sechsstufige Gross-Fallmission plus 4–7 Karten in der Gross-Zuordnung sowie 4–7 Karten in der Bindungsstil-Zuordnung wurden automatisiert geprüft. Zusätzliche zufällige 12er-Bindungsstil-Runden auf Mobilgrößen ohne abgeschnittenen Falltext überprüft.
- Keine reale Android-/Mac-/Windows-Installation ausgeführt. Rollenabhängige deutsche Stimmen sind **installierte Browser-/Betriebssystemstimmen**, keine generierten Premium-KI-Stimmen. Funktion und Klang sind geräteabhängig.
- Vorgegebene Fallbeispiele sind für Lernen synthetisch, **keine Diagnosen**, nicht klinisch validiert. Beratungs- und Krisensituationen benötigen fachliche Prüfung, Beziehungskontext, Sicherheitsabklärung und bei Bedarf Supervision.
- LocalStorage-Fortschritt ist geräte- und Browserprofil-spezifisch, keine Cloud-Synchronisierung. Eigene Freitextantworten werden nur lokal für die laufende Mission gehalten, **nicht als Leistung maschinell beurteilt und nicht zum Server übertragen**.
- Die static Website-Trainerdateien sind per URL erreichbar; eine Capture-Kopplung ist allein keine serverseitige Zugriffskontrolle. Falls echter Schutz nötig ist, authentifizierte Dateiauslieferung vorsehen.

## Wissenschaftliche Referenzen
- Gross, J. J. (1998). The emerging field of emotion regulation: An integrative review. *Review of General Psychology*, 2(3), 271–299. https://doi.org/10.1037/1089-2680.2.3.271
- Webb, T. L., Miles, E., & Sheeran, P. (2012). Dealing with feeling: A meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation. *Psychological Bulletin*. https://pubmed.ncbi.nlm.nih.gov/22582737/
- Wadlinger, H. A., & Isaacowitz, D. M. (2011). Fixing our focus: Training attention to regulate emotion. https://pmc.ncbi.nlm.nih.gov/articles/PMC2970710/

## Nächste Entwicklung (nicht Teil von 15.12.71)
15.12.72: Beratungsallianz, Selbstregulation unter Angriff und **Lückentexte als Abruftraining für Beraterantworten**. Anschließend verzweigte Gesprächssimulationen sowie EFT, Gottman und RLT. Perspektivisch eigenständige Skillsets: Breakups, Trauer, Affären, Vertrauensbruch und Vertrauensreparatur.
