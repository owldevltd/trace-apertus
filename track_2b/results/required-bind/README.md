# Run: the required entries of a catalogue bound to the units of the dialogue

The run behind the entry "Which way binds the required entries of a catalogue to the questions?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 14 calls in the order they were made: per form and model one call per page with asked
  units. The tag is `bind <8B|70B> <form> page <n>`. Each call file is the call as the client logged it: the prompt,
  the model, the temperature, the room for the answer, the duration, the status and the raw answer.
- `reference.json` – per form the required entries of its catalogue, each with the units of the dialogue it is entered
  at (`units`, the reference) and the units the label of a field binds it to by code (`bound_by_label`); and the units
  of the form as they were that day, with page, kind, whether they are asked, and the printed label. The reference was
  set after the run, with the lists of lines of the pages beside the catalogue.
- `result.md` – six ways of binding against the reference.

How it was made: the forms are the four captured forms of 9 October 2026 (`data/forms/<form>/captured.json`) with
their catalogues (`data/catalogues/<form>.json`). The prompt holds a page as a list of lines, as
`src/dialogue/listing.js` writes it, and the required entries with their requirement, numbered; the model returns the
ids of the units for each number, or an empty list. The calls were made in one run together with those of
`results/required-without-catalogue/`, alternating; here they are numbered in their own order. The captured forms were
set right on 11 October 2026 and hold other units since.
