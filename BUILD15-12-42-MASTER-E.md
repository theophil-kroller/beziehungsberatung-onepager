# Build 15.12.42 · Master E · Erste drei WAV-Aufnahmen

Basis: Build 15.12.41. Neue Aufnahmen E001–E049 aus drei Benutzer-WAVs.

## Schnitt/Mastering
- Sanfte Wahrnehmungsübungen: E001–E019, 19 Clips.
- Pranayama: E020–E030, 11 Clips.
- Aktivierende Pranayama-Sequenzen: E031–E049, 19 Clips.
- Die Zahlen der durch Pausen getrennten Takes stimmen in jeder WAV exakt mit dem Skript überein. Jeder geschnittene Clip wurde mit FFmpeg vollständig dekodiert.
- Konservativer Pegelausgleich, Hochpass 65 Hz, leichte EQ-Absenkung um 3450 und 6600 Hz, sanfte Fades (65 ms ein / 160 ms aus), Mono-MP3 160 kbps 44,1 kHz.
- Die aufgenommenen WAV-Dateien wurden nicht überschrieben. Kein automatischer ASR-Wortlautvergleich möglich; IDs beruhen auf chronologischer Reihenfolge und Segmentanzahl.

## Player-Integration
- 49 eindeutige MP3s unter assets/audio/breath/de/advanced/master_e/e001.mp3 bis e049.mp3.
- 78 geplante Ansagen in 16 Advanced-Sitzungsabläufen. Aus dem Regiebuch genommene Zeitmarken in exakte Phasenanfänge umgesetzt; Gesamtdauer bleibt unverändert.
- Bereits bestehende Haupt- und Zusatzansagen werden an denselben Zeitpunkt gezielt durch Master-E-Ansagen ersetzt, damit keine gleichzeitige doppelte Sprecheransage erfolgt.
- Die noch nicht aufgenommenen E050–E150 bleiben vorerst Text/Bestandsaudio und werden nicht als vertont ausgegeben.
- Die neu geladenen Master-E-MP3s verwenden ?v=15.12.42 zur Cache-Aktualisierung. Keine Änderungen an D1/Worker/Vault.

## Prüfung
- Statische Player-JS-Syntax erfolgreich.
- Simulierter Zeitplan: 17 Sitzungen, in 16 davon 78 neue Einsätze exakt an der vorgesehenen Sekunde, Gesamtdauer unverändert, keine neue Ansage durch unmittelbaren Phasenwechsel zu früh abgeschnitten.
- Quell-WAVs und alle bisherigen A–D-MP3s bleiben erhalten.
- Ein vollständiger End-to-End-Browsertest mit allen echten Nutzerfreigaben und Audioausgaben ist noch ausständig.

## Installation
- PATCH auf 15.12.41 oder FULL. Online müssen die Webdateien inklusive der 49 neuen MP3s veröffentlicht werden; das lokale Windows-Update veröffentlicht nicht automatisch die Website.
- Bitte die drei Aufnahmegruppen in advanced-master-e-review15-12-42.html stichprobenartig anhören. Diese Seite ist technisch isoliert und nicht für Klienten sichtbar verlinkt.
