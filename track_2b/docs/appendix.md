# Appendix: the tests behind the decisions

The technical report states what Trace does and what it reaches; this appendix shows what each decision rests on. Every
row is a test that was run, with its numbers and what was decided after it. The full record is `docs/tests.md` (103
entries, each with question, test, result, finding and the run that was logged) and `docs/evidence.md` (the series of
measurements by date). Every measurement ran with fixed inputs and logged calls; most ran once, the dictation three
times per voice.

## 1 The automated checks

`make test` runs without a model and without the network: the geometry over the shipped forms, measured against the
text layer and the widgets of their PDFs (`sources`, `marks`, `fields`, `dialogue` write their tables to
`storage/tests/`), and 323 checks.

| What is checked | Files (checks) |
|---|---|
| The form as a conversation: units, questions, the order they are asked in, what a form requires | `dialogue` (169) |
| Answers into values: number words to digits, values against a field's kind and list, entries of a list | `numbers` (28), `values` (16), `kinds` (29), `loops` (17) |
| Speech and reading: what a recording is heard as, the reading step against the text | `hearing` (6), `reading` (11) |
| The output: the filled PDF, written into the original's own form fields | `output` (8) |
| The server: jobs, editing a form by hand, a form kept with its corrections, the routes of the app | `server` (39) |

## 2 The experiments behind the design

| Question | What was measured | Decided |
|---|---|---|
| Can the model find the fields of a form? | asked for the boxes of one form, it found 4 of 31 tick boxes and no input field | geometry first, the model only reads (`docs/evidence.md` 2) |
| How well does the geometry find a form's parts? | on 61 pages 2 670 of 3 430 blocks are a single object (77.8 %); text fields a hand can fill in on rendered PDFs 91 % (1 538 of 1 688; of all 1 871: 71 %), fields of scans 43 %, of ten scans never seen before 44 %; a sheet of 24 fields photographed ten times, slanted, turned, in uneven light and blurred: every field found, after the seam of a blurred line was taken into the geometry | the geometry is the form; a scan is marked for more checking (`docs/evidence.md` 2) |
| How large must the image be for reading? | one page at 1240 px 4.9 % character errors, at 900 px 10.5 %; cut into three strips 1.0 % | read in pieces, not the whole page (`docs/evidence.md` 1) |
| Several elements in one image? | single elements: 101 of 180 identical, 2.3 % character errors; three marked in one image: 22.7 %, ids swapped | one element per call, never several marked in one image (`docs/evidence.md` 1) |
| Can the model correct its own reading? | of 192 readings 2 healed, 10 right ones broken (abbreviations expanded, French translated into German) | no self-correction; the image check marks instead (`docs/evidence.md` 1) |
| Does the image check find wrong readings? | at 0.02 it marks 15 of 22 wrong readings and 24 of 121 right ones | a marked reading is shown red for a person (`results/read.md`) |
| Is the small model enough to write the questions? | 70B writing and checking: 182 of 245 questions hold, a neighbour's question passes in 12 of 474 cases; 8B page by page: 173 of 237, 10 of 458; as the checker the 8B lets no more through | every question on the 8B, one call per page (`docs/evidence.md` 7) |
| Can the model name the law behind a field? | the 8B names 3 of 4 statute numbers wrong; 0 of 9 links lead to a source; with a catalogue the 70B builds once per form, 0 invented sources against 4 without | a catalogue per form from the 70B, checked against Fedlex; sources as statute and article, never a link (`docs/evidence.md` 5) |
| Can the model say what a form requires without a catalogue? | of 136 entries of the checked catalogues the 8B marks 8 required, the 70B 100, 31 of the 33 required among them | required is what a person checked in the catalogue (`docs/evidence.md` 7) |
| Does dictation reach the fields? | High German and technical terms good, dialect unreliable in both models; the male French and Italian voices translated into German with invented content; names and terms of the form in the prompt: 76 of 78 facts against 71 | dictation in the person's language with the form's names and terms in the prompt (`docs/evidence.md` 4) |
| Can values be translated in bundles? | 0 of 28 right in bundles; one value per call | one value per call; code flags a translation whose digits or names changed (`docs/evidence.md` 7) |
| Does one dictation fill a whole sheet? | 20 of 20 fields in three runs with one synthetic voice, 19 of 20 with the other | – (`results/dictation/`) |
| Where does the time of a capture go? | a page with 31 tick boxes: 4 min 33 s from the image to the finished dialogue; after two changes 60 s | – (`docs/evidence.md` 7) |
| How long do capture and filling take? | capturing a page 51 to 88 s, one call to the 70B of 10 to 26 s; filling a captured form up to the sent PDF 3.2 to 16.8 s with 5 to 30 calls | capture once per form, fill without capturing again (`results/runtime/`) |

## 3 How to repeat them

The checks without a model run with `make test` (Node 20.6 or newer, `npm ci` first). The ones with the model need a
key in `.env`: `make bench` reads the shipped forms, `make dialogue` writes and checks their questions. Where a run is
kept, `docs/tests.md` names its folder under `results/`; where it is not, the entry says what the test can be
repeated with.
