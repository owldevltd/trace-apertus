# Result: one answer with several entries, through the server

Run of 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 through the server, on the shipped form
`betreibungsbegehren`: three typed, made-up answers to the question of the list of further claims. On one job an
answer that names two entries, then an answer that names one more; on a second job the answer "Nein, keine weiteren."
12 calls, all answered with status 200: 3 read the entries of an answer, 6 hold a value against the catalogue of the
form, 3 look for a better passage in what was said. Counted again from the prompts and answers in `calls/`.

## The entries read from each answer

| call | typed | entries the model returned | values per entry, in the order of its lines | fields judged against the catalogue afterwards |
|---|---|---|---|---|
| 1 | Zwei: eine Mahngebühr von 40 Franken vom 20. Juni 2025 und die Miete für Juli 2025, 1200 Franken, mit 5 Prozent Zins seit dem 1. August 2025. | 2 | eine Mahngebühr vom 20. Juni 2025 / 40 / - / -; die Miete für Juli 2025 / 1200 / 5 / 1. August 2025 | f9, f48, f12, f49 |
| 8 | Ja, noch die Nebenkostenabrechnung 2024 über 350 Franken, 5 Prozent seit dem 15. März 2025. | 1 | Nebenkostenabrechnung 2024 / 350 / 5 / 15. März 2025 | f15, f50 |
| 12 | Nein, keine weiteren. | 0 (KEINE) | – | – |

The prompt numbers the columns of the list: 1 Forderungsgrund oder Forderungsurkunde mit Datum, 2 Betrag (CHF), 3 Zins
%, 4 seit (Datum), and asks for a line "Nummer: Wert" per column. The model put words in front of every value instead
of the number: "Grund oder Urkunde mit Datum", "Betrag (CHF)", "Zinssatz in Prozent", "seit (Datum)"; two of these are
the words of the question, not the labels of the columns. The values are taken by the order of the lines in a block.

The fields judged afterwards show the rows the entries went into: f9 and f48 are the ground and the amount of row 1,
f12 and f49 of row 2, f15 and f50 of row 3 (the fields of rows 1 and 2 are named in the prompts of
`results/loop-two-entries/`). The two entries of the first answer went into rows 1 and 2, the entry of the second
answer into row 3. After "Nein, keine weiteren." no value was judged. Noted from the jobs on the day of the run: row 1
"eine Mahngebühr vom 20. Juni 2025", "40"; row 2 "die Miete für Juli 2025", "1200", "5", "01.08.2025"; one entry in
row 3; on the second job the question answered and all rows empty. The jobs of the trial server were not kept, so the
values in the fields cannot be counted again from a file; the date "1. August 2025" of the model stands in the field
as "01.08.2025", written by the kind of the field.

## The values held against the catalogue

| field | label | value | enough | source named | passage suggested |
|---|---|---|---|---|---|
| f9 | Forderungsgrund oder Forderungsurkunde mit Datum | eine Mahngebühr vom 20. Juni 2025 | nein | SchKG Art. 67 Abs. 1 Ziff. 4 | Zwei: eine Mahngebühr von 40 Franken vom 20. Juni 2025 und die Miete für Juli 2025, 1200 Franken, mit 5 Prozent Zins seit dem 1. August 2025. |
| f48 | Betrag (CHF) | 40 | ja | SchKG Art. 67 Abs. 1 Ziff. 3 | – |
| f12 | Forderungsgrund oder Forderungsurkunde mit Datum | die Miete für Juli 2025 | nein | SchKG Art. 67 Abs. 1 Ziff. 4 | Zwei: eine Mahngebühr von 40 Franken vom 20. Juni 2025 und die Miete für Juli 2025, 1200 Franken, mit 5 Prozent Zins seit dem 1. August 2025. |
| f49 | Betrag (CHF) | 1200 | ja | SchKG Art. 67 Abs. 1 Ziff. 3 | – |
| f15 | Forderungsgrund oder Forderungsurkunde mit Datum | Nebenkostenabrechnung 2024 | nein | SchKG Art. 67 Abs. 1 Ziff. 4 | KEINE |
| f50 | Betrag (CHF) | 350 | ja | SchKG Art. 67 Abs. 1 Ziff. 3 | – |
