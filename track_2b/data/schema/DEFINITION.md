# Trace form schema 2b-0.2

Contract: `trace.json` (JSON Schema 2020-12, self-contained). One object per captured form, from the photo to the signature request. Every value points at where it came from, a person can see where to look, and the person's decision stays with the value.

## Five layers

| Layer | Keys | Source |
|---|---|---|
| The form as a document | `form`, `pages` | photo or PDF; `origin` says whether this is the published original or a rebuilt form with the same fields |
| What the geometry and the reading step saw | `blocks[]` | the page split into elements: text, image, line, input, checkbox, radio, unknown – unchanged, with positions in pixels at 300 dpi |
| What can be filled in | `fields[]` | one field per input, checkbox, radio or signature, with its printed label, kind, position, the blocks it rests on and, for fillable PDFs, the name of the PDF form field (`widget`) |
| How the form is asked | `dialogue` | the fields in units (single field, choice, table) in the order of the paper, each with its printed label and, where one holds, a plain question; built once when the form is captured |
| What was said and decided | `audio`, `transcript[]`, `fields[].value`, `source`, `hints[]`, `review`, `status`, `history[]` | the dictation, the transcript per piece, each value with its origin, hints, the person's decision |

## Blocks

`blocks[]` are the page elements exactly as the geometry step produced them: `id` (`b1`, `b2`, … in reading order over the whole form), `page`, `type` (`text`, `image`, `line`, `input`, `checkbox`, `radio`, `unknown`), `x`, `y`, `width`, `height`, `content` (text read from the element; `"x"` for a ticked checkbox or radio), `fontSize`, `color`, `background`, `isOCR`, `approve` (the rendered text does not match the image – a person should look). Blocks are never changed; fields point at them.

## Fields

A field is what a person would fill in. `kind` is one of `text`, `multiline`, `number`, `date`, `checkbox`, `radio`, `signature`. `label` is the printed label (left of or above the box); `labelBlock` and `boxBlock` name the blocks. Radios that exclude each other share a `group`; `option` says what ticking means. `required` comes from the catalogue (a required entry), not from the form. `widget` is the name of the PDF form field when the PDF is fillable; the output writes straight into it.

## Corrections by hand

What the pipeline finds is a proposal: the model reads a label wrongly, the geometry misses a field or takes a bar for one, a question points at the right place and is worded badly. A person corrects it before the form is kept, and again later: the label and `kind` of a field, its place and size, tick marks that belong together (`group`, `option`), a field taken away, a field added (`by: "person"`), the question of a unit (`dialogue.units[].by: "person"`; such a question stands as it is and is not checked) and whether the unit is `required`. The job is then put together anew by code: the units from the fields as they stand, each keeping its question, its required mark and its answers where its fields are the same, the pieces of the transcript pointing at their units under the new ids. Only a unit whose fields or labels changed gets a new question from the model, written and checked like the others. A translation of the dialogue is dropped and made anew when the form is next opened in that language. The history records `edited`.

A form that was saved from a capture or corrected is kept as a form of its own and can be chosen and filled in again; `form.own` names it. A form made of a shipped one keeps `form.file`, so its values still go into the form fields of the original PDF; a field a person added is drawn on the page.

## Dialogue

`dialogue.units[]` turn the form into a conversation: `q1`, `q2`, … in the order of the paper. Every field except the signature belongs to exactly one unit; `kind` is `single` (one field), `choice` (tick marks that belong together) or `table` (rows built alike, with `rows` and `columns`). `label` holds the printed labels of the unit's fields. `question` is a plain question for the unit, written by the model named in `dialogue.model` and present only when it passed the check: asked without its id, the model named this unit in every run, and no other unit of the page is asked with the same words. A unit without `question` is asked with its printed label. An answer given to one unit goes into the fields of that unit only; the transcript piece it was said or typed in carries the unit's id in `question`. `skip` marks a unit that is not asked because the fillable original has no form field there. `required` marks a unit at which the form requires an entry: a required entry of the form's catalogue was bound to it, by the label of one of its fields, or by the small and the large model naming the same unit and a check back confirming it. A form without a catalogue has no required units. Nothing has to be answered: a person can go on with questions open, they stay empty, and a required unit with nothing in any of its fields then carries the hint `missing` on its first field – a warning, the form can still be sent. The units are built by code; without a model the dialogue carries labels only.

## Another language than the form's

A person can fill in a form in a language it is not printed in. `language` then names that language. `dialogue.translations[language]` holds the questions, labels and options in it, made once when the form is first opened in that language; a translated `question` is present only when it passed the same check as the question itself, otherwise the translated `label` is asked. The answers are transcribed and read in the person's language, so a value can be held against the person's own words. Before sending, every written value is translated into `form.language`, one by one; `source.said` keeps what the person gave, with its language. Code holds the translation against it and sets `approve` where the digits differ or where the translation differs from what was said by a character or two (`said.check`). A value without a letter is not translated.

