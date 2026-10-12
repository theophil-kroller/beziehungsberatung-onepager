# Beziehungsdynamiken – Build 15.12.72

**Direkte Basis:** 15.12.71 FULL (inklusive Bindungsstile, Gross, Capture und Cockpit). Unverändert: bestehendes Vault-Schema, Klientendaten, Cloudflare Worker/D1-Struktur.

## Das neue Skill-Mastery-System

- Neun getrennte Trainingspfade: Beratungsallianz; Selbstregulation; Grenzen & Autonomie; Perspektivenwechsel; Affären & Vertrauen; Eifersucht & Poly; Trennung & Trauer; Sicherheit & Eskalation; Entwertung & Anspruchsdenken.
- Jeder Skill enthält **20 stufenweise erschwerte Levels** und mehrere synthetische Begegnungen. Die Level 1–5 trainieren eine grundlegende Entscheidung, Level 6–10 zwei Schritte und ein Lückensatz-Abruftraining, Level 11–15 drei Schritte und eigene Antworten, Level 16–20 vier Schritte mit einer zweiten Gesprächsperson und situativen Unterbrechungen.
- 12 KI-generierte, wiedererkennbare fiktive Porträtfiguren mit konstanten Interaktionsprofilen und browserseitigen Sprachausgabe-Profilen. Gesichter sind unabhängig von Diagnosen und realen Eigenschaften. Ausschließlich vorhandene Geräte-Stimmen; **keine produzierten individuellen KI-Stimmen** und **kein echter LLM-Dialog** im Paket.
- Antworten bestimmen situative Folgedialoge und individuelle Erklärungen; höhere Level enthalten glaubwürdige, aber unvollständige Lösungsversuche. Fortgeschrittene Fälle unterscheiden Selbstregulation, Allianz, Grenzen, reale Verantwortlichkeit und Risiko.
- Fortschritt pro Skill lokal. Level-Festigung ab 80 % Entscheidungsqualität und mindestens zwei **verschiedenen** fiktiven Rollen; ab Level 16 drei Rollen. Erneutes Üben mit derselben Figur bringt XP, jedoch keinen zusätzlichen erforderlichen Rollen-Pass. XP sind Motivationsindikatoren, keine Kompetenzdiagnostik.
- Persönliche freie Antwort und anschließend freiwillige Reflexion/Selbsteinschätzung der Ruhe; **keine** maschinelle Bewertung des Freitexts, keine Stress- oder Emotionsanalyse. Alle Daten im browserseitigen LocalStorage.
- Rollenbibliothek erklärt die vier Modellachsen (Interpersonaler Circumplex mit Einfluss und Nähe, Aktivierung, Kontext). Narzisstisch wirkende Muster werden als *beobachtbare Interaktionsmuster*, niemals als klinische Diagnosen, geübt.
- Neue Academy wird vom Cockpit-Training-Button und Capture-Training-Button geöffnet; in der Academy sind Bindungsstile und Gross direkt erreichbar, in den älteren Trainingsseiten führt ein Link zu Mastery.

## Installation

**Nur Website / Capture**
1. `Beziehungsdynamiken_15.12.72_NUR_WEBSITE.zip` entpacken.
2. Die enthaltenen Dateien **mit Ordnerstruktur** in den Wurzelordner des GitHub-Pages-Repositories `beziehungsberatung-onepager` übernehmen.
3. Die Veröffentlichung abwarten und Capture/Website neu öffnen. Nicht pauschal Browserdaten oder App-Daten löschen – die enthalten lokalen Fortschritt und gegebenenfalls ungesendete Captures.
4. Erst die Seite `mastery-trainer15-12-72.html` prüfen; die 12 `.webp`-Figuren müssen unter `training-assets/characters/` vorhanden sein.

