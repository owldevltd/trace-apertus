# Run: questions written from the interviewer's seat

The run behind the entry "From whose seat does the model write?" in `docs/tests.md`.

- `calls/70b/call-<k>.json`, `calls/8b/call-<k>.json` – one call per form (`arbeitsfaehigkeitszeugnis`,
  `betreibungsbegehren`, `schadenmeldung-uvg`, `suva-bagatellunfall`) with the large and with the small model. Tags
  `einheiten-etikett-interview-70b <form>` and `einheiten-etikett-interview <form>`. Each call file is the call as the
  client logged it: the prompt, the model, the temperature, the room for the answer, the duration, the status and the
  raw answer.
- `result.md` – the language of the questions against the runs before, what the models write where there is nothing to
  ask, the places about a third party, and every question.

How it was made: the prompt is the one of `results/catalogue-plain-questions/` with the labels, with two additions.
Before the task: "Du bist die Person, die das Gespräch führt, wie in einem Interview: du fragst, dein Gegenüber
antwortet, und du selbst schreibst die Antworten danach ins Formular. Du sprichst also nicht als das Formular." As the
first rule: "frage nach der Sache selbst; bitte dein Gegenüber nie, etwas einzutragen, anzukreuzen oder auszufüllen,
und sprich nicht vom Formular, von Feldern, Zeilen, Spalten oder Kästchen". The units are those of
`results/catalogue-units/units.json`.
