# Run: how many runs of the check

The run behind the entry "How many runs of the check does a question need?" in `docs/tests.md`.

- `questions.json` – the 256 questions that were checked, per form and unit: the second writing of the small model
  over the whole form (`results/trial-second-writing/calls/write-whole-form/`).
- `calls/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the temperature, the
  duration, the status and the raw answer, numbered in the order they were made. The calls go form by form: 1 to 12
  the certificate, 13 to 24 the Betreibungsbegehren, 25 to 60 the accident report, 61 to 100 the Suva form; within a
  form run 1 comes first and run 4 last. The tag of a call is `prüfen` (check), the questionnaire (`d-8b-whole-r2`),
  the form and the run (`Lauf 1` to `Lauf 4`).
- `result.md` – what holds and what passes with one, two, three and four runs counted.

The units are in `results/trial-question-writing/units.json`. Runs 1 and 2 are also the check of this questionnaire in
`results/trial-second-writing/`.

How it was made: as in `results/trial-question-check/`, with four runs instead of two; each run mixes the questions of
a page in another fixed order.