**Windows**
- Bestehende Desktop-Anwendung schließen. `Beziehungsdynamiken_WINDOWS_15.12.72.zip` entpacken und die EXE starten. Alternativ den Windows-Patch auf eine Kopie des Projektordners anwenden.
- Der FULL-WINDOWS-Download enthält den vollständigen aktuellen Projektstand aus 15.12.71 plus Academy-Modul; nicht die alte Datei `15.12.71-Windows.exe` starten.

**macOS ARM64 (M1/M2/M3/M4)**
- `Beziehungsdynamiken_MAC_M1_15.12.72.zip` entpacken und `Beziehungsdynamiken.app` durch die neue Version ersetzen, nachdem sie beendet wurde. Keine Datendateien des Vaults löschen.
- Die App ist nicht signiert und nicht notarisiert; bei Bedarf die bereits beschriebene lokale Gatekeeper-Freigabe. Ein optionales lokales DMG kann mit `DMG_ERSTELLEN_M1.command` erstellt werden.

**Wichtig:** Kein Cloudflare-/D1-Migrationsschritt erforderlich. Die Installation veröffentlicht nichts selbständig, verändert kein Live-Repository und setzt keinen GitHub-Release-Kanal auf. Website-Update und Desktop-Update bleiben getrennte Installationsschritte.

## Psychologische und technische Grenzen

- Das Modul trainiert auswählbare Handlungsoptionen in fiktiven Fällen. Es bietet kein generatives Echtzeitgespräch, keine echte Spracherkennung, keine KI-Stimmenproduktion und keinen Nachweis von professioneller Gelassenheit. Eine realitätsnahe Erweiterung benötigt validierte Bewertungsrubriken, Supervision und einen separaten optionalen Sprach-/LLM-Dienst mit Datenschutzprüfung.
- Die Fälle beschreiben keine diagnostischen Persönlichkeitstypen. Bei Gewalt, Zwang, Drohungen oder akuter Gefahr geht Schutz vor gemeinsamer Vermittlung. Nicht alle Perspektiven sind in jeder Situation sicher gleichzusetzen.
- LocalStorage ist browser- und Geräte-spezifisch; die unterschiedlichen Trainingspakete haben getrennte Fortschrittsspeicher. Keine Cloud-Synchronisation.
- Statische Trainingsseiten sind unter ihrer URL erreichbar und ohne serverseitige Login-Sperre verfügbar.
- Automatisierte Prüfung: JavaScript-Syntax; Go-Tests; Browserinteraktion (360×640, 375×667 und Desktop), Level-1- bis Level-2-Freischaltung, Level-20-Durchlauf, Charakterbibliothek und Paarrolle. Direkte Windows-/macOS-Geräteinstallation und reale Cloudflare-Deployments wurden nicht durchgeführt.

## Literatur / Fachliche Grundlagen
- Wilson et al. (2017): Interpersonal dysfunction in personality disorders: A meta-analytic review. https://pubmed.ncbi.nlm.nih.gov/28447827/
- Horowitz et al. (2006): How interpersonal motives clarify the meaning of interpersonal behavior. https://pubmed.ncbi.nlm.nih.gov/16430329/
- American Psychiatric Association (2024): What Is Narcissistic Personality Disorder? https://www.psychiatry.org/News-room/APA-Blogs/What-Is-Narcissistic-Personality-Disorder
- Gross (1998): The emerging field of emotion regulation. https://doi.org/10.1037/1089-2680.2.3.271

## Konkrete Weiterentwicklung nach 15.12.72
- Echte mehrphasige LLM-Dialoge hinter sicherer, lokaler/selbst kontrollierter Schnittstelle, klarer Freigabe und synthetischen Testfällen.
- Langfristig unterschiedliche, lizenzierte/selbst produzierte KI-Stimmen und konsistente Audio-Identitäten, optional statt erzwungenem Cloud-TTS.
- Zeitlich verteilte Mastery-Reviews, standardisierte menschlich überprüfte Bewertungsraster für die selbst formulierte Beraterreaktion; Sicherheit nicht nur durch Multiple Choice.
