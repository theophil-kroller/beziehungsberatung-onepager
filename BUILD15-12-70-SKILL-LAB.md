# Beziehungsdynamiken Build 15.12.70 – Bindungsstile Skill Lab

**Basis:** vollständiger Projektstand 15.12.69. Keine Änderung an lokalen Vault-Daten, Capture-Aufnahmen oder Cloud-Datenbank.

## Verbesserungen

- **Kompaktes Feedback:** Bei korrekten Antworten keine doppelte Anzeige „Deine Wahl / passendere Hypothese“. Bei Fehlern: gewählte Antwort, plausiblere Alternative, entscheidender Hinweis. Bei der Hinweisjagd: 2/2 erkannt oder konkret übersehener Hinweis. +3 Punkte heißen ausdrücklich Übungs-XP, nicht „richtig“. Ausführliche Gegenhypothesen und Beraterfragen sind optional aufklappbar. Standardfeedback ohne eigenen Scrollbalken auf den getesteten Handygrößen; Hintergrund bei offenen Dialogen gesperrt.
- **Zuordnung ohne Ausschluss-Trick:** 18 Übungsgruppen mit **4 bis 7 Aussagen** statt fix 3, ungleicher Verteilung auf Kategorien und wiederholter Kategorien. Vier Töpfe: Bindungsangst, Vermeidung, sicheres Verhalten und „noch unklar“. Plausible Mehrfachzuordnungen erlaubt; separate Bestätigung **jeder** Karte durch Tippen oder Ziehen und Prüfen. Bei falscher Gruppierung zeigt das Feedback ein konkretes Gegenbeispiel. Die wissenschaftlichen Arbeitsbegriffe sind keine Einzelsatz-Diagnosen.
- **Hörmodus:** Nur wörtliche Aussagen werden gesprochen, keine Rollenbezeichnungen oder abstrakten Fallbeschreibungen. Unterschiedliche deutsche Systemstimmen für männlich/weiblich sprechende Rollen soweit verfügbar; sonst deutsche Standardstimme als Rückfall. Die App erstellt keine neue Cloud-KI-Stimme und es werden keine persönlichen Daten an eine KI gesendet. Mobil ist eine bewusste Tipp-Geste nötig. Altersgerechte künstliche Kinderstimmen und echte Zwei-Personen-Hörspiele sind zukünftige Erweiterungen.
- **Realistische Alltagssprache:** 12 zusätzliche synthetische Szenen, u. a. Eltern/Kinder, Freundschaft, Frauen- und Männerbeziehungen, Polyamorie, Skepsis gegenüber Beratung sowie Abwertung. 138 Übungsaufgaben insgesamt: 48 Grundlagen, 44 Szenen, 16 Hinweisjagden, 18 Zuordnungssätze und 12 Beraterfragen. Diese neuen Szenen enthalten Gegenhypothesen und vermeiden vorschnelle Diagnosen.
- **Zugänge:** Versionssichere neue Seite `bindungsstile-trainer15-12-70.html` und Spielassets `training-game70.js/css`. Bestehende Gehirn-Buttons aus Cockpit und Capture verweisen auf die neue Seite. Capture-SW verwendet `bd-capture-15-12-70`; die Capture-JavaScript-Version und Cockpit-JS-Version wurden aktualisiert, um alte Browserdateien zu vermeiden.
- **Lernstand:** Vorhandene Fortschrittsdaten bleiben mit derselben LocalStorage-Schlüsselstruktur erhalten. XP und zeitlich gestaffelte Wiederholungen sind Lernhilfen, keine psychometrische Kompetenzmessung.

## Installation

1. Für **Website und installierte Android Capture PWA** das ZIP `Beziehungsdynamiken_15.12.70_NUR_WEBSITE.zip` vollständig in das **Repository-Wurzelverzeichnis** von GitHub Pages kopieren. Bestehende Dateien gleichen Namens überschreiben und zusätzliche neue Trainer-/JS-/CSS-Dateien aufnehmen. Veröffentlichung abwarten.
2. Capture-PWA komplett schließen und neu öffnen (notfalls erneut laden). **Keine lokalen App-Daten oder Speicher löschen**, sonst könnten Kopplung, Aufnahmen und Lernstand verloren gehen.
3. Cockpit im Browser aktualisieren. Gehirn-Button öffnet den Trainer, auch ohne Capture-PWA.
4. **Windows Desktop:** Programm schließen und neue EXE aus dem Windows-ZIP einsetzen. Vault-Verzeichnis unangetastet lassen.
5. **Mac M1:** `.app` ersetzen. Unsigniert, nicht notarisiert; optionales Mac-Skript erzeugt DMG lokal. 
6. Kein Cloudflare-Worker/D1-Update erforderlich. Website-Deployment ersetzt **nicht** die lokale Desktop-App.

## Prüfungen und Grenzen

- Go-Tests bestanden, Windows AMD64 und Mac ARM64 kompiliert. `node --check` für Trainings-JS, Capture-JS und Capture-Service-Worker erfolgreich.
- Browser-Durchläufe auf 360×740, 375×667 und 390×844 mit allen vier Spielarten und Standardfeedback ohne scrollbar; separate Desktop-Darstellung auf 1366×768 gerendert. Keine echten Android/iOS-Stimmen oder physische Desktop-App-Installation getestet.
- Browserstimmen sind geräteabhängig und keine garantierten natürlich klingenden KI-Stimmen. Der Audiomodus funktioniert nur, wenn der Browser Web Speech unterstützt.
- **Sicherheitsgrenze:** Capture-Kopplung schützt normale Oberfläche, nicht die direkt abrufbare GitHub-Pages-Trainerdatei bzw. Atemmedien. Für tatsächliche Zugriffskontrolle ist eine authentifizierte, nichtöffentliche Dateiauslieferung erforderlich.
- Die Inhalte sind synthetische Übungen, fachlich nicht extern validiert; keine Diagnostik oder Therapieersatz. Reale Kompetenz erfordert auch Supervision und Praxis.

## Spätere Lernpakete (nicht Teil von 15.12.70)
James Gross/Emotionsregulation, Sue Johnson/EFT, Gottman, RLT, Breakups/Trennungen, Trauer, Affären/Untreue, Vertrauensbruch und Reparatur. Das Gross-Paket soll aus verbundenen Sequenzen Erkennen → Unterstrategien abrufen → Intervention auswählen → übertragen bestehen.
