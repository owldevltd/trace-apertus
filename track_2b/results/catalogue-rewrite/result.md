# Result: a second pass that only rewrites the questions

Two runs of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 on the questions the same model had written
with the labels given (`results/catalogue-plain-questions/`, the run with the labels): first all questions of a form
in one call, then twelve questions per call. 27 calls, all answered with status 200. Counted again from the prompts
and answers in `calls/`: the questions before stand in the prompt, the rewritten ones in the answer.

A question counts as unchanged when it comes back with the same characters, spaces at the ends aside. Where an answer
is not valid JSON, the single entries that can be read from it are taken; an id that was not in the call is not.

## In one piece

| form | calls | seconds | every answer valid JSON | questions sent | came back | unchanged | ids outside the call |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 1 | 7 | yes | 36 | 36 | 35 | 0 |
| betreibungsbegehren | 1 | 3 | yes | 17 | 17 | 15 | 0 |
| schadenmeldung-uvg | 1 | 16 | yes | 96 | 96 | 26 | 0 |
| suva-bagatellunfall | 1 | 18 | yes | 110 | 110 | 107 | 0 |
| all | 4 | 44 | 4 of 4 forms | 259 | 259 | 183 | 0 |

## In bundles of twelve

| form | calls | seconds | every answer valid JSON | questions sent | came back | unchanged | ids outside the call |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 3 | 10 | yes | 36 | 36 | 21 | 0 |
| betreibungsbegehren | 2 | 5 | yes | 17 | 17 | 11 | 0 |
| schadenmeldung-uvg | 8 | 27 | no | 96 | 84 | 19 | 0 |
| suva-bagatellunfall | 10 | 28 | no | 110 | 109 | 39 | 0 |
| all | 23 | 70 | 2 of 4 forms | 259 | 246 | 90 | 0 |

## The language before and after, over the questions that came back

LIX is the readability index: words per sentence plus the share of words longer than six letters in percent, over all
questions of a form. With an abbreviation: one of bzw., ggf., evtl., inkl., exkl., usw., etc., resp., Nr., Tel., z.
B., d. h. With a bracket or slash: the question holds `(`, `[` or `/`. Impersonal: "wird … eingetragen / angegeben /
ausgefüllt / verwendet / erwünscht", "werden … eingetragen / angegeben" or "soll … eingetragen". Asks to enter: a form
of eintragen, ankreuzen or ausfüllen. Speaks of the form: Formular, Feld, Zeile, Spalte, Kästchen, Tabelle, Stelle,
Merkblatt or Rückseite. Label word for word: a printed label of two words or more stands in the question, letters and
digits compared. Shares a word: a word of four letters or more is equal or begins with the same five letters; a lower
bound, since a right question need not repeat a word.

### In one piece

| form | version | questions | LIX | with an abbreviation | with a bracket or slash | impersonal | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | before | 36 | 34 | 0 | 4 | 2 | 1 | 25 of 28 | 26 of 35 |
| arbeitsfaehigkeitszeugnis | rewritten | 36 | 34 | 0 | 4 | 2 | 1 | 25 of 28 | 25 of 35 |
| betreibungsbegehren | before | 17 | 38 | 3 | 5 | 0 | 0 | 15 of 17 | 12 of 12 |
| betreibungsbegehren | rewritten | 17 | 37 | 3 | 5 | 0 | 0 | 15 of 17 | 12 of 12 |
| schadenmeldung-uvg | before | 96 | 40 | 6 | 18 | 5 | 12 | 81 of 90 | 72 of 78 |
| schadenmeldung-uvg | rewritten | 96 | 38 | 0 | 0 | 4 | 5 | 75 of 90 | 68 of 78 |
| suva-bagatellunfall | before | 110 | 42 | 10 | 22 | 71 | 10 | 73 of 73 | 0 of 0 |
| suva-bagatellunfall | rewritten | 110 | 42 | 10 | 22 | 71 | 10 | 73 of 73 | 0 of 0 |
| all (LIX per form) | before | 259 | 34 / 38 / 40 / 42 | 19 | 49 | 78 | 23 | 194 of 208 | 110 of 125 |
| all (LIX per form) | rewritten | 259 | 34 / 37 / 38 / 42 | 13 | 31 | 77 | 16 | 188 of 208 | 105 of 125 |

### In bundles of twelve

| form | version | questions | LIX | with an abbreviation | with a bracket or slash | impersonal | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | before | 36 | 34 | 0 | 4 | 2 | 1 | 25 of 28 | 26 of 35 |
| arbeitsfaehigkeitszeugnis | rewritten | 36 | 34 | 0 | 1 | 2 | 0 | 25 of 28 | 25 of 35 |
| betreibungsbegehren | before | 17 | 38 | 3 | 5 | 0 | 0 | 15 of 17 | 12 of 12 |
| betreibungsbegehren | rewritten | 17 | 34 | 2 | 3 | 0 | 0 | 14 of 17 | 10 of 12 |
| schadenmeldung-uvg | before | 84 | 41 | 6 | 17 | 5 | 12 | 71 of 80 | 63 of 69 |
| schadenmeldung-uvg | rewritten | 84 | 37 | 0 | 2 | 1 | 3 | 58 of 80 | 53 of 69 |
| suva-bagatellunfall | before | 109 | 42 | 10 | 22 | 70 | 10 | 73 of 73 | 0 of 0 |
| suva-bagatellunfall | rewritten | 109 | 38 | 0 | 5 | 40 | 9 | 65 of 73 | 0 of 0 |
| all (LIX per form) | before | 246 | 34 / 38 / 41 / 42 | 19 | 48 | 77 | 23 | 184 of 198 | 101 of 116 |
| all (LIX per form) | rewritten | 246 | 34 / 34 / 37 / 38 | 2 | 11 | 43 | 12 | 162 of 198 | 88 of 116 |

