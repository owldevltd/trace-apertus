# Result: a field with a list of values, through the server

Three typed answers on 11 October 2026 to the question of one field of the shipped form `schadenmeldung-uvg`, through
the routes the app uses, with swiss-ai/Apertus-v1.5-8B at temperature 0. 4 calls, all answered.

| case | list at the field | typed | value in the field | origin | asks for a look | hints | calls |
|---|---|---|---|---|---|---:|---|
| A | yes | Ich arbeite als Projektleiter im Büro. | Büro | literal | no | 0 | `call-1` |
| B | yes | Ich bin meistens draussen bei den Kunden unterwegs. | Verkauf | chosen | yes | 0 | `call-2` |
| C | no | Ich arbeite als Projektleiter im Büro. | Ich arbeite als Projektleiter im Büro. | entered | no | 0 | `call-3, call-4` |

With the list (cases A and B) one call asks which of the allowed values was said and takes a number back. Where the
value stands in the answer word for word it is literal; where the model names a value the answer does not contain it
is chosen and asks for a look. Without the list (case C) the typed sentence is the value; the two calls are the
judgement against the catalogue of the form and the judgement whether the answer is enough.

In case B the other entry of the list was then tapped in a browser: the field holds "Aussendienst", and the decision
is recorded as changed with "Verkauf" as the value before. Not tried: the list in another language through the app.
