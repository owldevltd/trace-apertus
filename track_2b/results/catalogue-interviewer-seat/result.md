# Result: questions written from the interviewer's seat

Run of 9 October 2026 at temperature 0: swiss-ai/Apertus-v1.5-70B and swiss-ai/Apertus-v1.5-8B, one call per form on
the four forms, with two sentences more in the prompt than before: the model leads the conversation and fills in the
form itself afterwards, and it asks for the matter itself and never asks the other person to enter, tick or fill in
something. 8 calls, all answered with status 200. Counted again from the answers in `calls/`; the two rows without the
interviewer's seat are counted from the calls of `results/catalogue-plain-questions/` (with the labels) and
`results/catalogue-bridge-large-model/` (write).

## Every unit asked?

### 70B

| form | units | seconds | valid JSON | questions returned | units with a question | ids that are no unit | units asked a second time |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 19 | yes | 36 | 36 | 0 | 0 |
| betreibungsbegehren | 17 | 10 | yes | 17 | 17 | 0 | 0 |
| schadenmeldung-uvg | 96 | 49 | yes | 96 | 96 | 0 | 0 |
| suva-bagatellunfall | 110 | 72 | yes | 109 | 109 | 0 | 0 |
| all | 259 | 150 | 4 of 4 | 258 | 258 | 0 | 0 |

### 8B

| form | units | seconds | valid JSON | questions returned | units with a question | ids that are no unit | units asked a second time |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 81 | yes | 36 | 36 | 0 | 0 |
| betreibungsbegehren | 17 | 3 | yes | 17 | 17 | 0 | 0 |
| schadenmeldung-uvg | 96 | 17 | yes | 96 | 96 | 0 | 0 |
| suva-bagatellunfall | 110 | 19 | yes | 111 | 110 | 1 | 0 |
| all | 259 | 120 | 4 of 4 | 260 | 259 | 1 | 0 |

## The language, with and without the interviewer's seat

LIX is the readability index: words per sentence plus the share of words longer than six letters in percent, over all
questions of a form. With an abbreviation: one of bzw., ggf., evtl., inkl., exkl., usw., etc., resp., Nr., Tel., z.
B., d. h. With a bracket or slash: the question holds `(`, `[` or `/`. Impersonal: "wird … eingetragen / angegeben /
ausgefüllt / verwendet / erwünscht", "werden … eingetragen / angegeben" or "soll … eingetragen". Asks to enter: a form
of eintragen, ankreuzen or ausfüllen. Speaks of the form: Formular, Feld, Zeile, Spalte, Kästchen, Tabelle, Stelle,
Merkblatt or Rückseite. Label word for word: a printed label of two words or more stands in the question, letters and
digits compared. Shares a word: a word of four letters or more is equal or begins with the same five letters; a lower
bound, since a right question need not repeat a word.

| variant | questions | LIX per form | with an abbreviation | with a bracket or slash | impersonal | asks to enter | speaks of the form | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|---|
| 8B, labels given | 259 | 34 / 38 / 40 / 42 | 19 | 49 | 78 | 69 | 39 | 23 | 194 of 208 | 110 of 125 |
| 8B, labels given, interviewer's seat | 259 | 36 / 86 / 41 / 40 | 12 | 34 | 0 | 21 | 47 | 33 | 190 of 208 | 108 of 125 |
| 70B, labels given (two forms) | 53 | 40 / 36 | 0 | 4 | 0 | 3 | 4 | 3 | 35 of 45 | 33 of 47 |
| 70B, labels given, interviewer's seat | 258 | 40 / 35 / 42 / 33 | 1 | 19 | 1 | 34 | 12 | 10 | 176 of 208 | 104 of 125 |

### What stands behind "asks to enter"

|  | 70B | 8B |
|---|---|---|
| units answered with "Hier ist nichts einzutragen, bitte weiter zur nächsten Frage." | 33 (per form 0 / 0 / 0 / 33) | 0 |
| of these, units without any printed label | 33 | 0 |
| other questions that ask to enter | 1 | 21 |
| answers that are the printed label and nothing else (letters and digits compared), per form | 0 / 0 / 0 / 0 | 0 / 10 / 0 / 0 |
| answers that do not end on a question mark, per form (the sentence above not counted) | 1 / 5 / 3 / 5 | 0 / 16 / 1 / 0 |

The other question of 70B that asks to enter: "betreibungsbegehren q2: Wird dieses Feld vom Amt ausgefüllt?".

## Who the other person is

Reference: 13 places are about a third party, the two of the Betreibungsbegehren labelled "Schuldner" and
"Geburtsdatum", and the 11 of the section "Verletzte / Verletzter" of the rebuilt accident report
(`tools/forms/schadenmeldung-uvg.js`). A question addresses the other person as that party when it holds "Ihr", "Ihre"
… or "sind / haben / wohnen / heissen / arbeiten / wurden / waren Sie". The rule is the one of
`results/catalogue-list-of-lines/`.

| variant | places about a third party with a question | addressed as that party |
|---|---:|---:|
| 8B, labels given | 13 | 0 |
| 8B, labels given, interviewer's seat | 13 | 1 |
| 70B, labels given (two forms) | 2 | 2 |
| 70B, labels given, interviewer's seat | 13 | 2 |

### The 13 places, 70B from the interviewer's seat

