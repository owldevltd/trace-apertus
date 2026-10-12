# Result: how many runs of the check

Four runs of the check on 9 October 2026 over one questionnaire of 256 questions, the second writing of the small
model over the whole form (swiss-ai/Apertus-v1.5-8B, temperature 0). 100 calls, all answered, 111 seconds at the
model.

Counted again from the answers in `calls/`, with the first run alone, the first two, the first three and all four. A
question **holds** when every run counted names its own unit. A neighbour's question **passes** when every run counted
named, for the question of the unit before or after on the page, exactly this unit; another place's question is the
same count over twenty fixed mixings of the page.

| runs counted | questions | holds | runs disagree | all the same other unit | a neighbour's question passes | of these with the same wording | with other wording | another place's question passes |
|---:|---:|---:|---:|---:|---|---:|---:|---|
| 1 | 256 | 181 | 3 | 72 | 28 of 496 | 8 | 20 | 50 of 4 946 |
| 2 | 256 | 174 | 39 | 43 | 16 of 496 | 5 | 11 | 32 of 4 946 |
| 3 | 256 | 164 | 53 | 39 | 14 of 496 | 4 | 10 | 29 of 4 946 |
| 4 | 256 | 154 | 70 | 32 | 14 of 496 | 4 | 10 | 23 of 4 946 |

| run | calls | seconds at the model |
|---:|---:|---:|
| 1 | 25 | 28 |
| 2 | 25 | 28 |
| 3 | 25 | 27 |
| 4 | 25 | 28 |