The shared-word counts fall when a question is rewritten; the measure does not tell a freer wording from a question
that now asks for something else.

## All questions

### arbeitsfaehigkeitszeugnis

| unit | printed label | before | in one piece | in bundles of twelve |
|---|---|---|---|---|
| q1 | w · m | Ist die Person weiblich oder männlich? | = | = |
| q2 | Name / Vorname | Wie lautet der Name und der Vorname der Person? | = | = |
| q3 | Geb.-Dat. | Wie lautet das Geburtsdatum der Person? | Wann ist die Person geboren? | Wann ist die Person geboren? |
| q4 | Adresse / PLZ | Wie lautet die Adresse und die Postleitzahl der Person? | = | = |
| q5 | AHV-Nr. | Wie lautet die AHV-Nummer der Person? | = | = |
| q6 | Telefon | Wie lautet die Telefonnummer der Person? | = | = |
| q7 | E-Mail | Wie lautet die E-Mail-Adresse der Person? | = | = |
| q8 | Firmenname | Wie lautet der Firmenname des Arbeitgebers? | = | = |
| q9 | Kontaktperson | Wie lautet der Name der Kontaktperson beim Arbeitgeber? | = | = |
| q10 | Adresse / PLZ | Wie lautet die Adresse und die Postleitzahl des Arbeitgebers? | = | = |
| q11 | Telefon | Wie lautet die Telefonnummer des Arbeitgebers? | = | = |
| q12 | E-Mail | Wie lautet die E-Mail-Adresse des Arbeitgebers? | = | = |
| q13 | Eintrittsjahr | In welchem Jahr ist die Person in das Unternehmen eingetreten? | = | = |
| q14 | Funktion / ausgeübter Beruf * | Welche Funktion oder welchen Beruf übt die Person aus? | = | Welche Funktion oder welchen Beruf hat die Person? |
| q15 | – | Wie viele Stunden pro Tag arbeitet die Person? | = | Wie viele Stunden arbeitet die Person pro Tag? |
| q16 | Std. / Tag | Arbeitet die Person in Vollzeit (100 %) oder Teilzeit? | = | Arbeitet die Person in Vollzeit oder Teilzeit? |
| q17 | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie in Vollzeit (100 %)? | = | Arbeiten Sie in Vollzeit? |
| q18 | Teilzeit | Arbeiten Sie in Teilzeit? | = | = |
| q19 | – | Wie viele Prozent beträgt die Wochenarbeitszeit? | = | = |
| q20 | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage hat die Person pro Woche? | = | = |
| q21 | Bei Kündigung: Arbeitsverhältnis gekündigt per | Wann wurde das Arbeitsverhältnis gekündigt? | = | = |
| q22 | Krankheit · Unfall · Berufskrankheit | Liegt die Arbeitsunfähigkeit aufgrund von Krankheit, Unfall oder Berufskrankheit vor? | = | Liegt die Arbeitsunfähigkeit wegen Krankheit, Unfall oder Berufskrankheit vor? |
| q23 | REP · Arbeitsplatzbeschrieb | Wird das REP (Ressourcenorientiertes Eingliederungsprofil) oder der Arbeitsplatzbeschrieb verwendet? | = | Wird das REP oder der Arbeitsplatzbeschrieb verwendet? |
| q24 | REP vom | Wann ist das REP erstellt worden? | = | Wann wurde das REP erstellt? |
| q25 | Arbeitsplatzbeschrieb vom | Wann ist der Arbeitsplatzbeschrieb erstellt worden? | = | Wann wurde der Arbeitsplatzbeschrieb erstellt? |
| q26 | Konsultationsdatum · von · bis | Wann war die letzte Konsultation? Wann begann und endete die Arbeitsunfähigkeit? Wann ist die nächste Konsultation geplant? Wem gehört das Visum? | = | Wann war die letzte Arztbesprechung? Wann begann und endete die Arbeitsunfähigkeit? Wann ist der nächste Arzttermin? Wem gehört das ärztliche Visum? |
| q27 | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? Ja oder nein? | = | Besteht eine arbeitsplatzbezogene Arbeitsunfähigkeit? Ja oder nein? |
| q28 | Basierend auf * REP | Wird die Beurteilung auf Basis des REP oder des Arbeitsplatzbeschriebs erstellt? | = | = |
| q29 | REP vom | Wann ist das REP erstellt worden? | = | Wann wurde das REP erstellt? |
| q30 | Arbeitsplatzbeschrieb vom | Wann ist der Arbeitsplatzbeschrieb erstellt worden? | = | Wann wurde der Arbeitsplatzbeschrieb erstellt? |
| q31 | Präsenzzeit Std. pro Tag · Präsenzzeit % Pensum · Leistungsf | Wie viele Stunden pro Tag ist die Person anwesend? Wie hoch ist der Prozentsatz des Pensums? Wie ist die Leistungsfähigkeit in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist die Arbeitsfähigkeit insgesamt in Prozent? Wann ist die nächste Konsultation? | = | Wie viele Stunden pro Tag ist die Person anwesend? Wie hoch ist der Prozentsatz des Pensums? Wie ist die Leistungsfähigkeit in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist die Arbeitsfähigkeit insgesamt in Prozent? Wann ist der nächste Arzttermin? |
| q32 | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann soll die Person wieder zu 100 % arbeiten? | = | = |
| q33 | ja · nein | Wird Kontakt mit dem Arbeitgeber erwünscht? Ja oder nein? | = | = |
| q34 | Arzt / Ärztin (Name, Stempel) | Wie lautet der Name und der Stempel des Arztes oder der Ärztin? | = | = |
| q35 | Datum | Wann ist das Formular unterschrieben worden? | = | Wann wurde das Formular unterschrieben? |
| q36 | Bemerkungen | Welche Bemerkungen gibt es? | = | = |

