# Result: a list of entries from a dictation in one go

24 calls on 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, all answered. Six made-up dictations: four
on `betreibungsbegehren` with 0, 1, 2 and 3 further claims beside the claim itself (a list of 9 rows and 4 columns),
two on `arbeitsfaehigkeitszeugnis` with 1 and 2 periods of full incapacity for work (a list of 3 rows and 5 columns).

Three ways of reading the list:

- **cells in bundles of six**: every cell of the list is a field of its own and goes to the model in bundles of six
  with the fill prompt of the app; dictations B0 and B2, six calls each;
- **list alone**: one call for the list, the answer one line per entry with the values split by "|";
- **list alone, other fields named**: one call for the list, the prompt names the values that already stand in other
  fields as not belonging to the list, the answer a block of numbered lines per entry.

Read from the answers in `calls/` and held against `expected.json`. The bundles are read with the rule of the app for
an answer line (`src/fields/filler.js`); the list alone line by line, the values split by "|"; the numbered lines by
the number in front of each. Every value is then written by the kind of its cell (`src/fields/kinds.js`). A cell is
right when it holds the expected value; in the first cell of a claim the expected keyword has to occur; a cell
expected empty is right when it is empty. The second count takes a date as right however it is written ("17. Oktober
2026" for "17.10.2026"). A row holds the claim itself when "3. Mai 2025", the date of its invoice, stands in the first
cell.

| dictation | entries said | way | rows filled | cells right | cells right, any writing of a date | rows filled that should be empty | rows that hold the claim itself | calls |
|---|---:|---|---:|---:|---:|---:|---:|---|
| B0 | 0 | cells in bundles of six | 9 | 0 of 0 | 0 of 0 | 9 | 9 | `bundles-B0/`, 6 |
| B0 | 0 | list alone | 1 | 0 of 0 | 0 of 0 | 1 | 1 | `list-alone/call-1` |
| B0 | 0 | list alone, other fields named | 1 | 0 of 0 | 0 of 0 | 1 | 1 | `list-with-fields-named/call-1` |
| B1 | 1 | list alone | 1 | 0 of 4 | 0 of 4 | 0 | 1 | `list-alone/call-2` |
| B1 | 1 | list alone, other fields named | 1 | 3 of 4 | 3 of 4 | 0 | 0 | `list-with-fields-named/call-2` |
| B2 | 2 | cells in bundles of six | 9 | 1 of 8 | 1 of 8 | 7 | 7 | `bundles-B2/`, 6 |
| B2 | 2 | list alone | 1 | 0 of 8 | 0 of 8 | 0 | 1 | `list-alone/call-3` |
| B2 | 2 | list alone, other fields named | 2 | 6 of 8 | 6 of 8 | 0 | 0 | `list-with-fields-named/call-3` |
| B3 | 3 | list alone | 3 | 0 of 12 | 0 of 12 | 0 | 0 | `list-alone/call-4` |
| B3 | 3 | list alone, other fields named | 3 | 10 of 12 | 10 of 12 | 0 | 0 | `list-with-fields-named/call-4` |
| Z1 | 1 | list alone | 1 | 0 of 5 | 0 of 5 | 0 | – | `list-alone/call-5` |
| Z1 | 1 | list alone, other fields named | 1 | 2 of 5 | 4 of 5 | 0 | – | `list-with-fields-named/call-5` |
| Z2 | 2 | list alone | 2 | 2 of 10 | 2 of 10 | 0 | – | `list-alone/call-6` |
| Z2 | 2 | list alone, other fields named | 1 | 3 of 10 | 4 of 10 | 0 | – | `list-with-fields-named/call-6` |

Summed by way and form:

| way | form | dictations | as many rows filled as entries said | cells right | cells right, any writing of a date |
|---|---|---:|---:|---:|---:|
| cells in bundles of six | betreibungsbegehren | 2 | 0 of 2 | 1 of 8 | 1 of 8 |
| list alone | betreibungsbegehren | 4 | 2 of 4 | 0 of 24 | 0 of 24 |
| list alone, other fields named | betreibungsbegehren | 4 | 3 of 4 | 19 of 24 | 19 of 24 |
| list alone | arbeitsfaehigkeitszeugnis | 2 | 2 of 2 | 2 of 15 | 2 of 15 |
| list alone, other fields named | arbeitsfaehigkeitszeugnis | 2 | 1 of 2 | 5 of 15 | 8 of 15 |

## Every dictation

The values of a row are split by "/"; "–" is an empty cell. The dictations are in `dictations.json`.

### B0, cells in bundles of six

| row | read | expected |
|---:|---|---|
| 1 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 2 | Rechnung vom 3. Mai 2025 / – / 5 / 01.06.2025 | empty |
| 3 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 4 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 5 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 6 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 7 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 8 | Rechnung vom 3. Mai 2025 / – / 5 / 01.06.2025 | empty |
| 9 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |

### B0, list alone

Answer: `[1] Zahlungsaufforderung vom 3. Mai 2025 | 3000 | 5 | 1. Juni 2025`

| row | read | expected |
|---:|---|---|
| 1 | [1] Zahlungsaufforderung vom 3. Mai 2025 / 3000 / 5 / Juni 2025 | empty |

### B0, list alone, other fields named

Answer: `EINTRAG ⏎ 1: Rechnung vom 3. Mai 2025 ⏎ 2: 3000 ⏎ 3: 5 ⏎ 4: 01.06.2025`

| row | read | expected |
|---:|---|---|
| 1 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |

### B1, list alone

Answer: `Rechnung vom 3. Mai 2025 | 3000 | 5 | 1. Juni 2025 | Mahngebühr vom 20. Juni 2025 | 40 | - | -`

| row | read | expected |
|---:|---|---|
| 1 | Rechnung vom 3. Mai 2025 / 3000 / 5 / Juni 2025 | Mahngebühr / 40 / – / – |

### B1, list alone, other fields named

Answer: `EINTRAG ⏎ 1: Mahngebühr ⏎ 2: 40 ⏎ 3: - ⏎ 4: 20.06.2025`

| row | read | expected |
|---:|---|---|
| 1 | Mahngebühr / 40 / – / 20.06.2025 | Mahngebühr / 40 / – / – |

### B2, cells in bundles of six

| row | read | expected |
|---:|---|---|
| 1 | Rechnung vom 3. Mai 2025 über 3000 Franken / 3000 / 5 / 01.06.2025 | Mahngebühr / 40 / – / – |
| 2 | Mahngebühr vom 20. Juni 2025 / 40 / 5 / 01.06.2025 | Miete / 1200 / 5 / 01.08.2025 |
| 3 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.08.2025 | empty |
| 4 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.06.2025 | empty |
| 5 | Mahngebühr vom 20. Juni 2025 / 40 / 5 / 01.06.2025 | empty |
| 6 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.08.2025 | empty |
| 7 | Rechnung vom 3. Mai 2025 über 3000 Franken, Mahngebühr vom 20. Juni 2025 von 40 Franken, Miete für Juli 2025 von 1200 Franken / 3000, 40, 1200 / 5 / 01.06.2025 | empty |
| 8 | Rechnung vom 3. Mai 2025, Mahngebühr vom 20. Juni 2025, Miete für Juli 2025 / 3000, 40, 1200 / 5 / 01.06.2025 | empty |
| 9 | Rechnung vom 3. Mai 2025 / 3000 / 5 / 01.08.2025 | empty |

### B2, list alone

Answer: `Rechnung vom 3. Mai 2025 | 3000 | 5 | 1. Juni 2025 | Mahngebühr vom 20. Juni 2025 | 40 | 5 | 20. Juni 2025 | Miete für Juli 2025 | 1200 | 5 | 1. August 2025`

| row | read | expected |
|---:|---|---|
| 1 | Rechnung vom 3. Mai 2025 / 3000 / 5 / Juni 2025 | Mahngebühr / 40 / – / – |
| 2 | no row | Miete / 1200 / 5 / 01.08.2025 |

### B2, list alone, other fields named

Answer: `EINTRAG ⏎ 1: Mahngebühr vom 20. Juni 2025 ⏎ 2: 40 ⏎ 3: 5 ⏎ 4: 20.06.2025 ⏎  ⏎ EINTRAG ⏎ 1: Miete für Juli 2025 ⏎ 2: 1200 ⏎ 3: 5 ⏎ 4: 01.08.2025`

| row | read | expected |
|---:|---|---|
| 1 | Mahngebühr vom 20. Juni 2025 / 40 / 5 / 20.06.2025 | Mahngebühr / 40 / – / – |
| 2 | Miete für Juli 2025 / 1200 / 5 / 01.08.2025 | Miete / 1200 / 5 / 01.08.2025 |

### B3, list alone

Answer: `Erste Forderung | Mahngebühr | 40 | 5 | 20. Juni 2025 ⏎ Zweite Forderung | Miete Juli 2025 | 1200 | 5 | 1. August 2025 ⏎ Dritte Forderung | Nebenkostenabrechnung 2024 | 350 | 5 | 15. März 2025`

| row | read | expected |
|---:|---|---|
| 1 | Erste Forderung / Mahngebühr / 40 / 5 | Mahngebühr / 40 / – / – |
| 2 | Zweite Forderung / Miete Juli 2025 / 1200 / 5 | Miete / 1200 / 5 / 01.08.2025 |
| 3 | Dritte Forderung / Nebenkostenabrechnung 2024 / 350 / 5 | Nebenkosten / 350 / 5 / 15.03.2025 |

### B3, list alone, other fields named

Answer: `EINTRAG ⏎ 1: Mahngebühr vom 20. Juni 2025 ⏎ 2: 40 ⏎ 3: 5 ⏎ 4: 01.07.2025 ⏎  ⏎ EINTRAG ⏎ 1: Miete für Juli 2025 ⏎ 2: 1200 ⏎ 3: 5 ⏎ 4: 01.08.2025 ⏎  ⏎ EINTRAG ⏎ 1: Nebenkostenabrechnung 2024 ⏎ 2: 350 ⏎ 3: 5 ⏎ 4: 15.03.2025`

| row | read | expected |
|---:|---|---|
| 1 | Mahngebühr vom 20. Juni 2025 / 40 / 5 / 01.07.2025 | Mahngebühr / 40 / – / – |
| 2 | Miete für Juli 2025 / 1200 / 5 / 01.08.2025 | Miete / 1200 / 5 / 01.08.2025 |
| 3 | Nebenkostenabrechnung 2024 / 350 / 5 / 15.03.2025 | Nebenkosten / 350 / 5 / 15.03.2025 |

### Z1, list alone

Answer: `3. Oktober 2026 | Margrit Keller | 3. Oktober 2026 | 17. Oktober 2026 | Visum`

| row | read | expected |
|---:|---|---|
| 1 | Oktober 2026 / Margrit Keller / Oktober 2026 / Oktober 2026 / Visum | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |

### Z1, list alone, other fields named

Answer: `EINTRAG ⏎ 1: 3. Oktober 2026 ⏎ 2: - ⏎ 3: 17. Oktober 2026 ⏎ 4: 17. Oktober 2026 ⏎ 5: -`

| row | read | expected |
|---:|---|---|
| 1 | 03.10.2026 / – / 17. Oktober 2026 / 17. Oktober 2026 / – | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |

### Z2, list alone

Answer: `[1] 3. Oktober 2026 | 3. Oktober 2026 | 17. Oktober 2026 | 17. Oktober 2026 | Visum ⏎ [2] 17. Oktober 2026 | 17. Oktober 2026 | 31. Oktober 2026 | 31. Oktober 2026 | Visum`

| row | read | expected |
|---:|---|---|
| 1 | 03.10.2026 / Oktober 2026 / Oktober 2026 / Oktober 2026 / Visum | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |
| 2 | 17.10.2026 / Oktober 2026 / Oktober 2026 / Oktober 2026 / Visum | 17.10.2026 / 18.10.2026 / 31.10.2026 / 31.10.2026 / – |

### Z2, list alone, other fields named

Answer: `EINTRAG ⏎ 1: 3. Oktober 2026 ⏎ 2: - ⏎ 3: 17. Oktober 2026 ⏎ 4: 31. Oktober 2026 ⏎ 5: -`

| row | read | expected |
|---:|---|---|
| 1 | 03.10.2026 / – / 17. Oktober 2026 / 31. Oktober 2026 / – | 03.10.2026 / 03.10.2026 / 17.10.2026 / 17.10.2026 / – |
| 2 | no row | 17.10.2026 / 18.10.2026 / 31.10.2026 / 31.10.2026 / – |
