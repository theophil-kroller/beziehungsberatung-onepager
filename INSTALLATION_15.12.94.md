# Beziehungsdynamiken · Installation 15.12.94

## Neuer Inhalt

**Gottman Level 1 – Konfliktwerkstatt II:** 120 eigenständige Dialoggrundlagen, 75 Wissensfragen in 15 Kompetenzfeldern; 20 Levels, sieben aufeinander aufbauende Entscheidungen je Fall, 💪-Wiederholung, 24-Fragen-Mastery-Check, Feedback mit Gegenüberstellung, Sound und Stummschaltung.

Manualbezug: Gottman Level 1 (Ausgabe 2000–2016), §6.4.3 **Gridlock & Dreams Within Conflict**, §6.4.4 **Six Skills** (Gentle Start-up, Einflussnahme, Repair, Deeskalation, Kompromiss, Selbstberuhigung), §6.4.5 **Aftermath of a Fight / Regrettable Incident**. Inhalte sind eigenständig geschriebene private Übungsfälle, keine kopierten Handouts.

**Pfadkorrektur aus 15.12.93.1 bleibt enthalten.** Die mehrteilige Planetennavigation erweitert ihren Weg automatisch, wenn neue Module hinzukommen. Das GTD-Kanban mit Archivieren, Ausblenden und Wiederherstellen aus 15.12.93 bleibt unverändert.

## Website installieren

- Auf einer vorhandenen Installation 15.12.93.1 den Inhalt von `Beziehungsdynamiken_15.12.94_MINI_PATCH_WEBSITE.zip` **als Overlay** ins GitHub-Pages-Repository kopieren. Andere Webdateien nicht löschen. Nach Veröffentlichung die Seite mit **Strg+F5** aktualisieren.
- Auf älteren Ständen mindestens den Hotfix 15.12.93.1 voraussetzen oder die komplette Website als Overlay verwenden.
- Academy → Welt der Beziehungshäuser → „Gottman Level 1 · Konfliktwerkstatt II“ öffnen. Bestehende Module und deren lokale Lernstände bleiben erhalten.
- Neuer Modulschlüssel: `gottmanconflict2`; eigene lokale Fortschrittsschlüssel `bd-gottman-conflict94-ich` / `bd-gottman-conflict94-partnerin`.

## Cloudflare und Mac

- Für persönliches Website-Training **keine neue D1-Migration, kein Worker-Deployment erforderlich**.
- Für die **neue Owner-Modulfreigabe und die Synchronisierung des neuen Lernstands** ist der aktualisierte Worker optional; er erweitert die bestehende erlaubte Modulliste. Kein D1-Schemawechsel.
- Der Mac von Ilona muss nicht aktualisiert werden, um dein Website-Training zu ermöglichen.
- Aktualisierung der Desktop-App ist eine **separate manuelle Installation**; die ZIP-Dateien sind keine signierten automatischen Updates.

## Testumfang und Grenzen

- 14 ganze Fälle mit je sieben Entscheidungen in Chromium, mit falschen/richtigen Antworten, 💪-Eintrag, Levelaufstieg, Profilwechsel und 24-Fragen-Prüfung; Ton nur bei richtigen Antworten und stummgeschaltet aus. Desktop 1440×800 ohne Scrollen.
- JavaScript-Syntax und Datengleichheit geprüft, Go-Test und Kompilierungen sowie ZIP-Integrität in der Release-Pipeline.
- Nicht getestet: deine produktive Website, die tatsächlichen Endgeräte und der Live-Abgleich des neuen Moduls gegen Cloudflare.
- Die 120 Fallgrundlagen sind unterschiedlich, sieben Entscheidungsschritte nutzen allerdings **themenspezifisch gemeinsame Logik**. Sie sind keine 120 individuell programmierten frei verzweigenden Psychotherapiesimulationen. Fachliche Bewertung und Randfälle sollten weiterhin überprüft werden. Bei Gewalt und Zwang ersetzt der Wissenstrainer keine professionelle Indikationsklärung.
