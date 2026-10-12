# Result: the required entries of a catalogue bound to the units of the dialogue

Run of 9 October 2026 at temperature 0 on the four forms as they were captured that day: per page with asked units one
call to swiss-ai/Apertus-v1.5-8B and one to swiss-ai/Apertus-v1.5-70B, 14 calls, all answered with status 200. The
units each model named are read again from the answers in `calls/`; what the label binds is taken from
`reference.json`.

The catalogues of the four forms hold 33 required entries. Reference, read against the lists of lines of the pages
after the run (`reference.json`): 28 entries have a place in the dialogue, 43 units in all; 5 have none (two
signatures; day, month and year on the Suva form, whose places carry no label in the list). A unit counts as right
when the reference lists it for the entry, as wrong when not. A unit a model names counts only when it is an asked
unit of the page of the call.

| way of binding | entries with a right unit and no wrong one (of 28) | with a right unit and a wrong one | with no right unit | right units (of 43) | wrong units | entries without a place that got a unit (of 5) |
|---|---:|---:|---:|---:|---:|---:|
| the label of a field (code) | 17 | 0 | 11 | 26 | 0 | 0 |
| the small model | 19 | 7 | 2 | 37 | 26 | 5 |
| the large model | 20 | 5 | 3 | 34 | 34 | 5 |
| the label, else what both models name | 26 | 0 | 2 | 38 | 3 | 3 |
| the label, else the large model | 25 | 2 | 1 | 39 | 22 | 5 |
| the label, else the small model | 25 | 2 | 1 | 40 | 12 | 5 |

## "The label, else what both models name": every entry that is not bound in full and without a wrong unit

| form | required entry | reference | bound to |
|---|---|---|---|
| betreibungsbegehren | Betrag (CHF) | q14 | – |
| suva-bagatellunfall | Tag | – | q5 Kunden-Nr. |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q31, q77, q96 | q31 10. Arzt- adressen |
| arbeitsfaehigkeitszeugnis | Unterschrift | – | q34 Arzt / Ärztin (Name, Stempel) |
| schadenmeldung-uvg | Art der Meldung | q5, q6 | q5 Unfall / Berufskrankheit |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q68 | – |
| schadenmeldung-uvg | Unterschriften | – | q96 Ort und Datum |

## Per form

| form | required entries | asked units | entries the label binds |
|---|---:|---:|---:|
| betreibungsbegehren | 4 | 12 | 3 |
| suva-bagatellunfall | 9 | 110 | 5 |
| arbeitsfaehigkeitszeugnis | 7 | 35 | 3 |
| schadenmeldung-uvg | 13 | 73 | 6 |
