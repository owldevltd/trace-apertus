# Result: every answer read for the fields of its question

The questions and answers of the two played conversations of `results/trial-played-conversation/`, read again on 9
October 2026 with the prompt and the reader of the repository's filling: one call per answered question, with the
fields of that question's unit only. 9 calls per conversation, 18 calls to swiss-ai/Apertus-v1.5-8B at temperature 0,
all answered.

Counted again from the answers in `calls/`, twice: with the lines as the reader takes them, by the name of the field
in front of the colon; and with the rule that a unit with exactly one field takes the values of all lines of the
answer, joined by commas, where no line carries that field's name. A field is **same** when the letters and digits
read equal those of the made-up value in `results/trial-played-conversation/expected.json`. "Asks for a look": the
origin is neither literal nor derived; the last column counts these among the fields that are different or hold a
value where none is expected.

| reading | calls | same | different | empty, as expected | empty, value expected | value, none expected | asks for a look, of the deviating |
|---|---:|---:|---:|---:|---:|---:|---|
| said at once on 7 October (`results/fill.md`, 16 fields with the signature) | 12 | 6 | 3 | 5 | 0 | 2 | 2 of 5 |
| questions of the small model, as the reader takes the lines | 9 | 4 | 4 | 6 | 1 | 0 | 2 of 4 |
| questions of the small model, a unit with one field takes the whole answer (`glaeubiger`) | 9 | 5 | 4 | 6 | 0 | 0 | 2 of 4 |
| questions of the large model, as the reader takes the lines | 9 | 4 | 3 | 6 | 2 | 0 | 1 of 3 |
| questions of the large model, a unit with one field takes the whole answer (`schuldner`, `glaeubiger`) | 9 | 6 | 3 | 6 | 0 | 0 | 1 of 3 |

The free dictation of 7 October counts 16 fields, the signature among them; the conversations count 15.

## Questions of the small model

| field | unit | question asked | answer | the model's lines | expected | read, lines as named | verdict | read, one field takes the whole answer | origin | asks for a look | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| amt | q1 | Um welches Betreibungsamt handelt es sich? | Betreibungsamt Chur | amt: Betreibungsamt Chur [p1] | Betreibungsamt Chur | Betreibungsamt Chur | same | Betreibungsamt Chur | literal | – | same |
| schuldner | q2 | Wie heißt der Schuldner und wo wohnt er? | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | schuldner: Peter Hartmann, Via Nova 14, 7013 Domat Ems [p1] | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat Ems | same | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | – | same |
| sgeburt | q3 | Wann ist das Geburtsdatum des Schuldners? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| glaeubiger | q4 | Wie heißt der Gläubiger und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | gläubiger: Garage Caduff AG, Kasernenstrasse 8, 7000 Chur [p1] | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | – | empty, value expected | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | same |
| zahlung-g | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlung aufs Konto | zahlung-g: ja [p1] ⏎ zahlung-v: - | x | x | same | x | cited | yes | same |
| zahlung-v | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlung aufs Konto | (same call) | – | – | empty, as expected | – | – | – | empty, as expected |
| iban | q6 | Welche IBAN wird angegeben? | CH93 0076 2011 6238 5295 7 | iban: CH93 0076 201 11 6238 5295 7 [p1] | CH93 0076 2011 6238 5295 7 | CH93 0076 201 11 6238 5295 7 | different | CH93 0076 201 11 6238 5295 7 | cited | yes | different |
| vertreter | q7 | Wer vertritt den Gläubiger? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| rueckfragen | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| forderung | q9 | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | forderung: Rechnung Nummer 20 26 strich 118 vom 12. Juni [p1] | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nummer 20 26 strich 118 vom 12. Juni | different | Rechnung Nummer 20 26 strich 118 vom 12. Juni | literal | – | different |
| betrag | q10 | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | zweitausenddreihundertvierzig Franken fünfzig | betrag: 2340 Franken 50 [p1] | 2'340.50 | 2340 Franken 50 | different | 2340 Franken 50 | literal | – | different |
| zins | q11 | Welcher Zinssatz wird verlangt? | fünf Prozent | zins: 5 [p1] | 5 | 5 | same | 5 | literal | – | same |
| zinsseit | q12 | Seit welchem Datum wird Zins verlangt? | dreizehntem Juli | zinsseit: 13.07.2024 [p1] | 13.07.2026 | 13.07.2024 | different | 13.07.2024 | cited | yes | different |
| bemerkung | q13 | Gibt es Bemerkungen zum Abschluss? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| fallreferenz | q14 | Welche Fallreferenz ist vorhanden? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |

