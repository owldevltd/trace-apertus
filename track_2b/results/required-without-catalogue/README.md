# Run: the indispensable places of a page, without a catalogue

The run behind the entry "Can the model name the required places of a form without a catalogue?" in `docs/tests.md`.

- `calls/call-<k>.json` – the 14 calls in the order they were made: per form and model one call per page with asked
  units. The tag is `mark <8B|70B> <form> page <n>`. Each call file is the call as the client logged it: the prompt,
  the model, the temperature, the room for the answer, the duration, the status and the raw answer.
- `result.md` – how many units each model names per form, and how many of them the reference lists.

How it was made: the prompt holds a page of a captured form as a list of lines with the ids of its units and asks
which places have to be filled in for the form to serve its purpose and be accepted: only the indispensable ones, not
what holds in certain cases only, not a free remark, not what the receiving office fills in. No catalogue is in the
prompt. The calls were made in one run together with those of `results/required-bind/`, alternating; here they are
numbered in their own order. The reference and the units of the day are in `results/required-bind/reference.json`.
