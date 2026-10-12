# Beziehungsdynamiken 15.12.89 · Gottman Level 1 – Sound Relationship House

## Neu
- Vollständiges erstes Grundlagenmodul in der Welt der Beziehungshäuser: **Gottman Level 1 · Sound Relationship House & Forschungsgrundlagen**.
- 136 eigenständig formulierte fiktive Gesprächssituationen in **17 Themenfeldern** (17 × 8), plus 85 konzeptbezogene Wissensfragen (17 × 5).
- Neun Komponenten: sieben Ebenen des Sound Relationship House und die tragenden Elemente Trust und Commitment. Ergänzende Forschungs- und Beobachtungskonzepte: Sentiment Override, dauerhafte Konflikte, emotionale Entfremdung, Flooding, Four Horsemen, Accepting Influence, Core Triad of Balance und Indikationsklärung.
- 20 Lernlevels mit 7 Entscheidungen je Fall, vier plausiblen Antwortoptionen, differenzierter Rückmeldung, 💪-Fehlerwiederholung, 24-Fragen-Mastery-Prüfung und einem Haus-Nachschlagefenster.
- **Neuer kurzer Erfolgston** für richtige Antworten (Web Audio, kein Download/Tracking); Schalter `♪ Ton an / aus`, Einstellung im Browser gespeichert. Ton in den Academy-Trainingsseiten eingebunden; andere bestehende Übungen behalten ihre eigene Bewertungslogik.
- Eigener Lernstand `bd-gottman-house89-ich` / `bd-gottman-house89-partnerin`, bisherige Module werden nicht überschrieben.
- **Qualitätsoffenlegung:** 136 eigenständige Dialoganfänge, gemeinsam kuratierte Antwort-/Entscheidungsstruktur. Keine 136 individuellen KI-Dialogbäume. 85 Fragen mit fünf unterschiedlichen Fragetypen je Themengebiet; teilweise strukturierte, bewusst verwandte Optionen.

## Installation
1. Wenn 15.12.88 bereits online ist, `Beziehungsdynamiken_15.12.89_MINI_PATCH_WEBSITE.zip` **als Overlay** über die vorhandene Website legen, bei GitHub Pages veröffentlichen und Strg+F5 drücken. Nicht den gesamten Repository-Inhalt löschen.
2. Oder die gesamte Website `Beziehungsdynamiken_15.12.89_NUR_WEBSITE.zip` verwenden.
3. Academy → Welt der Beziehungshäuser → Gottman Level 1 · Sound Relationship House.
4. Für **nur lokales Training** sind keine neuen Cloudflare-Schritte nötig. Für **Owner-Freigaben und Cloud-Lernstand des neuen Moduls** den `Beziehungsdynamiken_15.12.89_CLOUDFLARE_WORKER.zip` installieren. Modulkennung `gottmanhouse`; bei vorhandener D1-Academy-Struktur keine Migration.
5. Ilonas bestehende Mac-App kann unverändert bleiben. Neue Softwarefunktionen erscheinen dort erst nach einer späteren manuellen Aktualisierung.

## Quelle, Grenzen
- Gottman Level 1 Clinical Training Manual (Ausgabe © 2000–2016): Forschungstheorie §§1.2–1.6, Sound Relationship House §1.5, Assessment §2, Interventionen §6.
- Das Manual selbst, sein Diagramm und lizenzierte Arbeitsblätter sind **nicht in diesem Build enthalten**. Alle Dialoge/Übungen sind eigenständige neue Formulierungen.
- Theorie und Studienbehauptungen stammen aus einer älteren Manualausgabe, ihr heutiger Evidenzstand wird im Modul nicht unabhängig neu bewertet.
- Beobachtung, Verhalten und Körpersignale führen nicht automatisch zu Diagnosen. Bei Gewalt, Druck oder Selbstgefährdung geht Sicherheit vor gemeinsame Konfliktarbeit.
- Academy-Mastery ist eine Wissensübung und keine klinische Zertifizierung.

## Technischer Teststatus
- JavaScript-Syntax, Datenkonsistenz 136/85, Cloud-Modul-ID und getrennte Speicherschlüssel.
- Chromium lokal: 14 komplette 7-Schritt-Fälle, Fehler → Muskel, Levelaufstieg, Hausübersicht, 24-Fragen-Prüfung, Profilwechsel. Bestätigungston ausschließlich bei richtigen unmittelbaren Antworten, stummschaltbar. Fenster 1440×800 ohne Scrollen.
- Go-Tests, Windows- und Mac-ARM64-Kompilierung, ZIP-Integrität und Prüfsummen.
- Nicht bestätigt: veröffentlichte Website, produktive Cloudflare-Synchronisation, echte Windows-/Mac-Geräte, externe fachliche Bewertung sämtlicher 7×136 Antwortkombinationen.
