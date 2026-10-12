# Result: the sheet photographed, without the model

Ten passes on 11 October 2026 while the sheet of the walk-through was built. In each pass the page image of the sheet
and five, later ten, made-up photographs of it go through the upload path of the app in a browser (the sheet is found
in the picture, straightened, its light evened out) and through the geometry and the building of fields; the text
layer of the PDF stands in for the reading, so no call is made. The fields built are then held against the form
fields of the PDF of that pass by their place on the page.

A form field counts as found when a built field lies on it; "invented" is a built field that lies on no form field;
"double" is a form field on which two built fields lie; "other kind" is a built field on a form field of another kind
(text, tick box, choice, date, signature); "without label" is a built field that got no label.

| pass | what changed | form fields | rendered page | photographs | found on the photographs | invented | double | other kind | without label | photographs with every field and nothing invented or double |
|---:|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | first layout: boxes with a gap between them, a frame around the choice | 24 | 24 of 24, 3 invented, every tick box double | 5 | 21 to 23 of 24 | up to 4 | up to 7 | – | – | 0 of 5 |
| 2 | the boxes as one grid with shared borders; the geometry as it was | 24 | 24 of 24, 0 invented | 5 | 12 to 18 of 24 | 0 to 1 | 0 to 1 | 0 to 2 | 0 to 4 | 0 of 5 |
| 3 | the same sheet; the fringe of a dark line, two work pixels, goes out of the masks with the line | 24 | 24 of 24, 0 invented | 5 | 24 of 24 | 0 to 1 | 0 | 0 | 0 | 4 of 5 |
| 4 | the same sheet; the fringe set to one work pixel | 24 | 24 of 24, 0 invented | 5 | 23 to 24 of 24 | 0 to 1 | 0 | 0 | 0 | 3 of 5 |
| 5 | the same sheet; fringe of two pixels, and a dark line that is only the edge of a longer one is no line of its own | 24 | 24 of 24, 0 invented | 5 | 24 of 24 | 0 to 1 | 0 | 0 | 0 | 4 of 5 |
| 6 | the same sheet, ten photographs; the geometry as it ships (`src/page/lines.js`) | 24 | 24 of 24, 0 invented | 10 | 24 of 24 | 0 | 0 | 0 | 0 | 10 of 10 |
| 7 | a statement to tick stands above its date field | 24 | 24 of 24, 0 invented | 10 | 24 of 24 | 0 | 0 | 0 | 0 | 10 of 10 |
| 8 | the sheet reduced from 24 to 20 form fields | 20 | 20 of 20, 0 invented | 10 | 20 of 20 | 0 | 0 | 0 | 0 | 10 of 10 |
| 9 | labels at 11 instead of 9 points | 20 | 20 of 20, 0 invented | 10 | 20 of 20 | 0 | 0 | 0 | 0 | 10 of 10 |
| 10 | the label "Ort" renamed "Wohnort": the sheet as it ships | 20 | 20 of 20, 0 invented | 10 | 20 of 20 | 0 | 0 | 0 | 0 | 10 of 10 |

Pass 1 is given as it was noted during the pass; its table was not kept. The fringe of two work pixels is set by the
assistant, open.

The photographs are computed from the page image with fixed random numbers: the sheet lies on a table and is seen at
an angle, turned, under uneven or warm light, with a shadow across it, blurred, with noise, at 8 or 12 megapixels,
saved as JPEG. Three of the ten of pass 10 lie in this folder. A print photographed with a telephone was not tested.

The change to the geometry was measured against the ten pages of the forms the repository ships: on the fillable
pages the three reports (`results/sources.md`, `results/marks.md`, `results/fields.md`) came out the same; on the pages
of the accident report without form fields 36 became 37 built fields (page 1) and 50 became 56 (page 3).

## Every upload

| pass | upload | page as sent | form fields | found | missed | double | fields built | invented | other kind | without label |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 2 | photo-level | 2480×3582 | 24 | 17 | 7 | 0 | 17 | 0 | 0 | 0 |
| 2 | photo-slanted | 2361×3600 | 24 | 12 | 12 | 1 | 14 | 1 | 0 | 0 |
| 2 | photo-shadow | 2474×3600 | 24 | 13 | 11 | 1 | 16 | 1 | 0 | 1 |
| 2 | photo-small-dark | 2430×3600 | 24 | 13 | 11 | 0 | 13 | 0 | 0 | 0 |
| 2 | photo-light-table | 2475×3600 | 24 | 18 | 6 | 1 | 19 | 0 | 2 | 4 |
| 3 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 3 | photo-level | 2480×3582 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 3 | photo-slanted | 2361×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 3 | photo-shadow | 2474×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 3 | photo-small-dark | 2430×3600 | 24 | 24 | 0 | 0 | 25 | 1 | 0 | 0 |
| 3 | photo-light-table | 2475×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 4 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 4 | photo-level | 2480×3582 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 4 | photo-slanted | 2361×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 4 | photo-shadow | 2474×3600 | 24 | 23 | 1 | 0 | 23 | 0 | 0 | 0 |
| 4 | photo-small-dark | 2430×3600 | 24 | 24 | 0 | 0 | 25 | 1 | 0 | 0 |
| 4 | photo-light-table | 2475×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 5 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 5 | photo-level | 2480×3582 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 5 | photo-slanted | 2361×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 5 | photo-shadow | 2474×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 5 | photo-small-dark | 2430×3600 | 24 | 24 | 0 | 0 | 25 | 1 | 0 | 0 |
| 5 | photo-light-table | 2475×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-level | 2480×3582 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-slanted | 2361×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-shadow | 2474×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-small-dark | 2430×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-light-table | 2475×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-from-right | 2480×3405 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-turned | 2469×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-blurred | 2460×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-eight-megapixels | 2438×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 6 | photo-warm-light | 2345×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | rendered-page | 2481×3508 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-level | 2480×3582 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-slanted | 2361×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-shadow | 2474×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-small-dark | 2430×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-light-table | 2475×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-from-right | 2480×3405 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-turned | 2469×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-blurred | 2460×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-eight-megapixels | 2438×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 7 | photo-warm-light | 2345×3600 | 24 | 24 | 0 | 0 | 24 | 0 | 0 | 0 |
| 8 | rendered-page | 2481×3508 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-level | 2480×3582 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-slanted | 2361×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-shadow | 2474×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-small-dark | 2430×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-light-table | 2477×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-from-right | 2480×3405 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-turned | 2469×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-blurred | 2460×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-eight-megapixels | 2438×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 8 | photo-warm-light | 2345×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | rendered-page | 2481×3508 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-level | 2480×3582 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-slanted | 2361×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-shadow | 2474×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-small-dark | 2430×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-light-table | 2475×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-from-right | 2480×3405 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-turned | 2469×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-blurred | 2460×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-eight-megapixels | 2438×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 9 | photo-warm-light | 2345×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | rendered-page | 2481×3508 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-level | 2480×3582 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-slanted | 2361×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-shadow | 2474×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-small-dark | 2430×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-light-table | 2475×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-from-right | 2480×3405 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-turned | 2469×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-blurred | 2460×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-eight-megapixels | 2438×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
| 10 | photo-warm-light | 2345×3600 | 20 | 20 | 0 | 0 | 20 | 0 | 0 | 0 |
