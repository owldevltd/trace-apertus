# Result: one plain question per unit from the small model, over the picture of text

Two runs of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, one call per form on the four forms: first
with the picture of text and the ids of the units alone, then with the printed label of every unit listed below the
picture. 8 calls, all answered with status 200. Counted again from the answers in `calls/`; the units, their labels
and the names of the form fields are those of `results/catalogue-units/units.json`.

## Every unit asked?

### Without the labels

| form | units | seconds | valid JSON | questions returned | units with a question | ids that are no unit | units asked a second time |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 7 | yes | 36 | 36 | 0 | 0 |
| betreibungsbegehren | 17 | 3 | yes | 17 | 17 | 0 | 0 |
| schadenmeldung-uvg | 96 | 18 | yes | 103 | 96 | 0 | 7 |
| suva-bagatellunfall | 110 | 17 | yes | 110 | 110 | 0 | 0 |
| all | 259 | 45 | 4 of 4 | 266 | 259 | 0 | 7 |

### With the labels

| form | units | seconds | valid JSON | questions returned | units with a question | ids that are no unit | units asked a second time |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 7 | yes | 36 | 36 | 0 | 0 |
| betreibungsbegehren | 17 | 4 | yes | 17 | 17 | 0 | 0 |
| schadenmeldung-uvg | 96 | 17 | yes | 96 | 96 | 0 | 0 |
| suva-bagatellunfall | 110 | 19 | yes | 110 | 110 | 0 | 0 |
| all | 259 | 47 | 4 of 4 | 259 | 259 | 0 | 0 |

## The language of the questions, and the two references

LIX is the readability index: words per sentence plus the share of words longer than six letters in percent, over all
questions of a form. With an abbreviation: one of bzw., ggf., evtl., inkl., exkl., usw., etc., resp., Nr., Tel., z.
B., d. h. With a bracket or slash: the question holds `(`, `[` or `/`. Impersonal: "wird … eingetragen / angegeben /
ausgefüllt / verwendet / erwünscht", "werden … eingetragen / angegeben" or "soll … eingetragen". Asks to enter: a form
of eintragen, ankreuzen or ausfüllen. Speaks of the form: Formular, Feld, Zeile, Spalte, Kästchen, Tabelle, Stelle,
Merkblatt or Rückseite. Label word for word: a printed label of two words or more stands in the question, letters and
digits compared. Shares a word: a word of four letters or more is equal or begins with the same five letters; a lower
bound, since a right question need not repeat a word. The Suva form has no form fields in its PDF.

### Without the labels

| form | questions | LIX | with an abbreviation | with a bracket or slash | impersonal | asks to enter | speaks of the form | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | 36 | 37 | 0 | 0 | 0 | 0 | 0 | 1 | 26 of 28 | 27 of 35 |
| betreibungsbegehren | 17 | 37 | 3 | 3 | 0 | 2 | 4 | 1 | 10 of 17 | 10 of 12 |
| schadenmeldung-uvg | 96 | 43 | 2 | 10 | 5 | 0 | 2 | 1 | 68 of 90 | 65 of 78 |
| suva-bagatellunfall | 110 | 52 | 4 | 7 | 71 | 5 | 2 | 3 | 42 of 73 | 0 of 0 |
| all (LIX per form) | 259 | 37 / 37 / 43 / 52 | 9 | 20 | 76 | 7 | 8 | 6 | 146 of 208 | 102 of 125 |

### With the labels

| form | questions | LIX | with an abbreviation | with a bracket or slash | impersonal | asks to enter | speaks of the form | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | 36 | 34 | 0 | 4 | 2 | 0 | 1 | 1 | 25 of 28 | 26 of 35 |
| betreibungsbegehren | 17 | 38 | 3 | 5 | 0 | 2 | 5 | 0 | 15 of 17 | 12 of 12 |
| schadenmeldung-uvg | 96 | 40 | 6 | 18 | 5 | 0 | 3 | 12 | 81 of 90 | 72 of 78 |
| suva-bagatellunfall | 110 | 42 | 10 | 22 | 71 | 67 | 30 | 10 | 73 of 73 | 0 of 0 |
| all (LIX per form) | 259 | 34 / 38 / 40 / 42 | 19 | 49 | 78 | 69 | 39 | 23 | 194 of 208 | 110 of 125 |

No reference says whether a question asks for what is entered at its place; the two shared-word counts are the only
measures against something outside the model.

## All questions

### arbeitsfaehigkeitszeugnis

