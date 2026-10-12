# Run: the check back over the page layout, on all four forms

The run behind the entry "Does the check back over the page layout hold on all four forms?" in `docs/tests.md`.

- `calls/questions-70b/call-<k>.json` – the check back on the questions of the large model, 50 calls: per form two
  runs (`Lauf 1`, `Lauf 2`), a call per twelve questions of a page; 6, 6, 18 and 20 calls for the four forms. Tag
  `rückprobe einheiten-etikett-interview-70b <form> Lauf <r>`.
- `calls/questions-8b/call-<k>.json` – the same check, by the large model, on the questions of the small model for
  `arbeitsfaehigkeitszeugnis` and `betreibungsbegehren`, 6 calls each. Tag `rückprobe einheiten-etikett-interview
  <form> Lauf <r>`. Each call file is the call as the client logged it: the prompt, the model, the temperature, the
  room for the answer, the duration, the status and the raw answer.
- `result.md` – what the two runs name per form, and every question with the units named for it.

How it was made: the questions are those of `results/catalogue-interviewer-seat/`. The questions of a page go to the
model without their ids, in a fixed mixing that differs per run, lettered A to L, together with the page as a picture
of text in which every place carries the id of its unit. The model returns the id for each letter. In `result.md` the
unit behind a letter is found by rebuilding the mixing; the rebuilt order is held against the questions in each
prompt.
