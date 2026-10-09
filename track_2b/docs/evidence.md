# Evidence

What was measured before and while Trace was built, and what each number decided. Condensed from the working
logs (2–9 October 2026); the raw runs, scripts and model answers stay outside the repository because they hold
third-party forms, voices and 240 MB of images. Failed attempts are kept: they are the reason a rule looks the way it does.

How we test, throughout:

- **References come from the material, never from hand labels.** For a rendered PDF the text layer (words, lines,
  blocks as poppler groups them) is the truth; for a fillable PDF its AcroForm widgets are the truth for fields and
  tick marks; for dictation a written script with 13 facts is the truth.
- **The model is `swiss-ai/Apertus-v1.5-8B` at temperature 0** on the CSCS endpoint, one request at a time with
  pauses, unless the entry says 70B. Every model answer is stored raw. Runs are dated; a number without a date is
  not in this document.
- **A measurement runs once.** Where two runs on the same input differed, that is stated. Nothing is averaged
  over repeated runs to make it look stable.
- Counts in the geometry are "reference blocks that map to exactly one object", "widgets found", "widgets hit",
  always over the whole set (22 forms, 61 pages; 46 parliamentary document pages as a counter-set).

## 1 Reading text with the model

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 03.10. | How large must the image be? | one text page (3 913 characters) at six widths, and cut into 2/3/4/6 strips | whole page at 2481 px 3.8 % character errors, 1240 px 4.9 %, 900 px 10.5 %, 700 px 32 %, 500 px invented text; 3 strips 1.0 %. From 1240 px the service downsamples to 7 808 image tokens anyway | read in pieces, never the whole page |
| 03.10. | Is the model deterministic? | same strips, temperature 0, two seeds; 0.3 and 0.7 with three seeds | at 0 identical across seeds; 0.97–1.05 % errors; voting over three runs at 0.7 is worse (1.12 %) and flags 19 of 32 real errors | temperature 0, no voting |
| 03.10. | How much disturbance survives? | brighten/darken 10–100 %, keystone 5–50 % | up to 90 % brighter or darker still 0.9–2.3 % errors; keystone 5–15 % worst (3–5 %, invented inserts); small print with digits (file numbers) fails first | perspective must be fixed before reading; digits need a check |
| 04.10. | Type and text in one call? | 150 crops, one call each vs bundles | type right in 101 of 150 (67 %); text identical in 69 of 101; bundling several crops loses type and assignment | one element per call; the geometry names the type, the model only reads |
| 06.10. | How well does it read single elements? | 180 text elements on ten rendered first pages, reference text layer | **101 identical (56 %), 66 near (≤ 10 % distance), 5 different, 8 empty; 2.3 % character errors** (1.8 % with hyphens healed). Short elements (≤ 30 characters) 58 of 77 identical, long ones (> 120) 2 of 36 identical but 34 near, 1.4 % errors | long text reads well, short labels and numbers are the risk |
| 06.10. | Several marked blocks in one image? | the same 180 elements, three per crop with red frames and ids | **78 identical, 37 different, 21 empty, 22.7 % errors**: the model reads what it sees and reassigns the ids (14 swapped) | **not again** |
| 06.10. | A strip of cut-out blocks instead? | three blocks per image, cut out and stacked on white, nothing else | 111 identical, 22 different, 2 empty, 5.8 % errors with a third of the calls; long blocks get cut off after the first line | strips first, then every multi-line block alone: 116 identical with 126 instead of 180 calls |
| 05.10. | Can the model correct its own reading? | 192 readings (137 right, 55 wrong), three prompt variants, 576 calls | 2 healed, 7 changed wrong to wrong, 10 right ones broken (abbreviations expanded, French translated into German); with the image only 1 broken | **not again** |
| 06.10. | Spell-check against a vocabulary from our own pages? | 5 022 words from 90 pages, edit distance 1 | of 38 corrected readings 6 closer to the truth, 28 further away; names and technical terms get "fixed" | **not again**; no own dictionary |

