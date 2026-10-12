# Result: a check back on the units the models name for a required entry

Two runs of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, one call per unit: first the 15 units both
models had named for a required entry the label does not bind, then the 31 units only one of the two had named. 46
calls, all answered with status 200. Counted again from the answers in `calls/`; which entry a call belongs to follows
from the answers in `results/required-bind/calls/`.

A unit is kept when the model, shown the unit and the list of the required entries, answers with the letter of the
entry the unit was named for. Right or wrong is the reference of `results/required-bind/reference.json`.

| units | checked | right by the reference | wrong | right ones kept | wrong ones kept |
|---|---:|---:|---:|---|---|
| both models name | 15 | 12 | 3 | 12 of 12 | 1 of 3 |
| only one model names | 31 | 3 | 28 | 1 of 3 | 5 of 28 |

## What is bound in the end

Of the 28 required entries with a place in the dialogue and their 43 units.

| way of binding | entries with a right unit (of 28) | right units (of 43) | wrong units |
|---|---:|---:|---:|
| the label of a field (code) | 17 | 26 | 0 |
| the label, else what both models name | 26 | 38 | 3 |
| the same, each unit kept only when the check back names the entry | 26 | 38 | 1 |
| in addition every unit only one model names, when the check back names the entry | 27 | 39 | 6 |

## The units both models name

