# Result: the small model checks the questions

Three questionnaires checked on 9 October 2026 by swiss-ai/Apertus-v1.5-8B at temperature 0, each in two runs: the two
the small model wrote over the whole form and page by page, and the one the large model wrote over the whole form. 146
calls, all answered. A call holds the list of lines of a page and up to twelve of its questions without their unit,
mixed, and the model names the unit of each.

Counted again from the answers in `calls/`. A question **holds** when both runs name its own unit. Where both runs
name the same other unit the question is counted under "both the same other unit", everything else under "runs
disagree". The check itself is measured with errors put in on purpose, without a call: every unit is handed the
question of the unit before it and of the unit after it on the page ("a neighbour's question"), and in twenty fixed
mixings of the page the question of another unit ("another place's question"); such a question **passes** when both
runs named exactly that wrong unit for it. "No form field": on the three forms whose PDF has form fields, 23 units
stand where the PDF has none.

| questionnaire | calls | seconds at the model | questions | holds | runs disagree | both the same other unit | a neighbour's question passes | another place's question passes | no form field, question holds | one run alone: holds | one run alone: a neighbour's passes |
|---|---:|---:|---:|---:|---:|---:|---|---|---|---:|---|
| whole form | 50 | 57 | 256 | 178 | 23 | 55 | 15 of 496 | 30 of 4 946 | 15 of 23 | 190 | 19 of 496 |
| page by page | 48 | 54 | 237 | 173 | 37 | 27 | 10 of 458 | 12 of 4 568 | 12 of 23 | 189 | 18 of 458 |
| large model, whole form | 48 | 55 | 245 | 161 | 61 | 23 | 8 of 474 | 9 of 4 725 | 10 of 23 | 173 | 17 of 474 |
| large model, whole form, checked by the large model (earlier trial) | – | – | 245 | 182 | 38 | 25 | 12 of 474 | 10 of 4 725 | 14 of 23 | 186 | 16 of 474 |

The last row is the comparison written down before this run: the large model checking its own questions, taken from
the stored answers of the earlier trial; its calls are not in this folder. "Seconds at the model" is the sum of the
durations the client logged, without the two seconds it waits before every call.

Holds, per form:

| questionnaire | arbeitsfaehigkeitszeugnis | betreibungsbegehren | schadenmeldung-uvg | suva-bagatellunfall |
|---|---|---|---|---|
| whole form | 27 of 35 | 16 of 17 | 70 of 94 | 65 of 110 |
| page by page | 31 of 35 | 15 of 16 | 66 of 94 | 61 of 92 |
| large model, whole form | 27 of 34 | 16 of 17 | 61 of 84 | 57 of 110 |

## A neighbour's question with the same wording

No call. A neighbour's question that passes is no wrong wording where the two units are asked with the same words.

| questionnaire | a neighbour's question passes | of these with the same wording | with other wording | holds | of these worded like another on the page | holds, wording used once |
|---|---|---:|---:|---:|---:|---:|
| whole form | 15 of 496 | 6 | 9 | 178 | 13 | 165 |
| page by page | 10 of 458 | 2 | 8 | 173 | 7 | 166 |
| large model, whole form | 8 of 474 | 0 | 8 | 161 | 1 | 160 |

The 8 that pass with other wording, page by page:

| form | unit | its label | neighbour | the neighbour's label | the neighbour's question, named for the unit |
|---|---|---|---|---|---|
| schadenmeldung-uvg | q54 | Besteht ein Polizeirapport? | q53 | Ja | Gibt es einen Polizeirapport zum Unfall? |
| schadenmeldung-uvg | q55 | Ja | q54 | Besteht ein Polizeirapport? | Gibt es ein Unfallprotokoll? |
| schadenmeldung-uvg | q61 | Betroffener Körperteil | q60 | 9 Verletzung | Welche Verletzung hat die Person erlitten? |
| schadenmeldung-uvg | q73 | Erstbehandelnder Arzt bzw. Spital/Klinik | q72 | 11 Arztadressen | Welche Ärzte oder Kliniken werden für die Behandlung zuständig sein? |
| schadenmeldung-uvg | q81 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | q80 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | Welche anderen Lohnzulagen gibt es, zum Beispiel Akkord, Provision oder Schichtzulage? |
| suva-bagatellunfall | q2 | Schaden-Nummer | q1 | – | Wie lautet die Schaden-Nummer? |
| suva-bagatellunfall | q31 | Nachbehandelnder Arzt bzw. Spital/Klinik | q32 | 10. Arzt- adressen | Wie lautet die Adresse des Arztes für die Nachbehandlung? |
| suva-bagatellunfall | q77 | Nachbehandelnder Arzt bzw. Spital/Klinik | q78 | 10. Arzt- adressen | Wie lautet die Adresse des Nachbehandelnden Arztes oder des Spitals/Klinik? |

## Units without a printed label

No call. 38 of the 259 units have no printed label: 2 on `arbeitsfaehigkeitszeugnis`, 2 on `schadenmeldung-uvg`, 34 on
`suva-bagatellunfall`.

| questionnaire | units without a label | "KEINE" | question written | no line | question holds | neither a question that holds nor a label |
|---|---:|---:|---:|---:|---:|---:|
| whole form | 38 | 2 | 36 | 0 | 3 | 35 |
| page by page | 38 | 20 | 18 | 0 | 3 | 35 |
| large model, whole form | 38 | 4 | 34 | 0 | 2 | 36 |

## The order of the list of lines

No call. Reference: the order of the form fields in the PDF. Counted are the units with a form field, taken in the
order of the list of lines and in the order of their ids; a pair of neighbours agrees when the second unit's form
field comes later in the PDF than the first's.

| form | units with a form field | pairs in the order of the PDF: list of lines | pairs in the order of the PDF: ids |
|---|---:|---|---|
| arbeitsfaehigkeitszeugnis | 35 | 30 of 34 | 27 of 34 |
| betreibungsbegehren | 12 | 10 of 11 | 10 of 11 |
| schadenmeldung-uvg | 79 | 70 of 78 | 69 of 78 |
| all three | 126 | 110 of 123 | 106 of 123 |

## What a form costs

From the logged calls of the page-by-page writing (`results/trial-question-writing/calls/page-by-page/`) and its two
check runs here.

| form | units | calls | seconds at the model | tokens in / out |
|---|---:|---:|---:|---|
| arbeitsfaehigkeitszeugnis | 36 | 7 | 14 | 11 113 / 2 102 |
| betreibungsbegehren | 17 | 8 | 11 | 10 563 / 1 625 |
| schadenmeldung-uvg | 96 | 20 | 38 | 28 409 / 5 831 |
| suva-bagatellunfall | 110 | 21 | 40 | 26 369 / 5 993 |