## Values and their origin

`value` is what the dictation put into the field (`"x"` or empty for checkbox and radio). `source` says where it came from:

- `piece` and `quote`: the transcript piece and the words in it the value rests on
- `how`: `literal` (the value stands in the transcript as is), `derived` (every word of it does, in another order), `cited` (the model named the piece but the words are not there), `composed` (the model phrased it), `entered` (a person typed it)
- `approve: true`: a person should look – `how` is neither `literal` nor `derived`, or the piece itself carries `approve`

## Hints

`hints[]` on a field: `kind` is `missing` (something required is empty – by code; with a dialogue one hint per required unit, on its first field), `vague` (the entry is insufficient against the catalogue – by the model with the catalogue), `incomplete` (the answer does not cover what the question asks for – by the model, from the question, the printed label and what was said; `text` says what is missing), `legal` (the catalogue's requirement for this field), or `format` (the value does not fit the kind – by code). `article` is the legal reference as printed in the catalogue; `catalogue` names the catalogue file and its validation stamp. Trace never says "not allowed", only "please look here".

The catalogue of a shipped form was checked by a person against the statute; a form a person captured gets its catalogue from the large model as a step of its capture, and entries are added the same way for fields a person adds. Such a catalogue, and such an entry, is nobody's checked work: a `legal` hint from it says `unverified` in `catalogue`.

## The person's decision

`review` on `source` and on every hint: `{ at, decision (confirmed | changed | rejected), before, by, rule }`. The value itself is changed in place; `before` keeps the old one. `rule` names a general rule when the change came from one or founded one.

## Flow and history

`status` goes `captured` → `verified` → `filled` → `reviewed` → `sent`; `history[]` keeps every step with time and person.

## Example (excerpt)

```json
{
  "schema": "2b-0.2",
  "form": { "name": "Betreibungsbegehren", "issuer": "Betreibungsamt (Form. 1)", "language": "de", "pages": 2, "origin": "original", "file": "forms/betreibungsbegehren/form.pdf" },
  "pages": [ { "n": 1, "width": 2481, "height": 3509, "image": "forms/betreibungsbegehren/page-1.png", "unit": 34 } ],
  "blocks": [
    { "id": "b7", "page": 1, "type": "text", "x": 180, "y": 612, "width": 310, "height": 36, "content": "Gläubiger", "fontSize": 9.5, "color": "#000000", "isOCR": true },
    { "id": "b8", "page": 1, "type": "input", "x": 180, "y": 660, "width": 1040, "height": 60, "content": "" }
  ],
  "fields": [
    { "id": "f3", "label": "Gläubiger", "kind": "multiline", "page": 1, "x": 180, "y": 660, "width": 1040, "height": 60, "labelBlock": "b7", "boxBlock": "b8", "required": true, "widget": "Gläubiger",
      "value": "Garage Caduff AG, Kasernenstrasse 8, 7000 Chur",
      "source": { "piece": 1, "quote": "Gläubigerin ist die Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur", "how": "derived", "approve": false },
      "hints": [ { "kind": "legal", "text": "Name und Wohnort des Gläubigers", "article": "SchKG Art. 67 Abs. 1 Ziff. 1", "catalogue": "catalogues/betreibungsbegehren.json, validated 2026-10-03" } ] }
  ],
  "dialogue": { "built": "2026-10-09T10:12:00Z", "model": "swiss-ai/Apertus-v1.5-8B", "units": [
    { "id": "q3", "kind": "single", "page": 1, "fields": [ "f3" ], "label": "Gläubiger", "question": "Wie heisst der Gläubiger und wo wohnt er?" }
  ] },
  "transcript": [ { "n": 1, "start": 0, "text": "Betreibungsbegehren ans Betreibungsamt Chur. Gläubigerin ist die Garage Caduff AG, Kasernenstrasse 8, 7000 Chur.", "raw": "… Kasernenstrasse acht, siebentausend Chur." } ],
  "status": "filled"
}
```

## Rules

1. Blocks stay as the geometry produced them; nothing in them is changed or removed.
2. Every value from the dictation carries `source` with `how`; there is no value without an origin.
3. `approve` is the machine's signal and stays; "done" means a `review` is present.
4. Hints are requests to look, not verdicts.
5. Keys and enumerations are English; the content (labels, values, transcript) is in the language of the form or the dictation.

## Changes

- **2b-0.2** (2026-10-09): `dialogue` – the fields in units with a printed label and a checked plain question; `transcript[].question` for a piece said in reply to a unit; hint kind `incomplete`; `dialogue.units[].required`; `form.own`, `fields[].by`, `dialogue.units[].by` and the event `edited` for a form corrected by hand; `language`, `dialogue.translations` and `source.said` for a form filled in in another language.
- **2b-0.1** (2026-10-07): first draft.