## 2 Geometry: the page without a model

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 03.10. | Can the model locate elements itself? | one form, model asked for boxes | 4 of 31 tick boxes, 0 input fields; it reads everything as a label | **geometry first, the model only reads** |
| 04.10. | First count of the object layer | 18 document pages, run-length smearing with fixed gaps (1.2 / 0.7 character heights) | 203 of 360 blocks map to one object; a page that is one photo or one plan swallows every word (two pages carry 88 of the 99 merged blocks); bullets and numbers split from their text (26) | the word count says little; count blocks |
| 04.10. | What are the real distances? | 2 737 word gaps, 239 baseline steps inside a block, 200 between blocks, in character heights of the line | word gap 0.41–1.00 (5–95 %), next column from 2.16; baseline step inside a block 1.75–2.50, between blocks from 2.50 – they overlap when the line's height is the median blob height; measured on the **tall glyphs** (capitals, ascenders, digits) they separate: 1.40–1.94 vs 2.17 | the line measures itself: character height = tall glyphs (`TALL 0.9`), word gap up to 0.9, justified text up to 1.6 × its own median gap, never above 1.5 |
| 04.10. | Baseline step for "same paragraph" | series 1.70–2.50 on 360 blocks | 1.85: 223 single / 10 split between lines; 2.05: 223 / 7; 2.50: 201 / 6 | 2.05 for documents; forms later 1.85 (see below) |
| 04.10. | Effect of the line-based joiner | 18 known pages and 22 pages never used for tuning | known: 203 → 223 single, split between lines 29 → 7; unseen: 255 → 313 single, 46 → 11 | keep; the gain holds on unseen pages |
| 04.10. | Tick marks from geometry | 1 007 checkbox and radio widgets on 30 pages; four versions of the rule | version 1 took circles for boxes (edge band too deep); 2 lost circles (inner field cut the ring); 3 turned every "o" on text pages into a circle (clearance lowered by mistake, up to 24 per page); 4 raised the size limit for 75 px circles. Result **655 of 806 boxes (81 %), 142 of 201 radios (71 %)**; 44 finds on no widget (5 %); 140 missing boxes are table cells drawn with lines, not blobs | the rule as it stands; cells handled separately |
| 04.10. | Where does the input lie? | 1 810 field widgets with a label | label left 12.5 %, above 13.8 %, in the field 1.7 %, **none within reach 72 %** (table cells, header far away); distance label → field (95 %): left 4.4, above 2.7 character heights | empty cells as a third certain field type; label distances as constants |
| 04.10. | Inputs from tinted areas and empty cells | 1 871 field widgets | 1 097 hit (58.6 %); 1 233 set, 54 on nothing (4.4 %); 774 missed: 384 have only a writing line at the bottom, 210 nothing printed | writing lines are the next field source |
| 05.10. | Writing lines as inputs | lines with free space above, four variants | every line: 1 433 hit (76.6 %) but 113 invented (7.0 %) and 107 fields on document pages; only lines with a label left or above: **1 290 hit (68.9 %), 72 invented (5.0 %)** | lines with a label; document pages are not forms, so the price there does not apply |
| 05.10. | Smearing thresholds | ten settings over 61 form pages and 46 document pages | vertical gap 0.3 instead of 0.7 and baseline 1.85: forms 71.4 → **77.8 %** single; documents prefer the old values (63.3 / 60.0 %); recomputing page-sized objects inside their box dissolves them (123 → 33) | forms and documents want different settings; this repository is forms only |
| 05.10. | Ticked boxes and filled circles | six variants | "frame with content = ticked" alone: finds on no widget 44 → 76, 41 squares on text pages; a dot inside a ring: +5 radios, no new false find | measured, not built yet |
| 06.10. | Ticked boxes, measured properly | 24 widget pages, every second box drawn with a cross, every second circle with a dot (406 crosses, 102 dots) | crosses **330 of 406 found** (81 %, the same rate at which empty boxes are found); dots 73 of 102 when small, 27 when the dot touches the ring; price on the 61 untouched pages: 151 false "ticked", almost all the "n" of bold type (12–16 px) | minimum size 1.0 character heights: all 351 real crosses stay, false finds 34; a filled circle without a ring is still not found |
| 06.10. | Node port against the reference | the same 61 pages, same tests | **2 670 of 3 430 blocks single (77.8 %), 655 / 148 widgets, identical to the reference**; masks differ in 0.3 % of pixels because the reference library scales with fractional block coverage | port accepted |
| 07.10. | Labels and radio groups from the elements | 1 871 field widgets and 201 radio widgets on 30 pages, the text layer standing in for the reading; radios of one group share their widget name in the PDF | a label at 22.4 % of the hit widgets (search distances 4.4 / 2.7 from above); of 151 widgets whose name is a word, 79 labels share a word with it. Radio pairs grouped right / grouped wrong / missed: row only 30 / 15 / 120, row and column 150 / 169 / 0. Gaps: in a row the same group lies 90 % within 5.2 character heights, other groups from 23 on; in a column the same group half within 0.6, other groups from 0.2 on | **row, else column**, row gap 12, column gap 1: 148 / 21 / 2 |
| 07.10. | Labelled cells, writing-line blocks, line fields cut at vertical lines | the same widgets; three rules on top of the port as it stood (1 302 hit = 69.6 %, 97 invented = 6.6 %) | labelled cells and line blocks: 1 324 hit (70.8 %), 108 invented (7.2 %); with the cut at vertical lines **1 331 hit (71.1 %), 140 invented (9.1 %)**. On the Suva page, a printed table without widgets, the fields go from 25 to 36 and carry their labels | kept, with the price on record: on fillable PDFs the empty cells were fields already; on a printed table these rules are what finds the fields |
| 07.10. | Where the label of a tick mark stands | 891 built tick marks with a label | in the text object the mark sits in 803, right of it 27, left of it 8, none 53 | the text the mark sits in is its label; the model reads it without the box |
| 07.10. | A photographed page through the capture step | the Suva page laid in perspective on a dark, unevenly lit table (a rendered stand-in for a photo, 12 megapixels); the app finds the sheet, straightens it to 2 480 px and evens out the light, the pipeline runs with the model | geometry on the straightened page: 186 objects against 79 on the scan, 140 unknown elements of which 60 are specks of broken dashed borders (2 × 6 px); specks are not sent (below 0.6 character heights, or under one in both directions), 68 calls remain, 22 fields, all with a label; the model hands the prompt back as text for some empty crops (caught); option rows such as "Stellung: ☐ Höheres Kader ☐ …" were one block, so every box carried the whole row | specks are not read; a text with several marks in it is read per mark, so each box gets the words beside it; a real photo is still to be measured |
| 07.10. | Tinted boxes with the label printed inside; fields the print does not show | the same widgets; the Betreibungsbegehren page, whose boxes have neither frame nor tint on paper | tinted boxes with their label along the top as fields under the label: 1 335 hit (71.4 %), 152 invented (9.8 %). On the Betreibungsbegehren the geometry finds 33 inputs, none of them the main boxes: the print shows only labels on white. With the form fields of the fillable original as fallback, every widget without a built field becomes one: 69 of 69, 41 fields built | both kept; a fillable original knows its fields, the print does not have to |
| 04.10. | Real scans instead of rendered PDFs | 12 scanned German forms (XFUND), then 10 never seen before | rendered PDFs 91 % of fields; scans 43 %, with deskewing 55 %; ten unseen scans **44 %**. Thin grey table lines fall apart in a scan, light box borders drop below the ink threshold, a page frame counts as a wall | **known limit**: the geometry is tuned on rendered forms; photos need deskewing and a cleaner capture step (not built) |

