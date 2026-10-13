# 15.12.108 — Academy Dialogue Engine / Safety Decisions

## Gemeinsame Academy-Chat-Engine
- Wiederverwendbare `academy-chat108.js` und `academy-chat108.css` für zukünftige Gottman-/Affairs-Trainer.
- Chatblasen mit Porträt links/rechts; die beratende Person als gesonderte, mittige Nachricht.
- Responsiv und zugänglich, chronologische DOM-Reihenfolge, Text mit `textContent` (kein HTML-Injection), lokale Bildpfade.
- Variabel lange Dialoge, 6–8 Sprecherbeiträge; der spätere Hinweis wird erst ab Schritt 5 eingeblendet.
- Keine innere Chat-Scrollbox: Bei langen Gesprächen wächst die Seite mit normalem Dokument-Scrollen.
- Bestehende Academy-Module werden **nicht automatisch umgestellt**; die neue Engine ist ab jetzt wiederverwendbar.

## Neues Modul Gottman Level 2 · Violence, Coercion & Safety Decisions
- 16 Kompetenzfelder, 48 eigenständig formulierte Fälle mit insgesamt 316 Gesprächsbeiträgen, 64 Wissensfragen.
- Jeweils 7 Entscheidungen, 20 Levels, eigenes Fortschrittsprofil, Schwachstellentraining, Mastery.
- Themen: Angst, Drohung, Einschüchterung, coercive control, digitales Monitoring, finanzielle Gewalt, Isolation, sexuelle Selbstbestimmung, Kinder, Sicherheits- und Indikationsgrenzen.
- Sicherheitsprinzip: Bei Gewalt/Zwang keine symmetrische Paarproblem-Deutung oder erzwungene Konfrontation; qualifizierte Hilfsangebote haben Vorrang.
- Fiktive originäre Lernfälle, keine offiziellen Gottman-Übungsunterlagen, keine eigenständige Ausbildung zur Gefährdungsbeurteilung.

## Bestand / Deployment
- Lernreihenfolge Level 1 → Level 2 → Affairs → RLT bleibt erhalten; neue ID `gottmansafety` nach `gottmancomplex`.
- Bisherige Lernstandschlüssel bleiben unverändert; eigener neuer Schlüssel `bd-gottman-safety108-*`.
- Cloud-Worker-Freigabe, Service-Worker-Cache und beide Desktop-Webspiegel angepasst.
- Admin-Login Ripple Gate 2.0 und Security-Frontend 15.12.103 unverändert.
- Keine D1-Migration; keine neuen nativen Desktop-Binaries.
