# Build 15.12.45 – Atemraum-Multitrack-Musik und scrollfreie Sessions

**Basis:** Build 15.12.44. Kein Cloudflare Worker, D1 oder Vault-Update.

## Musik-Integration
- 14 von dir hochgeladene CC0-Musikstücke wurden in 44,1 kHz Stereo-MP3 (112 kbps) umgewandelt und vorsichtig auf einen ruhigen Musik-Lautheitswert gemastert. Aufnahmen der Stimme blieben unangetastet.
- Die beiden kurzen Percussion-Loops (12,0 bzw. 5,7 Sekunden) werden NICHT als alleinige stundenlange Hintergrundschleifen eingesetzt, sondern als leise rhythmische Ebenen in zwei zusätzlichen, fertigen MP3-Mischungen.
- Für sieben Advanced-Verfahren sind die **39 Musikphasen** im Player mit konkreten Tracks und optionalen stimmungsgleichen Alternativen belegt: Holotropes Atmen, Rebirthing, Clarity, Transformational, Biodynamic, Somatic und Shamanic Breathwork.
- Zwei getrennte Audio-Decks spielen kapitelweise MP3s ab und überblenden weich (8 s). In längeren Phasen werden bis zu vier passende Titel alle 8 Minuten automatisch rotiert, damit 30- bis 40-minütige Abschnitte nicht nur aus einem wiederholten Titel bestehen. Musiklautstärke wird bei gesprochener Aufnahme automatisch geduckt, beim Ende wieder sanft aufgebaut.
- Pause und Beenden sollen alle Musik-Decks gemeinsam anhalten; in den übrigen Techniken bleibt der bisherige Standard-Soundscape unverändert.
- Die musikbezogenen Regiezeiten sind **Vorschläge für eine unterstützende Klangdramaturgie**; die wiederkehrenden Musikdateien sind bis auf die bereits als Loops gelieferten zwei Tracks mit kurzen musikalischen End-/Start-Überblendungen optimiert. Bei der praktischen Hörprüfung sind die Übergänge trotzdem entscheidend.

## Scrollfreie Bildschirmtexte
- Während der Sitzung keine gesonderte Scrollleiste mehr im Cue-Feld oder im Hauptfenster.
- Lange gesprochene Blöcke werden während des MP3-Abspielens auf kurze automatisch wechselnde Textkarten verteilt. Das bewahrt den lesbaren Inhalt, ohne eine Benutzerinteraktion zu verlangen.
- Kompaktes, responsives Layout; Uhr, Visualisierung, Musik-/Phasenlabel, Anweisung und Pause-/Stop-Buttons haben feste eigene Positionen.
- Lange Phasenbeschreibungen ohne Sprachaufnahme werden in der laufenden Ansicht bewusst auf eine kurze aktuelle Anweisung reduziert; die Erklärung bleibt vor dem Start verfügbar.

## Tracks
- **Revelation**: `assets/audio/breath/soundscapes/cc0/revelation.mp3`
- **Tribal**: `assets/audio/breath/soundscapes/cc0/ambient_tribal.mp3`
- **Frozen Desert**: `assets/audio/breath/soundscapes/cc0/frozen_desert.mp3`
- **Contemplation**: `assets/audio/breath/soundscapes/cc0/contemplation.mp3`
- **Persistence**: `assets/audio/breath/soundscapes/cc0/persistence.mp3`
- **Somnium**: `assets/audio/breath/soundscapes/cc0/somnium.mp3`
- **Calm Track Loop**: `assets/audio/breath/soundscapes/cc0/calm_track.mp3`
- **Safe Space Loop**: `assets/audio/breath/soundscapes/cc0/safe_space.mp3`
- **First Light Particles**: `assets/audio/breath/soundscapes/cc0/first_light.mp3`
- **Budding of Consciousness**: `assets/audio/breath/soundscapes/cc0/budding.mp3`
- **Cinematic Percussion Loop**: `assets/audio/breath/soundscapes/cc0/cinematic_drums.mp3`
- **Calm Ambient 2**: `assets/audio/breath/soundscapes/cc0/synthwave.mp3`
- **Dream 2**: `assets/audio/breath/soundscapes/cc0/dream2.mp3`
- **Prehistoric Drum Loop**: `assets/audio/breath/soundscapes/cc0/prehistoric_drums.mp3`
- **Tribal Percussion**: `assets/audio/breath/soundscapes/cc0/tribal_percussion.mp3`, abgeleitet aus ambient_tribal, cinematic_drums
- **Desert Ritual**: `assets/audio/breath/soundscapes/cc0/desert_ritual.mp3`, abgeleitet aus frozen_desert, prehistoric_drums

