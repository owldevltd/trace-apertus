# Result: the small model writes the questions of a form

Three writings on 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 over the four forms that shipped on
that day, 407 fields in 259 units: the whole form in one call, one call per page, and the units of a page in bundles
of twelve. 37 calls, all answered. Beside them stands the writing of the large model (swiss-ai/Apertus-v1.5-70B, the
whole form in one call) from an earlier trial of the same day; its questions are in `questions.json` under
`large-model`, its four calls are not in this folder.

Counted again from the answers in `calls/`. A line of an answer counts for a unit when its id is one the call was
asked for and no earlier line named it. "KEINE" is the word the prompt asks for where there is nothing to ask; a
question is every other line.

## What was written

| writing | calls | tokens in / out | seconds at the model | units | questions | "KEINE" | no line |
|---|---:|---|---:|---:|---:|---:|---:|
| whole form | 4 | 10 063 / 12 699 | 78 | 259 | 256 | 2 | 1 |
| page by page | 8 | 12 384 / 8 097 | 49 | 259 | 237 | 20 | 2 |
| bundles of twelve | 25 | 38 433 / 7 828 | 50 | 259 | 256 | 3 | 0 |
| large model, whole form (earlier trial) | 4, not in this folder | – | – | 259 | 245 | 4 | 10 |

"Seconds at the model" is the sum of the durations the client logged. The client waits two seconds before every call
but the first; that wait is not in the figure.

| writing | form | calls | units | questions | "KEINE" | no line | seconds at the model |
|---|---|---:|---:|---:|---:|---:|---:|
| whole form | arbeitsfaehigkeitszeugnis | 1 | 36 | 35 | 0 | 1 | 7 |
| whole form | betreibungsbegehren | 1 | 17 | 17 | 0 | 0 | 4 |
| whole form | schadenmeldung-uvg | 1 | 96 | 94 | 2 | 0 | 17 |
| whole form | suva-bagatellunfall | 1 | 110 | 110 | 0 | 0 | 50 |
| page by page | arbeitsfaehigkeitszeugnis | 1 | 36 | 35 | 0 | 1 | 6 |
| page by page | betreibungsbegehren | 2 | 17 | 16 | 0 | 1 | 7 |
| page by page | schadenmeldung-uvg | 2 | 96 | 94 | 2 | 0 | 17 |
| page by page | suva-bagatellunfall | 3 | 110 | 92 | 18 | 0 | 18 |
| bundles of twelve | arbeitsfaehigkeitszeugnis | 3 | 36 | 36 | 0 | 0 | 7 |
| bundles of twelve | betreibungsbegehren | 3 | 17 | 17 | 0 | 0 | 4 |
| bundles of twelve | schadenmeldung-uvg | 9 | 96 | 95 | 1 | 0 | 17 |
| bundles of twelve | suva-bagatellunfall | 10 | 110 | 108 | 2 | 0 | 23 |

## The shape of the questions

Counted by pattern, one rule per column: the question ends with a question mark; it is the printed label and nothing
else; it holds an abbreviation ("bzw.", "Nr.", "Tel." and the like); it holds a bracket or a slash; it is impersonal
("wird … eingetragen"); it asks to enter, tick or fill in; it speaks of the form, a field, a line, a column, a box or
a table; a printed label of two words or more stands in it letter for letter; it carries a word of the name of the
unit's form field in the PDF (a word of four letters or more, or the same first five letters).

| writing | questions | ends with ? | only the label | abbreviation | bracket or slash | impersonal | asks to enter | speaks of the form | label letter for letter | third party addressed as the other person | carries a word of the field name |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| whole form | 256 | 229 | 1 | 6 | 34 | 4 | 10 | 28 | 18 | 0 of 13 | 100 of 123 |
| page by page | 237 | 234 | 0 | 6 | 17 | 15 | 15 | 11 | 17 | 0 of 13 | 99 of 122 |
| bundles of twelve | 256 | 246 | 0 | 5 | 28 | 7 | 7 | 7 | 12 | 10 of 13 | 104 of 124 |
| large model, whole form | 245 | 228 | 0 | 3 | 10 | 4 | 33 | 12 | 7 | 0 of 13 | 95 of 114 |
| printed label as the question | 221 | 6 | 204 | 27 | 82 | 0 | 2 | 4 | 142 | 0 of 13 | 92 of 122 |

