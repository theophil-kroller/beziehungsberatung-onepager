# Beziehungsdynamiken 15.12.101

## UI-Fixes
- Landing Page verwendet jetzt dieselbe Beziehungsdynamiken-Logo-Marke wie der Admin-Bereich: Icon + Wordmark statt des separaten Lockup-Bilds.
- Admin-Login zeigt deutlich sichtbare konzentrische Kreise im Hintergrund, damit der Zugang hochwertiger und stärker an die Landing Page angelehnt wirkt.
- Die Login-Karte bleibt darüber klar lesbar und leicht hervorgehoben.

## Academy
- Neues Modul: Gottman Level 2 · Assessment & Interpretation II.
- 20 Assessmentfelder, 80 Fallszenen, 80 Wissensfragen, 7 Entscheidungen, 20 Levels.
- Fokus: Datenquellen gewichten, Hinweise vorsichtig interpretieren, keine Überdehnung von Scores, Rückmeldung und Treatment Planning vorbereiten.
- Eigenständige fiktive Lernfälle; keine Originalfragebögen oder Original-Scores aus geschütztem Material.

## Integration
- Modul in Academy-Welt und Cloud-Lernstand aufgenommen.
- Service Worker Cache angehoben.
- Worker-Zuordnung für neues Modul ergänzt.

## QA
- Strukturprüfung: Dateien vorhanden, Modulverweise gesetzt, Website- und Desktop-Webspiegel aktualisiert.
- Kein vollständiger Live-Browser- und Geräte-Smoke-Test in dieser Laufzeitumgebung.

# Installation 15.12.101

- Für das Website-Update auf Basis 15.12.100 reicht der MINI-PATCH.
- Danach Browser-Cache hart neu laden, damit das geänderte Logo, die Login-Hintergründe und der neue Service Worker sicher sichtbar werden.
- Für Cloud-Synchronisierung des neuen Academy-Moduls zusätzlich den Worker 15.12.101 veröffentlichen.
- Keine D1-Migration nötig.
