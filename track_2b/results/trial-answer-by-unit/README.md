# Run: every answer read for the fields of its question

The run behind the entry "Does the filling put every answer into the fields of its question?" in `docs/tests.md`.

- `calls/small-model-questions/call-<k>.json`, `calls/large-model-questions/call-<k>.json` – every call to the model
  as the client logged it: the prompt, the model, the temperature, the duration, the status and the raw answer, 9
  calls per conversation in the order they were made, one per question the respondent had an answer to. The tag is
  `e2e füllen-repo`, the model that wrote the questions (`8b`, `70b`) and the unit.
- `result.md` – every field with the model's lines, the value read with and without the rule for a unit of one field,
  and the verdict.

The questions and answers are those of `results/trial-played-conversation/`; the expected values are its
`expected.json`.

How it was made: for every unit whose answer is not "Das weiss ich nicht." the answer, with number words turned into
digits, goes to the model as one piece "Frage: … Antwort: …" with the prompt of `src/fields/filler.js` and the fields
of that unit; the answer is read by the reader of the same file. A tick mark is set where the line says yes, a date is
written the Swiss way, the origin is taken by code at the answer. The second count is made from the same 18 answers,
no further call.
