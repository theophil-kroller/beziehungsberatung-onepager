# Beziehungsdynamiken 15.12.65: Capture-Pausen und Desktop-Updates

## Capture – auf Android und iPhone

- In `capture.html` gibt es nun einen eigenen Bereich **Eine kleine Pause**: Atemraum und Seifenblasen nebeneinander.
- Auch im Capture-Menü kann man die Seifenblasen öffnen.
- Die vorhandene Cockpit-Spiel-Engine wird wiederverwendet, inklusive Tempo, Musik, Saboteuren, Satzmomenten und lokalen Rekorden.
- Während aktiver oder noch nicht abgeschlossener Capture-Audioaufnahme wird der Spielstart verhindert. Keine Änderung an gespeicherten Captures oder Verschlüsselung.
- Das Spiel schließt als Overlay und kehrt zu Capture zurück. Musik stoppt beim Schließen (Logik der vorhandenen Engine).
- Service-Worker-Cache auf `bd-capture-15-12-65` aktualisiert und die zwei vorhandenen Atemraum-Musiktitel für den Offline-Cache vorgesehen. Der Cache gilt nur für Capture-Ressourcen; andere Seiten der Website werden nicht von Capture übernommen.
- **iPhone:** Safari → https://beziehungsdynamiken.at/capture.html → Teilen → Zum Home-Bildschirm → Hinzufügen. Mobile Browser-Simulation ist kein iOS-Safari-Praxistest.

## Desktop-Update-Manager

- Die einmal tägliche, ETag-gestützte GitHub-Releaseprüfung bleibt erhalten (kein Cloudflare-Traffic).
- Neue kompatible Release-Archive mit vom GitHub-API angegebenem SHA-256-Digest werden im lokalen Benutzercache automatisch heruntergeladen und verifiziert.
- Downloadgröße ist auf 250 MiB begrenzt; unerwartete Dateigröße, fehlerhafter Digest, ungültige ZIPs, Dateipfad-Traversal und ZIP-Symlinks werden abgewiesen.
- Im Desktop unter **Vault-Verwaltung → App-Downloads & Versionen** wird der Vorbereitungsstatus angezeigt. Geprüfte ZIPs können dort lokal heruntergeladen werden; Installation erfolgt nach bewusster Bestätigung wie bisher.
- **Kein unbeaufsichtigter Auto-Installer**: GitHub-Checksummen erkennen beschädigte Bytes, aber sind keine unabhängig verifizierte Herausgeber-Signatur. Die Apps werden aktuell ohne Code-Signierung ausgeliefert; die Mac-App ist nicht Apple-notarisiert. Ein automatisches Ausführen bleibt aus Sicherheitsgründen ausdrücklich gesperrt.
- Für echte Ein-Klick- oder automatische Installationen benötigen wir einen geschützten Release-Signaturschlüssel, angepinnte Ed25519-Verifikationslogik im Launcher, einen sicheren Installer mit atomarem Wechsel/Rollback und auf macOS signierte/notarisierte Pakete. Schlüssel gehören nicht in GitHub-Releases, Website oder ZIPs.
- **Vault:** Lokale Daten, Datenbank und Schlüssel werden nicht in den Downloadcache geschrieben und nicht verändert. Kein Worker-/D1-Update.

## Auslieferung

1. **Website und Capture-PWA:** ZIP `Beziehungsdynamiken_15.12.65_NUR_WEBSITE.zip` im bestehenden GitHub-Pages-Repository aktualisieren; bei alter PWA nach dem Öffnen neu laden. Die betroffenen Dateien sind `capture.html`, `capture.js`, `capture.css`, `capture-sw.js` sowie die unveränderte, aber mitgelieferte Bubble-Engine in JS/CSS. `admin.html` und `admin-desktop-updates15-12-52.js` aktualisieren die Updateanzeige.
2. **Windows-App:** Desktop schließen, EXE aus `Beziehungsdynamiken_WINDOWS_15.12.65.zip` einsetzen; nicht den Vault-Speicherordner ersetzen. Neue Desktop-UI und Update-Downloadvorbereitung nur nach neuer Installation aktiv.
3. **Mac M1:** Neue `Beziehungsdynamiken.app` aus `Beziehungsdynamiken_MAC_M1_15.12.65.zip` einsetzen. App ist weiterhin nicht signiert oder notarisiert.
4. **Patch** ist ein gezieltes Update mit Windows-EXE und den betroffenen Quell-/Web-Dateien. **Full-Build** ist der kumulative komplette Projektstand. Bei selbst vorgenommenen Änderungen vorher vergleichen.

## Getestet

- `go test ./...` inklusive SHA-256-Positiv-/Negativtest, ungültige Archive, nicht vertrauenswürdige Downloadquelle.
- Windows amd64 und macOS arm64 erfolgreich kompiliert (kein Gerätestarttest).
- Browser-UI (Chromium mit isoliertem DOM) bei 375×667, 390×844 und 1366×768: Spiel öffnet/schließt, beide Menü-/Startseiten-Einstiege, kein Überlaufen der Dialoggröße.
- JavaScript-Syntax von Capture, Bubble-Spiel, Service Worker und Desktop-Update-UI geprüft; ZIP-Archive CRC-geprüft.
- **Nicht getestet:** echtes iPhone/iOS Safari, reales GitHub-Release mit SHA-256, Installation auf Windows/macOS, Aufnahmegerät-Kopplung, geräteübergreifender Rekord mit Live-Worker.

Hinweis: Die Teamkalender-Freigabe aus 15.12.63 benötigt weiterhin den separat bereitgestellten Cloudflare-Worker, falls bisher nicht ausgerollt. Die Cloud-Rekord-Synchronisation aus 15.12.61 benötigt ebenso das damalige separate Worker-/D1-Update.
