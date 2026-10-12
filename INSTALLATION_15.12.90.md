# Beziehungsdynamiken 15.12.90 · Gottman Level 1 – Assessment I

## Neu
- Eigenständiges Modul in der Welt der Beziehungshäuser: **Gottman Level 1 · Assessment I – Sicherheit, Erstgespräch & Indikation**.
- **136 eigenständig formulierte fiktive Gesprächssituationen** in 17 Themenfeldern (17 × 8), dazu **85 Wissensfragen** (17 × 5), 20 Levels.
- Kernbereiche: unterschiedliche Aufträge, Beziehungsziele, Einwilligung, Vertraulichkeit, doppelte Allianz, erster Bericht, Konfliktbeobachtung, Gewalt und Kontrolle, digitale Überwachung, akute Krisen, Substanzeinfluss, Affären, Traumafolgen, psychische Belastung, Alltagschaos, vorläufige Fallformulierung und Indikationsentscheidung.
- 7 Entscheidungen pro Fall, vier gemischte Antworten, direkte Rückmeldung mit begründeten Gegenüberstellungen; bei Gewalt, Kontrolle und Selbstgefährdung werden ungeeignete Sicherheitsentscheidungen **nicht** als akzeptable Alternativen bewertet.
- 💪-Fehlerwiederholungen, 24-Fragen-Mastery-Test mit spätem Feedback, 17-Themen-Assessment-Kompass, Erfolgston bei korrekten Antworten (stummschaltbar), getrennte lokale Lernstände.
- Bestehende Trainings und Lernstände bleiben unverändert; neue Speicherung unter `bd-gottman-assessment90-ich` und `bd-gottman-assessment90-partnerin`.

## Installation
1. Website läuft schon mit 15.12.89? `Beziehungsdynamiken_15.12.90_MINI_PATCH_WEBSITE.zip` entpacken **und die enthaltenen Dateien als Overlay** nach GitHub Pages übernehmen; nicht das Repo löschen. Nach GitHub-Veröffentlichung Strg+F5.
2. Academy → Welt der Beziehungshäuser → Gottman Level 1 · Assessment I.
3. **Nur lokal trainieren:** kein Cloudflare Worker-Deployment und keine D1-Migration nötig.
4. **Neues Modul in Owner-Freigaben und Cloud-Lernstand:** `Beziehungsdynamiken_15.12.90_CLOUDFLARE_WORKER.zip` installieren; Module-ID `gottmanassessment`; die D1-Academy-Struktur aus 15.12.78 muss bereits bestehen. Serverrollen werden weiterhin serverseitig durch den Worker geprüft.
5. Ilonas vorhandener Mac muss nicht geändert werden. Neue Softwarefunktionen erscheinen dort erst mit manueller App-Aktualisierung.

## Grenzen, Quellen
- Gottman Level 1 Clinical Training Manual (2000–2016), **Kapitel 2 Assessment: Overview, Kapitel 3 Assessment: Session 1**, ergänzende Verweise auf Kapitel 4 und 5.
- Original-PDF, Originalfragebögen, Originalgrafiken und Arbeitsblätter **nicht im Build**. Sämtliche Gesprächsanfänge sind eigenständig formuliert.
- Die Manualedition spiegelt die Perspektive ihrer damaligen Erscheinungszeit. Die Abbildung der Manual-Indikationen und US-Regeln ersetzt weder aktuelle fachliche Standards noch österreichisches Berufsrecht und Datenschutzpflichten.
- Sofortige Gefährdungsabklärung und spezialisierte Versorgung bei Gewalt/Zwang, akuter Selbstgefährdung oder schwerer Beeinträchtigung. Keine Diagnosen per Quiz.
- Lernlevels prüfen Konzeptwissen, nicht praktische Beratungskompetenz oder Zertifizierungsstatus.
- **Qualitätsoffenlegung:** 136 eigenständige Ausgangsdialoge mit je individueller Wendung; sieben Schritte nutzen eine gemeinsame thematisch kuratierte Entscheidungslogik, keine 136 vollverzweigten KI-Simulationen. 85 Wissensfragen aus fünf Fragetypen je Themenfeld.

## Technischer Teststatus
- JavaScript-Syntax, Datenkonsistenz 136/85, Modul-ID, getrennte Speicherbereiche.
- Lokaler Chromium-Test: 14 vollständige 7-Schritt-Fälle, falsche/richtige Antworten, Ton/Stummschalten, 💪, Levelaufstieg, Assessment-Kompass, 24-Fragen-Prüfung, Profiltrennung. Bei 1440×800 keine Scrollstrecke.
- Go-Tests und Windows-/Mac-ARM64-Binärkompilation, ZIP-Integrität und Prüfsummen nach Release.
- **Offen:** Test der produktiven Website, D1-Cloud-Abgleich auf echten Geräten und externe klinisch-fachliche Durchsicht sämtlicher Auswahlmöglichkeiten.
