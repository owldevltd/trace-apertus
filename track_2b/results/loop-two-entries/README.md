# Run: two answers to a list of entries, one after the other

The run behind the entry "Does a list of entries take one answer per row?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 8 calls in the order the server made them, four per answer: `answer q13` reads the
  answer into the fields of a row, `vague <field>` holds a value against the catalogue, `suggest <field>` looks for a
  better passage in what was said. Each call file is the call as the client logged it: the prompt, the model, the
  temperature, the room for the answer, the duration, the status and the raw answer.
- `conversation-two-entries.png`, `one-entry-asked-for-more.png`, `asked-for-more.png`, `after-yes.png` – the
  conversation in the app; all values are made up.
- `result.md` – what each answer was read into, the judgements of the catalogue, and what the pictures show.

How it was made: a job is opened from the shipped form (`POST /api/jobs/from/betreibungsbegehren`) on a server of its
own with the model key set. Two answers are typed one after the other to the unit of the further claims (q13), a table
whose cells are all labelled and whose rows carry the labels of the first (`repeat` in `src/dialogue/units.js`). The
server reads an answer into the first free row. The pictures of the conversation without a model come from the same
server started without a key. The two typed answers stand in the prompts of calls 1 and 5.
