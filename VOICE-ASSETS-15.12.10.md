# Voice Assets 15.12.10

Production assets live in `assets/audio/breath/de/`.

- 84 recorded German voice clips cut from the two supplied master recordings.
- 3 placeholders: `sound_om.mp3`, `sound_haa.mp3`, `sound_hum.mp3`.
- `manifest.json` is the stable mapping from clip id to file/transcript/source.
- App delivery format: MP3, mono, 48 kHz, 96 kbps (placeholders 64 kbps silence).
- Working/source masters are intentionally not included in the web repository/full build.
- Number clips `zahl_01` ... `zahl_10` are prepared but are not yet used as timed countdowns.

Replacement rule: keep the filename/clip id stable and replace the file when a better recording is available.
