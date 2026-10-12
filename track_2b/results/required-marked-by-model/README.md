# Run: required, marked by the model

The run behind the entry "Can the model mark what is required when the catalogue is built?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 12 calls in the order they were made, three per form (`betreibungsbegehren`,
  `suva-bagatellunfall`, `arbeitsfaehigkeitszeugnis`, `schadenmeldung-uvg`): `catalogue with required <form>` builds
  the catalogue anew, `required 70B <form>` and `required 8B <form>` mark the entries of the checked catalogue. Each
  call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer, the
  duration, the status and the raw answer. Call 10 has the status 504 and the error body of the gateway as its answer.
- `result.md` – what the models mark against the mark of the checked catalogues.

How it was made: the text of a captured form goes to the large model with the prompt of `src/review/catalogue.js` and
one sentence more, asking for "pflicht": "ja|nein" per entry; the room for the answer is 8 000 tokens. For the
marking, the prompt holds the text of the form and the entries of the checked catalogue with their requirement and
source, numbered, without the mark; the model returns the numbers of the required ones. Both prompts state the rule:
required is an entry only when the law demands it or the form does not serve its purpose without it; what holds in
certain cases only, or what the receiving office fills in, is not. The checked catalogues are
`data/catalogues/<form>.json`.
