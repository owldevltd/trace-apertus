# Result: can the model tell when a place is answered?

98 judgements and 31 repeated ones on 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0: 129 calls, all
answered. A call is one judgement: the question, the printed label with its kind and an answer go in, and the model
returns `ja` (everything the place asks for was said), `unvollständig` (something fitting was said, a part is missing)
or `nein` (nothing fitting was said), and what is missing.

Counted again from the answers in `calls/`, against the verdict `cases.json` sets for each case.

| answer given | verdict expected | cases | `ja` | `unvollständig` | `nein` | no verdict that can be read |
|---|---|---:|---:|---:|---:|---:|
| the value itself | ja | 31 | 29 | 2 | 0 | 0 |
| "Das weiss ich nicht." | nein | 31 | 0 | 27 | 4 | 0 |
| the value of the next unit | not ja | 31 | 8 | 15 | 8 | 0 |
| only the first part of the value | not ja | 5 | 1 | 4 | 0 | 0 |

- The 31 full answers judged a second time (calls 99 to 129): the same verdict in 31 of 31.
- Read as a gate, `ja` or not `ja`: 29 of 31 full answers taken, 31 of 31 "Das weiss ich nicht." held back, 23 of 31
  values of the next unit held back, 4 of 5 shortened answers held back.
- Without the model, "not empty and not 'weiss ich nicht'": every full answer, every value of the next unit and every
  shortened answer counts as answered.
- Duration of a call as the client logged it: median 252 ms, longest 826 ms. The client waits two seconds before every
  call and twenty seconds before the 51st and the 101st; those waits are not in the durations.

"Only the first part of the value" is an assumption and no reference: it is built where the label names several things
(a semicolon, " und " or " mit ") and the value has a comma.

## The cases on the other side of `ja` than expected

A full answer that was not judged `ja`, and an answer expected not to be `ja` that was. ("Das weiss ich nicht." is
expected `nein` and was judged `unvollständig` in 27 of 31 cases; these are in the table of every case.)

| call | form | unit | answer given | question | printed label | kind | answer | expected | verdict | what is missing | second verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | betreibungsbegehren | q1 | the value of the next unit | Um welches Betreibungsamt handelt es sich? | Betreibungsamt | Text, mehrere Angaben möglich | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | not ja | ja | – | – |
| 6 | betreibungsbegehren | q2 | the value of the next unit | Wie heisst der Schuldner und wo wohnt er? | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | not ja | ja | – | – |
| 14 | betreibungsbegehren | q5 | the value of the next unit | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Auswahl | CH93 0076 2011 6238 5295 7 | not ja | ja | – | – |
| 21 | betreibungsbegehren | q9 | only the first part of the value | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Forderungsgrund oder Forderungsurkunde mit Datum | Text, mehrere Angaben möglich | Rechnung Nr. 2026-118 vom 12.06.2026 | not ja | ja | – | – |
| 61 | suva-bagatellunfall | q12 | the value of the next unit | Welchen Beruf übt die verletzte Person aus? | Ausgeübter Beruf | Text | Angestellte/r / Arbeiter/in | not ja | ja | – | – |
| 62 | suva-bagatellunfall | q13 | the value itself | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | Auswahl | Angestellte/r / Arbeiter/in | ja | unvollständig | Präzisierung der Wahl zwischen Angestellte/r und Arbeiter/in | unvollständig |
| 67 | suva-bagatellunfall | q14 | the value of the next unit | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Arbeitszeit des/der Verletzten: Stunden je Woche | Text | 05 | not ja | ja | – | – |
| 70 | suva-bagatellunfall | q15 | the value of the next unit | Tag | Tag | Text | 10 | not ja | ja | – | – |
| 87 | suva-bagatellunfall | q21 | the value itself | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Text | Palette | ja | unvollständig | genaue Bezeichnung des Gegenstands | unvollständig |
| 92 | suva-bagatellunfall | q22 | the value of the next unit | Welcher Körperteil der verletzten Person ist betroffen? | Betroffener Körperteil | Text | rechts | not ja | ja | – | – |
| 98 | suva-bagatellunfall | q25 | the value of the next unit | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Erstbehandelnder Arzt bzw. Spital/Klinik | Text, mehrere Angaben möglich | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | not ja | ja | – | – |

