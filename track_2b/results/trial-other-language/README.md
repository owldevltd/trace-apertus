# Run: asked and answered in another language, the value written in German in one step

The run behind the entry "Can the person be asked and answer in a language the form is not printed in?" in
`docs/tests.md`.

- `dictations.json` – the made-up German dictations of the two walk-through forms, the only thing the respondent
  knows.
- `expected.json` – for every field of the two forms its label, its kind and the made-up German value the walk-through
  sets for it, with the state the walk-through gives that value. Written before the run.
- `calls/<language>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per language in the order they were made: `de` 43
  calls, `fr`, `it` and `en` 55 each. Within a language the Betreibungsbegehren comes first, then the Suva form. Per
  form: the questions are written in the language (`sprache fragen`, not in German), checked twice (`check run <r>
  page 1`), the respondent answers all questions in one call (`sprache gegenüber`), and every answer is read in a call
  of its own (`sprache füllen`, with the unit).
- `result.md` – the questions with what the check named, and every value against the German value expected.

How it was made: the two walk-through forms with their made-up values and dictations (`src/app/js/mock/forms.js`) and,
for German, the questions stored for them (`src/app/js/mock/dialogues.js`), as they were on 9 October 2026. The
questions in French, Italian and English are written from the German list of lines with the prompt of
`src/dialogue/writer.js` and one line more, "dein Gegenüber spricht Französisch: schreibe jede Frage auf Französisch",
then checked and decided by the code of the repository. A unit without a question that holds is asked with its printed
label. The respondent is the small model: it is given the German dictation as what it has told about its case and
answers in the language. Every answer goes to the model with the prompt of `src/fields/filler.js`, the fields of its
unit and one line more: "Die Antwort im Gespräch ist auf Französisch. Schreibe jeden Wert auf Deutsch, so wie er in
das deutsche Formular gehört; Namen, Adressen und Nummern bleiben, wie sie gesagt wurden." In German number words in
the answer are turned into digits by code first; in the other languages they are not.
