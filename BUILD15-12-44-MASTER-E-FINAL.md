# Build 15.12.44 – Master E vollständig aufgenommen und geschnitten

**Basis: 15.12.43**. Die bisherigen 94 MP3s E001–E094 bleiben unverändert und werden nicht neu komprimiert. Neu: E095–E150.

## Schnitt
- Verbundenes Atmen (Rebirthing E095–E105, Clarity E106–E114, Transformational E115–E123): 29 Clips.
- Körperorientierte Atemarbeit (Biodynamic E124–E131, Somatic E132–E139): 16 Clips.
- Shamanic Breathwork (E140–E150): 11 Clips.
- **56 neue MP3s, Master E jetzt E001–E150 vollständig als Dateien vorhanden.**
- Mastering wie 15.12.41–43: Hochpass 65 Hz, leichte Höhenabsenkungen um 3450 und 6600 Hz, sanfte Randfades, konservativer Lautheitsausgleich, MP3 160 kbps Mono 44,1 kHz. Original-WAVs unverändert.
- Ein langes Stillesegment in der ersten WAV wurde in zwei Sprachbausteine getrennt (E121/E122), statt beide auf dieselbe MP3-ID zu legen.

## Integration
- 56 Sprecherbausteine an den Zeitmarken des Final-Regiebuchs in sechs bestehende Advanced-Protokolle integriert: Rebirthing, Clarity, Transformational, Biodynamic, Somatic und Shamanic.
- Früheres A–D/ E001–E094 und Wim Hof sanft/Originalstatus unangetastet.
- Keine Roboterstimme; wo Phasen keine Aufnahme haben, bleibt die Phasenbeschriftung auf dem Display.

## Musikdramaturgie – vorbereitete Slots
- `advanced-music-score15-12-44.json` enthält für Holotropes Atmen und sechs weitere Methoden Kapitelzeiten, Stimmungen, Übergangsvorschläge und `track:null`.
- Die Atemraum-Sitzung zeigt die aktuelle Musik-/Klangphase zeitgesteuert. **Es werden noch keine unterschiedlichen Musikstücke gespielt**: Der bestehende Soundscape bleibt kontinuierlicher Platzhalter. Dadurch keine defekten Musikanfragen oder unlizenzierte Dateien im Build.
- Lizenzierte Musik und echte Crossfades müssen erst nach Track-Auswahl ergänzt und in Echtzeit getestet werden.

## Teststand und Grenzen
- Alle 56 neuen MP3s vollständig über FFmpeg dekodiert; Dateien im Root-Web und Desktop-Spiegel.
- CSV- und Skript-IDs lückenlos E001–E150. Regiezeitmarken und Phasen geprüft, ZIP-CRC und JavaScript-Syntax validiert.
- **Keine vollständige Wort-für-Wort-Hör- oder Transkriptprüfung**: Die IDs ergeben sich aus Stille und der genauen Anzahl/Reihenfolge. Stichproben sind vor Nutzung sinnvoll.
- Die bereits im alten Build bekannte separate Wim-Hof-Originalsteuerung ist weiterhin offen. Holotropes Atmen ist weiterhin als begleitetes Verfahren klassifiziert.

## Installation
PATCH **auf 15.12.43** anwenden. FULL umfasst die vorherigen Builds. Aktualisierte Webdateien und neue MP3s müssen veröffentlicht werden; GitHub-Upload des älteren Builds allein reicht dafür nicht. Kein neues Cloudflare Worker-, D1- oder Mac-Vault-Update.
