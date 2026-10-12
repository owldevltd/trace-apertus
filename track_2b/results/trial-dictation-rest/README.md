# Run: everything said at once, and the rest said after single answers

The run behind the entries "Does saying everything at once still fill a form?" and "Does the dictation for the rest
leave single answers as they are?" in `docs/tests.md`.

- `dictations.json` – the made-up dictations of the two walk-through forms, three pieces each, as they are spoken.
- `expected.json` – for every field of the two forms its label, its kind and the made-up value the walk-through sets
  for it, with the state the walk-through gives that value. Written before the runs.
- `calls/call-1.json` – the one call of these runs that was logged outside a job: the played respondent answering the
  first four questions of the Betreibungsbegehren (tag `rest gegenüber`), as the client logged it.
- `result.md` – every field of the three fillings with the value it got, its origin and the verdict.

Not kept: the 22 calls of the filling itself (10, 6 and 6). The filling logs its calls into the folder of the job it
works on, and the test and the trial remove that folder at their end.

How it was made: the walk-through forms with their made-up values and dictations (`src/app/js/mock/forms.js`) and the
questions stored for them (`src/app/js/mock/dialogues.js`), as they were on 9 October 2026. Said at once on the
Betreibungsbegehren: `tests/fill.js`, the test of `make bench`. Said at once on the Suva form: a job is built from the
walk-through form, the three pieces of its dictation become its transcript with the number words turned into digits,
and `fillJob` of `src/fields/filler.js` fills it. The mixed run: a job of the Betreibungsbegehren; a respondent played
by the small model answers its first four questions from the dictation; every answer is read with `fillUnit` for the
fields of its question, a question answered with "Das weiss ich nicht." is ticked off; then the dictation is added to
the transcript and `fillJob` fills what is open.
