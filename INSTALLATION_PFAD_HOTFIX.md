# 15.12.93.1 — Pfad-Hotfix für Academy-Welten

## Ursache

`academy-world74.css` zeichnete den Weg mit einem festen, 1.600 Pixel hohen SVG und `no-repeat`. Bei mehr als etwa neun Modulen endete die sichtbare Linie, obwohl weitere Modul-Karten gerendert wurden.

## Korrektur

* Ein wiederholbares, nahtlos anschließendes 340-Pixel-SVG-Muster wächst visuell mit der `.journey-track`-Höhe – unabhängig von der Zahl der Module.
* Zentrierung auf Desktop sowie versetzte Positionierung auf Smartphones angepasst.
* Die eigens gestalteten Pfade der Welten **Glut** und **Verkörperung** bleiben unverändert; sie verwenden bereits wiederholbare Motive.
* CSS-Cache-Busting in der Academy-Seite aktualisiert. Der Service Worker bleibt unverändert.

## Installation

Entpacke `Beziehungsdynamiken_15.12.93.1_PFAD_HOTFIX_WEBSITE.zip` und kopiere die beiden enthaltenen Webdateien unter Beibehaltung ihrer Dateinamen in das GitHub-Pages-Repository. Bestehende Dateien überschreiben, committen und die GitHub-Pages-Veröffentlichung abwarten. Anschließend Academy mit Strg+F5 neu laden.

Geänderte Dateien:

1. `academy-world74.css`
2. `academy-world15-12-74.html`

**Kein D1-, Cloudflare-Worker-, Lernstand- oder Vault-Update notwendig.** Die Korrektur wird mit dem nächsten vollständigen Build weitergeführt.
