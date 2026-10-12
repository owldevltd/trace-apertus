# Result: translating the values back into German

Four passes on 9 October 2026 over the same values: the 28 written made-up values of the two walk-through forms, put
into French, Italian and English by the large model (swiss-ai/Apertus-v1.5-70B, 6 calls) and translated back into
German. 180 calls, all answered, 18 of them to the large model. Small model: swiss-ai/Apertus-v1.5-8B; temperature 0.

Counted again from the answers in `calls/`. Reference: the German value a translation started from. A value **is
language** when the way there changed its letters or digits (7 in French, 11 in Italian, 10 in English); the others
are names and numbers the way there left as they were (21, 17, 18). A value that is language comes back **as the
German value** when its letters and digits equal the reference, **in another wording** when it equals neither the
reference nor what was given, and is **left as given** when it equals what was given. Another right word counts as
another wording.

| pass | language | values that are language | as the German value | in another wording | left as given | no line | names and numbers | unchanged | changed | no line |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| pass 1, small model, whole form | French | 7 | 0 | 0 | 7 | 0 | 21 | 20 | 0 | 1 |
| – | Italian | 11 | 0 | 1 | 10 | 0 | 17 | 16 | 0 | 1 |
| – | English | 10 | 0 | 0 | 10 | 0 | 18 | 17 | 0 | 1 |
| pass 1, small model, whole form | all three | 28 | 0 | 1 | 27 | 0 | 56 | 53 | 0 | 3 |
| pass 1, small model, six per call | French | 7 | 2 | 0 | 5 | 0 | 21 | 20 | 0 | 1 |
| – | Italian | 11 | 1 | 1 | 9 | 0 | 17 | 17 | 0 | 0 |
| – | English | 10 | 2 | 0 | 8 | 0 | 18 | 18 | 0 | 0 |
| pass 1, small model, six per call | all three | 28 | 5 | 1 | 22 | 0 | 56 | 55 | 0 | 1 |
| pass 1, large model, whole form | French | 7 | 2 | 2 | 3 | 0 | 21 | 20 | 0 | 1 |
| – | Italian | 11 | 2 | 2 | 7 | 0 | 17 | 16 | 0 | 1 |
| – | English | 10 | 0 | 0 | 10 | 0 | 18 | 17 | 0 | 1 |
| pass 1, large model, whole form | all three | 28 | 4 | 4 | 20 | 0 | 56 | 53 | 0 | 3 |
| pass 2, small model, six per call | French | 7 | 0 | 5 | 2 | 0 | 21 | 2 | 19 | 0 |
| – | Italian | 11 | 0 | 11 | 0 | 0 | 17 | 2 | 15 | 0 |
| – | English | 10 | 1 | 8 | 1 | 0 | 18 | 3 | 15 | 0 |
| pass 2, small model, six per call | all three | 28 | 1 | 24 | 3 | 0 | 56 | 7 | 49 | 0 |
| pass 2, large model, whole form | French | 7 | 0 | 7 | 0 | 0 | 21 | 0 | 20 | 1 |
| – | Italian | 11 | 0 | 11 | 0 | 0 | 17 | 0 | 17 | 0 |
| – | English | 10 | 0 | 9 | 0 | 1 | 18 | 0 | 18 | 0 |
| pass 2, large model, whole form | all three | 28 | 0 | 27 | 0 | 1 | 56 | 0 | 55 | 1 |
| pass 3, small model, one value per call | French | 7 | 6 | 1 | 0 | 0 | 21 | 20 | 1 | 0 |
| – | Italian | 11 | 6 | 5 | 0 | 0 | 17 | 16 | 1 | 0 |
| – | English | 10 | 5 | 4 | 1 | 0 | 18 | 18 | 0 | 0 |
| pass 3, small model, one value per call | all three | 28 | 17 | 10 | 1 | 0 | 56 | 54 | 2 | 0 |
| pass 4, small model, six per call, the question in front | French | 7 | 0 | 0 | 7 | 0 | 21 | 21 | 0 | 0 |
| – | Italian | 11 | 0 | 1 | 10 | 0 | 17 | 17 | 0 | 0 |
| – | English | 10 | 0 | 0 | 10 | 0 | 18 | 18 | 0 | 0 |
| pass 4, small model, six per call, the question in front | all three | 28 | 0 | 1 | 27 | 0 | 56 | 56 | 0 | 0 |
| pass 4, small model, six per call, without the question | French | 7 | 0 | 0 | 7 | 0 | 21 | 21 | 0 | 0 |
| – | Italian | 11 | 0 | 0 | 11 | 0 | 17 | 17 | 0 | 0 |
| – | English | 10 | 0 | 0 | 10 | 0 | 18 | 18 | 0 | 0 |
| pass 4, small model, six per call, without the question | all three | 28 | 0 | 0 | 28 | 0 | 56 | 56 | 0 | 0 |

