# Run: a played dialogue sorted back into the fields

The run behind the entry "Does the existing filling sort a played dialogue back into the fields?" in `docs/tests.md`.

- `calls/call-1.json`, `calls/call-2.json` – the call that wrote the questionnaire, with the large model (tag `dialog
  70b`) and with the small one (tag `dialog 8b`), as the client logged it: the prompt, the model, the temperature, the
  duration, the status and the raw answer.
- `result.md` – the questions with the played answers, and every field against its expected value.

The 16 calls that read the dialogue into the fields are not in this folder: the filling logs its calls with the job,
and the trial removed the job when it had read the values. `result.md` therefore holds the values as the run wrote
them down, not as counted again from a log.

How it was made: the form is the Betreibungsbegehren of the walk-through with its made-up values
(`src/app/js/mock/forms.js`, `src/app/js/mock/blocks.js`). The page goes to the model as a picture of text with every
field at its place under its name, and the model writes a questionnaire. For every question an answer is put together
from the made-up values of the fields the question names. Each pair becomes one piece of a transcript, "Frage: …
Antwort: …", and `fillJob` of `src/fields/filler.js` reads the transcript into the fields as it does after a
dictation, unchanged.
