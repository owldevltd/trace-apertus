# Result: everything said at once, and the rest said after single answers

Three fillings on 9 October 2026 with the code of the repository as it was that afternoon and swiss-ai/Apertus-v1.5-8B
at temperature 0, without a catalogue: the walk-through's Betreibungsbegehren filled from its made-up dictation (the
repository's own test, 10 calls); the walk-through's Suva form filled from its made-up dictation of three pieces (6
calls); and the Betreibungsbegehren with its first four questions answered singly and the dictation for the rest (7
calls).

Of these 23 calls one is in `calls/`: the played respondent of the third filling. The other 22 were made by the
filling itself, which logs into the folder of its job; the trial removed that folder when it had counted. The tables
below are therefore the evaluation the runs wrote, field by field, and the counts are taken again from these tables:
they cannot be counted again from answers of the model.

A field is **same** when the letters and digits of its value equal those of the made-up value; "empty, as expected"
also where the walk-through marks the value as missing. "Asks for a look": the origin is neither literal nor derived.

| filling | fields | calls | same | different | empty, as expected | empty, value expected | value, none expected | asks for a look, of the deviating |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Betreibungsbegehren, said at once, 7 October (`results/fill.md`) | 16 | 12 | 6 | 3 | 5 | 0 | 2 | 2 of 5 |
| Betreibungsbegehren, said at once, 9 October | 16 | 10 | 6 | 3 | 5 | 0 | 2 | 2 of 5 |
| Suva form, said at once | 33 | 6 | 9 | 13 | 9 | 0 | 2 | 9 of 15 |
| Betreibungsbegehren, four questions answered singly, then the dictation | 15 | 7 | 7 | 2 | 4 | 0 | 2 | 3 of 4 |

The Betreibungsbegehren said at once counts 16 fields with the signature, the other two fillings leave the signature
out.

## The Betreibungsbegehren, said at once

| field | expected | state of the expected value | got | origin | asks for a look | verdict |
|---|---|---|---|---|---|---|
| amt | Betreibungsamt Chur | ok | Betreibungsamt Chur | literal | – | same |
| schuldner | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | ok | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | – | same |
| sgeburt | – | missing | – | – | – | empty, as expected |
| glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | ok | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | same |
| zahlung-g | x | unclear | x | cited | yes | same |
| zahlung-v | – | empty | – | – | – | empty, as expected |
| iban | CH93 0076 2011 6238 5295 7 | ok | CH93 0076 2011 6238 5295 7 | literal | – | same |
| vertreter | – | empty | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | value, none expected |
| rueckfragen | – | empty | – | – | – | empty, as expected |
| forderung | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | ok | Rechnung Nr. 20 26 strich 118 vom 12. Juni | cited | yes | different |
| betrag | 2'340.50 | ok | 2340 Franken 50 | literal | – | different |
| zins | 5 | ok | 5 % | literal | – | same |
| zinsseit | 13.07.2026 | ok | 13.07.2023 | cited | yes | different |
| bemerkung | – | empty | Zahlung bitte aufs Konto IBAN CH93 0076 2011 6238 5295 7 | literal | – | value, none expected |
| fallreferenz | – | empty | – | – | – | empty, as expected |
| unterschrift | – | sign | – | – | – | empty, as expected |

## The Suva form, said at once

34 fields with the signature, 33 counted; 3 pieces of dictation.

