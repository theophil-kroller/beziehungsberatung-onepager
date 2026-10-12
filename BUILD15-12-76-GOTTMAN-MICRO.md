# Beziehungsdynamiken Academy · Build 15.12.76

**Basis: 15.12.75 FULL.** Erstes neues Modul auf **Welt der Beziehungshäuser: Gottman – Beziehungsmuster und Interventionen**. Bestehende 10 Planeten, 15.12.75-Skill-Trainer, Daten und Trainingsfortschritt bleiben erhalten.

## Was trainierbar ist
- 20 progressive Kompetenzstufen mit **10 / 12 / 15 / 18** je nach Stufe separat bestandenen Fallbegegnungen; zusätzlich **5 / 6 / 8 / 10** unterschiedliche Gesprächsfiguren. Ein Fall wird innerhalb desselben Levels nur einmal gutgeschrieben. Mindestens 275 bestandene Begegnungen über die 20 Levels sind für vollständigen Fortschritt nötig; die redaktionellen Grundszenen können sich auf höheren Stufen mit wechselnden Aufgaben wiederholen.
- **42 eigenständig geschriebene Grundfälle** zu Kritik, Verachtung, defensiven Reaktionen, Rückzug/Überflutung, Repair Attempts und konstruktiven Beschwerden (je 7). Diese sind **keine 275 eigenständig geschriebene Szenen**. Sie werden über Aufgabenvarianten und Personenbelegungen wiederverwendet. Der Ausbau weiterer Fallpools bleibt geplant.
- Sieben Aufgabenformen: Muster erkennen, Hypothesen, hilfreiche Umformulierung, Intervention, Repair & Retry, Prozessführung und interaktive Prozess-Reihenfolge. Zwei strukturierte Entscheidungen pro Begegnung, bei höheren Leveln zusätzliche freie Formulierung, die **nicht von einer KI bewertet** wird. Fortschrittsspeicherung lokal im Browser pro Lernprofil.
- Fachliche Grundlage: Gottman Four Horsemen + Antidotes, konstruktive Beschwerde vs. Kritik. Keine diagnostischen Behauptungen aus Mimik, keine klinische Zertifizierung.
- Getrennte **Gottman-Lernprofile „Ich“ und „Partnerin“** auf *demselben Browsergerät*: `bd-gottman76-ich` und `bd-gottman76-partnerin`. Dies sind keine serverweiten Nutzeraccounts, keine Synchronisation zwischen Geräten und keine Passworttrennung.

## Emotionsbilder / Mikrosignale (Pilot)
- `micro-signals76.js` ist eine **wiederverwendbare Übungskomponente**: Erst sichtbare Gesichtszüge beschreiben, dann eine eigene Hypothese formulieren, anschließend redaktionelle Bildzuordnung vergleichen. Keine automatisierte Emotionserkennung und keine automatische Bewertung der Freitexte.
- In Gottman und „Zwischen den Zeilen“ eingebettet. Die bestehende Emotionsbibliothek ist durch `public/emotion/emotion-library.json` (96 dokumentierte Varianten, 12 Emotionskategorien) bekannt; der Browser nutzt Bilder daraus **nur, wenn die tatsächlichen PNG-Dateien unter `public/emotion/` vorhanden sind**.
- **Wichtig:** Die bisherigen Full-/Website-Dateien enthielten keine Original-Emotions-PNGs. Daher enthält auch 15.12.76 bewusst keine erfundenen oder fälschlich als KI-generiert ausgegebenen neuen Fotos. Wenn die Originalfotos im Website-Verzeichnis fehlen, kann man über **„Emotionsbilder verwalten“** Bilder auswählen. Der Import erfolgt ausschließlich lokal in die IndexedDB dieses Browsers – **kein Server-Upload**. Auf anderer Installation bzw. in anderem Browser ist ein neuer Import nötig.
- Bei nicht geladenen Bildern bleibt das Modul nutzbar und zeigt die Beobachtungsaufgabe textbasiert. Die Mimikbilder sind Übungsstimuli, kein Beleg für eine bestimmte Emotion. Eine tatsächliche KI-generierte neue Bildserie aus dem Gesicht des Nutzers ist **noch nicht erstellt**.

