# Beziehungsdynamiken 15.12.88 · Gottman Integration & Mastery Lab

## Inhalt
- Zusätzliches Modul **Gottman · Integration & Mastery Lab** neben Assessment (15.12.84), ATONE, ATTUNE und ATTACH.
- 96 unterschiedliche, unabhängig geschriebene fiktive Gesprächsgrundlagen in 16 Themenfeldern (16 × 6).
- 64 eigene Wissens- und Transferfragen (16 × 4) sowie 20 Levels und 24-Fragen-Mastery-Prüfung.
- Sieben Entscheidungen: Phase erkennen, Hinweis identifizieren, Frage auswählen, intervenieren, neue Information, **Phase neu bestimmen**, nächsten Schritt planen.
- Viele Fälle verlangen nach einem Wendepunkt einen Rücksprung zu Assessment, ATONE oder ATTUNE. Der Anfangsphasenname wird vor der ersten Entscheidung nicht verraten.
- Vier Antwortmöglichkeiten, differenziertes Feedback, freiwillige Freiformulierung in höheren Levels, 💪-Muskeltraining.
- Eigener lokaler Fortschritt: `bd-gottman-integration88-ich`, `bd-gottman-integration88-partnerin`.
- **Umfangstransparenz:** 96 individuelle Ausgangsdialoge und kuratierte Themen/Wendepunkte. Die sieben Entscheidungen greifen auf eine gemeinsame, themenspezifisch gefüllte Engine zurück. Keine 96 völlig unabhängigen KI-Entscheidungsbäume.

## Installation
1. Wenn 15.12.87 bereits online ist, `Beziehungsdynamiken_15.12.88_MINI_PATCH_WEBSITE.zip` als Overlay über die Website-Dateien legen und bei GitHub Pages veröffentlichen; bestehende Dateien nicht löschen. Nach dem Deploy Strg+F5.
2. Alternativ die gesamte Website `Beziehungsdynamiken_15.12.88_NUR_WEBSITE.zip` verwenden.
3. Academy → Welt der Beziehungshäuser → Gottman · Integration & Mastery Lab.
4. Zur Cloud-Modulfreigabe: Worker aus `Beziehungsdynamiken_15.12.88_CLOUDFLARE_WORKER.zip` deployen. Modulkennung `gottmanintegration`. Keine neue D1-Migration ab Academy D1-Version 15.12.78.
5. Keine Änderungen an Ilonas installierter Mac-App nötig, solange nur dein Website-Training aktualisiert wird.

## Fachliche Grundlage & Grenzen
- Quellenbezug: eigenes Gottman-Manual *Treating Affairs and Trauma* (2017), Assessment und Phasen Atonement–Attunement–Attachment, Manual S. 123–241; eigene didaktische Transferfälle.
- Alle Fälle und Fragen sind neu formuliert, keine reproduzierten Originalseiten, Karten oder Handouts im Release.
- Affärenbezogene Belastungsreaktionen sind nicht automatisch PTSD; keine Diagnosestellung durch Academy.
- Bei Gewalt, Zwang oder Krisensymptomatik ist Gefährdungs- und Indikationsklärung vorrangig. In CNM-Fällen zählt der freiwillige Konsens und die gebrochene Vereinbarung, nicht die Anzahl der Partner.
- Wissensfestigung ist nicht gleich therapeutische Qualifikation oder zertifizierte Gottman-Kompetenz.

## Technische Tests
- JavaScript-Syntax, 96 eigenständige Dialoganfänge, 64 Transferfragen, Modulpfade und Workerkennung.
- Chromium lokal: 13 vollständige Fälle × 7 Entscheidungen, falsch → 💪, Levelaufstieg, 24-Fragen-Mastery ohne sofortige Lösung, Profilwechsel und Desktopfenster 1440×800 ohne Scrollen; mobile Grundfunktion.
- Go-Tests, Windows amd64 und Mac ARM64 Build, ZIP-Integrität und SHA-256.
- Nicht getestet: Veröffentlichung auf deinem Live-Webserver, produktiver Cloudflare-Abgleich, Ausführung auf euren Geräten, umfassende externe fachliche Prüfung jeder Antwortkombination.
