# Run: a whole form as a questionnaire in one call

The run behind the entry "Can the model turn a whole form into a questionnaire in one call?" in `docs/tests.md`.

- `calls/70b/call-<k>.json`, `calls/8b/call-<k>.json` – one call per form with the large and with the small model, in
  the order they were made: `arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`, `schadenmeldung-uvg`,
  `suva-bagatellunfall`. Each file is the call as the client logged it: the prompt, the model, the temperature, the
  room for the answer, the duration, the status and the raw answer.
- `calls/8b-bundles/call-<k>.json` – the small model on the first two forms, six fields per call; the tag names the
  form and the fields of the bundle. 16 and 9 calls.
- `result.md` – the counts.

How it was made: the fields of the four forms that shipped on 9 October 2026 are built without a model (geometry and
form fields, the text layer standing in for the reading). A page goes into the prompt as a picture of text, 120
columns wide: every printed text at its place and every field at its place as `[f12] ____`, `[f13] [ ]`, `[f14] ( )`
or `[f15] (Unterschrift)`. The model is asked for one question per field in the order of the form, tick boxes that
belong together as one question, an offered answer where one is at hand, and JSON as the answer; in bundles it is
asked for one line per field. The room for the answer is 60 tokens per field plus 600, at most 12 000; 600 for a
bundle.

The tags and the prompts are German, as the forms are. The shipped forms were set right on 11 October 2026, so the
field ids of these prompts are those of the day of the run.
