# Run: a field with a list of values, through the server

The run behind the entry "Does a field with a list of values take the right entry through the server?" in
`docs/tests.md`.

- `cases.json` – the form, the field, the list given to it and the three typed answers. Made up.
- `calls/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the temperature,
  the duration, the status and the raw answer.
- `result.md` – what stood in the field after each answer.

How it was made: the shipped form is kept as a form of its own with the list at the field (`values` of the field); a
job is opened on it and the answer is typed to the question of the field (`POST /api/jobs/<id>/answers/<question>`);
for case C the same on the shipped form without the list.
