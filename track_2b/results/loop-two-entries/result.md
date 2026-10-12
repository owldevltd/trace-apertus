# Result: two answers to a list of entries, one after the other

Run of 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 through the server, on the shipped form
`betreibungsbegehren` as it was set right that day: two typed, made-up answers to the question of the list of further
claims (9 rows of 4 columns), one after the other. 8 calls, all answered with status 200: 2 read an answer into the
fields of a row, 4 hold a value against the catalogue of the form, 2 look for a better passage in what was said.
Counted again from the prompts and answers in `calls/`.

## What each answer was read into

The prompt of a call names the fields of one row only, and only the piece of the transcript that holds the answer.

| answer | typed | piece | fields named in the prompt | what the model returned |
|---|---|---|---|---|
| 1 | Eine Rechnung vom 3. Mai 2025 über 500 Franken, dazu 5 Prozent Zins seit dem 1. Juni 2025. | [p1] | f9 Forderungsgrund oder Forderungsurkunde mit Datum; f48 Betrag (CHF); f10 Zins %; f11 seit (Datum) | f9: Eine Rechnung vom 3. Mai 2025; f48: 500; f10: 5; f11: 01.06.2025 |
| 2 | Die Miete für Juni, 1200 Franken, ohne Zins. | [p2] | f12 Forderungsgrund oder Forderungsurkunde mit Datum; f49 Betrag (CHF); f13 Zins %; f14 seit (Datum) | f12: Die Miete für Juni; f49: 1200; f13: -; f14: - |

The first answer went into the fields f9, f48, f10 and f11, the second into f12, f49, f13 and f14: the next row. The
second call does not name the fields of the first row and does not hold the first answer. A dash is a field nothing
was said for. Noted from the job on the day of the run: row 1 "Eine Rechnung vom 3. Mai 2025", "500", "5",
"01.06.2025", each value literal; row 2 "Die Miete für Juni", "1200", interest and date empty; the two pieces of the
transcript carry row 1 and row 2. The job of the trial server was not kept, `conversation-two-entries.png` shows it in
the app.

## The values held against the catalogue

After each answer the values with an entry in the catalogue of the form are judged (`ja`, `nein`, `unklar`), and where
a value is not enough a passage of what was said is looked for.

| field | label | value | enough | source named | passage suggested |
|---|---|---|---|---|---|
| f9 | Forderungsgrund oder Forderungsurkunde mit Datum | Eine Rechnung vom 3. Mai 2025 | unklar | SchKG Art. 67 Abs. 1 Ziff. 4 | Eine Rechnung vom 3. Mai 2025 über 500 Franken, dazu 5 Prozent Zins seit dem 1. Juni 2025. |
| f48 | Betrag (CHF) | 500 | ja | SchKG Art. 67 Abs. 1 Ziff. 3 | – |
| f12 | Forderungsgrund oder Forderungsurkunde mit Datum | Die Miete für Juni | nein | SchKG Art. 67 Abs. 1 Ziff. 4 | Die Miete für Juni, 1200 Franken, ohne Zins. |
| f49 | Betrag (CHF) | 1200 | ja | SchKG Art. 67 Abs. 1 Ziff. 3 | – |

## In the browser, without a model

The same list in the conversation of the app, served without a key, no call:

- `one-entry-asked-for-more.png` – after one entry: the question of the list, the four values as "… · Eintrag 1", no
  empty row below, and "Noch ein Eintrag?" with "Ja" and "Nein, das war alles".
- `asked-for-more.png` – that line alone.
- `after-yes.png` – after "Ja": the place to answer with "Sag einen Eintrag; weitere kannst du danach hinzufügen."
- `conversation-two-entries.png` – the job of the run with the model: entries 1 and 2, the two grounds marked "unklar"
  with the hint of the catalogue and the suggested passage, rows 3 to 9 not shown.
