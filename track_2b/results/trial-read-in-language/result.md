# Result: the value read in the language that was spoken

One run on 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 on the two walk-through forms, in French and
in English: a played respondent answers the stored German questions in the language, and every answer to a single
written field is read with one line more in the prompt: the value as it was said, in that language, nothing
translated. 60 calls, all answered: per language 2 for the respondent and 28 to read.

Counted again from the answers in `calls/` with the reading rules of the repository as they were on that day. Origin,
by code at the answer: **literal** when the value stands in the answer as it is (a date in any usual writing of the
same day), word for word when every word of it does, neither otherwise.

| language | calls | answers read | values | literal | word for word | neither | of these written in German unasked | no value |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| French | 30 | 28 | 28 | 24 | 0 | 4 | 1 | 0 |
| English | 30 | 28 | 27 | 22 | 0 | 5 | 0 | 1 |

In German, in the run of `results/trial-other-language/` made before this one: 29 of 32 values literal.

## The values that do not stand in the answer as they are

| language | form | field | question | answer | value read | origin |
|---|---|---|---|---|---|---|
| French | betreibungsbegehren | forderung | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Rechnung Nr. 2026-118 vom 12. Juni | Rechnung Nr. 2026-118 du 12. juin | neither |
| French | suva-bagatellunfall | arbeitgeber | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Logistik Zugersee AG, Werkstrasse zwölf, 6301 Zug | Logistik Zugersee AG, Werkstrasse douze, 6301 Zug | neither |
| French | suva-bagatellunfall | geburt | Wann ist die verletzte Person geboren? | 14 mars 1988 | 14.03.1988 | neither, written in German unasked |
| French | suva-bagatellunfall | strasse | Welche Strasse hat die verletzte Person? | Werkstrasse zwölf | Werkstrasse douze | neither |
| English | betreibungsbegehren | schuldner | Wie heisst der Schuldner und wo wohnt er? | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | Peter Hartmann, Via Nova fourteen, seven thousand thirteen Domat Ems | neither |
| English | betreibungsbegehren | glaeubiger | Wie heisst der Gläubiger und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | Garage Caduff AG, Kasernenstrasse acht, seven thousand Chur | neither |
| English | betreibungsbegehren | zins | Welcher Zinssatz wird verlangt? | fünf Prozent | five percent | neither |
| English | betreibungsbegehren | zinsseit | Seit welchem Datum wird Zins verlangt? | dreizehntem Juli | thirteenth of July | neither |
| English | suva-bagatellunfall | strasse | Welche Strasse hat die verletzte Person? | Werkstrasse zwölf | Werkstrasse twelve | neither |
| English | suva-bagatellunfall | jahr | Welches Jahr war es, als der Unfall passierte? | Year | (jahr: - [p1]) | no value |

## Every answer

