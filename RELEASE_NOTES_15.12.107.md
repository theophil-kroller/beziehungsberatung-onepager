# Beziehungsdynamiken 15.12.107 · Komplexe Fälle & Ripple Gate 2.0

## Academy – Gottman Level 2 im klinischen Kontext
- **24 Kompetenzfelder, 72 eigenständige Szenen und 96 Wissensfragen**.
- 7 Entscheidungen pro Szene mit neuer Information, 20 Levels, Mastery und Schwachstellen-Training.
- Inhalte: Substanzkonsum, Intoxikation, Entzug, traumasensible Beratung, Stabilisierung, Zuständigkeitsgrenzen, Suizidalität, Gefahr, Kindersicherheit, Einwilligung, Vertraulichkeit, Schutz und interprofessionelle Kooperation.
- Fachlicher Rahmen: eigenständige psychosoziale Beratungssimulation – ausdrücklich **keine** Sucht- oder PTSD-Behandlung, keine offiziellen Gottman-Aufgaben. Akute Gefahr erfordert geeignete professionelle Krisenhilfe.

## Ripple Gate 2.0
- Admin-Login: eine von der Mausposition ausgelöste organische Wasserwelle. Mausgeschwindigkeit beeinflusst die Auslenkung; ein Klick erzeugt einen stärkeren Impuls.
- Die Wellen beruhigen sich nach etwa 2,4 Sekunden; bisherige langsame Grundanimation bleibt bestehen.
- Auf Touch-Geräten kann eine Berührung des Hintergrunds eine Welle auslösen. `prefers-reduced-motion` deaktiviert die Wellen.
- Kein Einfluss auf Anmeldung, API-Zugriffe oder die Session-Prüfung aus 15.12.103.

## Technische Integration
- Neues Modul `gottmancomplex` hinter `gottmanrelapse` und vor Affairs, bestehende Academy-IDs, lokale Lernstände und Kapitelreihenfolge unverändert.
- Cloud-Zuordnung und Worker-Modulfreigabe erweitert; Service-Worker-Cache 15.12.107. Keine D1-Migration.
- Änderungen ebenfalls in beiden Desktop-Webspiegeln, keine neuen Windows-/Mac-Binaries.

## Qualitätsgrenzen
- Statische Daten-, Skript-, Archiv- und simulierte UI-Logikprüfungen; kein produktiver Cloud-/Browser-/Gerätetest, soweit nicht separat dokumentiert.

## Erweiterte Dialoge (15.12.107)
- 72 eigenständige Dialoge mit 5–6 Sprecherbeiträgen statt nur A/B-Eröffnung.
- Neue Sprecherfolge mit echten Reaktionen, Rückfragen und teilweise Beiträgen der beratenden Person.
- Spätere zusätzliche Hinweise erscheinen weiterhin erst ab Entscheidungsschritt 5.
- Keine abgeschnittenen Dialoge: natürliche Dokumenthöhe und mobil einspaltig.
- Originalfiktive Fallszenen; keine realen Falldaten.
