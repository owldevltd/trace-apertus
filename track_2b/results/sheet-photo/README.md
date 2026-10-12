# Run: the sheet of the walk-through photographed

The runs behind two entries in `docs/tests.md`: "Does a sheet of boxes survive being photographed?" (without the
model) and "Does a photograph of the sheet give the same fields, labels and kinds as its PDF?" (with the model).

- `photo-level.jpg`, `photo-slanted.jpg`, `photo-small-dark.jpg` – three made-up photographs of the sheet, computed
  from its page image `data/forms/austrittsmeldung/austrittsmeldung-s1.png`: the sheet on a table, seen at an angle,
  under uneven light, blurred, with noise, saved as JPEG at 12 megapixels. The fourth upload, `rendered-page`, is
  that page image itself.
- `geometry.md` – the ten passes without the model: what was changed on the sheet or in the geometry, and how many
  form fields were found on each upload.
- `calls/run-<n>/<upload>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer; an image is in the log only as its size. One call per
  element that is read, one for the catalogue, then the questions, their checks and the kinds of the fields. Run 3 is
  the sheet as it ships; runs 1 and 2 are the sheet as it was earlier that day.
- `result.md` – run 3: every upload against the form fields of the PDF, and every field with the label that was read;
  then runs 1 and 2 as they were evaluated at the time.

How it was made: each file is chosen in the app's upload dialogue; the app finds the sheet, straightens it and sends
the page; the pipeline runs, with the model or with the text layer in its place. The fields of the finished job are
then held against the form fields of `data/forms/austrittsmeldung/form.pdf` by their place on the page.
