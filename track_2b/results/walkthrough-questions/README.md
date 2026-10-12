# Run: the questions of the two walk-through forms

The run behind the entry "Do the questions written for the walk-through's forms hold in the check?" in
`docs/tests.md`.

- `calls/call-<k>.json` – the 12 calls in the order they were made: calls 1 to 5 for the Betreibungsbegehren of the
  walk-through, calls 6 to 12 for its Suva form. A call tagged `questions page 1` writes the questions of a form; a
  call tagged `check run <r> page 1` gets up to twelve of them without their ids and names the unit of each. Each call
  file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer, the
  duration, the status and the raw answer.
- `result.md` – what holds per form, and every question with the units named for it.

How it was made: `make walkthrough` (`tools/dialogue.js`) builds the dialogue of the two forms of the walk-through
(`src/app/js/mock/forms.js`) with the code the pipeline runs for a captured form (`src/dialogue/`). A form of the
walk-through has no text blocks, so its section titles and labels become the lines of the list, in the order of its
definition. The tool writes its result to `src/app/js/mock/dialogues.js`. In `result.md` the unit behind a letter of a
check is found by rebuilding the mixing of `src/dialogue/checker.js`; the rebuilt order is held against the questions
in each prompt.
