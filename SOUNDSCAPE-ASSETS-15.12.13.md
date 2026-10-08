# Soundscape assets — Build 15.12.13

- App file: `assets/audio/breath/soundscapes/celestial-drift-loop.mp3`
- Source: user-provided ElevenLabs royalty-free `celestial-drift.mp3`
- App preparation: removed the very quiet opening/ending and created a 122 s loop from the musically stable centre section with an 8 s crossfade.
- App loop loudness: approx. -19.4 dB mean / -3.0 dB max before the in-app volume control.
- Playback: persistent DOM `<audio>` element, preloaded when the breathing dialog opens. Playback begins only from the explicit Start action; voice ducking remains enabled.
- Original source remains unchanged in prior build assets; the app references the prepared loop file.