| field | expected | state of the expected value | got | origin | asks for a look | verdict |
|---|---|---|---|---|---|---|
| arbeitgeber | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | ok | Logistik Zugersee AG, Werkstrasse 12, 6304 Zug | cited | yes | different |
| tel | 041 728 40 10 | ok | 041 728 40 10 | cited | yes | same |
| kunde | – | missing | – | – | – | empty, as expected |
| arbeitsplatz | Lager | ok | Lager | literal | – | same |
| name | Keller Sandra | ok | Sandra Keller | literal | – | different |
| geburt | 14.03.1988 | ok | 14.03.1988 | cited | yes | same |
| ahv | – | missing | – | – | – | empty, as expected |
| strasse | Werkstrasse 12, 6300 Zug | ok | Werkstrasse 12 | literal | – | different |
| staat | Schweiz | ok | Schweizerin | literal | – | different |
| zivilstand | ledig | ok | ledig | literal | – | same |
| anstellung | 01.02.2019 | ok | 01.02.19 | cited | yes | different |
| beruf | Lagermitarbeiterin | ok | Lagermitarbeiterin | literal | – | same |
| st-kader1 | – | empty | – | – | – | empty, as expected |
| st-kader2 | – | empty | – | – | – | empty, as expected |
| st-angestellt | x | unclear | x | cited | yes | same |
| st-lehrling | – | empty | – | – | – | empty, as expected |
| st-praktikant | – | empty | – | – | – | empty, as expected |
| stunden | 40 | ok | 40 | literal | – | same |
| tag | 05 | ok | 14. März | literal | – | different |
| monat | 10 | ok | März | literal | – | different |
| jahr | 2026 | ok | 1988 | cited | yes | different |
| zeit | 14:20 | ok | 20:02 | cited | yes | different |
| ort | Lager, Werkstrasse 12, Zug | ok | Zug, Werkstrasse 12 [p1, p2, p3] | composed | yes | different |
| hergang | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | ok | Sandra Keller rutschte beim Abladen einer Palette aus und stürzte auf das rechte Handgelenk; Erstbehandlung erfolgte im Kantonsspital Zug [p3, p2] | composed | yes | different |
| gegenstaende | Palette | unclear | Palette | literal | – | same |
| koerperteil | Handgelenk | ok | rechtes Handgelenk | cited | yes | different |
| seite-links | – | empty | – | – | – | empty, as expected |
| seite-rechts | x | ok | x | cited | yes | same |
| seite-unbestimmt | – | empty | – | – | – | empty, as expected |
| schaedigung | – | missing | Sturz auf das Handgelenk | cited | yes | value, none expected |
| arzt1 | Kantonsspital Zug, Notfall | ok | Kantonsspital Zug | literal | – | different |
| arzt2 | – | empty | – | – | – | empty, as expected |
| ortdatum | – | empty | Werkstrasse 12, Zug, gestern um 20:02 | cited | yes | value, none expected |

## The Betreibungsbegehren, four questions singly, then the dictation

The respondent's answers to the first four questions (call 1): "Betreibungsamt Chur"; "Peter Hartmann, Via Nova
vierzehn, siebentausenddreizehn Domat Ems"; "Das weiss ich nicht." (the question is ticked off as nothing to enter);
"Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur". Each answer was read for the fields of its question,
then the dictation was read for what was still open. The four fields answered singly (`amt`, `schuldner`, `sgeburt`,
`glaeubiger`) hold the same value before and after the dictation: 4 of 4.

| field | expected | state of the expected value | got | origin | asks for a look | verdict |
|---|---|---|---|---|---|---|
| amt | Betreibungsamt Chur | ok | Betreibungsamt Chur | literal | – | same |
| schuldner | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | ok | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | – | same |
| sgeburt | – | missing | – | entered | – | empty, as expected |
| glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | ok | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | same |
| zahlung-g | x | unclear | x | cited | yes | same |
| zahlung-v | – | empty | – | – | – | empty, as expected |
| iban | CH93 0076 2011 6238 5295 7 | ok | CH93 0076 2011 6238 5295 7 | literal | – | same |
| vertreter | – | empty | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | – | value, none expected |
| rueckfragen | – | empty | – | – | – | empty, as expected |
| forderung | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | ok | Rechnung Nr. 20 26 strich 118 vom 12. Juni für die Reparatur, 2340 Franken 50, 5 Prozent Zins ab 13. Juli | cited | yes | different |
| betrag | 2'340.50 | ok | 2340.50 | derived | – | same |
| zins | 5 | ok | 5 | literal | – | same |
| zinsseit | 13.07.2026 | ok | 13.07.2023 | cited | yes | different |
| bemerkung | – | empty | Betreibungsbegehren ans Betreibungsamt Chur, Gläubigerin Garage Caduff AG, Schuldner Peter Hartmann, Forderung Rechnung Nr. 20 26 strich 118 vom 12.06. [p4,p5,p6] | composed | yes | value, none expected |
| fallreferenz | – | empty | – | – | – | empty, as expected |