## 3 Checking read text against the image

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 03.10. | Can a render-and-compare find reading errors? | 8B words rendered in a standard font, compared with the word boxes of the original | 25 real deviations; coverage < 0.7 flags 119 words that include all 25; false alarms at digits and italics | a cheap check exists; it over-flags |
| 03.10. | Re-read the flagged words? | 119 flagged crops sent again, new reading kept only if it renders closer | 17 of 25 errors repaired, 2 right words broken (both at digit boxes) | worth it for digits, with care |
| 04.10. | Compare shapes instead of pixels | the sequence of glyph shapes (tall, x-height, descender, dot, gap) of image and text, Levenshtein over the sequence | errors in long text are a few percent of the sequence; the font of the original no longer matters | shape comparison; `approve` above a threshold |
| 06.10. | Where is the threshold? | 172 read elements with a reference | threshold 0.005 flags 62 of 71 wrong and 31 of 101 right readings; **0.01: 61 / 30**; 0.02: 53 / 26; 0.05: 22 / 14; median deviation right 0, wrong 0.036 | 0.01 for forms is still open; the check flags almost every wrong reading at the price of a third of the right ones |

## 4 Speech

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 02.10. | Swiss German dialect? | a fable in three dialects, 53 s each, 8B and 70B | High German good, including technical terms; dialect unreliable in both, fluent but wrong | dictation in High German for now |
| 03.10. | Clean dictation in DE, FR, IT | six synthetic voices (female and male per language), 13 facts each, with the instruction "do not translate" | German 13/13 both; French female 12/13, Italian female 11/13; **the male French and Italian voices were translated into German with invented content** (8/13, 9/13) | state the source language explicitly: "the language is Italian, answer in Italian" – then all six stay in their language (FR male 13/13) |
| 03.10. | Noise | white noise +30 to −15 dB; market, restaurant, mall, building site +30 to 0 dB | +30 dB 10–12 of 13 facts, +15 dB 6–9, +10 dB 2–5, from +5 dB nothing; under heavy noise the model invents fluent text | the app records close to the mouth; noise is a known limit |
| 03.10. | Cut the recording into sentences? | 6 recordings cut at pauses, then exactly at sentence ends; 114 calls | no gain: German unchanged, female FR/IT worse (new errors in short pieces) | audio goes whole, only cut where size demands |
| 03.10. | Audio format | 16 kHz/16 bit mono WAV vs 8 bit, 24 kHz, original MP3, stereo | 71 of 78 facts at the base; 8 bit worse (70, more word errors); 24 kHz 74; MP3 73; stereo no difference; requests above about 4 MB are refused | 16 kHz mono; WAV or MP3 both fine |
| 03.10. | Pitch, formants, tempo, voting, self-correction by audio, the thinking model | each on the same six recordings | every pitch shift trades errors for other errors; voting never beats the original; the model returns its own transcript unchanged and calls its errors "matches perfectly"; thinking swaps errors and doubles the time | **not again** (all of them) |
| 03.10. | A dictionary in the prompt | names, then names plus three technical terms per language | names alone 71/78; **names plus terms 76/78**; the first lever that moved the stable errors ("Margrit", "deambulatore") | names and terms from the form and the local data go into the prompt |
| 03.10. | Heal the text afterwards | 8B rewrites the transcript, loose vs strict wording | loose: 71 → 74 facts but two right names and two meanings broken; strict (dictionary, "spelling only, keep the wording"): 71 → 72, no damage | strict healing only; about 5 % gain |
| 09.10. | What does a recording without speech become? | the tone of a test microphone, sent as the answer to one question of a form | the model returned the names and terms of its prompt as the transcript (867 characters), and the filling put them into the field as a literal value, unflagged | three entries of the dictionary in a row are the prompt and not a person. A spoken sentence came back with the same list behind it, so the transcript is cut where the list begins and what was said before it stays; the piece is flagged. The dictionary no longer holds labels of places that are not asked (one was a whole paragraph of the form) |

