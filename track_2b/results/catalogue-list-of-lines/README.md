# Run: questions written and checked over the list of lines

The run behind the entry "Does a check over the list of lines hold, and what does it let through?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 52 calls in the order they were made, form by form (`arbeitsfaehigkeitszeugnis` 7,
  `betreibungsbegehren` 7, `schadenmeldung-uvg` 17, `suva-bagatellunfall` 21). A call tagged `linear schreiben <form>`
  writes the questions of a form; the calls tagged `linear prüfen <form> Lauf <r>` are the two runs of the check, up
  to twelve questions of a page per call. Each call file is the call as the client logged it: the prompt, the model,
  the temperature, the room for the answer, the duration, the status and the raw answer.
- `result.md` – what holds, what the check lets through when a place is handed another place's question, what it does
  not see, and every question.

How it was made: the form goes to the model as a list of lines instead of a picture of text: every printed text a line
in the order of the page, none left out; behind the text the code found as the label of a place stands the id of its
unit (`Schaden-Nummer  → [q3]`, `[q5: Auswahl]`, `[q8: Tabelle mit 9 Zeilen und 3 Spalten]`); a place without a label
stands on a line of its own. The prompt for writing is the one of `results/catalogue-interviewer-seat/` with two rules
more: the other person is unknown, so a place about a certain person or party is asked about in the third person; and
where there is nothing to ask the question is the word KEINE. For the check the questions of a page are mixed in a
fixed order that differs per run and lettered A to L; the model returns the id of the unit for each letter. The units
are those of `results/catalogue-units/units.json`. In `result.md` the unit behind a letter is found by rebuilding the
mixing; the rebuilt order is held against the questions in each prompt.
