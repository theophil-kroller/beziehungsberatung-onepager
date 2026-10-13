# Beziehungsdynamiken · Installation 15.12.95

## Neuer Inhalt und Reihenfolge

**Gottman Level 1 – Freundschaft & Shared Meaning:** 120 eigenständige fiktive Ausgangsdialoge, 75 Verständnisfragen, 15 Themenfelder, 20 Levels und sieben Entscheidungen pro Fall. Inhaltlich orientiert am hochgeladenen Gottman-Level-1-Manual, §§ 6.5–6.6: Love Maps, Turning Toward, stressreduzierende Gespräche, Verbundenheitsrituale, Werte und gemeinsame Bedeutung. Fondness & Admiration als ergänzende Hauskomponente. Keine Originalfragebögen oder urheberrechtlich geschützten Handouts eingebettet.

**Welt der Beziehungshäuser neu geordnet:** Alle Gottman-Module bilden einen nachvollziehbaren Block aus Theorie, Assessment, Konflikt, Freundschaft, Four Horsemen, Affären/ATONE/ATTUNE/ATTACH und Integration. **RLT folgt danach**; weitere geplante Ansätze schließen an.

**Pfadberechnung dynamisch:** Die Linie verbindet jetzt die tatsächlichen Koordinaten aller Modul-Knoten, statt eine begrenzte Hintergrundgrafik zu wiederholen. Desktop- und Mobiltests mit 18 Modulen bestanden. Ein mobiler Überlauf in der Kopfzeile wurde behoben.

## Website-Installation

- Wenn 15.12.94 installiert ist, `Beziehungsdynamiken_15.12.95_MINI_PATCH_WEBSITE.zip` **als Overlay** in dein GitHub-Pages-Repository kopieren. Bestehende Dateien nicht löschen. Commit/Push, Veröffentlichung abwarten und **Strg+F5** laden.
- Auch eine komplette Website-ZIP als Overlay ist verfügbar. Nie das alte Repository blind komplett löschen; sonst gehen eigene Dateien verloren.
- Welt der Beziehungshäuser öffnen und die fachliche Reihenfolge sowie den Pfad **bis zum letzten Modul** prüfen.
- Den neuen Trainer „Gottman Level 1 · Freundschaft & Shared Meaning“ starten. Lernstand ist pro Profil getrennt und wird unter `bd-gottman-friendship95-ich` / `bd-gottman-friendship95-partnerin` gespeichert. Vorhandene Modulschlüssel und Fortschritte bleiben unverändert.

## Cloudflare und Geräte

- Für eigenes Website-Training **kein neues Cloudflare-Deployment und keine neue D1-Migration** nötig. Die Pfad- und RLT-Sortierung sind nur Frontend.
- Für neue Owner-Modulfreigaben und die Cloud-Synchronisierung von `gottmanfriendship` ist **optional** der aktualisierte Worker erforderlich, sofern der bisherige Worker die Kennung nicht erlaubt. Ein produktiver Sync-Test ist nicht durchgeführt.
- Windows und macOS bleiben manuell zu installieren; weder Mac App Store noch automatische Updates erforderlich. Ilonas Mac muss für deine Website-Trainings nicht verändert werden.

## Prüfungen und Grenzen

- In Chromium: 14 × 7 aufeinanderfolgende Entscheidungen, falsch/richtig, 💪, Levelaufstieg, getrennte Profile, Nachschlagefenster, 24-Fragen-Mastery, Sound und Stummschaltung; Trainer bei 1440 × 800 ohne Scrollen.
- Pfad-/RLT-Reihenfolge bei 1440 × 800 und 390 × 844 mit 18 Modulen im Browser getestet, einschließlich Koordinaten des letzten Moduls; kein mobiler horizontaler Überlauf.
- JavaScript- und Go-Tests, Windows-/Mac-Builds, ZIP-Prüfung/Hashes.
- **Nicht verifiziert:** die veröffentlichte Website, der echte Live-Vault, Ilonas Mac, Cloud-Synchronisierung und die fachliche Qualität aller denkbaren automatisch zusammengestellten Antwortfolgen.
- 120 verschiedene Grunddialoge mit themenbezogen gemeinsamen Antwortmustern; **keine 120 eigenständig frei verzweigenden Therapiesimulationen.**