## 5 Legal hints

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 03.10. | Does the model see a vague entry and name the law? | 10 form fields with deliberately vague entries, 8B and 70B, sources checked against Fedlex | vagueness recognised 8 of 9 (8B), 10 of 10 (70B); 8B names 3 of 4 statute numbers wrong; 70B 5 of 5 right but two articles tied to a wrong statement | the small model must not cite on its own |
| 03.10. | Links to the source? | 70B asked for links, every link fetched | **0 of 9 links lead to a source**; eight are invented Fedlex addresses that render an empty shell | no links, ever; source only as statute and article |
| 03.10. | Two stages: 70B builds a catalogue per form once, 8B judges with it | the same 10 fields | 8B with the catalogue: JSON 10/10, vagueness 10/10, **0 invented sources** (4 without the catalogue), every cited source from the catalogue | the catalogue is the only source of legal text; the hint says "please look here", never "not allowed" |
| 07.10. | Catalogues for the shipped forms, checked against the statute | the 70B catalogue of the Betreibungsbegehren from 3 October, a new 70B call for the Suva form from the text layer of its pages; every cited article fetched from Fedlex and read | Betreibungsbegehren: 12 of 17 entries cite SchKG Art. 67, 69 or 104; Art. 67 holds item by item (Ziff. 1–4), Art. 69 is the office's step and was dropped, "SchKG Art. 104" is about attachment and was replaced by OR Art. 104 Abs. 1 (default interest), two claimed sources withdrawn. Suva: the model cites only the form text, no law, as on 3 October; UVG Art. 45 Abs. 2 and UVV Art. 53 Abs. 1 and 3 were added by hand, field by field. 8B judging with the catalogue on the walk-through's dictation, 8 calls: "no date of the claim document although Art. 67 Abs. 1 Ziff. 4 requires it" (right), a false alarm on the IBAN where the catalogue had no requirement | `data/catalogues/*.json` with `verified` and a `checked` note per entry; `required` from what the statute lists; the model judges only entries that carry a source |
| 07.10. | Catalogues for the two rebuilt forms | one 70B call per form from the text layer (three calls: the first for the accident report was cut at 3 000 tokens, the room was raised to 7 000); every cited article fetched from Fedlex and read | certificate: 40 entries, **not one source**; accident report: 50 entries, 33 with a source, 30 of them "UVG Art. 49 (Meldepflicht)" – Art. 49 is the payment of the daily allowance, Art. 93 (cited for the policy number) the collection of premiums, KVG Art. 41 (cited for the health insurer) the choice of provider: **every cited article wrong**. Sources set by hand: certificate 21 of 39 entries (ATSG Art. 3, 4, 6, 28, 43; OR Art. 324a, 328b, 336c; UVG Art. 9, 16, 17; KVG Art. 72; IVG Art. 7; AHVG Art. 50c), accident report 35 of 52 (UVG Art. 2, 4, 6, 7, 8, 10, 15, 16, 17, 45, 46; UVV Art. 11, 13, 22, 53, 54; ATSG Art. 63, 64; KVG Art. 1a); three fields the model skipped added, four entries rewritten, two dropped | the large model structures the list well and is useless for article numbers: the catalogue is a form to fill by a person, not a source; no statute lists the content of a certificate of incapacity, so there `required` follows what the statutes make the assessment depend on |

## 6 Values from text into fields

These runs were made on parliamentary documents (the sibling track), with the same filling code that Trace uses on
the transcript; the lessons transfer.

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 06.10. | How many fields per call? | 72 documents, bundles of 2, 4, 6, 8, 12 fields | six fields per call answer every line most reliably; above that lines go missing | bundles of six, one follow-up for missing lines |
| 06.10. | Give the model the data contract? | the schema excerpt of each field in the prompt | missing answer lines 35 → 2, follow-up calls 77 → 5, at 80 tokens more per call | contract excerpt per field |
| 07.10. | Dictation into the fields of a form | the walk-through's made-up dictation of the Betreibungsbegehren (3 pieces) as transcript, its 16 made-up values as reference; bundles of six, one follow-up; `tests/fill.js`, `results/fill.md` | with number words turned to digits first: 6 same, 3 different, 5 rightly empty, 0 missed, 2 values where none was said; 2 of the 5 wrong flagged, 4 calls, 9 s. With the raw words instead: 5 / 4 / 5 / 0 / 2, 3 of 6 flagged. Digits help addresses ("Via Nova 14"), the raw words help numbers the model normalises itself ("2026-118", "2'340.50 CHF"); the misses the code cannot see are literal words put into the wrong field (the creditor as representative) and an invented year | digits in the transcript, as the person reads it; a literal value in the wrong field is the open limit of the origin check |
| 06.10. | Where did a value come from? | every block of the page carries an id, the model names the id behind each value | in 142 of 204 cited blocks **not a single word of the value stands in the block** – the model names a block whatever the value | a cited block counts only when the value's words are in it; otherwise the value has no source and is dropped |
| 06.10. | Is a second run a signal? | two runs over the same 72 documents | the two runs agree on 62 % of cells; where they agree 11 % are wrong against the reference, where they disagree 33 % | disagreement is a usable "please look" signal without any model internals |
| 06.10. | Literal or derived? | 59 values the model cited without a literal match | "every word of the value is in the block, in another order" holds for 4 (two clearly right, two doubtful); loosening to word stems gives 17 with two wrong ones | derived = every word, strictly; no stems |
| 06.10. | Human review load | 969 values with a source on 61 documents | 80 carry `approve` (8.3 %): 36 cited, 44 composed (one summary per document) | 1.3 values per document to look at; the review screen is worth building |

