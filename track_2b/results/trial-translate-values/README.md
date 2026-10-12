# Run: translating the values back into German

The run behind the entry "Can the values be translated in bundles?" in `docs/tests.md`.

- `values.json` – the 84 values (28 per language): the form, the field, its printed label, its running number, the
  made-up German value, what the large model made of it in the other language (`given`), and whether that changed it
  (`isLanguage`).
- `calls/pass-1-field-table/call-<k>.json` (36 calls) – per language and form: the large model puts the German values
  into the language (`hin`), then the values come back from the small model with the whole form in one call (`zurück
  8b ganz`), from the large model likewise (`zurück 70b ganz`) and from the small model six per call (`zurück 8b
  sechs`). 12 of the 36 calls went to the large model.
- `calls/pass-2-numbered/call-<k>.json` (24 calls) – the stricter wording with running numbers: the large model with
  the whole form (`zurück2 70b`, 6 calls) and the small model six per call (`zurück2 8b sechs`).
- `calls/pass-3-one-value-per-call/call-<k>.json` (84 calls) – the small model, one value per call (`einzeln`, with
  the language, the form and the field).
- `calls/pass-4-question-in-front/call-<k>.json` (36 calls) – the small model, six per call, each bundle once with the
  question in front of every value (`werte sechs frage`) and once without (`werte sechs`).
- Every `call-<k>.json` is a call to the model as the client logged it: the prompt, the model, the temperature, the
  duration, the status and the raw answer, numbered per pass in the order they were made.
- `result.md` – every pass against the German value it started from.

How it was made: the written made-up values of the two walk-through forms (`src/app/js/mock/forms.js`, as they were on
9 October 2026; tick marks left out), 8 of the Betreibungsbegehren and 20 of the Suva form. The way there was made
once, in pass 1; passes 2 to 4 take the values in the other language from its answers. The questions of pass 4 are
those stored for the walk-through (`src/app/js/mock/dialogues.js`). Pass 4 was run in one script with
`results/trial-translate-questions/`, after it.
