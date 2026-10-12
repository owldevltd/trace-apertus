# Run: single elements read by the model

The run behind the entry "How well does the model read single elements of a form?" in `docs/tests.md`.

- `calls/<page>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer. One call reads one element; the image of the element is
  in the log only as its size. The tag of a call names the page and the number of the element, the number the report
  cites a reading by (`#78`). The three pages were read side by side, so their calls alternate in time; within a
  page they are numbered in the order they were made.
- The evaluation is the report beside this folder, `results/read.md`: every reading against the text layer of the
  PDF.

The pages are `betreibungsbegehren-form-1-s1.png` in `data/forms/betreibungsbegehren/` and
`suva-bagatellunfall-uvg-s1.png` and `suva-bagatellunfall-uvg-s3.png` in `data/forms/suva-bagatellunfall/`. The JSON
beside each page image holds the text layer the report measures against.

How it was made: `make bench`. The geometry splits each page into elements (`src/cli.js analyze`), the model reads
every unknown element in a call of its own (`src/cli.js read`, swiss-ai/Apertus-v1.5-8B at temperature 0), and
`tests/read.js` holds what was read against the text layer.

Checked against the report: 152 calls, all made on 7 October 2026, the date in the report's header, and all
answered. The pages have 22, 77 and 53 calls, the read elements the report counts for each.
