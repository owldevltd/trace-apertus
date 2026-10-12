# Run: the stored German questions translated

The run behind the entry "Do the stored questions still hold when they are translated?" in `docs/tests.md`.

- `questions.json` – the 40 stored German questions that were translated, per form and unit.
- `calls/<language>/call-<k>.json` – every call to the model as the client logged it: the prompt, the model, the
  temperature, the duration, the status and the raw answer, numbered per language in the order they were made (`fr`
  17, `it` 17, `en` 15). Per form: the whole form is translated in one call (`fragen ganz`), then twelve questions per
  call (`fragen zwölf`), then the translation made twelve per call is checked in two runs (`check run <r> page 1`).
  The Betreibungsbegehren comes first, then the Suva form.
- `result.md` – what came back, what holds, and every question with its two translations.

How it was made: the questions stored for the two walk-through forms (`src/app/js/mock/dialogues.js`, as they were on
9 October 2026). The prompt lists the German questions under running numbers and asks for the same question in simple
words in the language, nothing added and nothing left out, names and numbers kept. The check is the one of the
repository (`src/dialogue/checker.js`): the translated questions without their unit, mixed, twelve per call, with the
German list of lines of the form; the rule of `src/dialogue/dialogue.js` decides what holds. The calls were made in
one script with pass 4 of `results/trial-translate-values/`, before it.