## Every case

| call | form | unit | answer given | question | printed label | kind | answer | expected | verdict | what is missing | second verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | betreibungsbegehren | q1 | the value itself | Um welches Betreibungsamt handelt es sich? | Betreibungsamt | Text, mehrere Angaben möglich | Betreibungsamt Chur | ja | ja | – | ja |
| 2 | betreibungsbegehren | q1 | "Das weiss ich nicht." | Um welches Betreibungsamt handelt es sich? | Betreibungsamt | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | unvollständig | der Name des Betreibungsamts | – |
| 3 | betreibungsbegehren | q1 | the value of the next unit | Um welches Betreibungsamt handelt es sich? | Betreibungsamt | Text, mehrere Angaben möglich | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | not ja | ja | – | – |
| 4 | betreibungsbegehren | q2 | the value itself | Wie heisst der Schuldner und wo wohnt er? | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | ja | ja | – | ja |
| 5 | betreibungsbegehren | q2 | "Das weiss ich nicht." | Wie heisst der Schuldner und wo wohnt er? | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | nein | Name, Vorname bzw. Firma, Adresse, PLZ Ort | – |
| 6 | betreibungsbegehren | q2 | the value of the next unit | Wie heisst der Schuldner und wo wohnt er? | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | not ja | ja | – | – |
| 7 | betreibungsbegehren | q2 | only the first part of the value | Wie heisst der Schuldner und wo wohnt er? | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Peter Hartmann | not ja | unvollständig | Adresse; PLZ Ort | – |
| 8 | betreibungsbegehren | q4 | the value itself | Wie heisst der Gläubiger und wo ist er ansässig? | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | ja | ja | – | ja |
| 9 | betreibungsbegehren | q4 | "Das weiss ich nicht." | Wie heisst der Gläubiger und wo ist er ansässig? | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | nein | Name und Vorname bzw. Firma, Adresse, PLZ Ort | – |
| 10 | betreibungsbegehren | q4 | the value of the next unit | Wie heisst der Gläubiger und wo ist er ansässig? | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | des Gläubigers | not ja | unvollständig | Name und Vorname bzw. Firma; Adresse; PLZ Ort | – |
| 11 | betreibungsbegehren | q4 | only the first part of the value | Wie heisst der Gläubiger und wo ist er ansässig? | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Text, mehrere Angaben möglich | Garage Caduff AG | not ja | unvollständig | Adresse; PLZ Ort | – |
| 12 | betreibungsbegehren | q5 | the value itself | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Auswahl | des Gläubigers | ja | ja | – | ja |
| 13 | betreibungsbegehren | q5 | "Das weiss ich nicht." | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Auswahl | Das weiss ich nicht. | nein | unvollständig | die Zahlungsverbindung | – |
| 14 | betreibungsbegehren | q5 | the value of the next unit | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Auswahl | CH93 0076 2011 6238 5295 7 | not ja | ja | – | – |
| 15 | betreibungsbegehren | q6 | the value itself | Welche IBAN wird angegeben? | IBAN | Text | CH93 0076 2011 6238 5295 7 | ja | ja | – | ja |
| 16 | betreibungsbegehren | q6 | "Das weiss ich nicht." | Welche IBAN wird angegeben? | IBAN | Text | Das weiss ich nicht. | nein | nein | die IBAN | – |
| 17 | betreibungsbegehren | q6 | the value of the next unit | Welche IBAN wird angegeben? | IBAN | Text | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | not ja | unvollständig | IBAN-Format | – |
| 18 | betreibungsbegehren | q9 | the value itself | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Forderungsgrund oder Forderungsurkunde mit Datum | Text, mehrere Angaben möglich | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | ja | ja | – | ja |
| 19 | betreibungsbegehren | q9 | "Das weiss ich nicht." | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Forderungsgrund oder Forderungsurkunde mit Datum | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | unvollständig | konkrete Angabe zum Forderungsgrund oder zur Forderungsurkunde mit Datum | – |
| 20 | betreibungsbegehren | q9 | the value of the next unit | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Forderungsgrund oder Forderungsurkunde mit Datum | Text, mehrere Angaben möglich | 2'340.50 | not ja | unvollständig | Forderungsgrund oder Forderungsurkunde mit Datum (Text, mehrere Angaben möglich) | – |
| 21 | betreibungsbegehren | q9 | only the first part of the value | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Forderungsgrund oder Forderungsurkunde mit Datum | Text, mehrere Angaben möglich | Rechnung Nr. 2026-118 vom 12.06.2026 | not ja | ja | – | – |
| 22 | betreibungsbegehren | q10 | the value itself | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | Betrag (CHF) | Text | 2'340.50 | ja | ja | – | ja |
| 23 | betreibungsbegehren | q10 | "Das weiss ich nicht." | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | Betrag (CHF) | Text | Das weiss ich nicht. | nein | unvollständig | der Betrag in CHF | – |
| 24 | betreibungsbegehren | q10 | the value of the next unit | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | Betrag (CHF) | Text | 5 | not ja | unvollständig | Währungssymbol (CHF) wurde nicht angegeben | – |
| 25 | betreibungsbegehren | q11 | the value itself | Welcher Zinssatz wird verlangt? | Zins % | Text | 5 | ja | ja | – | ja |
| 26 | betreibungsbegehren | q11 | "Das weiss ich nicht." | Welcher Zinssatz wird verlangt? | Zins % | Text | Das weiss ich nicht. | nein | unvollständig | der konkrete Zinssatz | – |
| 27 | betreibungsbegehren | q11 | the value of the next unit | Welcher Zinssatz wird verlangt? | Zins % | Text | 13.07.2026 | not ja | nein | Zinssatz | – |
| 28 | betreibungsbegehren | q12 | the value itself | Seit welchem Datum wird Zins verlangt? | Zins seit (Datum) | Datum | 13.07.2026 | ja | ja | – | ja |
| 29 | betreibungsbegehren | q12 | "Das weiss ich nicht." | Seit welchem Datum wird Zins verlangt? | Zins seit (Datum) | Datum | Das weiss ich nicht. | nein | unvollständig | Datum | – |
| 30 | betreibungsbegehren | q12 | the value of the next unit | Seit welchem Datum wird Zins verlangt? | Zins seit (Datum) | Datum | Betreibungsamt Chur | not ja | nein | Datum | – |
| 31 | suva-bagatellunfall | q1 | the value itself | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Name und Adresse mit Postleitzahl | Text, mehrere Angaben möglich | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | ja | ja | – | ja |
| 32 | suva-bagatellunfall | q1 | "Das weiss ich nicht." | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Name und Adresse mit Postleitzahl | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | unvollständig | Name und Adresse mit Postleitzahl | – |
| 33 | suva-bagatellunfall | q1 | the value of the next unit | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Name und Adresse mit Postleitzahl | Text, mehrere Angaben möglich | 041 728 40 10 | not ja | unvollständig | Name des Arbeitgebers | – |
| 34 | suva-bagatellunfall | q1 | only the first part of the value | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Name und Adresse mit Postleitzahl | Text, mehrere Angaben möglich | Logistik Zugersee AG | not ja | unvollständig | Postleitzahl | – |
| 35 | suva-bagatellunfall | q2 | the value itself | Welche Telefonnummer hat der Arbeitgeber? | Tel.-Nr. | Text | 041 728 40 10 | ja | ja | – | ja |
| 36 | suva-bagatellunfall | q2 | "Das weiss ich nicht." | Welche Telefonnummer hat der Arbeitgeber? | Tel.-Nr. | Text | Das weiss ich nicht. | nein | unvollständig | die Telefonnummer | – |
| 37 | suva-bagatellunfall | q2 | the value of the next unit | Welche Telefonnummer hat der Arbeitgeber? | Tel.-Nr. | Text | Lager | not ja | unvollständig | Telefonnummer | – |
| 38 | suva-bagatellunfall | q4 | the value itself | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Text | Lager | ja | ja | – | ja |
| 39 | suva-bagatellunfall | q4 | "Das weiss ich nicht." | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Text | Das weiss ich nicht. | nein | unvollständig | Information über den Betriebszweig | – |
| 40 | suva-bagatellunfall | q4 | the value of the next unit | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Text | Keller Sandra | not ja | unvollständig | Betriebszweig | – |
| 41 | suva-bagatellunfall | q5 | the value itself | Wie heissen die verletzte Person? | Name und Vorname | Text | Keller Sandra | ja | ja | – | ja |
| 42 | suva-bagatellunfall | q5 | "Das weiss ich nicht." | Wie heissen die verletzte Person? | Name und Vorname | Text | Das weiss ich nicht. | nein | unvollständig | Name und Vorname | – |
| 43 | suva-bagatellunfall | q5 | the value of the next unit | Wie heissen die verletzte Person? | Name und Vorname | Text | 14.03.1988 | not ja | nein | Name und Vorname | – |
| 44 | suva-bagatellunfall | q6 | the value itself | Wann ist die verletzte Person geboren? | Geburtsdatum | Datum | 14.03.1988 | ja | ja | – | ja |
| 45 | suva-bagatellunfall | q6 | "Das weiss ich nicht." | Wann ist die verletzte Person geboren? | Geburtsdatum | Datum | Das weiss ich nicht. | nein | unvollständig | Geburtsdatum | – |
| 46 | suva-bagatellunfall | q6 | the value of the next unit | Wann ist die verletzte Person geboren? | Geburtsdatum | Datum | Werkstrasse 12, 6300 Zug | not ja | unvollständig | Geburtsdatum (Datum) | – |
| 47 | suva-bagatellunfall | q8 | the value itself | Welche Strasse hat die verletzte Person? | Strasse | Text | Werkstrasse 12, 6300 Zug | ja | ja | – | ja |
| 48 | suva-bagatellunfall | q8 | "Das weiss ich nicht." | Welche Strasse hat die verletzte Person? | Strasse | Text | Das weiss ich nicht. | nein | unvollständig | die tatsächliche Strasse | – |
| 49 | suva-bagatellunfall | q8 | the value of the next unit | Welche Strasse hat die verletzte Person? | Strasse | Text | Schweiz | not ja | nein | Strassennamen | – |
| 50 | suva-bagatellunfall | q9 | the value itself | Welche Staatsangehörigkeit hat die verletzte Person? | Staatsangehörigkeit | Text | Schweiz | ja | ja | – | ja |
| 51 | suva-bagatellunfall | q9 | "Das weiss ich nicht." | Welche Staatsangehörigkeit hat die verletzte Person? | Staatsangehörigkeit | Text | Das weiss ich nicht. | nein | unvollständig | die Staatsangehörigkeit | – |
| 52 | suva-bagatellunfall | q9 | the value of the next unit | Welche Staatsangehörigkeit hat die verletzte Person? | Staatsangehörigkeit | Text | ledig | not ja | nein | Staatsangehörigkeit | – |
| 53 | suva-bagatellunfall | q10 | the value itself | Welcher Zivilstand ist bei der verletzten Person? | Zivilstand | Text | ledig | ja | ja | – | ja |
| 54 | suva-bagatellunfall | q10 | "Das weiss ich nicht." | Welcher Zivilstand ist bei der verletzten Person? | Zivilstand | Text | Das weiss ich nicht. | nein | unvollständig | der tatsächliche Zivilstand | – |
| 55 | suva-bagatellunfall | q10 | the value of the next unit | Welcher Zivilstand ist bei der verletzten Person? | Zivilstand | Text | 01.02.2019 | not ja | nein | Zivilstand (z.B. ledig, verheiratet, geschieden, verwitwet) wurde nicht angegeben | – |
| 56 | suva-bagatellunfall | q11 | the value itself | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Datum der Anstellung | Datum | 01.02.2019 | ja | ja | – | ja |
| 57 | suva-bagatellunfall | q11 | "Das weiss ich nicht." | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Datum der Anstellung | Datum | Das weiss ich nicht. | nein | unvollständig | das genaue Datum der Anstellung | – |
| 58 | suva-bagatellunfall | q11 | the value of the next unit | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Datum der Anstellung | Datum | Lagermitarbeiterin | not ja | unvollständig | Datum der Anstellung | – |
| 59 | suva-bagatellunfall | q12 | the value itself | Welchen Beruf übt die verletzte Person aus? | Ausgeübter Beruf | Text | Lagermitarbeiterin | ja | ja | – | ja |
| 60 | suva-bagatellunfall | q12 | "Das weiss ich nicht." | Welchen Beruf übt die verletzte Person aus? | Ausgeübter Beruf | Text | Das weiss ich nicht. | nein | unvollständig | der tatsächliche Beruf | – |
| 61 | suva-bagatellunfall | q12 | the value of the next unit | Welchen Beruf übt die verletzte Person aus? | Ausgeübter Beruf | Text | Angestellte/r / Arbeiter/in | not ja | ja | – | – |
| 62 | suva-bagatellunfall | q13 | the value itself | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | Auswahl | Angestellte/r / Arbeiter/in | ja | unvollständig | Präzisierung der Wahl zwischen Angestellte/r und Arbeiter/in | unvollständig |
| 63 | suva-bagatellunfall | q13 | "Das weiss ich nicht." | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | Auswahl | Das weiss ich nicht. | nein | unvollständig | die Information über die Position der verletzten Person | – |
| 64 | suva-bagatellunfall | q13 | the value of the next unit | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | Auswahl | 40 | not ja | unvollständig | die Auswahl wurde nicht getroffen | – |
| 65 | suva-bagatellunfall | q14 | the value itself | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Arbeitszeit des/der Verletzten: Stunden je Woche | Text | 40 | ja | ja | – | ja |
| 66 | suva-bagatellunfall | q14 | "Das weiss ich nicht." | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Arbeitszeit des/der Verletzten: Stunden je Woche | Text | Das weiss ich nicht. | nein | unvollständig | konkrete Anzahl der Arbeitsstunden | – |
| 67 | suva-bagatellunfall | q14 | the value of the next unit | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Arbeitszeit des/der Verletzten: Stunden je Woche | Text | 05 | not ja | ja | – | – |
| 68 | suva-bagatellunfall | q15 | the value itself | Tag | Tag | Text | 05 | ja | ja | – | ja |
| 69 | suva-bagatellunfall | q15 | "Das weiss ich nicht." | Tag | Tag | Text | Das weiss ich nicht. | nein | unvollständig | der tatsächliche Tag | – |
| 70 | suva-bagatellunfall | q15 | the value of the next unit | Tag | Tag | Text | 10 | not ja | ja | – | – |
| 71 | suva-bagatellunfall | q16 | the value itself | Welcher Monat war es, als der Unfall passierte? | Monat | Text | 10 | ja | ja | – | ja |
| 72 | suva-bagatellunfall | q16 | "Das weiss ich nicht." | Welcher Monat war es, als der Unfall passierte? | Monat | Text | Das weiss ich nicht. | nein | unvollständig | der Monat | – |
| 73 | suva-bagatellunfall | q16 | the value of the next unit | Welcher Monat war es, als der Unfall passierte? | Monat | Text | 2026 | not ja | unvollständig | Monat (z.B. Januar, Februar, etc.) | – |
| 74 | suva-bagatellunfall | q17 | the value itself | Welches Jahr war es, als der Unfall passierte? | Jahr | Text | 2026 | ja | ja | – | ja |
| 75 | suva-bagatellunfall | q17 | "Das weiss ich nicht." | Welches Jahr war es, als der Unfall passierte? | Jahr | Text | Das weiss ich nicht. | nein | unvollständig | das Jahr | – |
| 76 | suva-bagatellunfall | q17 | the value of the next unit | Welches Jahr war es, als der Unfall passierte? | Jahr | Text | 14:20 | not ja | unvollständig | ein vierstelliges Jahr | – |
| 77 | suva-bagatellunfall | q18 | the value itself | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | Zeit (Stunden, Minuten) | Text | 14:20 | ja | ja | – | ja |
| 78 | suva-bagatellunfall | q18 | "Das weiss ich nicht." | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | Zeit (Stunden, Minuten) | Text | Das weiss ich nicht. | nein | unvollständig | die genaue Uhrzeit | – |
| 79 | suva-bagatellunfall | q18 | the value of the next unit | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | Zeit (Stunden, Minuten) | Text | Lager, Werkstrasse 12, Zug | not ja | nein | Zeit (Stunden, Minuten) | – |
| 80 | suva-bagatellunfall | q19 | the value itself | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Text | Lager, Werkstrasse 12, Zug | ja | ja | – | ja |
| 81 | suva-bagatellunfall | q19 | "Das weiss ich nicht." | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Text | Das weiss ich nicht. | nein | unvollständig | genauer Ort und Strasse | – |
| 82 | suva-bagatellunfall | q19 | the value of the next unit | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Text | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | not ja | unvollständig | genauer Ort (z. B. Strasse, Werkstatt) und Postleitzahl | – |
| 83 | suva-bagatellunfall | q19 | only the first part of the value | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Text | Lager | not ja | unvollständig | Strasse oder Postleitzahl | – |
| 84 | suva-bagatellunfall | q20 | the value itself | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | Text, mehrere Angaben möglich | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | ja | ja | – | ja |
| 85 | suva-bagatellunfall | q20 | "Das weiss ich nicht." | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | nein | Tätigkeit zur Zeit des Unfalles, Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | – |
| 86 | suva-bagatellunfall | q20 | the value of the next unit | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | Text, mehrere Angaben möglich | Palette | not ja | unvollständig | Tätigkeit zur Zeit des Unfalles, Unfallhergang, beteiligte Personen | – |
| 87 | suva-bagatellunfall | q21 | the value itself | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Text | Palette | ja | unvollständig | genaue Bezeichnung des Gegenstands | unvollständig |
| 88 | suva-bagatellunfall | q21 | "Das weiss ich nicht." | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Text | Das weiss ich nicht. | nein | unvollständig | genaue Bezeichnung der beteiligten Gegenstände | – |
| 89 | suva-bagatellunfall | q21 | the value of the next unit | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Text | Handgelenk | not ja | nein | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | – |
| 90 | suva-bagatellunfall | q22 | the value itself | Welcher Körperteil der verletzten Person ist betroffen? | Betroffener Körperteil | Text | Handgelenk | ja | ja | – | ja |
| 91 | suva-bagatellunfall | q22 | "Das weiss ich nicht." | Welcher Körperteil der verletzten Person ist betroffen? | Betroffener Körperteil | Text | Das weiss ich nicht. | nein | unvollständig | der genaue Körperteil | – |
| 92 | suva-bagatellunfall | q22 | the value of the next unit | Welcher Körperteil der verletzten Person ist betroffen? | Betroffener Körperteil | Text | rechts | not ja | ja | – | – |
| 93 | suva-bagatellunfall | q23 | the value itself | Ist die Verletzung links, rechts oder unbestimmt? | links / rechts / unbestimmt | Auswahl | rechts | ja | ja | – | ja |
| 94 | suva-bagatellunfall | q23 | "Das weiss ich nicht." | Ist die Verletzung links, rechts oder unbestimmt? | links / rechts / unbestimmt | Auswahl | Das weiss ich nicht. | nein | unvollständig | die Wahl zwischen links, rechts oder unbestimmt | – |
| 95 | suva-bagatellunfall | q23 | the value of the next unit | Ist die Verletzung links, rechts oder unbestimmt? | links / rechts / unbestimmt | Auswahl | Kantonsspital Zug, Notfall | not ja | unvollständig | die Angabe, ob die Verletzung links, rechts oder unbestimmt ist | – |
| 96 | suva-bagatellunfall | q25 | the value itself | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Erstbehandelnder Arzt bzw. Spital/Klinik | Text, mehrere Angaben möglich | Kantonsspital Zug, Notfall | ja | ja | – | ja |
| 97 | suva-bagatellunfall | q25 | "Das weiss ich nicht." | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Erstbehandelnder Arzt bzw. Spital/Klinik | Text, mehrere Angaben möglich | Das weiss ich nicht. | nein | unvollständig | Name des Erstbehandelnden Arztes oder des Spitals/Klinik | – |
| 98 | suva-bagatellunfall | q25 | the value of the next unit | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Erstbehandelnder Arzt bzw. Spital/Klinik | Text, mehrere Angaben möglich | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | not ja | ja | – | – |
