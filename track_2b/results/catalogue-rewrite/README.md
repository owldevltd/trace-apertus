# Run: a second pass that only rewrites the questions

The run behind the entry "Does a second pass that only rewrites make the questions plainer?" in `docs/tests.md`.

- `calls/in-one-piece/call-<k>.json` – one call per form: all questions of the form with their ids, and the
  instruction to rewrite each in everyday language with the same content. Tag `umschreiben <form>`.
- `calls/bundles-of-twelve/call-<k>.json` – the same instruction with twelve questions per call; the tag names the
  form and the first unit of the bundle. 3, 2, 8 and 10 calls for the four forms.
- `result.md` – how many questions came back and how many unchanged, the language before and after, and every question
  in its three versions.

Each call file is the call as the client logged it: the prompt, the model, the temperature, the room for the answer,
the duration, the status and the raw answer.

How it was made: the questions are those of the run with the labels in `results/catalogue-plain-questions/`. The model
sees the questions and their ids, not the form. It is asked for simple words and short sentences, no abbreviations,
brackets or slashes, a direct question instead of an impersonal one, and the same content: nothing else asked, nothing
left out, the options of a choice the same.
