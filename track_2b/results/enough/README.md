# Run: is an answer enough for its place?

The run behind the entry "Is an answer enough for its place?" in `docs/tests.md`.

- `calls/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the temperature,
  the duration, the status and the raw answer, numbered in the order they were made. One call is one judgement: the
  prompt holds the question, the printed label and the answer, and the model returns `ja`, `unvollständig` or `nein`
  and what is missing. The tag names the unit of the dialogue.
- Calls 1 to 98 are the cases, unit by unit: the value itself, "Das weiss ich nicht.", the value of the next unit
  and, for five units, only the first part of the value. Calls 1 to 30 are the 9 units of the Betreibungsbegehren,
  calls 31 to 98 the 22 units of the Suva form. Calls 99 to 129 judge the 31 full answers a second time, in the
  same order.
- The evaluation is the report beside this folder, `results/enough.md`: the judgements against the verdict expected
  for each kind of answer.

The cases are built from the two walk-through forms with their made-up values (`src/app/js/mock/forms.js`) and the
questions stored for them (`src/app/js/mock/dialogues.js`). `tests/enough.js` sets the expected verdict of every
case.

How it was made: `make dialogue`, which runs `tests/enough.js` with swiss-ai/Apertus-v1.5-8B at temperature 0 after
the questions of the shipped forms.

Checked against the report: 129 calls, all made on 9 October 2026, the date in the report's header, and all
answered; from the first call to the last 327 seconds, as in the header. Counted again from the answers in this
folder, the report's table comes out the same: 29 of 31, 0 of 31, 8 of 31 and 1 of 5 answers taken as enough, and
the same verdict in 31 of 31 on the second judgement.