| unit | kind | printed label | without the labels | with the labels |
|---|---|---|---|---|
| q1 | choice | w · m | Welches Geschlecht haben Sie? | Ist die Person weiblich oder männlich? |
| q2 | single | Name / Vorname | Wie lautet Ihr Vorname? | Wie lautet der Name und der Vorname der Person? |
| q3 | single | Geb.-Dat. | Wie lautet Ihr Geburtsdatum? | Wie lautet das Geburtsdatum der Person? |
| q4 | single | Adresse / PLZ | Wie lautet Ihre Adresse? | Wie lautet die Adresse und die Postleitzahl der Person? |
| q5 | single | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | Wie lautet die AHV-Nummer der Person? |
| q6 | single | Telefon | Wie lautet Ihre Telefonnummer? | Wie lautet die Telefonnummer der Person? |
| q7 | single | E-Mail | Wie lautet Ihre E-Mail-Adresse? | Wie lautet die E-Mail-Adresse der Person? |
| q8 | single | Firmenname | Wie lautet der Name Ihres Arbeitgebers? | Wie lautet der Firmenname des Arbeitgebers? |
| q9 | single | Kontaktperson | Wie lautet der Name der Kontaktperson bei Ihrem Arbeitgeber? | Wie lautet der Name der Kontaktperson beim Arbeitgeber? |
| q10 | single | Adresse / PLZ | Wie lautet die Adresse Ihres Arbeitgebers? | Wie lautet die Adresse und die Postleitzahl des Arbeitgebers? |
| q11 | single | Telefon | Wie lautet die Telefonnummer Ihres Arbeitgebers? | Wie lautet die Telefonnummer des Arbeitgebers? |
| q12 | single | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | Wie lautet die E-Mail-Adresse des Arbeitgebers? |
| q13 | mark | Eintrittsjahr | In welchem Jahr sind Sie bei Ihrem aktuellen Arbeitgeber eingetreten? | In welchem Jahr ist die Person in das Unternehmen eingetreten? |
| q14 | single | Funktion / ausgeübter Beruf * | Welchen Beruf üben Sie aus? | Welche Funktion oder welchen Beruf übt die Person aus? |
| q15 | single | – | Welche Funktion haben Sie bei Ihrem Arbeitgeber? | Wie viele Stunden pro Tag arbeitet die Person? |
| q16 | single | Std. / Tag | Wie viele Stunden arbeiten Sie pro Tag? | Arbeitet die Person in Vollzeit (100 %) oder Teilzeit? |
| q17 | mark | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie Teilzeit oder Vollzeit? | Arbeiten Sie in Vollzeit (100 %)? |
| q18 | mark | Teilzeit | Arbeiten Sie Teilzeit oder Vollzeit? | Arbeiten Sie in Teilzeit? |
| q19 | single | – | Wie viele Prozent beträgt Ihre Wochenarbeitszeit? | Wie viele Prozent beträgt die Wochenarbeitszeit? |
| q20 | single | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage haben Sie pro Woche? | Wie viele Einsatztage hat die Person pro Woche? |
| q21 | single | Bei Kündigung: Arbeitsverhältnis gekündigt per | Wann wurde Ihr Arbeitsverhältnis gekündigt? | Wann wurde das Arbeitsverhältnis gekündigt? |
| q22 | choice | Krankheit · Unfall · Berufskrankheit | Wodurch ist Ihre Arbeitsunfähigkeit verursacht: durch Krankheit, Unfall oder Berufskrankheit? | Liegt die Arbeitsunfähigkeit aufgrund von Krankheit, Unfall oder Berufskrankheit vor? |
| q23 | choice | REP · Arbeitsplatzbeschrieb | Basieren Ihre Angaben auf einem REP oder einem Arbeitsplatzbeschrieb? | Wird das REP (Ressourcenorientiertes Eingliederungsprofil) oder der Arbeitsplatzbeschrieb verwendet? |
| q24 | single | REP vom | Wie lautet der Arbeitsplatzbeschrieb? | Wann ist das REP erstellt worden? |
| q25 | single | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb erstellt? | Wann ist der Arbeitsplatzbeschrieb erstellt worden? |
| q26 | table | Konsultationsdatum · von · bis | Wie viele Tage dauert die Arbeitsunfähigkeit von 100 %? Bitte geben Sie für jeden Zeitraum an, von wann bis wann und wann die nächste Konsultation stattfindet. | Wann war die letzte Konsultation? Wann begann und endete die Arbeitsunfähigkeit? Wann ist die nächste Konsultation geplant? Wem gehört das Visum? |
| q27 | choice | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor: ja oder nein? | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? Ja oder nein? |
| q28 | choice | Basierend auf * REP | Basieren Ihre Angaben für die Reintegration auf einem REP oder einem Arbeitsplatzbeschrieb? | Wird die Beurteilung auf Basis des REP oder des Arbeitsplatzbeschriebs erstellt? |
| q29 | single | REP vom | Wie lautet der Arbeitsplatzbeschrieb für die Reintegration? | Wann ist das REP erstellt worden? |
| q30 | single | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb für die Reintegration erstellt? | Wann ist der Arbeitsplatzbeschrieb erstellt worden? |
| q31 | table | Präsenzzeit Std. pro Tag · Präsenzzeit % Pensum · Leistungsfähigkeit i | Wie viele Tage haben Sie in der Präsenzzeit, im Pensum und in der Leistungsfähigkeit angegeben? Bitte geben Sie für jeden Zeitraum an, wie viele Stunden pro Tag, wie viel Prozent Pensum und wie die Leistungsfähigkeit in der Präsenzzeit ist. | Wie viele Stunden pro Tag ist die Person anwesend? Wie hoch ist der Prozentsatz des Pensums? Wie ist die Leistungsfähigkeit in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist die Arbeitsfähigkeit insgesamt in Prozent? Wann ist die nächste Konsultation? |
| q32 | single | Wiederaufnahme der Arbeit zu 100 % ab | Ab welchem Datum können Sie zu 100 % arbeiten? | Ab wann soll die Person wieder zu 100 % arbeiten? |
| q33 | choice | ja · nein | Wünschen Sie Kontakt mit Ihrem Arbeitgeber während der Reintegration: ja oder nein? | Wird Kontakt mit dem Arbeitgeber erwünscht? Ja oder nein? |
| q34 | single | Arzt / Ärztin (Name, Stempel) | Wie lautet der Name und die Unterschrift des Arztes oder der Ärztin? | Wie lautet der Name und der Stempel des Arztes oder der Ärztin? |
| q35 | single | Datum | Wie lautet das Datum und die Unterschrift des Arztes oder der Ärztin? | Wann ist das Formular unterschrieben worden? |
| q36 | single | Bemerkungen | Haben Sie Bemerkungen oder zusätzliche Informationen, die Sie angeben möchten? | Welche Bemerkungen gibt es? |

