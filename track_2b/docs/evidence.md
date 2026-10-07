# Evidence

What was measured before and while Trace was built, and what each number decided. Condensed from the working
logs (2–7 October 2026); the raw runs, scripts and model answers stay outside the repository because they hold
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

## 5 Legal hints

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 03.10. | Does the model see a vague entry and name the law? | 10 form fields with deliberately vague entries, 8B and 70B, sources checked against Fedlex | vagueness recognised 8 of 9 (8B), 10 of 10 (70B); 8B names 3 of 4 statute numbers wrong; 70B 5 of 5 right but two articles tied to a wrong statement | the small model must not cite on its own |
| 03.10. | Links to the source? | 70B asked for links, every link fetched | **0 of 9 links lead to a source**; eight are invented Fedlex addresses that render an empty shell | no links, ever; source only as statute and article |
| 03.10. | Two stages: 70B builds a catalogue per form once, 8B judges with it | the same 10 fields | 8B with the catalogue: JSON 10/10, vagueness 10/10, **0 invented sources** (4 without the catalogue), every cited source from the catalogue | the catalogue is the only source of legal text; the hint says "please look here", never "not allowed" |

## 6 Values from text into fields

These runs were made on parliamentary documents (the sibling track), with the same filling code that Trace uses on
the transcript; the lessons transfer.

| Date | Question | Setup | Finding | Decided |
|---|---|---|---|---|
| 06.10. | How many fields per call? | 72 documents, bundles of 2, 4, 6, 8, 12 fields | six fields per call answer every line most reliably; above that lines go missing | bundles of six, one follow-up for missing lines |
| 06.10. | Give the model the data contract? | the schema excerpt of each field in the prompt | missing answer lines 35 → 2, follow-up calls 77 → 5, at 80 tokens more per call | contract excerpt per field |
| 06.10. | Where did a value come from? | every block of the page carries an id, the model names the id behind each value | in 142 of 204 cited blocks **not a single word of the value stands in the block** – the model names a block whatever the value | a cited block counts only when the value's words are in it; otherwise the value has no source and is dropped |
| 06.10. | Is a second run a signal? | two runs over the same 72 documents | the two runs agree on 62 % of cells; where they agree 11 % are wrong against the reference, where they disagree 33 % | disagreement is a usable "please look" signal without any model internals |
| 06.10. | Literal or derived? | 59 values the model cited without a literal match | "every word of the value is in the block, in another order" holds for 4 (two clearly right, two doubtful); loosening to word stems gives 17 with two wrong ones | derived = every word, strictly; no stems |
| 06.10. | Human review load | 969 values with a source on 61 documents | 80 carry `approve` (8.3 %): 36 cited, 44 composed (one summary per document) | 1.3 values per document to look at; the review screen is worth building |

## 7 Not again

- Reading several marked blocks in one image (22.7 % errors, ids swapped).
- Letting the model correct its own reading (2 healed, 10 broken).
- Spell-checking with a vocabulary from our own pages (6 closer, 28 further).
- Voting over seeds, pitch, tempo or formant shifts of the same recording.
- Correcting a transcript by giving the model the audio again (it keeps its errors).
- Asking the model for links to laws (0 of 9 valid).
- Taking a cited block as a source without checking the words.
- Token probabilities as a signal: there is no API for them in the deployment.

## 8 What ships in this repository

The full reference set (22 forms, 61 pages, 1 871 field and 1 007 tick-mark widgets) cannot be redistributed:
the forms belong to their publishers. `data/forms/` holds two public forms unchanged and, later, two rebuilt ones.
`make test` runs the geometry over the shipped pages and prints the same measures as above for them; the numbers in
this document refer to the full set and are reproduced by the same scripts on it.

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
