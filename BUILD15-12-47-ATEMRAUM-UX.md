# Build 15.12.47 – Atemraum: Scrollfreiheit und sprechgenaue Textanzeige

Basis: 15.12.46. Kein Update von Cloudflare Worker, D1 oder lokalem Vault nötig.

## Änderungen
- Prestart-Dialog bleibt innerhalb der Bildschirmhöhe; keine eigene Scrollleiste im Startdialog.
- Die Zweckbeschreibung kann als eigene überlagerte Infoansicht aufgeklappt werden.
- Während eines Audioclips steht dessen vollständige Transkription statisch im Textfeld. Es gibt keine zeitgesteuerten Umbrüche mitten im Satz.
- Während Musik/Stille bleibt das Sprechertextfeld leer. Beenden/Pause löschen es ebenfalls.
- Ein Phasenwechsel wartet nötigenfalls, bis die aktuelle Ansage einschließlich angehängter Clips vollständig beendet wurde.
- Die Textgröße passt sich dem verfügbaren Platz an, ohne die Steuerung zu verdecken.
- Visualisierungen, Zwecktexte, die 14 CC0-Musiktitel und die A–E-Sprachbibliothek bleiben unverändert.

## Testhinweis
Auf kleinen Browserfenstern und beim Öffnen der Kurzanleitung prüfen. Besonders längere Audioansagen (z.B. E063/E077) vollständig anhören. Mit Strg+Shift+R neu laden und kontrollieren, dass die JS/CSS-URLs v=15.12.47 tragen.
