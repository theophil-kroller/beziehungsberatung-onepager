# Beziehungsdynamiken 15.12.57 – Private Preview & Seifenblasen-Spiel v2

## Was neu ist

- **Private Preview** (die öffentliche Warteseite von `index.html` bei `site-mode=private`): eigenständige Premium-Teaser-Gestaltung. 30 Sekunden interaktive Seifenblasen mit sichtbarem Platzen bei Klick/Touch. Zum Ende platzen alle verbleibenden Seifenblasen. „Noch einmal“ startet die Szene erneut.
- **Spiel:** sechs Blasen bereits beim Öffnen im Spielfeld, in den ersten vier Sekunden schnellerer Nachschub, danach beruhigte Spawnrate; stärkere Pop-Animation mit Doppelring, Lichttröpfchen und aufsteigender Punktezahl.
- **Cockpit:** Seifenblasen-Button nur als Symbol mit zugänglichem Tooltip/Label; „Atemraum“ steht an der dampfenden Tasse. Der dekorative 5-Sekunden-Effekt bleibt unverändert.

## Website / GitHub Pages

Die folgenden Dateien im **Hauptverzeichnis** des aktiven GitHub-Pages-Zweigs aktualisieren:

1. `index.html` (Versionsparameter des Site-Mode-Skripts)
2. `site-mode15-5.js` (Teaser-Markup; Zugriffssperre der Private-Preview bleibt erhalten)
3. `private-preview15-12-57.css` (NEU)
4. `private-preview15-12-57.js` (NEU)
5. `admin.html` (Cockpit-Symbol und Versionen)
6. `cockpit-bubble-game15-12-56.js` (Spiel v2, Name absichtlich stabil)
7. `cockpit-bubble-game15-12-56.css` (Icon-only, Name absichtlich stabil)
8. `desktop-login.html` ist nur für die Desktop-Version relevant.

`index.html` und `admin.html` **nicht blind überschreiben**, falls zwischenzeitlich andere Änderungen auf GitHub vorgenommen wurden. In diesem Fall Versionsverweise und gezielte HTML-Änderungen mergen. Abwarten bis GitHub Pages deployed; Browser-Neuladen mit Strg+Umschalt+R.

**Kein Cloudflare-Worker-Deployment und keine D1-Migration** nötig. Der Modus wird weiterhin über den vorhandenen geschützten Site-Mode-Endpunkt entschieden. Private Preview bleibt `noindex,nofollow`, und die normalen Live-/Wissens-Seiten sind von der Animation unberührt. Fällt die Abfrage des Site-Modus aus, bleibt die Seite sicherheitshalber geschlossen.

## Desktop (getrennt von lokalem Vault)

Windows x64: `Beziehungsdynamiken_WINDOWS_15.12.57.zip` entpacken. EXE bei beendeter bisheriger App ersetzen. Mac Apple Silicon: `.app` aus `Beziehungsdynamiken_MAC_M1_15.12.57.zip` nach Programme ziehen, nachdem alle alten Prozesse beendet wurden. Der enthaltene DMG-Ersteller benötigt macOS und erzeugt ein **nicht signiertes** DMG; Apple-Signierung/Notarisierung fehlt weiterhin.

**Nicht neu initialisieren:** Der lokale Secure Practice Vault inklusive Passwort, Workspace-Code, Klientendaten, Whisper und LM Studio bleibt in seinem bisherigen getrennten Datenverzeichnis. Ein Launcher-Update aktualisiert den lokalen Python-Vault-Code weiterhin nicht automatisch.

## Tests / Grenzen

- JS-Syntaxprüfung: Site-Mode, Preview und Spiel bestanden.
- Visuell überprüft: Desktop 1440×900 und Mobile 390×844 (Preview); kein horizontales Scrollen. Der Preview-Replay-Knopf funktioniert.
- Browser-Spieltest: sofort erreichbare Blasen, Klick erhöht Punktestand, neue Runde setzt zurück, Schließen funktioniert.
- Go-Tests: bestanden; Windows x64 und macOS arm64 kompiliert.
- Echte Live-Cloud-/Gerätetests mit euren beiden Geräten ausstehend. Kein fertiges signiertes/notarisiertes macOS-DMG. Vollversion beinhaltet öffentliche Media-Assets; diese gehören nicht in den Secure Vault.

## GitHub Release

Optional als **Pre-release** `v15.12.57` beide Desktop-ZIPs hochladen. Der Release aktualisiert GitHub Pages oder installierte Apps nicht automatisch. Dieser Build hat keine Schema-/Workspace-Änderungen.
