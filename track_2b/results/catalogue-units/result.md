# Result: the fields of the shipped forms as units to ask for

Counted on 9 October 2026 on the four forms that shipped that day, without a model: the fields are those the pipeline
builds from the geometry of the pages, with the text layer of the PDF standing in for the reading; a signature is not
a unit. The table is counted again from `units.json`.

A unit is a table (at least two rows built alike, each of at least two fields to write in), a choice (radios of one
group, or tick boxes grouped by the rule the pipeline has for radios), a single tick box, or else the single field.

| form | fields | units | single fields | single tick boxes | choices (tick marks in them) | tables (cells in them): rows × columns | units without a printed label |
|---|---:|---:|---:|---:|---|---|---:|
| arbeitsfaehigkeitszeugnis | 92 | 36 | 25 | 3 | 6 (13) | 2 (51): 3×5, 4×9 | 2 |
| betreibungsbegehren | 44 | 17 | 14 | 1 | 1 (2) | 1 (27): 9×3 | 0 |
| schadenmeldung-uvg | 128 | 96 | 70 | 9 | 16 (34) | 1 (15): 5×3 | 2 |
| suva-bagatellunfall | 143 | 110 | 96 | 7 | 6 (16) | 1 (24): 6×4 | 34 |
| all | 407 | 259 | 205 | 20 | 29 (65) | 5 (117) | 38 |

The distances of the table rule are set, not measured: tops of a row at most 0.7 character heights apart, columns
equal within 1.0, rows at most 2.0 apart. No reference says which fields belong together; the count is what the rule
gives.

On the three forms with form fields in the PDF, 1, 5, 17 units (certificate, Betreibungsbegehren, accident report) lie
on no form field of the PDF.
