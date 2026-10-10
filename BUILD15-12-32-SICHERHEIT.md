# Beziehungsdynamiken Build 15.12.32 – Vault-Passwort & optionale 2FA

## Enthalten

### Lokaler Vault – Passwort ändern

Unter **Secure Practice Vault → Gerät & Wiederherstellung → „Vault-Passwort ändern“**. Benötigt den bereits entsperrten Vault und das aktuelle Passwort. Das neue Passwort muss mindestens 16 Zeichen lang sein.

Der Vorgang erzeugt einen neuen scrypt-Schlüssel samt Salt, verschlüsselt den lokalen SQLite-Datenbestand und die zugehörigen verschlüsselten Mediendateien in einer **separaten Staging-Kopie**, prüft die Integrität und tauscht erst danach das Datenverzeichnis aus. Alte lokale Bearer-Token verlieren ihre Gültigkeit. Der persönliche Workspace-Schlüssel bleibt inhaltlich gleich und wird unter dem neuen Vault-Schlüssel erneut verschlüsselt.

Vorher: Whisper und lokale KI beenden, andere Vault-Fenster schließen und ein funktionierendes externes Backup sicherstellen. Bei Fehlern vor der Datenübernahme bleibt der alte Datenstand erhalten. Eine verschlüsselte Rückfallsicherung wird neben dem Datenverzeichnis in einem Ordner mit Suffix `-pre-rekey-...` gespeichert und benötigt **das bisherige Passwort**. Sie sollte nach einer erfolgreichen neuen Sicherung unter neuem Passwort anhand eurer Aufbewahrungsregeln geschützt entfernt werden. Die Cloud-Backups werden nicht automatisch neu verschlüsselt; erstellt anschließend ein neues Cloud-Backup.

**Wenn das vorherige Passwort bereits in fremden Händen ist:** Alte Sicherheitskopien und ältere Cloud-Backups können weiterhin unter diesem Passwort zugänglich sein. Beim Verdacht auf tatsächlich kompromittierten Zugriff müssen zusätzlich betroffene Geräte, Sitzungen und Backups überprüft/widerrufen werden.

### Praxis-Login – TOTP-Zwei-Faktor-Schutz

* Systemweit zunächst **AUS**. Das heutige E-Mail-Login bleibt unverändert.
* Jedes Teammitglied kann unter **Einstellungen → Zwei-Faktor-Authentifizierung** eine eigene Authenticator-App registrieren, **nachdem** die Datenbankmigration und ein Cloudflare-Secret eingerichtet wurden.
* Bei erfolgreicher Registrierung werden **8 kryptografisch zufällige Wiederherstellungscodes** einmalig angezeigt. Beim Login kann statt des sechsstelligen Codes jeweils einer dieser Codes verwendet werden; er wird nach erfolgreicher Verwendung serverseitig als verbraucht markiert. Sicher speichern!
* **Nur der Owner** kann über ein Häkchen die 2FA-Pflicht aktivieren. Der Worker verweigert die Aktivierung, solange mindestens ein aktives Teammitglied ohne eingerichteten Authenticator/Wiederherstellungscodes ist.
* Nach Aktivierung gilt: erst einmaliger E-Mail-Link, dann sechsstelliger zeitbasierter TOTP-Code oder einmaliger Wiederherstellungscode. Aktive Sitzungen werden beim Aktivieren widerrufen. Der alternative reine Mobile-Code-Login wird bei aktiver 2FA gesperrt; das persönliche Login per E-Mail-Link ist weiterhin nutzbar.
* Authenticator-Geheimnisse liegen **AES-256-GCM-verschlüsselt in D1**, wobei der Verschlüsselungsschlüssel nur als Cloudflare-Secret gespeichert wird. Die Wiederherstellungscodes liegen nur als SHA-256-Prüfsummen in D1.
* Kein dauerhaftes Polling: Zwei-Faktor-Prüfungen erfolgen nur bei Anmeldungen und manueller Änderung der Einstellungen.

## Erforderliche Reihenfolge für produktive 2FA

1. **Zuerst** auf Cloudflare D1 die neue Migration `database/migrations/015_12_32_mfa.sql` ausführen.
2. Im Cloudflare Worker ein geheimes Umgebungs-Secret `BD_MFA_MASTER_KEY` setzen. Es muss aus **32 Zufallsbytes** bestehen, Base64-kodiert (kein normales Passwort). Beispiel zur Erzeugung *auf deinem eigenen Computer*: `python3 -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"`. **Niemals** in das öffentliche GitHub-Repository, Chats, Logs oder Screenshots kopieren. Das Secret sicher sichern; Verlust verhindert Entschlüsselung bestehender Authenticator-Geheimnisse.
3. Danach Worker `cloudflare-worker/worker.js` aus diesem Build deployen.
4. Die aktualisierten Webdateien `admin.html`, `admin-build9.js`, `admin-build15-1.js` veröffentlichen. Bei Desktop-Installationen gilt die entsprechende Spiegelversion.
5. Zunächst mit **ausgeschaltetem Häkchen** testen. Jede Person richtet ihren Authenticator und die einmaligen Wiederherstellungscodes ein. Dann mit dem Owner-Login die Pflicht aktivieren und Anmelde-/Wiederherstellungstest durchführen.

**Wichtig:** Das Häkchen ist derzeit bewusst nicht standardmäßig gesetzt. Vor der Aktivierung auf einem echten Konto müssen Authenticator, Backups und Wiederherstellungscodes getestet sein. Beim Verlust sowohl der Authenticator-App als auch aller Codes ist administrativer Eingriff in D1 notwendig.

## Tests im Entwicklungscontainer

* Python/JavaScript-Syntax geprüft.
* Simulierter Vault mit verschlüsseltem Datenbankfeld, Artefakt, Diktat und Workspace-Metadaten erfolgreich vollständig neu verschlüsselt; altes Passwort danach abgewiesen, neues akzeptiert.
* Simulierter beschädigter Datensatz: Passwortrotation stoppt vor der Übernahme und lässt den alten Vault lesbar.
* TOTP gegen RFC-6238-Testwert geprüft; AES-GCM-Speicherungstest erfolgreich.

**Nicht live verifiziert:** Echte Macs/Windows-Installationen mit bereits gewachsenen Datenbeständen; vollständiger Browser-zu-Worker-D1-Anmeldetest; Cloudflare-Deployment. Vor der Verwendung mit echten Klientenakten ein aktuelles Backup und einen Test mit einem leeren bzw. anonymisierten Test-Vault durchführen.
