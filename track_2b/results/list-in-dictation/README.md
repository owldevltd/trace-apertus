# Run: a list of entries from a dictation in one go

The run behind the entry "Can a list of entries be read from a dictation in one go?" in `docs/tests.md`.

- `dictations.json` – six made-up dictations as text: four on `betreibungsbegehren` that name the claim itself
  and 0, 1, 2 and 3 further claims (B0 to B3), two on `arbeitsfaehigkeitszeugnis` that name 1 and 2 periods of
  full incapacity for work (Z1, Z2).
- `expected.json` – for each dictation the columns of the list and the entries the dictation names for it, cell
  by cell: what has to stand in the rows of the list afterwards. In the first cell of a claim it is the keyword
  that has to occur there; "" is a cell that stays empty.
- `calls/<group>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered in the order they were made. The groups:
  - `bundles-B0/`, `bundles-B2/` – the 36 cells of the list of further claims as fields of their own, six a
    call, for the dictations B0 and B2;
  - `list-alone/` – one call per dictation for the list by itself; call k is dictation k of `dictations.json`;
  - `list-with-fields-named/` – the same with the values of the other fields named; call k is dictation k.
- `result.md` – what each way put into the rows against the expected entries, and the counts.

How it was made: a dictation goes to the model as text, the way a transcript does, as one piece with its id in
front ("[p1] …"); no recording is involved. In bundles the cells are read with the fill prompt of the app, each
with its label and its kind as the given, an answer line per field. For the list alone the prompt gives the
question of the list and the labels of its columns and asks for one line per entry, the values split by "|", or
the word KEINE where no entry was said. With the other fields named the prompt adds the values of the dictation
that stand in other fields of the form (the values a right filling of those fields would give) and asks for a
block per entry: the word EINTRAG and a numbered line per column. The lists are those of the two forms as they
ship: 9 rows of 4 columns for further claims, 3 rows of 5 columns for periods of full incapacity for work.
