# Run: the fields of a form as units to ask for

The count behind the entry "How many units to ask for do the fields of the shipped forms make?" in `docs/tests.md`. No
model was called.

- `units.json` – the units of the four forms as the code built them on 9 October 2026: per form a list of units in the
  order of the form, each with its id (`q1` …), its kind (`single`, `mark` for a single tick box, `choice`, `table`
  with rows and columns), its page and its fields. A field carries its id, the label the pipeline found printed at it,
  and the name of the form field of the PDF that lies on it (empty where there is none; the Suva form has no form
  fields).
- `result.md` – the count per form.

The other runs of the same day (`results/catalogue-*/`) use these units and their ids; their prompts show them as
`[q7]` at the place of each field.

How it was made: the geometry runs over the pages of the forms in `data/forms/` (`make test`), the fields are built
from its elements (`src/fields/builder.js`), and a rule groups them into units. That rule became
`src/dialogue/units.js`. The shipped forms were set right on 11 October 2026 (`docs/evidence.md`, section 9), so the
forms of today give other counts; this file keeps those of the day.
