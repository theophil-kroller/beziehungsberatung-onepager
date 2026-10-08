# Voice assets – Build 15.12.16

## New real recordings
- OM sound library: 12 variants (short / medium / long plus 3 earlier takes)
- HAA sound library: 3 real takes from `Track-3.wav`
- HUM / humming library: 3 real takes from `Track-3.wav` (prepared for Bhramari)
- OM spoken cue set from `BD Voice De 04 Om Cues.wav`

## Placeholder replacement
`assets/audio/breath/de/sound_om.mp3`, `sound_haa.mp3`, and `sound_hum.mp3` are no longer dummy audio. They now contain real user recordings.

## Runtime use
- Löwenatmung rotates through `haa_take_01..03`.
- Om Chanting rotates through short/medium/long/earlier OM takes; the exhale phase duration follows the selected take length.
- OM inhale cues rotate through the newly recorded spoken cues.
- HUM takes are included in the library for the upcoming Bhramari / Intermediate implementation.

## Visual
Löwenatmung now uses two image states under `assets/images/breath/lion/` and animated overlays for inhale/exhale. The same inhale/exhale switching is also shown in the Kurzanleitung and during the spoken preparation sequence.
