# Result: a whole form as a questionnaire in one call

Runs of 9 October 2026 at temperature 0: swiss-ai/Apertus-v1.5-70B and swiss-ai/Apertus-v1.5-8B, each with one call
per form on the four forms; then swiss-ai/Apertus-v1.5-8B on two forms in bundles of six fields, one call per bundle.
33 calls, all answered with status 200 and ended by the model (`stop`). Counted again from the answers in `calls/`.

A field counts as covered when a question names its id; an id counts as not on the form when the prompt does not show
it. Two words are shared when they are equal or begin with the same five letters, words of four letters and more; this
measure is a lower bound, since a right question need not repeat a word of the label. The printed labels and the names
of the form fields are those of `results/catalogue-units/units.json`; the Suva form has no form fields.

|  | 70B, four forms | 8B, four forms | 70B, two forms | 8B, two forms | 8B in bundles of six, two forms |
|---|---|---|---|---|---|
| calls | 4 | 4 | 2 | 2 | 25 |
| seconds at the model | 121 | 66 | 44 | 28 | 23 |
| tokens in | 10911 | 10911 | 4871 | 4871 | 37178 |
| fields to ask for (without signatures) | 407 | 407 | 136 | 136 | 136 |
| answers that are valid JSON | 4 of 4 | 4 of 4 | 2 of 2 | 2 of 2 | lines, not JSON |
| questions | 136 | 286 | 64 | 137 | 135 |
| fields covered by a question | 336 | 392 | 132 | 132 | 135 |
| ids that are not on the form | 0 | 0 | 0 | 0 | 0 |
| fields asked a second time | 7 | 4 | 0 | 4 | 0 |
| questions for one field / for 2 to 4 / for 5 and more (largest) | 75 / 49 / 11 (35) | 267 / 12 / 7 (28) | 47 / 15 / 2 (35) | 137 / 0 / 0 (1) | 135 / 0 / 0 (1) |
| tick boxes and radios asked in a question for several fields | 65 of 85 | 22 of 85 | 18 of 19 | 0 of 19 | 0 of 19 |
| fields without a printed label: covered | 115 of 137 | 137 of 137 | 68 of 69 | 69 of 69 | 69 of 69 |
| question shares a word with the printed label | 163 of 244 | 158 of 244 | 44 of 55 | 36 of 55 | 40 of 55 |
| question shares a word with the name of the form field in the PDF | 154 of 240 | 145 of 240 | 80 of 130 | 59 of 130 | 61 of 130 |
| order of the form kept, per form | 84–98 % | 85–100 % | 86–98 % | 85–94 % | 100 % |
| questions ending on a question mark, per form | 29–57 % | 72–100 % | 32–57 % | 94–100 % | 80–100 % |
| words per question, median per form | 10–20 | 6–12 | 10–13 | 6–9 | 9–10 |
| offered answers | 0 | 6 | 0 | 5 | 42 |

The two forms of the bundles are `arbeitsfaehigkeitszeugnis` and `betreibungsbegehren`.

## Per form

| variant | form | calls | seconds | fields | questions | covered | ids not on the form | asked twice | tick marks in a group question | shares a word with the label | shares a word with the PDF name | order kept | offers |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|---:|---:|
| 70b | arbeitsfaehigkeitszeugnis | 1 | 21 | 92 | 22 | 88 | 0 | 0 | 16 of 16 | 30 of 37 | 60 of 91 | 98 % | 0 |
| 70b | betreibungsbegehren | 1 | 23 | 44 | 42 | 44 | 0 | 0 | 2 of 3 | 14 of 18 | 20 of 39 | 86 % | 0 |
| 70b | schadenmeldung-uvg | 1 | 42 | 128 | 41 | 92 | 0 | 3 | 25 of 43 | 65 of 105 | 74 of 110 | 93 % | 0 |
| 70b | suva-bagatellunfall | 1 | 35 | 143 | 31 | 112 | 0 | 4 | 22 of 23 | 54 of 84 | 0 of 0 | 84 % | 0 |
| 8b | arbeitsfaehigkeitszeugnis | 1 | 19 | 92 | 97 | 92 | 0 | 4 | 0 of 16 | 25 of 37 | 36 of 91 | 94 % | 4 |
| 8b | betreibungsbegehren | 1 | 9 | 44 | 40 | 40 | 0 | 0 | 0 of 3 | 11 of 18 | 23 of 39 | 85 % | 1 |
| 8b | schadenmeldung-uvg | 1 | 26 | 128 | 120 | 117 | 0 | 0 | 0 of 43 | 78 of 105 | 86 of 110 | 100 % | 1 |
| 8b | suva-bagatellunfall | 1 | 12 | 143 | 29 | 143 | 0 | 0 | 22 of 23 | 44 of 84 | 0 of 0 | 100 % | 0 |
| 8b-bundles | arbeitsfaehigkeitszeugnis | 16 | 16 | 92 | 92 | 92 | 0 | 0 | 0 of 16 | 27 of 37 | 46 of 91 | 100 % | 26 |
| 8b-bundles | betreibungsbegehren | 9 | 7 | 44 | 43 | 43 | 0 | 0 | 0 of 3 | 13 of 18 | 15 of 39 | 100 % | 16 |

## The offered answers of the calls for a whole form

| variant | form | field | kind | printed label | offer | question |
|---|---|---|---|---|---|---|
| 8b | arbeitsfaehigkeitszeugnis | f1 | radio | w | heute | Welches Geschlecht ist angegeben (w oder m)? |
| 8b | arbeitsfaehigkeitszeugnis | f88 | radio | ja | ja | Ist ein Kontakt mit dem Arbeitgeber erwünscht? |
| 8b | arbeitsfaehigkeitszeugnis | f89 | radio | nein | nein | Ist kein Kontakt mit dem Arbeitgeber erwünscht? |
| 8b | arbeitsfaehigkeitszeugnis | f91 | text | Datum | heute | Datum des Zeugnisses |
| 8b | betreibungsbegehren | f12 | text | – | heute | Welche Bemerkungen zum Schuldner oder zur Forderung sind zu machen? |
| 8b | schadenmeldung-uvg | f54 | text | Zeit (Stunden, Minuten) | heute | Soll ich das Datum von heute einfügen? |

In bundles of six the small model hung the offer `[heute]` on 42 of 135 lines: 37 at fields of kind text, 4 at fields
of kind radio, 1 at fields of kind checkbox.
