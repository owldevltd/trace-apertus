# Result: the kind of the field named at transcription

84 calls on 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, all answered: 76 on 38 synthetic
recordings of single answers (19 answers, two voices, each recording with both prompts), 4 on two dictations and 4 on
two single answers of a tester. The 76 are kept here.

"as is" is the transcription prompt of the app with the dictionary of the form. "kind named" is the same prompt with
one sentence behind it that names the kind of the answer, for a telephone number "In der Aufnahme wird eine
Telefonnummer genannt."

## Single answers, synthetic voices

Computed from the answers in `calls/` against the values of `answers.json`. Compared is the text of an answer after
number words were written as digits (`src/speech/numbers.js`), the way the app did it when the run was made: "eins"
then stayed a word; the app has written it as 1 since. Counted per recording:

- alone: the text is the value and nothing else, the full stop at the end apart;
- within: the value stands in the text;
- digits: the digits of the text are the digits of the value, in their order;
- digits, "eins" as 1: the same, with "eins" standing by itself counted as the digit 1.

| | recordings | alone: as is | alone: kind named | within: as is | within: kind named | digits: as is | digits: kind named | digits, "eins" as 1: as is | digits, "eins" as 1: kind named |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| phone | 6 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 3 |
| postcode | 6 | 0 | 1 | 2 | 2 | 3 | 4 | 3 | 4 |
| identifier | 6 | 0 | 0 | 2 | 2 | 2 | 2 | 2 | 2 |
| email | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| number | 6 | 0 | 0 | 5 | 5 | 5 | 5 | 5 | 5 |
| date | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| time | 4 | 0 | 0 | 0 | 0 | 2 | 1 | 2 | 1 |
| iban | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **all** | 38 | 0 | 1 | 9 | 9 | 13 | 13 | 13 | 15 |
| voice-a | 19 | 0 | 1 | 4 | 5 | 5 | 6 | 5 | 7 |
| voice-b | 19 | 0 | 0 | 5 | 4 | 8 | 7 | 8 | 8 |

Dates through the date writer of the app (`src/fields/dates.js`), the text written as DD.MM.YYYY is the value: as is 4
of 4, kind named 4 of 4.

The same text with both prompts: 19 of 38 recordings; voice-a 9 of 19, voice-b 10 of 19.

Every recording. k is the number of the call: `calls/<voice>-as-is/call-<k>.json` and
`calls/<voice>-kind-named/call-<k>.json`.