## 7 The form as a conversation

While testing the short view of a form (the list of fields on the phone, and beside the page on the desk) the
context turned out to be lost: a field shows its printed label and nothing else, and "Datum", "Ort" or no label at
all do not say what is asked about whom. The idea that followed: the app leads through the form as a conversation,
with a plain question per place in the order of the paper, for someone who does not know the form, and every answer
goes back to the place it was asked for. Everything below was measured on 9 October 2026 on the four shipped forms
(407 fields) in about 2 000 model calls. No reference names the right question; the references used are the printed
label, the name of the PDF form field, the section of a field in the rebuilt forms and the made-up values of the
walk-through, and the check itself is measured with errors put in on purpose.

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 09.10. | How bare are the labels of the short view? | the fields of the four shipped forms as the pipeline builds them, no model | of 407 fields **137 have no label, 108 a label of one word, 130 a label that occurs more than once on the same form** | a label alone is not a question; the form is turned into questions |
| 09.10. | Can the model turn a whole form into a questionnaire? | the page as a picture of text with every field id at its place, one call per form, 70B and 8B; 8B also in bundles of six fields | both answer in valid JSON and invent no id. 70B groups as it likes (136 questions for 336 of the fields), 8B writes 286. An offered answer ("shall I enter today's date?") comes 0 times from 70B and 6 times from 8B, 2 of them fitting. Bundles of six: 25 calls instead of 2 on two forms, no gain | the model does not decide which fields belong together and offers no answers |
| 09.10. | Does the existing filling sort a dialogue back? | the walk-through's Betreibungsbegehren, every question with its answer as one transcript piece, the filling unchanged | 7 and 8 of 9 expected values the same. The misses both runs share: a radio answered by the name of its option stays empty, and a value is taken from the answer to another question | fields hang on questions by code, and an answer stays with its question |
| 09.10. | Units by code | radios by their group, tick boxes by the rule measured for radios, rows built alike as a table, everything else a single field | 407 fields → **259 units**: 225 single, 29 choices (65 tick marks), 5 tables (117 cells). Both models write for every unit and invent none | `src/dialogue/units.js` |
| 09.10. | Plain questions from the small model over the picture of text | 8B, one question per unit, everyday language demanded; then with the label of each unit given; then a second pass that only rewrites | without the labels the questions drift from their place; with them they repeat the form's wording; the rewriting pass returns 183 of 259 unchanged (in bundles of twelve 90 of 246, some with another meaning). Asked back which place a question belongs to, the same question lands on the same place in 23 of 45 cases over two runs | the picture of text is the obstacle: the model has to read the layout. The form goes in as a list of lines, every text a line and none left out (`src/dialogue/listing.js`) |
| 09.10. | From whose seat does the model write? | "you lead the conversation and fill in the form yourself afterwards" instead of "write a question per field"; the other person unknown, a named party asked about in the third person | before: "… tragen Sie bitte für jede Forderung den Betrag, den Zins und das Datum ein" – the form speaking. After, over the list of lines: of the 13 places about a third party (debtor, injured person) 0 address the other person as that party; when the units of a page are written in bundles of twelve it is 10 of 13 | the interviewer's seat and the unknown respondent are in the prompt; a page is written in one call |
| 09.10. | Does a check hold, and what does it let through? | the questions without ids, mixed, twelve at a time, with the list of the page; the model names the unit; twice. Errors on purpose: every place is handed the question of its neighbour, or of another place of the page | 70B writing and checking: 182 of 245 questions named right twice; a neighbour's question passes in 12 of 474 cases, another place's in 10 of 4 725. With the page layout instead of the list: 128 of 258 named right | the check runs over the list of lines; a question holds when every run names its own unit |
| 09.10. | Is the small model enough? | 8B writing over the whole form, page by page, in bundles of twelve; 8B checking; against 70B writing | 8B page by page: 237 questions, 173 named right twice, a neighbour's question passes in 10 of 458, another place's in 12 of 4 568. Whole form: 178 and 15 of 496, but 57 questions worded like another on the same page (29 page by page) and 34 with the form's brackets (17). 70B writing and 8B checking: 161 and 8 of 474. As the checker 8B lets no more through than 70B on the same questions (8 against 12) | **everything on 8B**, one call per page to write; two units asked with the same words both keep the label |
| 09.10. | How many runs of the check? | four runs over one writing of 256 questions | named right in every run / neighbour's question passing: one run 181 / 28 of 496, two 174 / 16, three 164 / 14, four 154 / 14 | two runs |
| 09.10. | Is it stable? | the same order a second time at temperature 0; the check over both writings | 8B writes 121 of 236 questions word for word again (70B 208 of 245). What holds: 173 and 178, in both 158; **35 of 259 units change sides**. The check itself decides 15 of 121 questions with the same wording differently when they stand in another bundle | written once when the form is captured and kept with it. A change of sides is between plain question and printed label, never a value at a wrong place |
| 09.10. | End to end | the walk-through's Betreibungsbegehren; a played respondent (8B) knows only the made-up dictation and answers every question; the filling reads each answer for the fields of its unit only (`tests/answers.js`, `results/answers.md`, 10 calls) | 6 of 9 expected values the same, 3 different, **no value in a field it was not said for**; said at once (`results/fill.md`) 6, 3 and 2 values in a wrong field. The three that differ are the same in both (invoice number from spoken digits, the amount, an invented year, the last one flagged). When the answer line must carry the field's name, one to two right answers are lost: the model names the field by its label ("gläubiger:" for `glaeubiger`) | an answer belongs to the fields of its unit, with one field the whole answer (`fillUnit`); a typed answer to a single field is the value as it stands |
| 09.10. | Does saying everything at once still fill a longer form? | the walk-through's Suva form, 34 fields, its made-up dictation of three pieces, the filling as it is; never measured before | every expected value arrives, but only 9 of 22 as expected: 13 differ, 5 of them wrong in substance – the date of birth stands in the day, month and year of the accident (day and month literal and unflagged), the time is 20:02 for 14:20, the employer's postcode is invented; 2 values where none was said. On the Betreibungsbegehren (16 fields) the same filling gives 6, 3 and 2 as on 7 October | the dictation stays, for what is still open; on a long form the questions are the way, because an answer cannot land at another question |
| 09.10. | Can the model tell when a place is answered? | per answer one judgement from the question, the printed label and what was said: enough, incomplete or no; cases built from the 31 units with a value of the two walk-through forms (`tests/enough.js`, `results/enough.md`, 129 calls) | the value itself is taken as enough in 29 of 31 cases, "Das weiss ich nicht." in 0 of 31, only the first part of a value in 1 of 5, the value of the next unit in 8 of 31 – those fit the place by their kind ("10" for the day, a name with an address for the debtor). The same verdict on a second run in 31 of 31; about 2.3 s per judgement. "Incomplete" and "no" are not told apart. Code alone ("not empty") takes everything but "I don't know" | after an answer to a single field the model judges it; anything but a plain yes leaves an `incomplete` hint that says what is missing, and the question shows as open to a decision. The judgement sees what is missing, not whether what was said is true |
| 09.10. | When does a spoken answer end? | the recorder already measures the noise floor and the length of a pause | not measured: 1.5 s of pause after at least 0.3 s of speech is a start value, agreed to be tuned on real voices; 20 s without speech close the microphone | in a conversation a piece closes at that pause, silence alone is no piece; the next question is asked at once and the answer is read in the background |
| 09.10. | Can the person be asked and answer in a language the form is not printed in? | the two walk-through forms (41 units, 31 expected values) in French, Italian and English, German as the comparison; answers as text | questions written directly in the other language from the German list hold in 38 to 39 of 41 cases (German: 40). Reading the answer and writing the value in German in one step does not carry: what needs translating stays as it is ("Single", "Warehouse employee", whole sentences) or comes half translated ("Fracture des rechten Handgelenks"), 14, 14 and 9 values as expected against 16 in German – and the origin check works against it: a right translation never stands in the answer, an untranslated one does | two steps: the dialogue runs in the person's language and the value is read in it; translating into the language of the form is a step of its own, before sending, with a check of its own |
| 09.10. | Does reading in the person's language keep the origin? | the filling as it is, with one line more: the value as it was said, in that language | 24 of 28 values stand in the answer as they are in French, 22 of 27 in English; in German 29 of 32 | the value is read in the language that was spoken |
| 09.10. | Can the values be translated in bundles? | 28 written values per language, there with the large model and back with the step; bundles of the whole form and of six, three wordings, with and without the question in front; then one value per call | from a bundle the small model translates none of the values that are language (0 of 28; the large model 4), and once handed back the German label of every place instead of its value; as soon as names and numbers stand in the same call it leaves everything as it is. One value per call: 27 of 28 translated, 54 of 56 names and numbers untouched | **one value per call**; a value without a letter is not sent at all (11 of 28) |
| 09.10. | Translate the stored questions, or write new ones? | the 40 holding German questions in one call per form, then the check twice | all lines come back; 34, 34 and 25 of 28 still point at their place. What does not hold has moved ("Wo und wann ist der Abschluss passiert?" became the place and time of the accident) or has become the same as another | the stored questions are translated when the form is first opened in a language, checked like written ones, and kept with the form; what does not hold is asked with the translated label |
| 09.10. | The repository's own run | `make dialogue` (`tests/questions.js`, `results/dialogue.md`): the pipeline's code on the four shipped forms, read from the text layer, 47 calls, 181 s at the model | 259 units, 29 not asked, 214 questions written, **156 hold**, 74 keep the printed label; a neighbour's question passes in 10 of 414 cases (2.4 %), another place's in 20 of 4 134 (0.5 %) | |
| 09.10. | The repository's run in another language | `make dialogue` (`tests/translate.js`, `results/translate.md`): the two walk-through forms in French, Italian and English, 99 calls, 6 of them to the large model for the way there | dialogue: of 40 questions 35, 35 and 39 hold after translation, every label and option comes back (14 calls per language for both forms). Values, one per call: of 28 that are language 14 come back as the German value, 13 as another word, 1 untranslated; of 56 names and numbers 54 stay. Code flags 3 translations, 2 of them rightly ("Werksstrasse", "Palet"). Not caught: "nubile" → "verheiratet", "Suisse" → "Schweizerin", "Paletta" → "Schaufel" | the person sees what they said under every translated value; the translation is not checked by a second translation |
| 09.10. | Which questions does a form require? | the 33 required entries of the four catalogues bound to the units of the dialogue: by code (the label of a field), by the small model, by the large model, by what both name, and with a check back; read against the pages, 60 calls | 28 entries have a place in the dialogue (43 units). The label binds 17 and no wrong unit. The small model alone names 26 wrong units, the large one 34. The label, else what both name: 26 entries, 3 wrong units; the check back drops 2 of the 3 and none of the 12 right ones. A unit only one of the two names is right in 3 of 31 cases | bound once when a form is captured: the label, else both models with the check back. Nothing has to be answered; what is required and empty is a warning, the form can still be sent |
| 09.10. | Can the model say what is required, without a checked catalogue? | (a) both models name the indispensable units of every page; (b) both mark the required ones among the 136 entries of the checked catalogues, 33 of them required; (c) the large model builds the catalogue anew with a key for required; 26 calls | (a) the small model names 121 of 230 units, 80 of 110 on one form and 2 of 35 on another, the large one 112. (b) the large model marks 100 of 136 entries, 31 of the 33 among them; the small one 8, 2 of the 33. (c) 7 of 16, 16 of 16 and 18 of 42 entries marked; one of the four catalogues did not come back | as built: required is what a person checked in the catalogue; a form without a catalogue carries no required marks |
| 09.10. | The repository's run of the binding | `make required` (`tools/capture.js --required`, `results/required.md`): the four captured forms, 29 calls, 14 of them to the large model | 17 entries bound by the label, 10 by both models with the check back, 6 not bound; 39 of 230 asked questions marked required. Read against the pages: one of the 10 is wrong ("Ort und Datum" for the signatures), two entries with a place stay unbound (the amount of the claim, "Arbeit ausgesetzt?") | kept with the captured forms |
| 09.10. | What would the existing doubt mark catch at the fields? | no model: the fields of three pages the small model had read (`make bench`), paired by place with the same fields read from the text layer; red = the shape check doubts the label's block, or the field has no label | of 36 fields with a label 31 are read right, 5 of them marked; 5 are read wrong, 2 of them marked ("rechte" for "rechts" twice and a neighbour's label are not). 50 of the 86 fields have no label in the original either: cells of tables, comb fields | the mark shows where to look first and is no filter: every field can be corrected by hand, its label, kind, place and size, its question and whether it is required. A field without a label is marked only where it stands alone |
| 09.10. | The whole path of an uploaded form | one page (the Betreibungsbegehren's first, as an image) through the app in a browser: upload, capture with the model, the mask, a label changed and a field added, saved; 53 calls, 2 of them to the large model | capture 138 s: reading 100 s, the catalogue 17 s (16 entries, 6 with a source, nobody's checked work), then the questions. 21 fields found, against 35 on the same page analysed without the camera's straightening. Saving the two corrections: 4 calls, 35 s; both units get a question that holds, both labels a catalogue entry. The form then stands among the forms to choose from | – |
| 09.10. | Does the shape check tell right from wrong on an uploaded page? | no model: the 21 texts read on that upload that have a counterpart in the text layer | 19 read right, 2 wrong ("Verretters", "seilt"). At the threshold of 0.02 the check marks both wrong ones and 16 of the 19 right ones; at 0.1 both and 10; at 0.2 one and 4 | on a page that went through the camera's straightening and evening out nearly every field is red; the threshold was set on rendered pages and is left as it is |

