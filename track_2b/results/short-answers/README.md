# Run: a short answer alone, and the dictionary of the recognition

The run behind the entry "Is a short answer heard when it stands alone?" in `docs/tests.md`.

- The recordings as short as they were spoken are those of `results/sheet-conversation/voice-a/` and `voice-b/`.
- `with-silence/voice-a/`, `with-silence/voice-b/` – the same recordings with half a second of silence before and one
  and a half seconds after, as the app records an answer.
- `calls/<recording>/<dictionary>/<voice>/call-<k>.json` – every call to the recognition as the client logged it: the
  prompt with its dictionary, the model, the duration, the status and the raw answer. A recording is in the log only as
  its size.
- `result.md` – how many of the 15 answers were heard per voice, recording and dictionary, and every transcript.

How it was made: each recording goes to the model alone, with the prompt of `src/speech/transcriber.js` and one of the
three dictionaries. For the short recordings with the dictionary as built, the calls are the transcriptions of a
conversation run through the app.
