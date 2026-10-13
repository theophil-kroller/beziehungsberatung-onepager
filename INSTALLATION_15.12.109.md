# Beziehungsdynamiken 15.12.109 — Assessments (privater Test)

## Wichtig: zwei voneinander getrennte Updates

1. **Website**: `Beziehungsdynamiken_15.12.109_MINI_PATCH_WEBSITE.zip` im öffentlichen GitHub-Pages-Root entpacken/hochladen (nur die darin enthaltenen statischen Dateien). Dort liegt **kein einziger Assessment-Fragetext**. `Assessments` erscheint in der linken Praxisnavigation; in der Klientenakte erscheint der gleichnamige Reiter.
2. **Lokaler Secure Practice Vault**: `Beziehungsdynamiken_15.12.109_VAULT_SOURCE_PATCH.zip` enthält Änderungen an `vault/vault_server.py`, `vault/assessments_engine.py`, `vault/key_rotation.py` und die lokale Migration unter `vault/migrations/`. Nach einem Backup den laufenden lokalen Python-Vault **stoppen**, diese Dateien in der passenden bestehenden Projektinstallation ersetzen, Python-Abhängigkeiten aus `vault/requirements.txt` kontrollieren und den lokalen Python-Vault neu starten. Bei der ersten Assessment-Anfrage werden ausschließlich die neuen SQLite-Tabellen automatisch angelegt. Der vorhandene Inhalt wird nicht verändert.
3. **Installierte Windows-EXE / macOS-App**: Diese Source-Dateien ändern **keine bereits kompilierte EXE oder .app**! Ist der Vault als gebündelte Desktop-App installiert, muss er erst mit dem aktualisierten Source-Code auf dem jeweiligen Zielbetriebssystem neu gebaut und installiert werden. Für dieses Release wurden keine signierten Desktop-Binaries erstellt. Ein statisches Website-Update allein macht den lokalen Assessment-Endpunkt nicht verfügbar.
4. **Cloudflare Worker und D1**: Keine Änderungen, **keine D1-Migration**. Fragebogeninhalte, Antworten, Auswertungen und Teilnehmerpassphrasen dürfen nicht in D1, KV, öffentliche JS-Dateien oder GitHub hochgeladen werden.

## Testanleitung

1. Vorher den lokalen Vault sichern (verschlüsseltes Datenverzeichnis, nicht nur Source). Danach bei `http://127.0.0.1:47831/health` prüfen, dass `assessmentEngine: true` und `assessmentEngineVersion: 15.12.109` vorhanden sind.
2. Nach CRM-Anmeldung `Praxis → Assessments` öffnen. Ohne CRM-Anmeldung muss die Seite zum Login weiterleiten. Ohne Vault-Entsperrung sind keine Daten zugänglich.
3. Bibliothek ansehen: **Gottman Level 1, Gottman Level 2 und Relationship Checkup sind gesperrt**. Keine Originalfragen oder Übersetzungen sind mitgeliefert.
4. Wenn ein **eigenes, selbst entwickeltes und rechtmäßig nutzbares** instrument-spezifisches JSON vorhanden ist: nur lokal importieren; die Engine verlangt `source: "self_owned"`, `rightsConfirmed: true`, DE/EN-Texte und stabile Frage-IDs. Im Build wird kein Ersatzfragebogen mitgeliefert.
5. Private Durchführung mit zwei Personen und **unterschiedlichen Passphrasen mit mindestens 12 Zeichen** anlegen. Passphrasen sicher verwahren; ohne sie können die jeweiligen Antworten nicht wiederhergestellt werden.
6. Person A beantworten lassen, unterbrechen, mit eigener Passphrase fortfahren. Person B darf mit der eigenen Passphrase **nicht** Antworten von A lesen oder verändern können.
7. Beide Durchführungen abschließen. Zuerst nur Person A, dann Person B für **Themenübersicht** freigeben. Bis zur zweiten Freigabe darf keine gemeinsame Übersicht erscheinen.
8. **Einzelantworten** separat pro Person freigeben. Davor keine Detailgegenüberstellung; nach Freigabe beider Personen deskriptiver Item-Vergleich. Widerruf muss die Detailgegenüberstellung sofort entfernen.
9. Die PDF-Datei herunterladen; sie muss ohne einwilligungsbedingte Freigabe gesperrt bleiben und darf keine offiziellen Gottman-Scores ausweisen.
10. Ein CRM-**Testprofil** öffnen und den Reiter **Assessments** prüfen: Lokale Verknüpfung eines privaten Tests. Eine reguläre Klientenakte darf nicht beschrieben oder verknüpft werden. Die bestehende Dokumentation/Honorarnoten/Academy danach stichprobenartig prüfen.
11. Vault-Passwortänderung erst nach vollständigem Backup und getrenntem Test durchführen. Antworten der Teilnehmenden werden mit einem eigenen Schlüssel verschlüsselt; der Vault-Key-Rotation-Code wurde dafür angepasst.

## Betriebskonzept und Grenzen

- **Privater Modus**: implementiert. **Produktiver Modus**: bewusst deaktiviert. Keine öffentlichen Links und keine Klientenbuchung.
- **Mehrsprachig**: Deutsch+Englisch, Deutsch, Englisch. DE größere Schrift, EN zurückhaltender. Eine Antwort wird unabhängig von der Anzeige gespeichert.
- **Methodenbibliothek**: zukünftige Entität für prüfbare Empfehlungen vorbereitet; **keine automatisierte Interventionszuweisung**.
- **Praktitioner-/Vault-Isolation**: keine neue gemeinsame Cloud-Tabelle. Daten bleiben in der jeweiligen lokalen Vault-Datenbank. Eine verteilte Klientenplattform samt Einladungen, identitätsbasierter Teilnehmerauthentisierung und sicheren serverseitigen Freigaben erfordert vor Produktivstart eine separate Architekturprüfung.
- **Datenebene**: Teilnehmerpassphrase mit scrypt abgeleiteter AES-GCM-Schlüssel, getrennte verschlüsselte Antworten; nach ausdrücklicher Zustimmung wird eine separat mit dem Vault-Schlüssel verschlüsselte Freigabekopie erzeugt. Widerruf entfernt sie. Dies ist kein Schutz gegen vollständige Kompromittierung des Rechners/Prozesses.
- **PDF**: wird vom lokalen Vault erzeugt und erst nach Freigabe aller Themenübersichten bereitgestellt. Separate Einzelantworten-Freigaben gelten auch beim PDF.
- **Limitierung**: Es fehlen aktuell die beiden Original-Manuals in der verfügbaren Dateiumgebung und die bestätigten Wiederverwendungs-/Übersetzungsrechte. Deshalb keine Fragebogeninventur, keine Gottman-Fragen, keine Übersetzungen und keine offiziellen Berechnungen in diesem Build.
