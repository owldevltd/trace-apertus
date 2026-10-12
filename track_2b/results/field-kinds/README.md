# Run: the kind of a field, proposed by the model

The run behind the entry "Can the small model say what a field takes?" in `docs/tests.md`.

- `places.json` – the 178 places a person writes into on the four forms that shipped when the run was made
  (`arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`, `schadenmeldung-uvg` and `suva-bagatellunfall` under
  `data/forms/`): the single fields the conversation asks for, without tick marks, signatures and the cells of
  tables. For each its form and page, the id of the place in the list of the page (`q…`), the id of the field, its
  label and the kind the app held for it.
- `calls/<run>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. One call per page that holds such places, seven a run,
  numbered in the order they were made. The runs are `first-wording-run-1`, `first-wording-run-2` and
  `second-wording`.
- `result.md` – the word of the model for every place, run by run, and the counts.

How it was made: a page goes to the model as the list the questions of the conversation are written from, the text
of the page line by line with the id of a place behind its label; then come the kinds to choose from and the ids to
answer for, and the answer is JSON with one word per id. The first wording offers eight kinds: text, a number, a
telephone number, an e-mail address, a postcode, an IBAN, a date, a time of day. The second wording adds an
identifier as a kind of its own, narrows the number to a quantity, an amount or a percentage and the postcode to a
postcode by itself; it is the wording of `src/fields/predictor.js`. The two runs of the first wording were made in
turn, page by page, the run of the second wording after them. No kind was set for a place beforehand; `result.md`
counts against the labels that name their kind.
