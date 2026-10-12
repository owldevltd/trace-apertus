# Run: a form in another language than its own

The run behind the entry "Can a form be filled in in another language than its own?" in `docs/tests.md`.

- `calls/<language>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per language in the order they were made.
  French (`fr`), Italian (`it`) and English (`en`) were run one after the other, 33 calls each.
- Within a language calls 1 to 12 are the Betreibungsbegehren and calls 13 to 33 the Suva form. For each form the
  stored German questions are translated (`translate questions page <n>`), then the labels and options (`translate
  labels page <n>`), and the translated questions are checked twice (`check run <r> page <n>`); then the made-up
  German values are put into the other language by the large model (`there <language> <form>`), and every such
  value with a letter in it is translated back in a call of its own (`translate value <field>`).
- The evaluation is the report beside this folder, `results/translate.md`: the questions that hold after
  translation, and every value against the German value it started from.

The forms are the two walk-through forms with their made-up values (`src/app/js/mock/forms.js`) and the questions
stored for them (`src/app/js/mock/dialogues.js`).

How it was made: `make dialogue`, which runs `tests/translate.js` last, with swiss-ai/Apertus-v1.5-8B at
temperature 0 and swiss-ai/Apertus-v1.5-70B as the large model.

Checked against the report: 99 calls, all made on 9 October 2026, the date in the report's header, and all
answered; six of them to the large model. Each language has 14 calls for the dialogue and 17 for the values, as in
the report's two tables.
