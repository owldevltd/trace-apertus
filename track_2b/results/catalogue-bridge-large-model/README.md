# Run: the large model writes for given units, and checks back

The run behind the entry "Does the large model write the questions when the units are given, and does its check back
confirm them?" in `docs/tests.md`.

- `calls/write/call-<k>.json` – one call per form (`arbeitsfaehigkeitszeugnis`, `betreibungsbegehren`): the form as a
  picture of text with the ids of the units, the list of tables and choices, and the printed label of every unit. Tag
  `einheiten-etikett-70b <form>`.
- `calls/check/call-<k>.json` – the check back, 6 calls per form: two runs (`Lauf 1`, `Lauf 2`) of three calls with up
  to twelve questions each, mixed differently per run. Tag `rückprobe einheiten-etikett-70b <form> Lauf <r>`. Each
  call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer, the
  duration, the status and the raw answer.
- `result.md` – what was written, what the two runs name, and every question.

How it was made: the prompt for writing is the one of `results/catalogue-plain-questions/` with the labels, sent to
the large model; the units are those of `results/catalogue-units/units.json`. The check back is the way back of
`results/catalogue-bridge/`: the questions of a page without their ids, lettered, with the page; the model returns the
id of the unit for each letter.
