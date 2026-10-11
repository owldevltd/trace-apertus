# Tests

What was tested, what was expected, what came out and what was decided: one entry per test, each with the same five
lines. **Run** names the folder that holds the run itself: the prompt, the answers of the model and the evaluation.
Where no run is kept, the line says so, and what the test can be repeated with. Where no expectation was written down
before a run, the entry states the question it was run for instead.

The long record of all measurements is `docs/evidence.md`.

## Speech

### Does one dictation fill every field of the sheet?

- **Expectation:** After one dictation of 30 seconds, each of the 20 fields of the walk-through's sheet holds the value
  set for it beforehand; a field the dictation does not mention stays empty.
- **Test:** One made-up dictation that names 13 of the 20 fields, spoken by two synthetic voices, three runs each on the
  shipped form `austrittsmeldung`; five calls a run, 30 calls.
- **Result:** Voice A: 20 of 20 fields in three of three runs. Voice B: 19 of 20 in three of three, the town heard as
  another word each time. The three tick marks come back as cited and ask for a look in every run. This holds for
  synthetic voices; a person at the microphone was not tested.
- **Finding:** The sheet differs from its model where a first trial put one value into two fields: the surname is named
  as such, there is one telephone field and one statement with a date. A telephone number is written in its usual
  groups by code, whatever groups the model returns.
- **Run:** `results/dictation/`

### Does the model keep the language of a dictation?

- **Question:** Does a clean dictation in German, French or Italian come back in its own language?
- **Test:** One script of 13 facts in the three languages, six synthetic voices (a female and a male one per language),
  with the instruction "do not translate"; then again with the source language stated in the prompt.
- **Result:** German: 13 of 13 facts with both voices. French female 12 of 13, Italian female 11 of 13. The male French
  and Italian voices came back translated into German with invented content (8 and 9 of 13). With "the language is
  Italian, answer in Italian" all six stay in their language (French male 13 of 13).
- **Finding:** The prompt of the transcription names the spoken language explicitly.
- **Run:** not kept in the repository. Repeatable with six recordings of one script of 13 facts and the two
  instructions quoted above.
