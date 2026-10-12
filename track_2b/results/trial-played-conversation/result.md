# Result: a played conversation on the walk-through's form

Two conversations on 9 October 2026 on the Betreibungsbegehren of the walk-through, 14 units with 15 fields: the
questions written once by the small model (swiss-ai/Apertus-v1.5-8B) and once by the large model
(swiss-ai/Apertus-v1.5-70B), everything else done by the small model at temperature 0. 8 calls each, all answered: 1
to write, 4 to check, 1 for the respondent, 2 to read the answers.

Counted again from the answers in `calls/`, against `expected.json`. A field is **same** when the letters and digits
read equal those of the made-up value; "empty, as expected" also where the walk-through marks the value as missing.
Origin is taken by code at the answer of the question alone: literal (the value stands in the answer), derived (every
word of it does), composed (neither).

| questions written by | units | questions that hold | asked with the printed label | calls | same | different | empty, as expected | empty, value expected | value, none expected |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| small model | 14 | 14 | 0 | 8 | 4 | 4 | 6 | 1 | 0 |
| large model | 14 | 11 | 3 | 8 | 5 | 3 | 6 | 1 | 0 |
| said at once on 7 October (`results/fill.md`, 16 fields with the signature) | – | – | – | 12 | 6 | 3 | 5 | 0 | 2 |

## Questions written by the small model

| field | unit | question written | holds in the check | the respondent's answer | expected | read | origin | verdict |
|---|---|---|---|---|---|---|---|---|
| amt | q1 | Um welches Betreibungsamt handelt es sich? | yes | Betreibungsamt Chur | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| schuldner | q2 | Wie heißt der Schuldner und wo wohnt er? | yes | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | same |
| sgeburt | q3 | Wann ist das Geburtsdatum des Schuldners? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| glaeubiger | q4 | Wie heißt der Gläubiger und wo ist er ansässig? | yes | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | same |
| zahlung-g | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | yes | Zahlung aufs Konto | x | – | – | empty, value expected |
| zahlung-v | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | yes | Zahlung aufs Konto | – | – | – | empty, as expected |
| iban | q6 | Welche IBAN wird angegeben? | yes | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal | same |
| vertreter | q7 | Wer vertritt den Gläubiger? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| rueckfragen | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| forderung | q9 | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | yes | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nummer 20 26 strich 118 vom 12. Juni | literal | different |
| betrag | q10 | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | yes | zweitausenddreihundertvierzig Franken fünfzig | 2'340.50 | 2340 Franken 50 | literal | different |
| zins | q11 | Welcher Zinssatz wird verlangt? | yes | fünf Prozent | 5 | 5 Prozent | literal | different |
| zinsseit | q12 | Seit welchem Datum wird Zins verlangt? | yes | dreizehntem Juli | 13.07.2026 | 13.07.2024 | composed | different |
| bemerkung | q13 | Gibt es Bemerkungen zum Abschluss? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| fallreferenz | q14 | Welche Fallreferenz ist vorhanden? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |

## Questions written by the large model

| field | unit | question written | holds in the check | the respondent's answer | expected | read | origin | verdict |
|---|---|---|---|---|---|---|---|---|
| amt | q1 | Wie heißt das Betreibungsamt? | no, asked with the label: Betreibungsamt | Betreibungsamt Chur | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| schuldner | q2 | Wie heißen Sie mit Nachnamen und Vornamen und wo wohnen Sie? | yes | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | same |
| sgeburt | q3 | Wissen Sie Ihr Geburtsdatum? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| glaeubiger | q4 | Wie heißt der Gläubiger mit Nachnamen und Vornamen bzw. Firma und wo ist er ansässig? | yes | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | same |
| zahlung-g | q5 | Wie kann der Gläubiger bezahlt werden? (IBAN, Postkonto, Bankkonto oder anderes) | yes | IBAN CH93 0076 2011 6238 5295 7 | x | – | – | empty, value expected |
| zahlung-v | q5 | Wie kann der Gläubiger bezahlt werden? (IBAN, Postkonto, Bankkonto oder anderes) | yes | IBAN CH93 0076 2011 6238 5295 7 | – | – | – | empty, as expected |
| iban | q6 | Was ist die IBAN-Nummer? | yes | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal | same |
| vertreter | q7 | Wird der Schuldner durch jemanden vertreten? Wenn ja, wie heißt die Person und wo ist sie erreichbar? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| rueckfragen | q8 | Wie kann man Sie für Rückfragen erreichen? (Telefonnummer oder E-Mail-Adresse) | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| forderung | q9 | Was ist der Grund für die Forderung oder wo finde ich die Urkunde mit Datum? | yes | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nummer 20 26 strich 118 vom 12. Juni | literal | different |
| betrag | q10 | Wie hoch ist der geforderte Betrag in Schweizer Franken? | yes | zweitausenddreihundertvierzig Franken fünfzig | 2'340.50 | 2340 Franken 50 | literal | different |
| zins | q11 | Welchen Zinssatz verlangt der Gläubiger in Prozent? | yes | fünf Prozent | 5 | 5 | literal | same |
| zinsseit | q12 | Seit wann läuft der Zins? | no, asked with the label: Zins seit (Datum) | dreizehntem Juli | 13.07.2026 | 13.07.2024 | composed | different |
| bemerkung | q13 | Gibt es noch etwas Wichtiges zu ergänzen? | yes | Das weiss ich nicht. | – | – | – | empty, as expected |
| fallreferenz | q14 | Haben Sie eine Fallnummer, die Sie bereits vom Amt erhalten haben? | no, asked with the label: Ihre Fallreferenz (falls vorhanden) | Das weiss ich nicht. | – | – | – | empty, as expected |

## Seen in the questions

- The debtor: the small model asks "Wie heißt der Schuldner und wo wohnt er?", the large model "Wie heißen Sie mit
  Nachnamen und Vornamen und wo wohnen Sie?" and "Wissen Sie Ihr Geburtsdatum?"; the check lets both hold. The place
  of the creditor's representative the large model asks as "Wird der Schuldner durch jemanden vertreten? …".
- The list of lines of this run holds the section titles and the labels of the walk-through and none of the other text
  of the form.
- Both models write "heißt" with ß.
- The choice of the payment details: the small model names no option ("Welche Zahlungsverbindung wählt der
  Gläubiger?"), the large model four that are not printed ("IBAN, Postkonto, Bankkonto oder anderes"). The respondent
  answers neither with the name of an option, and the tick mark stays empty in both conversations.
