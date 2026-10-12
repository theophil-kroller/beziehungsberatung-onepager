# Build 15.12.84 · Gottman: Vertrauensbruch verstehen und einschätzen

## Neu
- 120 eigenständig geschriebene fiktive Ausgangsdialoge aus 24 Themenfeldern (je 5 Dialoge).
- 7 Entscheidungen je Fall: Einordnen, Klären, Sichern, Antworten, neue Information, Phase und Vereinbarung.
- Antworten: vier fachlich abgestufte Möglichkeiten, Feedback als „Deine Entscheidung“ ↔ „Tragfähige Möglichkeit“.
- 72 redaktionell verfasste Wissensfragen, gemischte 24-Fragen-Prüfung ohne sofortige Lösungen, 💪-Wiederholungen.
- 20 Levels, 10–18 erfolgreich absolvierte **unterschiedliche** Fallgrundlagen pro Level, getrennte lokale Lernprofile.
- Fachliche Grundlage: John & Julie Gottman (2017), *Treating Affairs and Trauma* – vom Nutzer bereitgestelltes, urheberrechtlich geschütztes Manual. **Nicht** im Projekt enthalten. Kein Nachdruck von Arbeitsblättern, Anleitungen oder Transkripten. Alle öffentlichen Übungstexte sind neu verfasst.
- Die zusätzlichen CNM-, Digital-, Macht-, Sicherheits- und Gesundheitskontexte sind **eigene didaktische Ergänzungen**, nicht Originalmaterial von Gottman.
- Themenbasierte Entscheidungssequenzen sind kuratiert, **keine** 120 unabhängigen sich frei verzweigenden Therapiesimulationen. Die Reflexionsantworten werden nicht automatisch klinisch bewertet.

## Installation
1. Wenn Website auf **15.12.83**: ZIP `Beziehungsdynamiken_15.12.84_MINI_PATCH_WEBSITE.zip` in das bereits vorhandene GitHub-Pages-Repository als **Overlay** kopieren, vorhandene fremde Dateien beibehalten und Commit/Veröffentlichung abwarten. Browser neu laden (Strg+F5).
2. Alternativ `NUR_WEBSITE` als vollständige Website bereitstellen.
3. Academy → Welt der Beziehungshäuser → **Gottman · Vertrauensbruch verstehen**.
4. Um `gottmanaffairs` in Cloudflare Owner-Freigaben, Cloud-Lernständen und Reset zu nutzen: aktualisierten **Cloudflare Worker** veröffentlichen. **Keine D1-Migration** nötig, wenn Academy-Tabellen aus 15.12.78 vorhanden sind. Ohne Worker-Update bleibt das Training lokal funktionsfähig; Cloud-Freigaben für dieses Modul sind dann nicht verfügbar.
5. Lernstände dieses Moduls sind in `bd-gottman-affairs84-ich` bzw. `bd-gottman-affairs84-partnerin`; die alte Gottman-Übung behält ihren eigenen Lernstand.
6. Ilonas alte Mac-App benötigt kein Update, sofern sie das neue Modul nicht verwendet. Softwareinstallation bleibt manuell.

## Fachliche Grenzen
- Vertrauensbruch kann schwere traumabezogene Belastungsreaktionen auslösen, begründet für sich allein aber keine PTSD-Diagnose. Eine PTSD ist anhand entsprechender Diagnosekriterien zu prüfen.
- Bei Drohung, Gewalt, coercive control oder akuter Selbstgefährdung Sicherheitsabklärung/Krisenhilfe vor regulärer Paararbeit. Keine Verteilung von Verantwortung nach dem Schema „beide sind immer gleichermaßen schuld“.
- Das Training vermittelt Wissen und Entscheidungsreflexion, keine eigenständige Qualifikation zur Traumatherapie.
- Urheberrecht: Das Originalmanual ist laut eigener Lizenz nur persönlich nutzbar und darf nicht auf die Website gestellt werden. Keine Originalmaterialien hochladen.

## Testergebnis
- JavaScript-Syntax und 120 Fälle / 72 Wissen / Datenintegrität bestätigt.
- Chromium: Desktop 1440 × 800 ohne Scrollen, falsche Antwort → 💪 → Weiter, 13 vollständige 7-Schritt-Fälle, Level-Freischaltung, Wissen, 24-Fragen-Prüfung, Profiltrennung und Mobile-Elemente.
- Go-Tests, Windows- und Mac-ARM64-Binaries, ZIP-Prüfung durchgeführt.
- Noch offen: produktiver Cloudflare-Deploy, veröffentlichte Website, Echtgeräte und vollständiger fachlicher Review aller Kombinationen.
