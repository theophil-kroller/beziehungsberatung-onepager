# Installation 15.12.80 – Deida Mastery & Buchwissen

**Ausgangsversion:** 15.12.79.  **Kein Cloudflare-Worker-Update und keine neue D1-Migration.** Der Build enthält neue Unterrichtsdaten und eine lokale Buchwissen-Trainingsansicht; er verändert keine vorhandenen Klienten- oder Vault-Daten.

## Neue Funktionen
- 168 eigenständig geschriebene Grunddialoge im Deida-Modul (**108 neu in 15.12.80**, zuvor 60), über 27 neue Buchthemen einschließlich Mission/Ausrichtung, Eigenständigkeit, Polaritätsmetaphern, Kritik und Rollenbilder, Begehren, Verführung, Verantwortung, körperliche Präsenz und Grenzen.
- **41 originäre Buchwissen-Fragen** mit vier gemischten Auswahlantworten, Kapitelhinweis und Erklärungen, erreichbar über **📖 Buchwissen** im Glut-Trainer. Damit 209 verschiedene Lerneinheiten, davon 168 Dialoge und 41 Konzeptfragen – **nicht** 209 verschiedene Dialoge.
- Ungesehene Fälle und selten bearbeitete Themen werden bei der Auswahl priorisiert, statt immer denselben Startausschnitt zu wählen. Die 20 Level und ihr lokaler Fortschritt bleiben erhalten.
- Falsch beantwortete Buchwissen-Fragen werden als eigene Karten ins lokale **💪-Training** übernommen. Buchwissen-Sitzungsstatistik liegt lokal pro ausgewähltem Lernprofil (`bd-deida-book80-ich`/`bd-deida-book80-partnerin`); sie ist **nicht** als geräteübergreifend gesichert nachgewiesen.
- Die bestehende Exercise Engine 15.12.79 bleibt aktiv: Vier Optionen aus einem adaptiven Pool und differenzierte Rückmeldungen; 41 Konzeptfragen sind eigene redaktionelle Fragen.

## Schnellinstallation
1. Lokales Backup von Projekt/Vault anlegen. Für GitHub Pages mit **15.12.79**: `Beziehungsdynamiken_15.12.80_MINI_PATCH_WEBSITE.zip` entpacken und die Dateien unter gleichem Pfad im **Website-Repository** überschreiben. Niemals die gesamte bestehende Site löschen.
2. Alternativ `NUR_WEBSITE.zip` als vollständige Website-Überlagerung verwenden. Nach GitHub-Pages-Deployment die Seite neu laden, bei Bedarf Strg + F5.
3. In Academy → Welt der Glut → Polarität & Begehren klicken. Übung durchlaufen. **📖 Buchwissen** öffnen, eine richtige und falsche Antwort ausprobieren. Danach 💪-Karte aufrufen.
4. Für Desktop-App das aktualisierte Paket **manuell** installieren, da Desktop ihre Website-Dateien eingebettet enthält. Eine GitHub-Pages-Veröffentlichung aktualisiert eine bereits installierte Desktop-App nicht automatisch. Ilonas Mac kann unverändert bleiben, wenn sie das neue Modul nicht benötigt.

## Technischer Status
- `node --check`: gesamte Website bestanden.
- Browserbasierter Playwright/Chromium-DOM-Test: 38 strukturierte und freie Antworten, Vergleich und Weiter; Buchwissen falsch/richtig, Wechsel, lokale Trennung beider Lernprofile: bestanden. 41 Fragen vorhanden; Laufzeitfenster getestet.
- Go `go test ./...`, Cross-Compilation für Windows amd64 und macOS arm64 sowie ZIP-Integrität: über Release-Skript geprüft.
- **Nicht getestet:** Live-GitHub-Pages-Veröffentlichung, Cloudflare-Konto-Synchronisierung, echte Windows-/Mac-Geräte, Apple-Signierung/Notarisierung und fachliche Expertenvalidierung aller Antwortkombinationen. Vorhandene 15–16 Antwortkandidaten der Exercise Engine sind **teilweise allgemeine Gesprächsinterventionen** und nicht alle exklusiv für einen bestimmten Fall entwickelt.
- Buchmodell ist **nicht klinisch validierte Geschlechterdiagnostik**. Kritische Annahmen werden als Deidas Perspektive gekennzeichnet; Konsens, Freiwilligkeit, Sicherheit und andere Erklärungen bleiben explizit Teil des Trainings.
