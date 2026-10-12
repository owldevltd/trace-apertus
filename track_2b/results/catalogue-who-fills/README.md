# Run: who fills in which place

The run behind the entry "Does the small model tell who fills in which place of a form?" in `docs/tests.md`.

- `calls/call-<k>.json` – one call per form (`arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`, `schadenmeldung-uvg`,
  `suva-bagatellunfall`), as the client logged it: the prompt, the model, the temperature, the room for the answer,
  the duration, the status and the raw answer. Tag `wer <form>`.
- `result.md` – what the model names per form, and the count against the two references.

How it was made: the prompt holds the form as a picture of text with the id of its unit at every place, and the
printed label of every unit. The model is asked to list the parties that fill in something on the form, as the form
names them, and to write for every id which of them fills in the place, or "unklar" where the form does not say. The
units are those of `results/catalogue-units/units.json`. The references need nothing set for the trial: the sections
of the rebuilt certificate in `tools/forms/arbeitsfaehigkeitszeugnis.js`, and the form fields of the PDF of the
Betreibungsbegehren.
