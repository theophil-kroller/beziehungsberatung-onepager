# Beziehungsdynamiken 15.12.78 — Academy-Freigaben & Trainingsmuskel

**Basis:** 15.12.77.1. Alle vorigen Trainings und die öffentliche Website bleiben erhalten.

## Was ist enthalten
- Sichtbarer **💪-Button** auf Academy-Seiten und in den Trainingseinheiten. Falsche bzw. weniger geeignete Multiple-Choice-Antworten werden für spätere Wiederholung gesammelt. Das Modul verwendet zunächst die bereits vorhandenen Fragen und 4 Optionen; 10–15 Antwortvarianten pro Fall sind NICHT Teil dieses Builds.
- Wiederholungsintervalle nach richtiger Antwort: 1 / 3 / 7 / 14 / 30 / 60 Tage; nach einer falschen Antwort 15 Minuten. Das ist eine einfache Leitner-artige Heuristik, keine wissenschaftlich kalibrierte Gedächtniskurve. Die nächste Karte ist ohne Scrollen über den schwebenden Button erreichbar.
- Bisherige Module: Deida, Gottman, Zwischen den Zeilen, Gross, Mastery; Bindungsstile bei Fragen im Auswahl-/Nachfrageformat. Andere Übungsarten werden nicht pauschal als objektiv falsch eingestuft, wenn eine eindeutige Rückmeldung nicht möglich ist.
- Cloudflare Worker-Routen für **Owner-Modulfreigaben**, persönlichen Lernstand, Wiederholungskarten und gezieltes Löschen. Practitioner hat standardmäßig nur `binding` und `alliance` aktiv, solange der Owner nichts anderes freigibt.
- Academy-Verwaltung: `academy-access15-12-78.html` über die Planetenübersicht. Zehn Planeten sind sichtbar, geplante Module bleiben erkennbar.
- Lokale Speicherung funktioniert ohne Cloudverbindung. Cloud-Zugriff erfordert eine gültige Anmeldung im Praxis-Cockpit. Bei Cloudausfall erscheint kein irreführendes „synchronisiert“.

## Installation Website
1. Vorhandene Website/Repo von 15.12.77.1 sichern. Website-ZIP entpacken und Dateien mit gleichen Namen überschreiben (keine unbekannten Dateien löschen).
2. Falls Cloud-Funktionen gewünscht: **zuerst** die D1-Migration `database/migrations/017_12_78_academy.sql` auf der richtigen Praxis-D1 ausführen, **danach** die aktualisierte `cloudflare-worker/worker.js` bereitstellen. Diese beiden Dateien sind im **FULL**- und **PATCH**-Projekt enthalten, im Website-ZIP nicht. Vorher bestehende Worker-Änderungen vergleichen.
3. Anschließend im Praxis-Cockpit mit dem Owner-Konto anmelden, Academy-Verwaltung öffnen und Mitglieder-Freigaben kontrollieren. Erst dann die Practitioner-Freigabe testen.
4. Mit einem anonymen Browser funktioniert lokales Muskeltraining ohne Cloud. **Das ist kein sicherer Offline-Zugriffsschutz**: Bei statischen HTML/JS-Dateien können die Trainingsdateien technisch direkt aufgerufen werden. Server-Metadaten und Fortschritte werden dagegen serverseitig geschützt. Für vertrauliche lizenzierte Trainingsinhalte wäre künftig ein authentifizierter Content-API nötig.

## Installation Windows / macOS
- Die Windows-EXE bzw. Mac-ARM64-App wurde aus diesen Quellen neu kompiliert; macOS ist nicht signiert/notarisiert. Das ist **kein automatisches Update**. Backup der lokalen Vault-Daten vor Austausch der ausführbaren Anwendung erstellen.
- Die Praxisdaten-Synchronisierung zwischen den Geräten ist eine **separate** Funktion; ein verifizierter Ende-zu-Ende-Test auf Ilonas Mac steht weiterhin aus.
- Der lokale Lernstand wird bewusst nicht automatisch gelöscht. Nicht den Browser-/WebView-Speicher pauschal zurücksetzen.

## Wichtige Grenzen (Transparenz)
- **Cloud-Sync und Modulfreigaben sind implementiert, aber nicht live auf eurer D1/Worker-Instanz aktiviert oder mit den beiden Geräten abgenommen.** Ein ZIP allein aktiviert diese Cloudfunktionen nicht.
- Lernstandskonflikte nutzen derzeit einen begrenzten best-effort Merge. Für mehrere gleichzeitig aktiv trainierende Geräte und insbesondere einen gezielten Reset eines einzelnen Mastery-Subskills sind weitere Synchronisationstests sinnvoll.
- Auswahl von `Mann/Frau` ist in älteren Trainings zusätzlich ein lokales UI-Profil; mit gültiger Anmeldung wird das persönliche Konto zugeordnet.
- Übungen sind regelbasierte Simulationen; Freitext wird nicht automatisch von KI als fachlich richtig bewertet.
- Der Muskel-Button verwendet jeweils die vorhandene Antwortmenge, noch keinen 10–15-Optionen-Pool. Das gehört zum nächsten Vertiefungsbuild.

## Abnahmecheck (noch manuell auf Zielgeräten)
1. Falsche Auswahl in Deida oder Gottman treffen: 💪-Zähler steigt.
2. Muskel-Button klicken: gleiche Frage mit passenden Optionen erscheint; richtige Antwort => spätere Wiederholung, Fehler => 15 Minuten.
3. Ohne Login: lokaler Lernstand funktioniert, aber Cloud meldet sich nicht fälschlich als aktiv.
4. Nach Worker-Deployment/D1-Migration: Owner meldet sich an und sieht die Team-Freigaben. Ein nicht freigegebenes Deida-Modul bleibt für Practitioner gesperrt, Bindungsstile und Beratungsallianz sind aktiv.
5. Mehrere Geräte: Fortschritt auf Gerät A erzeugen, Gerät B anmelden und wiederherstellen; Profiltrennung und gezieltes Zurücksetzen prüfen. Erst nach bestandenem Test Cloud als „einsatzbereit“ bezeichnen.
