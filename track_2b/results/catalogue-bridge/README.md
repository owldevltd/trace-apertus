# Run: from the form's wording to plain language, with a check back

The run behind the entry "Does a check back over the page hold the small model's plain questions?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 18 calls in the order they were made, 9 per form (`arbeitsfaehigkeitszeugnis`, then
  `betreibungsbegehren`). A call tagged `brücke hin <form> S<n>` rewrites up to twelve questions of page n; `zurück
  einfach <form> S<n>` asks back the plain versions, `zurück formular <form> S<n>` the versions in the form's wording.
  Each call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer,
  the duration, the status and the raw answer.
- `result.md` – how many questions were rewritten, how many point back to their place, and every question with the
  unit named for it.

How it was made: the questions in the form's wording are those of the run with the labels in
`results/catalogue-plain-questions/`; the units are those of `results/catalogue-units/units.json`. Every prompt holds
the whole page as a picture of text, no heading and no paragraph left out. For the way back the questions of a page
are mixed in a fixed order and lettered A to L; the model answers with the id of the unit for each letter.
