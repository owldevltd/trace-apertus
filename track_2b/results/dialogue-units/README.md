# Run: the units of the shipped forms, counted by the repository's test

The count behind the entry "Does the code put every field of a shipped form into a unit, in the order of the form?" in
`docs/tests.md`. No model was called.

- `result.md` – the table of `tests/dialogue.js` for the four forms of 9 October 2026, and the checks the test holds.

How it was made: `make test` runs the geometry over the pages of the shipped forms (`src/cli.js analyze`) and then
`tests/dialogue.js`, which builds the units of every form (`src/dialogue/units.js`), writes the list of lines
(`src/dialogue/listing.js`) and holds the rule of `src/dialogue/dialogue.js` against a stand-in for the model. To get
the table of the day, the two steps were run on the state of the repository committed on 9 October 2026. The trial
count of the same morning, before the code was in the repository, is `results/catalogue-units/`.