### betreibungsbegehren

| unit | kind | printed label | without the labels | with the labels |
|---|---|---|---|---|
| q1 | single | Bitte in Blockschrift ausfüllen und Hinweise auf der Rückseite beachte | Welches Amt soll dieses Formular ausfüllen? | Bitte füllen Sie das Formular in Blockschrift aus und lesen Sie die Hinweise auf der Rückseite. |
| q2 | single | Durch das Amt auszufüllen | Welches Amt hat das Formular ausgefüllt? | Welches Amt soll dieses Formular ausfüllen? |
| q3 | single | Eingang | Wann wurde das Formular beim Amt eingegangen? | Wann wurde das Formular beim Amt eingegangen? |
| q4 | single | Betreibung Nr. | Welche Nummer hat die Betreibung? | Welche Nummer hat die Betreibung? |
| q5 | choice | des Gläubigers des Vertreters | Welche Zahlungsart wählen Sie: Bankkonto oder Postcheck? | Welche Zahlungsverbindung hat der Gläubiger oder sein Vertreter? |
| q6 | single | IBAN | Wie heißt die Person, die den Gläubiger vertritt? | Welche IBAN hat der Gläubiger oder sein Vertreter? |
| q7 | single | Forderungsgrund oder Forderungsurkunde mit Datum | Welchen Grund nennen Sie für die Forderung? | Welchen Forderungsgrund oder welche Forderungsurkunde mit Datum geben Sie an? |
| q8 | table | Weitere Forderungen | Nennen Sie die neun weiteren Forderungen mit Betrag, Zins und Zinsdatum. | Welche weiteren Forderungen haben Sie? Bitte geben Sie bis zu neun Zeilen an, jede Zeile enthält Betrag, Zins und Zinsdatum. |
| q9 | single | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heißt der Schuldner (Name und Vorname bzw. Firma)? | Wie heißt der Schuldner (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? |
| q10 | single | Adresse des Betreibungsamtes | Wie lautet die Adresse des Betreibungsamtes? | Welche Adresse hat das Betreibungsamt? |
| q11 | single | Geburtsdatum (falls bekannt) | Wie heißt der Schuldner (Name und Vorname bzw. Firma)? | Wann wurde der Schuldner geboren (falls bekannt)? |
| q12 | single | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heißt der Gläubiger (Name und Vorname bzw. Firma)? | Wie heißt der Gläubiger (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? |
| q13 | single | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie lautet die Adresse des Gläubigers? | Wer vertritt den Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort)? |
| q14 | single | Telefon oder E-Mail | Wie lautet die E-Mail-Adresse für Rückfragen? | Welches Telefon oder welche E-Mail hat der Gläubiger für Rückfragen? |
| q15 | single | Bemerkungen | Was ist zu vermerken? | Haben Sie Bemerkungen zum Betreibungsbegehren? |
| q16 | single | Ihre Fallreferenz (falls vorhanden) | Welche Fallreferenz ist vorhanden? | Haben Sie eine Fallreferenz (falls vorhanden)? |
| q17 | mark | Die Angaben des vorliegenden Merkblatts stützen sich auf die Vorgaben  | Welches Gesetz bildet die Grundlage für dieses Formular? | Auf welche Gesetze und Verordnungen stützen sich die Angaben in diesem Merkblatt? |

### schadenmeldung-uvg

| unit | kind | printed label | without the labels | with the labels |
|---|---|---|---|---|
| q1 | single | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall  | Welche Art von Schaden wird gemeldet? | Wie lautet der Hinweis über die Herkunft und den Zweck dieses Formulars? |
| q2 | single | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall  | Welche Felder sind in der Meldung enthalten? | Wie lautet der Hinweis über die Herkunft und den Zweck dieses Formulars? |
| q3 | single | Schaden-Nummer | Welche Art von Schaden ist es nicht? | Welchen Zweck hat die Schaden-Nummer? |
| q4 | choice | Unfall · Berufskrankheit | Ist es ein Berufsunfall oder eine Berufskrankheit? | Handelt es sich um einen Unfall oder eine Berufskrankheit? |
| q5 | choice | Zahnschaden · Rückfall | Ist es ein Zahnschaden oder ein Rückfall? | Handelt es sich um einen Zahnschaden oder einen Rückfall? |
| q6 | single | Art der Meldung | Welche Schaden-Nummer wird verwendet? | Welche Art von Schaden wird gemeldet? |
| q7 | single | Name und Adresse mit Postleitzahl | Wie lautet die Adresse des Arbeitgebers? | Wie lautet die Adresse des Arbeitgebers inklusive Postleitzahl? |
| q8 | single | Tel.-Nr. | Welche Police-Nummer ist angegeben? | Welche Telefonnummer hat der Arbeitgeber? |
| q9 | single | E-Mail | Welche E-Mail-Adresse wird angegeben? | Welche E-Mail-Adresse hat der Arbeitgeber? |
| q10 | single | Police-Nr. UVG | Welche UVG-Police-Nummer ist angegeben? | Welche Police-Nummer hat die UVG-Versicherung? |
| q11 | single | Police-Nr. UVG-Zusatz | Welcher übliche Arbeitsplatz des Verletzten wird angegeben? | Welche Police-Nummer hat die UVG-Zusatzversicherung? |
| q12 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welcher Betriebszweig wird angegeben? | Welcher übliche Arbeitsplatz des Verletzten wird angegeben (z. B. Betriebszweig)? |
| q13 | single | 2 Verletzte / Verletzter | Wie heißt der Verletzte? | Wie viele Verletzte werden gemeldet? |
| q14 | single | Name und Vorname | Wie lautet der Vorname des Verletzten? | Wie lautet der Name und die Vorname des Verletzten? |
| q15 | single | Geburtsdatum | Wie lautet das Geburtsdatum des Verletzten? | Wie lautet das Geburtsdatum des Verletzten? |
| q16 | single | AHV-Nummer | Wie lautet die AHV-Nummer des Verletzten? | Wie lautet die AHV-Nummer des Verletzten? |
| q17 | single | Strasse | Wie lautet die Strasse des Wohnorts? | Wie lautet die Strasse des Wohnortes? |
| q18 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Verletzten? | Wie lautet die Telefonnummer des Verletzten? |
| q19 | single | Zivilstand | Wie lautet der Zivilstand des Verletzten? | Wie lautet der Zivilstand des Verletzten? |
| q20 | single | Land | Wie lautet der Name des Landes, in dem der Verletzte wohnt? | In welcher Land lebt der Verletzte? |
| q21 | single | PLZ | Wie lautet die Postleitzahl des Wohnorts? | Wie lautet die Postleitzahl des Wohnortes? |
| q22 | single | Wohnort | Wie lautet der Wohnort des Verletzten? | Wie lautet der Wohnort des Verletzten? |
| q23 | single | Staatsangehörigkeit / Bewilligung | Wie lautet die Staatsangehörigkeit des Verletzten? | Wie lautet die Staatsangehörigkeit oder Bewilligung des Verletzten? |
| q24 | single | E-Mail | Wie lautet die E-Mail-Adresse des Verletzten? | Wie lautet die E-Mail-Adresse des Verletzten? |
| q25 | single | 3 Anstellung | Welches Datum ist das Anstellungsdatum? | Wie lautet die Nummer der Anstellung? |
| q26 | single | Datum der Anstellung | Welcher ausgeübte Beruf wird angegeben? | Wie lautet das Datum der Anstellung? |
| q27 | single | Ausgeübter Beruf | Welche Stellung hat der Verletzte? | Wie lautet der ausgeübte Beruf? |
| q28 | mark | Höheres Kader | Ist der Verletzte Kader oder nicht Kader? | Ist es Höheres Kader? |
| q29 | mark | Mittleres Kader | Ist der Verletzte Kader oder nicht Kader? | Ist es Mittleres Kader? |
| q30 | mark | Angestellte/r / Mitarbeiter/in | Ist der Verletzte Angestellte/r oder Lehrling? | Ist es Angestellte/r / Mitarbeiter/in? |
| q31 | choice | Lehrling · Praktikant/in | Ist der Verletzte Angestellte/r oder Praktikant/in? | Ist es Lehrling oder Praktikant/in? |
| q32 | choice | unbefristeter Arbeitsvertrag | Ist das Arbeitsverhältnis unbefristet oder befristet? | Ist es ein unbefristeter Arbeitsvertrag? |
| q33 | mark | befristeter Arbeitsvertrag | Ist das Arbeitsverhältnis befristet oder gekündigt per? | Ist es ein befristeter Arbeitsvertrag? |
| q34 | mark | Arbeitsverhältnis gekündigt per | Ist das Arbeitsverhältnis ein Arbeitsvertrag oder Arbeitsvertrag? | Wann wurde das Arbeitsverhältnis gekündigt? |
| q35 | single | – | Ist das Arbeitsverhältnis gekündigt per oder? | Welche Art von Arbeitsverhältnis wurde gekündigt? |
| q36 | single | Verhältnis | Welches Datum ist das Kündigungsdatum? | Wie lautet das Verhältnis zum Arbeitgeber? |
| q37 | single | – | Welches Datum ist das Kündigungsdatum? | Wie lautet das Verhältnis zum Arbeitgeber? |
| q38 | single | Arbeitszeit des/der Verletzten (Std./Woche) | Ist die Arbeitszeit des Verletzten unregelmässig oder Kurzarbeit? | Wie viele Stunden pro Woche arbeitet der Verletzte? |
| q39 | single | Betriebsübliche Vollarbeitszeit (Std./Woche) | Ist die Arbeitszeit des Verletzten Kurzarbeit oder Zwischenverdienst? | Wie viele Stunden pro Woche beträgt die übliche Vollarbeitszeit? |
| q40 | single | Vertraglicher Beschäftigungsgrad (Prozent) | Wie hoch ist der Beschäftigungsgrad des Verletzten in Prozent? | Wie hoch ist der Vertragliche Beschäftigungsgrad in Prozent? |
| q41 | choice | unregelmässig | Ist die Arbeitszeit des Verletzten unregelmässig oder Kurzarbeit? | Ist die Arbeitszeit unregelmässig? |
| q42 | choice | Kurzarbeit · Zwischenverdienst | Ist die Arbeitszeit des Verletzten Kurzarbeit oder Zwischenverdienst? | Ist es Kurzarbeit oder Zwischenverdienst? |
| q43 | single | 4 Schadendatum | Welches Datum ist das Schadendatum? | Wie lautet das Schadendatum? |
| q44 | single | 4 Schadendatum | Welcher Monat ist das Schadendatum? | Wie lautet das Schadendatum? |
| q45 | single | Monat | Welches Jahr ist das Schadendatum? | Wie lautet der Monat des Schadendatums? |
| q46 | single | Jahr | Welche Uhrzeit ist das Schadendatum? | Wie lautet das Jahr des Schadendatums? |
| q47 | single | Tag | Welcher Tag ist das Schadendatum? | Wie lautet der Tag des Schadendatums? |
| q48 | single | Zeit (Stunden, Minuten) | Welche Minuten sind das Schadendatum? | Wie lautet die Zeit des Schadendatums (Stunden, Minuten)? |
| q49 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wie lautet der Ort und die Stelle des Unfallorts? | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? |
| q50 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Gegenstände | Was war die Tätigkeit zur Zeit des Unfalles und wie war der Unfallhergang? | Was war die Tätigkeit zur Zeit des Unfalles? Wie lief der Unfall ab? Welche Gegenstände oder Fahrzeuge waren beteiligt? |
| q51 | single | Beteiligte Person(en) | Wer waren die beteiligten Personen? | Wer waren die Beteiligten am Unfall? |
| q52 | single | Wenn ja, aufgenommen durch | Wurde ein Polizeirapport aufgenommen? | Wurde der Unfall durch die Polizei aufgenommen? Wenn ja, wer hat ihn aufgenommen? |
| q53 | choice | Ja · Nein · Unbekannt | Wurde ein Polizeirapport aufgenommen? Wenn nicht, ist er unbekannt? | Wurde ein Polizeirapport erstellt? Wenn nein, ist er unbekannt? |
| q54 | single | Besteht ein Polizeirapport? | Wurde ein Polizeirapport aufgenommen? Wenn ja, wurde er von wem aufgenommen? | Wurde ein Unfallprotokoll erstellt? Wenn ja, bitte eine Kopie beilegen. |
| q55 | choice | Ja · Nein | Wurde ein Unfallprotokoll erstellt? Wenn ja, wird eine Kopie beigefügt? | Wurde ein Unfallprotokoll erstellt? Wenn nein, ist es nicht erstellt? |
| q56 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche beteiligten Gegenstände waren am Unfall beteiligt? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genannt? |
| q57 | single | 8 Nichtberufsunfall | Welche Art von Unfall ist es, wenn es kein Berufsunfall ist? | Handelt es sich um einen Nichtberufsunfall? |
| q58 | single | Grund der Absenz | Wann wurde zuletzt im Betrieb gearbeitet? | Welcher Grund für die Absenz wird angegeben? |
| q59 | single | Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit) | Wann war das letzte Mal im Betrieb gearbeitet bis zur Absenz? | Wann war das letzte Mal im Betrieb gearbeitet (Wochentag, Datum, Zeit)? |
| q60 | single | 9 Verletzung | Welche Verletzung wurde erlitten? | Welche Verletzung wird gemeldet? |
| q61 | single | Betroffener Körperteil | Welcher Körperteil wurde verletzt? | Welcher Körperteil ist betroffen? |
| q62 | choice | links · rechts · unbestimmt | War die Verletzung links, rechts oder unbestimmt? | Ist der betroffene Körperteil links, rechts oder unbestimmt? |
| q63 | single | Seite | War die Verletzung links, rechts oder unbestimmt? | Welche Seite des Körpers ist betroffen? |
| q64 | single | Art der Schädigung | Welche Art der Schädigung wurde erlitten? | Wie lautet die Art der Schädigung? |
| q65 | single | 10 Arbeitsunfähigkeit | Welche Verletzung wurde erlitten? | Welche Art von Arbeitsunfähigkeit wird gemeldet? |
| q66 | single | Wenn ja, ab wann? | Wann wird die Arbeit aufgrund des Unfalles ausgesetzt? | Ab wann ist die Arbeit zufolge Unfalles ausgesetzt? |
| q67 | choice | Ja · Nein | Wird die Arbeit aufgrund des Unfalles ausgesetzt? Wenn ja, ab wann? | Ist die Arbeit zufolge Unfalles ausgesetzt? |
| q68 | single | Arbeit zufolge Unfalles ausgesetzt? | Wird die Arbeit aufgrund des Unfalles ausgesetzt? Wenn ja, ab wann? | Ist die Arbeit infolge des Unfalles ausgesetzt? |
| q69 | single | Falls Arbeit wieder aufgenommen: ab wann? | Wie lange wird die Arbeitsunfähigkeit voraussichtlich dauern? | Ab wann wird die Arbeit wieder aufgenommen? |
| q70 | choice | länger als 1 Monat | Wird die Arbeitsunfähigkeit länger als einen Monat dauern? | Dauert die Arbeitsunfähigkeit länger als einen Monat? |
| q71 | choice | ganz · teilweise | Wird die Wiederaufnahme der Arbeit ganz oder teilweise erfolgen? | Wird die Arbeit ganz oder teilweise wieder aufgenommen? |
| q72 | single | 11 Arztadressen | Wie lautet die Adresse des Erstbehandlers oder des Spitals/Kliniks? | Wie lautet die Adresse des Erstbehandlers bzw. des Spitals/Klinik? |
| q73 | single | Erstbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des Nachbehandlers oder des Spitals/Kliniks? | Wie lautet die Adresse des Nachbehandlers bzw. des Spitals/Klinik? |
| q74 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie lautet die Adresse des Nachbehandlers oder des Spitals/Kliniks? | Wie lautet die Adresse des Nachbehandlers bzw. des Spitals/Klinik? |
| q75 | choice | ambulant · stationär | War die Erstbehandlung ambulant oder stationär? | War die Erstbehandlung ambulant oder stationär? |
| q76 | choice | ambulant · stationär | War die Nachbehandlung ambulant oder stationär? | War die Nachbehandlung ambulant oder stationär? |
| q77 | single | Erstbehandlung, falls Spital/Klinik | War die Erstbehandlung ambulant oder stationär? | War die Erstbehandlung ambulant oder stationär, falls Spital/Klinik? |
| q78 | single | Nachbehandlung, falls Spital/Klinik | War die Nachbehandlung ambulant oder stationär? | War die Nachbehandlung ambulant oder stationär, falls Spital/Klinik? |
| q79 | table | CHF pro Stunde · CHF pro Monat · CHF pro Jahr | Wie hoch ist der Vertragliche Grundlohn inkl. Teuerungszulage (brutto) pro Stunde? | Wie hoch ist der Lohn pro Stunde, pro Monat oder pro Jahr? |
| q80 | single | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | Wie hoch sind die anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) pro Jahr? | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) werden angegeben? |
| q81 | single | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | Wie hoch sind die anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) pro Jahr? | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) werden angegeben? |
| q82 | single | Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.) | Wie viele Kinder hat der Verletzte bis 18 Jahre, in Ausbildung bis 25 Jahre? | Wie viele Kinder hat der Verletzte (bis 18 Jahre, in Ausbildung bis 25 Jahre)? |
| q83 | single | Bezeichnung der anderen Lohnzulagen | Wie heißen die anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage)? | Welche Bezeichnung der anderen Lohnzulagen wird angegeben? |
| q84 | single | 13 Sonderfälle | Gibt es weitere Arbeitgeber oder besondere Versicherungsverhältnisse? | Gibt es besondere Versicherungsverhältnisse? |
| q85 | single | Wenn ja, Name und Adresse | Ist es kein weiterer Arbeitgeber? | Wenn ja, wie lautet der Name und die Adresse? |
| q86 | choice | Nein · Ja | Ist es kein weiterer Arbeitgeber? Wenn ja, ist es ja? | Gibt es keine besonderen Versicherungsverhältnisse? |
| q87 | mark | Quellensteuerpflicht | Besteht eine Quellensteuerpflicht? | Besteht eine Quellensteuerpflicht? |
| q88 | mark | Freiwillige Versicherung (Arbeitgeber / Selbständigerwerbende) | Ist es eine freiwillige Versicherung des Arbeitgebers? | Besteht eine freiwillige Versicherung (Arbeitgeber / Selbständigerwerbende)? |
| q89 | mark | Familienmitglied / Gesellschafter | Ist es eine freiwillige Versicherung eines Familienmitglieds? | Besteht eine freiwillige Versicherung (Familienmitglied / Gesellschafter)? |
| q90 | mark | Entsandte/r | Ist es eine freiwillige Versicherung eines Entsandten/r? | Besteht eine freiwillige Versicherung (Entsandte/r)? |
| q91 | single | 14 Andere Sozialversicherungsleistungen | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q92 | single | Wenn ja, wo? | Bei welcher anderen Sozialversicherung gibt es Ansprüche? | Wenn ja, wo gibt es Ansprüche? |
| q93 | choice | Nein · Ja | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? Wenn ja, bei welcher? | Gibt es keine Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q94 | single | Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | Gibt es keine Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? | Besteht ein Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q95 | single | Name der obligatorischen Krankenversicherung (inkl. Police-Nr.) | Wie lautet der Name der obligatorischen Krankenversicherung inkl. Police-Nummer? | Wie lautet der Name der obligatorischen Krankenversicherung inklusive Police-Nummer? |
| q96 | single | Ort und Datum | Wie lautet die Unterschrift des Verletzten? | Wie lautet der Ort und das Datum der Unterschrift? |