| language | form | field | question | answer | value read | origin |
|---|---|---|---|---|---|---|
| French | betreibungsbegehren | amt | Um welches Betreibungsamt handelt es sich? | Betreibungsamt Chur | Betreibungsamt Chur | literal |
| French | betreibungsbegehren | schuldner | Wie heisst der Schuldner und wo wohnt er? | Peter Hartmann, Via Nova 14, 7313 Domat Ems | Peter Hartmann, Via Nova 14, 7313 Domat Ems | literal |
| French | betreibungsbegehren | glaeubiger | Wie heisst der Gläubiger und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal |
| French | betreibungsbegehren | iban | Welche IBAN wird angegeben? | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal |
| French | betreibungsbegehren | forderung | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Rechnung Nr. 2026-118 vom 12. Juni | Rechnung Nr. 2026-118 du 12. juin | neither |
| French | betreibungsbegehren | betrag | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | 2340.50 CHF | 2340.50 CHF | literal |
| French | betreibungsbegehren | zins | Welcher Zinssatz wird verlangt? | 5% | 5% | literal |
| French | betreibungsbegehren | zinsseit | Seit welchem Datum wird Zins verlangt? | 13. Juli | 13. Juli | literal |
| French | suva-bagatellunfall | arbeitgeber | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Logistik Zugersee AG, Werkstrasse zwölf, 6301 Zug | Logistik Zugersee AG, Werkstrasse douze, 6301 Zug | neither |
| French | suva-bagatellunfall | tel | Welche Telefonnummer hat der Arbeitgeber? | 041 728 4010 | 041 728 4010 | literal |
| French | suva-bagatellunfall | arbeitsplatz | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Lager | Lager | literal |
| French | suva-bagatellunfall | name | Wie heissen die verletzte Person? | Sandra Keller | Sandra Keller | literal |
| French | suva-bagatellunfall | geburt | Wann ist die verletzte Person geboren? | 14 mars 1988 | 14.03.1988 | neither, written in German unasked |
| French | suva-bagatellunfall | strasse | Welche Strasse hat die verletzte Person? | Werkstrasse zwölf | Werkstrasse douze | neither |
| French | suva-bagatellunfall | staat | Welche Staatsangehörigkeit hat die verletzte Person? | Suisse | Suisse | literal |
| French | suva-bagatellunfall | zivilstand | Welcher Zivilstand ist bei der verletzten Person? | Ledig | Ledig | literal |
| French | suva-bagatellunfall | anstellung | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Premier février 2019 | Premier février 2019 | literal |
| French | suva-bagatellunfall | beruf | Welchen Beruf übt die verletzte Person aus? | Lagermitarbeiterin | Lagermitarbeiterin | literal |
| French | suva-bagatellunfall | stunden | Wie viele Stunden arbeitet die verletzte Person pro Woche? | 40 | 40 | literal |
| French | suva-bagatellunfall | tag | Tag | Jour | Jour | literal |
| French | suva-bagatellunfall | monat | Welcher Monat war es, als der Unfall passierte? | Mai | Mai | literal |
| French | suva-bagatellunfall | jahr | Welches Jahr war es, als der Unfall passierte? | 2023 | 2023 | literal |
| French | suva-bagatellunfall | zeit | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | 20h10 | 20h10 | literal |
| French | suva-bagatellunfall | ort | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Lager, Werkstrasse | Lager, Werkstrasse | literal |
| French | suva-bagatellunfall | hergang | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Déversement d'une palette, glissée et tombée sur le poignet droit | Déversement d'une palette, glissée et tombée sur le poignet droit | literal |
| French | suva-bagatellunfall | gegenstaende | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Palette | Palette | literal |
| French | suva-bagatellunfall | koerperteil | Welcher Körperteil der verletzten Person ist betroffen? | Poignet droit | Poignet droit | literal |
| French | suva-bagatellunfall | arzt1 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Kantonsspital Zug | Kantonsspital Zug | literal |
| English | betreibungsbegehren | amt | Um welches Betreibungsamt handelt es sich? | Betreibungsamt Chur | Betreibungsamt Chur | literal |
| English | betreibungsbegehren | schuldner | Wie heisst der Schuldner und wo wohnt er? | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | Peter Hartmann, Via Nova fourteen, seven thousand thirteen Domat Ems | neither |
| English | betreibungsbegehren | glaeubiger | Wie heisst der Gläubiger und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | Garage Caduff AG, Kasernenstrasse acht, seven thousand Chur | neither |
| English | betreibungsbegehren | iban | Welche IBAN wird angegeben? | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal |
| English | betreibungsbegehren | forderung | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | literal |
| English | betreibungsbegehren | betrag | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | zweitausenddreihundertvierzig Franken fünfzig | zweitausenddreihundertvierzig Franken fünfzig | literal |
| English | betreibungsbegehren | zins | Welcher Zinssatz wird verlangt? | fünf Prozent | five percent | neither |
| English | betreibungsbegehren | zinsseit | Seit welchem Datum wird Zins verlangt? | dreizehntem Juli | thirteenth of July | neither |
| English | suva-bagatellunfall | arbeitgeber | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Logistik Zugersee AG, Werkstrasse zwölf, 6301 Zug | Logistik Zugersee AG, Werkstrasse zwölf, 6301 Zug | literal |
| English | suva-bagatellunfall | tel | Welche Telefonnummer hat der Arbeitgeber? | 041 728 4010 | 041 728 4010 | literal |
| English | suva-bagatellunfall | arbeitsplatz | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Lager | Lager | literal |
| English | suva-bagatellunfall | name | Wie heissen die verletzte Person? | Sandra Keller | Sandra Keller | literal |
| English | suva-bagatellunfall | geburt | Wann ist die verletzte Person geboren? | 14 March 1988 | 14 March 1988 | literal |
| English | suva-bagatellunfall | strasse | Welche Strasse hat die verletzte Person? | Werkstrasse zwölf | Werkstrasse twelve | neither |
| English | suva-bagatellunfall | staat | Welche Staatsangehörigkeit hat die verletzte Person? | Swiss | Swiss | literal |
| English | suva-bagatellunfall | zivilstand | Welcher Zivilstand ist bei der verletzten Person? | Single | Single | literal |
| English | suva-bagatellunfall | anstellung | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | 1 February 2019 | 1 February 2019 | literal |
| English | suva-bagatellunfall | beruf | Welchen Beruf übt die verletzte Person aus? | Warehouse employee | Warehouse employee | literal |
| English | suva-bagatellunfall | stunden | Wie viele Stunden arbeitet die verletzte Person pro Woche? | 40 | 40 | literal |
| English | suva-bagatellunfall | tag | Tag | Day | Day | literal |
| English | suva-bagatellunfall | monat | Welcher Monat war es, als der Unfall passierte? | Month | Month | literal |
| English | suva-bagatellunfall | jahr | Welches Jahr war es, als der Unfall passierte? | Year | (jahr: - [p1]) | no value |
| English | suva-bagatellunfall | zeit | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | 20:10 | 20:10 | literal |
| English | suva-bagatellunfall | ort | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Werkstrasse twelve, Zug | Werkstrasse twelve, Zug | literal |
| English | suva-bagatellunfall | hergang | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Slipped while unloading a pallet and fell on right wrist | Slipped while unloading a pallet and fell on right wrist | literal |
| English | suva-bagatellunfall | gegenstaende | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Pallet | Pallet | literal |
| English | suva-bagatellunfall | koerperteil | Welcher Körperteil der verletzten Person ist betroffen? | Right wrist | Right wrist | literal |
| English | suva-bagatellunfall | arzt1 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Cantonspital Zug | Cantonspital Zug | literal |
