# Result: one answer to a list, one entry or several

7 calls on 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, all answered, one call per answer. Seven
made-up answers to the question of a list: five on `betreibungsbegehren` (further claims, 4 columns) with 0, 1, 1, 2
and 3 entries, two on `arbeitsfaehigkeitszeugnis` (periods of full incapacity for work, 5 columns) with 1 and 2
entries.

Read from the answers in `calls/run-1/`, held against `expected.json`: a block per entry begins with the word EINTRAG,
and the lines below it are the columns in their order, whatever stands in front of the colon; a value is written by
the kind of its cell (`src/fields/kinds.js`). A cell is right when it holds the expected value, a date however it is
written; in the first cell of a claim the expected keyword has to occur; a cell expected empty is right when it is
empty. Three columns count the lines of values by what the model put in front of the colon; the last column is the
number of entries when a line counts only with the number of its column in front.

| answer | call | entries said | entries read | cells right | in front: number of the column | in front: label of the column | in front: other words | entries read by the number alone |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| B0 | 1 | 0 | 0 | 0 of 0 | 0 | 0 | 0 | 0 |
| B1 | 2 | 1 | 1 | 4 of 4 | 0 | 4 | 0 | 0 |
| B1b | 3 | 1 | 1 | 4 of 4 | 0 | 2 | 2 | 0 |
| B2 | 4 | 2 | 2 | 8 of 8 | 0 | 4 | 4 | 0 |
| B3 | 5 | 3 | 3 | 12 of 12 | 12 | 0 | 0 | 3 |
| Z1 | 6 | 1 | 1 | 4 of 5 | 5 | 0 | 0 | 1 |
| Z2 | 7 | 2 | 2 | 10 of 10 | 10 | 0 | 0 | 2 |

The number of entries is right for 7 of 7 answers; 42 of 43 cells are right. Read by the number in front of a line
alone, as the prompt asks for it ("Nummer: Wert"), the number of entries is right for 4 of 7 answers.

## Every answer

The values of an entry are split by "/"; "–" is an empty cell.

### B0

Said: Nein, keine.

Answer of the model: `KEINE`

No entry read, none expected.

### B1

Said: Eine Mahngebühr von 40 Franken vom 20. Juni 2025.

Answer of the model: `EINTRAG ⏎ Forderungsgrund oder Forderungsurkunde mit Datum: Eine Mahngebühr vom 20. Juni 2025 ⏎ Betrag (CHF): 40 ⏎ Zins %: - ⏎ seit (Datum): -`

| entry | read | expected |
|---:|---|---|
| 1 | Eine Mahngebühr vom 20. Juni 2025 / 40 / – / – | Mahngebühr / 40 / – / – |

### B1b

Said: Die Miete für Juli 2025, das sind 1200 Franken, und dazu kommen 5 Prozent Zins seit dem 1. August 2025.

Answer of the model: `EINTRAG ⏎ Grund oder Urkunde mit Datum: Die Miete für Juli 2025 ⏎ Betrag (CHF): 1200 ⏎ Zinssatz in Prozent: 5 ⏎ seit (Datum): 1. August 2025`

| entry | read | expected |
|---:|---|---|
| 1 | Die Miete für Juli 2025 / 1200 / 5 / 01.08.2025 | Miete / 1200 / 5 / 01.08.2025 |

### B2

Said: Zwei: eine Mahngebühr von 40 Franken vom 20. Juni 2025 und die Miete für Juli 2025, 1200 Franken, mit 5 Prozent Zins seit dem 1. August 2025.

Answer of the model: `EINTRAG ⏎ Grund oder Urkunde mit Datum: eine Mahngebühr vom 20. Juni 2025 ⏎ Betrag (CHF): 40 ⏎ Zinssatz in Prozent: - ⏎ seit (Datum): - ⏎  ⏎ EINTRAG ⏎ Grund oder Urkunde mit Datum: die Miete für Juli 2025 ⏎ Betrag (CHF): 1200 ⏎ Zinssatz in Prozent: 5 ⏎ seit (Datum): 1. August 2025`