| form | required entry | unit | the check back names | kept | right by the reference |
|---|---|---|---|---|---|
| suva-bagatellunfall | Tag | q5 Kunden-Nr. | H: Name und Adresse mit Postleitzahl | no | no |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q31 10. Arzt- adressen | G: Erstbehandelnder Arzt bzw. Spital/Klinik | yes | yes |
| arbeitsfaehigkeitszeugnis | Arbeitnehmerin / Arbeitnehmer: Name / Vorname | q1 Name / Vorname | A: Arbeitnehmerin / Arbeitnehmer: Name / Vo | yes | yes |
| arbeitsfaehigkeitszeugnis | Ursache | q22 Krankheit / Unfall / Berufskrankheit | C: Ursache | yes | yes |
| arbeitsfaehigkeitszeugnis | Arbeitsunfähigkeit: von / bis | q26 Konsultationsdatum / von / bis / nächste | D: Arbeitsunfähigkeit: von / bis | yes | yes |
| arbeitsfaehigkeitszeugnis | Unterschrift | q34 Arzt / Ärztin (Name, Stempel) | F: Arzt / Ärztin (Name, Stempel) | no | no |
| schadenmeldung-uvg | Art der Meldung | q5 Unfall / Berufskrankheit | A: Art der Meldung | yes | yes |
| schadenmeldung-uvg | Schadendatum (Tag, Monat, Jahr, Zeit) | q45 Tag | E: Schadendatum (Tag, Monat, Jahr, Zeit) | yes | yes |
| schadenmeldung-uvg | Schadendatum (Tag, Monat, Jahr, Zeit) | q46 Monat | E: Schadendatum (Tag, Monat, Jahr, Zeit) | yes | yes |
| schadenmeldung-uvg | Schadendatum (Tag, Monat, Jahr, Zeit) | q47 Jahr | E: Schadendatum (Tag, Monat, Jahr, Zeit) | yes | yes |
| schadenmeldung-uvg | Schadendatum (Tag, Monat, Jahr, Zeit) | q48 Zeit (Stunden, Minuten) | E: Schadendatum (Tag, Monat, Jahr, Zeit) | yes | yes |
| schadenmeldung-uvg | Unfallort (Ort und Stelle) | q49 Ort (Name oder PLZ) und Stelle (z. B. We | F: Unfallort (Ort und Stelle) | yes | yes |
| schadenmeldung-uvg | Sachverhalt (Unfallbeschreibung) | q50 Tätigkeit zur Zeit des Unfalles; Unfallh | G: Sachverhalt (Unfallbeschreibung) | yes | yes |
| schadenmeldung-uvg | Lohnbestandteile (CHF pro Stunde/Monat/Jahr) | q79 CHF pro Stunde / CHF pro Monat / CHF pro | L: Lohnbestandteile (CHF pro Stunde/Monat/J | yes | yes |
| schadenmeldung-uvg | Unterschriften | q96 Ort und Datum | M: Unterschriften | yes | no |

## The units only one model names

| form | required entry | unit | named by | the check back names | kept | right by the reference |
|---|---|---|---|---|---|---|
| betreibungsbegehren | Betrag (CHF) | q11 IBAN | 8B | A: Schuldner (Name und Vorname bzw. Firma;  | no | no |
| betreibungsbegehren | Betrag (CHF) | q14 Weitere Forderungen | 70B | B: Gläubiger (Name und Vorname bzw. Firma;  | no | yes |
| suva-bagatellunfall | Tag | q53 Ort (Name oder PLZ) und Stelle (z. B. We | 8B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | no |
| suva-bagatellunfall | Monat | q3 Name und Adresse mit Postleitzahl | 8B | H: Name und Adresse mit Postleitzahl | no | no |
| suva-bagatellunfall | Monat | q53 Ort (Name oder PLZ) und Stelle (z. B. We | 8B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | no |
| suva-bagatellunfall | Monat | q5 Kunden-Nr. | 70B | H: Name und Adresse mit Postleitzahl | no | no |
| suva-bagatellunfall | Jahr | q6 Üblicher Arbeitsplatz des/der Verletzten | 8B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | no |
| suva-bagatellunfall | Jahr | q53 Ort (Name oder PLZ) und Stelle (z. B. We | 8B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | no |
| suva-bagatellunfall | Jahr | q5 Kunden-Nr. | 70B | H: Name und Adresse mit Postleitzahl | no | no |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q32 Nachbehandelnder Arzt bzw. Spital/Klinik | 8B | G: Erstbehandelnder Arzt bzw. Spital/Klinik | yes | no |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q78 Nachbehandelnder Arzt bzw. Spital/Klinik | 8B | G: Erstbehandelnder Arzt bzw. Spital/Klinik | yes | no |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q96 Arzt- adressen | 8B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | yes |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q74 Beteiligte Gegenstände (z. B. Maschine,  | 70B | D: Ort (Name oder PLZ) und Stelle (z. B. We | no | no |
| suva-bagatellunfall | Erstbehandelnder Arzt bzw. Spital/Klinik | q97 Nachbehandelnder Arzt bzw. Spital/Klinik | 70B | G: Erstbehandelnder Arzt bzw. Spital/Klinik | yes | no |
| arbeitsfaehigkeitszeugnis | Unterschrift | q35 ja / nein | 70B | C: Ursache | no | no |
| schadenmeldung-uvg | Sachverhalt (Unfallbeschreibung) | q56 Beteiligte Gegenstände (z. B. Maschine,  | 70B | G: Sachverhalt (Unfallbeschreibung) | yes | no |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q67 Wenn ja, ab wann? | 8B | K: Arbeit zufolge Unfalles ausgesetzt? (Ja/ | yes | no |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q68 Ja / Nein | 8B | K: Arbeit zufolge Unfalles ausgesetzt? (Ja/ | yes | yes |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q73 Erstbehandelnder Arzt bzw. Spital/Klinik | 70B | H: Erstbehandelnder Arzt bzw. Spital/Klinik | no | no |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q74 Nachbehandelnder Arzt bzw. Spital/Klinik | 70B | H: Erstbehandelnder Arzt bzw. Spital/Klinik | no | no |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q77 ambulant / stationär | 70B | L: Lohnbestandteile (CHF pro Stunde/Monat/J | no | no |
| schadenmeldung-uvg | Arbeit zufolge Unfalles ausgesetzt? (Ja/Nein) | q78 ambulant / stationär | 70B | L: Lohnbestandteile (CHF pro Stunde/Monat/J | no | no |
| schadenmeldung-uvg | Unterschriften | q82 Anzahl Kinder (bis 18 J., in Ausbildung  | 70B | A: Art der Meldung | no | no |
| schadenmeldung-uvg | Unterschriften | q83 Bezeichnung der anderen Lohnzulagen | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q85 Wenn ja, Name und Adresse | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q86 Nein / Ja | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q87 Quellensteuerpflicht | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q88 Freiwillige Versicherung (Arbeitgeber /  | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q89 Familienmitglied / Gesellschafter | 70B | B: Name und Adresse mit Postleitzahl | no | no |
| schadenmeldung-uvg | Unterschriften | q90 Entsandte/r | 70B | D: Arbeitszeit des/der Verletzten (Std./Woc | no | no |
| schadenmeldung-uvg | Unterschriften | q95 Name der obligatorischen Krankenversiche | 70B | H: Erstbehandelnder Arzt bzw. Spital/Klinik | no | no |
