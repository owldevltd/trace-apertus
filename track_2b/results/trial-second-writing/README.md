# Run: the same order a second time

The run behind the entry "Does the same order give the same questions a second time?" in `docs/tests.md`.

- `calls/write-whole-form/` (4 calls), `calls/write-page-by-page/` (8), `calls/write-large-model/` (4) – the second
  writing: the prompts of `results/trial-question-writing/` sent again, and the large model's prompt of the earlier
  trial. The tags end in `-r2` (`d-8b-whole-r2`, `d-8b-page-r2`, `d-70b-whole-r2`).
- `calls/check-page-by-page/` (48 calls), `calls/check-large-model/` (48) – the small model checks the second
  page-by-page writing and the second writing of the large model, two runs each (`prüfen … Lauf 1`, `Lauf 2`). The
  check of the second whole-form writing is `results/trial-check-runs/`, of which runs 1 and 2 count here.
- Every `call-<k>.json` is a call to the model as the client logged it: the prompt, the model, the temperature, the
  duration, the status and the raw answer, numbered per folder in the order they were made.
- `questions.json` – the question of every unit in the three second writings, as read from the answers.
- `result.md` – the second writing against the first, word for word and in what holds.

The units are in `results/trial-question-writing/units.json`, the first writings in
`results/trial-question-writing/questions.json`.

How it was made: the writing as in `results/trial-question-writing/`, the check as in `results/trial-question-check/`;
nothing in the prompts was changed. Small model swiss-ai/Apertus-v1.5-8B, large model swiss-ai/Apertus-v1.5-70B,
temperature 0.
