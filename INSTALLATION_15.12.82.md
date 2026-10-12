# Beziehungsdynamiken 15.12.82 – Welt der Verkörperung

## Was enthalten ist
- **Neues Modul Somatische Präsenz & Co-Regulation**, erstes aktives Training auf Planet **Welt der Verkörperung**.
- **120 unabhängig geschriebene fiktive Dialogsituationen** in **12 Themenfeldern**; **48 eigene Wissensfragen**; 20 progressiv schwerere Kompetenzlevel.
- Zwei Entscheidungsschritte je Fall; sieben Trainingsperspektiven (Beobachtung, Hypothesen, Intervention, Repair, Tempo, Paarperspektive, Transfer); punktuell optionale Freiformulierung als Selbstvergleich, **keine automatische Freitextbewertung**.
- Antwortoptionen werden gemischt; pro Aufgabe vier angezeigte redaktionell entwickelte Alternativen, **kein validierter, individuell verfasster Pool von 10–15 pro Fall**. Bei späteren Leveln sind mehr mehrere plausibel; Bewertungslogik ist ein didaktisches Modell, keine universelle therapeutische Norm.
- Wissenstraining mit 48 Items, Wiederholung unsicherer Items und 16-Fragen-Wissenscheck (Feedback erst am Ende). 💪-Karten bei Fehl- und Teilantworten.
- Planetengestaltung: Wald-/Wasser-Atmosphäre mit grün-türkisem, geschwungenem Lichtpfad. Training: kompakte Bühne ohne vertikales Scrollen im getesteten Desktopfenster 1440×800.
- Automatisch gesicherter **lokaler** Lernstand je Profil (Schlüssel `bd-somatic82-ich` und `bd-somatic82-partnerin`). Optionale Cloud-Fortschrittsspeicherung nur mit aktivem Account und aktualisiertem Worker, Live-Sync auf euren Geräten **nicht getestet**.

## Installation Website
1. Falls Website mindestens 15.12.81: **`Beziehungsdynamiken_15.12.82_MINI_PATCH_WEBSITE.zip`** entpacken; alle enthaltenen Dateien am **identischen Pfad** im GitHub-Pages-/Website-Repository **ergänzen oder ersetzen**, andere Dateien nicht löschen.
2. Alternativ die Website aus `Beziehungsdynamiken_15.12.82_NUR_WEBSITE.zip` über das bestehende Website-Repository legen. Bei Bedarf Ctrl+F5 (Hard Reload).
3. Academy → Welt der Verkörperung → Somatische Präsenz & Co-Regulation. Frage korrekt und absichtlich falsch beantworten, Rückmeldung und Weiter testen. 📖 Wissen und 💪 öffnen.
4. **Keine neue D1-Migration.** Für die **Cloudfreigabe des neuen Moduls** ist jedoch der neue **Cloudflare Worker 15.12.82** erforderlich: Datei `cloudflare-worker/worker.js` aus dem PATCH-/FULL-Projekt bzw. aus `Beziehungsdynamiken_15.12.82_CLOUDFLARE_WORKER.zip` nach Backup des bisherigen Workers gemäß eurem bisherigen Cloudflare-Prozess veröffentlichen. Erst dann können Owner-Freigaben/Cloud-Fortschritt für `somaticcoreg` zugreifen. Bestehende Worker-Endpunkte sollen erhalten bleiben; Worker-Deployment auf echter Cloudflare-Instanz wurde hier NICHT durchgeführt.
5. Ilonas Mac muss nicht aktualisiert werden, solange sie dieses neue Modul nicht nutzen soll; reguläre Methoden-Synchronisation bleibt davon unabhängig.

## Sicherheit / Grenzen
- Körpersignale geben keine sichere Auskunft über Diagnose, Trauma, Motivation oder Ehrlichkeit.
- Körperarbeit und Atemangebote immer freiwillig und an die Person anpassbar; medizinische Warnsignale und Gefahr im häuslichen Umfeld prioritär behandeln.
- Das Training ersetzt weder Traumatherapie noch Supervision oder medizinische Diagnostik.
- Hintergrundinformationen: SAMHSA https://www.samhsa.gov/mental-health/trauma-violence/trauma-informed-approaches-programs ; NICE NG116 https://www.nice.org.uk/guidance/ng116/chapter/recommendations ; Forschungsbeispiel zu Synchronie https://pubmed.ncbi.nlm.nih.gov/40438769/ .

## Teststatus
- JavaScript-Syntaxprüfung sämtlicher 37 Website-JavaScriptdateien; 120 unterschiedliche Ausgangsdialoge; 48 voneinander verschiedene Wissensfragen; 12 Themenfelder geprüft.
- Echtes Chromium, lokal geladene HTML/JS-Originaldateien: 24 vollständige Folgen, falsch/richtig, 20-Level-Progression über Freischaltung, 💪, Lernprofiltrennung, Wissenstraining, 16-Fragen-Prüfung, Desktop-Viewport 1440×800 ohne Scrollen sowie 390px Mobile-DOM: bestanden.
- Go-Test und getrennte Kompilierung Windows amd64 / macOS arm64, ZIP-Integrität: Release-Prüfung.
- **Nicht geprüft:** Veröffentlichung der Website, echtes Cloudflare-Deployment mit D1, tatsächlicher Owner-/Practitioner-Zugriff auf Ilonas Mac, notarized Apple Distribution, externe wissenschaftliche Begutachtung jeder Übung.
- Für klinische Entscheidungen gilt: didaktische Rückmeldung kann einen individuellen Fall nicht ersetzen.
