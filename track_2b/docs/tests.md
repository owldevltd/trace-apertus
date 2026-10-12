# Tests

What was tested, what was expected, what came out and what was decided: one entry per test, each with the same five
lines. **Run** names the folder that holds the run itself: the prompt, the answers of the model and the evaluation.
Where no run is kept, the line says so, and what the test can be repeated with. Where no expectation was written down
before a run, the entry states the question it was run for instead.

The entries follow the pipeline: reading, geometry, catalogue and questions, answers, required entries, kinds of
fields, lists, speech, filling, other languages; then the sheet of the walk-through, the interface and the operation.
A test without a call to the model has no prompt to show; its run is the table of what was counted.

The long record of all measurements is `docs/evidence.md`.

## Reading

### How well does the model read single elements of a form?

- **Expectation:** Every text the model reads from an element equals the text layer of the PDF at that place,
  compared in lower case with single spaces.
- **Test:** `make bench` (`tests/read.js`): three shipped pages, one of the Betreibungsbegehren and two of the Suva
  form; every unknown element is read by the model in a call of its own, 152 calls. 143 of the read elements have
  reference text, 3896 characters.
- **Result:** 121 of 143 identical, 18 near (a distance of at most 10 % of the length), 4 different, none empty;
  1.1 % character errors. The shape check flags 15 of the 22 readings that are not identical and 24 of the 121 that
  are. One run; the two Suva pages are the same page in two copies, so effectively two distinct pages.
- **Finding:** A reading the shape check flags is shown for a look; the report holds the counts of the flag for
  other thresholds.
- **Run:** `results/read/` and `results/read.md`

### What does the model answer when the image holds nothing?

- **Question:** What comes back when the model is asked for the text of an image that is blank?
- **Test:** A first run of the measurement of image widths and strips went out with blank images: the script that
  made them had not loaded the page. 21 images (a whole page at six widths, 15 strips), the small model (8B),
  temperature 0, the prompt "Gib den gesamten Text im Bild exakt wieder, Zeile für Zeile, ohne Kommentar und ohne
  Formatierung."; one call each.
- **Result:** 13 of 21 answers say that the image holds no text or that no image was given. 2 say there is no
  information on the effects of COVID-19 on the mental health of children. 3 describe something that is not there
  ("Die Stadt ist ein pulsierendes Zentrum des Handels und der Kultur." twice, a landscape in English). 3 are a
  fragment ("HERE", "nea", "nea"), on the three smallest images. Of the large model (70B) one answer is on record,
  "Kein Text im Bild vorhanden"; its answers were not kept.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with 21 blank images in the sizes of a page at 500 to 2 481 px
  width and of its strips, and the prompt quoted above.

### Does the large model read a page better than the small one?

- **Question:** How does the large model (70B) read the page on which image width and strips were measured for the
  small one?
- **Test:** One text page (3 913 characters, reference the text layer) at six widths from 500 to 2 481 px and cut
  into 2, 3, 4 and 6 strips at blank pixel rows; 70B, temperature 0, one run per image, 21 calls. Character errors
  as edit distance over the length of the reference.
- **Result:** Whole page: at 500 px invented text up to the token limit, 700 px 68.1 %, 900 px 13.2 %, 1 240 px
  2.0 %, 1 654 px 2.5 %, 2 481 px 2.5 % character errors. Strips: two 1.3 %, three 1.8 %, four 1.8 %, six 1.3 %.
  The small model on the same images: 1 240 px 4.9 %, three strips 1.0 %. 20 to 28 s a page against 9 to 17 s.
  One page, one run per image.
- **Finding:** None taken; the series was kept as a comparison beside the small model's.
- **Run:** not kept in the repository. Repeatable with one rendered text page that has a text layer, the same ten
  sets of images and the prompt of the entry above.

### How much of a form page comes back when it is read in three strips?

- **Question:** Does the setup measured on a text page (three strips, small model) carry over to form pages?
- **Test:** The first pages of six forms (the Betreibungsbegehren, a record of job applications in landscape with a
  table, an application for family allowances, a fall report, a care-needs report with dotted writing lines, a
  certificate of fitness for work), rendered at 300 dpi and cut into three strips; 8B, temperature 0, 18 calls.
  Reference: the words of the text layer. Counted without their order: the share of the reference's words the
  model returns (coverage) and the share of the model's words that stand in the reference (precision).
- **Result:** Coverage 0.64 to 0.97, precision 0.36 to 0.97: fall report 0.965 / 0.958, Betreibungsbegehren
  0.909 / 0.964, certificate 0.819 / 0.749. Two strips ran to the token limit of 4 096: on the care-needs report
  the model copied the dots of the writing lines (about 65 000 characters), on the record of job applications it
  put out internal markers and then a loop of "###". Without these two strips 162 of 167 and 40 of 46 returned
  words stand in the reference. The measure says whether the words occur, not whether they stand at the right
  field. One page per form, one run.
- **Finding:** Recorded as without weight for the evaluation; a way of its own was planned for forms. The
  measurement was kept as a record.
- **Run:** not kept in the repository. Repeatable with first pages of forms that have a text layer, each cut into
  three strips at the row with the least ink near one and two thirds of its height, and the prompt of the first
  entry.

### Can the model say from its text whether a label expects an entry?

- **Question:** Instead of hanging a field on every text: can the model say from the text of a label whether an
  entry is expected beside or under it?
- **Test:** 895 labels of a set of fillable forms, their text from the text layer (611 different texts), 20 per
  call, 8B, temperature 0, 31 calls. Reference: the form fields of the PDFs, each assigned to the nearest text to
  its left or above. Then some of the texts again in two small calls.
- **Result:** Model yes and a field 275, yes and no field 252, no and a field 106, no and no field 262: precision
  52 %, recall 72 %, 60 % right. Among "no, but a field" stand sample values and titles the reference hangs a
  field on; among "yes, but no field" stand "Bemerkungen", "Datum und Unterschrift" and "Uhrzeit", to which the
  reference assigns none. "Datum:", "Mobile" and "Geb.-Dat." were answered no in the call of 20 and yes in the
  small call; there a footer, an address line and a footnote came back as no, as did "IBAN", and the title of a
  form as yes.
- **Finding:** None taken. The work log records: the direction holds, but not as a hard gate in this form; the
  effect of the call and the faults of the reference have to go first.
- **Run:** not kept in the repository. Repeatable with the labels of fillable forms taken from their text layer,
  20 per call, and the form fields of the PDFs as the reference.

### Can the model say of one cropped element whether it is a picture, and whether it wants an entry?

- **Question:** Asked two things about a single cropped element instead of its type: does it have picture parts,
  and does it require an entry?
