# Run: one dictation, every field of the sheet

The run behind the entry "Does one dictation fill every field of the sheet?" in `docs/tests.md`.

- `dictation.txt` – what is said, 30 seconds: a made-up person gives notice of leaving.
- `voice-a.mp3`, `voice-b.mp3` – the same text spoken by two synthetic voices, in the format the app records
  (MP3, 16 kHz, mono).
- `expected.json` – for each of the 20 form fields of `data/forms/austrittsmeldung/form.pdf`, by the name of the form
  field, what has to stand in it afterwards; where two values are listed, either counts. Written before the runs.
- `calls/<voice>-run-<n>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. The recording itself is not in the log, only its size.
  Call 1 is the transcription, calls 2 to 5 fill the fields.
- `result.md` – every field against its expected value, run by run, and what was heard.

How it was made: the sheet is opened as a shipped form (`POST /api/jobs/from/austrittsmeldung`), the recording is sent as
one piece (`/audio`), transcribed (`/transcribe`) and read into the fields (`/fill`); the values are then taken from the
job.
