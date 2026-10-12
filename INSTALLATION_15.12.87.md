# Beziehungsdynamiken 15.12.87 · Gottman ATTACH

## Inhalt
- Eigenständiges Modul **Gottman · ATTACH: Vertrauen & neue Verbundenheit**, zusätzlich zu Assessment, ATONE und ATTUNE.
- 128 eigens geschriebene fiktive Gesprächsgrundlagen (16 Themenfelder × 8), 96 Wissensfragen (16 × 6) und 20 Levels.
- Sieben Entscheidungen: Bedeutung erkennen, erkunden, Freiwilligkeit, verbinden, neue Information, Timing, Alltagstransfer.
- Vier differenziert bewertete Optionen, Rückmeldungsdialog mit Vergleich, freiwillige freie Formulierung in höheren Levels, 💪-Muskeltraining, 24-Fragen-Mastery-Prüfung.
- Eigener lokaler Fortschritt: `bd-gottman-attach87-ich`, `bd-gottman-attach87-partnerin`; bisherige Module bleiben erhalten.
- **Umfangstransparenz:** 128 individuelle Ausgangs-Dialoge, aber thematisch wiederverwendete Antwortarchitektur über sieben Schritte; keine 128 unabhängig improvisierten Therapiesimulationen.

## Installation
1. Bereits 15.12.86 installiert: `Beziehungsdynamiken_15.12.87_MINI_PATCH_WEBSITE.zip` als Overlay auf die GitHub-Pages-Dateien kopieren. Nichts aus älteren Modulen löschen. Nach Veröffentlichung Browser mit Strg+F5 aktualisieren.
2. Alternativ gesamte Web-Veröffentlichung aus `Beziehungsdynamiken_15.12.87_NUR_WEBSITE.zip`.
3. Academy → Welt der Beziehungshäuser → **Gottman · ATTACH – Vertrauen & neue Verbundenheit**.
4. Wenn neue Modul-Ownerfreigabe und Academy-Cloud-Sync benötigt werden: Worker aus `Beziehungsdynamiken_15.12.87_CLOUDFLARE_WORKER.zip` bereitstellen. Modulkennung `gottmanattach`.
5. Keine D1-Migration gegenüber der Academy-Datenbankversion 15.12.78 notwendig. Ohne neuen Worker ist lokales Training möglich, aber Cloud-Sync dieses neuen Moduls nicht bestätigt.
6. Keine Software-Aktualisierung auf Ilonas Mac erforderlich, solange nur dein Website-Training aktualisiert wird.

## Inhaltliche Abgrenzung
- Konzeptuelle Grundlage: John & Julie Gottman, *Treating Affairs and Trauma* (2017), Phase 3: Attach, Manual S. 209–241.
- Sämtliche fiktiven Szenen und Fragen sind unabhängig formuliert; keine kopierten Handouts, Karten oder Originalmanualseiten enthalten. Die Ergänzung zu konsensueller Nichtmonogamie ist eine eigenständige, ausdrücklich anders gekennzeichnete Erweiterung.
- Freiwillige Nähe, Grenzen und Sicherheit gehen vor. Weder sexuelle Intimität noch Versöhnung ist eine Pflicht. Bei Gewalt/Zwang oder schwerer Traumafolgesymptomatik ist qualifizierte Gefährdungs- und Indikationsklärung erforderlich.
- Privater Trainer zur Wissensfestigung, keine offizielle Gottman-Zertifizierung oder nachgewiesene Therapiekompetenz.

## Technische Tests
- JavaScript-Syntax, 128 einzigartige Gesprächsgrundlagen, 96 Wissensfragen, Modulpfade und Workerkennung.
- Lokales Chromium: 13 vollständige × sieben Entscheidungen, falsche Antworten → 💪, Levelaufstieg, 24-Fragen-Test, Profilwechsel, mobile Grundfunktion, 1440 × 800 ohne Scrollen.
- Go Tests, neue Builds für Windows amd64 und macOS ARM64, ZIP-Integritätsprüfung und SHA-256.
- **Nicht getestet:** Live-Web-Veröffentlichung, produktiver Cloudflare-Sync, echte Windows-/Mac-Geräte, externe fachliche Begutachtung aller automatisch möglichen Kombinationsaufgaben.
