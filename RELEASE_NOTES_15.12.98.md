# 15.12.98 – Gottman Level 2 · Bids & Turning

## Neu
- Kontaktangebote und Antwortformen: 24 Dimensionen, 120 verschiedene fiktive Szenen, 96 Wissensfragen.
- Sieben Entscheidungsphasen einschließlich Perspektivwechsel; 20 Lernlevels; 24-Fragen-Mastery; Schwachstellen-Training.
- Lernpfad im Paar-Planet mit Bids unmittelbar hinter SPAFF; RLT folgt später.
- Untertitel und Symbol bei Level-2-Modulen ergänzt; Klassifikationshinweis zu Fallbeginn entfernt.
- Optionaler Cloudflare-Worker mit `gottmanbids`-Freigabekennung; keine D1-Migration.

## QA / Grenzen
- Statische JS-/Datentests: 24 Felder, 120 eindeutige Fälle, 96 gültige Wissensfragen. Go Unit-Tests erfolgreich.
- Browser-Automation war in dieser Ausführungsumgebung durch eine Zugriffsrichtlinie blockiert.
- Lokales Build von Windows amd64 und macOS arm64 ohne Signatur; tatsächlicher Gerätetest/Live-Deployment stehen aus.
- Inhalte sind eigenständig formulierte Lehrfälle, keine offiziellen Tests, keine Kompetenzbescheinigung.