- **Test:** 85 crops of elements the geometry leaves unknown: 30 labels of fields, 20 texts of forms with no form
  field within 4 character heights, 20 texts of parliamentary pages, 15 pictures; 8B, temperature 0. Pass 1: both
  questions and the text in one call, 85 calls. Pass 2: the entry question alone and worded anew ("is this text
  the label of a field somebody is to write into"), the 70 text crops. Pass 3: the same question with the crop
  widened by 10 character heights to the right and 3 below, the 50 form texts. 205 calls. Which text is the label
  of a field is taken from where the form fields lie, an assumption.
- **Result:** Picture parts: yes for 12 of 15 pictures and for 2 of 70 texts ("5", "—"); the 3 pictures not named
  are wordmarks, and their text is read. Text identical with the text layer: 25 of 30, 16 of 20 and 13 of 19.
  Entry required: pass 1 no for all 85; pass 2 yes for 8 of 30 labels, 0 of 20 form texts and 3 of 20
  parliamentary texts; pass 3 yes for 27 of 30 labels and for 16 of the 20 form texts without a field.
- **Finding:** The entry question was dropped; the reading asks for picture parts and the text
  (`src/read/reader.js`).
- **Run:** not kept in the repository. Repeatable with 85 crops of the four groups above from pages with a text
  layer and the three wordings.

### Do geometry and reading together carry a whole page?

- **Question:** What comes out when two whole pages go through both steps: the geometry names what it can, and
  every element left is read by the model on its own?
- **Test:** The first page of a handover protocol of a flat (45 unknown elements) and one page of a parliamentary
  document, an invitation with an agenda in Italian (24); an earlier build of the geometry; 8B, one element per
  call with the two questions picture parts and text, 69 calls. Reference for the text: the text layer.
- **Result:** First state: 18 elements of the form came back as pictures, 16 of them with a tick box in them; 9 of
  the document page, all of them numbers of the list ("1.", "2."), about one character height large. With two
  rules for that answer: form 40 texts, 2 pictures, 68 tick boxes, 15 inputs, 17 lines, 3 unknown, the text
  identical for 35 of 41 elements; document page 23 texts, no picture, 1 line, 1 unknown, 18 of 24 identical. Of
  the 2 pictures one is the logo, the other the word "Gas". The 3 unknown are tick boxes the geometry did not
  find. Among the reading errors: "bestätigt" → "bestellt", "Mieter(in)" → "Meter(in)", "Consuntivi" →
  "Consultivi"; of three list numbers only the dot was read.
- **Finding:** The picture-parts answer does not count where a tick mark lies in the element, nor for a crop
  smaller than two character heights (`src/read/reader.js`).
- **Run:** not kept in the repository. Repeatable with two rendered pages that have a text layer, the geometry
  and one call per unknown element.

## Geometry

### What does the geometry find where the model finds next to nothing?

- **Question:** On the two forms on which the model named 4 of 31 tick boxes and no input field: what does the
  geometry find without it?
- **Test:** The first pages of the Betreibungsbegehren and of a fall report with 31 tick boxes, rendered at
  300 dpi; an earlier build of the geometry: tick boxes as hollow squares of ink, inputs from tinted areas,
  underlines, empty table cells and the free space beside or under a label, placeholders ("tt.mm.jjjj") by a
  rule. No call for the types; counted on the control images.
- **Result:** Tick boxes 33 of 33 (31 and 2; the one printed as ticked is read as ticked). 46 inputs: 27 tinted
  areas, 2 underlines, 1 empty cell, 4 placeholders (4 of 4 at their place) and 12 free spaces, 10 of them a
  field and 2 a gap of the layout. After the rule for the free space was rewritten the same evening: 45 inputs,
  12 of them free spaces and 3 placeholders; against the form fields of the Betreibungsbegehren 69 of 69 text
  fields hit and 9 of its 11 free spaces on a field. Two pages.
- **Finding:** Geometry first, the model only reads: the type of an element comes from the geometry
  (`src/page/elements.js`, `src/page/marks.js`), its text from the model (`src/read/reader.js`).
- **Run:** not kept in the repository. Repeatable without a model on the two first pages at 300 dpi: tick boxes
  and inputs counted on the control image against the page.

### What lies at the places where a form takes an entry?

- **Question:** Once a page is cut into lines, tinted areas and objects and no type is named yet: what lies at
  the place of each form field?
- **Test:** No model. 30 form pages with form fields in the PDF: 806 tick boxes, 201 radio buttons, 1 840 text
  fields, 27 choice fields, 4 signatures; an earlier build of the geometry. A tick box or radio button counts as
  found when its centre lies in an object; a text field by what lies there: a tinted area under its centre, a
  line touching it, or nothing.
- **Result:** Tick boxes: 656 in an object (81.4 %), 123 touched by a line, 27 nothing. Radio buttons: 183
  (91.0 %), 1, 17. Text fields: 342 on a tinted area (18.6 %), 1 124 touched by a line (61.1 %), 374 nothing
  (20.3 %). Choice fields 15 / 2 / 10, signatures 1 / 2 / 1. Why 150 tick boxes lie in no object was not looked
  into.
- **Finding:** Decided next: to name the types before working on the text lines, tick marks from the geometry
  first, the rest asked of the model.
- **Run:** not kept in the repository. Repeatable without a model on fillable form pages: for every form field of
  the PDF, what the geometry has at its place.

### Is an empty tinted area a field, and is a line?

- **Question:** How many of the empty tinted areas and of the lines lie where the PDF has a form field, and how
  many objects of a page are left for the model?
- **Test:** No model; counted on the form pages with form fields and, for the objects left, on all form pages
  and two sets of parliamentary pages; an earlier build of the geometry.
- **Result:** Of 290 empty tinted areas 256 lie on a form field (88 %); of 63 tinted areas with ink in them, 7.
  Of 725 horizontal lines 503 touch a field (69 %), of 318 vertical ones 199 (63 %). Left for the model per
  page: 39 objects in the median on forms (135 on the largest page), 19 on parliamentary pages (94 and 228 on
  the largest page of each set).
- **Finding:** None recorded with the count. The rule the code carries, an input is a tinted area with nothing
  written in it, was built the same evening (`src/page/elements.js`).
- **Run:** not kept in the repository. Repeatable without a model on fillable form pages: every tinted area and
  every line of the geometry against the form fields of the PDF.

### How many calls does a small photograph of a page cost?

- **Expectation:** 20 to 80 calls to the model for one photographed page, as announced before the run.
- **Test:** 7 October 2026: a made-up photograph of the first page of the Suva form in which the sheet is
  1 500 px wide, through the upload path of the app in a browser and the pipeline with the model.
- **Result:** The straightened page came out 1 582 px wide; the geometry found 370 objects, 275 of them unknown;
  202 calls had gone out when the limit set for the test ended the server. The geometry is measured on pages at
  300 dpi, 2 480 px wide. The larger photograph of the same page (12 megapixels) then gave 140 unknown elements
  and, with the specks left out, 68 calls.
- **Finding:** Straightening always puts out a page 2 480 px wide; a smaller sheet is scaled up
  (`src/app/js/capture/warp.js`).
- **Run:** not kept in the repository. Repeatable with the build of that hour and a rendered page laid in
  perspective so that the sheet is 1 500 px wide; since the change the same photograph is brought to 2 480 px
  first.

### What does a first cut of a page into objects find on form pages?

- **Question:** With no type, no text and no field named: where do the edges of the objects of a form page run?
- **Test:** No model, no reference. Ten form pages rendered at 300 dpi: the five on which an earlier build of the
  geometry had hit the most text fields and the five on which it had hit the fewest. Ink is smeared across gaps
  of 1.2 character heights horizontally and 0.7 vertically, and what then hangs together is an object; long thin
  runs of ink are taken out as lines beforehand. The character height of a page is the median height of its ink
  blobs. Counted per page and looked at as a picture.
- **Result:** At the first look three things were wrong: frames were drawn filled; dark title bars gave sham
  lines, because light type cuts a bar into long thin strips; grey fields and light lines were not seen, because
  only ink counted (half a page on one form). After that: 3 to 123 lines, 0 to 118 tinted areas and 23 to 151
  objects a page, 1.2 to 1.9 s a page. Still not right on the four pages looked at: an option list with narrow
  line spacing becomes one object per column (seven rows of tick boxes in one box); dotted writing lines come
  out as long thin objects and not as lines; a grey area with light lines in it stays one area; very light or
  coloured parts of a picture are not part of its object; the pages are rendered PDFs, nothing is cropped or
  deskewed.
- **Finding:** Built after the first look: a second mask for everything that is not paper, from which light
  lines and tinted areas are taken; a run of ink with ink above and below along more than half its length is
  part of an area and no line. The five further points were listed for a decision.
- **Run:** not kept in the repository. Repeatable without a model on rendered form pages: lines, tinted areas
  and objects counted per page and drawn into the page image.

### Does rendering the text back hit the font size better than the profile of the line?

- **Question:** Is there a way to hit the font size better by rendering the text, with two or three variants laid
  side by side?
- **Test:** No model: text and true size come from the PDF (to a third of a point), the resolution is known
  (300 dpi), compared per text line. Variants: A the profile of the line (the band of the x-height), B the text
  rendered in a stock typeface and matched in ink height, C matched in width, M the mean of B and C, Z the median
  of A, B and C, and four with a typeface chosen per line or per page. Four rounds on form pages and two sets of
  parliamentary pages; from the third round only reference lines with exactly one matching text line count:
  3 915 lines (3 250, 333 and 332), 1 741 left out.
- **Result:** Lines within 1 pt in the last round, all 3 915: A 91.4 %, B 89.7 %, C 91.9 %, M 95.2 %, Z 94.9 %;
  mean error 0.30, 0.24, 0.23, 0.19 and 0.22 pt. Per set (forms / documents / documents): A 91.1 / 90.4 / 95.5,
  B 88.4 / 94.3 / 97.3, C 93.4 / 82.6 / 86.7, Z 94.4 / 96.7 / 97.9. A typeface chosen per line gave 70.1 / 71.0 /
  81.7 in the first round, below A. In the first two rounds the line was the box of the reference, into which
  table lines and neighbouring lines reach: 743 lines of the forms too high at the right width, an error of the
  setup. Limits: the text is the PDF's and not a reading of the model; the resolution is known.
- **Finding:** Decided on 4 October 2026: the median of the three measures. In the port to this repository on
  7 October the two rendered measures were left out, there being no renderer without a dependency:
  `src/read/styler.js` takes the size from the profile alone.
- **Run:** not kept in the repository. Repeatable without a model on pages whose PDF names the font size: per
  text line the measured size against the PDF's.

### Can size, weight and slant of type be measured on the image, without the model?

- **Question:** Can font size, bold and italic be taken from the ink of a text block before the model has read
  anything?
- **Test:** No model. The first pages of two forms at 300 dpi, 74 text blocks (24 and 50). Per text line: the
  x-height is the band of pixel rows with at least half the ink of the fullest row, and the size is that height
  over 0.52 em; bold from the median horizontal run of ink in that band over the x-height (from 0.23); italic
  from the shear angle at which the columns of ink are sharpest (from 8°). Reference: size and style of each
  block as the PDF names them; a size counts within 1 pt.
- **Result:** Size within 1 pt: 23 of 24 and 48 of 50 blocks. Bold: 24 of 24 and 49 of 50. Italic: 24 of 24 and
  47 of 50. The misses are blocks with two styles in one line, and one short word. Two forms, rendered pages.
- **Finding:** The size is measured on the image, from the profile of the text lines and without the model:
  rendering the text back would need the reading and the typeface, the ink is there before both. Weight and
  slant are not measured in the code as it stands.
- **Run:** not kept in the repository. Repeatable without a model on rendered pages whose PDF names size and
  style of each text: the measured values against the PDF's, block by block.

### How close do font size and colour per element come to what the PDF states?

- **Question:** Measured on the page image for every element with text: how often is the font size within one
  point of the PDF's, and the colour within a small distance?
- **Test:** No model. Every element with text of three sets: form pages and two sets of parliamentary pages
  (2 903, 251 and 265 elements in the result file as kept); an earlier build of the geometry. Size from the
  profile of the text lines, converted to points over the width of the page, which is taken to be A4; text
  colour as what stands out from the most frequent colour in the box. Reference: the size (whole points) and the
  colour the PDF names; a colour counts within 32 of 255 on its furthest channel. Two versions.
- **Result:** Size within 1 pt / colour within 32. Version 1 (the x-height alone, colours on the reduced page):
  forms 83.5 % / 77.2 %, the document sets 57.8 % / 78.9 % and 66.0 % / 96.6 %. Version 2 (the largest measure
  a line yields, tick marks in the line left out, light type on a dark bar measured on the paper, colours at
  full resolution): 84.7 % / 96.8 %, 72.9 % / 94.8 % and 71.3 % / 99.2 %. On the reduced page a thin stroke
  mixes with the paper: #505152 measured for #231f20. More than 2 pt off: 282, 51 and 64 elements, among them a
  plan that is not A4 (27 elements) and a page in A5 (19; 12.4 pt for 9). The result file as kept, written about
  an hour and a half later after further changes to the code, reads 84.7 %, 72.1 % and 74.3 % within 1 pt and
  281, 53 and 57 elements more than 2 pt off.
- **Finding:** Version 2 was kept. The A4 assumption is recorded as a known source of error: on a photograph the
  size of the paper is not known.
- **Run:** not kept in the repository. Repeatable without a model on rendered pages with a text layer: per
  element the measured size and colour against those the PDF names.

## Catalogue and questions

### Can the model turn a whole form into a questionnaire in one call?

- **Question:** Given a whole form at once, does the large or the small model write one question per field, put the
  tick boxes that belong together into one question, and offer an answer where one is at hand?
- **Test:** The four forms shipped on 9 October 2026, 407 fields without the signatures; each page as a picture of
  text with every field id at its place. One call per form with swiss-ai/Apertus-v1.5-70B and with
  swiss-ai/Apertus-v1.5-8B, then the small model on two forms in bundles of six fields. 33 calls.
- **Result:** Both models answer in valid JSON in 4 of 4 calls and name no id that is not on the form. 70B writes 136
  questions for 336 of the 407 fields and asks 7 fields twice; 8B writes 286 questions for 392 fields and asks 4
  twice. Of 85 tick boxes and radios, 70B puts 65 into a question for several fields, 8B 22. An offered answer comes
  0 times from 70B and 6 times from 8B: at a date, as a whole question at a time field, at the sex, at a field without
  a label and at two radios. In bundles of six on two forms: 25 calls instead of 2, 135 of 136 fields covered, 42
  offers; 40 of 55 questions share a word with the printed label, against 44 (70B) and 36 (8B) with the whole form.
  No reference says which question is right.
- **Finding:** The fields are grouped by code, not by the model (`src/dialogue/units.js`), and no answer is offered in
  a question; the questions are not written in bundles of fields.
- **Run:** `results/catalogue-whole-form/`

### Does the existing filling sort a played dialogue back into the fields?

- **Expectation:** After the dialogue is read, each of the 16 fields of the walk-through's Betreibungsbegehren holds
  the made-up value set for it in `src/app/js/mock/forms.js`; a field without a value stays empty.
- **Test:** One call per model (70B, 8B) writes a questionnaire for the form. Every question is answered in writing
  from the made-up values of the fields it names, and the filling of the repository reads the pieces
  "Frage: … Antwort: …" unchanged. 18 calls, 9 per model.
- **Result:** With the questionnaire of 70B (10 questions, 13 of 15 fields asked): 7 of the 9 expected values the
  same, 1 different, 1 missing; 6 fields empty as expected, 1 filled that should be empty. With the questionnaire of
  8B (15 questions, 15 of 15 fields asked): 8 of 9 the same, 1 missing; 6 empty as expected, 1 filled that should be
  empty. In both runs the radio answered by the name of its option stays empty, and "Bemerkungen" takes "Reparatur"
  from the answer to another question. The answers were written, not spoken. Only the two calls that wrote the
  questionnaires are logged; the 16 calls of the filling are not.
- **Finding:** Fields hang on questions by code, and an answer goes only into the fields of its question
  (`src/dialogue/units.js`, `fillUnit` in `src/fields/filler.js`).
- **Run:** `results/catalogue-sort-back/`

### How many units to ask for do the fields of the shipped forms make?

- **Question:** How many units to ask for come out when code groups the fields into tables, choices and single fields?
- **Test:** The 407 fields of the four forms shipped on 9 October 2026, grouped by rule, without a model: rows built
  alike are a table, radios follow their group, tick boxes are grouped by the rule the pipeline has for radios,
  everything else is a single field.
- **Result:** 259 units: 205 single fields, 20 single tick boxes, 29 choices with 65 tick marks, 5 tables with 117
  cells. 38 units carry no printed label. On the three forms with form fields, 23 units lie on no form field of the
  PDF. No reference says which fields belong together.
- **Finding:** `src/dialogue/units.js`. The three distances of the table rule (0.7, 1.0 and 2.0 character heights) were
  set by the assistant, open.
- **Run:** `results/catalogue-units/` (the table and the units; no model call)

### Does the code put every field of a shipped form into a unit, in the order of the form?

- **Expectation:** Every field except the signature is in exactly one unit, the units are numbered in the order of the
  pages, and every text block is a line of the list; the order of the units is held against the order of the form
  fields in the PDF, the only order a form states.
- **Test:** `make test` (`tests/dialogue.js`), without a model, on the four forms shipped on 9 October 2026; for the
  rule that decides which question holds, a stand-in answers instead of the model.
- **Result:** 407 fields make 259 units: 225 single, 29 choices with 65 tick marks, 5 tables with 117 cells. 29 units
  are not asked, because a fillable PDF has no form field of their kind there; 37 asked units carry no printed label,
  34 of them on the Suva form. Neighbouring units stand in the order of the form fields in 108 of 116 pairs; the Suva
  form has no form fields and no count. 40 checks, none failed, when the test was first run; 70 as committed that
  day, none failed. These are the numbers of 9 October 2026; the forms were set right on 11 October and give other
  counts today.
- **Finding:** A place a fillable original has no form field for is not asked, and the conversation follows the order
  of the list of lines (`src/dialogue/units.js`, `src/dialogue/listing.js`).
- **Run:** `results/dialogue-units/` (the table of the test; no model call). Repeatable with `make test`.

### Does the small model write a plain question for every unit of a form?

- **Question:** Does the small model write one question in everyday language for each of the 259 units, and does the
  question stay with its place when the printed label is given or not given?
- **Test:** swiss-ai/Apertus-v1.5-8B, one call per form on the four forms: the form as a picture of text with the id
  of its unit at every place; first without the labels, then with the printed label of every unit listed. 8 calls.
- **Result:** Without the labels: 259 of 259 units get a question, no id is invented, 7 units are asked twice; 146 of
  208 questions share a word with the printed label, 102 of 125 with the name of the form field in the PDF. With the
  labels: 259 of 259, none twice; 194 of 208 and 110 of 125. With the labels 23 questions repeat the label word for
  word (6 without), 19 hold an abbreviation (9 without), and 78 are impersonal ("Welche Kunden-Nummer wird
  eingetragen?"), 71 of them on the Suva form. No reference says whether a question asks for what belongs at its
  place; the shared words are a lower bound.
- **Finding:** None taken. The questions written with the labels were the input of the next two trials.
- **Run:** `results/catalogue-plain-questions/`

### Does a second pass that only rewrites make the questions plainer?

- **Question:** When the small model gets its own questions back with the order to rewrite them in everyday language
  and keep the content, does it rewrite them, and do they still ask for the same?
- **Test:** The 259 questions written with the labels, sent to swiss-ai/Apertus-v1.5-8B without the form: all
  questions of a form in one call (4 calls), then twelve questions per call (23 calls).
- **Result:** In one piece 183 of 259 questions come back unchanged (35 of 36, 15 of 17, 26 of 96 and 107 of 110 per
  form). In bundles of twelve 246 of 259 come back, the answers for two forms are not valid JSON throughout, and 90
  are unchanged. Among the 246: questions with an abbreviation fall from 19 to 2, with a bracket or slash from 48 to
  11, impersonal ones from 77 to 43; questions that share a word with the printed label fall from 184 to 162 of 198,
  with the name of the form field from 101 to 88 of 116. The measure does not tell a freer wording from a question
  that now asks for something else.
- **Finding:** No rewriting pass (`docs/evidence.md`, section 8).
- **Run:** `results/catalogue-rewrite/`

### Does the small model tell who fills in which place of a form?

- **Expectation:** On the rebuilt certificate the party named for a place is the one its section prints over it
  (employer or doctor); on the Betreibungsbegehren a place the PDF has no form field for is named for the office, and
  a place with a form field is not.
- **Test:** swiss-ai/Apertus-v1.5-8B, one call per form on the four forms: the picture of text with the units and
  their labels; the model lists the parties of the form and names one for every unit, or "unklar". 4 calls. The
  accident report and the Suva form have no reference.
- **Result:** Certificate: 18 of 20 units of the employer's section and 10 of 11 of the doctor's section right.
  Betreibungsbegehren: 3 of 5 units without a form field are named for the office, 12 of 12 with a form field are
  not; for these 12 the model names the debtor 5 times, the creditor 6 times and "Gläubiger des Vertreters" once, on
  a form the creditor fills in. Accident report: employer 75 units, injured person 19, unclear 2. Suva form: the
  answer is not valid JSON and the list of parties is lost; injured person 38, unclear 36, employer 26, doctor or
  hospital 6, pharmacist 4.
- **Finding:** None taken from this test alone. The prompt that writes the questions treats the other person as
  unknown and asks about a named party in the third person (`src/dialogue/writer.js`); that wording is measured in
  the entry on the list of lines.
- **Run:** `results/catalogue-who-fills/`

### Does a check back over the page hold the small model's plain questions?

- **Question:** With the whole page in the prompt, does the small model rewrite its questions in plain language, and
  does it name the right place when it gets a question back without its id?
- **Test:** Two forms, 53 units, swiss-ai/Apertus-v1.5-8B, the page as a picture of text in every call: the questions
  are rewritten twelve per call; then the rewritten version and the version before go back without ids, mixed, and
  the model names the unit of each. 18 calls.
- **Result:** 45 of 53 questions come back word for word the same. The rewritten question is put at its own unit in 34
  of 53 cases, the version before in 27 of 53. The 45 questions with the same words were asked back twice that way:
  both calls name the same unit for 23, both the own unit for 19, one of the two for 14, neither for 12.
- **Finding:** None taken; the same task was run with the large model.
- **Run:** `results/catalogue-bridge/`

### Does the large model write the questions when the units are given, and does its check back confirm them?

- **Question:** With the units and their labels given, does the large model write a question for every unit, and does
  it name the own unit of a question when it gets the questions back without their ids?
- **Test:** Two forms, 53 units, swiss-ai/Apertus-v1.5-70B: one call per form writes the questions; then the model
  names the unit of every question in two runs with another mixing, twelve per call, with the page as a picture of
  text. 14 calls.
- **Result:** 53 of 53 units get a question, no id invented; no question holds an abbreviation, 4 a bracket or slash,
  3 repeat the label word for word; 33 of 47 share a word with the name of the form field. Asked back, the own unit
  is named for 41 and 38 of 53 questions per run; both runs name the same unit for 39, the own unit for 36, neither
  the own unit for 10. Both places about the debtor address the other person as the debtor ("Wie heissen Sie und wo
  wohnen Sie? …"). No reference says which questions are right.
- **Finding:** Decided on the day: the large model writes the questions. Changed the same day after the trials over
  the list of lines: the small model writes and checks (`src/dialogue/writer.js`, `src/dialogue/checker.js`).
- **Run:** `results/catalogue-bridge-large-model/`

### From whose seat does the model write?

- **Question:** Does the model stop speaking as the form when the prompt tells it that it leads the conversation and
  fills in the form itself afterwards?
- **Test:** The prompt for the questions with two sentences more: the interviewer's seat, and "ask for the matter
  itself, never ask the other person to enter, tick or fill in". 70B and 8B, one call per form on the four forms,
  8 calls; the language counted by rule against the runs without the two sentences.
- **Result:** 70B: 258 of 259 units get a question; 1 question is impersonal, 1 holds an abbreviation. 33 units, all
  on the Suva form and all without a printed label, are answered with "Hier ist nichts einzutragen, bitte weiter zur
  nächsten Frage."; one other question asks to enter. The table of further claims was asked "… tragen Sie bitte für
  jede Forderung den Betrag, den Zins und das Datum ein." before and is asked "… Bitte nennen Sie für jede Forderung
  den Betrag in CHF, den Zinssatz in Prozent und das Datum, ab dem der Zins läuft." now. Of the 13 places about a
  third party, 2 still address the other person as that party (the debtor's name and date of birth). 8B: impersonal
  questions fall from 78 to 0, 21 questions still ask to enter (69 before), and 10 units of the Betreibungsbegehren
  get the printed label back and nothing else.
- **Finding:** The interviewer's seat is in the prompt that writes the questions (`src/dialogue/writer.js`).
- **Run:** `results/catalogue-interviewer-seat/`

### Does the check back over the page layout hold on all four forms?

- **Question:** Asked back with the page as a picture of text, how many of the large model's questions are put at
  their own unit in two runs, on all four forms?
- **Test:** The 258 questions swiss-ai/Apertus-v1.5-70B wrote from the interviewer's seat; the same model names the
  unit of each in two runs with another mixing, twelve per call, 50 calls. Then the same check on the questions of 8B
  for two forms, 12 calls.
- **Result:** Both runs name the own unit for 128 of 258 questions: 23 of 36, 12 of 17, 56 of 96 and 37 of 109 per
  form. For 90 neither run does; 31 of them are units answered with "Hier ist nichts einzutragen …". For 43 questions
  both runs name one and the same other unit; 15 of these lie on a form field of the PDF, and 13 of the 15 share a
  word with the name of that form field. On the questions of 8B, two forms: 38 of 53. No reference says which
  questions are right.
- **Finding:** The check runs over the list of lines, not over the picture of text (`src/dialogue/listing.js`,
  `src/dialogue/checker.js`; `docs/evidence.md`, section 8).
- **Run:** `results/catalogue-check-page-layout/`

### Does a check over the list of lines hold, and what does it let through?

- **Expectation:** A place that is handed the question of another place on purpose is not confirmed: the two runs of
  the check do not both name that place for the question.
- **Test:** swiss-ai/Apertus-v1.5-70B on the four forms: one call per form writes a question per unit over the form as
  a list of lines, the other person unknown; then the model names the unit of every question in two runs, twelve per
  call, with the list of the page. 52 calls. Without a further call every place is handed the question of its
  neighbour, and of a random other place of the page in 20 mixings.
- **Result:** 245 questions for 259 units; 4 units are answered KEINE, 10 get no line. 182 of 245 hold: 29 of 34, 17
  of 17, 70 of 84 and 66 of 110 per form. 63 are rejected, 38 because the runs differ and 25 because both name the
  same other unit. A neighbour's question passes in 12 of 474 cases (2.5 %), another place's in 10 of 4725 (0.2 %).
  Of the 13 places about a third party, 0 address the other person as that party. Not seen by the check: of 23 units
  the PDF has no form field for, 14 got a question that holds; of the 101 holding questions on a form field, 15 share
  no word with its name, and the 66 holding questions of the Suva form have no reference.
- **Finding:** The form goes to the model as a list of lines (`src/dialogue/listing.js`); a question holds when both
  runs of the check name its own unit (`src/dialogue/checker.js`, `src/dialogue/dialogue.js`); the other person is
  unknown and a named party is asked about in the third person (`src/dialogue/writer.js`).
- **Run:** `results/catalogue-list-of-lines/`

### Do the questions written for the walk-through's forms hold in the check?

- **Question:** How many units of the two forms of the walk-through get a question that holds, written and checked by
  the code of the pipeline?
- **Test:** `make walkthrough` (`tools/dialogue.js`): the two forms of the walk-through, their section titles and
  labels as the list of lines; swiss-ai/Apertus-v1.5-8B writes one question per unit and names the unit of every
  question in two runs. 12 calls.
- **Result:** Betreibungsbegehren: 14 of 14 questions hold; one line of the model carries an id the list does not show
  and is not taken. Suva form: 26 of 27 hold; for "Tag" both runs name the unit of "Jahr", and the unit keeps its
  label. One run. The questions were kept as written, among them "Wie heissen die verletzte Person?".
- **Finding:** The questions stand in `src/app/js/mock/dialogues.js`; the walk-through under `/?demo` asks them.
- **Run:** `results/walkthrough-questions/`

### Can the small model write the questions of a form from its list of lines?

- **Question:** Does the small model write a plain question for every unit of a form when the form goes in as a list
  of lines, and does it matter whether it gets the whole form, one page, or twelve units of a page at a time?
- **Test:** The four forms that shipped on 9 October 2026 (407 fields, 259 units), each as a list of lines with the
  id of a unit behind its label; one prompt, sent with the whole form (4 calls), page by page (8) and in bundles of
  twelve units (25). 37 calls to the small model. Beside it the questions the large model wrote over the whole form
  that morning.
- **Result:** Questions written: whole form 256 of 259, page by page 237 (20 times "KEINE", 18 of them on the Suva
  form), bundles 256; large model 245, with 10 units left out. With a bracket or slash of the form in them: 34, 17
  and 28 (large model 10). Speaking of the form, a field or a table: 28, 11 and 7 (12). Of the 13 units about a
  third party (debtor, injured person) the whole-form and page-by-page writings address the other person as that
  party in 0, the bundles in 10 by the pattern counted ("Wann sind Sie geboren?"); one more of the bundles does so in
  words the pattern does not hold ("In welchem Zivilstand befinden Sie sich?"). At the model: 78, 49 and 50 seconds.
  One run; no reference names the right question.
- **Finding:** The small model writes the questions, one call per page (`src/dialogue/writer.js`). A page is not
  written in bundles.
- **Run:** `results/trial-question-writing/`

### Does a question lead a respondent to the form field it asks for?

- **Expectation:** A respondent who knows only the names of the PDF's form fields names the field's own name often
  when it is asked with the printed label, and does not name it when it is asked with the question of the next unit.
- **Test:** The three forms whose PDF has form fields. A respondent played by the small model gets the names of the
  form fields of a page, each with a token, and up to twelve questions, and returns the token of the entry each
  question asks for. Six questionnaires: the two controls, the questions of the large model, and the three writings
  of the small model. 66 calls.
- **Result:** Names its own field: printed label 76 of 123, question of the next unit 2 of 115. Large model 68 of
  115; small model whole form 81 of 124, page by page 77 of 123, bundles 80 of 125. On the Betreibungsbegehren the
  printed label leads to its own field in 4 of 12 cases. Of the page-by-page questions that hold in the check, 65 of
  100 name their own field, 18 another and 17 none.
- **Finding:** The printed label stays beside every question in the app (`src/app/js/screens/form.js`).
- **Run:** `results/trial-played-interview/`

### Does the small model's check of the questions hold, and what does it let through?

- **Expectation:** The check names for every question the unit it was written for, and does not name a unit a
  question was handed to on purpose. Written down before the run as the comparison: the large model checking its
  own questions (182 of 245 named right twice, a neighbour's question passing in 12 of 474 cases, another place's
  in 10 of 4 725).
- **Test:** Three questionnaires over the four forms: the small model's over the whole form and page by page, and
  the large model's. The small model gets the list of lines of a page and up to twelve of its questions without
  their unit, mixed, and names the unit of each; two runs each, 146 calls. Errors on purpose, counted without a
  call: every unit is handed the question of the unit before and after it, and in twenty mixings the question of
  another unit of the page.
- **Result:** Named right in both runs: whole form 178 of 256, page by page 173 of 237, large model's questions 161
  of 245. A neighbour's question passes in 15 of 496, 10 of 458 and 8 of 474 cases, another place's in 30 of 4 946,
  12 of 4 568 and 9 of 4 725. Of the 23 units that stand where the PDF has no form field, 15, 12 and 10 get a
  question that holds. One run alone: 190, 189 and 173 hold, and 19, 18 and 17 neighbour's questions pass.
- **Finding:** The small model checks the questions, twice (`src/dialogue/checker.js`); a question holds when both
  runs name its own unit (`src/dialogue/dialogue.js`). Twelve questions per call: set by the assistant, open.
- **Run:** `results/trial-question-check/`

### How many questions of a page are worded like another?

- **Question:** How often does a writing ask two units of the same page with the same words, and how many of the
  neighbour's questions that pass the check are such questions?
- **Test:** No call: the questions of the three writings above and the printed labels, compared by their letters
  and digits within a page; the check answers of the run above.
- **Result:** Worded like another on the page: small model whole form 57 of 256 questions, page by page 29 of 237,
  large model 28 of 245; printed labels 39 of 221. Of the questions that hold, 13, 7 and 1 are such. Of the
  neighbour's questions that pass, 6 of 15, 2 of 10 and 0 of 8 have the wording of the unit's own question; with
  other wording 9, 8 and 8 pass.
- **Finding:** Two units of a page asked with the same words both keep their printed label (`holding` in
  `src/dialogue/dialogue.js`).
- **Run:** `results/trial-question-writing/result.md` (wording) and `results/trial-question-check/result.md` (the
  neighbour's question), counted from the calls of both folders.

### How do the questions read beside the printed labels?

- **Question:** Are the written questions easier to read than the labels, by a readability index?
- **Test:** No call: LIX (words per sentence plus the share of words longer than six letters) over all printed
  labels and over the questions of each writing.
- **Result:** Printed labels 61; small model whole form 42, page by page 40, bundles 40; large model 39. Words per
  question 8.2 to 8.4, per label 3.9.
- **Finding:** None taken.
- **Run:** `results/trial-question-writing/result.md`, the last table.

### How many runs of the check does a question need?

- **Expectation:** A question is named for its own unit in every run, and a question handed to a neighbouring unit
  on purpose is not named for it.
- **Test:** Four runs of the check by the small model over one questionnaire of 256 questions (the second writing
  over the whole form), 100 calls; counted with the first one, two, three and four runs.
- **Result:** Named right in every run counted, and neighbour's questions passing of 496: one run 181 and 28, two
  runs 174 and 16, three 164 and 14, four 154 and 14. Of those passing, 8, 5, 4 and 4 have the wording of the unit's
  own question.
- **Finding:** Two runs (`RUNS` in `src/dialogue/checker.js`).
- **Run:** `results/trial-check-runs/`

### Does the same order give the same questions a second time?

- **Question:** Do the same prompt and temperature 0 return the same questions, and does the check hold the same
  ones?
- **Test:** The three writings sent again unchanged (16 calls, 4 of them to the large model), each second writing
  checked twice by the small model (196 calls, 100 of them the four runs of the entry above, of which two count
  here); compared unit by unit with the first writing and its check.
- **Result:** Word for word again: small model whole form 133 of 256 questions, page by page 121 of 236, large
  model 208 of 245. Holding in the first and in the second writing: 178 and 174 (160 in both), 173 and 178 (158),
  161 and 159 (141); 32, 35 and 38 of 259 units change sides. Of the questions that came back word for word the
  check decides 12 of 133, 15 of 121 and 29 of 208 differently in the two writings. With the wording used once on
  the page and a form field behind the unit: 151 and 152, 154 and 157, 150 and 150.
- **Finding:** The questions are written once, when a form is captured, and kept with it (`dialogue` of the job;
  for a shipped form `data/forms/<form>/captured.json`); they are not written anew when a form is opened.
- **Run:** `results/trial-second-writing/` (the check of the second whole-form writing is
  `results/trial-check-runs/`)

### Does the list of lines follow the order of the form fields in the PDF?

- **Expectation:** The units of the list of lines follow each other as their form fields do in the PDF.
- **Test:** No call: the three forms whose PDF has form fields, 126 units with a form field; neighbouring units
  taken in the order of the list of lines and in the order of their ids.
- **Result:** In the order of the PDF: 110 of 123 pairs by the list of lines (certificate 30 of 34,
  Betreibungsbegehren 10 of 11, accident report 70 of 78), 106 of 123 by the ids.
- **Finding:** The conversation follows the list of lines, not the ids of the units (`src/dialogue/units.js`).
- **Run:** `results/trial-question-check/result.md`, section "The order of the list of lines".

### What does the model write for a unit without a printed label?

- **Question:** How many units have no printed label, and do they get a question?
- **Test:** No call: the 259 units of the four forms, the three writings and their check.
- **Result:** 38 units have no label, 34 of them on the Suva form. Page by page the small model writes "KEINE" for
  20 and a question for 18, of which 3 hold; over the whole form "KEINE" for 2 and a question for 36, of which 3
  hold. Either way 35 units are left with neither a question that holds nor a label.
- **Finding:** None taken.
- **Run:** `results/trial-question-check/result.md`, section "Units without a printed label".

### What does it cost to write and check the questions of a form?

- **Question:** How many calls, seconds and tokens does a form take when the small model writes page by page and
  checks twice?
- **Test:** No call: the logged calls of the page-by-page writing and of its two check runs, per form.
- **Result:** Certificate (36 units) 7 calls, 14 seconds at the model, 11 113 tokens in and 2 102 out;
  Betreibungsbegehren (17) 8 calls, 11 seconds, 10 563 and 1 625; accident report (96) 20 calls, 38 seconds, 28 409
  and 5 831; Suva form (110) 21 calls, 40 seconds, 26 369 and 5 993. The two seconds the client waits before every
  call are not in the seconds.
- **Finding:** None taken.
- **Run:** `results/trial-question-check/result.md`, section "What a form costs".

### Do the questions written for a form hold in the check?

- **Question:** How many places of the four shipped forms get a plain question that holds, and how often does the
  check let through a question that belongs to another place?
- **Test:** `make dialogue` (`tests/questions.js`): the pipeline's code on the four shipped forms, read from the
  text layer. The model writes a question per unit, one call per page, and names the unit of every question in two
  runs, twelve questions per call; a question holds when both runs name its own unit and no other unit of the page
  is asked with the same words. The check is measured with errors put in on purpose: every place is handed the
  question of its neighbour, or of another place of the page. 47 calls.
- **Result:** Of 259 units 29 are not asked; 214 questions are written, 156 hold and 74 units keep their printed
  label. A neighbour's question is let through in 10 of 414 cases (2.4 %), another place's in 20 of 4134 (0.5 %).
  One run, on the forms as they shipped on 9 October 2026; no reference names the right question.
- **Finding:** A unit whose question does not hold keeps its printed label, and two units asked with the same words
  both keep theirs. The questions are written once, when a form is captured, and kept with it.
- **Run:** `results/dialogue/` and `results/dialogue.md`

## Answers

### Does a played conversation fill the walk-through's form?

- **Expectation:** Every field holds the made-up value the walk-through sets for it; a field the respondent knows
  nothing about stays empty.
- **Test:** The walk-through's Betreibungsbegehren, 14 units with 15 fields, its list of lines made of section
  titles and labels only. The questions written once by the small and once by the large model and checked twice; a
  respondent played by the small model knows only the made-up dictation and answers every question; the answers are
  read six per call. 8 calls per conversation, 16 calls, one of them to the large model.
- **Result:** Questions of the small model: 14 of 14 hold; 4 fields as expected, 4 different, 6 empty as expected,
  1 empty where a value is expected, none with a value where none is expected. Questions of the large model: 11
  hold, 3 units are asked with the label; 5, 3, 6, 1 and 0. Said at once on 7 October: 6, 3, 5, 0 and 2. The large
  model asks the debtor's place as "Wie heißen Sie … und wo wohnen Sie?", and the check lets it hold. The choice of
  the payment details stays empty in both: neither question names the printed options, and the answer names none.
  One run each.
- **Finding:** At a choice the app shows the printed options by code. The writer replaces ß by ss
  (`src/dialogue/writer.js`). The run was built again with the repository's code as `tests/answers.js`.
- **Run:** `results/trial-played-conversation/`

### Does the filling put every answer into the fields of its question?

- **Expectation:** Every field holds the made-up value the walk-through sets for it, and no value stands in a field
  it was not said for.
- **Test:** The questions and answers of the two played conversations above, each answered question in a call of
  its own with the prompt and the reader of `src/fields/filler.js` and the fields of its unit only; 18 calls.
  Counted twice from the same answers: with the lines as the reader takes them by the name in front of the colon,
  and with a unit of one field taking the whole answer.
- **Result:** As expected, different, empty as expected, empty where a value is expected, value where none is
  expected. Questions of the small model, lines as named: 4, 4, 6, 1, 0; one field takes the whole answer: 5, 4, 6,
  0, 0. Questions of the large model: 4, 3, 6, 2, 0 and 6, 3, 6, 0, 0. Said at once on 7 October: 6, 3, 5, 0, 2.
  The lines that were not taken name the field by its label ("gläubiger:" for `glaeubiger`) or split it ("name:",
  "adresse:", "plz_ort:"). Among the different ones is an IBAN the model changed while reading (CH93 0076 201 11 …),
  marked for a look.
- **Finding:** An answer goes into the fields of its unit and nowhere else, and a unit with one field takes the
  whole answer whatever name the line carries (`fillUnit` in `src/fields/filler.js`).
- **Run:** `results/trial-answer-by-unit/`

### Does saying everything at once still fill a form?

- **Expectation:** Every field holds the made-up value the walk-through sets for it; a field the dictation does not
  mention stays empty. On the Betreibungsbegehren the count of 7 October stands beside it.
- **Test:** The filling as it was on the afternoon of 9 October, the small model, no catalogue: the walk-through's
  Betreibungsbegehren from its made-up dictation (`tests/fill.js`, 16 fields, 10 calls), and the walk-through's
  Suva form from its made-up dictation of three pieces (33 fields counted, 6 calls), measured for the first time.
- **Result:** Betreibungsbegehren: 6 as expected, 3 different, 5 empty as expected, 2 values where none is expected,
  as on 7 October. Suva form: 9 as expected, 13 different, 9 empty as expected, 2 values where none is expected. Of
  the 13, five hold another fact: day, month and year of the accident hold the date of birth, the time is 20:02 for
  14:20, the employer's postcode 6304 for 6300; eight are written otherwise or shorter. 9 of the 15 deviating fields
  ask for a look; day and month are literal and do not. One run each.
- **Finding:** The dictation in one go stays, for what is still open.
- **Run:** `results/trial-dictation-rest/` holds the tables field by field. The calls of the filling were logged
  with the job, which the runs removed; repeatable with `make bench` and the walk-through's Suva form.

### Does the dictation for the rest leave single answers as they are?

- **Expectation:** A field answered at its question holds the same value after the dictation; every field holds the
  made-up value the walk-through sets for it.
- **Test:** The walk-through's Betreibungsbegehren: a respondent played by the small model answers the first four
  questions from the made-up dictation, each answer is read for the fields of its question, a question answered
  with "Das weiss ich nicht." is ticked off; then the dictation is read for what is open. 7 calls.
- **Result:** The four fields answered singly are unchanged, 4 of 4. Over the 15 fields: 7 as expected, 2
  different, 4 empty as expected, 2 values where none is expected (the representative and the remarks, as with the
  dictation alone). One run.
- **Finding:** None taken; the rule that the dictation leaves answered, typed and ticked-off fields alone was built
  before the run (`fillJob` in `src/fields/filler.js`).
- **Run:** `results/trial-dictation-rest/` holds the table and the respondent's call; the six calls of the filling
  were logged with the job, which the run removed.

### Can the model tell when a place is answered?

- **Expectation:** The value itself is judged enough; "Das weiss ich nicht." is judged as nothing fitting; the value
  of the next unit and only the first part of a value are not judged enough. The last is an assumption.
- **Test:** 98 cases built from the 31 units with a value of the two walk-through forms; one judgement per call from
  the question, the printed label and the answer: `ja`, `unvollständig` or `nein`, and what is missing. The 31 full
  answers judged a second time. 129 calls to the small model.
- **Result:** Judged `ja`: the value itself in 29 of 31 cases, "Das weiss ich nicht." in 0 of 31 (`nein` 4,
  `unvollständig` 27), the value of the next unit in 8 of 31, the first part of a value in 1 of 5. The second
  judgement of the full answers is the same in 31 of 31. A call takes 252 ms at the median as the client logged it.
  Among the eight values of the next unit judged `ja`: a name with an address at the debtor, "10" at the day, the
  IBAN at the payment details. Made-up values, one run.
- **Finding:** After an answer to a single written field the model judges it; anything but `ja` leaves an
  `incomplete` hint that says what is missing (`judgeEnough` in `src/review/hints.js`). Choices and tables are not
  judged: set by the assistant, open.
- **Run:** `results/trial-answer-enough/`

### Is an answer enough for its place?

- **Expectation:** Every judgement equals the verdict set for its case: the value itself is enough; "Das weiss ich
  nicht.", the value of the next unit and only the first part of a value are not enough.
- **Test:** `make dialogue` (`tests/enough.js`): 98 cases built from the 31 units with a value of the two
  walk-through forms, one judgement per call from the question, the printed label and the answer; the 31 full
  answers are judged a second time. 129 calls.
- **Result:** Taken as enough: the value itself in 29 of 31 cases, "Das weiss ich nicht." in 0 of 31, the value of
  the next unit in 8 of 31, only the first part of a value in 1 of 5. The second judgement of the full answers
  gives the same verdict in 31 of 31. This holds for made-up values on two forms, one run.
- **Finding:** After an answer to a single field the model judges it; anything but a plain yes leaves a hint that
  says what is missing, and the question shows as open to a decision. The judgement sees what is missing, not
  whether what was said is true: the values of the next unit it takes fit the place by their kind ("10" for the
  day, a name with an address for the debtor).
- **Run:** `results/enough/` and `results/enough.md`

## Required entries

### Which way binds the required entries of a catalogue to the questions?

- **Question:** Which way finds the units of the dialogue at which the required entries of a form's catalogue are
  entered: the label of a field, the small model, the large model, or a combination?
- **Test:** The 33 required entries of the four catalogues and the forms as captured on 9 October 2026. Per page one
  call to 8B and one to 70B with the list of lines and the required entries, 14 calls. Counted against a reference
  read against the pages after the run: 28 entries have a place in the dialogue, 43 units.
- **Result:** The label binds 17 of the 28 entries and 26 of the 43 units, no wrong unit. 8B alone: 19 entries with a
  right unit and no wrong one, 7 with a wrong one beside, 26 wrong units in all. 70B alone: 20 and 5, 34 wrong units.
  The label, else what both models name: 26 entries, 38 units, 3 wrong units. The label, else one model: 25 entries,
  with 22 (70B) and 12 (8B) wrong units. The reference is read, not measured.
- **Finding:** `bindRequired` in `src/dialogue/required.js`: the label of a field, else the unit both models name.
- **Run:** `results/required-bind/`

### Does a check back sort out the wrong units of a required entry?

- **Question:** Shown a unit and the list of the required entries, does the small model name the entry the unit was
  bound to when the unit is right, and another or none when it is wrong?
- **Test:** swiss-ai/Apertus-v1.5-8B, one call per unit: the 15 units both models had named for an entry the label
  does not bind, then the 31 units only one model had named. 46 calls. The same reference as in the entry above.
- **Result:** Of the 15 units, 12 are right and 3 wrong; the check keeps all 12 and 1 of the 3 ("Ort und Datum" for
  the signatures of the accident report). Bound with it: 26 of 28 entries, 38 of 43 units, 1 wrong unit. Of the 31
  units only one model names, 3 are right and 28 wrong; the check keeps 1 of the 3 and 5 of the 28. With those: 27
  entries, 39 units, 6 wrong units. Unbound after the check on what both name: the amount of the claim on the
  Betreibungsbegehren and "Arbeit zufolge Unfalles ausgesetzt?" on the accident report.
- **Finding:** A binding by both models stays only when the check back names the same entry; a unit only one model
  names is not taken (`src/dialogue/required.js`; `docs/evidence.md`, section 8).
- **Run:** `results/required-check-back/`

### Can the model name the required places of a form without a catalogue?

- **Question:** Without a catalogue, do the models name the units that the checked catalogues require, and leave the
  others?
- **Test:** The pages of the four captured forms as lists of lines, no catalogue in the prompt; 8B and 70B each name
  the places that have to be filled in for the form to serve its purpose. 14 calls. Reference: the 43 units of the
  required entries, read against the pages after the run.
- **Result:** 8B names 121 of the 230 asked units, 31 of the 43 required ones among them: 80 of 110 units on the Suva
  form, 2 of 35 on the certificate. 70B names 112, 30 of the 43 among them.
- **Finding:** A form without a checked catalogue carries no required marks (`src/dialogue/required.js`,
  `src/pipeline.js`; `docs/evidence.md`, section 8).
- **Run:** `results/required-without-catalogue/`

### Can the model mark what is required when the catalogue is built?

- **Expectation:** The entries the model marks as required are the 33 of 136 that carry the mark in the four checked
  catalogues.
- **Test:** Three calls per form: swiss-ai/Apertus-v1.5-70B builds the catalogue anew from the text of the form with a
  key for required; 70B and 8B each mark the required ones among the entries of the checked catalogue, shown without
  the mark. 12 calls.
- **Result:** Marking: 70B marks 100 of the 136 entries, 31 of the 33 among them. 8B returns the numbers 1 and 4, the
  example of the prompt, for each of the four forms: 8 marks, 2 of the 33. Catalogue anew: 7 of 16, 16 of 16 and 18
  of 42 entries are marked on three forms; the call for the fourth ended with status 504 after 60 seconds, without an
  answer.
- **Finding:** Required is what the checked catalogue marks; the model sets no required mark
  (`src/dialogue/required.js`).
- **Run:** `results/required-marked-by-model/`

### Which questions does a form require?

- **Question:** At which questions of the dialogue are the required entries of a form's catalogue entered?
- **Test:** `make required` (`tools/capture.js --required`): the 33 required entries of the catalogues of the four
  captured forms are bound to the questions of their dialogue, by the label of a field, else by the unit both the
  small and the large model name, when the check back names the same entry for it. 29 calls.
- **Result:** 17 entries are bound by the label, 10 by both models with the check back, 6 are not bound; 39 of 230
  asked questions are marked required. Read against the pages, one of the 10 is wrong ("Ort und Datum" for the
  signatures), and two entries with a place stay unbound (the amount of the claim, "Arbeit ausgesetzt?"). One run,
  on the forms as they were captured on 9 October 2026.
- **Finding:** The marks are kept with the captured forms. Nothing has to be answered: what is required and still
  empty is a warning before sending.
- **Run:** `results/required/` and `results/required.md`

## Kinds of fields

### Can the small model say what a field takes?

- **Question:** Does the small model name the kind of entry for each place a person writes into (text, a number, a
  telephone number, a postcode and so on), and the same kind in a second run?
- **Test:** The 178 places a person writes into on the four forms that shipped at the time, one call per page with
  the list of the page. Eight kinds to choose from in two runs, then nine kinds (an identifier of its own) in one
  run; 21 calls.
- **Result:** Eight kinds: a kind in both runs for 176 of 178 places, the same kind for all 176. By the labels that
  name their kind: telephone 8 of 8, e-mail 4 of 5, IBAN 1 of 1; all 15 places with "Nr." or "Nummer" in the label
  and the one labelled "PLZ" came back as text. Nine kinds: 13 of those 15 as an identifier and "PLZ" as a postcode;
  "Anzahl Kinder" and one "Geburtsdatum" as an identifier too; 5 places without an answer, four of them without a
  label; 8 places called a date that the label rule of the app does not call one. The nine kinds were run once.
- **Finding:** The kind of a field the geometry calls text is proposed by the model with the nine words and marked
  as proposed; a kind set in the mask in which a form is corrected stands. The model's word for a date is not taken.
- **Run:** `results/field-kinds/`

### Does the model transcribe better when it is told the kind of the field?

- **Expectation:** Each of 19 single answers comes back with the value set for it beforehand, with the transcription
  prompt as it is and with the kind of the field named behind it.
- **Test:** 19 made-up single answers (telephone, postcode, identifier, e-mail, number, date, time of day, IBAN),
  spoken by two synthetic voices; each recording sent with the prompt as it is and with one sentence behind it that
  names the kind ("In der Aufnahme wird eine Telefonnummer genannt."). 76 calls. The same on two dictations and two
  single answers of a tester, 8 calls, which are not kept.
- **Result:** The value stands in the transcript of 9 of 38 recordings with either prompt. Its digits are right in
  13 of 38 with either, and in 15 with the kind named when "eins" counts as a digit. E-mail 0 of 4 and IBAN 0 of 2
  with either. Both prompts give the same text for 19 of 38 recordings. The two dictations come back as the app had
  stored them, character for character, with the prompt as it is, and as another text with the kinds named. This
  holds for synthetic voices and answers of two to eight seconds, every call made once; what was said in the
  recordings of the tester is not known.
- **Finding:** The transcription prompt stays as it is; the kind of a field is not named in it.
- **Run:** `results/kind-at-hearing/`

## Lists of entries

### Can a list of entries be read from a dictation in one go?

- **Expectation:** After one dictation the rows of a list hold the entries the dictation names, an entry a row and
  each cell its value; where it names none, no row is filled.
- **Test:** Six made-up dictations as text: four with 0, 1, 2 and 3 further claims beside the claim itself
  (`betreibungsbegehren`), two with 1 and 2 periods of incapacity for work (`arbeitsfaehigkeitszeugnis`). Read three
  ways: the cells in bundles of six as before (two dictations), the list alone in one call with a line per entry,
  and the list alone with the values of the other fields named and numbered lines per entry; 24 calls.
- **Result:** In bundles: all 9 rows filled in both dictations, with the claim itself where no further claim was
  said, and 1 of 8 cells right where two were said. The list alone: the claim itself as the entry in 3 of 4
  dictations, 0 of 24 cells right, every value one column to the right where it found three. With the other fields
  named: 1, 2 and 3 entries for 1, 2 and 3 said and 19 of 24 cells right, but one entry where none was said; on the
  certificate 2 of 5 cells right, and one entry for two with 3 of 10 (4 of 5 and 4 of 10 when a date counts however
  it is written). This holds for made-up dictations given as text, without a recording, every call made once.
- **Finding:** Not built. A dictation in one go leaves a list open; the list is asked afterwards, entry by entry
  (see the next entry).
- **Run:** `results/list-in-dictation/`

### One answer to a list: one entry, or several?

- **Expectation:** For each made-up answer to the question of a list the model returns as many entries as the answer
  names, each cell with its value; an answer that names none returns no entry.
- **Test:** Seven made-up answers as text with none to three entries (further claims on `betreibungsbegehren`,
  periods of incapacity for work on `arbeitsfaehigkeitszeugnis`); one call each, the answer of the model a block per
  entry with a line per column; 7 calls.
- **Result:** The number of entries is right for 7 of 7 answers and 42 of 43 cells are right, read by the order of
  the lines in a block. In front of a value the model put the number of the column in three answers and the label
  of the column or other words in three; read by the number alone, those three give no entry and the number of
  entries is right for 4 of 7. This holds for made-up answers given as text, without a recording, every call made
  once; reading by the order of the lines was set after the run.
- **Finding:** The model says how many entries an answer names, and each goes into the next free row (`fillEntries`
  in `src/fields/filler.js`); a block is read by the order of its lines, whatever stands in front of a value.
- **Run:** `results/list-in-answer/`

### Does a list of entries take one answer per row?

- **Question:** Does an answer to a table with several rows for the same thing go into one row and the next answer
  into the next, and how does the conversation show it?
- **Test:** The shipped form `betreibungsbegehren` as set right on 11 October 2026, the table of further claims (9
  rows of 4 columns): two typed, made-up answers one after the other through the server, 8 calls; then the
  conversation in the browser without a model.
- **Result:** The first answer is read into the fields of row 1 ("Eine Rechnung vom 3. Mai 2025", "500", "5",
  "01.06.2025"), the second into those of row 2 ("Die Miete für Juni", "1200", interest and date not said). The
  second call names only the fields of row 2 and holds only the second answer. The catalogue judges both grounds as
  not enough ("unklar", "nein") and both amounts as enough. In the browser the conversation shows the entries 1 and
  2 and no empty row, and asks "Noch ein Eintrag?" with "Ja" and "Nein, das war alles". Two entries, one run, typed.
- **Finding:** A table whose cells are all labelled and whose rows carry the labels of the first is a list of entries
  (`repeat` in `src/dialogue/units.js`): one answer, one row, and a row nothing stands in is not shown
  (`tests/loops.js`).
- **Run:** `results/loop-two-entries/`

### Does one answer that names several entries fill several rows?

- **Question:** Through the server, does an answer that names two entries fill two rows, a further answer the next
  row, and "none" no row?
- **Test:** Three typed, made-up answers to the question of the list of further claims: one naming two entries, one
  naming one more, and on a second job "Nein, keine weiteren."; 12 calls (3 read the entries, 6 judge values against
  the catalogue, 3 look for a better passage).
- **Result:** The model returns 2 entries, 1 entry and KEINE. The two entries go into rows 1 and 2, the next into row
  3; after "Nein, keine weiteren." no value is entered. In front of the values the model writes words instead of the
  number of the column it was asked for, two of them taken from the question ("Grund oder Urkunde mit Datum",
  "Zinssatz in Prozent"); the values are taken by the order of the lines. Noted on the day and not kept in a file:
  the date "1. August 2025" stands in the field as "01.08.2025". One run, typed answers.
- **Finding:** None taken beyond the entry "One answer to a list: one entry, or several?": the reading built after
  that trial (`fillEntries` in `src/fields/filler.js`) is the one run here.
- **Run:** `results/loop-several-in-one-answer/`

## Speech

### Does the model keep the language of a dictation?

- **Question:** Does a clean dictation in German, French or Italian come back in its own language?
- **Test:** One script of 13 facts in the three languages, six synthetic voices (a female and a male one per language),
  with the instruction "do not translate"; then again with the source language stated in the prompt.
- **Result:** German: 13 of 13 facts with both voices. French female 12 of 13, Italian female 11 of 13. The male French
  and Italian voices came back translated into German with invented content (8 and 9 of 13). With "the language is
  Italian, answer in Italian" all six stay in their language (French male 13 of 13).
- **Finding:** The prompt of the transcription names the spoken language explicitly.
- **Run:** not kept in the repository. Repeatable with six recordings of one script of 13 facts and the two
  instructions quoted above.

### Does the large model hear more of a dictation under white noise than the small one?

- **Question:** How many facts of a dictation does the large model (70B) return as white noise is added, beside
  the small one?
- **Test:** A made-up dictation of a fall report (85 words, 13 facts), one synthetic German voice, 37.9 s; clean
  and with white noise at ten levels from +30 to −15 dB signal-to-noise; 70B, temperature 0, the prompt
  "Transkribiere die Aufnahme wortwörtlich.", one run per level, 11 calls. Counted: the 13 facts, digits and
  number words both accepted.
- **Result:** Facts of 13 for 70B, with 8B in brackets: clean 12 (11), +30 dB 11 (11), +25 dB 12 (10), +20 dB
  8 (12), +15 dB 5 (6), +10 dB 2 (4), +5 dB 2 (0), 0 dB and below 0 (0). Under heavy noise both write fluent text
  about something else; 70B at −10 dB a text on the history of a city, repeating. One voice, one text, one run
  per level.
- **Finding:** None taken; the work log leaves the decision open.
- **Run:** not kept in the repository. Repeatable with one synthetic recording of a script of 13 facts, white
  noise mixed in at the ten levels, and the prompt quoted above.

### Asked to correct a transcript by the recording, does the model listen?

- **Question:** Does the model compare the text with the audio at all, or does it hand back whatever text it is
  given?
- **Test:** One recording of the made-up dictation in Italian (13 facts, a synthetic female voice) and the small
  model's own transcript of it, with seven known errors. Three gross errors were put in on purpose: another name
  for the physician, "tre ore" for "venti minuti", a pulse of "sessanta" for "ottantotto". Recording and text in
  one call with "Korrigiere den Text anhand des Audio-Files." and the language stated; 8B, temperature 0, 1 call.
- **Result:** All 3 errors put in were corrected back; the 7 errors of the first transcript stand unchanged: the
  answer is the first transcript, character for character. One recording, one run.
- **Finding:** None taken; the work log leaves the decision open.
- **Run:** not kept in the repository. Repeatable with one recording, its first transcript with three errors put
  in, and the instruction quoted above.

### Does a recording reach the model through the server, as WAV and as MP3?

- **Question:** Does the path of a recording work end to end: encoded as MP3 by the library the app ships, taken
  by the server, transcribed?
- **Test:** 7 October 2026. The MP3 encoder (lamejs) run in Node on 2 s of tone. One recording of the made-up
  dictation of a fall report, a synthetic German voice, 38.3 s, uploaded to a job on the Betreibungsbegehren
  once as WAV (1.2 MB) and once as MP3 from the encoder (0.3 MB), 2 calls. The dictionary of the prompt came from
  that form and did not fit the recording.
- **Result:** The tone became a valid MP3 (64 kbit/s, 16 kHz, mono). Both pieces came back as a transcript of the
  whole recording (652 and 653 characters; 8.7 s and 2.7 s at the model). WAV: "Margit" for "Margrit",
  "Rolator". MP3: "Sturts Protokoll", "Magritt", "Spaltungskraft" for "Spitex-Mitarbeiterin". In the transcript
  as that run stored it the year of birth reads "neunzehnhundert 38" in both pieces and the year of the fall
  "2000 26" in one; with the code of the repository on the two stored answers both pieces read "1938" and "2026",
  the day "3. Oktober" (no call). In a browser without a window there is no microphone; the recording screen
  itself was not driven.
- **Finding:** A year the model writes as two number words is joined into one number (`src/speech/numbers.js`,
  `tests/numbers.js`).
- **Run:** not kept in the repository. Repeatable with one synthetic recording of a known script, sent once as
  WAV and once as MP3 to a job of a shipped form.

### What do short spoken answers to single questions come back as?

- **Question:** Seen in passing in a stored session: what does the model return for answers of two to three
  seconds, each sent alone?
- **Test:** No new call: one session of 9 October 2026 kept in the storage of the instance, on the shipped
  certificate (`arbeitsfaehigkeitszeugnis`), answered question by question. Six spoken answers, each a recording
  of its own of 2.2 to 3.4 s, each sent with the dictionary built from the form. Counted on the six stored
  answers of the model.
- **Result:** 4 of 6 came back as words. 2 of 6 came back as the dictionary of the prompt (753 characters each):
  both were answers to the same question and the two shortest recordings (2.2 s). The code kept both as nothing
  heard, empty and flagged. What was said is not known.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with spoken answers of two to three seconds to single
  questions of a shipped form, given through the app.

## Filling

### Can the model list the fields of a photographed form and fill it in from a spoken report in one call?

- **Question:** Does one call per step do: the fields of a form from its photograph, and the form filled in from
  what a person said?
- **Test:** The first page of the Suva minor accident report as a made-up phone photograph (warped, turned,
  blurred, with a shadow): the whole page 950 px and 1 724 px wide, and its upper half. Step 1: "list all fields
  that have to be filled in", as JSON. Step 2: the image and a made-up spoken report of five sentences, "fill in
  the form only with what was said", as JSON with a hint wherever something is missing; 70B and 8B,
  temperature 0.
- **Result:** Step 1, in words only: the whole page at 950 px was not usable, the crop was readable; which model
  read which image was not recorded. Step 2: 70B filled in 8 of 9 statements right and reported 7 of 10 fields
  still missing; 8B failed at filling in the form in one step. The answers were not kept.
- **Finding:** The model does not fill in a form in one step, and the procedure was built otherwise: capturing
  a form (`src/pipeline.js`) and filling it (`src/fields/filler.js`) are steps of their own.
- **Run:** not kept in the repository. Repeatable with a photograph of a form page, a spoken report as text and
  the two instructions above, one call each.

### Does a field with a list of values take the right entry through the server?

- **Question:** With the model behind the server's own routes, as the app uses them: does a field with a list
  take an entry of the list, and what happens to the same answer without a list?
- **Test:** 11 October 2026, a server of its own with the model, at most six calls announced. The shipped
  accident report (`schadenmeldung-uvg`), its field "Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig)"
  given the list Büro, Werkstatt, Lager, Baustelle, Verkauf, Aussendienst and the form kept as a form of its own.
  Three typed answers to its question: (A) with the list, "Ich arbeite als Projektleiter im Büro."; (B) with the
  list, "Ich bin meistens draussen bei den Kunden unterwegs."; (C) without the list, the sentence of A. Then, in
  a browser, a tap on another entry of the list in B. 4 calls.
- **Result:** A: "Büro", literal, no hint. B: "Verkauf", marked as chosen and asking for a look; after the tap
  the field holds "Aussendienst", the decision is recorded as changed with "Verkauf" as the value before. C: the
  whole sentence stands as the value, and the judgement on the answer is yes. All 4 calls answered with 200. Not
  tried: the list in another language through the app.
- **Finding:** None taken; the probe ran on the code as built (`src/fields/filler.js`, `tests/values.js`).
- **Run:** `results/value-list/`

### Do the decisions of a review reach the job?

- **Question:** Does the route for a person's decision on a value do what the review needs, up to the state of
  the job after the last open value?
- **Test:** 7 October 2026, no model: requests to the route of a field (`PUT /api/jobs/:id/fields/:fid`) on a
  filled job: a value confirmed, a value changed, "irgendwann" standing in a date field, a decision the route
  does not know.
- **Result:** Confirming sets the review on the value. "irgendwann" in a date field carries the `format` hint.
  Changing replaces the value and keeps the one before. After the last open value the job stands as `reviewed`,
  with an entry in its history. A decision the route does not know is answered with 400. `make test`: 33 checks
  passed. That a value was discarded in this pass is not on record.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable without a model: a filled job and the requests above to the
  route in `src/api/jobs.js`.

### Does code find the place of every value the model names?

- **Question:** For every value the model reads off a first page: does code find where it stands on the page,
  and do the filled results fit the data contract?
- **Test:** 72 parliamentary documents, the first page as a picture of text; the small model (8B) asked for
  number, title, type and date among 4, 8, 16 and 32 fields per call. Then, without a further call, code looks
  for each named value on the page: word for word in one block, only in a single line outside the blocks, spread
  over several elements, or not on the page; a date counts in any notation of the same day. A value goes into
  the result only with a block as its place.
- **Result:** At 4 fields per call, of 251 named values: 121 in a block, 102 only in a line outside the blocks,
  4 over several elements, 24 not on the page. At 8, 16 and 32 fields: 126 / 101 / 4 / 26, 122 / 93 / 4 / 27 and
  121 / 90 / 3 / 27. All 72 results fit the contract at every bundle size. A first count was wrong and is
  replaced by these numbers: the pages of the 5 documents with several pages had been sorted so that page 1 came
  last. A value that stands on the page word for word is not thereby in the right field; that was not measured.
- **Finding:** In that build a value is written only with the place it was found at; what stands in no block is
  not written. The single lines left outside the blocks were given to the model to sort as the next step.
- **Run:** not kept in the repository. Repeatable with first pages of documents as a picture of text with their
  blocks, the answers of the model for the four fields, and the search for each value on the page.

## Other languages

### Can the person be asked and answer in a language the form is not printed in?

- **Expectation:** Every field holds the made-up German value the walk-through sets for it, whatever language the
  question was asked and answered in; German is run beside it as the comparison.
- **Test:** The two walk-through forms, 41 units, 31 expected values, in French, Italian and English: the small
  model writes the questions in the language from the German list of lines and checks them twice; a played
  respondent answers in the language from the German dictation; every answer is read with the filling's prompt and
  one line more, the value to be written in German, names, addresses and numbers left as said. Answers as text. 208
  calls.
- **Result:** Questions that hold: French 38 of 41, Italian 39, English 39; German 40 of 40 stored ones. Values as
  expected: German 16, French 14, Italian 14, English 9; different 14, 17, 16 and 22. What needs translating stays
  as it is ("Single", "Warehouse employee") or comes half translated ("Fracture des rechten Handgelenks"). Origin:
  29 values literal in German, 23, 16 and 20 in the other languages; neither literal nor word for word 3 against 10,
  13 and 10. The respondent answers all 41 questions, also where the dictation says nothing, which is why German
  itself counts 14 as different.
- **Finding:** Two steps instead of one: the conversation runs in the person's language and the value is read in
  it; translating into the language of the form is a step of its own before sending (`src/dialogue/translate.js`).
- **Run:** `results/trial-other-language/`

### Does reading in the person's language keep the origin of a value?

- **Question:** Does the value stand in the answer as it is when the filling is told to write it as it was said, in
  the language spoken?
- **Test:** The two walk-through forms in French and English: a played respondent answers the stored German
  questions in the language, every answer to a single written field is read with the filling's prompt and the line
  "Schreibe den Wert so, wie er gesagt wurde …; übersetze nichts". 60 calls to the small model.
- **Result:** Literal in the answer: French 24 of 28 values, English 22 of 27 (one answer gave no value); in German,
  in the run before, 29 of 32. The others: the respondent left German number words and months in its answers and the
  model put them into the language ("Werkstrasse zwölf" → "Werkstrasse douze"), and one date was written in the
  form's format.
- **Finding:** The value is read in the language that was spoken (`prompt` in `src/fields/filler.js`).
- **Run:** `results/trial-read-in-language/`

### Can the values be translated in bundles?

- **Expectation:** Every value comes back as the made-up German value it started from; names and numbers come back
  unchanged.
- **Test:** The 28 written values of the two walk-through forms, put into French, Italian and English by the large
  model: 28 of the 84 are changed by it and count as language, 56 are names and numbers. Back into German in four
  passes: (1) a table per field, by the small model with the whole form and six per call, and by the large model;
  (2) a stricter wording with running numbers; (3) one value per call; (4) six per call with and without the
  question in front. 180 calls, 18 of them to the large model.
- **Result:** Of the 28 values that are language, back as the German value: pass 1 small model whole form 0, six
  per call 5, large model 4; pass 3 one per call 17, with 10 more in another wording and 1 left as given
  ("Emergency"); pass 4 0 and 0, 27 and 28 left as given. Names and numbers unchanged: pass 1 53 to 55 of 56, pass 3
  54, pass 4 56. Pass 2 cannot be counted this way: the small model returned the printed label alone for 36 of 84
  values and the label in front of the value for 36, the large model the label in front of the value for 80. Among
  the other wordings of pass 3: "nubile" → "verheiratet". The check by code for the same digits marks none of the
  values of pass 4.
- **Finding:** One value per call (`translateValues` in `src/dialogue/translate.js`); the translation is not
  checked by a second translation, digits are checked by code.
- **Run:** `results/trial-translate-values/`

### Do the stored questions still hold when they are translated?

- **Expectation:** A translated question is still named for the unit its German original holds for; in German all
  40 hold.
- **Test:** The 40 stored German questions of the two walk-through forms into French, Italian and English, by the
  small model: the whole form in one call, and twelve questions per call; the translation made twelve per call
  checked twice over the German list of lines. 49 calls.
- **Result:** Whole form in one call: 40 of 40 lines back in all three languages, not checked. Twelve per call: 40,
  40 and 28 lines back; 34 of 40, 34 of 40 and 25 of 28 hold. The twelve English questions without a line: the
  answer closed its JSON once too often and was not read. The digits of every translation are those of the German
  question. What does not hold has moved ("Wo und wann ist der Abschluss passiert?" → "Où et quand l'accident
  s'est-il produit?") or become the same as another question.
- **Finding:** The stored questions are translated when a form is first opened in a language, checked like written
  ones and kept with the form; what does not hold is asked with the translated label (`translateDialogue` in
  `src/dialogue/translate.js`). The reader takes single entries with a number as their id (`parse` in
  `src/dialogue/writer.js`).
- **Run:** `results/trial-translate-questions/`

### Can a form be filled in in another language than its own?

- **Question:** Do the stored German questions still hold when they are translated into French, Italian and
  English, and does a value given in one of these languages come back as the German value it started from?
- **Test:** `make dialogue` (`tests/translate.js`): the two walk-through forms, printed in German. The stored
  questions, labels and options are translated and the questions checked twice. The made-up German values are put
  into the other language by the large model and translated back one value per call; a value without a letter is
  not sent. 99 calls, six of them to the large model.
- **Result:** Of 40 questions 35, 35 and 39 hold after translation; all 41 labels and 10 options come back. Of 28
  values that are language 14 come back as the German value, 13 as another word, 1 untranslated; of 56 names and
  numbers 54 stay the same. Code flags 3 translations, 2 of them rightly ("Werksstrasse", "Palet"); not caught are
  "nubile" → "verheiratet", "Suisse" → "Schweizerin" and "Paletta" → "Schaufel". This holds for made-up values put
  into the other language by the large model, not for answers of a person; one run.
- **Finding:** A translated question that does not hold is asked with the translated label. The person sees what
  they said under every translated value; the translation is not checked by a second translation.
- **Run:** `results/translate/` and `results/translate.md`

## The sheet of the walk-through

### Does a sheet of boxes survive being photographed?

- **Expectation:** On a photograph of the sheet every form field of its PDF is found, none is invented and none is
  found twice.
- **Test:** The page image of the sheet and five, later ten, made-up photographs of it (on a table, at an angle, turned,
  under uneven light, with a shadow, blurred, with noise, at 8 and 12 megapixels) through the upload path of the app,
  the geometry and the building of fields; the text layer stands in for the reading, so no call is made. Ten passes
  while the sheet and the geometry were changed.
- **Result:** First layout, boxes with a gap between them: 21 to 23 of 24 fields on the photographs, up to 4 invented,
  up to 7 found twice. The boxes as one grid: 12 to 18 of 24. With the fringe of a line taken out with the line, two
  work pixels: 24 of 24 on five of five photographs, one field invented on one of them; with one pixel 23 of 24 on
  one. As the sheet and the geometry ship: 20 of 20 on ten of ten photographs, none invented, none twice. On the ten
  pages of the shipped forms the reports for the fillable pages did not change; on two pages without form fields 36
  became 37 and 50 became 56 built fields. A print photographed with a telephone was not tested.
- **Finding:** `src/page/lines.js`: the fringe of a blurred dark line goes out of the masks with the line (two work
  pixels, set by the assistant, open); a dark line that is only the edge of a longer one is no line of its own; a
  light fringe is told by the gap between two lines. The sheet is drawn as one grid of dark lines with its labels set
  off the border (`tools/forms/sheet.js`, style `sturdy`): the sheet was fitted to the pipeline, not the pipeline to
  the sheet.
- **Run:** `results/sheet-photo/geometry.md`

### Does a photograph of the sheet give the same fields, labels and kinds as its PDF?

- **Expectation:** On every upload each of the 20 form fields is found, with the label printed at it and the kind it
  has in the shipped form.
- **Test:** The page image and three made-up photographs through the upload path of the app with the model; three
  runs, two on the sheet as it was earlier that day and one on the sheet as it ships; 36 to 37 calls an upload, 441
  calls.
- **Result:** Run 1: the fields 20 of 20, the labels 16 to 18 of 20, the kinds 18 to 19 of 20: a short label was taken
  for a picture, a small label was misread ("Austrttsdatum"), the title of a section was read as one text with the
  statement under it. Run 2: labels 20 of 20 on three uploads and 19 on one, kinds 20 of 20. Run 3, as it ships:
  fields, labels and kinds 20 of 20 on all four uploads, 18 questions for 18 units; 48 to 58 seconds from choosing
  the file to the finished dialogue. The photographs are made up; a print photographed with a telephone was not
  tested.
- **Finding:** `src/read/reader.js`: a crop lower than 1.6 character heights in which the model read words is a text,
  whatever it says about picture parts; an answer that is no JSON because of one broken escape is read all the same
  (both set by the assistant, open). On the sheet the labels are set at 11 points and a section title stands off the
  statement under it (`tools/forms/austrittsmeldung.js`).
- **Run:** `results/sheet-photo/`

### Does the sheet go through the app question by question, typed and clicked?

- **Expectation:** After the 18 questions are answered by typing, with yes and no, with a choice or by skipping, each
  of the 19 fields the conversation asks for holds what was typed or clicked.
- **Test:** A browser without a window on a server without a key: the list of forms, the sheet opened, the 18
  questions answered in their order, the preview opened; the job then read from the server. No call.
- **Result:** 19 of 19 fields as typed or clicked, no hint on a field, no error in the browser, the form ready to be
  sent for signature. In the pass before it the conversation asked for the town before the postcode: the round O of
  "Ort" stood two pixels above the P of "PLZ" beside it, and the questions follow the height on the page. That pass ran
  with the browser reporting English and has no count: its driver looked for a choice by its German word.
- **Finding:** The label "Ort" became "Wohnort" on the sheet (`tools/forms/austrittsmeldung.js`); the rule of the order
  stayed as it is.
- **Run:** `results/sheet-click-through/`

### Does a spoken answer to each question fill its field?

- **Expectation:** After each of the 18 questions is answered by voice or skipped, its field holds the value set for it
  beforehand.
- **Test:** 15 answers of one word to one sentence, each a recording of its own of 0.9 to 2.6 seconds, spoken by two
  synthetic voices, three questions skipped; question by question through the server; 69 calls. A first run of 78
  calls went before it.
- **Result:** Voice A: 7 of 18 questions as expected, voice B: 13 of 18 (first run: 8 and 13). The answers that are a
  date are heard; an answer of one word mostly is not ("Keller" came back as "Könne", "weiblich" as "Freundlich."). For
  7 of the 15 answers of voice A the transcript was the prompt handed back; it is cut and the question stays open.
  The same words inside one dictation of 30 seconds fill 20 and 19 of 20 fields (`results/dictation/`). A person at the
  microphone was not tested.
- **Finding:** None of its own; see the next entry.
- **Run:** `results/sheet-conversation/`

### Is a short answer heard when it stands alone?

- **Question:** Is a spoken answer of one word to one sentence heard as said when it is a recording of its own, and
  does the dictionary in the prompt or the silence around the answer change that?
- **Test:** The 15 answers of the conversation above by both synthetic voices, each sent to the recognition alone:
  with the dictionary as the app builds it (22 entries, three of them sentences printed on the form), with terms only
  (17), with none; as short as spoken and with the silence the app leaves around an answer; 150 calls.
- **Result:** Heard as said: voice A 1 to 2 of 15, voice B 7 to 9 of 15, over all dictionaries and both kinds of
  recording; with the word before a date left aside 2 to 4 and 7 to 9. With the dictionary as built, 6 of the 15
  transcripts of voice A were the first entry of the dictionary and nothing else, and one was the words that introduce
  it; none of the transcripts cut for that was the answer said. A person at the microphone was not tested.
- **Finding:** `src/speech/transcriber.js`: the words that introduce the dictionary, and its first entry alone, are the
  prompt handed back: nothing was heard and the question stays open. The dictionary and the recording were left as
  they are.
- **Run:** `results/short-answers/`

### Does one dictation fill every field of the sheet?

- **Expectation:** After one dictation of 30 seconds, each of the 20 fields of the walk-through's sheet holds the value
  set for it beforehand; a field the dictation does not mention stays empty.
- **Test:** One made-up dictation that names 13 of the 20 fields, spoken by two synthetic voices, three runs each on the
  shipped form `austrittsmeldung`; five calls a run, 30 calls.
- **Result:** Voice A: 20 of 20 fields in three of three runs. Voice B: 19 of 20 in three of three, the town heard as
  another word each time. The three tick marks come back as cited and ask for a look in every run. This holds for
  synthetic voices; a person at the microphone was not tested.
- **Finding:** The sheet differs from its model where a first trial put one value into two fields: the surname is named
  as such, there is one telephone field and one statement with a date. A telephone number is written in its usual
  groups by code, whatever groups the model returns.
- **Run:** `results/dictation/`

## Interface and output

### Do the questions show in the app on a phone and on a desk?

- **Question:** Does the view of the questions work at both widths, before and after a dictation?
- **Test:** A headless browser at 390 and 1360 pixels on the two walk-through forms: the questions before and after
  the dictation, a value entered, a mark ticked. No model.
- **Result:** No script error. Two faults seen: the section titles stood twice at the end, and an answer with a
  query was too narrow.
- **Finding:** Both faults were set right in the view.
- **Run:** not kept in the repository. Repeatable with a headless browser at the two widths on the walk-through
  under `/?demo`.

### Does a job made by the pipeline show in the app, and is it valid?

- **Question:** Does the view take a job as the pipeline leaves it, and does such a job keep the contract?
- **Test:** The shipped Betreibungsbegehren, its text taken from the text layer, the dialogue step run with the
  small model (3 calls); the job as it is and with a few values set, in a headless browser at 390 and 1360 pixels;
  both jobs held against `data/schema/trace.json`.
- **Result:** 12 questions written, 11 hold. No script error; shown are the question, the fallback to the label, a
  choice, a table with its filled cells and the next empty row, and the queries. Both jobs valid, 0 errors. A job
  made without a model key breaks the contract at 202 places in its blocks (`fontSize: null` 149 times,
  `background: null` 53 times), as before this step. Both radios of the payment details carry the same label.
- **Finding:** The cells of a table are named by row and column in the view.
- **Run:** not kept in the repository. Repeatable with a job of the shipped Betreibungsbegehren in a headless
  browser and a JSON Schema check of the job.

### What does a recording without speech become?

- **Question:** What stands in a field when the answer to a question is a recording with no speech in it?
- **Test:** A job of the shipped Betreibungsbegehren in a headless browser, the browser's test tone as the
  microphone, sent as the spoken answer to one question; then again after the change below. 4 and 2 calls to the
  small model.
- **Result:** First run: the transcription returned the list of names and terms of its own prompt (867 characters),
  and the filling entered it as a literal value, not marked. Second run: the piece is empty and marked, no value,
  the question stays open.
- **Finding:** Three entries of the prompt's list in a row, in its order and with its commas, count as nothing heard
  (`src/speech/transcriber.js`). The rule of three entries: set by the assistant, open.
- **Run:** not kept in the repository. Repeatable with a headless browser whose microphone is its test tone, on a
  job with questions.

### Does the list of the prompt also come back behind something that was said?

- **Question:** Does a spoken answer come back clean when it is cut out of a conversation with pauses?
- **Test:** A job of the shipped Betreibungsbegehren in a headless browser with the model; as the microphone a
  recording of a synthetic voice with three utterances and pauses between them; before and after the change below.
  10 and 13 calls to the small model.
- **Result:** First run: one utterance came back with the list of the prompt behind it, and the rule of the entry
  above threw the whole piece away. Second run: three pieces answer three questions in their order, no list behind
  them; the sentences, which do not fit the form, stand as values and carry both hints, `vague` and `incomplete`.
- **Finding:** The transcript is cut where three entries of the list begin, what was said before stays and the piece
  is marked (`echoAt` in `src/speech/transcriber.js`). The list no longer takes labels of places that are not asked;
  one was a whole paragraph of the form.
- **Run:** not kept in the repository. Repeatable with a recording of three utterances played as the microphone of a
  headless browser.

### Can the questions be answered one by one in the app?

- **Question:** Do typing, speaking, ticking off and answering out of order work at both widths?
- **Test:** A headless browser at 390 and 1360 pixels on the walk-through: an answer typed and sent with Enter, one
  spoken, a question ticked off, an option chosen, a question answered out of order, the rest dictated. No model:
  in the walk-through a spoken answer takes the made-up value of its question.
- **Result:** No script error; every step ends with the value at its question.
- **Finding:** None taken. Typing at a choice or a table was not built.
- **Run:** not kept in the repository. Repeatable with a headless browser at the two widths on the walk-through
  under `/?demo`.

### Does a conversation with pauses move from question to question?

- **Question:** Does the app close an answer at a pause, go on to the next question, and close the microphone when
  nothing more is said?
- **Test:** A headless browser at 390 and 1360 pixels on the walk-through, a recording of a synthetic voice as the
  microphone: three utterances with pauses, then silence; with it typing, ticking off, an option, a question out of
  order and the dictation of the rest. No model.
- **Result:** Three utterances answer three questions; the microphone closes after 20 seconds without speech; no
  script error. Seen and not changed: an answer that does not fit its question is entered at a single field all the
  same, with both hints; in the walk-through the conversation takes the made-up values whatever is said. Not
  tested: a person at a microphone.
- **Finding:** None taken. The pause of 1.5 seconds is a start value to be tuned on voices of persons; 0.3 seconds
  of speech, 0.5 seconds of lead and 20 seconds of silence: set by the assistant, open.
- **Run:** not kept in the repository. Repeatable with a recording of three utterances played as the microphone of a
  headless browser on the walk-through.

### Does a shipped form open without being recognised again?

- **Question:** Does the app list the shipped forms, open one at once, and keep the walk-through apart?
- **Test:** A headless browser at 390 pixels, after the four shipped forms had been captured once beforehand: the
  list of forms, the Suva form opened, one answer typed; then the same under `/?demo`. No model.
- **Result:** The app lists four shipped forms and no walk-through form; the Suva form is open after 104 ms with no
  screen of recognition, its transcript is empty, the typed answer is taken. The demo lists four and two; after its
  dictation the transcript has three pieces. No script error. The Suva form begins with "Feld 1": its first place
  has neither a label nor a question that holds.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with a headless browser at 390 pixels on the app and on `/?demo`.

### Does a form open and fill in French in the app?

- **Question:** Does the app translate a form when it is opened in another language, take answers in it and
  translate the values before sending?
- **Test:** The shipped Betreibungsbegehren in a headless browser at 390 pixels, the app set to French, fresh
  storage: the form opened, three answers typed in French, "Continuer". 12 calls to the small model.
- **Result:** The dialogue stands in French after 12.4 seconds, 10 of the 11 German questions hold in French; the
  three answers stay French; the values are translated 6 seconds after "Continuer", the date as "14.03.1988". No
  script error. "rue de la Gare 14" came back as "Bahnhofstrasse 14": the street name was translated, and the check
  by code does not see it. The German question "Wann ist das Geburtsdatum des Schuldners bekannt?" holds and is
  translated as it stands.
- **Finding:** None taken; the person's own words stand under every translated value.
- **Run:** not kept in the repository. Repeatable with a headless browser at 390 pixels, the app in French and a
  model key.

### Are required questions marked, and can the person go on at any time?

- **Question:** Do the required marks, "go on" before everything is answered, the warning and the progress bar work
  in the app?
- **Test:** A headless browser: the shipped certificate in German without the model, one question answered, then
  "go on" and the page of the signature; the same form opened in French with the model, one answer, "Continuer".
  10 calls to the small model.
- **Result:** German: 6 questions marked required; "go on" is there after one answer; 5 required entries are named
  as missing, and the form can be sent. French: the bar runs from 0 over 13 and 25 to 88 per cent, then the dialogue
  stands; "Continuer" translates the one answer and shows it for a look. No script error. Seen and not changed: for
  "Geb.-Dat." the question "In welchem Jahr und welchem Monat wurde die Person geboren?" holds.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with a headless browser on the shipped certificate, with and
  without a model key.

### Can the fields of a captured form be set right in the app?

- **Question:** Do moving a field, changing its size, adding one, ticking one off and saving work on a desk and on a
  phone?
- **Test:** A headless browser at 1280 and at 390 pixels on the mask of a captured form, five passes, no model: a
  field moved, its corner dragged, a field added, one ticked off, the form saved.
- **Result:** Desk: the field moved from x 150 to 368, its size went from 1082 × 28 to 1246 × 72, a field was
  added, one ticked off; the saved form carries "(angepasst)" in its name and stands among the forms to choose from.
  Phone: the field moved with the finger from x 150 to 319, there is no corner to drag, a new field is set by a tap.
  No script error. At the left edge of the phone no field can be set: the edge belongs to the gesture that goes
  back.
- **Finding:** None taken. The corner shows as soon as a mouse is seen: set by the assistant, open.
- **Run:** not kept in the repository. Repeatable with a headless browser at the two widths on the mask of a shipped
  form.

### Does an uploaded page go the whole way to a form of its own?

- **Question:** What does one page give when it is uploaded as an image, captured with the model, corrected in the
  mask and saved?
- **Test:** The first page of the shipped Betreibungsbegehren as an image, through the app in a headless browser at
  the width of a phone: upload, capture, the mask, one label changed, one field added, a name set, saved. 53 calls,
  2 of them to the large model.
- **Result:** Capture 138 seconds: reading 100, the catalogue 17, then the questions. 21 fields and 20 rows in the
  mask, all 20 marked red; the same page analysed without the camera's straightening gives 35 fields, its text layer
  and form fields 44; the fields of the debtor and the creditor are missing. Saving the two corrections: 4 calls, 35
  seconds; both units get a question that holds, both labels a catalogue entry without a sure source. The form then
  stands among the forms to choose from. The catalogue kept after saving has 16 entries, 6 with a source. One run.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with the page image
  `data/forms/betreibungsbegehren/betreibungsbegehren-form-1-s1.png` uploaded in the app with a model key.

### Does a form printed in German run in French in the app?

- **Question:** Opened in another language than its own: are the questions translated, do the answers stay as
  typed, and are the values translated before sending?
- **Test:** 9 October 2026, in a browser at 390 px with the model: the shipped Betreibungsbegehren opened with
  the app set to French, three answers typed in French, then "Continuer". About 16 calls.
- **Result:** The dialogue stood in French after 12.8 s; the three answers stayed as typed; after "Continuer" the
  values were translated within 6 s: "Office des poursuites de Coire" → "Betreibungsamt Chur", "le 14 mars 1988"
  → "am 14. März 1988", "Pierre Martin, rue de la Gare 14, 7000 Coire" → "Pierre Martin, Bahnhofstrasse 14,
  7000 Chur". The name of the street was translated, and the check by code did not flag it: the digits are the
  same and the two texts are not one or two characters apart.
- **Finding:** A date is written in the form's own format after the translation (`src/dialogue/translate.js`).
  The translated street name was left open; what the person typed stands under every translated value.
- **Run:** not kept in the repository. Repeatable with the shipped form opened in French in a browser and the
  three answers quoted above.

### Does a tick set in the conversation reach the PDF?

- **Question:** A tick box answered in the conversation stood as "empty" at the end: is the tick lost in the
  conversation or in the PDF?
- **Test:** 11 October 2026, in a browser, no model: a job from a shipped form, a choice of the conversation
  tapped, then the question, the job, the preview and the closing page looked at; the tick boxes and radio
  buttons of the written PDF read back.
- **Result:** The PDF holds the ticks: tick boxes and radio buttons read back as set. The cause lay in the
  conversation: a question that is one single tick box offered nothing to tick; its round button marked the
  question as done and entered "empty".
- **Finding:** A question that is a single tick box carries "Ja" and "Nein": yes sets the tick, no takes it away
  or says that the box stays empty (`src/app/js/screens/form.js`, `src/app/templates/turn.html`).
- **Run:** not kept in the repository. Repeatable with a job from a shipped form in a browser: a tick box and a
  radio button answered in the conversation, the PDF written and its form fields read back.

### Does the conversation go on from where the last answer was given?

- **Question:** After an answer far down the form, does the conversation stay there or jump back to the first
  open question?
- **Test:** 11 October 2026, in a browser, no model: a job from a shipped form, question 46, a single tick box,
  answered with yes while the 45 questions above it were open.
- **Result:** The conversation stood at question 47 afterwards, with the 45 questions above still open. On a
  first attempt it had not moved on: the single tick box carries a group name, and the rule hung on that name;
  it was moved to the question.
- **Finding:** The conversation remembers where the last answer was given and asks the next open question below
  it; after a single answer (tick box, radio button) it goes on (`src/app/js/screens/form.js`).
- **Run:** not kept in the repository. Repeatable with a job from a shipped form in a browser: a question far
  down answered first, then the place of the conversation read off.

### Does a job go through the last screens: form, signature, send?

- **Question:** With a job from a real form instead of made-up data: do the signature screen and the sending
  work at both widths?
- **Test:** 7 October 2026, no model: a click-through in a browser at the phone and the desktop width, a job
  from a shipped form, from the form over the signature screen to sending.
- **Result:** At both widths the link to the PDF answered 200 with the type application/pdf, the job stood as
  `sent` afterwards, and the console of the browser showed no error. The signing service is a mock.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with a job from a shipped form in a browser at a phone and a
  desktop width; without a browser `tests/server.js` checks the draft, the PDF and the sending.

### Do values land at their place in the rebuilt forms, radio buttons included?

- **Question:** Does the output write into the form fields of the two rebuilt forms as it does into those of an
  original?
- **Test:** 7 October 2026, no model: the pages of the two rebuilt forms (`arbeitsfaehigkeitszeugnis`,
  `schadenmeldung-uvg`) rendered and looked at; the accident report filled by the output code with five entries
  (a tick box, two radio buttons, a wage, place and date) and rendered.
- **Result:** First the radio buttons stayed empty, without an error: the PDF library stores the options of a
  radio group as numbered export values with their names beside them, and the output chose by the on-value of
  the widget ("0"). After the change all five entries stand at their place and the dot of the radio button
  shows; `tests/output.js` 8 checks passed. On the pages: the first build of the certificate ran onto a second
  page with its footnote, and three table heads were cut off; both were set right in the definitions.
- **Finding:** A radio button is chosen by the index of its widget among the options of its group
  (`src/output/pdf.js`).
- **Run:** not kept in the repository. Repeatable without a model: a job on a rebuilt form with a tick box and a
  radio button set, the PDF written and rendered.

### What does opening a shipped form cost when it is captured at that moment?

- **Question:** How long does a person wait, and how many calls go out, when a shipped form is captured as it is
  opened?
- **Test:** No new call: one session of 9 October 2026 kept in the storage of the instance, in which the shipped
  Suva form was opened in the app as it then was. The pipeline ran over its four pages with the text from the
  text layer, wrote the questions and checked them twice. Counted on the stored job and its logged calls.
- **Result:** 90 s from the start of the capture to the finished dialogue. 21 calls, all answered with 200: 3 to
  write the questions, one per page with fields, and 18 for the two runs of the check. 143 fields (36, 50 and 57
  on pages 1, 3 and 4), 110 units, 55 of them with a question.
- **Finding:** Recorded 14 minutes after the session: a form is recognised when it is created, not when it is
  opened. The shipped forms are captured once in advance (`make capture`, `tools/capture.js`) and kept beside
  the form as `captured.json`; `src/shipped.js` makes a job from that file, and opening took 104 ms in the
  browser.
- **Run:** not kept in the repository. Repeatable with `make capture`, which runs the same step in advance for
  every shipped form.

### What does saving a correction of a shipped form cost, and is the form kept?

- **Question:** After labels and a box are changed in the mask: how many calls does saving take, and does the
  corrected form stand as a form of its own?
- **Test:** No new call: one session of 9 October 2026 kept in the storage of the instance. The shipped
  certificate (`arbeitsfaehigkeitszeugnis`) opened with the app set to English, corrected in the mask and saved.
  Counted on the stored job, its logged calls and the form as it shipped that day.
- **Result:** Against the shipped form 11 of 93 fields carry another label (8 of them had none) and 2 another
  box; 3 of 36 units carry another question (2 of them had none). 12 calls within 62 s, all answered with 200:
  1 to write the questions, 2 for their check, 1 to the large model for the catalogue entries of 9 fields, 2 to
  translate questions and labels, 6 for the check of the translation. The form stands among the forms of the
  instance with "(adapted)" in its name.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable with a shipped form opened in the app with the model, a few
  labels set in the mask and the form saved; the calls are logged with the job.

### Does the app say what the code knows when a typed value does not fit the kind of its field?

- **Question:** Where a value is not of the kind its field takes: does the card of the question show the hint of
  the code, and does the mask show whose proposal the kind is?
- **Test:** 11 October 2026, in a browser on a server of its own, two passes. (1) A job with a field whose kind
  the model had proposed (telephone number), an answer typed that does not fit; the card of the question and the
  mask in which a form is corrected. (2) After the fillable shipped forms were set right: a job from the
  Betreibungsbegehren, "3000 Franken" typed into "Betrag (CHF)", a field of the kind number.
- **Result:** (1) The card shows "unklar" with the hint of the code; the mask shows "Telefonnummer" and "Vom
  Modell vorgeschlagen", and after "Text" is chosen that note is gone; no error of the browser. The server had
  been started as one without a key, but it reads `.env` itself: four typed answers each set off a call ("is the
  answer enough"), 4 calls that had not been announced, all answered with 200. (2) With the key set empty:
  0 calls. The field is of the kind number, bound to the form field Betrag1, with the hint of the catalogue;
  "3000 Franken" becomes "unklar" with "Hier gehört nur eine Zahl hin."; no error of the browser. The two
  pictures kept are those of the second pass.
- **Finding:** A server that is to run without the model is started with `LLM_API_KEY=` set empty, since
  `src/config.js` reads `.env` itself.
- **Run:** not kept in the repository. Repeatable without a model: a job from the shipped Betreibungsbegehren in
  a browser, "3000 Franken" typed as the answer for the amount.

### Do the four corrected forms open in the app?

- **Question:** After the fields and questions of the shipped forms were set right: does each form open, and
  does the app show what was changed?
- **Test:** 11 October 2026, in a browser on a server without a key: the four shipped forms of that day opened
  one after the other; the Suva form looked at in the conversation and in the mask.
- **Result:** 4 of 4 open, 0 calls, no error of the browser. The Suva form shows the new question for the date
  of the accident, and "PLZ" stands as a postcode in the mask. The forms as opened: 38 fields and 31 questions
  (Suva), 105 and 64, 92 and 34, 51 and 15; no field without a label, no unit without a question. `make test`:
  255 checks passed.
- **Finding:** None taken.
- **Run:** not kept in the repository. Repeatable without a model: each shipped form opened in a browser.

### Does the preview put the label of a tick box beside its box?

- **Question:** In the preview, which rebuilds the page from its blocks: does the printed label of a tick box
  begin behind the box?
- **Test:** 11 October 2026, in a browser: the preview of a job on the shipped accident report
  (`schadenmeldung-uvg`) after a whole run, one picture of a part of the page with three rows of options; and
  one picture of a question of the conversation in the same job.
- **Result:** Before the change the text of such a label began at the left edge of its row, so its first letters
  lay under the box ("heres Kader" for "Höheres Kader"). In the picture taken after the change the 11 labels in
  view (5, 3 and 3 in the three rows) all begin right of their box. In the conversation the answer stands under
  its question with the printed label.
- **Finding:** The label of a tick box is drawn from behind its mark (`src/app/js/preview.js`).
- **Run:** not kept in the repository. Repeatable without a model: a job on that form, its preview opened in a
  browser and the rows of options looked at.

## Operation

### Where does the time go when a photographed form is captured?

- **Question:** How long does the capture of one photographed page take through the app, and which part of it is the
  model's?
- **Test:** One page of a third party's form with 31 tick boxes, photographed and captured through the app by a
  tester, 94 calls: the logs of the calls read back, no new call. Then the same page image once more through the
  pipeline after two changes, 63 calls.
- **Result:** 273 seconds from the page image to the finished dialogue: 64 seconds at the model, 204 seconds in the
  pauses of the queue (two seconds before every call, twenty before the fifty-first), 5 seconds of own computing; a
  reading call was answered in 0.33 seconds on average. 31 of the 81 reading calls went to tick boxes that stood alone and were listed a second
  time as unknown elements; each came back empty, and without them the same 54 fields are built. After the two
  changes: 59.6 seconds, 63 calls, the 50 elements read in both runs with the same text. That run had an intermediate
  pace, half a second after the fortieth call; the pace as built was not timed on this page. The service names no
  limit in the headers of its answers (one call).
- **Finding:** `src/model/client.js`: ten calls one after the other, then half a second; a call turned down with a 4xx
  is sent once more after half a second, and a 403 or 429 on that one halts the queue (the retry and the halt set by
  the assistant, open). `src/read/reader.js`: an unknown element with exactly the box of a tick mark is not read.
- **Run:** not kept in the repository: the form is a third party's and does not ship. Repeatable with a photographed
  page of a form with tick boxes, captured through the app, and the logs of its calls under `storage/`.

### Is a tick box that stands alone kept from the model, and does the queue keep its pace?

- **Expectation:** A tick box listed a second time as an unknown element is not sent to be read; the queue waits half a
  second after every tenth call, sends a call turned down with a 4xx once more, and sends nothing after a second 403
  or 429.
- **Test:** A made-up page and a stand-in in the place of the service; then the pages of the shipped forms as the
  geometry analysed them. No call.
- **Result:** All checks hold. On the 10 pages of the shipped forms 4 of 90 tick marks are listed a second time; none of
  them is sent to be read.
- **Finding:** None beyond the rules the test holds.
- **Run:** `tests/reading.js`, part of `make test`.

### Does a job run through the server without the model?

- **Question:** Does the server take a form, run the pipeline and serve the result when no key is set?
- **Test:** 7 October 2026: `tests/server.js`, then with ten checks: the server on a free port, a job from the
  shipped Betreibungsbegehren (two pages), the pipeline without a model. Besides the test the server was started
  once and two addresses requested.
- **Result:** The pipeline ran through in 6 s: 149 blocks, 36 fields, the form fields of the PDF bound to them;
  the control image is served; a path leading out of the app's folder is answered with 404. Started outside the
  test: `/` and `/api/forms` answered, and a SIGTERM closed the server. Docker was not installed on the machine:
  `make run` was checked as a dry run only.
- **Finding:** The job file broke its own contract: the schema allowed no further key at the top level and had
  no `id`. `id` was taken into `data/schema/trace.json` as an optional field.
- **Run:** not kept in the repository. Repeatable with `make test`, which runs `tests/server.js`; the form has
  been corrected since, so the counts differ.

### Does the repository start in a container, with the settings named as the template asks?

- **Question:** The template of the hackathon asks for `LLM_NAME`, `LLM_BASE_URL` and `LLM_API_KEY`, and `make
  run` had never run in a container: does it start, and do the settings arrive?
- **Test:** 10 October 2026: the three settings renamed in 16 files; `make test` on Node 20; `make run` in
  Docker, four addresses requested and one setting handed in from the shell.
- **Result:** `make test`: 192 checks passed. `make run` builds and starts; `/`, `/?demo`, `/api/forms` (four
  forms) and `/api/jobs` answer; the setting from the shell arrives in the container. The app calls no other
  program at run time and needs no build step.
- **Finding:** The settings of the model are read under the names of the template (`src/config.js`,
  `.env.example`, `compose.yaml`).
- **Run:** not kept in the repository. Repeatable with Docker: `make test`, `make run`, then the four addresses
  requested.

### Does the solution deliver what the briefing and the template ask for?

- **Question:** Laid side by side: what do the briefing of the hackathon and its official template ask for that
  the solution does not deliver yet?
- **Test:** 10 October 2026, no model call, nothing changed: the briefing, the notes of the kickoff, the answers
  of the question session and the template read against the repository of the track for parliamentary documents
  as committed on 8 October; its test suite run; the example shown at the kickoff held against the track's own
  result for that document.
- **Result:** The test suite: 98 checks passed, none failed. Eight gaps. (1) Readme and technical report were
  the unfilled template, and the answer to the feasibility question stood nowhere as a reasoned conclusion.
  (2) No gold set with every value checked, and no question answered across parliaments; the briefing asks for
  both. (3) No federal document among the shipped ones; languages 5 German, 2 French, 1 Italian; the one "scan"
  a rendered page without a text layer. (4) The example of the kickoff in the track's own result: number and
  type wrong, the authors split wrongly, one event with a wrong date; title and date of submission right.
  (5) Vocabularies for roles, states and outcomes missing as lists. (6) A run on a CPU with 20 GB not measured.
  (7) The template asks for the settings `LLM_NAME`, `LLM_BASE_URL` and `LLM_API_KEY`; the code read other
  names, in both tracks, and the start in a container had never run. (8) Of the six measures of the track's core
  question only one measured over the corpus.
- **Finding:** The gaps were taken into the work list as eleven points, the gold set first. The same day the
  settings were renamed to the names of the template in both tracks and the start in a container was run.
- **Run:** not kept in the repository. Repeatable with the briefing, the template and the repository side by
  side, then `make test` and `make run` in a container.
