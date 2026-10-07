# Trace form schema 2b-0.1

Contract: `trace.json` (JSON Schema 2020-12, self-contained). One object per captured form, from the photo to the signature request. Every value points at where it came from, a person can see where to look, and the person's decision stays with the value.

## Four layers

| Layer | Keys | Source |
|---|---|---|
| The form as a document | `form`, `pages` | photo or PDF; `origin` says whether this is the published original or a rebuilt form with the same fields |
| What the geometry and the reading step saw | `blocks[]` | the page split into elements: text, image, line, input, checkbox, radio, unknown – unchanged, with positions in pixels at 300 dpi |
| What can be filled in | `fields[]` | one field per input, checkbox, radio or signature, with its printed label, kind, position, the blocks it rests on and, for fillable PDFs, the name of the PDF form field (`widget`) |
| What was said and decided | `audio`, `transcript[]`, `fields[].value`, `source`, `hints[]`, `review`, `status`, `history[]` | the dictation, the transcript per piece, each value with its origin, hints, the person's decision |

## Blocks

`blocks[]` are the page elements exactly as the geometry step produced them: `id` (`b1`, `b2`, … in reading order over the whole form), `page`, `type` (`text`, `image`, `line`, `input`, `checkbox`, `radio`, `unknown`), `x`, `y`, `width`, `height`, `content` (text read from the element; `"x"` for a ticked checkbox or radio), `fontSize`, `color`, `background`, `isOCR`, `approve` (the rendered text does not match the image – a person should look). Blocks are never changed; fields point at them.

## Fields

A field is what a person would fill in. `kind` is one of `text`, `multiline`, `number`, `date`, `checkbox`, `radio`, `signature`. `label` is the printed label (left of or above the box); `labelBlock` and `boxBlock` name the blocks. Radios that exclude each other share a `group`; `option` says what ticking means. `required` comes from the catalogue (a required entry), not from the form. `widget` is the name of the PDF form field when the PDF is fillable; the output writes straight into it.

## Values and their origin

`value` is what the dictation put into the field (`"x"` or empty for checkbox and radio). `source` says where it came from:

- `piece` and `quote`: the transcript piece and the words in it the value rests on
- `how`: `literal` (the value stands in the transcript as is), `derived` (every word of it does, in another order), `cited` (the model named the piece but the words are not there), `composed` (the model phrased it), `entered` (a person typed it)
- `approve: true`: a person should look – `how` is neither `literal` nor `derived`, or the piece itself carries `approve`

## Hints

`hints[]` on a field: `kind` is `missing` (required field empty – by code), `vague` (the entry is insufficient against the catalogue – by the model with the catalogue), `legal` (the catalogue's requirement for this field), or `format` (the value does not fit the kind – by code). `article` is the legal reference as printed in the catalogue; `catalogue` names the catalogue file and its validation stamp. Trace never says "not allowed", only "please look here".

## The person's decision

`review` on `source` and on every hint: `{ at, decision (confirmed | changed | rejected), before, by, rule }`. The value itself is changed in place; `before` keeps the old one. `rule` names a general rule when the change came from one or founded one.

## Flow and history

`status` goes `captured` → `verified` → `filled` → `reviewed` → `sent`; `history[]` keeps every step with time and person.

## Example (excerpt)

```json
{
  "schema": "2b-0.1",
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

- **2b-0.1** (2026-10-07): first draft.
