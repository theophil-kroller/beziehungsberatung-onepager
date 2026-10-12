# Beziehungsdynamiken 15.12.91 · Gottman Assessment II

## Neu
- Eigenständiger Fokus-Trainer: **Oral History & Verhaltensbeobachtung**.
- 136 individuell verfasste fiktive Szenen in 17 Beobachtungsdimensionen, 85 Wissensfragen, 20 Levels.
- Theorie des Oral History Interviews: gemeinsame Erinnerungen, Love Maps, We-ness, Fondness & Admiration, Enttäuschung und Negativität, Couple Efficacy, Rollen, Chaos und Meta-Emotion.
- Beobachtung von Gesprächen: Gesprächseinstieg, Reparaturversuche, Einfluss, positive Affekte, Rückzug und physiologische Aktivierung.
- 7 Entscheidungen je Fall, vier plausibel ähnliche Auswahlmöglichkeiten; neue Informationen ab Schritt 5.
- 💪-Wiederholung, 24-Fragen-Mastery-Test (Feedback erst danach), unabhängiger Lernstand pro Profil, Bestätigungston und Stummschalten.

## Installation
1. Website auf 15.12.90? `Beziehungsdynamiken_15.12.91_MINI_PATCH_WEBSITE.zip` entpacken und die Dateien **als Overlay** im GitHub Pages Repo ersetzen; bestehende Inhalte nicht löschen. Veröffentlichung abwarten, Browser ggf. hart aktualisieren.
2. Academy → Welt der Beziehungshäuser → **Gottman Level 1 · Assessment II**.
3. **Nur eigenes Website-Training:** keine D1-Migration oder Cloudflare-Worker-Aktualisierung notwendig.
4. **Owner-Freigaben und Cloud-Lernstand dieses neuen Moduls:** Worker aus `Beziehungsdynamiken_15.12.91_CLOUDFLARE_WORKER.zip` deployen. Neue Modul-ID: `gottmanhistory`. D1-Schema aus 15.12.78 erforderlich; keine neue D1-Migration.
5. Ilonas bestehende Mac-Version muss nicht aktualisiert werden; neue Softwarefunktionen erscheinen dort erst mit einer späteren manuellen Installation.

## Quellen und Grenzen
- Gottman Level 1 Clinical Training Manual (©2000–2016), **3.3.1–3.3.3 (Oral History / Buehlman-Dimensionen), 3.4.1 (Konfliktbeobachtung), 3.4.3 (Physiologie)**; die Fälle und Fragen sind eigenständig formuliert.
- Originalfragebögen, Originaltexte, Originalgrafiken, Codierskalen und Original-PDF **nicht** in den Paketen enthalten.
- Eine einzelne Beobachtung oder Erzählung erlaubt keine Diagnose oder individuelle Trennungsprognose. Historische Forschungsaussagen sind keine aktuellen diagnostischen Vorhersageinstrumente.
- Bei Gewalt, Einschüchterung, akuter medizinischer Beeinträchtigung oder Krisen hat Sicherheit Vorrang; keine Selbstdiagnose per Quiz.
- Kompetenz-Levels erfassen nur Übungsleistungen, ersetzen weder Supervision noch professionelle Qualifikation.
- 136 unterschiedliche Grunddialoge, die sieben Schritte nutzen teilweise eine gemeinsame kuratierte Entscheidungssystematik; keine 136 unabhängig verzweigenden Live-KI-Rollenspiele.

## QA
- JavaScript und Quellenreferenzen, 136/85/17 Inhaltsprüfung.
- Chromium-Test: 14 vollständige Sieben-Schritt-Fälle, richtige/falsche Bewertungen, Sound, Stummschaltung, Muskel-Training, Level-Freischaltung, Wissensmodus, 24 Fragen Exam, Profiltrennung.
- Layout bei 1440×800 px ohne Scrollbar im Desktop-Test.
- Go-Tests, Windows-/Mac-Kompilierung, ZIP-Integrität und Prüfsummen im Release-Lauf.
- **Offen:** produktive Website, Live-D1-Synchronisierung und echte Windows-/Mac-Geräte.