What the check does not see is a question that points at the right place and is worded badly: "Wann ist das
Geburtsdatum des Schuldners bekannt?" holds. Of 15 holding questions read by hand, 2 asked for something else than
the field. A played respondent that knows only the names of the PDF's form fields names the right one for 76 of 123
printed labels asked as they stand and for 65 of 100 holding questions; given the neighbour's question, for 2 of
115. That measure separates right from wrong and nothing finer, which is why the printed label stays beside every
question in the app. Of the asked units 37 have no label (34 on the Suva form); the model mostly answers "KEINE"
there and they stay as they were. The conversation follows the lines of the page from the top; that agrees with
the order of the form fields in the PDF for 108 of 116 neighbouring units and fails where two columns interleave.

## 8 Not again

- Reading several marked blocks in one image (22.7 % errors, ids swapped).
- Letting the model correct its own reading (2 healed, 10 broken).
- Spell-checking with a vocabulary from our own pages (6 closer, 28 further).
- Voting over seeds, pitch, tempo or formant shifts of the same recording.
- Correcting a transcript by giving the model the audio again (it keeps its errors).
- Asking the model for links to laws (0 of 9 valid).
- Taking a cited block as a source without checking the words.
- Token probabilities as a signal: there is no API for them in the deployment.
- Giving the model the page as a picture of text to write questions or to say which place one belongs to.
- A second pass that rewrites questions into plainer words (183 of 259 came back unchanged).
- Letting the model group the fields into questions, or offer an answer in the question.
- Writing the questions of a page in bundles: the party a place is about gets lost (10 of 13).
- Translating values in a bundle: with names and numbers beside them nothing gets translated (0 of 28).
- Reading an answer and translating it in one step: half-translated values, and no origin to check.
- Asking the model which places of a form are required, without a checked catalogue: the small one names half of
  them, the large one three quarters of the catalogue.