- Pass 1: a table per field with its id, the printed label, the kind and the value, and the sentence "ist ein Wert
  schon deutsch oder braucht keine Übersetzung, gib ihn unverändert zurück"; 30 calls back.
- Pass 2: running numbers instead of field ids, "Nummer | Beschriftung | Angabe", and "Am Ende steht kein Wort mehr
  auf Französisch"; 24 calls. See the next table for what came back.
- Pass 3: one value per call, with the printed label named, only the German value asked back; 84 calls, 182 ms per
  call at the median as the client logged it.
- Pass 4: six values per call under running numbers, once with the question of each value in front of it and once
  without; 36 calls. A check by code, the same digits in the value given and the value returned, marks 0 and 0 of the
  84 values.

## Pass 2: what came back

In pass 2 the count of the first table cannot tell a translation from a label put in front: a value with the label in
front of it equals neither the reference nor what was given. Counted here by what stands in the returned value.

| model | values | count | the printed label alone | the label, then the value as given | the label, then the German value | the label, then another wording | the value as given | the German value | another wording | no line |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| small model, six per call | values that are language | 28 | 14 | 9 | 0 | 1 | 3 | 1 | 0 | 0 |
| small model, six per call | names and numbers | 56 | 22 | 0 | 25 | 1 | 0 | 6 | 2 | 0 |
| large model, whole form | values that are language | 28 | 2 | 13 | 7 | 5 | 0 | 0 | 0 | 1 |
| large model, whole form | names and numbers | 56 | 0 | 0 | 55 | 0 | 0 | 0 | 0 | 1 |

## The 28 values that are language, passes 1, 3 and 4