### suva-bagatellunfall

| unit | kind | printed label | without the labels | with the labels |
|---|---|---|---|---|
| q1 | single | – | Welche Schaden-Nummer wird eingetragen? | Welche Schaden-Nummer wird eingetragen? |
| q2 | single | Schaden-Nummer | Wie lautet der Name des Versicherten? | Welche Schaden-Nummer wird eingetragen? |
| q3 | single | Tel.-Nr. | Welche Telefonnummer des Kunden wird angegeben? | Welche Telefon-Nummer wird eingetragen? |
| q4 | single | Kunden-Nr. | Welcher Betriebsteil wird für den Verletzten angegeben? | Welche Kunden-Nummer wird eingetragen? |
| q5 | single | Name und Adresse mit Postleitzahl | Welche Adresse des Arbeitgebers wird eingetragen? | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? |
| q6 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welche AHV-Nummer des Verletzten wird angegeben? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? |
| q7 | mark | – | Welche Stelle zum Schreiben wird verwendet? | Welche Information wird an dieser Stelle eingetragen? |
| q8 | single | Geburtsdatum | Welches Kästchen wird ausgefüllt? | Welches Geburtsdatum wird eingetragen? |
| q9 | single | AHV-Nummer | Welche Auswahl wird getroffen? | Welche AHV-Nummer wird eingetragen? |
| q10 | single | Name und Vorname | Wie lautet der Vorname des Verletzten? | Wie lautet der Name und der Vorname des Verletzten? |
| q11 | single | – | Welches Geburtsdatum wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q12 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit wird angegeben? | Welche Staatsangehörigkeit wird eingetragen? |
| q13 | single | Strasse | Welche Strasse wird als Wohnort angegeben? | Wie lautet die Strasse des Wohnorts? |
| q14 | single | Staatsangehörigkeit | Welcher Zivilstand wird angegeben? | Welche Staatsangehörigkeit wird eingetragen? |
| q15 | mark | – | Welche Zahl wird für die Staatsangehörigkeit angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q16 | single | Zivilstand | Welche Nummer wird für die Staatsangehörigkeit angegeben? | Welcher Zivilstand wird eingetragen? |
| q17 | single | Ausgeübter Beruf | Welcher Beruf wird ausgeübt? | Welcher ausgeübte Beruf wird eingetragen? |
| q18 | single | Datum der Anstellung | Welches Datum der Anstellung wird angegeben? | Welches Datum der Anstellung wird eingetragen? |
| q19 | mark | 씲 Höheres Kader | Ist die Tätigkeit ein Kader? | Welche Tätigkeit wird als ßöhres Kader bezeichnet? |
| q20 | mark | 씲 Mittleres Kader | Ist die Tätigkeit ein Kader? | Welche Tätigkeit wird als ßöhres Kader bezeichnet? |
| q21 | mark | 씲 Angestellte/r / Arbeiter/in | Ist die Tätigkeit eine Angestellte/r? | Welche Tätigkeit wird als Angestellte/r / Arbeiter/in bezeichnet? |
| q22 | choice | 씲 Lehrling · 씲 Praktikant/in | Ist die Tätigkeit eine Lehrling? | Ist die Person Lehrling oder Praktikant/in? |
| q23 | mark | 씲 Praktikant/in | Welche Stellung wird angegeben? | Ist die Person Praktikant/in? |
| q24 | single | Arbeitszeit des/der Verletzten: Stunden je Woche | Ist die Tätigkeit eine Praktikant/in? | Wie viele Stunden arbeitet der/die Verletzte pro Woche? |
| q25 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Welcher Unfallort wird angegeben? | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? |
| q26 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Welcher Sachverhalt wird beschrieben? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? |
| q27 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche beteiligten Gegenstände werden genannt? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genau bezeichnet? |
| q28 | mark | – | Welche Absenzgründe werden angegeben? | Welches Datum bis wann wurde zuletzt im Betrieb gearbeitet? |
| q29 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q30 | single | Betroffener Körperteil: | Welche Verletzung wird angegeben? | Welches betroffene Körperteil wird angegeben? |
| q31 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Welcher Nachbehandelnde Arzt bzw. Spital/Klinik wird angegeben? | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? |
| q32 | single | 10. Arzt- adressen | Welche Art der Schädigung wird angegeben? | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? |
| q33 | single | Für Rückerstattungsgesuche von bereits bezahlten Rechnungen bitten wir | Welche Zahladresse wird angegeben? | Welche Zahladresse (Post- oder Bankkonto) wird für Rückerstattungsgesuche angegeben? |
| q34 | single | – | Welche Schaden-Nummer wird für das Doppel angegeben? | Welche Schaden-Nummer wird eingetragen? |
| q35 | single | Schaden-Nummer | Welche Schaden-Nummer wird für das Doppel angegeben? | Welche Schaden-Nummer wird eingetragen? |
| q36 | single | Tel.-Nr. | Welche Telefonnummer wird angegeben? | Welche Telefon-Nummer wird eingetragen? |
| q37 | single | Kunden-Nr. | Welcher Betriebsteil wird für den Verletzten angegeben? | Welche Kunden-Nummer wird eingetragen? |
| q38 | single | Name und Adresse mit Postleitzahl | Welche Adresse des Arbeitgebers wird eingetragen? | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? |
| q39 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welche Kunden-Nummer wird angegeben? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? |
| q40 | single | Geburtsdatum | Welches Geburtsdatum wird angegeben? | Welches Geburtsdatum wird eingetragen? |
| q41 | single | AHV-Nummer | Welche AHV-Nummer wird angegeben? | Welche AHV-Nummer wird eingetragen? |
| q42 | single | Name und Vorname | Welcher Name des Verletzten wird angegeben? | Wie lautet der Name und der Vorname des Verletzten? |
| q43 | single | Geburtsdatum | Welcher Wohnort wird angegeben? | Welches Geburtsdatum wird eingetragen? |
| q44 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit wird angegeben? | Welche Staatsangehörigkeit wird eingetragen? |
| q45 | single | Strasse | Welche Strasse wird als Wohnort angegeben? | Wie lautet die Strasse des Wohnorts? |
| q46 | single | Staatsangehörigkeit | Welcher Zivilstand wird angegeben? | Welche Staatsangehörigkeit wird eingetragen? |
| q47 | single | Zivilstand | Welche Nummer wird für die Staatsangehörigkeit angegeben? | Welcher Zivilstand wird eingetragen? |
| q48 | single | Ausgeübter Beruf | Welcher Beruf wird ausgeübt? | Welcher ausgeübte Beruf wird eingetragen? |
| q49 | single | Datum der Anstellung | Welches Datum der Anstellung wird angegeben? | Welches Datum der Anstellung wird eingetragen? |
| q50 | choice | 씲 Höheres Kader · 씲 Mittleres Kader · 씲 Angestellte/r / Arbeiter/in | Ist die Tätigkeit ein Höheres Kader, ein Mittleres Kader oder eine Angestellte/r / Lehrling / Praktikant/in? | Ist die Person ßöhres Kader, ßöhres Kader oder Angestellte/r / Arbeiter/in? |
| q51 | choice | 씲 Lehrling · 씲 Praktikant/in | Ist die Tätigkeit eine Angestellte/r oder eine Lehrling? | Ist die Person Lehrling oder Praktikant/in? |
| q52 | single | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeitet der Verletzte pro Woche? | Wie viele Stunden arbeitet der/die Verletzte pro Woche? |
| q53 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Welcher Unfallort wird angegeben? | Wie lautet der Ort (Name oder PLZ) und die Stelle (z. B. Werkstatt, Strasse) des Unfallorts? |
| q54 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Welcher Sachverhalt wird beschrieben? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? |
| q55 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Welche beteiligten Personen werden genannt? | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeöbt; wie lief der Unfallhergang ab, wer war beteiligt, was wurde beschädigt? |
| q56 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q57 | single | – | Welche beteiligten Fahrzeuge werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q58 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q59 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q60 | single | – | Welche beteiligten Personen werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q61 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q62 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q63 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q64 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q65 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q66 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q67 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q68 | single | – | Welche beteiligten Personen werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q69 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q70 | single | – | Welche beteiligten Personen werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q71 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q72 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q73 | single | – | Welche beteiligten Gegenstände werden genannt? | Welche Information wird an dieser Stelle eingetragen? |
| q74 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche beteiligten Gegenstände werden genannt? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) werden genau bezeichnet? |
| q75 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q76 | single | Betroffener Körperteil: | Welche Verletzung wird angegeben? | Welches betroffene Körperteil wird angegeben? |
| q77 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Welcher Nachbehandelnde Arzt bzw. Spital/Klinik wird angegeben? | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? |
| q78 | single | 10. Arzt- adressen | Welche Art der Schädigung wird angegeben? | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? |
| q79 | single | – | Welche Schaden-Nummer wird für das Apothekerschein UVG angegeben? | Welche Schaden-Nummer wird eingetragen? |
| q80 | single | Schaden-Nummer | Welche Telefonnummer wird angegeben? | Welche Schaden-Nummer wird eingetragen? |
| q81 | single | Tel.-Nr. | Welche Kunden-Nummer wird angegeben? | Welche Telefon-Nummer wird eingetragen? |
| q82 | single | Kunden-Nr. | Welcher Betriebsteil wird für den Verletzten angegeben? | Welche Kunden-Nummer wird eingetragen? |
| q83 | single | Name und Adresse mit Postleitzahl | Welche Adresse des Arbeitgebers wird eingetragen? | Wie lautet der Name und die Adresse mit Postleitzahl des Arbeitgebers? |
| q84 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Welche Nummer wird für die Kunden-Nummer angegeben? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) wird eingetragen? |
| q85 | single | Geburtsdatum | Welches Geburtsdatum wird angegeben? | Welches Geburtsdatum wird eingetragen? |
| q86 | single | AHV-Nummer | Welche AHV-Nummer wird angegeben? | Welche AHV-Nummer wird eingetragen? |
| q87 | single | Name und Vorname | Welcher Name des Verletzten wird angegeben? | Wie lautet der Name und der Vorname des Verletzten? |
| q88 | single | – | Welcher Wohnort wird angegeben? | Welches Geburtsdatum wird eingetragen? |
| q89 | single | – | Welche Staatsangehörigkeit wird angegeben? | Welche Staatsangehörigkeit wird eingetragen? |
| q90 | single | Strasse | Welche Strasse wird als Wohnort angegeben? | Wie lautet die Strasse des Wohnorts? |
| q91 | single | – | Welche Nummer wird für die Staatsangehörigkeit angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q92 | single | – | Welcher Zivilstand wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q93 | single | – | Welche Schaden-Nummer wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q94 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q95 | single | Betroffener Körperteil: | Welche Verletzung wird angegeben? | Welches betroffene Körperteil wird angegeben? |
| q96 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Welcher Nachbehandelnde Arzt bzw. Spital/Klinik wird angegeben? | Wie lautet die Adresse des nachbehandelnden Arztes bzw. Spitals/Klinik? |
| q97 | single | Arzt- adressen | Welche Art der Schädigung wird angegeben? | Wie lautet die Adresse des Arztes bzw. Spitals/Klinik? |
| q98 | single | Rechnung der Apotheke | Welche Rechnung der Apotheke wird angegeben? | Wie lautet die Rechnung der Apotheke? |
| q99 | single | Art und Menge | Welches Datum der Abgabe wird angegeben? | Wie lautet die Art und Menge der abgegebenen Medikamente? |
| q100 | table | Datum der Abgabe · Art und Menge · CHF | Welche Menge wird angegeben? | Wie lautet das Datum der Abgabe, die Art und Menge, der Preis in CHF und der Preis in Rp.? |
| q101 | single | – | Welche Art wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q102 | single | – | Welcher Preis in CHF wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q103 | single | – | Welches Rp. wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q104 | single | – | Welches Datum wird angegeben? | Welche Information wird an dieser Stelle eingetragen? |
| q105 | single | 3 Code | Welcher Code wird angegeben? | Welcher 3-Code wird eingetragen? |
| q106 | single | 3 Code | Welche Nummer wird angegeben? | Welcher 3-Code wird eingetragen? |
| q107 | single | 3 Code | Welche Nummer wird angegeben? | Welcher 3-Code wird eingetragen? |
| q108 | single | 3 Code | Welche Nummer wird angegeben? | Welcher 3-Code wird eingetragen? |
| q109 | single | 3 Code | Welche Postkonto-Nr. oder zugeteilte Suva-Nr. wird angegeben? | Welcher 3-Code wird eingetragen? |
| q110 | single | Total | Welche Total wird angegeben? | Wie lautet die Summe (Total)? |
