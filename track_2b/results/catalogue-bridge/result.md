# Result: from the form's wording to plain language, with a check back

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 on two forms, 18 calls, all answered with status
200. Counted again from the prompts and answers in `calls/`.

There: the questions the model had written with the labels given are rewritten, twelve per call, with the whole page
in the prompt as a picture of text. Back: the questions without their ids, mixed, twelve per call, with the same page;
the model names the unit of each. A question points to its place when the model names its own unit. The plain question
would hold when it points to its place, else the question in the form's wording when that one does, else only the
printed label.

| form | units | calls | rewritten questions back | of them word for word the same | plain question points to its place | question in the form's wording points to its place | would hold: plain | form's wording | only the label |
|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | 36 | 9 | 36 | 28 | 20 of 36 | 16 of 36 | 20 | 4 | 12 |
| betreibungsbegehren | 17 | 9 | 17 | 17 | 14 of 17 | 11 of 17 | 14 | 0 | 3 |
| both | 53 | 18 | 53 | 45 | 34 of 53 | 27 of 53 | 34 | 4 | 15 |

## The same words asked back twice

A question that came back word for word the same was asked back in two calls, once as the plain version and once as
the form's wording, each time in another mixing.

| form | questions with the same words | both calls name the same unit | both name the own unit | one names the own unit | neither |
|---|---:|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 28 | 9 | 8 | 11 | 9 |
| betreibungsbegehren | 17 | 14 | 11 | 3 | 3 |
| both | 45 | 23 | 19 | 14 | 12 |

## All questions

### arbeitsfaehigkeitszeugnis

| unit | kind | printed label | form's wording | named | plain | named | would hold |
|---|---|---|---|---|---|---|---|
| q1 | choice | w · m | Ist die Person weiblich oder männlich? | **none** | = | own | plain |
| q2 | single | Name / Vorname | Wie lautet der Name und der Vorname der Person? | **none** | = | **q1** | label |
| q3 | single | Geb.-Dat. | Wie lautet das Geburtsdatum der Person? | own | Wann ist die Person geboren? | own | plain |
| q4 | single | Adresse / PLZ | Wie lautet die Adresse und die Postleitzahl der Person? | own | = | **q3** | form |
| q5 | single | AHV-Nr. | Wie lautet die AHV-Nummer der Person? | own | = | own | plain |
| q6 | single | Telefon | Wie lautet die Telefonnummer der Person? | own | = | **q5** | form |
| q7 | single | E-Mail | Wie lautet die E-Mail-Adresse der Person? | own | = | **q6** | form |
| q8 | single | Firmenname | Wie lautet der Firmenname des Arbeitgebers? | **q5** | = | own | plain |
| q9 | single | Kontaktperson | Wie lautet der Name der Kontaktperson beim Arbeitgeber? | **q8** | = | own | plain |
| q10 | single | Adresse / PLZ | Wie lautet die Adresse und die Postleitzahl des Arbeitgebers? | **none** | = | **q8** | label |
| q11 | single | Telefon | Wie lautet die Telefonnummer des Arbeitgebers? | **none** | = | **q12** | label |
| q12 | single | E-Mail | Wie lautet die E-Mail-Adresse des Arbeitgebers? | **q8** | = | **q16** | label |
| q13 | mark | Eintrittsjahr | In welchem Jahr ist die Person in das Unternehmen eingetreten? | **none** | = | **q15** | label |
| q14 | single | Funktion / ausgeübter Beruf * | Welche Funktion oder welchen Beruf übt die Person aus? | own | Welchen Beruf übt die Person aus? | own | plain |
| q15 | single | – | Wie viele Stunden pro Tag arbeitet die Person? | **none** | = | **q17** | label |
| q16 | single | Std. / Tag | Arbeitet die Person in Vollzeit (100 %) oder Teilzeit? | **q14** | = | **q19** | label |
| q17 | mark | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie in Vollzeit (100 %)? | **none** | Arbeitet die Person in Vollzeit (100 %)? | **q13** | label |
| q18 | mark | Teilzeit | Arbeiten Sie in Teilzeit? | own | Arbeitet die Person in Teilzeit? | own | plain |
| q19 | single | – | Wie viele Prozent beträgt die Wochenarbeitszeit? | **q20** | = | **q20** | label |
| q20 | single | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage hat die Person pro Woche? | own | = | own | plain |
| q21 | single | Bei Kündigung: Arbeitsverhältnis gekündigt pe | Wann wurde das Arbeitsverhältnis gekündigt? | **none** | = | own | plain |
| q22 | choice | Krankheit · Unfall | Liegt die Arbeitsunfähigkeit aufgrund von Krankheit, Unfall oder Berufskrankheit vor? | **none** | = | own | plain |
| q23 | choice | REP · Arbeitsplatzbeschrieb | Wird das REP (Ressourcenorientiertes Eingliederungsprofil) oder der Arbeitsplatzbeschrieb verwendet? | **q25** | = | own | plain |
| q24 | single | REP vom | Wann ist das REP erstellt worden? | **none** | = | **q25** | label |
| q25 | single | Arbeitsplatzbeschrieb vom | Wann ist der Arbeitsplatzbeschrieb erstellt worden? | own | Wann wurde der Arbeitsplatzbeschrieb erstellt? | **q24** | form |
| q26 | table | Konsultationsdatum · von | Wann war die letzte Konsultation? Wann begann und endete die Arbeitsunfähigkeit? Wann ist die nächste Konsultation geplant? Wem gehört das Visum? | **none** | = | own | plain |
| q27 | choice | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? Ja oder nein? | own | = | own | plain |
| q28 | choice | Basierend auf * REP | Wird die Beurteilung auf Basis des REP oder des Arbeitsplatzbeschriebs erstellt? | own | = | own | plain |
| q29 | single | REP vom | Wann ist das REP erstellt worden? | **q23** | Wann wurde das REP erstellt? | **q23** | label |
| q30 | single | Arbeitsplatzbeschrieb vom | Wann ist der Arbeitsplatzbeschrieb erstellt worden? | **q25** | Wann wurde der Arbeitsplatzbeschrieb erstellt? | **q23** | label |
| q31 | table | Präsenzzeit Std. pro Tag · Präsenzzeit % Pens | Wie viele Stunden pro Tag ist die Person anwesend? Wie hoch ist der Prozentsatz des Pensums? Wie ist die Leistungsfähigkeit in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist die Arbeitsfähigkeit insgesamt in Prozent? Wann ist die nächste Konsultation? | own | = | own | plain |
| q32 | single | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann soll die Person wieder zu 100 % arbeiten? | **none** | = | own | plain |
| q33 | choice | ja · nein | Wird Kontakt mit dem Arbeitgeber erwünscht? Ja oder nein? | own | = | own | plain |
| q34 | single | Arzt / Ärztin (Name, Stempel) | Wie lautet der Name und der Stempel des Arztes oder der Ärztin? | own | = | own | plain |
| q35 | single | Datum | Wann ist das Formular unterschrieben worden? | own | Wann wurde das Formular unterschrieben? | own | plain |
| q36 | single | Bemerkungen | Welche Bemerkungen gibt es? | own | = | own | plain |

