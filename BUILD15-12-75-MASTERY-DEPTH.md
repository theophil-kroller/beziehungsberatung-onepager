# Beziehungsdynamiken Academy · Build 15.12.75

**Basis: Build 15.12.74 FULL.** Keine Änderungen an Cloudflare D1, Vault, Klientendaten oder Login.

## Wesentliche Änderungen

- Im Mastery-System der neun bereits aktiven Skills benötigt ein neues Level jetzt **10** (Level 1–5), **12** (6–10), **15** (11–15) bzw. **18** (16–20) erfolgreich absolvierte, voneinander unterscheidbare Ausgangssituationen. Zusätzlich müssen **5 / 6 / 8 / 10** unterschiedliche Gesprächsfiguren vorkommen. Jede bestandene Begegnung hat mindestens zwei Dialogentscheidungen; ab höheren Levels folgen mehrere Dialogzüge und die optionale freie Formulierung.
- Es gibt **18 redaktionell verfasste Ausgangssituationen je bestehendem Skill** (9 × 18 = 162). Die bekannten Figuren werden mit den neuen Fällen variiert. Die **Beratungsallianz** enthält zusätzlich 18 fallbezogene Eröffnungsfragen und 18 darauf abgestimmte Anschlussinterventionen; die übrigen acht Skills verwenden teilweise weiterhin wiederkehrende Entscheidungsraster. Dies ist eine größere Fallbasis, **noch keine frei adaptierende KI-Gesprächsperson**.
- Die ursprünglichen XP und bereits freigeschalteten Levels bleiben erhalten. Alte, erst teilweise absolvierte Level werden einmalig als vorhandene Übungsgutschrift in die neue Fallzählung übernommen. Bereits freigeschaltete Levels werden nicht zurückgesetzt. Ab dem aktuell offenen Level gelten neue Anforderungen.
- Neu: **Zwischen den Zeilen**, 30 Levels, 30 individuell formulierte fiktive Ausgangsfälle über Einzelgespräche, Sharing Circles, Paare und Triaden. Pro Fall zwei Phasen: mehrere plausible Hypothesen abwägen und eine passende Intervention auswählen. Bei Entscheidungen folgen erklärtes Feedback und eine beispielhafte Gesprächsreaktion. Ab Level 6 kann zunächst ein eigener Freitext formuliert werden; **dieser wird nicht automatisch fachlich bewertet**. Eine positive Bewertung von Musterlösungs-Entscheidungen beweist keine echte psychotherapeutische Kompetenz.
- Die unteren Levels des neuen Moduls beginnen mit leichteren Einzel- und Gruppenaussagen; später kommen Paare, Triaden und sicherheitsrelevante Konstellationen hinzu. Auch hier gelten pro Level 10/12/15/18 Situationen und ein Rollenvielfaltskriterium.
- Das neue Modul ist auf **Welt der Resonanz** frei zugänglich. Die übrigen neun Planeten bleiben unverändert. Alle Planeten frei anwählbar, Progression nur innerhalb der Skills.
- Zentrales Browser-Voice-Mapping aus 15.12.73 bleibt integriert. Keine eigenständigen KI-Stimmen hinzugefügt.

## Installation auf GitHub Pages

1. Das **Website-ZIP** entpacken. **Keine alten Verzeichnisse oder Trainingsdaten löschen.** Die Dateien samt `training-assets/` über den bestehenden Projektstand kopieren und geänderte Dateien ersetzen.
2. Veröffentlichen und `academy-journey15-12-74.html` öffnen. Der Weltpfad heißt weiterhin 15.12.74 – nur die darunterliegenden Module wurden aktualisiert.
3. Welt der Resonanz → **Zwischen den Zeilen** wählen. Auf Welt der Resonanz → Beratungsallianz wechseln und dort die neue Levelquote kontrollieren.
4. Bei gecachten Änderungen gezielt Seite aktualisieren. Keinesfalls localStorage oder PWA-Daten pauschal leeren: bestehende Übungen und offline-Captures könnten sonst verloren gehen.

## Projektpakete / Desktop

- Patch-ZIP über eine **Kopie** des vollständigen 15.12.74-Projektstands legen; es enthält aktualisierte Web-Quellen, Desktop-Go-Quellen und die neue Binärdatei.
- FULL enthält vollständige Projektdateien plus kompiliertes Windows-Programm.
- Windows-ZIP enthält die **neu kompilierte** Desktop-EXE mit den 15.12.75-Webdateien im Embedded-Bundle.
- macOS-ZIP enthält die neu **für ARM64 cross-kompilierte** App. Sie ist nicht auf einem echten Mac geprüft, nicht signiert und nicht notarisiert.
- Desktop-App vor Austausch schließen und zuvor ein Vault-Backup anlegen. Die Update-Funktion des Vault wird mit diesem Build nicht verändert.

## Daten, Grenzen und Testempfehlung

- Mastery-Fortschritt bleibt lokal unter `bd-mastery72-v1`; neue Fall-IDs und Rollenvielfalt werden ergänzt. Das neue Modul speichert lokal unter `bd-between75-v1`. Keine serverseitige Datenbankmigration.
- Browser-TTS hängt vom Browser ab. Microsoft Natural Voices erscheinen in Chrome nicht zwingend. Stimmenzuordnung gegebenenfalls im Voice-Manager prüfen.
- Fiktive Fälle und Charaktere. Kein therapeutischer Diagnose-Test, keine automatisierte Beurteilung eigener Freitext-Interventionen. Fachlich anspruchsvolle Themen, insbesondere Gewalt und Zwangskontrolle, verlangen reale Risikoprüfung und Supervision.
- Qualitätsprüfung: JS-Syntax, Fallmengen, Referenzen, Go-Test-Suite, Cross-Build, ZIP-Integrität und SHA-256. **Kein echter Chrome-/Edge-/Safari-Browsertest**: die lokale Chromium-Instanz wurde durch Umgebungsbeschränkungen blockiert. Geräte-QA ist nach Installation notwendig.

### Regressionstest

1. Beratungsallianz Level 1 öffnen → Anzeige **0/10 Fälle**, mindestens **0/5 Rollen**; nach einer bestandenen Begegnung **1/10**, Level 2 bleibt gesperrt.
2. Mehrmals »Neue Rolle« testen: unterschiedliche Situationen und Figuren. Eine bereits bestandene Fall-ID zählt nie ein zweites Mal.
3. Vorhandene Fortschrittsstände aus 15.12.74 prüfen – XP und zuvor freigeschaltete Levels bleiben erhalten.
4. Welt der Resonanz → Zwischen den Zeilen → zwei Phasen und Reaktionsdialog durchlaufen, bewerten, speichern, neu öffnen.
5. Smartphone: gut lesbare Texte, große Antwortbuttons, keine horizontale Seiten-Scrollpflicht.
