BUILD 15.12.39 – ATEMRAUM ZWECKTEXTE & ADVANCED VISUALS

1. Herkunft der Audios:
- Master D: 53 Phasen mit ausgewählten Takes.
- 19 zuvor zugeordnete A/B-Hauptaufnahmen für 30 weitere Phasen.
- Master A/B Hörkontrolle 15.12.38: 176 bestätigte, 23 ausgeschlossene MP3s im Sprachkatalog.
- 53 zusätzliche, zeitlich passend platzierte Cues aus 28 unterschiedlichen bestätigten A/B-Aufnahmen.
- Weitere freigegebene Takes im durchsuchbaren Sprachkatalog; nicht alle werden im Atemplayer abgespielt.
- Die 18 bewusst stillen Advanced-Phasen bleiben stumm. Kein synthetischer Advanced-Fallback. Master C bleibt unbestätigt.

2. Textdarstellung:
- Alle 17 Advanced-Katalogeinträge benutzen im Datengrundstock kurze konkrete Zwecktexte statt „Fachlich begleitete Technik“.
- „Wofür diese Übung?“ benutzt den ausführlichen spezifischen Zwecktext und die vorhandene wissenschaftliche Einordnung/Quellen.
- Weniger wiederholte „begleitete Sitzung“-Zusätze in der Übungsliste.
- Ein eingebautes Versionskennzeichen „Atemraum 15.12.39“ ist in der schreibgeschützten Member-Vorschau sichtbar.

3. Visualisierungen:
- Neues Modul advanced-visuals15-12-39.js + .css.
- 17 unterschiedliche abstrakte und thematisch passende SVG-Illustrationen; keine eintönige Standard-Körperfigur.
- Phase 1–N wird im laufenden Player visuell markiert. Im Startdialog wird der Stil der gewählten Technik gezeigt.
- Die Illustration ist bewusst symbolisch und gibt für intensive, begleitete Techniken keinen Atemrhythmus vor.
- CSS-Layout auch für Mobilgeräte angepasst; reduced motion berücksichtigt.

4. Auslieferung:
- Den PATCH über den entpackten Full Build 15.12.38 kopieren (Ordnerstruktur erhalten).
- Für Live-Webseite müssen mindestens zugang.html, access.html, member-practice15-12.js,
  advanced-visuals15-12-39.js und advanced-visuals15-12-39.css auf den veröffentlichten Host.
- Für die lokale Desktopkopie liegen dieselben Änderungen unter desktop/app/web/.
- Eine lokal installierte Full-Version allein aktualisiert nicht automatisch www.beziehungsdynamiken.at.
- Nach Veröffentlichung Member-Vorschau hart neu laden (Windows Strg+Shift+R, Mac Cmd+Shift+R),
  dann „Atemraum 15.12.39“ im Vorschauhinweis prüfen. Wenn nicht sichtbar, zeigt die Website noch alten Code.
- Keine Cloudflare-Worker- oder D1-Migration erforderlich; Mac-Vault unverändert.

5. Tests:
- Node --check für die geänderten JS-Dateien.
- Chromium set_content Browser-Harness: 22 Übungseinträge sichtbar; Rebirthing-Zwecktext in Liste
  und geöffnetem Dialog sichtbar; 17 verschiedene Visualisierungen; Phase-Dots umschaltbar.
- Browser-Harness musste lokale Speicher-API stubben, weil about:blank diese aus Sicherheitsgründen sperrt.
- Ein vollständiger Live-/Cloudflare-Browsertest wurde nicht durchgeführt. Dateitests sind keine
  Bestätigung einer erfolgreichen produktiven Veröffentlichung.