- Taking a place only one of the two models names for a required entry (3 right of 31).

## 9 What ships in this repository

The full reference set (22 forms, 61 pages, 1 871 field and 1 007 tick-mark widgets) cannot be redistributed:
the forms belong to their publishers. `data/forms/` holds two public forms unchanged and two rebuilt after forms
of that set, with the same fields in our own layout (`tools/forms/`, `make forms`). `make test` runs the geometry
over the shipped pages and prints the same measures as above for them; the numbers in this document refer to the
full set and are reproduced by the same scripts on it.

The rebuilt forms are rendered PDFs with clean lines and boxes, so they sit at the easy end of the set; they are
there to show the whole chain on a fillable form the project may ship, not to prove the geometry. On their three
pages (`make test`, 7 October 2026, text layer as reading, no widget fallback): certificate 76 of 77 text widgets
and 15 of 15 marks hit, 0 fields invented; accident report page 1 32 of 32 and 20 of 20, 8 invented, page 2
32 of 32 and 20 of 20, 10 invented (empty table and label cells). Labels on 34 of 77 (the table cells have none
of their own), 31 of 32 and 20 of 32 hit widgets. Radio pairs across the four pages with widgets: 21 grouped
right, 0 wrong, 1 not grouped.

On the six shipped pages (run of 7 October 2026, no model call): 244 of 266 reference blocks map to exactly one
object (91.7 %), 1 684 of 1 690 words lie in an object (99.6 %), 60 of the 69 text-field widgets of the
Betreibungsbegehren have a writing line (87 %), both radio widgets are found and the pre-printed tick is read as ticked.
These two forms are among the easier ones of the full set; the full set is the number to quote.