### betreibungsbegehren

| unit | printed label | before | in one piece | in bundles of twelve |
|---|---|---|---|---|
| q1 | Bitte in Blockschrift ausfüllen und Hinweise auf der Rücksei | Bitte füllen Sie das Formular in Blockschrift aus und lesen Sie die Hinweise auf der Rückseite. | Bitte füllen Sie das Formular mit klaren, großen Buchstaben aus und lesen Sie die Hinweise auf der Rückseite. | Bitte füllen Sie das Formular mit klaren, großen Buchstaben aus und lesen Sie die Hinweise auf der Rückseite. |
| q2 | Durch das Amt auszufüllen | Welches Amt soll dieses Formular ausfüllen? | = | = |
| q3 | Eingang | Wann wurde das Formular beim Amt eingegangen? | Wann wurde das Formular beim Amt abgegeben? | Wann wurde das Formular beim Amt abgegeben? |
| q4 | Betreibung Nr. | Welche Nummer hat die Betreibung? | = | = |
| q5 | des Gläubigers des Vertreters | Welche Zahlungsverbindung hat der Gläubiger oder sein Vertreter? | = | = |
| q6 | IBAN | Welche IBAN hat der Gläubiger oder sein Vertreter? | = | = |
| q7 | Forderungsgrund oder Forderungsurkunde mit Datum | Welchen Forderungsgrund oder welche Forderungsurkunde mit Datum geben Sie an? | = | = |
| q8 | Weitere Forderungen | Welche weiteren Forderungen haben Sie? Bitte geben Sie bis zu neun Zeilen an, jede Zeile enthält Betrag, Zins und Zinsdatum. | = | = |
| q9 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heißt der Schuldner (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? | = | = |
| q10 | Adresse des Betreibungsamtes | Welche Adresse hat das Betreibungsamt? | = | = |
| q11 | Geburtsdatum (falls bekannt) | Wann wurde der Schuldner geboren (falls bekannt)? | = | = |
| q12 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heißt der Gläubiger (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? | = | = |
| q13 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ O | Wer vertritt den Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort)? | = | Wer ist der Gläubiger? Wie heißt die Person oder Firma? Wo wohnt oder arbeitet sie? |
| q14 | Telefon oder E-Mail | Welches Telefon oder welche E-Mail hat der Gläubiger für Rückfragen? | = | Wie kann ich den Gläubiger anrufen oder ihm eine E-Mail schreiben? |
| q15 | Bemerkungen | Haben Sie Bemerkungen zum Betreibungsbegehren? | = | Haben Sie etwas zu sagen zu diesem Betreibungsbegehren? |
| q16 | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallreferenz (falls vorhanden)? | = | Haben Sie eine Fallreferenz, falls vorhanden? |
| q17 | Die Angaben des vorliegenden Merkblatts stützen sich auf die | Auf welche Gesetze und Verordnungen stützen sich die Angaben in diesem Merkblatt? | = | = |

### schadenmeldung-uvg

| unit | printed label | before | in one piece | in bundles of twelve |
|---|---|---|---|---|
| q1 | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsa | Wie lautet der Hinweis über die Herkunft und den Zweck dieses Formulars? | Wie können Sie beschreiben, woher dieses Formular kommt und wozu es dient? | Wie wird hier erklärt, woher dieses Formular kommt und wozu es dient? |
| q2 | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsa | Wie lautet der Hinweis über die Herkunft und den Zweck dieses Formulars? | Wie können Sie beschreiben, woher dieses Formular kommt und wozu es dient? | Wie wird hier erklärt, woher dieses Formular kommt und wozu es dient? |
| q3 | Schaden-Nummer | Welchen Zweck hat die Schaden-Nummer? | Wozu dient die Schaden-Nummer? | Wozu dient die Schaden-Nummer? |
| q4 | Unfall · Berufskrankheit | Handelt es sich um einen Unfall oder eine Berufskrankheit? | War es ein Unfall oder eine Berufskrankheit? | Ist es ein Unfall oder eine Berufskrankheit? |
| q5 | Zahnschaden · Rückfall | Handelt es sich um einen Zahnschaden oder einen Rückfall? | War es ein Zahnschaden oder ein Rückfall? | Ist es ein Zahnschaden oder ein Rückfall? |
| q6 | Art der Meldung | Welche Art von Schaden wird gemeldet? | Welchen Schaden melden Sie? | Welchen Schaden melden Sie? |
| q7 | Name und Adresse mit Postleitzahl | Wie lautet die Adresse des Arbeitgebers inklusive Postleitzahl? | Wie lautet die Adresse des Arbeitgebers, inklusive Postleitzahl? | Wie lautet die Adresse des Arbeitgebers, einschließlich der Postleitzahl? |
| q8 | Tel.-Nr. | Welche Telefonnummer hat der Arbeitgeber? | = | = |
| q9 | E-Mail | Welche E-Mail-Adresse hat der Arbeitgeber? | = | = |
| q10 | Police-Nr. UVG | Welche Police-Nummer hat die UVG-Versicherung? | = | = |
| q11 | Police-Nr. UVG-Zusatz | Welche Police-Nummer hat die UVG-Zusatzversicherung? | = | = |
| q12 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welcher übliche Arbeitsplatz des Verletzten wird angegeben (z. B. Betriebszweig)? | Welchen Arbeitsplatz hatte die Person, zum Beispiel in welchem Bereich? | Wo arbeitet der Verletzte normalerweise, zum Beispiel in welchem Bereich? |
| q13 | 2 Verletzte / Verletzter | Wie viele Verletzte werden gemeldet? | Wie viele Personen wurden verletzt? | Wie viele Personen sind verletzt? |
| q14 | Name und Vorname | Wie lautet der Name und die Vorname des Verletzten? | Wie lautet der Name und der Vorname der verletzten Person? | Wie heisst die Person? |
| q15 | Geburtsdatum | Wie lautet das Geburtsdatum des Verletzten? | Wie lautet das Geburtsdatum der verletzten Person? | Wann ist die Person geboren? |
| q16 | AHV-Nummer | Wie lautet die AHV-Nummer des Verletzten? | Wie lautet die AHV-Nummer der verletzten Person? | Welche AHV-Nummer hat die Person? |
| q17 | Strasse | Wie lautet die Strasse des Wohnortes? | = | Welche Strasse ist die Wohnadresse? |
| q18 | Tel.-Nr. | Wie lautet die Telefonnummer des Verletzten? | Wie lautet die Telefonnummer der verletzten Person? | Welche Telefonnummer hat die Person? |
| q19 | Zivilstand | Wie lautet der Zivilstand des Verletzten? | Wie ist der Zivilstand der verletzten Person? | Welcher Zivilstand hat die Person? |
| q20 | Land | In welcher Land lebt der Verletzte? | In welchem Land lebt die verletzte Person? | In welchem Land lebt die Person? |
| q21 | PLZ | Wie lautet die Postleitzahl des Wohnortes? | = | Welche Postleitzahl hat die Wohnadresse? |
| q22 | Wohnort | Wie lautet der Wohnort des Verletzten? | Wie lautet der Wohnort der verletzten Person? | Wo wohnt die Person? |
| q23 | Staatsangehörigkeit / Bewilligung | Wie lautet die Staatsangehörigkeit oder Bewilligung des Verletzten? | Welche Staatsangehörigkeit oder Bewilligung hat die verletzte Person? | Welche Staatsangehörigkeit oder Bewilligung hat die Person? |
| q24 | E-Mail | Wie lautet die E-Mail-Adresse des Verletzten? | Wie lautet die E-Mail-Adresse der verletzten Person? | Welche E-Mail-Adresse hat die Person? |
| q25 | 3 Anstellung | Wie lautet die Nummer der Anstellung? | = | Welche Nummer hat die Anstellung? |
| q26 | Datum der Anstellung | Wie lautet das Datum der Anstellung? | Wann wurde die Person angestellt? | Wann ist die Person angestellt worden? |
| q27 | Ausgeübter Beruf | Wie lautet der ausgeübte Beruf? | Welchen Beruf hat die Person ausgeübt? | Welchen Beruf übt die Person aus? |
| q28 | Höheres Kader | Ist es Höheres Kader? | War es ein Höheres Kader? | = |
| q29 | Mittleres Kader | Ist es Mittleres Kader? | War es ein Mittleres Kader? | = |
| q30 | Angestellte/r / Mitarbeiter/in | Ist es Angestellte/r / Mitarbeiter/in? | War es ein Angestellter oder ein Mitarbeiter? | Ist es Angestellte/r oder Mitarbeiter/in? |
| q31 | Lehrling · Praktikant/in | Ist es Lehrling oder Praktikant/in? | War die Person ein Lehrling oder ein Praktikant? | = |
| q32 | unbefristeter Arbeitsvertrag | Ist es ein unbefristeter Arbeitsvertrag? | War der Arbeitsvertrag unbefristet? | Ist der Arbeitsvertrag unbefristet? |
| q33 | befristeter Arbeitsvertrag | Ist es ein befristeter Arbeitsvertrag? | War der Arbeitsvertrag befristet? | Ist der Arbeitsvertrag befristet? |
| q34 | Arbeitsverhältnis gekündigt per | Wann wurde das Arbeitsverhältnis gekündigt? | = | = |
| q35 | – | Welche Art von Arbeitsverhältnis wurde gekündigt? | = | = |
| q36 | Verhältnis | Wie lautet das Verhältnis zum Arbeitgeber? | Wie war das Verhältnis zur Person beim Arbeitgeber? | Wie ist das Verhältnis zur Firma? |
| q37 | – | Wie lautet das Verhältnis zum Arbeitgeber? | Wie war das Verhältnis zur Person beim Arbeitgeber? | **none** |
| q38 | Arbeitszeit des/der Verletzten (Std./Woche) | Wie viele Stunden pro Woche arbeitet der Verletzte? | Wie viele Stunden pro Woche arbeitet die Person? | **none** |
| q39 | Betriebsübliche Vollarbeitszeit (Std./Woche) | Wie viele Stunden pro Woche beträgt die übliche Vollarbeitszeit? | Wie viele Stunden pro Woche beträgt die übliche Vollzeit? | **none** |
| q40 | Vertraglicher Beschäftigungsgrad (Prozent) | Wie hoch ist der Vertragliche Beschäftigungsgrad in Prozent? | = | **none** |
| q41 | unregelmässig | Ist die Arbeitszeit unregelmässig? | = | **none** |
| q42 | Kurzarbeit · Zwischenverdienst | Ist es Kurzarbeit oder Zwischenverdienst? | War es Kurzarbeit oder Zwischenverdienst? | **none** |
| q43 | 4 Schadendatum | Wie lautet das Schadendatum? | Wann ist der Unfall passiert? | **none** |
| q44 | 4 Schadendatum | Wie lautet das Schadendatum? | Wann ist der Unfall passiert? | **none** |
| q45 | Monat | Wie lautet der Monat des Schadendatums? | Welcher Monat ist das Schadendatum? | **none** |
| q46 | Jahr | Wie lautet das Jahr des Schadendatums? | Welches Jahr ist das Schadendatum? | **none** |
| q47 | Tag | Wie lautet der Tag des Schadendatums? | Welcher Tag ist das Schadendatum? | **none** |
| q48 | Zeit (Stunden, Minuten) | Wie lautet die Zeit des Schadendatums (Stunden, Minuten)? | Welche Uhrzeit ist das Schadendatum? | **none** |
| q49 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? | Wo ist der Unfall passiert, zum Beispiel Ort und Strasse? | Wie heißt der Ort und die genaue Adresse, an dem der Unfall passiert ist? |
| q50 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte G | Was war die Tätigkeit zur Zeit des Unfalles? Wie lief der Unfall ab? Welche Gegenstände oder Fahrzeuge waren beteiligt? | Was hat die Person zur Zeit des Unfalles gemacht? Wie ist der Unfall passiert? Welche Dinge oder Fahrzeuge waren dabei? | Was hast du genau gemacht, als der Unfall passiert ist? Wie lief das zu? Welche Dinge oder Fahrzeuge waren dabei? |
| q51 | Beteiligte Person(en) | Wer waren die Beteiligten am Unfall? | Wer war an dem Unfall beteiligt? | Wer waren die anderen Personen, die beim Unfall dabei waren? |
| q52 | Wenn ja, aufgenommen durch | Wurde der Unfall durch die Polizei aufgenommen? Wenn ja, wer hat ihn aufgenommen? | Wurde der Unfall von der Polizei festgehalten? Wenn ja, wer hat ihn festgehalten? | Hat die Polizei den Unfall aufgenommen? Wenn ja, wer hat das gemacht? |
| q53 | Ja · Nein · Unbekannt | Wurde ein Polizeirapport erstellt? Wenn nein, ist er unbekannt? | Wurde ein Polizeibericht gemacht? Wenn nein, ist er nicht bekannt? | Ist ein Polizeirapport gemacht worden? Wenn nicht, ist er uns nicht bekannt? |
| q54 | Besteht ein Polizeirapport? | Wurde ein Unfallprotokoll erstellt? Wenn ja, bitte eine Kopie beilegen. | Wurde ein Unfallprotokoll gemacht? Wenn ja, legen Sie bitte eine Kopie bei. | Ist ein Unfallprotokoll gemacht worden? Wenn ja, kannst du eine Kopie davon mitgeben? |
| q55 | Ja · Nein | Wurde ein Unfallprotokoll erstellt? Wenn nein, ist es nicht erstellt? | Wurde ein Unfallprotokoll gemacht? Wenn nein, wurde es nicht gemacht. | Ist kein Unfallprotokoll gemacht worden? |
| q56 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug,  | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genannt? | Welche Dinge waren am Unfall beteiligt, zum Beispiel Maschine, Werkzeug, Fahrzeug, Arbeitsstoff? | Welche Dinge, wie zum Beispiel Maschinen, Werkzeuge, Fahrzeuge oder Stoffe, waren beim Unfall dabei? |
| q57 | 8 Nichtberufsunfall | Handelt es sich um einen Nichtberufsunfall? | War es ein Unfall, der nicht im Beruf passiert ist? | War es ein Unfall, der nicht im Beruf passiert ist? |
| q58 | Grund der Absenz | Welcher Grund für die Absenz wird angegeben? | Welchen Grund für die Pause wird angegeben? | Welchen Grund gibst du für die Pause an? |
| q59 | Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit) | Wann war das letzte Mal im Betrieb gearbeitet (Wochentag, Datum, Zeit)? | Wann war das letzte Mal gearbeitet, zum Beispiel Wochentag, Datum und Uhrzeit? | Wann war das letzte Mal, dass du im Betrieb gearbeitet hast? Welchen Tag, welches Datum und zu welcher Zeit? |
| q60 | 9 Verletzung | Welche Verletzung wird gemeldet? | = | = |
| q61 | Betroffener Körperteil | Welcher Körperteil ist betroffen? | Welcher Körperteil ist verletzt? | Welchen Körperteil hat die Person verletzt? |
| q62 | links · rechts · unbestimmt | Ist der betroffene Körperteil links, rechts oder unbestimmt? | = | Ist der verletzte Körperteil links, rechts oder unbestimmt? |
| q63 | Seite | Welche Seite des Körpers ist betroffen? | Welche Seite des Körpers ist verletzt? | Welche Seite des Körpers ist verletzt? |
| q64 | Art der Schädigung | Wie lautet die Art der Schädigung? | Wie ist die Verletzung entstanden? | Wie ist die Art der Verletzung? |
| q65 | 10 Arbeitsunfähigkeit | Welche Art von Arbeitsunfähigkeit wird gemeldet? | = | = |
| q66 | Wenn ja, ab wann? | Ab wann ist die Arbeit zufolge Unfalles ausgesetzt? | Ab wann kann die Person nicht mehr arbeiten wegen des Unfalls? | Ab wann kann die Person wegen des Unfalls nicht mehr arbeiten? |
| q67 | Ja · Nein | Ist die Arbeit zufolge Unfalles ausgesetzt? | Ist die Person wegen des Unfalls nicht mehr arbeiten können? | Ist die Person wegen des Unfalls nicht mehr arbeiten? |
| q68 | Arbeit zufolge Unfalles ausgesetzt? | Ist die Arbeit infolge des Unfalles ausgesetzt? | Ist die Person wegen des Unfalls nicht mehr arbeiten können? | Ist die Person wegen des Unfalls nicht mehr arbeiten? |
| q69 | Falls Arbeit wieder aufgenommen: ab wann? | Ab wann wird die Arbeit wieder aufgenommen? | Ab wann kann die Person wieder arbeiten? | Ab wann kann die Person wieder arbeiten? |
| q70 | länger als 1 Monat | Dauert die Arbeitsunfähigkeit länger als einen Monat? | = | = |
| q71 | ganz · teilweise | Wird die Arbeit ganz oder teilweise wieder aufgenommen? | Wird die Person ganz oder teilweise wieder arbeiten? | = |
| q72 | 11 Arztadressen | Wie lautet die Adresse des Erstbehandlers bzw. des Spitals/Klinik? | Wie lautet die Adresse des Arztes oder des Spitals, wo die Person zuerst behandelt wurde? | Wie lautet die Adresse des Arztes oder des Krankenhauses? |
| q73 | Erstbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des Nachbehandlers bzw. des Spitals/Klinik? | Wie lautet die Adresse des Arztes oder des Spitals, wo die Person nachbehandelt wird? | Wie lautet die Adresse des Arztes oder des Krankenhauses, wo die Behandlung stattgefunden hat? |
| q74 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des Nachbehandlers bzw. des Spitals/Klinik? | Wie lautet die Adresse des Arztes oder des Spitals, wo die Person nachbehandelt wird? | Wie lautet die Adresse des Arztes oder des Krankenhauses, wo die Behandlung stattgefunden hat? |
| q75 | ambulant · stationär | War die Erstbehandlung ambulant oder stationär? | War die Erstbehandlung ambulant oder im Spital? | War die erste Behandlung beim Arzt oder im Krankenhaus ambulant oder stationär? |
| q76 | ambulant · stationär | War die Nachbehandlung ambulant oder stationär? | War die Nachbehandlung ambulant oder im Spital? | War die Nachbehandlung beim Arzt oder im Krankenhaus ambulant oder stationär? |
| q77 | Erstbehandlung, falls Spital/Klinik | War die Erstbehandlung ambulant oder stationär, falls Spital/Klinik? | War die Erstbehandlung ambulant oder im Spital, falls Spital? | War die erste Behandlung beim Arzt oder im Krankenhaus ambulant oder stationär? |
| q78 | Nachbehandlung, falls Spital/Klinik | War die Nachbehandlung ambulant oder stationär, falls Spital/Klinik? | War die Nachbehandlung ambulant oder im Spital, falls Spital? | War die Nachbehandlung beim Arzt oder im Krankenhaus ambulant oder stationär? |
| q79 | CHF pro Stunde · CHF pro Monat · CHF pro Jahr | Wie hoch ist der Lohn pro Stunde, pro Monat oder pro Jahr? | = | = |
| q80 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtz | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) werden angegeben? | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage werden angegeben? | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage werden gezahlt? |
| q81 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtz | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) werden angegeben? | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage werden angegeben? | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage werden gezahlt? |
| q82 | Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.) | Wie viele Kinder hat der Verletzte (bis 18 Jahre, in Ausbildung bis 25 Jahre)? | Wie viele Kinder hat die Person, bis 18 Jahre oder in Ausbildung bis 25 Jahre? | Wie viele Kinder hat die betroffene Person, bis zu 18 oder 25 Jahren? |
| q83 | Bezeichnung der anderen Lohnzulagen | Welche Bezeichnung der anderen Lohnzulagen wird angegeben? | = | Welche Bezeichnung für andere Lohnzulagen wird angegeben? |
| q84 | 13 Sonderfälle | Gibt es besondere Versicherungsverhältnisse? | = | = |
| q85 | Wenn ja, Name und Adresse | Wenn ja, wie lautet der Name und die Adresse? | = | Wenn ja, wie heißt die Person und wo wohnt sie? |
| q86 | Nein · Ja | Gibt es keine besonderen Versicherungsverhältnisse? | = | Gibt es besondere Versicherungsverhältnisse? |
| q87 | Quellensteuerpflicht | Besteht eine Quellensteuerpflicht? | = | = |
| q88 | Freiwillige Versicherung (Arbeitgeber / Selbständigerwerbend | Besteht eine freiwillige Versicherung (Arbeitgeber / Selbständigerwerbende)? | Besteht eine freiwillige Versicherung, zum Beispiel vom Arbeitgeber oder Selbständiger? | Besteht eine freiwillige Versicherung vom Arbeitgeber oder als Selbständiger? |
| q89 | Familienmitglied / Gesellschafter | Besteht eine freiwillige Versicherung (Familienmitglied / Gesellschafter)? | Besteht eine freiwillige Versicherung, zum Beispiel für ein Familienmitglied oder Gesellschafter? | Besteht eine freiwillige Versicherung für ein Familienmitglied oder einen Gesellschafter? |
| q90 | Entsandte/r | Besteht eine freiwillige Versicherung (Entsandte/r)? | Besteht eine freiwillige Versicherung, zum Beispiel für Entsandte? | Besteht eine freiwillige Versicherung für eine entsandte Person? |
| q91 | 14 Andere Sozialversicherungsleistungen | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? | = | = |
| q92 | Wenn ja, wo? | Wenn ja, wo gibt es Ansprüche? | = | Wo gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q93 | Nein · Ja | Gibt es keine Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? | = | = |
| q94 | Anspruch auf Taggeld oder Rente bei einer anderen Sozialvers | Besteht ein Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | = | = |
| q95 | Name der obligatorischen Krankenversicherung (inkl. Police-N | Wie lautet der Name der obligatorischen Krankenversicherung inklusive Police-Nummer? | = | Wie heißt die obligatorische Krankenversicherung inklusive der Police-Nummer? |
| q96 | Ort und Datum | Wie lautet der Ort und das Datum der Unterschrift? | Wo und wann wurde die Unterschrift geleistet? | Wo und wann hat die Person unterschrieben? |

### suva-bagatellunfall

| unit | printed label | before | in one piece | in bundles of twelve |
|---|---|---|---|---|
| q1 | – | Welche Schaden-Nummer wird eingetragen? | = | Welche Schaden-Nummer soll ich eintragen? |
| q2 | Schaden-Nummer | Welche Schaden-Nummer wird eingetragen? | = | Welche Schaden-Nummer soll ich eintragen? |
| q3 | Tel.-Nr. | Welche Telefon-Nummer wird eingetragen? | = | Welche Telefon-Nummer soll ich eintragen? |
| q4 | Kunden-Nr. | Welche Kunden-Nummer wird eingetragen? | = | Welche Kunden-Nummer soll ich eintragen? |
| q5 | Name und Adresse mit Postleitzahl | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? | = | = |
| q6 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? | = | Welcher übliche Arbeitsplatz des Verletzten, also welcher Bereich im Betrieb, soll eingetragen werden? |
| q7 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information soll an dieser Stelle eingetragen werden? |
| q8 | Geburtsdatum | Welches Geburtsdatum wird eingetragen? | = | Wann ist die Person geboren? |
| q9 | AHV-Nummer | Welche AHV-Nummer wird eingetragen? | = | Welche AHV-Nummer soll eingetragen werden? |
| q10 | Name und Vorname | Wie lautet der Name und der Vorname des Verletzten? | = | = |
| q11 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information soll an dieser Stelle eingetragen werden? |
| q12 | Staatsangehörigkeit | Welche Staatsangehörigkeit wird eingetragen? | = | Welche Staatsangehörigkeit soll eingetragen werden? |
| q13 | Strasse | Wie lautet die Strasse des Wohnorts? | = | Welche Strasse ist der Wohnort? |
| q14 | Staatsangehörigkeit | Welche Staatsangehörigkeit wird eingetragen? | = | Welche Staatsangehörigkeit hat die Person? |
| q15 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q16 | Zivilstand | Welcher Zivilstand wird eingetragen? | = | = |
| q17 | Ausgeübter Beruf | Welcher ausgeübte Beruf wird eingetragen? | = | Welchen Beruf übt die Person aus? |
| q18 | Datum der Anstellung | Welches Datum der Anstellung wird eingetragen? | = | = |
| q19 | 씲 Höheres Kader | Welche Tätigkeit wird als ßöhres Kader bezeichnet? | = | = |
| q20 | 씲 Mittleres Kader | Welche Tätigkeit wird als ßöhres Kader bezeichnet? | = | = |
| q21 | 씲 Angestellte/r / Arbeiter/in | Welche Tätigkeit wird als Angestellte/r / Arbeiter/in bezeichnet? | = | = |
| q22 | 씲 Lehrling · 씲 Praktikant/in | Ist die Person Lehrling oder Praktikant/in? | = | = |
| q23 | 씲 Praktikant/in | Ist die Person Praktikant/in? | = | = |
| q24 | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeitet der/die Verletzte pro Woche? | = | Wie viele Stunden arbeitet die verletzte Person pro Woche? |
| q25 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? | = | Wie heißt der Ort und die genaue Adresse, wo der Unfall passiert ist? |
| q26 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte P | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeübt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Arbeit hast du gerade gemacht, wie ist der Unfall passiert, wer war dabei, was ist kaputt gegangen? |
| q27 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug,  | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genau bezeichnet? | = | Welche Dinge waren dabei, zum Beispiel Maschine, Werkzeug, Auto oder Material? |
| q28 | – | Welches Datum bis wann wurde zuletzt im Betrieb gearbeitet? | = | Wann war das letzte Mal, dass du im Betrieb gearbeitet hast? |
| q29 | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | = | Ist die Verletzung links, rechts oder weißt du das nicht? |
| q30 | Betroffener Körperteil: | Welches betroffene Körperteil wird angegeben? | = | Welches Körperteil ist verletzt? |
| q31 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? | = | Wo ist der Arzt oder das Spital, das dich behandelt? |
| q32 | 10. Arzt- adressen | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? | = | Wo ist der Arzt oder das Spital, das dich behandelt? |
| q33 | Für Rückerstattungsgesuche von bereits bezahlten Rechnungen  | Welche Zahladresse (Post- oder Bankkonto) wird für Rückerstattungsgesuche angegeben? | = | Welche Zahladresse, wie eine Post- oder Banknummer, geben wir für Rückerstattungen an? |
| q34 | – | Welche Schaden-Nummer wird eingetragen? | = | = |
| q35 | Schaden-Nummer | Welche Schaden-Nummer wird eingetragen? | = | = |
| q36 | Tel.-Nr. | Welche Telefon-Nummer wird eingetragen? | = | **none** |
| q37 | Kunden-Nr. | Welche Kunden-Nummer wird eingetragen? | = | = |
| q38 | Name und Adresse mit Postleitzahl | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? | = | = |
| q39 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? | = | = |
| q40 | Geburtsdatum | Welches Geburtsdatum wird eingetragen? | = | Wann ist die Person geboren? |
| q41 | AHV-Nummer | Welche AHV-Nummer wird eingetragen? | = | = |
| q42 | Name und Vorname | Wie lautet der Name und der Vorname des Verletzten? | = | = |
| q43 | Geburtsdatum | Welches Geburtsdatum wird eingetragen? | = | Wann ist die Person geboren? |
| q44 | Staatsangehörigkeit | Welche Staatsangehörigkeit wird eingetragen? | = | = |
| q45 | Strasse | Wie lautet die Strasse des Wohnorts? | = | = |
| q46 | Staatsangehörigkeit | Welche Staatsangehörigkeit wird eingetragen? | = | = |
| q47 | Zivilstand | Welcher Zivilstand wird eingetragen? | = | = |
| q48 | Ausgeübter Beruf | Welcher ausgeübte Beruf wird eingetragen? | = | = |
| q49 | Datum der Anstellung | Welches Datum der Anstellung wird eingetragen? | = | Wann ist die Person angestellt worden? |
| q50 | 씲 Höheres Kader · 씲 Mittleres Kader · 씲 Angestellte/r / Arbe | Ist die Person ßöhres Kader, ßöhres Kader oder Angestellte/r / Arbeiter/in? | = | Ist die Person Kader, Kader oder Angestellte oder Arbeiter? |
| q51 | 씲 Lehrling · 씲 Praktikant/in | Ist die Person Lehrling oder Praktikant/in? | = | Ist die Person Lehrling oder Praktikant? |
| q52 | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeitet der/die Verletzte pro Woche? | = | Wie viele Stunden arbeitet die Person pro Woche? |
| q53 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? | = | Wie heißt der Ort und wo genau ist der Unfall passiert? |
| q54 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte P | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeübt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Arbeit hat die Person gerade gemacht, was ist passiert, wer war dabei, was ist kaputt gegangen? |
| q55 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte P | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeübt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? | Welche Arbeit hat die Person gerade gemacht, was ist passiert, wer war dabei, was ist kaputt gegangen? |
| q56 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q57 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q58 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q59 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q60 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q61 | – | Welche Information wird an dieser Stelle eingetragen? | = | Wann wurde die Person geboren? |
| q62 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welches Geschlecht hat die Person? |
| q63 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welchen Beruf hat die Person? |
| q64 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welchen Vornamen hat die Person? |
| q65 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welchen Nachnamen hat die Person? |
| q66 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Adresse hat die Person? |
| q67 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Telefonnummer hat die Person? |
| q68 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche E-Mail-Adresse hat die Person? |
| q69 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Versicherung ist zuständig? |
| q70 | – | Welche Information wird an dieser Stelle eingetragen? | = | Wann ist der Unfall passiert? |
| q71 | – | Welche Information wird an dieser Stelle eingetragen? | = | Wo ist der Unfall passiert? |
| q72 | – | Welche Information wird an dieser Stelle eingetragen? | = | Was genau ist passiert? |
| q73 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q74 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug,  | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genau bezeichnet? | = | Welche Gegenstände, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff, sind dabei? |
| q75 | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | = | Ist die Verletzung links, rechts oder nicht festgelegt? |
| q76 | Betroffener Körperteil: | Welches betroffene Körperteil wird angegeben? | = | Welches Körperteil ist verletzt? |
| q77 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? | = | Wie lautet die Adresse des Arztes oder des Spitals? |
| q78 | 10. Arzt- adressen | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? | = | Wie lautet die Adresse des Arztes oder des Spitals? |
| q79 | – | Welche Schaden-Nummer wird eingetragen? | = | = |
| q80 | Schaden-Nummer | Welche Schaden-Nummer wird eingetragen? | = | = |
| q81 | Tel.-Nr. | Welche Telefon-Nummer wird eingetragen? | = | = |
| q82 | Kunden-Nr. | Welche Kunden-Nummer wird eingetragen? | = | = |
| q83 | Name und Adresse mit Postleitzahl | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? | = | = |
| q84 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? | = | Welcher übliche Arbeitsplatz des Verletzten, wie der Betriebszweig, wird eingetragen? |
| q85 | Geburtsdatum | Welches Geburtsdatum wird eingetragen? | = | Wann ist die Person geboren? |
| q86 | AHV-Nummer | Welche AHV-Nummer wird eingetragen? | = | Welche AHV-Nummer hat die Person? |
| q87 | Name und Vorname | Wie lautet der Name und der Vorname des Verletzten? | = | Wie heisst die Person, Vorname und Nachname? |
| q88 | – | Welches Geburtsdatum wird eingetragen? | = | Wann ist die Person geboren? |
| q89 | – | Welche Staatsangehörigkeit wird eingetragen? | = | Welche Staatsangehörigkeit hat die Person? |
| q90 | Strasse | Wie lautet die Strasse des Wohnorts? | = | Welche Strasse ist der Wohnort? |
| q91 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q92 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q93 | – | Welche Information wird an dieser Stelle eingetragen? | = | Welche Information wird hier eingetragen? |
| q94 | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | = | = |
| q95 | Betroffener Körperteil: | Welches betroffene Körperteil wird angegeben? | = | = |
| q96 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? | = | Wie lautet die Adresse des Arztes oder des Spitals? |
| q97 | Arzt- adressen | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? | = | Wie lautet die Adresse des Arztes oder des Spitals/Klinik? |
| q98 | Rechnung der Apotheke | Wie lautet die Rechnung der Apotheke? | = | = |
| q99 | Art und Menge | Wie lautet die Art und Menge der abgegebenen Medikamente? | = | = |
| q100 | Datum der Abgabe · Art und Menge · CHF | Wie lautet das Datum der Abgabe, die Art und Menge, der Preis in CHF und der Preis in Rp.? | = | = |
| q101 | – | Welche Information wird an dieser Stelle eingetragen? | = | = |
| q102 | – | Welche Information wird an dieser Stelle eingetragen? | = | = |
| q103 | – | Welche Information wird an dieser Stelle eingetragen? | = | = |
| q104 | – | Welche Information wird an dieser Stelle eingetragen? | = | = |
| q105 | 3 Code | Welcher 3-Code wird eingetragen? | = | = |
| q106 | 3 Code | Welcher 3-Code wird eingetragen? | = | = |
| q107 | 3 Code | Welcher 3-Code wird eingetragen? | = | = |
| q108 | 3 Code | Welcher 3-Code wird eingetragen? | = | = |
| q109 | 3 Code | Welcher 3-Code wird eingetragen? | = | Welchen 3-Code soll ich eintragen? |
| q110 | Total | Wie lautet die Summe (Total)? | = | Wie lautet die Summe, die ich angeben muss? |

"=" is a question that came back unchanged.
