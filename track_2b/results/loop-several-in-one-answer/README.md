# Run: one answer with several entries, through the server

The run behind the entry "Does one answer that names several entries fill several rows?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 12 calls in the order the server made them: `entries q13` reads how many entries an
  answer names and what belongs to each (calls 1, 8 and 12), `vague <field>` holds a value against the catalogue,
  `suggest <field>` looks for a better passage in what was said. Each call file is the call as the client logged it:
  the prompt, the model, the temperature, the room for the answer, the duration, the status and the raw answer.
- `result.md` – the entries read from each answer and the rows they went into.

How it was made: a job is opened from the shipped form (`POST /api/jobs/from/betreibungsbegehren`) on a server of its
own with the model key set, and an answer is typed to the unit of the further claims (q13) without naming a row. The
server asks the model for a block per entry (`entriesPrompt`, `fillEntries` in `src/fields/filler.js`) and writes each
entry into the next free row. Calls 1 to 11 belong to the first job, call 12 to a second one. The typed answers stand
in the prompts of calls 1, 8 and 12. The seven answers this reading was first tried on are in
`results/list-in-answer/`.
