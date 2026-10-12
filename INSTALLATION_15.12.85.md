# Beziehungsdynamiken 15.12.85 · Gottman ATONE

## Inhalte
- Neues, eigenständiges Academy-Modul **Gottman · ATONE: Reue & Wiedergutmachung**, in der Welt der Beziehungshäuser.
- 136 individuell verfasste fiktive Dialoge aus 17 Bereichen (8 Dialoge je Bereich), 102 Wissensfragen (6 je Bereich).
- 7 Entscheidungsschritte je Dialog: Schwerpunkt erkennen, präzise Frage, Sicherheit, Intervention, neue Information, Phasentiming, freiwillige Vereinbarung.
- Vier abgestufte Antwortmöglichkeiten, zufällige Reihenfolge, Feedback-Maske, optionaler selbst formulierter Beitrag, 💪-Muskel, 20 Levels, Mastery-Wissenstest mit 24 Fragen ohne sofortige Auflösung.
- Eigener Lernstand: `bd-gottman-atone85-ich` und `bd-gottman-atone85-partnerin`. Frühere Lernstände bleiben separat.
- Die 136 Dialoge sind individuelle **Ausgangssituationen**, nicht 136 vollständig individuell ausgearbeitete verzweigende Therapieabläufe. Die sieben Schritte teilen sich themenbezogene Antwortarchitektur, mit neuer Information pro Themenfeld.

## Update
1. **Webseite auf 15.12.84:** `Beziehungsdynamiken_15.12.85_MINI_PATCH_WEBSITE.zip` entpacken und die enthaltenen Webdateien als Overlay in GitHub Pages übernehmen. Nichts außerhalb dieses Overlays entfernen; die Veröffentlichung abwarten und mit Strg+F5 neu laden.
2. Alternativ das vollständige Website-ZIP als kompletten Stand verwenden.
3. Academy → Welt der Beziehungshäuser → **Gottman · ATONE – Reue & Wiedergutmachung**.
4. Für Owner-Freigabe und Cloud-Lernstand das neue Worker-Skript aus `Beziehungsdynamiken_15.12.85_CLOUDFLARE_WORKER.zip` veröffentlichen. Es registriert den Modulschlüssel `gottmanatone` in der bestehenden Academy-API. **Keine neue D1-Migration** nötig, sofern 15.12.78 bereits eingerichtet ist.
5. Ohne Worker-Deployment bleibt das Modul lokal nutzbar; Cloud-Freigaben/Synchronisierung für **dieses** Modul sind dann nicht verfügbar. Eine Freigabe über den Owner muss bei anderen Konten ausdrücklich erfolgen.
6. Die Mac-Installation einer anderen Person bleibt unverändert; automatische App-Installation wurde nicht ergänzt.

## Quellen & Grenzen
- Inhaltlich orientiert an John & Julie Gottman, *Treating Affairs and Trauma* (2017), vor allem Kapitel `Phase 1: Atone` (Manual S. 123–147). Das hochgeladene **Copyright-Manual und dessen Arbeitsblätter sind nicht im ZIP enthalten**. Alle Trainingsformulierungen sind neu.
- Die ergänzten Perspektiven zu CNM, freiwilliger Transparenz, Grenzen und Sicherheit sind **eigene ethische Anwendung**, nicht pauschal Gottmans Originalposition.
- Gottmans Manual nennt teils weitreichende Einsichtsrechte und beschreibt Reaktionen auf Betrug als PTSD. Das Training setzt keine generelle PTSD-Diagnose voraus und versteht Kontrolle ohne Zustimmung nicht als Therapiepflicht.
- Akute Gewalt, Drohung und Selbstgefährdung: zunächst separate Sicherheitsabklärung und geeignete Unterstützung; keine routinemäßige Paarübung. Das Wissenstraining ersetzt keine traumatherapeutische Qualifikation.

## Tests
- JavaScript-Syntax, 136 einzigartige Szenen, 102 Fragen, Link und Worker-Kennung geprüft.
- Lokales Chromium: 13 vollständige Fälle mit je 7 Entscheidungen, Fehler→💪→Weiter, Wissen, 24-Fragen-Prüfung, Level 2, Profiltrennung, mobiles Rendern und 1440×800 Desktop ohne Scrollen.
- Go-Tests, Windows- und Mac-ARM64-Cross-Compile und ZIP-Integrität nach Archivabschluss.
- **Nicht bestätigt:** produktiver Cloudflare-Worker-Deploy, Live-Synchronisierung, installierte Desktop-Apps auf euren tatsächlichen Geräten, fachliche Supervision jeder einzelnen Antwortkombination.