| form | unit | printed label | question | addressed as that party |
|---|---|---|---|---|
| betreibungsbegehren | q9 | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heissen Sie und wo wohnen Sie? Bitte geben Sie Ihren Namen, Ihre Adresse und die Postleitzahl Ihres Wohnorts an. | yes |
| betreibungsbegehren | q11 | Geburtsdatum (falls bekannt) | Wann sind Sie geboren? | yes |
| schadenmeldung-uvg | q14 | Name und Vorname | Wie heisst der Verletzte mit Vorname und Nachname? | no |
| schadenmeldung-uvg | q15 | Geburtsdatum | Wann ist der Verletzte geboren? | no |
| schadenmeldung-uvg | q16 | AHV-Nummer | Wie lautet die AHV-Nummer des Verletzten? | no |
| schadenmeldung-uvg | q17 | Strasse | In welcher Strasse wohnt der Verletzte? | no |
| schadenmeldung-uvg | q18 | Tel.-Nr. | Wie lautet die Telefonnummer des Verletzten? | no |
| schadenmeldung-uvg | q19 | Zivilstand | Welchen Zivilstand hat der Verletzte? | no |
| schadenmeldung-uvg | q20 | Land | In welchem Land lebt der Verletzte? | no |
| schadenmeldung-uvg | q21 | PLZ | Welche Postleitzahl hat der Wohnort des Verletzten? | no |
| schadenmeldung-uvg | q22 | Wohnort | In welcher Gemeinde wohnt der Verletzte? | no |
| schadenmeldung-uvg | q23 | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat der Verletzte? | no |
| schadenmeldung-uvg | q24 | E-Mail | Wie lautet die E-Mail-Adresse des Verletzten? | no |

### The table of further claims of the Betreibungsbegehren (unit q8)

| variant | question |
|---|---|
| 70B, labels given | Gibt es noch weitere Forderungen? Wenn ja, tragen Sie bitte für jede Forderung den Betrag, den Zins und das Datum ein. |
| 70B, interviewer's seat | Gibt es noch weitere Forderungen? Bitte nennen Sie für jede Forderung den Betrag in CHF, den Zinssatz in Prozent und das Datum, ab dem der Zins läuft. |
| 8B, interviewer's seat | Weitere Forderungen |

## All questions

### arbeitsfaehigkeitszeugnis

| unit | kind | printed label | 70B | 8B |
|---|---|---|---|---|
| q1 | choice | w · m | Sind Sie weiblich oder männlich? | Welches Geschlecht haben Sie? |
| q2 | single | Name / Vorname | Wie heissen Sie mit Vor- und Nachname? | Wie lautet Ihr Vorname? |
| q3 | single | Geb.-Dat. | Wann sind Sie geboren? | Wie lautet Ihr Geburtsdatum? |
| q4 | single | Adresse / PLZ | In welcher Gemeinde wohnen Sie und welche Postleitzahl hat diese Gemeinde? | Wie lautet Ihre Adresse und PLZ? |
| q5 | single | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | Wie lautet Ihre AHV-Nummer? |
| q6 | single | Telefon | Unter welcher Telefonnummer sind Sie erreichbar? | Wie lautet Ihre Telefonnummer? |
| q7 | single | E-Mail | Wie lautet Ihre E-Mail-Adresse? | Wie lautet Ihre E-Mail-Adresse? |
| q8 | single | Firmenname | Wie heisst Ihr Arbeitgeber genau? | Wie heißt das Unternehmen, bei dem Sie arbeiten? |
| q9 | single | Kontaktperson | Wer ist die Kontaktperson bei Ihrem Arbeitgeber? | Wie heißt die Kontaktperson bei Ihrem Arbeitgeber? |
| q10 | single | Adresse / PLZ | In welcher Gemeinde und mit welcher Postleitzahl befindet sich Ihr Arbeitsplatz? | Wie lautet die Adresse und PLZ Ihres Arbeitgebers? |
| q11 | single | Telefon | Unter welcher Telefonnummer ist Ihr Arbeitgeber erreichbar? | Wie lautet die Telefonnummer Ihres Arbeitgebers? |
| q12 | single | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? |
| q13 | mark | Eintrittsjahr | In welchem Jahr haben Sie Ihre aktuelle Stelle angetreten? | In welchem Jahr sind Sie bei Ihrem Arbeitgeber eingetreten? |
| q14 | single | Funktion / ausgeübter Beruf * | Welche Funktion haben Sie und welchen Beruf üben Sie aus? | Welche Funktion oder welchen Beruf üben Sie aus? |
| q15 | single | – | Wie viele Stunden arbeiten Sie pro Tag? | Wie viele Stunden arbeiten Sie pro Tag? |
| q16 | single | Std. / Tag | Wie ist Ihre tägliche Arbeitszeit geregelt? | Arbeiten Sie in Vollzeit (100 %) oder Teilzeit? |
| q17 | mark | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie Vollzeit? | Arbeiten Sie in Vollzeit (100 %)? |
| q18 | mark | Teilzeit | Arbeiten Sie Teilzeit? | Arbeiten Sie in Teilzeit? |
| q19 | single | – | Wenn Sie nicht Vollzeit arbeiten, wie viel Prozent beträgt Ihr Pensum? | Wie viele Prozent beträgt Ihre Wochenarbeitszeit? |
| q20 | single | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage haben Sie pro Woche? | Wie viele Einsatztage haben Sie pro Woche? |
| q21 | single | Bei Kündigung: Arbeitsverhältnis gekündigt per | Wurde Ihr Arbeitsverhältnis gekündigt? Wenn ja, wann? | Wann wurde Ihr Arbeitsverhältnis gekündigt? |
| q22 | choice | Krankheit · Unfall · Berufskrankheit | Was ist die Ursache für Ihre Arbeitsunfähigkeit: Krankheit, Unfall oder Berufskrankheit? | Wodurch ist Ihre Arbeitsunfähigkeit verursacht: durch Krankheit, Unfall oder Berufskrankheit? |
| q23 | choice | REP · Arbeitsplatzbeschrieb | Basiert die Beurteilung auf einem REP oder einem Arbeitsplatzbeschrieb? | Wird Ihre Arbeitsunfähigkeit auf Basis eines REP oder eines Arbeitsplatzbeschriebs beurteilt? |
| q24 | single | REP vom | Seit wann gilt das REP oder der Arbeitsplatzbeschrieb? | Wann wurde das REP erstellt? |
| q25 | single | Arbeitsplatzbeschrieb vom | Seit wann gilt der aktuelle Arbeitsplatzbeschrieb? | Wann wurde der Arbeitsplatzbeschrieb erstellt? |
| q26 | table | Konsultationsdatum · von · bis | An welchen Daten waren Sie in den letzten Konsultationen? Von wann bis wann war die Arbeitsunfähigkeit jeweils 100 %? Wann war die nächste Konsultation und wann war das Visum gültig? | Wann war die letzte Konsultation? Wann war die Arbeitsunfähigkeit von? Wann war die Arbeitsunfähigkeit bis? Wann ist die nächste Konsultation? Wann ist das Visum? |
| q27 | choice | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor: ja oder nein? |
| q28 | choice | Basierend auf * REP | Basiert die Beurteilung der Teilarbeitsfähigkeit auf einem REP oder einem Arbeitsplatzbeschrieb? | Wird die Beurteilung der Teilarbeitsfähigkeit auf Basis eines REP oder eines Arbeitsplatzbeschriebs erstellt? |
| q29 | single | REP vom | Seit wann gilt das REP? | Wann wurde das REP erstellt? |
| q30 | single | Arbeitsplatzbeschrieb vom | Seit wann gilt der aktuelle Arbeitsplatzbeschrieb? | Wann wurde der Arbeitsplatzbeschrieb erstellt? |
| q31 | table | Präsenzzeit Std. pro Tag · Präsenzzeit % Pensum · Leistungsfähigkeit i | An welchen Konsultationstagen waren Sie wie viele Stunden pro Tag anwesend, wie viel Prozent Pensum haben Sie geleistet, wie war Ihre Leistungsfähigkeit während der Anwesenheit und wie hoch war Ihre gesamte Arbeitsfähigkeit? Bitte geben Sie diese Angaben für jede Konsultation an. | Wie viele Stunden arbeiten Sie pro Tag? Wie viel Prozent Pensum haben Sie? Wie leistungsfähig sind Sie in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist Ihre Arbeitsfähigkeit insgesamt in Prozent? Wann ist die nächste Konsultation? |
| q32 | single | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann können Sie die Arbeit wieder zu 100 % aufnehmen? | Ab wann können Sie zu 100 % arbeiten? |
| q33 | choice | ja · nein | Wünschen Sie Kontakt mit Ihrer Arbeitgeberin oder Ihrem Arbeitgeber? | Wünschen Sie Kontakt mit Ihrem Arbeitgeber: ja oder nein? |
| q34 | single | Arzt / Ärztin (Name, Stempel) | Wie heisst der Arzt oder die Ärztin, die das Zeugnis ausstellt, und wo können wir diese Person erreichen? | Wie lautet der Name und die Unterschrift des Arztes oder der Ärztin? |
| q35 | single | Datum | Wann wurde das Zeugnis unterschrieben? | Wann ist das Datum der Unterschrift? |
| q36 | single | Bemerkungen | Gibt es noch Bemerkungen, die wir berücksichtigen sollten? | Haben Sie Bemerkungen oder zusätzliche Informationen? |