## Questions of the large model

| field | unit | question asked | answer | the model's lines | expected | read, lines as named | verdict | read, one field takes the whole answer | origin | asks for a look | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| amt | q1 | Betreibungsamt | Betreibungsamt Chur | amt: Betreibungsamt Chur [p1] | Betreibungsamt Chur | Betreibungsamt Chur | same | Betreibungsamt Chur | literal | – | same |
| schuldner | q2 | Wie heißen Sie mit Nachnamen und Vornamen und wo wohnen Sie? | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | name: Peter Hartmann [p1]   ⏎ adresse: Via Nova 14 [p1]   ⏎ plz_ort: 7013 Domat Ems [p1] | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | – | empty, value expected | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | – | same |
| sgeburt | q3 | Wissen Sie Ihr Geburtsdatum? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| glaeubiger | q4 | Wie heißt der Gläubiger mit Nachnamen und Vornamen bzw. Firma und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | gläubiger: Garage Caduff AG, Kasernenstrasse 8, 7000 Chur [p1] | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | – | empty, value expected | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | same |
| zahlung-g | q5 | Wie kann der Gläubiger bezahlt werden? (IBAN, Postkonto, Bankkonto oder anderes) | IBAN CH93 0076 2011 6238 5295 7 | zahlung-g: ja [p1] ⏎ zahlung-v: - | x | x | same | x | cited | yes | same |
| zahlung-v | q5 | Wie kann der Gläubiger bezahlt werden? (IBAN, Postkonto, Bankkonto oder anderes) | IBAN CH93 0076 2011 6238 5295 7 | (same call) | – | – | empty, as expected | – | – | – | empty, as expected |
| iban | q6 | Was ist die IBAN-Nummer? | CH93 0076 2011 6238 5295 7 | iban: CH93 0076 2011 6238 5295 7 [p1] | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | same | CH93 0076 2011 6238 5295 7 | literal | – | same |
| vertreter | q7 | Wird der Schuldner durch jemanden vertreten? Wenn ja, wie heißt die Person und wo ist sie erreichbar? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| rueckfragen | q8 | Wie kann man Sie für Rückfragen erreichen? (Telefonnummer oder E-Mail-Adresse) | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| forderung | q9 | Was ist der Grund für die Forderung oder wo finde ich die Urkunde mit Datum? | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | forderung: Rechnung Nummer 20 26 strich 118 vom 12. Juni [p1] | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nummer 20 26 strich 118 vom 12. Juni | different | Rechnung Nummer 20 26 strich 118 vom 12. Juni | literal | – | different |
| betrag | q10 | Wie hoch ist der geforderte Betrag in Schweizer Franken? | zweitausenddreihundertvierzig Franken fünfzig | betrag: 2340 Franken 50 [p1] | 2'340.50 | 2340 Franken 50 | different | 2340 Franken 50 | literal | – | different |
| zins | q11 | Welchen Zinssatz verlangt der Gläubiger in Prozent? | fünf Prozent | zins: 5 [p1] | 5 | 5 | same | 5 | literal | – | same |
| zinsseit | q12 | Zins seit (Datum) | dreizehntem Juli | zinsseit: 13.07.2024 [p1] | 13.07.2026 | 13.07.2024 | different | 13.07.2024 | cited | yes | different |
| bemerkung | q13 | Gibt es noch etwas Wichtiges zu ergänzen? | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
| fallreferenz | q14 | Ihre Fallreferenz (falls vorhanden) | Das weiss ich nicht. | – | – | – | empty, as expected | – | – | – | empty, as expected |
