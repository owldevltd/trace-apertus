# Result: a played dialogue sorted back into the fields

Run of 9 October 2026 at temperature 0 on the Betreibungsbegehren of the walk-through, 16 fields, one of them the
signature. For each of the two models: one call writes the questionnaire, then the filling of the repository reads the
played dialogue into the fields, in bundles of six fields. 18 calls were made, 9 per model. The two calls that wrote
the questionnaires are in `calls/`; the 16 calls of the filling were logged with the job, and the job was removed at
the end of the run. The questions and the fields they name are counted again from the two logged calls; what stood in
the fields afterwards is taken from the evaluation written by the run.

A field counts as the same when the value read equals the made-up value set for it, letters and digits compared; the
reference is `values` of the form `betreibungsbegehren` in `src/app/js/mock/forms.js`.

| questionnaire by | questions | fields asked | calls | same | different | empty, expected empty | empty, expected value | value, expected empty |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| swiss-ai/Apertus-v1.5-70B | 10 | 13 of 15 | 9 | 7 | 1 | 6 | 1 | 1 |
| swiss-ai/Apertus-v1.5-8B | 15 | 15 of 15 | 9 | 8 | 0 | 6 | 1 | 1 |

Of the 9 fields with an expected value, 7 and 8 hold it.

## Questionnaire by swiss-ai/Apertus-v1.5-70B

### The dialogue

An answer is built from the made-up values of the fields a question names, as written text; for a radio it is the name
of its option; where no field of the question has a value it is "Dazu habe ich nichts."

| fields named by the question | offer | question | answer |
|---|---|---|---|
| schuldner | – | Wie heissen Sie (Name und Vorname) und wo wohnen Sie (Adresse, PLZ und Ort)? | Peter Hartmann, Via Nova 14, 7013 Domat/Ems |
| sgeburt | – | Falls bekannt: Wann sind Sie geboren (Geburtsdatum)? | Dazu habe ich nichts. |
| amt | – | An welches Betreibungsamt richtet sich dieses Begehren (Name und Adresse des Amtes)? | Betreibungsamt Chur |
| glaeubiger | – | Wer ist der Gläubiger (Name und Vorname bzw. Firma sowie Adresse, PLZ und Ort)? | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur |
| zahlung-g, zahlung-v | – | Wie kann der Gläubiger bezahlt werden? (IBAN und optional Telefon oder E-Mail für Rückfragen) | des Gläubigers |
| vertreter | – | Wird der Gläubiger durch einen Vertreter vertreten? Falls ja, Name und Adresse des Vertreters? | Dazu habe ich nichts. |
| forderung | – | Worum geht es in der Forderung bzw. wo finde ich die Forderungsurkunde mit Datum? | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur |
| betrag, zins, zinsseit | – | Wie hoch ist der Forderungsbetrag in CHF, der Zinssatz in Prozent und seit wann läuft der Zins? | 2'340.50; 5; 13.07.2026 |
| bemerkung | – | Gibt es weitere Bemerkungen oder Informationen, die wir berücksichtigen sollten? | Dazu habe ich nichts. |
| fallreferenz | – | Falls vorhanden: Welche Fallreferenz wurde Ihnen bereits mitgeteilt? | Dazu habe ich nichts. |

### The fields

| field | asked | expected | read | origin | verdict |
|---|---|---|---|---|---|
| amt | yes | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| schuldner | yes | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | literal | same |
| sgeburt | yes | – | – | – | empty, expected empty |
| glaeubiger | yes | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | same |
| zahlung-g | yes | x | – | – | empty, expected value |
| zahlung-v | yes | – | – | – | empty, expected empty |
| iban | no | CH93 0076 2011 6238 5295 7 | des Gläubigers | literal | different |
| vertreter | yes | – | – | – | empty, expected empty |
| rueckfragen | no | – | – | – | empty, expected empty |
| forderung | yes | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | literal | same |
| betrag | yes | 2'340.50 | 2'340.50 | literal | same |
| zins | yes | 5 | 5 | literal | same |
| zinsseit | yes | 13.07.2026 | 13.07.2026 | literal | same |
| bemerkung | yes | – | Reparatur | literal | value, expected empty |
| fallreferenz | yes | – | – | – | empty, expected empty |
| unterschrift | no | – | – | – | empty, expected empty |

## Questionnaire by swiss-ai/Apertus-v1.5-8B

### The dialogue

An answer is built from the made-up values of the fields a question names, as written text; for a radio it is the name
of its option; where no field of the question has a value it is "Dazu habe ich nichts."

| fields named by the question | offer | question | answer |
|---|---|---|---|
| schuldner | – | Wie lautet der Name und die Adresse des Schuldners (inkl. PLZ und Ort)? | Peter Hartmann, Via Nova 14, 7013 Domat/Ems |
| sgeburt | heute | Welches Geburtsdatum des Schuldners ist bekannt? | Dazu habe ich nichts. |
| amt | – | Welches Betreibungsamt wird für die Betreibung zuständig sein? | Betreibungsamt Chur |
| glaeubiger | – | Wie lautet der Name und die Adresse des Gläubigers (inkl. PLZ und Ort)? | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur |
| zahlung-g | – | Welche Zahlungsart (Bankkonto) des Gläubigers soll verwendet werden? | des Gläubigers |
| zahlung-v | – | Welche Zahlungsart (Visa/Mastercard) des Gläubigers soll verwendet werden? | Dazu habe ich nichts. |
| iban | – | Welche IBAN des Gläubigers soll verwendet werden? | CH93 0076 2011 6238 5295 7 |
| vertreter | – | Wer vertritt den Gläubiger (Name und Adresse)? | Dazu habe ich nichts. |
| rueckfragen | – | Welche Telefonnummer oder E-Mail-Adresse für Rückfragen soll angegeben werden? | Dazu habe ich nichts. |
| forderung | – | Welchen Forderungsgrund oder welche Forderungsurkunde mit Datum soll angegeben werden? | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur |
| betrag | – | Welchen Betrag (in CHF) soll gefordert werden? | 2'340.50 |
| zins | – | Welchen Zinssatz (%) soll ab welchem Datum (Datum) gezahlt werden? | 5 |
| zinsseit | – | Ab welchem Datum soll der Zins berechnet werden? | 13.07.2026 |
| bemerkung | – | Gibt es weitere Bemerkungen oder Anmerkungen? | Dazu habe ich nichts. |
| fallreferenz | – | Ist eine Fallreferenz vorhanden? | Dazu habe ich nichts. |

### The fields

| field | asked | expected | read | origin | verdict |
|---|---|---|---|---|---|
| amt | yes | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| schuldner | yes | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | literal | same |
| sgeburt | yes | – | – | – | empty, expected empty |
| glaeubiger | yes | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | same |
| zahlung-g | yes | x | – | – | empty, expected value |
| zahlung-v | yes | – | – | – | empty, expected empty |
| iban | yes | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal | same |
| vertreter | yes | – | – | – | empty, expected empty |
| rueckfragen | yes | – | – | – | empty, expected empty |
| forderung | yes | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | literal | same |
| betrag | yes | 2'340.50 | 2'340.50 | literal | same |
| zins | yes | 5 | 5 | literal | same |
| zinsseit | yes | 13.07.2026 | 13.07.2026 | literal | same |
| bemerkung | yes | – | Reparatur | literal | value, expected empty |
| fallreferenz | yes | – | – | – | empty, expected empty |
| unterschrift | no | – | – | – | empty, expected empty |
