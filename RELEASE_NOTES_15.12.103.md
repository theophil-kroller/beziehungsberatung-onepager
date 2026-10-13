# Beziehungsdynamiken · Build 15.12.103 · Security & Ripple Gate

## Korrigierter Vorschau-Logo-Pfad
Die live angezeigte private Landing Page wird durch `site-mode15-5.js` erzeugt, nicht durch die Headermarke in `index.html`. Der Preview-Renderer verwendet jetzt genau `public/Beziehungsdynmiken_logo_colour.png`, dasselbe Bild wie der CRM-Admin. Die bisherigen zwei künstlich gezeichneten Kreise entfallen. Auch die Header-Marke der späteren Vollbetrieb-Startseite (`index.html`) verwendet jetzt das Admin-Logo. Vorschau-CSS und JS sind cache-busted.

## Browser-Sitzung und Zugangsgating
- `hub.html`, `message-center.html`, `methods.html`, `workshops.html`, `newsletter-admin.html` blenden das gesamte UI **vor dem Rendern** aus und prüfen per geschütztem `/admin/me` den CRM-Session-Token.
- Fehlt die Sitzung oder schlägt die Verifizierung fehl, folgt ein Redirect zu `admin.html?next=...`; der Rückweg wird nur nach erfolgreichem CRM-Dashboard-Ladevorgang ausgeführt, same-origin allowlist.
- Die Admin-Sidebar bleibt vor erfolgreicher CRM-Authentifizierung ausgeblendet.
- Message Center: `[hidden]` gewinnt gegen `display:grid`; die unberechtigte Inbox ist nicht mehr sichtbar.
- Local Desktop (127.0.0.1:47832) bleibt im bestehenden lokalen Offline-Modell; dessen Sicherheitsgrenzen sind separat zu auditieren.

## Portal
Sehr langsames Atmen der bestehenden Kreise. Ein einzelner Wasser-Tropfenimpuls bei Fokus oder Klick; `prefers-reduced-motion` schaltet alle Animationen aus.

## Wichtige Sicherheitsgrenzen
Die UI-Sperre ersetzt **keine** serverseitige Zugangskontrolle. HTML, CSS und JS bleiben auf GitHub Pages als statische Dateien öffentlich abrufbar. Sensible Daten dürfen ausschließlich über serverseitig autorisierte Endpunkte oder den lokal authentifizierten Vault bereitgestellt werden. Der vorhandene Worker `/admin/me` verwendet `requireAdminSession`; ein vollständiger API- und Vault-Penetrationstest fand hier nicht statt.

## Academy
Keine neue Academy-Einheit in 15.12.103; bestehende Fortschritte und Inhalte unverändert.
