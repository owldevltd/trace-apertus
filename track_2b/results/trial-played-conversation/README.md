# Run: a played conversation on the walk-through's form

The run behind the entry "Does a played conversation fill the walk-through's form?" in `docs/tests.md`.

- `dictation.txt` – what the respondent knows: the made-up dictation of the walk-through's Betreibungsbegehren, as it
  is spoken, with the numbers in words.
- `expected.json` – for each of the 15 fields its label, its kind and the made-up value the walk-through sets for it,
  with the state the walk-through gives that value (`ok`, `unclear`, `missing`, `empty`). Written before the run.
- `calls/small-model-writes/call-<k>.json`, `calls/large-model-writes/call-<k>.json` – every call to the model as the
  client logged it: the prompt, the model, the temperature, the duration, the status and the raw answer, 8 calls per
  conversation in the order they were made. Call 1 writes the questions (`e2e schreiben`), calls 2 to 5 check them in
  two runs (`e2e prüfen`), call 6 is the respondent (`e2e gegenüber`), calls 7 and 8 read the answers (`e2e füllen`).
  The tag ends with the model that wrote the questions (`8b`, `70b`); only call 1 of `large-model-writes/` went to the
  large model.
- `result.md` – every field with its question, the answer, the value read and the verdict.

How it was made: the form is the Betreibungsbegehren of the walk-through with its made-up values
(`src/app/js/mock/forms.js`, as it was on 9 October 2026). Its section titles and labels are written as a list of
lines with the id of a unit behind each label; the model writes one question per unit; the small model names the unit
of every question in two runs, and a question that is not named right twice falls back to the printed label. The
respondent is the small model: it is given the dictation as what it has told about its case and answers all 14
questions in one call, with "Das weiss ich nicht." where the dictation says nothing. Number words in the answers are
turned into digits by code, as after a transcription. The answers to single fields are then read by the small model,
six questions and answers per call, one line per question; the choice is set by code where the name of exactly one
option stands in the answer. This reading is the trial's own short one; the same questions and answers read with the
repository's filling are `results/trial-answer-by-unit/`.
