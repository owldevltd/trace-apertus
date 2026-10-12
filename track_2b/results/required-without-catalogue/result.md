# Result: the indispensable places of a page, named by the model without a catalogue

Run of 9 October 2026 at temperature 0 on the four forms as they were captured that day: per page with asked units one
call to swiss-ai/Apertus-v1.5-8B and one to swiss-ai/Apertus-v1.5-70B, 14 calls, all answered with status 200. Counted
again from the answers in `calls/`.

Reference: the 43 units the required entries of the checked catalogues are entered at
(`results/required-bind/reference.json`, set after the run). A unit a model names counts only when it is an asked unit
of the page of the call.

| form | asked units | required by the reference | 8B names | of these required | 70B names | of these required |
|---|---:|---:|---:|---:|---:|---:|
| betreibungsbegehren | 12 | 4 | 2 | 2 | 5 | 3 |
| suva-bagatellunfall | 110 | 17 | 80 | 17 | 49 | 11 |
| arbeitsfaehigkeitszeugnis | 35 | 6 | 2 | 1 | 5 | 2 |
| schadenmeldung-uvg | 73 | 16 | 37 | 11 | 53 | 14 |
| all | 230 | 43 | 121 | 31 | 112 | 30 |
