# Run: one answer to a list, one entry or several

The run behind the entry "One answer to a list: one entry, or several?" in `docs/tests.md`.

- `answers.json` – seven made-up answers to the question of a list, as text: five on `betreibungsbegehren`
  (further claims) with 0, 1, 1, 2 and 3 entries (B0, B1, B1b, B2, B3), two on `arbeitsfaehigkeitszeugnis`
  (periods of full incapacity for work) with 1 and 2 entries (Z1, Z2).
- `expected.json` – for each answer the columns of the list and the entries the answer names, cell by cell. In
  the first cell of a claim it is the keyword that has to occur there; "" is a cell that stays empty.
- `calls/run-1/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. One call per answer; call k is answer k of
  `answers.json`.
- `result.md` – the entries read from each answer of the model against the expected ones, and the counts.

How it was made: the question of the list and the made-up answer go to the model as text, the way the transcript
of an answer does, as one piece with its id in front ("[p1] Frage: … Antwort: …"); no recording is involved. The
prompt gives the labels of the columns and asks for a block per entry, the word EINTRAG and below it a line per
column in the form "Nummer: Wert", or the word KEINE where no entry was named. The question is the one the form
held for its list when the run was made; it stands in the prompt of each call.

The answers are read by the order of the lines in a block. That rule was set after the run, when the answers
showed a number in front of a value in some blocks and words in others; `result.md` gives both counts.
