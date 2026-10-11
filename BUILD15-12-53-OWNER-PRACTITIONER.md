# Beziehungsdynamiken BUILD 15.12.53 – Owner kann fachliches Practitioner-Profil nachtraeglich aendern

## Fehlerbehebung
- In Einstellungen / Praxis-Team / Bearbeiten kann ein Owner "Fachlich als Practitioner taetig" bei bestehenden Teammitgliedern jetzt nachtraeglich an- und abwaehlen.
- Die Cloud-Speicherfunktion legt fuer einen bereits registrierten User ein neues fachliches Practitioner-Profil an, wenn noch keines vorhanden ist. Es wird KEIN neuer Login angelegt und KEINE Einladung versendet.
- Fachbereich, tatsaechlicher Qualifikationsstatus, Berufsbezeichnung und optionale Registrierungsnummer werden als historisierbare Credential-Datensaetze gespeichert.
- Der Benutzername, Praxiszugehoerigkeit und die Daten des vorherigen Logins bleiben erhalten. Bereits existierende Profile werden reaktiviert, nicht verdoppelt.
- Abwaehlen PAUSIERT das Profil; alte Fall-, Rechnungs- und Cloud-Vault-Verknuepfungen bleiben erhalten. Bisherige Sessions werden bei einem Rollenwechsel invalidiert, erneute Anmeldung erforderlich.
- Bei der ersten Aktivierung wird, sofern die bisherige Migration 15.1 angewendet wurde, eine persoenliche Cloud-Vault-ID zugeordnet. Der lokale verschluesselte Vault wird nicht neu eingerichtet oder ueberschrieben.
- Methoden-Workspace-Schluessel, Newsletter und der separate Python-Vault-Updater sind in diesem Build NICHT repariert oder geaendert.

## ERFORDERLICH: Cloudflare Worker aktualisieren!
Dies ist KEIN reiner Desktop-Fix. Der Cloudflare-Worker muss fuer den geaenderten POST /admin/team/member/save auf den 15.12.53-Stand gebracht werden.

1. VORHER: Aktuellen Worker und die D1-Datenbank sichern (inklusive Schema und regelmaessiger Backupstrategie).
2. Im PATCH ist `cloudflare-worker/worker.js`. Diese Datei als aktuellen Worker-Code auf die bestehende Worker-Anwendung DEPLOYEN. Vorhandene Secrets und Bindings (DB, BOOKINGS, R2, etc.) nicht aendern; KEINEN zweiten Worker erstellen.
3. Danach die statischen Frontend-Dateien `admin-build15-0.js` und `admin.html` auf dem verwendeten Hosting aktualisieren. Die zweite Kopie in `desktop/app/web/` dient dem lokalen Desktop-Frontend.
4. Bei Mac/Windows-Desktop-Nutzung 15.12.53 installieren, damit die lokale Oberflaeche diese Aenderung enthaelt. Fuer rein gehostete Admin-Seite genuegen Worker + HTML/JS.
5. Als Owner neu anmelden, Einstellungen > Praxis-Team > Ilona bearbeiten, Haken aktivieren, passenden tatsaechlichen Fachbereich und Qualifikationsstatus pruefen, speichern.
6. Danach wird Ilonas bestehende Sitzung aus Sicherheitsgruenden ungueltig; auf dem Mac neu anmelden. Einstellungen > Betrieb & Zuordnung > Aktualisieren pruefen.
7. Gemeinsame Methoden bleiben unabhaengig vom fachlichen Haken: Bei 'Load failed' noch NICHT unkontrolliert synchronisieren. Der local Python Vault auf Ilonas Mac kann weiter Stand 15.12.32 haben und muss separat gepflegt werden.

## Dateien
- PATCH_WINDOWS.zip: geaenderter Worker, UI, Desktop-Quellen, Versionsdateien, Windows-Binary, Tests, Dokumentation. Ueber bestehenden FULL-Build kopieren (Ordnerstrukturen beibehalten).
- FULL_WINDOWS.zip: Vollstaendiger Projektcode auf Basis 15.12.50 inklusive Update-Manager 15.12.52 und Korrektur 15.12.53, plus neuer Windows-Launcher. Die oeffentlichen Medien im Root assets/audio bleiben fuer GitHub Pages erhalten. Duplizierte Medien im eingebetteten Desktop-Web-Verzeichnis und alte Download-EXE-Dateien wurden weggelassen, um das Archiv kleiner zu halten. Fuer voellige Offline-Mediennutzung ist weiterhin `Beziehungsdynamiken_MEDIEN_OFFLINE_15.12.50_EINMALIG.zip` optional erforderlich.
- WINDOWS_15.12.53_OWNER_PROFILE.zip: Nur der neue schlanke Windows-Launcher.
- MAC_M1_15.12.53_OWNER_PROFILE.zip: M1/Apple Silicon .app und lokaler DMG-Ersteller (nur auf Mac, nicht signiert/notarisiert).

## Sicherheit & Grenzen
- Niemals vorhandene lokale Vault-Datenordner, Vault-Passwoerter oder Cloud-Backups durch die Anwendungspakete ersetzen oder neu initialisieren.
- Personen nur dann als fachlich taetig aktivieren, wenn sie tatsaechlich in der entsprechenden Rolle arbeiten. Der Qualifikationsstatus ist fachlich/rechtlich relevant.
- Das Abschalten deaktiviert die fachliche Identitaet, loescht aber aus Gruenden der Nachvollziehbarkeit keine Belege, alten Akten-/Billing-Bezuege oder Vault-Identitaeten.
- Pre-release: Windows/Mac aus Linux kreuzkompiliert. Keine reale Geraete- oder Cloudflare-Livepruefung erfolgt. Nur nach gesichertem Backup und bei getrennter Testmoeglichkeit ausrollen.
- Der Cloudflare Worker wird durch das Herunterladen oder das Veröffentlichen auf GitHub NICHT automatisch deployt.
- Eine gleichzeitige Profilumstellung durch mehrere Owner ist ohne weitere D1-Transaktionsschutzmassnahmen derzeit nicht garantiert; nur einmalig nacheinander ausfuehren.

## Technische Tests
- Node.js Syntaxpruefung von Worker und Team-UI.
- Node.js mit SQLite-Simulation: Aktivieren, Speichern, Deaktivieren/Reaktivieren, ID-Stabilitaet, fachliche Credentials, Cloud-Vault-Provisioning, Sessioninvalidierung, Nicht-Owner-Abweisung, doppelte Erstellung verhindert.
- Go-Unit-Tests und Windows/macOS-Cross-Compile.
- Archivintegritaet und SHA-256-Checksummen.
