# Result: required, marked by the model

Run of 9 October 2026 at temperature 0 on the four forms, three calls per form: swiss-ai/Apertus-v1.5-70B builds the
catalogue of the form anew with a key for required; then swiss-ai/Apertus-v1.5-70B and swiss-ai/Apertus-v1.5-8B each
mark the required ones among the entries of the checked catalogue. 12 calls, 8 of them to the large model; 11 answered
with status 200, one with status 504 after 60 seconds (the catalogue anew for `schadenmeldung-uvg`, "upstream request
timeout", no answer). Counted again from the answers in `calls/`.

Reference, set before the run: the mark `required` of the four checked catalogues as they were that day, 33 of 136
entries.

## Marking the entries of the checked catalogue

| form | entries | required by the catalogue | 70B marks | of these required | 8B marks | of these required | the numbers 8B returns |
|---|---:|---:|---:|---:|---:|---:|---|
| betreibungsbegehren | 17 | 4 | 12 | 4 | 2 | 0 | 1, 4 |
| suva-bagatellunfall | 28 | 9 | 24 | 9 | 2 | 0 | 1, 4 |
| arbeitsfaehigkeitszeugnis | 39 | 7 | 34 | 7 | 2 | 1 | 1, 4 |
| schadenmeldung-uvg | 52 | 13 | 30 | 11 | 2 | 1 | 1, 4 |
| all | 136 | 33 | 100 | 31 | 8 | 2 |  |

The prompt ends with the example `{"pflicht": [1, 4]}`.

## The catalogue built anew, with a key for required

An entry of the checked catalogue counts as found in the new one when the names are equal or one holds the other,
letters and digits compared.

| form | status | entries in the new catalogue | marked required | checked required entries found | of these marked | other checked entries found | of these marked |
|---|---|---|---|---|---|---|---|
| betreibungsbegehren | 200 | 16 | 7 | 4 of 4 | 4 | 12 of 13 | 3 |
| suva-bagatellunfall | 200 | 16 | 16 | 0 of 9 | 0 | 14 of 19 | 14 |
| arbeitsfaehigkeitszeugnis | 200 | 42 | 18 | 5 of 7 | 5 | 29 of 32 | 11 |
| schadenmeldung-uvg | 504 | – | – | – | – | – | – |