"Third party addressed as the other person": 13 units are about a party the form names, the debtor on the
Betreibungsbegehren (2 units) and the injured person on the rebuilt accident report (11 units with a form field in the
section "Verletzte / Verletzter"). The question counts when it says "Ihr…" or "sind / haben / wohnen / heissen /
arbeiten / wurden / waren Sie".

The 13 units, page by page and in bundles of twelve; the last column says whether the question of the bundle counts:

| form | unit | printed label | page by page | bundles of twelve | counts |
|---|---|---|---|---|---|
| betreibungsbegehren | q9 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heißt der Schuldner (Name und Vorname bzw. Firma), wo wohnt er und in welcher Postleitzahlstadt? | Wie heißt der Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort)? | no |
| betreibungsbegehren | q11 | Geburtsdatum (falls bekannt) | Wann ist das Geburtsdatum des Schuldners bekannt? | Ist das Geburtsdatum des Schuldners bekannt? | no |
| schadenmeldung-uvg | q14 | Name und Vorname | Wie heißen die verletzten Personen? | Wie heissen Sie mit Vornamen? | yes |
| schadenmeldung-uvg | q15 | Geburtsdatum | Wann wurde die verletzte Person geboren? | Wann sind Sie geboren? | yes |
| schadenmeldung-uvg | q16 | AHV-Nummer | Welche AHV-Nummer hat die verletzte Person? | Welche AHV-Nummer haben Sie? | yes |
| schadenmeldung-uvg | q17 | Strasse | Welche Strasse hat die Wohnadresse der verletzten Person? | Welche Strasse ist Ihre Adresse? | yes |
| schadenmeldung-uvg | q18 | Tel.-Nr. | Welche Telefonnummer hat die verletzte Person? | Welche Telefonnummer haben Sie? | yes |
| schadenmeldung-uvg | q19 | Zivilstand | Welcher Zivilstand ist bei der verletzten Person? | In welchem Zivilstand befinden Sie sich? | no |
| schadenmeldung-uvg | q20 | Land | Welches Land hat die verletzte Person? | Welches Land ist Ihre Staatsangehörigkeit oder Bewilligung? | yes |
| schadenmeldung-uvg | q21 | PLZ | Welche Postleitzahl hat der Wohnort der verletzten Person? | Welche Postleitzahl hat Ihr Wohnort? | yes |
| schadenmeldung-uvg | q22 | Wohnort | Wo wohnt die verletzte Person? | In welcher Gemeinde wohnen Sie? | yes |
| schadenmeldung-uvg | q23 | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat die verletzte Person? | Welche Staatsangehörigkeit oder Bewilligung haben Sie? | yes |
| schadenmeldung-uvg | q24 | E-Mail | Welche E-Mail-Adresse hat die verletzte Person? | Welche E-Mail-Adresse haben Sie? | yes |

The pattern counts 10 of the 13. One more question of the bundles speaks to the other person as the injured person in
words the pattern does not hold ("In welchem Zivilstand befinden Sie sich?", q19).

## Wording, options and length

No call: counted from the questions above. "Same wording" is a question whose letters and digits equal those of
another question on the same page. "Options in the question": of the printed options of the choices that got a
question, how many stand in that question letter for letter. LIX is words per sentence plus the share of words longer
than six letters in per cent, over all questions of a writing.

| writing | questions | same wording as another on the page | choices with a question | options in the question | LIX | words per question |
|---|---:|---:|---:|---|---:|---:|
| printed label as the question | 221 | 39 | 29 | 60 of 60 | 61 | 3.9 |
| whole form | 256 | 57 | 29 | 26 of 60 | 42 | 8.2 |
| page by page | 237 | 29 | 29 | 31 of 60 | 40 | 8.2 |
| bundles of twelve | 256 | 16 | 29 | 31 of 60 | 40 | 8.2 |
| large model, whole form | 245 | 28 | 27 | 34 of 56 | 39 | 8.4 |
