# Beziehungsdynamiken · Installation 15.12.93

## Was neu ist

1. **Gottman Level 1 · Konfliktwerkstatt I:** 96 eigenständig verfasste Paarsituationen, 60 Wissensfragen und 12 Kompetenzfelder aus Gottman Level 1 §§ 1.3 und 6.4.1. Training von lösbaren und dauerhaften Konflikten, Gottman-Rapoport-Perspektivübernahme, Validierung, positiven Bedürfnissen, Einflussnahme und konstruktivem Kompromiss. Sieben Entscheidungen je Fall, 20 Levels, Mastery-Quiz, Lernkompass und 💪-Wiederholung.
2. **GTD-Kanban gestrafft:** Nur ein sichtbarer Button „＋ Aufgabe“ im Cockpit, Schnell-Erstellen öffnet denselben GTD-Editor. Status-Dropdowns von den Aufgabenkarten entfernt; Wechsel per Drag-and-drop oder Status im Editor. Jede Karte hat eine Archivieren-Checkbox. Archivierte Aufgaben sind aus dem Board standardmäßig ausgeblendet und lassen sich über „Archiv anzeigen“ wiederfinden und wiederherstellen.
3. Bestehende Aufgaben bleiben im lokalen verschlüsselten Vault. Lernstände des bisherigen Gottman- und anderer Academy-Module werden nicht überschrieben.

## Installation Website

- Für bestehende GitHub Pages auf 15.12.92: Inhalt von `Beziehungsdynamiken_15.12.93_MINI_PATCH_WEBSITE.zip` ins bestehende Repository als Overlay kopieren; bestehende übrige Dateien keinesfalls löschen.
- Veröffentlichung abwarten; `admin.html` mit Strg+F5 aktualisieren. GTD benötigt einen **laufenden, entsperrten lokalen Secure Practice Vault**.
- Prüfen: alte Aufgabe sichtbar → „Archivieren“ anhaken → Karte verschwindet → „Archiv anzeigen“ → Wiederherstellen → ursprünglicher Text, Fälligkeit und Unteraufgaben erhalten.
- Die vier aktiven Kanban-Spalten sind Inbox, Working On, Waiting For, Done. Archiv ist standardmäßig verborgen und auf Wunsch einblendbar. Um einen Status ohne Ziehen zu ändern: Aufgabe bearbeiten → Spalte wählen.
- Neues Training: Academy → Welt der Beziehungshäuser → Gottman Level 1 · Konfliktwerkstatt I.

## Cloudflare / lokaler Vault

- Für persönliches Website-Training und GTD ist **keine D1-Migration und kein neuer Worker nötig**. GTD-Karten sind weiterhin lokal, innerhalb der bisherigen Vault-Verschlüsselung gespeichert. Die Karten werden zwischen unterschiedlichen Geräten nicht allein durch diese Version synchronisiert.
- Nur für Owner-Modulfreigabe und Cloud-Lernstand des neuen Academy-Moduls `gottmanconflict` ist die **optionale Worker-Datei** aus dem Worker-ZIP zu veröffentlichen. Kein D1-Schemawechsel.
- Die Windows- und Mac-Versionen sind unabhängig neu kompilierte Programme. Ilonas stabile Mac-Version muss nicht aktualisiert werden.

## Fachliche und technische Grenzen

- Die Inhalte basieren auf Gottman Level 1, besonders den Passagen über dauerhafte Konflikte, Rapoport-Zuhördialog und Kompromiss. Alle Fälle und Antworten sind eigenständig formuliert und keine Kopien geschützter Arbeitsblätter.
- 96 einzigartige Ausgangsdialoge, sieben thematisch abgeleitete Entscheidungsstufen, keine 96 unabhängig verzweigten echten Therapiesimulationen. Die fachliche Freigabe aller möglichen Antwortkombinationen bleibt ein redaktioneller Nachkontrollpunkt.
- Sicherheitskritische Fälle unterscheiden bewusst Machtgefälle und Zwang von gleichberechtigter Konfliktverhandlung. Dieses Lerntraining ersetzt weder eine praktische Ausbildung noch Supervision.

## Lokal überprüft

- Automatisierte JS-Syntax; Browser 14 Fälle × 7 Entscheidungen inkl. Levelaufstieg, falscher Antworten, 💪, 24-Fragen-Prüfung, Profilwechsel, Sound und Stummschaltung. Kompakte Ansicht bei 1440 × 800 ohne Scrollen.
- GTD in Chromium: archivieren und ausblenden, Archiv aufrufen, Wiederherstellung, Unteraufgaben, bestehender Beschreibungstext, Editor-Status. Diese Tests laufen mit einer simulierten Vault-API.
- Go-Tests, Windows-/Mac-Kompilierung sowie ZIP-Integrität werden im Release überprüft.
- **Nicht getestet:** Live-Cloudflare-Synchronisierung und echte Geräte nach Installation.