## Installation
1. Vorab Vault-Backup anlegen und Desktop-App schließen. Das Update verändert keine Vault-, D1-, Klienten- oder Cloudflare-Daten.
2. **Website**: `Beziehungsdynamiken_15.12.76_NUR_WEBSITE.zip` entpacken und Dateien mit gleicher relativer Struktur über den Website-Projektstand kopieren; vorhandene Ordner nicht löschen.
3. **Projekt-Patch**: `Beziehungsdynamiken_BUILD_15.12.76_PATCH_WINDOWS.zip` über eine Kopie von FULL **15.12.75** legen (Projektverzeichnis, kein Vault-Verzeichnis). Alle neuen Dateipfade beibehalten.
4. **Desktop**: Unter Windows die neu kompilierte EXE aus dem Windows-ZIP verwenden. macOS enthält eine neu cross-kompilierte, **nicht signierte/nicht notarisiert** Apple-Silicon-Anwendung.
5. Academy öffnen: Welt der Beziehungshäuser → **Gottman · Beziehungsmuster**. Welt der Resonanz → Zwischen den Zeilen enthält ebenfalls den optionalen Bildimpuls.
6. Bei unerwartet alten Ansichten einmal gezielt neu laden; niemals pauschal Browserdaten löschen (lokaler Fortschritt und offline Captures könnten verloren gehen).

## QA und Grenzen
- JavaScript-Syntax, statische Pfad-/Knotenprüfung, 42 Grundfälle und 20 Levels, Go-Tests, Windows amd64-/macOS arm64-Cross-Compilation, ZIP-Integrität und SHA-256.
- Realer Browser- oder Gerätetest **nicht möglich**: Chromium-Aufruf auf `127.0.0.1` wird hier mit `ERR_BLOCKED_BY_ADMINISTRATOR` unterbunden. Bitte Chrome, Edge und Safari nach Installation testen, insbesondere Bildimport, TTS und Offline-Capture.
- Keine echten Klientendaten in die Simulationen eingeben. Freie Texte und importierte Bilder liegen lokal im jeweiligen Browser. Importierte Bilder bleiben dort auch nach Schließen der Sitzung, bis sie explizit lokal gelöscht oder Browserdaten gelöscht werden.
- Ein neuer Lernprofil-Name ist kein professionelles Berechtigungs-/Datenschutzkonzept; echte Vault-Nutzerrechte bleiben davon unberührt.

## Fachquellen
- https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling-/
- https://www.gottman.com/blog/the-four-horsemen-the-antidotes/
- https://doi.org/10.1177/1529100619832930 (Barrett et al. 2019, keine eindeutige Emotionsableitung aus Mimik)

## Prüfung auf dem Gerät
- Akademie > Welt der Beziehungshäuser > Gottman öffnen. Level 1 benötigt 10 unterschiedliche bestandene Fälle mit 5 unterschiedlichen Figuren.
- Eine Begegnung spielen (2 Aufgaben). Nach dem Speichern prüfen, dass nur ein neuer Fall hinzugefügt wird.
- Andere Rolle/Fall mehrfach wählen: verschiedene Fallthemen und Persönlichkeiten. Freitext ab Level 8 überprüfen.
- Profil „Partnerin“ wählen: Fortschritt separat 0/10; „Ich“ wieder wählen: eigener Stand unverändert.
- „Zwischen den Zeilen“ auf Welt der Resonanz öffnen: vorhandene Levels und Fortschritt weiterhin verfügbar; Bildimpuls optional.
- Lokal Emotionsbilder importieren, falls vorhanden; Bilder erscheinen nach Seitenneuladen. Kein Upload an den Webserver erfolgt.