| entry | read | expected |
|---:|---|---|
| 1 | eine Mahngebühr vom 20. Juni 2025 / 40 / – / – | Mahngebühr / 40 / – / – |
| 2 | die Miete für Juli 2025 / 1200 / 5 / 01.08.2025 | Miete / 1200 / 5 / 01.08.2025 |

### B3

Said: Erstens eine Mahngebühr von 40 Franken. Zweitens die Miete für Juli 2025, 1200 Franken, 5 Prozent Zins seit dem 1. August 2025. Drittens die Nebenkostenabrechnung 2024 über 350 Franken, 5 Prozent seit dem 15. März 2025.

Answer of the model: `EINTRAG ⏎ 1: Erstens eine Mahngebühr ⏎ 2: 40 ⏎ 3: - ⏎ 4: - ⏎  ⏎ EINTRAG ⏎ 1: Zweitens die Miete für Juli 2025 ⏎ 2: 1200 ⏎ 3: 5 ⏎ 4: 1. August 2025 ⏎  ⏎ EINTRAG ⏎ 1: Drittens die Nebenkostenabrechnung 2024 ⏎ 2: 350 ⏎ 3: 5 ⏎ 4: 15. März 2025`

| entry | read | expected |
|---:|---|---|
| 1 | Erstens eine Mahngebühr / 40 / – / – | Mahngebühr / 40 / – / – |
| 2 | Zweitens die Miete für Juli 2025 / 1200 / 5 / 01.08.2025 | Miete / 1200 / 5 / 01.08.2025 |
| 3 | Drittens die Nebenkostenabrechnung 2024 / 350 / 5 / 15.03.2025 | Nebenkosten / 350 / 5 / 15.03.2025 |

### Z1

Said: Konsultation am 3. Oktober 2026, voll arbeitsunfähig vom 3. Oktober 2026 bis zum 17. Oktober 2026, nächste Konsultation am 17. Oktober 2026.

Answer of the model: `EINTRAG ⏎ 1: 3. Oktober 2026 ⏎ 2: voll arbeitsunfähig ⏎ 3: 17. Oktober 2026 ⏎ 4: 17. Oktober 2026 ⏎ 5: -`

| entry | read | expected |
|---:|---|---|
| 1 | 03.10.2026 / voll arbeitsunfähig / 17. Oktober 2026 / 17. Oktober 2026 / – | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |

### Z2

Said: Bei der Konsultation am 3. Oktober 2026: voll arbeitsunfähig vom 3. Oktober 2026 bis zum 17. Oktober 2026, nächste Konsultation am 17. Oktober 2026. Bei der Konsultation am 17. Oktober 2026 verlängert: vom 18. Oktober 2026 bis zum 31. Oktober 2026, nächste Konsultation am 31. Oktober 2026.

Answer of the model: `EINTRAG ⏎ 1: 3. Oktober 2026 ⏎ 2: 3. Oktober 2026 ⏎ 3: 17. Oktober 2026 ⏎ 4: 17. Oktober 2026 ⏎ 5: - ⏎ EINTRAG ⏎ 1: 17. Oktober 2026 ⏎ 2: 18. Oktober 2026 ⏎ 3: 31. Oktober 2026 ⏎ 4: 31. Oktober 2026 ⏎ 5: -`

| entry | read | expected |
|---:|---|---|
| 1 | 03.10.2026 / 3. Oktober 2026 / 17. Oktober 2026 / 17. Oktober 2026 / – | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |
| 2 | 17.10.2026 / 18. Oktober 2026 / 31. Oktober 2026 / 31. Oktober 2026 / – | 17.10.2026 / 18.10.2026 / 31.10.2026 / 31.10.2026 / – |