### betreibungsbegehren

| unit | kind | printed label | 70B | 8B |
|---|---|---|---|---|
| q1 | single | Bitte in Blockschrift ausfüllen und Hinweise auf der Rückseite beachte | Bitte schreiben Sie alles in Druckbuchstaben und beachten Sie die Hinweise auf der Rückseite. | Bitte in Blockschrift ausfüllen und Hinweise auf der Rückseite beachten |
| q2 | single | Durch das Amt auszufüllen | Wird dieses Feld vom Amt ausgefüllt? | Durch das Amt auszufüllen |
| q3 | single | Eingang | Wann ist das Betreibungsbegehren eingegangen? | Eingang |
| q4 | single | Betreibung Nr. | Wie lautet die Nummer dieser Betreibung? | Betreibung Nr. |
| q5 | choice | des Gläubigers des Vertreters | Gehört die Zahlungsverbindung dem Gläubiger oder seinem Vertreter? | des Gläubigers oder des Vertreters |
| q6 | single | IBAN | Wie lautet Ihre IBAN? | IBAN |
| q7 | single | Forderungsgrund oder Forderungsurkunde mit Datum | Was ist der Grund für die Forderung und wann wurde die dazugehörige Urkunde ausgestellt? | Forderungsgrund oder Forderungsurkunde mit Datum |
| q8 | table | Weitere Forderungen | Gibt es noch weitere Forderungen? Bitte nennen Sie für jede Forderung den Betrag in CHF, den Zinssatz in Prozent und das Datum, ab dem der Zins läuft. | Weitere Forderungen |
| q9 | single | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heissen Sie und wo wohnen Sie? Bitte geben Sie Ihren Namen, Ihre Adresse und die Postleitzahl Ihres Wohnorts an. | Name und Adresse des Schuldners, inklusive PLZ und Ort |
| q10 | single | Adresse des Betreibungsamtes | Wie lautet die Adresse des Betreibungsamtes? | Adresse des Betreibungsamtes |
| q11 | single | Geburtsdatum (falls bekannt) | Wann sind Sie geboren? | Geburtsdatum des Schuldners, falls bekannt |
| q12 | single | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heisst der Gläubiger und wo ist er erreichbar? Bitte nennen Sie den Namen, die Adresse und die Postleitzahl. | Name und Adresse des Gläubigers, inklusive PLZ und Ort |
| q13 | single | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wird der Gläubiger von jemandem vertreten? Wenn ja, wie heisst und wo wohnt der Vertreter? | Name und Adresse der Person, die den Gläubiger vertritt |
| q14 | single | Telefon oder E-Mail | Wie kann man Sie für Rückfragen erreichen? Bitte geben Sie Ihre Telefonnummer oder E-Mail-Adresse an. | Telefonnummer oder E-Mail-Adresse für Rückfragen |
| q15 | single | Bemerkungen | Haben Sie noch besondere Hinweise oder Anmerkungen zu diesem Fall? | Bemerkungen |
| q16 | single | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallnummer, die Sie bereits vom Amt erhalten haben? | Ihre Fallreferenz, falls vorhanden |
| q17 | mark | Die Angaben des vorliegenden Merkblatts stützen sich auf die Vorgaben  | Auf welche Gesetze und Verordnungen stützen sich die Angaben auf diesem Merkblatt? | Worauf stützen sich die Angaben im Merkblatt? |

