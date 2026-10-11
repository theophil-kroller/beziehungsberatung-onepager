# Beziehungsdynamiken 15.12.58 – Private Preview, Cockpit-Formen & Pop-Sound

## Was neu ist

- Private-Preview-Startseite: direkt formuliert „Was zwischen uns wirklich los ist.“. Der bisherige obere Status „Im Entstehen“, generische Zweitüberschriften und redundante Textzeilen wurden entfernt. Interaktive Seifenblasen rechts: 30 Sekunden, danach platzen verbleibende Blasen. Keine neue D1-Migration.
- Auf Laptopgrößen ab circa 901px Breite und mindestens 560px Höhe keine vertikale Scrollbar bei 1280×720, 1366×768, 1440×900 (im Test). Kleinere Displays dürfen scrollbar bleiben.
- Impressum und Datenschutz im Private-Preview-Modus: **eigenständige, eingeschränkte Rechtsansicht** mit unveränderten Rechtstexten, ohne öffentliche Hauptnavigation oder Links zu Praxisangeboten. Der Private-Preview-Gate bleibt bestehen und wird nicht aufgehoben.
- Cockpit-Animation ca. 5 Sekunden: bei jedem Dashboard-Aufruf nacheinander Herz, frei schwebende Blasen, Stern, Mond, Sonne, vorbeiziehende Wolken (zyklisch pro Browser-Session). Leise, ohne Punkte; Nutzer mit `prefers-reduced-motion` werden respektiert.
- Seifenblasen-Spiel: kurzer, synthetischer Web-Audio-„Plopp“ beim erfolgreichen Treffer. Erzeugung **offline, ohne fremde Audiodatei**. Ein-/Aus-Schalter unten im Overlay, lokal gespeicherte Präferenz. Sound beginnt erst durch Benutzeraktion; Browser/Systemlautstärke kann Ton unterdrücken.

## Website-Deployment (GitHub Pages)

Die im Patch enthaltenen Hauptverzeichnis-Dateien aktualisieren (bestehende Änderungen falls nötig mergen):
`index.html`, `impressum.html`, `datenschutz.html`, `widerruf.html`, `site-mode15-5.js`, `private-preview15-12-57.css`, `admin.html`, `cockpit-bubbles15-12-55.js`, `cockpit-bubble-game15-12-56.js`, `cockpit-bubble-game15-12-56.css`.
`private-preview15-12-57.js` bleibt funktional unverändert, soll aber vorhanden sein.

**Wichtig:** Der Code fragt den aktiven Site-Modus weiter vom Worker ab. Die private Website darf nicht durch direktes Ausliefern des vollen Live-HTMLs sichtbar werden. Der Modus wird im Browser als erste Schutzschicht dargestellt; echte interne Daten müssen weiterhin ausschließlich serverseitig autorisiert sein. Im Live-Modus bleiben Impressum, Datenschutz und Website wie bisher zugänglich.

**Worker und D1:** keine Änderungen erforderlich.

## Desktop-Anwendungen

Windows x64: `Beziehungsdynamiken_WINDOWS_15.12.58.zip`, EXE nur nach Beenden der alten App austauschen.
macOS M1/M2/M3 (Apple Silicon): `Beziehungsdynamiken_MAC_M1_15.12.58.zip` enthält `Beziehungsdynamiken.app` und einen Mac-`DMG_ERSTELLEN_M1.command` für `hdiutil`; kein bereits signiertes DMG. Vor Ersetzen vollständig beenden. Secure Vault und Workspace-Schlüssel nicht löschen, neu initialisieren oder verschieben.

**Wichtig:** App-/Launcher-Version ist nicht dasselbe wie der lokal installierte Python-Vault-Code. Diese Version verändert den lokalen Vault und Cloud-Methodensync nicht.

## Tests und Grenzen

- JS-Syntax: bestanden.
- Browser-Vorschau: 1280×720, 1366×768, 1440×900 und 390×844 geprüft; kein horizontaler Scrollbalken; kein vertikaler Scrollbalken bei den drei Laptopformaten.
- Cockpit: alle sechs Formationen zyklisch aktiviert.
- Spiel: Dialog, Ton-Schalter und Treffer/Punkte im Chromium-Browsertest erfolgreich. **Akustische Klangqualität** nicht auf echten Lautsprechern/Mac verifiziert.
- Go-Tests bestanden; Windows x64 und macOS arm64 nativ cross-kompiliert. Kein echter Mac-GUI-Test und keine Apple-Signierung/Notarisierung.
- Bei Änderungen an den Rechtsseiten bitte rechtliche Texte separat prüfen; der Patch verändert nur die Anzeige im Private-Preview-Modus.

## Releases

Die beiden Desktop-ZIPs können als Pre-release `v15.12.58` in GitHub Releases hochgeladen werden. Ein GitHub Release aktualisiert GitHub Pages bzw. die installierten Apps **nicht automatisch**.
