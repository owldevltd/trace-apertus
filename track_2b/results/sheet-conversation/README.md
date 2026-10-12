# Run: the sheet answered question by question, by voice

The run behind the entry "Does a spoken answer to each question fill its field?" in `docs/tests.md`.

- `answers.json` – for each of the 18 questions of the sheet, by the name of its form field: what is said (empty:
  the question is skipped) and what has to stand in the field afterwards. Written before the runs.
- `voice-a/`, `voice-b/` – the answers as recordings, one file per question that is answered, numbered in the order
  of the questions, spoken by two synthetic voices in the format the app records (MP3, 16 kHz, mono).
- `calls/<voice>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. A recording is in the log only as its size.
- `result.md` – every question with what was said, what was heard and what stands in the field.

How it was made: the sheet is opened as a shipped form (`POST /api/jobs/from/austrittsmeldung`); for each question the
recording is sent as a piece of its own (`/audio`) and given as the answer to that question (`/answers/<question>`), or
the question is skipped.
