# Installation 15.12.81 – Deida Deep Mastery

**Ausgangsversion:** 15.12.80. **Nur Website-/Desktop-Anwendungsupdate; keine neue D1-Migration und kein Cloudflare-Worker-Update.** Keine persönlichen Vault- oder Klientendaten ändern.

## Neues Training
- Die bestehenden 168 Deida-Gesprächsfälle bleiben unverändert.
- 51 Kapitel aus *The Way of the Superior Man* (David Deida, Plexus 1997) erhalten je eine originale Verständnisfrage inklusive Kapitelnummer und gedruckter Buchseite.
- 25 zusätzlich **selbst entwickelte** Beratungstransferfragen mit konkreten Situationen. Sie sind NICHT Deidas therapeutische Empfehlungen.
- Vorherige 41 Fragen bleiben erhalten: jetzt 117 Buchwissen- und Beratungsfragen, insgesamt 168 + 117 = **285 Übungseinheiten verschiedener Art**. Nicht 285 einzelne Dialoge.
- 📖 Buchwissen → „Lernen“, „💪 Schwachstellen“, „🧭 Lernkompass“ und „🎓 Mastery-Prüfung“.
- Lernkompass: Fortschritt pro Kapitel, ungeübte Themen, Fehlerkarten. Vorläufig „gefestigt“ erst bei mindestens zwei richtigen Abrufen mit 20h Abstand; keine Kompetenzzertifizierung.
- Mastery-Prüfung: 24 zufällig und thematisch verteilt ausgewählte Fragen, einschließlich 14 Kapitelverständnis-, 8 Beratungs- und 2 ältere Fragen. Kein Feedback während der Prüfung; danach Auswertung und 💪-Karten für Fehler.
- Vorherige Lernstände der Buchwissen-Fragen verbleiben unter den bisherigen lokalen Schlüsseln `bd-deida-book80-ich` / `...-partnerin`; neue Prüfungsdurchläufe separat unter `bd-deida-exam81-ich` bzw. `...-partnerin`.
- Kapitel-Kompass und Prüfungsdurchläufe liegen vorerst **lokal im Browserprofil**. Eine geräteübergreifende Speicherung dieses neuen Prüfungsverlaufs ist nicht nachgewiesen; lokales Löschen der Browserdaten entfernt ihn.

## Website installieren (empfohlen)
1. Vor dem Update lokalen Backup-Stand sicherstellen. Wenn deine Website bereits auf 15.12.80 ist: `Beziehungsdynamiken_15.12.81_MINI_PATCH_WEBSITE.zip` entpacken, die darin enthaltenen Dateien im **Website-GitHub-Repository unter identischen Pfaden ersetzen/ergänzen**. Bestehende andere Webdateien nicht löschen.
2. Alternativ die `...NUR_WEBSITE.zip` als komplette Website-Überlagerung verwenden. Nach der GitHub-Pages-Veröffentlichung bei Bedarf **Strg+F5** im Browser.
3. Academy → Welt der Glut → Polarität & Begehren → 📖 Buchwissen. Zuerst eine falsche Antwort und anschließend „Weiter“ testen. Lernkompass öffnen, eines der 51 Kapitel anklicken, dann eine Mastery-Prüfung abschließen. Im 💪-Training die falsch beantworteten Fragen prüfen.
4. Auf Ilonas Mac ist kein Update erforderlich, solange sie diese neuen Funktionen nicht nutzen möchte. Die lokale Desktop-App aktualisiert ihre eingebettete Oberfläche NICHT durch eine Website-Veröffentlichung; Desktop-Pakete müssen manuell installiert werden.

## Teststatus (technisch, nicht fachliche Zertifizierung)
- Syntaxprüfung aller 35 JavaScript-Dateien, Browser-Tests mit normalem Desktopfenster, 24-Fragen-Mastery-Lauf, Profiltrennung, Kapitelwahl, 10 bestehende Deida-Dialogbewertungen: bestanden.
- Neu erstellte Fragen: eigene Formulierungen mit Buchkapitel-/Seitenverweisen. Deidas normative, stereotype und spirituelle Aussagen sind *als Quellenposition* dargestellt; Beratungsfragen prüfen zusätzlich Einwilligung, Sicherheit, Grenzen und individuelle Unterschiede.
- Go `go test ./...`, Windows amd64 / macOS arm64 neu gebaut und ZIP-Dateien vollständig gelesen: Release-Prozess überprüft.
- Noch nicht getestet: echte GitHub-Pages-Veröffentlichung, Cloudflare-Live-Zugriff, automatische Cloud-Synchronisierung des neuen Prüfungsverlaufs, reale Windows-/Mac-Endgeräte, Apple-Signierung/Notarisierung, empirische Validierung der Quizscores.
- **Fragenqualität:** 51 Buchkapitel-Fragen und 25 Beratungsfragen wurden redaktionell verfasst und technisch strukturell geprüft; eine externe therapeutisch-fachliche Gutachtensprüfung jeder Formulierung wurde nicht vorgenommen.