| language | form | field | German value | given | pass 1, small, whole form | pass 1, small, six | pass 1, large, whole form | pass 3, one per call | pass 4, with the question | pass 4, without |
|---|---|---|---|---|---|---|---|---|---|---|
| French | betreibungsbegehren | amt | Betreibungsamt Chur | Office des poursuites Chur | = as given | = as given | = as given | = German value | = as given | = as given |
| French | betreibungsbegehren | forderung | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Facture n° 2026-118 du 12.06.2026, réparation | = as given | = as given | = as given | = German value | = as given | = as given |
| French | suva-bagatellunfall | staat | Schweiz | Suisse | = as given | = German value | = as given | = German value | = as given | = as given |
| French | suva-bagatellunfall | zivilstand | ledig | célibataire | = as given | = German value | = German value | = German value | = as given | = as given |
| French | suva-bagatellunfall | hergang | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | En déchargeant une palette, j'ai glissé et je suis tombée sur mon poignet droit. | = as given | = as given | Beim Entladen einer Palette bin ich ausgerutscht und auf mein rechtes Handgelenk gefallen. | Beim Ausladen einer Palette bin ich ausgerutscht und bin auf das rechte Handgelenk gefallen. | = as given | = as given |
| French | suva-bagatellunfall | koerperteil | Handgelenk | Poignet | = as given | = as given | = German value | = German value | = as given | = as given |
| French | suva-bagatellunfall | arzt1 | Kantonsspital Zug, Notfall | Kantonsspital Zug, Urgence | = as given | = as given | Kantonsspital Zug, Notfallstation | = German value | = as given | = as given |
| Italian | betreibungsbegehren | amt | Betreibungsamt Chur | Ufficio di esecuzione Chur | = as given | = as given | = German value | = German value | = as given | = as given |
| Italian | betreibungsbegehren | forderung | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Fattura n. 2026-118 del 12.06.2026, riparazione | Fattura n. 2026-118 del 12.06.2026, reparazione | Fattura n. 2026-118 del 12.06.2026, reparazione | Forderungsurkunde: Faktura n. 2026-118 vom 12.06.2026, Reparatur | = German value | Fattura n. 2026-118 del 12.06.2026, reparazione | = as given |
| Italian | suva-bagatellunfall | arbeitsplatz | Lager | Magazzino | = as given | = as given | = as given | = German value | = as given | = as given |
| Italian | suva-bagatellunfall | staat | Schweiz | Svizzera | = as given | = German value | = as given | = German value | = as given | = as given |
| Italian | suva-bagatellunfall | zivilstand | ledig | nubile | = as given | = as given | = as given | verheiratet | = as given | = as given |
| Italian | suva-bagatellunfall | beruf | Lagermitarbeiterin | Magazziniera | = as given | = as given | = as given | Magazinierin | = as given | = as given |
| Italian | suva-bagatellunfall | ort | Lager, Werkstrasse 12, Zug | Magazzino, Werkstrasse 12, Zug | = as given | = as given | = as given | Magazin, Werkstrasse 12, Zug | = as given | = as given |
| Italian | suva-bagatellunfall | hergang | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Scivolata mentre scaricavo un pallet e caduta sul polso destro. | = as given | = as given | Ausrutscher beim Entladen eines Pallets und Sturz auf das rechte Handgelenk. | Ausrutscher, während ich ein Pallet entludete und Sturz auf das rechte Handgelenk. | = as given | = as given |
| Italian | suva-bagatellunfall | gegenstaende | Palette | Pallet | = as given | = as given | = as given | = German value | = as given | = as given |
| Italian | suva-bagatellunfall | koerperteil | Handgelenk | Polso | = as given | = as given | = German value | = German value | = as given | = as given |
| Italian | suva-bagatellunfall | arzt1 | Kantonsspital Zug, Notfall | Ospedale Cantonale di Zurigo, Pronto Soccorso | = as given | = as given | = as given | Kantonales Spital Zürich, Notfallstation | = as given | = as given |
| English | betreibungsbegehren | forderung | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Invoice No. 2026-118 dated 12.06.2026, Repair | = as given | = as given | = as given | = German value | = as given | = as given |
| English | suva-bagatellunfall | arbeitsplatz | Lager | Warehouse | = as given | = as given | = as given | Lagerhaus | = as given | = as given |
| English | suva-bagatellunfall | staat | Schweiz | Switzerland | = as given | = German value | = as given | = German value | = as given | = as given |
| English | suva-bagatellunfall | zivilstand | ledig | single | = as given | = as given | = as given | = German value | = as given | = as given |
| English | suva-bagatellunfall | beruf | Lagermitarbeiterin | Warehouse worker | = as given | = as given | = as given | Lagerarbeiter | = as given | = as given |
| English | suva-bagatellunfall | ort | Lager, Werkstrasse 12, Zug | Warehouse, Werkstrasse 12, Zug | = as given | = as given | = as given | Lagerhalle, Werkstrasse 12, Zug | = as given | = as given |
| English | suva-bagatellunfall | hergang | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Slipped while unloading a pallet and fell onto the right wrist. | = as given | = as given | = as given | Ausgerutscht beim Ausladen eines Pallets und auf das rechte Handgelenk gefallen. | = as given | = as given |
| English | suva-bagatellunfall | gegenstaende | Palette | Pallet | = as given | = as given | = as given | = German value | = as given | = as given |
| English | suva-bagatellunfall | koerperteil | Handgelenk | Wrist | = as given | = German value | = as given | = German value | = as given | = as given |
| English | suva-bagatellunfall | arzt1 | Kantonsspital Zug, Notfall | Kantonsspital Zug, Emergency | = as given | = as given | = as given | = as given | = as given | = as given |

## Names and numbers that did not come back as they were, passes 1, 3 and 4

| language | form | field | German value | pass | returned |
|---|---|---|---|---|---|
| French | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, small model, whole form | (no line) |
| French | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, small model, six per call | (no line) |
| French | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, large model, whole form | (no line) |
| French | suva-bagatellunfall | beruf | Lagermitarbeiterin | pass 3 | Lagerangestellte |
| Italian | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, small model, whole form | (no line) |
| Italian | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, large model, whole form | (no line) |
| Italian | suva-bagatellunfall | strasse | Werkstrasse 12, 6300 Zug | pass 3 | Werksstrasse 12, 6300 Zug |
| English | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, small model, whole form | (no line) |
| English | betreibungsbegehren | glaeubiger | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | pass 1, large model, whole form | (no line) |
