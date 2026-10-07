# Forms

The forms the demo and the tests run on. Each folder holds the PDF, one PNG per page rendered at 300 dpi, one
JSON per page with the reference the tests measure against, and a `form.json` with name, publisher, language,
origin and the address the signature step sends to.

| Folder | Form | Publisher | Origin | Pages |
|---|---|---|---|---|
| `betreibungsbegehren/` | Betreibungsbegehren, Formular 1 (debt enforcement request) | Betreibungsamt, official form under the SchKG, taken from the Canton of Grisons' download page | original, unchanged, fillable | 2 |
| `suva-bagatellunfall/` | Bagatellunfall-Meldung UVG (minor accident report) | Suva | original, unchanged, not fillable | 4 |
| `arbeitsfaehigkeitszeugnis/` | Arbeitsfähigkeitszeugnis (certificate of fitness for work) | rebuilt after the SIM certificate (Swiss Insurance Medicine, edition January 2019) | rebuilt, fillable | 1 |
| `schadenmeldung-uvg/` | Schadenmeldung UVG (accident report to the insurer) | rebuilt after the Helsana Unfall AG form (edition 12.2016) | rebuilt, fillable | 2 |

The two originals are published for anyone to download and fill in; they are included as test material and remain
the property of their publishers. The two rebuilt forms carry the same fields as their models in our own layout,
one with labels over writing lines, one with boxed fields and tinted section bars; the header and the footer of
every page say "nachgebaut nach dem Vorbild von …, nicht das Original". They are built by `tools/forms/build.js`
from the definitions beside it (`make forms`), which also renders the pages and writes the reference JSON; the
build needs poppler (`pdftoppm`, `pdftotext`), the app does not.

## The reference JSON

Produced once from the PDF with poppler (`pdftotext -bbox-layout` for words, lines and blocks; the AcroForm widgets
read from the PDF's form dictionary) and the page image rendered with `pdftoppm -r 300`. poppler is a preparation
tool; the app does not need it at runtime.

```
source   path of the PDF
page     page number
kind     "form"
lang     language of the printed form
dpi      300
width, height   pixels of the page image
words[]  { x, y, w, h, t, line, block, ink }   t = the word, line/block = poppler's grouping, ink = box of its ink
images[] raster images on the page
widgets[] { x, y, w, h, typ, name }           typ = text | checkbox | radio | auswahl | unterschrift, name = PDF field name
```

Coordinates are pixels at 300 dpi. The Betreibungsbegehren is a fillable PDF (71 widgets on page 1), the two
rebuilt forms are fillable (92 and 104 widgets); the Suva form is not, so its tests cover words, lines and blocks
only.
