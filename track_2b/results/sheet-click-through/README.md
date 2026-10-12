# Run: the sheet typed and clicked in the app

The run behind the entry "Does the sheet go through the app question by question, typed and clicked?" in
`docs/tests.md`.

- `1-forms.png`, `2-conversation-start.png`, `3-conversation-end.png`, `4-preview.png` – the screen at four moments.
- `result.md` – every question with the answer given, and every field of the job afterwards.

How it was made: a browser without a window opens the app, picks the form `austrittsmeldung` from the list, answers
each question on the screen (typing into the reply field, clicking yes or no, clicking a choice, or skipping), and
opens the preview; the job is then read from the server (`GET /api/jobs/<id>`). The person and the values are made up.
