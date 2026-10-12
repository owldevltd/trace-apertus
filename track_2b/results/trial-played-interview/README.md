# Run: a played respondent who knows only the names of the PDF's form fields

The run behind the entry "Does a question lead a respondent to the form field it asks for?" in `docs/tests.md`.

- `controls.json` – the two controls, per form and unit: under `label-as-question` the printed label of the unit as
  its question, under `next-places-question` the question the large model wrote for the next unit of the same page.
- `calls/<questionnaire>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per questionnaire in the order they were made, 11
  calls each: 3 for the certificate, 1 for the Betreibungsbegehren, 7 for the accident report. `label-as-question/`
  and `next-places-question/` are the controls; `large-model/` asks the questions the large model wrote,
  `whole-form/`, `page-by-page/` and `bundles-of-twelve/` those of the small model. The tag of a call is `interview`,
  the questionnaire (`k-label`, `k-shift`, `d-70b-whole`, `d-8b-whole`, `d-8b-page`, `d-8b-bundle`) and the form.
- `result.md` – how many questions lead to the name of their own form field, per questionnaire and form.

The questions asked are those of `results/trial-question-writing/questions.json`; the units and the names of their
form fields are in `results/trial-question-writing/units.json`.

How it was made: per page the names of its form fields are mixed in a fixed order and given tokens K101, K102, …; the
questions of the page are mixed in a fixed order and asked twelve at a time. The prompt says "Du kennst genau diese
Angaben", lists the tokens with the names, lists the questions under letters and asks for the token of the one entry
each question asks for. swiss-ai/Apertus-v1.5-8B, temperature 0. The calls were made in this order: the two controls
and the large model's questions first, then the three writings of the small model.
