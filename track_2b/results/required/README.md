# Run: the required entries of a form bound to its questions

The run behind the entry "Which questions does a form require?" in `docs/tests.md`.

- `calls/<form>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per form in the order they were made. A call
  tagged `required small page <n>` or `required large page <n>` gives the small or the large model a page as a list
  of lines and the required entries of the form, and the model names the places of each entry. A call tagged
  `required back <unit>` asks the small model which entry is entered at a place both had named. 7, 7 and 15 calls.
- The evaluation is the report beside this folder, `results/required.md`: how every required entry was bound.

What is required stands in the catalogues, `data/catalogues/<form>.json`: 33 entries on the four forms. The
questions are those of the forms as they were captured on the day of the run. The captured forms were set right on
11 October 2026 (`docs/evidence.md`, section 9), and `data/forms/<form>/captured.json` holds other questions since.

How it was made: `make required` (`tools/capture.js --required`), with swiss-ai/Apertus-v1.5-8B as the small and
swiss-ai/Apertus-v1.5-70B as the large model, both at temperature 0.

Checked against the report: 29 calls, all made on 9 October 2026, the date in the report's header, and all
answered. The forms have 6, 2, 13 and 8 calls, as in the report's table; 22 calls went to the small model and 7 to
the large one.