### schadenmeldung-uvg

| unit | kind | printed label | 70B | 8B |
|---|---|---|---|---|
| q1 | single | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall  | Wurde dieses Formular nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall AG erstellt? | Wie lautet der Hinweis oben auf dem Formular, der erklärt, dass es sich um ein Testmaterial handelt? |
| q2 | single | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall  | Wurde dieses Formular nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall AG erstellt? | Wie lautet der Hinweis oben auf dem Formular, der erklärt, dass es sich um ein Testmaterial handelt? |
| q3 | single | Schaden-Nummer | Wie lautet die Schaden-Nummer? | Welches Wort steht auf dem Formular als Überschrift für die Schaden-Nummer? |
| q4 | choice | Unfall · Berufskrankheit | Handelt es sich um einen Unfall, eine Berufskrankheit oder etwas anderes? | Welche beiden Möglichkeiten stehen auf dem Formular als Art der Meldung? |
| q5 | choice | Zahnschaden · Rückfall | Handelt es sich um einen Zahnschaden oder einen Rückfall? | Welche beiden Möglichkeiten stehen auf dem Formular als Art der Meldung? |
| q6 | single | Art der Meldung | Welche Art von Meldung ist das? | Welches Wort steht auf dem Formular als Überschrift für die Art der Meldung? |
| q7 | single | Name und Adresse mit Postleitzahl | Wie lautet der vollständige Name und die Adresse des Arbeitgebers inklusive Postleitzahl? | Wie lautet die Frage zum Namen und zur Adresse mit Postleitzahl? |
| q8 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers? | Wie lautet die Frage zum Telefon? |
| q9 | single | E-Mail | Wie lautet die E-Mail-Adresse des Arbeitgebers? | Wie lautet die Frage zur E-Mail-Adresse? |
| q10 | single | Police-Nr. UVG | Welche Police-Nummer der UVG hat der Arbeitgeber? | Wie lautet die Frage zur Police-Nummer UVG? |
| q11 | single | Police-Nr. UVG-Zusatz | Welche Police-Nummer der UVG-Zusatz hat der Arbeitgeber? | Wie lautet die Frage zur Police-Nummer UVG-Zusatz? |
| q12 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Wo war der Verletzte üblicherweise tätig (Betriebszweig)? | Wie lautet die Frage zum üblichen Arbeitsplatz des Verletzten (Betriebszweig)? |
| q13 | single | 2 Verletzte / Verletzter | Wie viele Verletzte sind zu melden? | Wie lautet die Frage zur Anzahl der Verletzten? |
| q14 | single | Name und Vorname | Wie heisst der Verletzte mit Vorname und Nachname? | Wie lautet die Frage zum Vornamen? |
| q15 | single | Geburtsdatum | Wann ist der Verletzte geboren? | Wie lautet die Frage zum Geburtsdatum? |
| q16 | single | AHV-Nummer | Wie lautet die AHV-Nummer des Verletzten? | Wie lautet die Frage zur AHV-Nummer? |
| q17 | single | Strasse | In welcher Strasse wohnt der Verletzte? | Wie lautet die Frage zur Strasse? |
| q18 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Verletzten? | Wie lautet die Frage zur Telefonnummer? |
| q19 | single | Zivilstand | Welchen Zivilstand hat der Verletzte? | Wie lautet die Frage zum Zivilstand? |
| q20 | single | Land | In welchem Land lebt der Verletzte? | In welcher Gemeinde wohnen Sie? |
| q21 | single | PLZ | Welche Postleitzahl hat der Wohnort des Verletzten? | Welche Postleitzahl steht für den Wohnort? |
| q22 | single | Wohnort | In welcher Gemeinde wohnt der Verletzte? | Welcher Wohnort steht auf dem Formular? |
| q23 | single | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat der Verletzte? | Welche Staatsangehörigkeit oder Bewilligung steht auf dem Formular? |
| q24 | single | E-Mail | Wie lautet die E-Mail-Adresse des Verletzten? | Wie lautet die Frage zur E-Mail-Adresse? |
| q25 | single | 3 Anstellung | Seit wann ist der Verletzte bei diesem Arbeitgeber angestellt? | Wie lautet die Frage zur Anstellung? |
| q26 | single | Datum der Anstellung | Wann hat die Anstellung des Verletzten begonnen? | Wann begann die Anstellung? |
| q27 | single | Ausgeübter Beruf | Welchen Beruf übt der Verletzte aus? | Welchen Beruf übt die Person aus? |
| q28 | mark | Höheres Kader | Ist der Verletzte im höheren Kader? | Ist die Person Kader oder nicht Kader? |
| q29 | mark | Mittleres Kader | Ist der Verletzte im mittleren Kader? | Ist die Person Kader oder nicht Kader? |
| q30 | mark | Angestellte/r / Mitarbeiter/in | Ist der Verletzte Angestellte/r oder Mitarbeiter/in? | Ist die Person Angestellte/r oder Mitarbeiter/in? |
| q31 | choice | Lehrling · Praktikant/in | Ist der Verletzte Lehrling oder Praktikant/in? | Ist die Person Lehrling oder Praktikant/in? |
| q32 | choice | unbefristeter Arbeitsvertrag | Ist das Arbeitsverhältnis unbefristet? | Ist der Arbeitsvertrag unbefristet oder befristet? |
| q33 | mark | befristeter Arbeitsvertrag | Ist das Arbeitsverhältnis befristet? | Ist der Arbeitsvertrag unbefristet oder befristet? |
| q34 | mark | Arbeitsverhältnis gekündigt per | Wurde das Arbeitsverhältnis gekündigt? Wenn ja, bis wann? | Wann wurde das Arbeitsverhältnis gekündigt? |
| q35 | single | – | Was steht hier noch? (keine Beschriftung vorhanden) | Wie ist das Arbeitsverhältnis beendet? |
| q36 | single | Verhältnis | Wie ist das Arbeitsverhältnis geregelt? | Wie ist das Arbeitsverhältnis beendet? |
| q37 | single | – | Was steht hier noch? (keine Beschriftung vorhanden) | Wie ist das Arbeitsverhältnis beendet? |
| q38 | single | Arbeitszeit des/der Verletzten (Std./Woche) | Wie viele Stunden pro Woche arbeitet der Verletzte normalerweise? | Wie viele Stunden arbeitet die Person pro Woche? |
| q39 | single | Betriebsübliche Vollarbeitszeit (Std./Woche) | Wie viele Stunden pro Woche beträgt die betriebsübliche Vollarbeitszeit? | Wie viele Stunden beträgt die betriebsübliche Vollarbeitszeit pro Woche? |
| q40 | single | Vertraglicher Beschäftigungsgrad (Prozent) | Wie hoch ist der vertragliche Beschäftigungsgrad in Prozent? | Wie hoch ist der Vertragliche Beschäftigungsgrad in Prozent? |
| q41 | choice | unregelmässig | Ist der Arbeitseinsatz unregelmässig? | Ist die Arbeitszeit unregelmässig oder nicht unregelmässig? |
| q42 | choice | Kurzarbeit · Zwischenverdienst | Gilt Kurzarbeit oder Zwischenverdienst? | Ist die Arbeitszeit Kurzarbeit oder Zwischenverdienst? |
| q43 | single | 4 Schadendatum | An welchem Tag, Monat und Jahr ist der Schaden passiert? | Wann ist das Schadendatum? |
| q44 | single | 4 Schadendatum | An welchem Tag, Monat und Jahr ist der Schaden passiert? | Wann ist das Schadendatum? |
| q45 | single | Monat | In welchem Monat ist der Schaden passiert? | Welcher Monat ist das Schadendatum? |
| q46 | single | Jahr | In welchem Jahr ist der Schaden passiert? | Welches Jahr ist das Schadendatum? |
| q47 | single | Tag | An welchem Tag ist der Schaden passiert? | Welcher Tag ist das Schadendatum? |
| q48 | single | Zeit (Stunden, Minuten) | Um welche Uhrzeit ist der Schaden passiert (Stunden und Minuten)? | Welche Zeit (Stunden, Minuten) ist das Schadendatum? |
| q49 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wo genau ist der Unfall passiert (Ort oder PLZ und genaue Stelle)? | In welchem Ort (Name oder PLZ) und an welcher Stelle (z. B. Werkstatt, Strasse) ereignete sich der Unfall? |
| q50 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Gegenstände | Was hat der Verletzte zum Zeitpunkt des Unfalls gemacht? Beschreibe bitte auch, was genau passiert ist und welche Gegenstände oder Fahrzeuge beteiligt waren. | Welche Tätigkeit wurde zur Zeit des Unfalles ausgeübt? Beschreiben Sie den Unfallhergang und die beteiligten Gegenstände oder Fahrzeuge. |
| q51 | single | Beteiligte Person(en) | Welche Personen waren beim Vorfall dabei? | Welche Person(en) waren am Unfall beteiligt? |
| q52 | single | Wenn ja, aufgenommen durch | Wenn ein Polizeirapport erstellt wurde, von wem wurde er aufgenommen? | Wenn ja, durch wen wurde der Unfall aufgenommen? |
| q53 | choice | Ja · Nein · Unbekannt | Gibt es einen Polizeirapport? Ja, Nein oder Unbekannt? | Ist ein Polizeirapport vorhanden? Wenn nein, ist er unbekannt? |
| q54 | single | Besteht ein Polizeirapport? | Wurde ein Polizeirapport erstellt? | Ist ein Polizeirapport vorhanden? |
| q55 | choice | Ja · Nein | Gibt es ein Unfallprotokoll? Ja oder Nein? | Ist eine Kopie des Unfallprotokolls beigefügt? |
| q56 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche Gegenstände waren beim Unfall beteiligt (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff)? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) wurden beim Unfall erwähnt? |
| q57 | single | 8 Nichtberufsunfall | Handelt es sich um einen Nichtberufsunfall? | Welche Art von Unfall ist es, wenn es sich nicht um einen Berufsunfall handelt? |
| q58 | single | Grund der Absenz | Weshalb war der Verletzte zuletzt nicht im Betrieb? Was war der Grund der Absenz? | Wann wurde zuletzt im Betrieb gearbeitet? |
| q59 | single | Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit) | Wann hat der Verletzte zuletzt im Betrieb gearbeitet (Wochentag, Datum, Zeit)? | Wann wurde zuletzt im Betrieb gearbeitet? |
| q60 | single | 9 Verletzung | Welcher Körperteil ist verletzt? | Welche Verletzung wurde erlitten? |
| q61 | single | Betroffener Körperteil | Welchen Körperteil betrifft die Verletzung? | Welcher Körperteil wurde verletzt? |
| q62 | choice | links · rechts · unbestimmt | Ist die Verletzung auf der linken Seite, der rechten Seite oder unbestimmt? | Welche Seite des Körpers wurde verletzt? links, rechts oder unbestimmt? |
| q63 | single | Seite | Auf welcher Seite ist die Verletzung? | Welche Seite des Körpers wurde verletzt? |
| q64 | single | Art der Schädigung | Wie lautet die Art der Schädigung? | Welche Art der Schädigung wurde erlitten? |
| q65 | single | 10 Arbeitsunfähigkeit | Ist der Verletzte wegen des Unfalls ganz oder teilweise arbeitsunfähig? Wenn ja, ab wann? | Welche Art von Arbeitsunfähigkeit besteht? |
| q66 | single | Wenn ja, ab wann? | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | Ab wann ist die Person arbeitsunfähig? |
| q67 | choice | Ja · Nein | Wird der Verletzte wegen des Unfalls ganz arbeitsunfähig sein? | Ist die Person aufgrund des Unfalles arbeitsunfähig? |
| q68 | single | Arbeit zufolge Unfalles ausgesetzt? | Ist der Verletzte wegen des Unfalls ganz oder teilweise arbeitsunfähig? | Ist die Person aufgrund des Unfalles arbeitsunfähig? |
| q69 | single | Falls Arbeit wieder aufgenommen: ab wann? | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | Ab wann kann die Person wieder arbeiten? |
| q70 | choice | länger als 1 Monat | Wird die Arbeitsunfähigkeit länger als einen Monat dauern? | Wie lange dauert die Arbeitsunfähigkeit länger als einen Monat? |
| q71 | choice | ganz · teilweise | Wird die Arbeit ganz oder teilweise wieder aufgenommen? | Wie wird die Wiederaufnahme der Arbeit erfolgen? ganz oder teilweise? |
| q72 | single | 11 Arztadressen | Wie heissen der erstbehandelnde und der nachbehandelnde Arzt oder das Spital? | Welche Adresse des Erstbehandlers oder des Spitals/Kliniks steht auf dem Formular? |
| q73 | single | Erstbehandelnder Arzt bzw. Spital/Klinik | Wo wurde der Verletzte zuerst behandelt (Arzt oder Spital)? | Welche Adresse des Nachbehandlers oder des Spitals/Kliniks steht auf dem Formular? |
| q74 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wo wird der Verletzte nachbehandelt (Arzt oder Spital)? | Welche Adresse des Nachbehandlers oder des Spitals/Kliniks steht auf dem Formular? |
| q75 | choice | ambulant · stationär | War die Erstbehandlung ambulant oder stationär? | War die Erstbehandlung ambulant oder stationär? |
| q76 | choice | ambulant · stationär | War die Nachbehandlung ambulant oder stationär? | War die Nachbehandlung ambulant oder stationär? |
| q77 | single | Erstbehandlung, falls Spital/Klinik | Wie war die Erstbehandlung, falls im Spital oder in der Klinik? | War die Erstbehandlung ambulant oder stationär? |
| q78 | single | Nachbehandlung, falls Spital/Klinik | Wie war die Nachbehandlung, falls im Spital oder in der Klinik? | War die Nachbehandlung ambulant oder stationär? |
| q79 | table | CHF pro Stunde · CHF pro Monat · CHF pro Jahr | Wie hoch ist der Lohn pro Stunde, pro Monat und pro Jahr für den vertraglichen Grundlohn inklusive Teuerungszulage? | Wie viel CHF pro Stunde, pro Monat und pro Jahr sind im Vertraglichen Grundlohn inkl. Teuerungszulage enthalten? |
| q80 | single | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage gibt es? | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) sind enthalten? |
| q81 | single | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage gibt es? | Welche anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) sind enthalten? |
| q82 | single | Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.) | Wie viele Kinder (bis 18 Jahre, in Ausbildung bis 25 Jahre) hat der Verletzte? | Wie viele Kinder unter 18 Jahren oder in Ausbildung bis 25 Jahren gibt es? |
| q83 | single | Bezeichnung der anderen Lohnzulagen | Wie heissen die anderen Lohnzulagen genau? | Welche Bezeichnung der anderen Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage) sind enthalten? |
| q84 | single | 13 Sonderfälle | Gibt es besondere Fälle oder Anmerkungen zu vermerken? | Gibt es besondere Versicherungsverhältnisse? |
| q85 | single | Wenn ja, Name und Adresse | Wenn ja, wie heisst der Arbeitgeber und wo ist er ansässig? | Wenn ja, wie lautet der Name und die Adresse des weiteren Arbeitgebers? |
| q86 | choice | Nein · Ja | Gibt es einen weiteren Arbeitgeber? | Gibt es keine besonderen Versicherungsverhältnisse? |
| q87 | mark | Quellensteuerpflicht | Ist eine Quellensteuerpflicht gegeben? | Besteht eine Quellensteuerpflicht? |
| q88 | mark | Freiwillige Versicherung (Arbeitgeber / Selbständigerwerbende) | Besteht eine freiwillige Versicherung beim Arbeitgeber oder als Selbständigerwerbender? | Besteht eine freiwillige Versicherung durch den Arbeitgeber oder Selbständigerwerbende? |
| q89 | mark | Familienmitglied / Gesellschafter | Handelt es sich um eine Versicherung über ein Familienmitglied oder einen Gesellschafter? | Besteht eine freiwillige Versicherung durch Familienmitglieder oder Gesellschafter? |
| q90 | mark | Entsandte/r | Ist der Verletzte entsandt? | Besteht eine freiwillige Versicherung durch Entsandte/r? |
| q91 | single | 14 Andere Sozialversicherungsleistungen | Bezieht der Verletzte Leistungen von einer anderen Sozialversicherung? | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q92 | single | Wenn ja, wo? | Wenn ja, bei welcher Stelle? | Wenn ja, wo gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q93 | choice | Nein · Ja | Besteht Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | Gibt es keine Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q94 | single | Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | Bezieht der Verletzte Leistungen von einer anderen Sozialversicherung? | Gibt es Ansprüche auf Taggeld oder Rente bei einer anderen Sozialversicherung? |
| q95 | single | Name der obligatorischen Krankenversicherung (inkl. Police-Nr.) | Wie heisst die obligatorische Krankenversicherung inklusive Police-Nummer? | Wie lautet der Name der obligatorischen Krankenversicherung inkl. Police-Nummer? |
| q96 | single | Ort und Datum | Wo und wann wurde die Meldung unterschrieben? | In welchem Ort und wann wurde das Formular unterschrieben? |

