# Forms

The forms the demo and the tests run on. Each folder holds the PDF, one PNG per page rendered at 300 dpi, and one
JSON per page with the reference the tests measure against.

| Folder | Form | Publisher | Origin | Pages |
|---|---|---|---|---|
| `betreibungsbegehren/` | Betreibungsbegehren, Formular 1 (debt enforcement request) | Betreibungsamt, official form under the SchKG, taken from the Canton of Grisons' download page | original, unchanged | 2 |
| `suva-bagatellunfall/` | Bagatellunfall-Meldung UVG (minor accident report) | Suva | original, unchanged | 4 |

Both are published for anyone to download and fill in; they are included as test material and remain the property
of their publishers. Two further forms (a medical certificate of incapacity and an accident report to a health
insurer) are rebuilt with the same fields and our own layout, marked as such on the form; they follow.

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

Coordinates are pixels at 300 dpi. The Betreibungsbegehren is a fillable PDF (71 widgets on page 1); the Suva form
is not, so its tests cover words, lines and blocks only.
