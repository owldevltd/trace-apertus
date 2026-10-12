# Result: the same order a second time

The three writings of the questions were made a second time on 9 October 2026 with the same prompt at temperature 0:
the small model (swiss-ai/Apertus-v1.5-8B) over the whole form and page by page, the large model
(swiss-ai/Apertus-v1.5-70B) over the whole form. 16 calls to write, 4 of them to the large model. The small model then
checked each second writing in two runs: 96 calls in this folder, and for the whole-form writing the first two of the
four runs in `results/trial-check-runs/`. All calls answered.

Counted again from the answers in `calls/`, against the first writings (`results/trial-question-writing/`, the large
model's from an earlier trial) and their check (`results/trial-question-check/`).

## The second writing

| writing | calls | tokens in / out | seconds at the model | questions | "KEINE" | no line |
|---|---:|---|---:|---:|---:|---:|
| whole form | 4 | 10 063 / 12 706 | 79 | 256 | 2 | 1 |
| page by page | 8 | 12 384 / 8 218 | 50 | 242 | 15 | 2 |
| large model, whole form | 4 | 10 063 / 8 488 | 124 | 246 | 4 | 9 |

## The same words?

Unit by unit over the 259 units. "Word for word" is the same letters and digits; "share a word" is a common word of
four letters or more, or the same first five letters.

| writing | units | a question both times | only the first time | only the second time | neither time | word for word | share a word | no word in common |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| whole form | 259 | 256 | 0 | 0 | 3 | 133 | 121 | 2 |
| page by page | 259 | 236 | 1 | 6 | 16 | 121 | 114 | 1 |
| large model, whole form | 259 | 245 | 0 | 1 | 13 | 208 | 36 | 1 |

The questions with no word in common:

| writing | form | unit | printed label | first writing | second writing |
|---|---|---|---|---|---|
| whole form | schadenmeldung-uvg | q58 | Grund der Absenz | Warum war die verletzte Person zuletzt im Betrieb? | Welcher Grund für die Abwesenheit wurde angegeben? |
| whole form | suva-bagatellunfall | q105 | 3 Code | Wie lautet der Code (3 Code)? | Welche drei Codes sollen eingetragen werden? |
| page by page | suva-bagatellunfall | q13 | Strasse | Welche PLZ hat die Strasse der verletzten Person? | Wie lautet die PLZ? |
| large model, whole form | suva-bagatellunfall | q110 | Total | Wie lautet die Postkonto-Nummer oder die zugeteilte Suva-Nummer? | Wie hoch ist der Gesamtbetrag der Apothekenrechnung? |

## Does the same hold?

A question holds when both runs of the check name its own unit.

| writing | holds, first writing | holds, second writing | holds both times | only the first time | only the second time | units that change sides | neither time |
|---|---:|---:|---:|---:|---:|---:|---:|
| whole form | 178 | 174 | 160 | 18 | 14 | 32 | 67 |
| page by page | 173 | 178 | 158 | 15 | 20 | 35 | 66 |
| large model, whole form | 161 | 159 | 141 | 20 | 18 | 38 | 80 |

Of the questions that came back word for word, how the check decided them in the two writings:

| writing | word for word | holds both times | holds in one only | holds in neither |
|---|---:|---:|---:|---:|
| whole form | 133 | 98 | 12 | 23 |
| page by page | 121 | 85 | 15 | 21 |
| large model, whole form | 208 | 121 | 29 | 58 |

Per form:

| writing | form | units | a question both times | word for word | holds, first | holds, second | holds both times |
|---|---|---:|---:|---:|---:|---:|---:|
| whole form | arbeitsfaehigkeitszeugnis | 36 | 35 | 23 | 27 | 28 | 26 |
| whole form | betreibungsbegehren | 17 | 17 | 10 | 16 | 14 | 14 |
| whole form | schadenmeldung-uvg | 96 | 94 | 61 | 70 | 73 | 63 |
| whole form | suva-bagatellunfall | 110 | 110 | 39 | 65 | 59 | 57 |
| page by page | arbeitsfaehigkeitszeugnis | 36 | 35 | 23 | 31 | 30 | 30 |
| page by page | betreibungsbegehren | 17 | 16 | 9 | 15 | 16 | 15 |
| page by page | schadenmeldung-uvg | 96 | 93 | 45 | 66 | 69 | 57 |
| page by page | suva-bagatellunfall | 110 | 92 | 44 | 61 | 63 | 56 |
| large model, whole form | arbeitsfaehigkeitszeugnis | 36 | 34 | 26 | 27 | 29 | 23 |
| large model, whole form | betreibungsbegehren | 17 | 17 | 11 | 16 | 16 | 16 |
| large model, whole form | schadenmeldung-uvg | 96 | 84 | 76 | 61 | 58 | 52 |
| large model, whole form | suva-bagatellunfall | 110 | 110 | 95 | 57 | 56 | 50 |

## With the further rules, first / second writing

No call. "Wording used once": holds, and no other unit of the page is asked with the same words. "And a form field":
on the three forms whose PDF has form fields, the unit also has one. The passes are the errors put in on purpose as in
`results/trial-question-check/`.

| writing | holds | wording used once | and a form field | a neighbour's question passes | another place's question passes |
|---|---|---|---|---|---|
| whole form | 178 / 174 | 165 / 165 | 151 / 152 | 15 of 496 / 16 of 496 | 30 of 4 946 / 32 of 4 946 |
| page by page | 173 / 178 | 166 / 169 | 154 / 157 | 10 of 458 / 9 of 468 | 12 of 4 568 / 23 of 4 678 |
| large model, whole form | 161 / 159 | 160 / 158 | 150 / 150 | 8 of 474 / 11 of 476 | 9 of 4 725 / 5 of 4 747 |
