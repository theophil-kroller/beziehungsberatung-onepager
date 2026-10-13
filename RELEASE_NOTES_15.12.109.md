# Release 15.12.109 — Assessments / private Infrastruktur

### Neu
- Hauptbereich Praxis → Assessments: Durchführungen, Fragebogenbibliothek, Auswertungen
- Reiter Assessments in der bestehenden Klientenakte; Link nur zu Sandbox/Testprofilen und nur lokal
- neutrales, versioniertes Instrumentmodell mit DE/EN-Übersetzungen und verschiedenen Fragetypen (single, multi, text, number, boolean)
- zwei bis acht unabhängig antwortende Teilnehmer; geschützte Passphrasen und unterbrechbare Befragung
- individuelle Antwort-Verschlüsselung mit unabhängigem scrypt/AES-GCM-Schlüssel, zusätzlich zum Vault-Schutz
- separate Einwilligungen für Themenübersichten und Einzelantworten; Widerruf und endgültige Löschung der eigenen Assessment-Daten
- deskriptive Auswertung nach Themenbereichen, separate Vergleichsansicht nur nach Einwilligung aller Beteiligten
- **wirklicher PDF-Export** direkt aus dem lokalen Vault, serverseitig mit denselben Einwilligungsregeln
- neue SQLite-Tabellen im lokalen Vault; kompatible Vault-Key-Rotation
- öffentliches GitHub Pages und D1 enthalten keine Fragebogeninhalte oder Antworten

### Rechte
- Gottman Level 1 und 2: `rights_pending`, technische Metadaten, **0 freigegebene Fragen**
- Gottman Relationship Checkup: `separate_license`, technische Metadaten, **0 freigegebene Fragen**
- keine automatisch erfundenen Ersatzfragebögen oder Scores; kein gesondert lizenzierter Checkup rekonstruiert
- eigene instrumente können nach lokaler Rechtebestätigung über JSON importiert werden

### Unverändert
- Academy, Login/Ripple, Dashboard/Bubbles, übriges CRM, bestehender Vault-Datenbestand, Cloudflare Worker und D1

### Einschränkungen
- Eine gewöhnliche, schon installierte Windows-EXE oder macOS-App ist **nicht** durch diesen Source-Patch aktualisiert. Ein neu gebauter lokaler Vault-Dienst ist für die Verwendung erforderlich.
- Browser- und Betriebssystemtests in der realen Installation stehen aus.
- Gottman-Manuals waren in dieser aktuellen Dateisitzung nicht verfügbar; manuelle Inventur und Rechteklärung sind offen.
- Kein produktiver Multi-User-Teilnehmerportalbetrieb; für diesen ist eine separate Sicherheitsprüfung obligatorisch.
