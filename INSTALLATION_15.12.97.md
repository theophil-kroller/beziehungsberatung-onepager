# Installation 15.12.97 – Gottman Level 2 · SPAFF-Beobachtungslabor

## Empfehlung: MINI-PATCH auf bestehender Website 15.12.96
1. MINI-PATCH entpacken und die Dateien in dein bestehendes GitHub-Pages-Webrepository kopieren (bestehende Dateien ersetzen; nicht im Unterordner belassen).
2. Commit + Deployment abwarten; im Browser Strg+F5 drücken.
3. Academy → Welt der Beziehungshäuser → **Gottman Level 2 · Beobachtung & SPAFF**. In der pädagogischen Reihenfolge steht dieser Trainer nach Gottman Level 1 Gesamt-Mastery und vor RLT.
4. Test: erste Szene komplett durchspielen, einmal bewusst falsch wählen, danach 💪 und die Mastery-Prüfung prüfen.

Für **lokales Website-Training** braucht es **keine D1-Migration und keinen Cloudflare-Worker-Upload**.

## Lerninhalte und ihre Grenzen
100 eigenständig formulierte fiktive Szenen aus 20 SPAFF- und Beobachtungsdimensionen, 80 Transfer- und Konzeptfragen, sieben Entscheidungsstufen, 20 Levels, Signalatlas, Muskeleinträge und stummschaltbarer Bestätigungston. Nach einem neuen Hinweis muss die Perspektive erneut geprüft werden.

Gesichtsmimik, Stimme und Worte liefern Beobachtungsdaten, keine verlässliche Gedanken- oder Emotionserkennung. Das Material ist für privates Lernen gedacht und ersetzt weder die offizielle SPAFF-Codierschulung noch Supervision oder eine klinische Diagnostik. In allen Sicherheitsfällen ist der Schutz der betroffenen Person vorrangig.

Die PDF-Manualseiten, gezeichneten FACS-Illustrationen, Gottman-Formulare und Originalübungen wurden **nicht** in die Website übernommen. Kapitelbezüge: Level 2, Kap. 1–3 und Sicherheit 5/13.

## Lernstände und Optional-Cloud
Neuer lokaler Fortschritt: `bd-gottman-spaff97-ich` bzw. `bd-gottman-spaff97-partnerin`. Alte Modulstände bleiben unverändert. Owner-Freigabe / Cloud-Sync mit neuer Modulkennung `gottmanspaff` erfordert *optional* einen aktualisierten Cloudflare Worker; produktiver Sync ist hier **nicht getestet**. Der Worker enthält nur die neue erlaubte Kennung, **keine D1-Migration**.

## Windows und macOS
Windows-ZIP enthält eine neu kompilierte Windows-EXE. Mac M1-ZIP enthält eine neue macOS ARM64-Binärdatei in der vorhandenen App-Struktur, weiterhin ohne Apple-Notarisierung. Vor manueller Installation Vault sichern. Für Browsernutzung ist keine Mac-Neuinstallation erforderlich. Reale Geräteinstallationen wurden hier nicht getestet.

## Testmatrix
Browser: Szenenwahl, vier Optionen, sieben Entscheidungen, Gegenbeispiel nach Wendepunkt, falsch → 💪, Wissen, 24-Fragen-Prüfung, Profile und 20-Knoten-Navigation (1440 / 390 px). Windows-/Mac-Binary und ZIPs separat kontrollieren. Live-Deployment und tatsächliche Vault-Nutzung stehen aus.

## Komplettprojekt
Das FULL-Projekt ist wegen großer lokaler Audioressourcen in drei Teile gesplittet. FULL CORE 15.12.97 und die beiden unveränderten Medienpakete aus 15.12.96 in dasselbe Verzeichnis entpacken. Die Audiopakete sind **byteidentisch zum Vorgänger**, damit keine doppelten Medien erzeugt werden müssen.
