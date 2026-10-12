# Result: the units of the shipped forms, as the repository's test counts them

Counted without a model by `tests/dialogue.js` on the four forms that shipped on 9 October 2026, the text layer of the
PDFs standing in for the reading. The table is the one the test writes, run again on the state of the repository
committed that day ("Dialogue: the form asked and answered as a conversation"); it gives the numbers recorded on the
day.

Not asked: a unit of a form with form fields that lies on no form field of its kind. In order: two neighbouring units
of a page stand in the order of their form fields in the PDF; a printed form states no order, so the Suva form has no
count.

| form | pages | fields | units | single | choices (tick marks) | tables (cells) | not asked | asked, without a label | in order |
|---|---:|---:|---:|---:|---|---|---:|---:|---|
| arbeitsfaehigkeitszeugnis | 1 | 92 | 36 | 28 | 6 (13) | 2 (51) | 1 | 2 | 30 of 34 |
| betreibungsbegehren | 2 | 44 | 17 | 15 | 1 (2) | 1 (27) | 5 | 0 | 10 of 11 |
| schadenmeldung-uvg | 2 | 128 | 96 | 79 | 16 (34) | 1 (15) | 23 | 1 | 68 of 71 |
| suva-bagatellunfall | 4 | 143 | 110 | 103 | 6 (16) | 1 (24) | 0 | 34 | – |
| all |  | 407 | 259 | 225 | 29 (65) | 5 (117) | 29 | 37 | 108 of 116 |

## The checks of the test

70 checks, 0 failed: 17 per form and 2 on the end of a spoken answer. For the rule that decides which question holds,
a stand-in answers instead of the model. When the test was first run, at midday of 9 October 2026, 40 checks were
recorded, ten per form, none failed; the test as committed that afternoon holds the 70 listed here.

Per form:

- every field except the signature is in exactly one unit
- units are numbered in the order of the pages
- every text block is a line of the list
- the list names every unit that is asked and no other
- the units have the keys and kinds of the contract
- a unit that is not asked never reaches the model
- a question every run assigns to its own unit holds
- "KEINE" leaves the printed label
- two units asked with the same words both keep the label
- a question one run assigns elsewhere does not hold
- ß becomes ss
- the answer to a single field is its value, whatever name the line carries
- an answer reaches the fields of its unit only
- an answer the model finds incomplete gets a hint that says what is missing
- saying the rest at once keeps what was answered question by question
- the dictionary of the prompt is cut off a transcript, what was said before it stays
- the dictionary holds no label of a place that is not asked

Once:

- an answer ends once, at the first pause of 1.5 s after speech; a shorter pause or silence alone ends nothing
- a crackle before a pause is no answer, and is forgotten

The shipped forms were set right on 11 October 2026 and a fifth form was added (`docs/evidence.md`, section 9); `make
test` on the repository of today writes the table of today to `storage/tests/dialogue.md`.
