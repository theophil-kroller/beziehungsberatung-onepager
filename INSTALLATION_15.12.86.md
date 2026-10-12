# Beziehungsdynamiken 15.12.86 · Gottman ATTUNE

## Inhalt
- Neues Modul **Gottman · ATTUNE: Emotionales Verstehen & Verbindung** in der Welt der Beziehungshäuser, zusätzlich zu ATONE und Vertrauensbruch-Assessment.
- 128 eigenständig verfasste fiktive Dialoggrundlagen (16 Themen × 8), 96 Wissensfragen (16 × 6).
- Pro Fall sieben Entscheidungsschritte: Gefühl erkennen, Sehnsucht/Bedürfnis erschließen, Belastbarkeit, Intervention, Wendepunkt, Timing, alltagstaugliche Vereinbarung.
- Vier differenzierte Antworten, getrenntes Feedback, 💪-Muskel, optionaler Freitext-Vergleich, 20 Levels und Wissens-Mastery-Prüfung mit 24 Fragen.
- Eigener lokaler Lernstand: `bd-gottman-attune86-ich` und `bd-gottman-attune86-partnerin`; ältere Fortschritte bleiben getrennt.
- 128 einzigartige **Ausgangsdialoge**, nicht 128 individuell verzweigte vollständige Therapiesequenzen. Die sieben Schritte verwenden themenspezifische Antwortarchitektur; einzelne Antwortalternativen wiederholen sich über Fälle eines Themas.

## Update
1. **Website bereits 15.12.85:** ZIP `Beziehungsdynamiken_15.12.86_MINI_PATCH_WEBSITE.zip` entpacken und als Overlay über die bestehende GitHub-Pages-Website kopieren. Nichts löschen. Veröffentlichung abwarten und mit Strg+F5 neu laden.
2. Alternativ gesamte Website in `Beziehungsdynamiken_15.12.86_NUR_WEBSITE.zip` verwenden.
3. Academy → Welt der Beziehungshäuser → **Gottman · ATTUNE – Emotionales Verstehen**.
4. Für Owner-Modulfreigaben und Cloud-Lernstand den aktualisierten Worker aus `Beziehungsdynamiken_15.12.86_CLOUDFLARE_WORKER.zip` bereitstellen (Modul-ID `gottmanattune`). **Keine neue D1-Migration** notwendig, sofern Academy-D1 aus 15.12.78 bereits eingerichtet ist.
5. Ohne diesen Worker bleibt lokales Training möglich; Cloud-Freigaben und Synchronisierung für das neue Modul sind dann nicht nachgewiesen bzw. noch nicht verfügbar.
6. Ilonas bestehende Mac-App bleibt unverändert; es wird keine automatische Softwareinstallation ergänzt.

## Quellen und professionelle Grenzen
- Konzeptuell aus John & Julie Gottman, *Treating Affairs and Trauma* (2017), Abschnitt **Phase 2: Attune**, Manual S. 149–208. Das ursprüngliche Copyright-Manual und geschützte Arbeitsblätter wurden **nicht** kopiert oder beigefügt. Texte, Szenen und Wissensfragen sind eigenständig formuliert.
- Sicherheit, Gewalt, Zwang, fehlende Einwilligung und Indikationsfragen haben Vorrang vor Paar-Kommunikationsübungen. Keine PTSD-Diagnose aus einzelnen Reaktionen und keine simulierten Therapieskills als Ersatz für Qualifikation.
- Die Darstellung ist ein privater Wissenstrainer und keine zertifizierte Gottman-Ausbildung.

## Getestet
- JS-Syntax, Inhalt (128 einzigartige Dialoge, 96 Wissensfragen), Modulverweise und Worker-Modulkennung.
- Lokaler Chromium-Browser: Fehler → 💪 → Weiter, 13 komplette Sieben-Schritt-Fälle, Level 2, 24-Fragen-Test, Profiltrennung, mobile Grundfunktion und 1440 × 800 ohne Scrollen.
- `go test ./...`, Windows amd64 und macOS ARM64 neu kompiliert, ZIP-Integrität nach Archivabschluss.
- **Offen:** Live-Test deiner veröffentlichten Website, produktiver Cloudflare-Sync, echte Windows-/Mac-Geräte, externe fachliche Begutachtung aller Antwortkombinationen.
