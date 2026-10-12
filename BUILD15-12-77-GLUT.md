# Beziehungsdynamiken Academy · Build 15.12.77

**Projekt-Basis: 15.12.76 FULL.** Enthält die neue visuelle Welt der Glut, Deida-inspiriertes Modul und UI-Verbesserungen an öffentlicher Preview-Frontpage und Academy-Universum. **Kein Live-Deployment, keine Migration von Vault, D1 oder KV.**

## Sichtbare Änderungen
- Öffentliche Preview-Startseite („Was zwischen uns wirklich los ist.“): sehr zarte konzentrische Resonanzkreise hinter der Headline, nicht interaktiv; vorhandene Seifenblasen unverändert.
- Academy öffnet unmittelbar das blau-violette Kosmos-Universum mit **10 bebilderten Planeten** (kein vorgeschalteter Erklär-Hero). Jeder Planet bleibt frei wählbar.
- Welt der Glut: **eigenes Künstler-Panorama**, Ozean, Segler, Mond/Glut, kosmischer Himmel; **geschwungene leuchtende Glutspur** in der Modul-Journey. Blau und Glutrot beschreiben dynamische Metaphern, keine festen Genderzuschreibungen.
- Neu: **Polarität, Begehren & erotische Spannung** als Deida-inspiriertes Modul `deida-trainer15-12-77.html` auf Welt der Glut.
- 20 Levels, **48 eigenständig ausgearbeitete Grunddialoge** in 8 Themenclustern, sieben unterschiedliche Übungsoperationen, 10–18 verschiedene gut bearbeitete Fälle je Level plus 5–10 unterschiedliche Gesprächsfiguren; Fälle werden über Levels wiederverwendet, **keine 275 eigenständig geschriebenen Dialoge**.
- Die sieben Operationen: Beobachtung, Hypothesen, Kontextalternative, vorschnelle Deutung erkennen, Intervention, Repair, freier Antwortvergleich, Paarmoderation/Perspektivwechsel (teilweise Kombinationen über 2 Aufgaben-Schritte je Begegnung). Eigens formulierte Freitexte werden **nicht** automatisch von KI benotet; die strukturierte Erstaufgabe entscheidet über die prüfbare Komponente, anschließend ist Selbstvergleich vorgesehen.
- Lernstand lokal pro Browserprofil `bd-deida77-ich` / `bd-deida77-partnerin`; kein separater Nutzer-Login und kein Sync zwischen Geräten. Andere Trainingsspeicher bleiben unverändert.

## Fachliche Grenzen
- David Deida: Polarität als inspirierende metaphorisch/philosophische Linse, nicht als wissenschaftlich validiertes Diagnosesystem. Kein essentialistisches „Mann muss führen / Frau muss folgen“.
- Wissenschaftliche Gegenperspektiven: Kontext und responsives Begehren (Basson), Lustunterschiede und ihre vielfältigen Ursachen (ESSM), Differenzierung (Schnarch), Nähe/Autonomie (Perel) und Erregungshemmung (Nagoski).
- Einwilligung, Sicherheit, respektvolle Sprache und Rollenaushandlung haben Vorrang. Nie Druck auf Sexualität legitimieren, keine Gewalt als „Spannung“ darstellen.
- Die fiktiven Dialoge sind redaktionell vorgegeben; **kein autonomer KI-Gesprächspartner**, keine überprüfte Veränderung beruflicher Kompetenz durch Nutzung und keine fachliche Zertifizierung.

## Installation
1. Vor dem Austausch lokale Vault-Daten sichern; keine Vault-Daten ins Website-Projektverzeichnis kopieren.
2. **Nur Website:** `Beziehungsdynamiken_15.12.77_NUR_WEBSITE.zip` über die bestehenden Website-Dateien in GitHub Pages legen (Dateistruktur erhalten). Die geänderte `index.html`, `site-mode15-5.js` und `private-preview15-12-57.css` gehören dazu. Wichtig: Diese Version verändert die öffentliche Preview-Frontpage – nur veröffentlichen, wenn diese Änderungen gewünscht sind.
3. **Patch:** `Beziehungsdynamiken_BUILD_15.12.77_PATCH_WINDOWS.zip` über eine Kopie von **FULL 15.12.76** legen (nicht ins Vault-Datenverzeichnis).
4. **FULL:** vollständiger 15.12.77-Projektstand inklusive Website- und Desktop-Code.
5. **Windows:** neue 15.12.77-EXE aus dem Windows-ZIP verwenden, nicht die 15.12.76-EXE. Vollständiger Website-Stand ist in die EXE eingebettet.
6. **macOS Apple Silicon:** neu cross-kompilierte, **nicht signierte/notarisierte** Anwendung. Vor Ersetzen beenden, Daten sichern; auf dem Ziel-Mac testen.
7. Im Cockpit Academy öffnen → Welt der Glut → Polarität, Begehren & erotische Spannung.
8. Bei altem Layout gezielt Reload durchführen; Browserdaten nicht pauschal löschen (Offline-Captures und lokale Lernstände könnten verschwinden).

## Technische Tests
- JavaScript-Syntax und Daten-Plausibilität (48 Fälle/20 Levels), Dateien und aktive Links, Go-Tests, Windows-/macOS-Cross-Compile, ZIP-Test/Prüfsummen.
- Ein automatischer Chromium-Visualtest wurde versucht; der Zugriff auf `file://` wird in dieser Ausführungsumgebung mit `ERR_BLOCKED_BY_ADMINISTRATOR` geblockt. Daher **kein bestätigter End-to-End-Browsertest**, kein bestätigter Echtgeräte-Test und keine Live-Produktionsbereitstellung.
- Empfohlene QA auf dem eigenen Gerät: Kosmos-Übersicht mit 10 Welten, mobile Ansicht, Planet Glut/Journey/Modul, Dialog korrekt, Fallwechsel, 10-Fälle-Schwelle, Rollen-Vielfalt, getrennte Profile, TTS, Level-Freischaltung, Rückwege, Frontpage mit Resonanzkreisen, Browser-/Vault-Daten unverändert.

## Quellen zur fachlichen Einordnung
- Deida, *Intimate Communion*: https://deida.info/intimate-communion/
- Basson 2001, responsives Begehren: https://pubmed.ncbi.nlm.nih.gov/11554199/
- ESSM (2020), Desire Discrepancy: https://pmc.ncbi.nlm.nih.gov/articles/PMC7261674/
- Projekt-Spezifikation: `BUILD_SPEZIFIKATION_15.12.77.md`.