## Kapitelzuordnungen
### holotropic
- 00:00 Ankommen: `somnium`
- 15:00 Aktivierung: `ambient_tribal`
- 55:00 Intensiver Prozess: `tribal_percussion`
- 90:00 Wendepunkt: `dream2`
- 120:00 Abklingen: `safe_space`
- 150:00 Integration: `contemplation`
### rebirthing
- 00:00 Ankommen: `first_light`
- 05:00 Verbundenes Atmen: `calm_track`
- 14:00 Prozessraum: `persistence`
- 38:00 Rückkehr: `safe_space`
- 46:00 Integration: `budding`
### clarity
- 00:00 Ankommen: `somnium`
- 06:00 Atemfluss: `calm_track`
- 16:00 Prozessraum: `safe_space`
- 35:00 Stabilisieren: `persistence`
- 45:00 Integration: `revelation`
### transformational
- 00:00 Intention: `first_light`
- 10:00 Öffnen: `synthwave`
- 22:00 Reflexionsraum: `dream2`
- 34:00 Erdung: `persistence`
- 44:00 Integration: `budding`
### biodynamic
- 00:00 Orientierung: `somnium`
- 07:00 Atemwahrnehmung: `calm_track`
- 13:00 Bewegung: `synthwave`
- 19:00 Ausdruck: `frozen_desert`
- 30:00 Regulation: `revelation`
- 43:00 Integration: `contemplation`
### somatic_breathwork
- 00:00 Ankommen: `safe_space`
- 06:00 Körperwahrnehmung: `contemplation`
- 14:00 Erkundung: `persistence`
- 23:00 Pendeln: `calm_track`
- 33:00 Nachspüren: `first_light`
- 38:00 Integration: `budding`
### shamanic
- 00:00 Ankommen: `somnium`
- 12:00 Eröffnung: `ambient_tribal`
- 25:00 Rhythmus: `tribal_percussion`
- 45:00 Wandel: `desert_ritual`
- 65:00 Rückkehr: `revelation`
- 80:00 Ausklang: `safe_space`

## Lizenz und Deployment
Die Dateien stammen laut ihren OpenGameArt-Quellseiten aus CC0-Veröffentlichungen. Der Rechte-/Provenienz-Nachweis wird im Track-Katalog als Ausgangspunkt dokumentiert; die tatsächliche Urheberschaft kann mit diesem Build nicht unabhängig garantiert werden. Die Audio-Dateien liegen bewusst im Download-Paket zur Veröffentlichung bereit. Bei rechtlichen Zweifeln oder Umwidmung zu einem kostenpflichtigen eigenständigen Produkt Quellen/Lizenzen erneut prüfen.

Für die LIVE-Website müssen alle neuen MP3s, `member-practice15-12.js`, `member-practice15-12.css` und die aktualisierten HTML-Einstiegsseiten auf GitHub veröffentlicht werden. Nur die Windows-Dateien zu ersetzen aktualisiert die Website nicht. Danach Browsercache hart aktualisieren.

## Testumfang
Der Build wird auf JS-Syntax, Audiodateien, Zuordnungen, ZIP-Integrität und einer isolierten Browserprobe validiert. Das praktische Abhören einer 3-stündigen Holotropes-Atmen-Playlist ist keine automatisierte Prüfung.