| k | answer | kind | voice | spoken | value | as is | kind named |
|---:|---|---|---|---|---|---|---|
| 1 | tel1 | phone | voice-a | null sieben neun, vier fünf sechs, eins zwei, drei vier. | `0794561234` | Nur 794561234 | 0 7 9 4 5 6 eins 2 3 4. |
| 1 | tel1 | phone | voice-b | null sieben neun, vier fünf sechs, eins zwei, drei vier. | `0794561234` | 0794661234 | 0 7 9 4 5 6 eins 2 3 4. |
| 2 | tel2 | phone | voice-a | null vier vier, fünfhundertzwölf, achtunddreißig, neunzig. | `0445123890` | Notiz hier 512 38 90. | Notiz hier 512 38 90. |
| 2 | tel2 | phone | voice-b | null vier vier, fünfhundertzwölf, achtunddreißig, neunzig. | `0445123890` | 0444 512 38 90 | 0444 512 38 90 |
| 3 | tel3 | phone | voice-a | Die Telefonnummer ist null drei eins, drei zwei acht, vier sieben, eins fünf. | `0313284715` | Die Telefonnummer ist 0313 328 4715. | Die Telefonnummer ist 0313 328 4715. |
| 3 | tel3 | phone | voice-b | Die Telefonnummer ist null drei eins, drei zwei acht, vier sieben, eins fünf. | `0313284715` | Die Telefonnummer ist 031 328 47 15. | Die Telefonnummer ist 031 328 47 15. |
| 4 | plz1 | postcode | voice-a | drei null null eins. | `3001` | keine Details | 2 0 0 eins |
| 4 | plz1 | postcode | voice-b | drei null null eins. | `3001` | Kann ich nur 0 eins. | Kann ich nur 0 eins. |
| 5 | plz2 | postcode | voice-a | dreitausendsechshundert. | `3600` | 3 1600 | 3600 |
| 5 | plz2 | postcode | voice-b | dreitausendsechshundert. | `3600` | 3 600 | 3 600 |
| 6 | plz3 | postcode | voice-a | Die Postleitzahl ist acht null null zwei. | `8002` | Die Postleitzahl ist 8002. | Die Postleitzahl ist 8002. |
| 6 | plz3 | postcode | voice-b | Die Postleitzahl ist acht null null zwei. | `8002` | Die Postleitzahl ist 8002. | Die Postleitzahl ist 8 0 0 2. |
| 7 | nr1 | identifier | voice-a | neun drei acht, fünf vier zwei, fünf eins zwei. | `938542512` | 9 308 von 4 2 5 eins 2. | 9 308 5 4 2 5 eins 2 |
| 7 | nr1 | identifier | voice-b | neun drei acht, fünf vier zwei, fünf eins zwei. | `938542512` | 938542542 | 938542542 |
| 8 | nr2 | identifier | voice-a | sieben fünf sechs, Punkt, eins zwei drei vier, Punkt, fünf sechs sieben acht, Punkt, neun sieben. | `756.1234.5678.97` | Siebenfünfsechs Punkt eins 2 3 4 Punkt 5 6 7 8 Punkt 9 7. | Siebenfünfsechs Punkt eins 2 3 4 Punkt 5 6 7 8 Punkt 9 7 |
| 8 | nr2 | identifier | voice-b | sieben fünf sechs, Punkt, eins zwei drei vier, Punkt, fünf sechs sieben acht, Punkt, neun sieben. | `756.1234.5678.97` | 756.1234.5678.9097 | siebenfünfundsechszehnhunderteinundzwanzigdreivierhundertfünfundsechsundachtzehnhunderteinundneunzig |
| 9 | nr3 | identifier | voice-a | Die Schadennummer ist vier vier sieben null eins acht. | `447018` | Die Schaden-Nr. ist 447018. | Die Schaden-Nr. ist 447018. |
| 9 | nr3 | identifier | voice-b | Die Schadennummer ist vier vier sieben null eins acht. | `447018` | Die Schaden-Nr. ist 447018. | Die Schadenummer ist 447018. |
| 10 | mail1 | email | voice-a | office ät musterbau Punkt c h. | `office@musterbau.ch` | Auf das Eidgenossenschafts-Zerbau.ch | Auf das E-Post-Konto ch. |
| 10 | mail1 | email | voice-b | office ät musterbau Punkt c h. | `office@musterbau.ch` | Büro Schmid, CH-8008 Zürich | Büro Schmid, Musterbau.ch |
| 11 | mail2 | email | voice-a | h Punkt keller ät beispiel Punkt c h. | `h.keller@beispiel.ch` | Herr Puntkeller, ihr Beispiel.ch | Herr Puntkeller, ihr Beispiel.ch |
| 11 | mail2 | email | voice-b | h Punkt keller ät beispiel Punkt c h. | `h.keller@beispiel.ch` | Hapud kelle et Beispiel .ch | Hapud källerit Beispiel.ch |
| 12 | zahl1 | number | voice-a | zweiundvierzig Stunden. | `42` | 42 Stunden. | 42 Stunden |
| 12 | zahl1 | number | voice-b | zweiundvierzig Stunden. | `42` | 42 Stunden | 42 Stunden |
| 13 | zahl2 | number | voice-a | achtzig Prozent. | `80` | Herzlichen Glückwunsch! | Hatsi Prozent. |
| 13 | zahl2 | number | voice-b | achtzig Prozent. | `80` | 80 Prozent | 80 Prozent |
| 14 | zahl3 | number | voice-a | Ich habe zwei Kinder. | `2` | Ich habe 2 Kinder. | Ich habe 2 Kinder. |
| 14 | zahl3 | number | voice-b | Ich habe zwei Kinder. | `2` | Ich habe 2 Kinder. | Ich habe 2 Kinder. |
| 15 | dat1 | date | voice-a | vierzehnter Mai neunzehnhundertachtunddreißig. | `14.05.1938` | 14. Mai 1938. | 14. Mai 1938. |
| 15 | dat1 | date | voice-b | vierzehnter Mai neunzehnhundertachtunddreißig. | `14.05.1938` | 14. Mai 1938. | 14. Mai 1938. |
| 16 | dat2 | date | voice-a | am ersten Oktober zweitausendfünf. | `01.10.2005` | 1. Oktober 2005. | 1. Oktober 2005. |
| 16 | dat2 | date | voice-b | am ersten Oktober zweitausendfünf. | `01.10.2005` | am 1. Oktober 2005 | am 1. oktober 2005 |
| 17 | zeit1 | time | voice-a | dreizehn Uhr fünf. | `13:05` | 13 Uhr 5. | 3 Zehner 5 |
| 17 | zeit1 | time | voice-b | dreizehn Uhr fünf. | `13:05` | 13 Uhr 5. | 13 Uhr 5. |
| 18 | zeit2 | time | voice-a | um vierzehn Uhr dreißig. | `14:30` | 14 Uhr 30. | 14 Uhr 30. |
| 18 | zeit2 | time | voice-b | um vierzehn Uhr dreißig. | `14:30` | Um 14 Uhr 30. | Uhrzeit: Uhr 30. |
| 19 | iban1 | iban | voice-a | C H neun drei, null null sieben sechs, zwei null eins eins, sechs zwei drei acht, fünf zwei neun fünf, sieben. | `CH9300762011623852957` | Ziffer 9 307 6 2 0 eins eins 6 2 3 8 5 2 9 5 7. | 2 9 3 0 7 6 2 0 eins eins 6 2 3 8 5 2 9 5 7 |
| 19 | iban1 | iban | voice-b | C H neun drei, null null sieben sechs, zwei null eins eins, sechs zwei drei acht, fünf zwei neun fünf, sieben. | `CH9300762011623852957` | Sie haben ein, 3, 0, 7, 6, 2, 0, eins, eins, 6, 2, 3, 8, 5, 2, 9, 5, 7. | Sie haben ein, 3, 0, 0, 7, 6, 2, 0, eins, eins, 6, 2, 3, 8, 5, 2, 9, 5, 7. |

## Recordings of a person

The same was done on two dictations of 236 and 165 seconds and on two single answers of a tester (8 calls). These
calls are not kept here: their answers are what a person said. Counted on them: with the prompt as is, both
dictations came back character for character as the app had stored them when they were first sent; with the kinds
named, as another text (1800 against 1847 characters, 704 against 721). What was said in the recordings is not known,
so they have no expected values.
