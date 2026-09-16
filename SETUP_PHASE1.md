# Beziehungsdynamiken – Booking MVP Phase 1

## Was in diesem Paket bereits funktioniert

1. `booking.html` / `booking-en.html`
   - Auswahl Einzelberatung (60 Min.) / Paarberatung (90 Min.)
   - Online / Graz
   - Datum und Uhrzeit
   - Name + E-Mail
   - Kalenderdatei (.ics) nach der Buchung
   - aktuell standardmäßig im **Demo-Modus**

2. `index.html` und `en.html`
   - die bisherigen Cal.eu-Links zeigen jetzt auf die neue eigene Buchungsseite.

3. `public/angebot-paarberatung.jpg`
   - ersetzt das bisherige Paarberatungsbild durch das neue Bild mit dem Mann.
   - Der Dateiname ist absichtlich identisch: einfach die alte Datei überschreiben.

4. `cloudflare-worker/worker.js`
   - Backend-Vorlage für die echte Google-Calendar-Anbindung.
   - prüft freie Zeiten über Google Calendar FreeBusy
   - legt nach Buchung einen Google-Kalendertermin an
   - sendet via Google Calendar eine Einladung an die angegebene E-Mail-Adresse
   - fragt **keinen Beratungsgrund** ab

## Test-Einstellungen

- Einzelberatung: 60 Minuten
- Paarberatung: 90 Minuten
- Puffer: 15 Minuten
- Mindestvorlauf: 24 Stunden
- Buchbar: bis 42 Tage im Voraus
- Test-Verfügbarkeit im Worker:
  - Dienstag 14:00–19:00
  - Donnerstag 09:00–13:00
- Zeitzone: Europe/Vienna

Diese Werte sind absichtlich leicht im Code änderbar.

## Was du jetzt sofort auf GitHub hochladen kannst

Im Root des Repositories:
- `index.html`
- `en.html`
- `booking.html`
- `booking-en.html`
- `booking-config.js`

In `/public`:
- `angebot-paarberatung.jpg` (bestehende Datei ersetzen)

Danach ist die neue Buchungsseite sichtbar. Solange `demoMode: true` gesetzt ist,
werden nur Testzeiten angezeigt und es wird noch kein echter Kalendereintrag erzeugt.

## Für die echte Google-Kalender-Verbindung brauche ich als nächsten Schritt NICHT dein Passwort.

Du richtest die Google Calendar API einmal ein. Danach kommen diese vier Werte als
**Cloudflare Secrets** direkt in Cloudflare, nicht in GitHub und nicht in HTML:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- optional `GOOGLE_CALENDAR_ID` (für deinen Hauptkalender genügt `primary`)

Zusätzlich:
- `ALLOWED_ORIGIN=https://www.beziehungsdynamiken.at`

Wenn der Worker deployed ist, trägst du nur seine URL in `booking-config.js` ein:

```js
apiBaseUrl: "https://DEIN-WORKER.workers.dev",
demoMode: false,
```

Dann fragt die Buchungsseite echte freie Zeiten ab und trägt echte Termine ein.

## Datenschutz / Sicherheit

- Keine API-Secrets liegen auf GitHub Pages.
- Im Formular werden für V1 nur Name, E-Mail, Terminart, Ort und Zeit abgefragt.
- Kein Beratungsgrund und keine persönlichen Beratungsnotizen.
- Vor einer produktiven Veröffentlichung sollte der Datenschutztext um
  Terminbuchung / Google Calendar / Cloudflare ergänzt werden.

## Nächster technischer Schritt

Google Calendar API + OAuth-Zugang einrichten und den Worker in deinem bereits
angelegten Cloudflare-Account deployen. Erst danach schalten wir `demoMode` aus.


## Phase 2 Ergänzungen

Diese Version enthält zusätzlich:

- CTA auf der Website: **Termin vereinbaren**
- Englisch: **Book an appointment**
- bessere Google-Kalendertitel:
  - Einzelberatung – Theophil Kroller
  - Paarberatung – Theophil Kroller
- bei Online-Terminen automatische Google-Meet-Erstellung
- eigene Bestätigungsmail über Resend
- Signatur: **Liebe Grüße, Theophil**
- Mail-Absender steuerbar über Cloudflare Variable `MAIL_FROM`

### Zusätzliche Cloudflare-Secrets/Variablen

Secret:
- `RESEND_API_KEY`

Normale Variable:
- `MAIL_FROM` z. B. `Beziehungsdynamiken <hallo@beziehungsdynamiken.at>`

Vor Nutzung der Mailfunktion muss `beziehungsdynamiken.at` in Resend verifiziert sein.
