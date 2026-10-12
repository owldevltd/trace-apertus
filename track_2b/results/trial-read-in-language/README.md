# Run: the value read in the language that was spoken

The run behind the entry "Does reading in the person's language keep the origin of a value?" in `docs/tests.md`.

- `calls/fr/call-<k>.json`, `calls/en/call-<k>.json` – every call to the model as the client logged it: the prompt,
  the model, the temperature, the duration, the status and the raw answer, 30 calls per language in the order they
  were made. Calls 1 to 9 are the Betreibungsbegehren, calls 10 to 30 the Suva form; the first call of a form is the
  respondent (`lesen gegenüber`), the others read one answer each (`lesen füllen`, with the unit).
- `result.md` – every answer with the value read from it and its origin.

How it was made: the two walk-through forms with their made-up dictations (`src/app/js/mock/forms.js`) and the
questions stored for them (`src/app/js/mock/dialogues.js`), as they were on 9 October 2026; the units with a made-up
value are asked. The respondent is the small model: it is given the German dictation as what it has told about its
case and answers the German questions in French or English. Every answer to a single written field goes to the model
with the prompt of `src/fields/filler.js`, that one field and one line more: "Die Antwort im Gespräch ist auf
Französisch. Schreibe den Wert so, wie er gesagt wurde, auf Französisch; übersetze nichts." Tick marks are not read in
this run. The calls were made in the same script run as the first pass of `results/trial-translate-values/`, after it.
