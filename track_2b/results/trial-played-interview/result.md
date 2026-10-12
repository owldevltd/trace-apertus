# Result: a played respondent who knows only the names of the PDF's form fields

Six questionnaires on 9 October 2026, each asked of a respondent played by swiss-ai/Apertus-v1.5-8B at temperature 0:
66 calls, all answered, 96 seconds at the model. The respondent is given the names of the form fields of a page, each
with a token, and up to twelve questions, and names for every question the token of the one entry asked for, or "-".
Three forms take part, those whose PDF has form fields; the Suva form has none.

Counted again from the answers in `calls/`. A question counts when its unit has a form field in the PDF. It "names its
own field" when the token the respondent returns stands for the name of a form field of that unit.

| questionnaire | calls in | calls | questions | names its own field | names another field | names none |
|---|---|---:|---:|---:|---:|---:|
| printed label as the question | `label-as-question/` | 11 | 123 | 76 | 21 | 26 |
| question of the next place | `next-places-question/` | 11 | 115 | 2 | 93 | 20 |
| large model, whole form | `large-model/` | 11 | 115 | 68 | 25 | 22 |
| whole form | `whole-form/` | 11 | 124 | 81 | 27 | 16 |
| page by page | `page-by-page/` | 11 | 123 | 77 | 28 | 18 |
| bundles of twelve | `bundles-of-twelve/` | 11 | 125 | 80 | 29 | 16 |

Per form, "names its own field" of the questions asked:

| questionnaire | certificate | Betreibungsbegehren | accident report |
|---|---|---|---|
| printed label as the question | 20 of 33 | 4 of 12 | 52 of 78 |
| question of the next place | 0 of 33 | 0 of 12 | 2 of 70 |
| large model, whole form | 20 of 33 | 1 of 12 | 47 of 70 |
| whole form | 22 of 34 | 6 of 12 | 53 of 78 |
| page by page | 22 of 34 | 2 of 11 | 53 of 78 |
| bundles of twelve | 19 of 35 | 4 of 12 | 57 of 78 |

The two controls were set before the candidates were asked: the printed label as the question, and for every unit the
question the large model wrote for the next unit of the same page.

## Against the check

No call: the questions of three questionnaires split by whether they hold in the check of
`results/trial-question-check/` (both runs name the question's own unit), each part counted as above.

| questionnaire | holds, with a form field | names its own field | names another | names none | does not hold, with a form field | names its own field | names another | names none |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| whole form | 98 | 70 | 18 | 10 | 26 | 11 | 9 | 6 |
| page by page | 100 | 65 | 18 | 17 | 23 | 12 | 10 | 1 |
| large model, whole form | 94 | 61 | 13 | 20 | 21 | 7 | 12 | 2 |
