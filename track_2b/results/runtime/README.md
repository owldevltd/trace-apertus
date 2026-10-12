# Run: how long capturing and filling take

The run behind the entry "How long do capturing a page and filling a form take, step by step?" in `docs/tests.md`.

- `result.md` – the time of every step, for five pages captured from an image and for nine runs from a shipped form to
  the sent PDF.
- `calls.csv` – one row per call to the model: the run, the kind of call, the model, the duration in milliseconds as the
  client logged it and the status. The prompts and answers of these calls are not kept in this folder.

How it was made: a server of its own with its own storage. For the capture each page image
(`data/forms/<form>/<page>.png`) is chosen in the app's upload dialogue, and the state of the job is polled until it is
done. For the filling a job is opened on the shipped form (`POST /api/jobs/from/<form>`); a recording is uploaded,
transcribed and filled (`/audio`, `/transcribe`, `/fill`), or every question is answered (`/answers/<question>`, a tap
as `PUT /fields/<field>`); then `/review` and `/send`. The dictations and the answers are made up; the voices are
synthetic.
