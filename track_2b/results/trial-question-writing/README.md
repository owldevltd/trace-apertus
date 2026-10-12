# Run: the small model writes the questions of a form

The run behind the entry "Can the small model write the questions of a form from its list of lines?" in
`docs/tests.md`. The entries "How many questions of a page are worded like another?" and "How do the questions read
beside the printed labels?" are counted from the same questions.

- `units.json` – the 259 units of the four forms as the trial used them: the id, the kind (`single`, `choice`,
  `table`), the page, the printed labels of the unit's fields and, per field, the name of its form field in the PDF
  (empty where the PDF has none). The units were built by code in an earlier trial of the same day; no model takes
  part in them.
- `calls/<writing>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per writing in the order they were made.
  `whole-form/` holds one call per form (4), `page-by-page/` one call per page (8), `bundles-of-twelve/` one call per
  twelve units of a page (25). The tag of a call names the writing (`d-8b-whole`, `d-8b-page`, `d-8b-bundle`), the
  form and, where a page was written, the page (`S1`).
- `questions.json` – the question of every unit per writing, as read from the answers; `null` where the model returned
  no line. Under `large-model` stand the questions the large model wrote for the same units in an earlier trial of the
  same day; they are the comparison and the questions two other runs ask (`results/trial-played-interview/`,
  `results/trial-question-check/`).
- `result.md` – what was written, the shape of the questions, and the counts made from them without a call.

The forms are the four that shipped on 9 October 2026: `arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`,
`schadenmeldung-uvg` and `suva-bagatellunfall` in `data/forms/`, their text taken from the text layer of the PDFs.
They were corrected on 11 October; the prompts in `calls/` hold the lists of lines as they were.

How it was made: code turns a form into a list of lines in the order of the paper, every text a line and none left
out, with the id of a unit behind the text that labels it. The prompt holds that list and asks for one question per id
in everyday words, from the seat of the person who leads the conversation, with a named party asked about in the third
person, and "KEINE" where there is nothing to ask. The same prompt goes out with the whole form, with one page, or
with one page and the twelve ids to write for. swiss-ai/Apertus-v1.5-8B, temperature 0, one call after the other.
