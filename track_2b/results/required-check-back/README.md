# Run: a check back on the units the models name for a required entry

The run behind the entry "Does a check back sort out the wrong units of a required entry?" in `docs/tests.md`.

- `calls/both-name/call-<k>.json` – 15 calls, one per unit that both models had named for a required entry the label
  does not bind. The tag is `back <form> <unit>`.
- `calls/one-names/call-<k>.json` – 31 calls, one per unit only one of the two models had named for such an entry.
  Each call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer,
  the duration, the status and the raw answer.
- `result.md` – every unit with the entry the check back names for it, and what is bound in the end.

How it was made: the units come from the answers of `results/required-bind/`. A call holds the page of the unit as a
list of lines, the id of the unit, and the required entries of the form lettered A, B, C …; the model answers with one
letter, or with the word KEINE when no entry fits the place. A unit named for an entry is kept when the letter is that
of the entry. The reference and the units of the day are in `results/required-bind/reference.json`.
