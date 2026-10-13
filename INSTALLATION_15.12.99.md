# INSTALLATION · BUILD 15.12.99

## Einordnung
Build 15.12.99 erweitert die Academy entlang der bestehenden 15.12.x-Linie um ein weiteres Gottman-Level-2-Modul und enthält zusätzlich zwei UI-Korrekturen im Frontend.

## Enthalten
- Landing Page Header mit neuem Logo-Lockup (`public/bd-logo-lockup.png`)
- Aufgewertete Admin-Login-Seite (`desktop-login.html`)
- Neues Academy-Modul: `gottman-fondness-trainer15-12-99.html`
- Daten / Engine / Styles:
  - `gottman-fondness-data99.js`
  - `gottman-fondness-game99.js`
  - `gottman-fondness-game99.css`

## Optionaler Cloud-Betrieb
Für reinen lokalen Betrieb ist keine Migration notwendig.
Falls produktiver Cloud-Lernstand / Owner-Freigaben genutzt werden, müssen `academy-cloud78.js` und der zugehörige Web-Stand mit ausgeliefert werden, damit `gottmanfondness` erkannt wird.

## Cache-Hinweis
Weil ein neues Academy-Modul dazukommt, Browser-Cache bzw. Service Worker nach Deployment einmal hart aktualisieren.
