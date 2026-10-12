# Run: the questions of the shipped forms, written and checked

The run behind the entry "Do the questions written for a form hold in the check?" in `docs/tests.md`.

- `calls/<form>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per form in the order they were made. A call
  tagged `questions page <n>` gets a page as a list of lines and writes a question for every place on it. A call
  tagged `check run <r> page <n>` gets the same list and up to twelve of the questions without their place, and
  names the place of each. 7 calls write, 40 check.
- The evaluation is the report beside this folder, `results/dialogue.md`: what holds on each form, what the check
  lets through when a place is handed the question of another place, and what a form costs.

The forms are the four that shipped on the day of the run, `arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`,
`schadenmeldung-uvg` and `suva-bagatellunfall` in `data/forms/`, read from the text layer of their PDFs.

How it was made: `make dialogue`. The geometry runs over the pages of the forms (`src/cli.js analyze`), then
`tests/questions.js` builds the dialogue of each form with swiss-ai/Apertus-v1.5-8B at temperature 0, as the
pipeline does for a captured form.

Checked against the report: 47 calls, all made on 9 October 2026, the date in the report's header, and all
answered. The forms have 7, 3, 16 and 21 calls, and the tokens in and out of each form's calls add up to the
figures in the report's table of costs.
