# Run: the small model checks the questions

The run behind the entry "Does the small model's check of the questions hold, and what does it let through?" in
`docs/tests.md`. Four more entries are counted from these answers without a call: the neighbour's question with the
same wording, the units without a printed label, the order of the list of lines, and what a form costs.

- `calls/<questionnaire>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model,
  the temperature, the duration, the status and the raw answer, numbered per questionnaire in the order they were
  made. `whole-form/` (50 calls) and `page-by-page/` (48) check the questions the small model wrote, `large-model/`
  (48) those of the large model. Within a questionnaire the calls go form by form, and within a form run 1 comes
  before run 2. The tag of a call is `prüfen` (check), the questionnaire (`d-8b-whole`, `d-8b-page`,
  `d-70b-whole`), the form and the run (`Lauf 1`, `Lauf 2`).
- `result.md` – what holds, what the check lets through, and the four counts named above.

The questions checked are those of `results/trial-question-writing/questions.json`; the units are in
`results/trial-question-writing/units.json`.

How it was made: the questions of a page are mixed in a fixed order that differs from run to run, and go out twelve at
a time under the letters A to L, with the list of lines of the page in front. The prompt asks for the id of the place
where the answer to each question is entered. swiss-ai/Apertus-v1.5-8B, temperature 0, two runs per questionnaire. The
size of twelve was set for the trial and not measured against other sizes.
