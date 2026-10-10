# Build 15.12.46 – Advanced-Visualisierungen und Erklärungstexte

Basis: Full 15.12.45. Nur UI-Dateien, keine Backend-, Vault-, Sprach- oder Musikänderungen.

## Ursache und Reparatur
- In 15.12.45 wurden `advanced-visuals15-12-39.js` und `.css` im deutschen/englischen Memberportal geladen, jedoch **nicht** in `capture.html` und `breath-standalone15-12-18.html`. Dadurch fiel die Advanced-Darstellung dort auf die alte generische Körperskizze zurück.
- 15.12.46 bindet dieselben übungsspezifischen Assets in **allen vier** Einstiegspunkten ein (Root, Desktop-App-Web, ggf. Desktop-Root) und erneuert die Versionsparameter für Browsercaches.
- 17 Technik-Visualisierungen bleiben erhalten. Das jeweilige Phasen-Marker-Update der vorhandenen Visualisierungsengine bleibt aktiv.
- Zweck und Kurzbeschreibung stehen jetzt vor dem Start sichtbar, statt durch den generischen `soloSafetyNote`-Hinweis überschrieben zu werden.
- Bei Advanced ist die bestehende Kurzanleitung vor dem Start standardmäßig aufgeklappt. Während der Sitzung bleibt diese Zusatzfläche geschlossen; der laufende Text wird weiterhin in kurzen Abschnitten und ohne eigene Scrollleiste angezeigt.

## Installation
PATCH über die Website-Dateien von Build 15.12.45 kopieren und die geänderten statischen Web-Dateien in GitHub veröffentlichen. Kein Cloudflare-D1-/Worker-Deployment nötig. Danach harter Reload bzw. Browsercache leeren. Die Klientendaten-/Vault-Anzeige wird von diesem Patch nicht verändert.

## Tests
Kritische asset references, 17 visual renderer keys, purpose texts, HTML startup ordering, JS syntax, ZIP CRC, consistency across web and desktop, isolated browser check.

## 15.12.46 – Audio/Text-Synchronität (Nachbesserung)
- In Advanced-Sessions erscheint ein Transkript ausschließlich, solange der zugehörige Audioclip abgespielt wird.
- Am Clip-Ende, bei Fehler, Phasen ohne Stimme und beim Beenden wird der Text gelöscht.
- Übergangs- und Phasenlabels bleiben in der separaten Fortschrittsanzeige, nicht als fälschlich gesprochener Text.
- Kurze Textseiten wechseln während längerer Sprachansagen automatisch; ohne Scrollleiste.
- Audio selbst und die Zuordnungen bleiben unverändert.