### betreibungsbegehren

| unit | kind | printed label | form's wording | named | plain | named | would hold |
|---|---|---|---|---|---|---|---|
| q1 | single | Bitte in Blockschrift ausfüllen und Hinweise  | Bitte füllen Sie das Formular in Blockschrift aus und lesen Sie die Hinweise auf der Rückseite. | own | = | own | plain |
| q2 | single | Durch das Amt auszufüllen | Welches Amt soll dieses Formular ausfüllen? | own | = | own | plain |
| q3 | single | Eingang | Wann wurde das Formular beim Amt eingegangen? | own | = | own | plain |
| q4 | single | Betreibung Nr. | Welche Nummer hat die Betreibung? | own | = | own | plain |
| q5 | choice | des Gläubigers des Vertreters | Welche Zahlungsverbindung hat der Gläubiger oder sein Vertreter? | own | = | own | plain |
| q6 | single | IBAN | Welche IBAN hat der Gläubiger oder sein Vertreter? | **q5** | = | **q5** | label |
| q7 | single | Forderungsgrund oder Forderungsurkunde mit Da | Welchen Forderungsgrund oder welche Forderungsurkunde mit Datum geben Sie an? | own | = | own | plain |
| q8 | table | Weitere Forderungen | Welche weiteren Forderungen haben Sie? Bitte geben Sie bis zu neun Zeilen an, jede Zeile enthält Betrag, Zins und Zinsdatum. | own | = | own | plain |
| q9 | single | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heißt der Schuldner (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? | **q10** | = | own | plain |
| q10 | single | Adresse des Betreibungsamtes | Welche Adresse hat das Betreibungsamt? | **q4** | = | own | plain |
| q11 | single | Geburtsdatum (falls bekannt) | Wann wurde der Schuldner geboren (falls bekannt)? | own | = | own | plain |
| q12 | single | Gläubiger (Name und Vorname bzw. Firma; Adres | Wie heißt der Gläubiger (Name und Vorname bzw. Firma) und wo wohnt er (Adresse, PLZ, Ort)? | **q9** | = | own | plain |
| q13 | single | vertreten durch (Name und Vorname bzw. Firma; | Wer vertritt den Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort)? | **q6** | = | **q6** | label |
| q14 | single | Telefon oder E-Mail | Welches Telefon oder welche E-Mail hat der Gläubiger für Rückfragen? | own | = | own | plain |
| q15 | single | Bemerkungen | Haben Sie Bemerkungen zum Betreibungsbegehren? | own | = | own | plain |
| q16 | single | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallreferenz (falls vorhanden)? | own | = | own | plain |
| q17 | mark | Die Angaben des vorliegenden Merkblatts stütz | Auf welche Gesetze und Verordnungen stützen sich die Angaben in diesem Merkblatt? | **q1** | = | **q1** | label |

"=" is a question that came back word for word the same; "own" is the unit of the question itself.