### suva-bagatellunfall

| unit | kind | printed label | 70B | 8B |
|---|---|---|---|---|
| q1 | single | – | **none** | Welche Schaden-Nummer haben Sie? |
| q2 | single | Schaden-Nummer | Wie lautet die Schaden-Nummer? | Wie lautet die Schaden-Nummer? |
| q3 | single | Tel.-Nr. | Was ist Ihre Telefonnummer? | Welche Telefonnummer haben Sie? |
| q4 | single | Kunden-Nr. | Welche Kunden-Nummer hat Ihr Arbeitgeber bei der Suva? | Welche Kunden-Nummer haben Sie? |
| q5 | single | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | Wie lautet Ihr Name und Ihre Adresse mit Postleitzahl? |
| q6 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Wo ist der übliche Arbeitsplatz im Betrieb? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) ist angegeben? |
| q7 | mark | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q8 | single | Geburtsdatum | Wann sind Sie geboren? | Welches Geburtsdatum ist einzutragen? |
| q9 | single | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | Welche AHV-Nummer ist einzutragen? |
| q10 | single | Name und Vorname | Wie heissen Sie mit Vorname und Name? | Wie lautet der Name und Vorname des Verletzten? |
| q11 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q12 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | Welche Staatsangehörigkeit ist einzutragen? |
| q13 | single | Strasse | In welcher Strasse wohnen Sie? | Welche Strasse ist einzutragen? |
| q14 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | Welche Staatsangehörigkeit ist einzutragen? |
| q15 | mark | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q16 | single | Zivilstand | Sind Sie ledig, verheiratet oder verwitwet? | Welcher Zivilstand ist einzutragen? |
| q17 | single | Ausgeübter Beruf | Welchen Beruf üben Sie aus? | Welcher ausgeübte Beruf ist angegeben? |
| q18 | single | Datum der Anstellung | Wann haben Sie diese Stelle angetreten? | Welches Datum der Anstellung ist einzutragen? |
| q19 | mark | 씲 Höheres Kader | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | Welche Tätigkeit ist als ßähres Kader angegeben? |
| q20 | mark | 씲 Mittleres Kader | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | Welche Tätigkeit ist als ßähres Kader angegeben? |
| q21 | mark | 씲 Angestellte/r / Arbeiter/in | Sind Sie Angestellte/r / Arbeiter/in oder Lehrling? | Welche Tätigkeit ist als Angestellte/r / Arbeiter/in angegeben? |
| q22 | choice | 씲 Lehrling · 씲 Praktikant/in | Sind Sie Lehrling oder Praktikant/in? | Ist die Tätigkeit als Lehrling oder Praktikant/in angegeben? |
| q23 | mark | 씲 Praktikant/in | Sind Sie Praktikant/in? | Ist die Tätigkeit als Praktikant/in angegeben? |
| q24 | single | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeiten Sie pro Woche? | Wie viele Stunden arbeitet der/die Verletzte pro Woche? |
| q25 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wo und an welcher Stelle ist der Unfall passiert? | Welcher Ort (Name oder PLZ) und welche Stelle (z. B. Werkstatt, Strasse) sind angegeben? |
| q26 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Was haben Sie genau gemacht und wie ist der Unfall passiert? | Welcher Sachverhalt ist zur Zeit des Unfalles beschrieben? |
| q27 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche Gegenstände waren beim Unfall beteiligt, zum Beispiel Maschine, Werkzeug oder Fahrzeug? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) sind genau zu bezeichnen? |
| q28 | mark | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welcher Zeitraum ist bis zur letzten Arbeit im Betrieb angegeben? |
| q29 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist der verletzte Körperteil links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q30 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | Welches betroffene Körperteil ist angegeben? |
| q31 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | Welcher Nachbehandelnder Arzt bzw. Spital/Klinik ist angegeben? |
| q32 | single | 10. Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | Welche Angaben sind an den Arztadressen zu machen? |
| q33 | single | Für Rückerstattungsgesuche von bereits bezahlten Rechnungen bitten wir | Wo soll die Rückerstattung der bereits bezahlten Rechnung erfolgen? Bitte geben Sie die Zahladresse an. | Welche Angaben sind für Rückerstattungsgesuche von bereits bezahlten Rechnungen zu machen? |
| q34 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q35 | single | Schaden-Nummer | Wie lautet die Schaden-Nummer? | Welche Schaden-Nummer ist angegeben? |
| q36 | single | Tel.-Nr. | Was ist die Telefonnummer des Arbeitgebers? | Welche Telefonnummer ist angegeben? |
| q37 | single | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber bei der Suva? | Welche Kunden-Nummer ist angegeben? |
| q38 | single | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | Wie lautet Name und Adresse mit Postleitzahl? |
| q39 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Wo ist der übliche Arbeitsplatz im Betrieb? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) ist angegeben? |
| q40 | single | Geburtsdatum | Wann sind Sie geboren? | Welches Geburtsdatum ist einzutragen? |
| q41 | single | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | Welche AHV-Nummer ist einzutragen? |
| q42 | single | Name und Vorname | Wie heissen Sie mit Vorname und Name? | Wie lautet Name und Vorname? |
| q43 | single | Geburtsdatum | Wann sind Sie geboren? | Welches Geburtsdatum ist einzutragen? |
| q44 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | Welche Staatsangehörigkeit ist einzutragen? |
| q45 | single | Strasse | In welcher Strasse wohnen Sie? | Welche Strasse ist einzutragen? |
| q46 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | Welche Staatsangehörigkeit ist einzutragen? |
| q47 | single | Zivilstand | Sind Sie ledig, verheiratet oder verwitwet? | Welcher Zivilstand ist einzutragen? |
| q48 | single | Ausgeübter Beruf | Welchen Beruf üben Sie aus? | Welcher ausgeübte Beruf ist angegeben? |
| q49 | single | Datum der Anstellung | Wann haben Sie diese Stelle angetreten? | Welches Datum der Anstellung ist angegeben? |
| q50 | choice | 씲 Höheres Kader · 씲 Mittleres Kader · 씲 Angestellte/r / Arbeiter/in | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | Ist die Tätigkeit als ßähres Kader, ßähres Kader oder als Angestellte/r / Arbeiter/in angegeben? |
| q51 | choice | 씲 Lehrling · 씲 Praktikant/in | Sind Sie Lehrling oder Praktikant/in? | Ist die Tätigkeit als Lehrling oder Praktikant/in angegeben? |
| q52 | single | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeiten Sie pro Woche? | Wie viele Stunden arbeitet der/die Verletzte pro Woche? |
| q53 | single | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wo und an welcher Stelle ist der Unfall passiert? | Welcher Ort (Name oder PLZ) und welche Stelle (z. B. Werkstatt, Strasse) sind angegeben? |
| q54 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Was haben Sie genau gemacht und wie ist der Unfall passiert? | Welcher Sachverhalt ist zur Zeit des Unfalles beschrieben? |
| q55 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Was haben Sie genau gemacht und wie ist der Unfall passiert? | Welcher Sachverhalt ist zur Zeit des Unfalles beschrieben? |
| q56 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q57 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q58 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q59 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q60 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q61 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q62 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q63 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q64 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q65 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q66 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q67 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q68 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q69 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q70 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q71 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q72 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q73 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q74 | single | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche Gegenstände waren beim Unfall beteiligt, zum Beispiel Maschine, Werkzeug oder Fahrzeug? | Welche beteiligten Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff) sind genau zu bezeichnen? |
| q75 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist der verletzte Körperteil links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q76 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | Welches betroffene Körperteil ist angegeben? |
| q77 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | Welcher Nachbehandelnder Arzt bzw. Spital/Klinik ist angegeben? |
| q78 | single | 10. Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | Welche Angaben sind an den Arztadressen zu machen? |
| q79 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q80 | single | Schaden-Nummer | Wie lautet die Schaden-Nummer? | Welche Schaden-Nummer ist angegeben? |
| q81 | single | Tel.-Nr. | Was ist die Telefonnummer des Arbeitgebers? | Welche Telefonnummer ist angegeben? |
| q82 | single | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber bei der Suva? | Welche Kunden-Nummer ist angegeben? |
| q83 | single | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | Wie lautet Name und Adresse mit Postleitzahl? |
| q84 | single | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Wo ist der übliche Arbeitsplatz im Betrieb? | Welcher übliche Arbeitsplatz des Verletzten (Betriebszweig) ist angegeben? |
| q85 | single | Geburtsdatum | Wann sind Sie geboren? | Welches Geburtsdatum ist einzutragen? |
| q86 | single | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | Welche AHV-Nummer ist einzutragen? |
| q87 | single | Name und Vorname | Wie heissen Sie mit Vorname und Name? | Wie lautet Name und Vorname? |
| q88 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welches Geburtsdatum ist einzutragen? |
| q89 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Staatsangehörigkeit ist einzutragen? |
| q90 | single | Strasse | In welcher Strasse wohnen Sie? | Welche Strasse ist einzutragen? |
| q91 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q92 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q93 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q94 | choice | 씲 links · 씲 rechts · 씲 unbestimmt | Ist der verletzte Körperteil links, rechts oder unbestimmt? | Ist die Verletzung links, rechts oder unbestimmt? |
| q95 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | Welches betroffene Körperteil ist angegeben? |
| q96 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | Welcher Nachbehandelnder Arzt bzw. Spital/Klinik ist angegeben? |
| q97 | single | Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | Welche Angaben sind an den Arztadressen zu machen? |
| q98 | single | Rechnung der Apotheke | Wie lautet die Rechnung der Apotheke? | Wie lautet die Rechnung der Apotheke? |
| q99 | single | Art und Menge | Welche Medikamente wurden abgegeben und in welcher Menge? | Welche Art und Menge sind angegeben? |
| q100 | table | Datum der Abgabe · Art und Menge · CHF | Bitte geben Sie für jede Medikamentenabgabe an: Datum der Abgabe, Art und Menge, Betrag in CHF und Rappen | Welche Angaben sind für Datum der Abgabe, Art und Menge, CHF und Rp. zu machen? |
| q101 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q102 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q103 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q104 | single | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | Welche Angaben sind an dieser Stelle zu machen? |
| q105 | single | 3 Code | Wie lautet der 3er Code? | Welcher 3 Code ist angegeben? |
| q106 | single | 3 Code | Wie lautet der 3er Code? | Welcher 3 Code ist angegeben? |
| q107 | single | 3 Code | Wie lautet der 3er Code? | Welcher 3 Code ist angegeben? |
| q108 | single | 3 Code | Wie lautet der 3er Code? | Welcher 3 Code ist angegeben? |
| q109 | single | 3 Code | Wie lautet der 3er Code? | Welcher 3 Code ist angegeben? |
| q110 | single | Total | Wie hoch ist der Gesamtbetrag der Rechnung? | Welcher Total-Betrag ist angegeben? |
