# Run: can the model tell when a place is answered?

The run behind the entry "Can the model tell when a place is answered?" in `docs/tests.md`. It is the trial; the same
measurement made afterwards with the code of the repository is `results/enough/`.

- `cases.json` – the 98 cases in the order of the calls: the form, the unit, its question, its printed label and kind,
  the answer that is judged and the verdict expected for it. Built by code before the run, from the 31 units with a
  value of the two walk-through forms.
- `calls/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the temperature, the
  duration, the status and the raw answer, numbered in the order they were made. Calls 1 to 98 are the cases of
  `cases.json`, calls 99 to 129 judge the 31 full answers a second time in the same order. The tag is `genug`, the run
  (`Lauf 1`, `Lauf 2`), the form, the unit and the case: `voll` (the value itself), `nichts` ("Das weiss ich nicht."),
  `fremd` (the value of the next unit with a value), `gekürzt` (only the first part of the value).
- `result.md` – the verdicts against the expected ones, and every case.

How it was made: the two walk-through forms with their made-up values (`src/app/js/mock/forms.js`) and the questions
stored for them (`src/app/js/mock/dialogues.js`), as they were on 9 October 2026. For every unit with a value four
kinds of answer are built: the value itself, for a choice the name of its option (expected `ja`); "Das weiss ich
nicht." (expected `nein`); the value of the next unit with a value (expected not `ja`); and, where the label names
several things and the value has a comma, only the part before the first comma (expected not `ja`, an assumption). One
judgement per call, swiss-ai/Apertus-v1.5-8B, temperature 0.
