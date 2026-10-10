# Build 15.12.41 – Advanced Voice: sanftes, einheitliches Audio-Mastering

Basis: Vollbuild 15.12.40. Keine Änderung an Sitzungsabläufen, Cues, Zuordnungen, Sicherheit, Worker, D1, Mac-Vault oder Musikdateien.

## Warum diese Bearbeitung?
Die Advanced A/B-Rohschnitte waren deutlich lauter als die frühen Atemraum-Aufnahmen; C und D lagen dazwischen. Teilweise gab es unweiche Start-/Endkanten.

## Umgesetzt
- 347 gültige MP3-Dateien (110 A, 82 B, 49 C und 106 D) mit demselben schonenden Profil bearbeitet und im Root/Windows-Desktop-Spiegel ersetzt.
- Behutsame Tiefbass-Bereinigung (< 65 Hz), geringe Absenkung der Präsenz-/Sibilanzbänder bei 3,45 und 6,6 kHz (je -1,4 dB).
- Sprechpegel an den ruhigeren frühen Atemraum-Klang angenähert; Peak-Grenze bei der Bearbeitung bewusst konservativ.
- Ein-/Ausblenden mit 65 ms / 160 ms statt harter Schnittkanten. Keine Hallfahne, keine starke Kompression.
- Dauer, Dateinamen, Sprechertexte, Satz-Zuordnungen und Tonhöhen unverändert.
- Für Advanced-MP3s Query-Version ?v=15.12.41, damit Browser keine älteren Audio-Dateien aus dem Cache abspielen.
- Review-Seiten erhalten denselben Cache-Buster.
- 21 bereits vorhandene *nicht dekodierbare* A/B-Rohschnitt-Kandidaten wurden nicht geändert. Alle 21 wurden in der vorliegenden CSV-Hörprüfung nicht bestätigt. Diese Dateien können nicht durch Mastering repariert werden; sie sind nicht aktiv im Player verknüpft.

## Prüfstand
- Alle 347 verarbeiteten MP3s wurden anschließend vollständig von FFmpeg dekodiert.
- Die Spieldauer bleibt bei Stichproben gleich. Keine Original-WAV-Quelle wurde überschrieben.
- Kein subjektiver Hörtest an sämtlichen Dateien durch eine Person; bitte Hörprobe vor dem flächigen Einsatz mit Kopfhörern beurteilen.

## Installation
PATCH über Build 15.12.40 oder FULL als Vollinstallation. Für die online geladene Praxis müssen Root-Webdateien und die verarbeiteten Audio-Dateien zusätzlich veröffentlicht werden. Kein Worker-/D1-Deployment nötig.
