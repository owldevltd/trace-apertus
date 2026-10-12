# Run: one plain question per unit from the small model

The run behind the entry "Does the small model write a plain question for every unit of a form?" in `docs/tests.md`.

- `calls/without-labels/call-<k>.json` – one call per form (`arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`,
  `schadenmeldung-uvg`, `suva-bagatellunfall`): the form as a picture of text with the id of its unit at every place,
  and the list of the tables and choices. Tag `einheiten <form>`.
- `calls/with-labels/call-<k>.json` – the same with one more block in the prompt: for every unit the label printed at
  its fields, or "keine Beschriftung an der Stelle, siehe Umgebung". Tag `einheiten-etikett <form>`.
- `result.md` – how many units got a question, the language of the questions, and every question of both runs side by
  side.

Each call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer,
the duration, the status and the raw answer.

How it was made: the units are those of `results/catalogue-units/units.json`. The prompt demands everyday words, short
sentences, no abbreviations, no brackets and no official language, the options of a choice named, every entry of a
table asked for, nothing invented and no id left out, and JSON as the answer. The room for the answer is 70 tokens per
unit plus 600.