Reading on the shipped pages (run of 7 October 2026, `make bench`: Apertus 8B at the CSCS endpoint, temperature 0,
one element per call, 152 calls in 6.8 minutes): 143 read elements with reference text, 121 identical (84.6 %),
18 near, 4 different, 0 empty, 1.1 % character errors. Forms carry short labels and read better than the document
pages measured above; Suva pages 1 and 3 are the same page in two copies, so this is effectively two distinct pages.
The shape check at threshold 0.02 flags 15 of the 22 wrong readings and 24 of the 121 right ones. `results/read.md`
holds the full table of that run, including the flag counts for other thresholds.

Fields on the shipped pages (`make test`, 7 October 2026): the Betreibungsbegehren page is the only shipped page
with widgets. From the print alone 61 of its 69 field widgets are covered by a built field and 4 fields lie on no
widget; with the widgets of the fillable original as fallback all 69 are fields (41 built, a large field covers
several small widgets). Both radios are found and form one group. The Suva pages carry no widgets; their fields
are checked by eye on the control image that `node src/cli.js fields` draws after the reading step.

Output (`make test`, 7 October 2026, `tests/output.js`): on the fillable Betreibungsbegehren the values go into the
original's own form fields, named by the widget a field was built from, and read back identically; the radio is
selected by the widget whose box lies where the field lies; an empty value leaves the field empty; a field the
original has no widget for is drawn at its place. A photographed page becomes a new PDF with the straightened
page as picture and the values drawn on it. Nothing is flattened, so the recipient still sees a form. The two
PDFs of the test run land in `storage/tests/` and were checked by eye against the page images.

The dialogue on the shipped forms (run of 9 October 2026, `make dialogue`: Apertus 8B, temperature 0, 47 calls,
181 seconds at the model): of 259 units 29 are not asked, 156 get a plain question that holds and 74 keep their
printed label; a form costs 3 to 21 calls. The same target judges whether an answer is enough for its place
(129 calls, `results/enough.md`): 29 of 31 full answers pass, none of 31 empty ones. The two forms of the
click-through carry their questions in `src/app/js/mock/dialogues.js`, written by the same code (`make
walkthrough`, 12 calls: 14 of 14 and 26 of 27 questions hold) and not edited by hand. Asked question by question
with a played respondent (`make bench`, `tests/answers.js`, 10 calls), the walk-through's Betreibungsbegehren comes
out with 6 of 9 expected values the same and no value in a wrong field.

A form can be filled in in another language than its own (`results/translate.md`): the dialogue is translated
once, when the form is first opened in that language, and kept with it; the answers are read in the person's
language and translated value by value before sending.

The questions at which a form requires an entry are marked in the captured forms (`results/required.md`). Nothing
has to be answered: a person goes on when it is enough for them, and what is required and still empty is a warning
before sending.

What the capture finds can be corrected by hand before a form is kept, and again from any saved form: label,
kind, place and size of a field, a field less or more, the question, what is required. The job is put together
anew by code and only what changed is asked of the model. A form saved that way is kept under `storage/forms/` and
can be chosen and filled in again. A form that is not one of the shipped ones gets its catalogue as a step of its
capture, unchecked.

The app lists the four shipped forms. Each was captured once (`make capture`, 9 October 2026, 47 calls): the
pipeline ran over it with the text taken from the text layer of its PDF instead of read by the model
(`src/read/layer.js`), and the result lies beside it as `captured.json`, with 26, 11, 64 and 50 questions that
hold. Choosing a form makes a job from that file and opens it at once; recognizing happens where a form is
created, when a person photographs or uploads one. The walk-through with made-up recognition, values and
transcript stands beside the app as a demo under `/?demo`, with a state of its own.
