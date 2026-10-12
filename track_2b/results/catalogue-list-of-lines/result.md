# Result: questions written and checked over the list of lines

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-70B at temperature 0 on the four forms: one call per form writes a
question per unit over the form as a list of lines; then the questions are asked back twice in another mixing, twelve
per call, with the list of lines of their page. 52 calls, 4 to write and 48 to check, all answered with status 200.
Counted again from the prompts and answers in `calls/`.

A question holds when both runs of the check name its own unit. It is rejected when the runs differ or one names
nothing ("runs differ"), or when both name the same other unit.

| form | units | answered KEINE | no line from the model | questions | hold | rejected | of these: runs differ | both name the same other unit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 2 | 0 | 34 | **29** | 5 | 4 | 1 |
| betreibungsbegehren | 17 | 0 | 0 | 17 | **17** | 0 | 0 | 0 |
| schadenmeldung-uvg | 96 | 2 | 10 | 84 | **70** | 14 | 3 | 11 |
| suva-bagatellunfall | 110 | 0 | 0 | 110 | **66** | 44 | 31 | 13 |
| all | 259 | 4 | 10 | 245 | **182** | 63 | 38 | 25 |

## What the check lets through: errors put in on purpose

No further call. Every place is handed the question written for another place of the same page: for its neighbour in
the list (the one before and the one after), and for a random other place in 20 mixings of the page. The error passes
when both runs of the check had named exactly this place for that question.

| form | neighbour's question passes | another place's question passes |
|---|---|---|
| arbeitsfaehigkeitszeugnis | 0 of 66 | 1 of 662 |
| betreibungsbegehren | 0 of 30 | 0 of 299 |
| schadenmeldung-uvg | 5 of 164 | 0 of 1633 |
| suva-bagatellunfall | 7 of 214 | 9 of 2131 |
| all | 12 of 474 (2.5 %) | 10 of 4725 (0.2 %) |

## What the check does not see

### Places the PDF has no form field for

On the three forms with form fields, 23 units lie on no form field of the PDF: places for the office, section bars and
notes the geometry takes for a field, and one field of the form ("Eintrittsjahr") that was matched to no form field.
Of them 14 got a question that holds, 6 a question that was rejected, 3 none (no line from the model, or KEINE).

| form | unit | printed label | question | holds |
|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | q13 | Eintrittsjahr | In welchem Jahr haben Sie Ihre Stelle angetreten? | yes |
| betreibungsbegehren | q1 | Bitte in Blockschrift ausfüllen und Hinweise auf der Rücksei | Bitte schreiben Sie alles in Blockschrift aus. | yes |
| betreibungsbegehren | q2 | Durch das Amt auszufüllen | Wird dieses Formular vom Amt ausgefüllt? | yes |
| betreibungsbegehren | q3 | Eingang | Wann ist das Formular beim Amt eingegangen? | yes |
| betreibungsbegehren | q4 | Betreibung Nr. | Wie lautet die Nummer dieser Betreibung? | yes |
| betreibungsbegehren | q17 | Die Angaben des vorliegenden Merkblatts stützen sich auf die | Müssen wir für diesen Fall noch etwas Besonderes beachten? | yes |
| schadenmeldung-uvg | q1 | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsa | Ist das eine Erstmeldung oder eine Nachmeldung? | no |
| schadenmeldung-uvg | q2 | Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsa | Gibt es noch weitere Bemerkungen zu dieser Meldung? | no |
| schadenmeldung-uvg | q13 | 2 Verletzte / Verletzter | Wie viele verletzte Personen sind zu melden? | yes |
| schadenmeldung-uvg | q25 | 3 Anstellung | Wann hat die verletzte Person ihre Anstellung begonnen? | no |
| schadenmeldung-uvg | q36 | Verhältnis | Wie war das Arbeitsverhältnis geregelt? | yes |
| schadenmeldung-uvg | q37 | – | KEINE | – |
| schadenmeldung-uvg | q43 | 4 Schadendatum | An welchem Datum ist der Schaden passiert? | yes |
| schadenmeldung-uvg | q44 | 4 Schadendatum | In welchem Monat ist der Schaden passiert? | no |
| schadenmeldung-uvg | q57 | 8 Nichtberufsunfall | Handelt es sich um einen Nichtberufsunfall? | yes |
| schadenmeldung-uvg | q60 | 9 Verletzung | Welche Verletzung liegt vor? | yes |
| schadenmeldung-uvg | q65 | 10 Arbeitsunfähigkeit | Wurde die Arbeit wegen des Unfalls ausgesetzt? | no |
| schadenmeldung-uvg | q72 | 11 Arztadressen | **no line** | – |
| schadenmeldung-uvg | q80 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtz | Welche anderen Lohnzulagen gibt es, zum Beispiel Akkord, Provision, Naturallohn oder Schichtzulage? | yes |
| schadenmeldung-uvg | q81 | Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtz | Wie hoch ist der Betrag dieser anderen Lohnzulage? | yes |
| schadenmeldung-uvg | q84 | 13 Sonderfälle | Gibt es besondere Umstände, die für diesen Fall relevant sind? | yes |
| schadenmeldung-uvg | q91 | 14 Andere Sozialversicherungsleistungen | Bezieht die verletzte Person Taggeld oder Rente von einer anderen Sozialversicherung? | no |
| schadenmeldung-uvg | q94 | Anspruch auf Taggeld oder Rente bei einer anderen Sozialvers | **no line** | – |

### Holding questions against the name of the form field

Shares a word: a word of four letters or more is equal or begins with the same five letters. The Suva form has no form
fields.

| form | holding questions on a form field | share a word with its name | rejected questions on a form field | share a word with its name |
|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 28 | 22 | 5 | 4 |
| betreibungsbegehren | 12 | 9 | 0 | 0 |
| schadenmeldung-uvg | 61 | 55 | 8 | 5 |
| suva-bagatellunfall | 0 | 0 | 0 | 0 |
| all | 101 | 86 | 13 | 9 |

The 15 holding questions that share no word with the name of their form field:

| form | unit | name of the form field | printed label | question |
|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | q1 | Geschlecht | w · m | Sind Sie weiblich oder männlich? |
| arbeitsfaehigkeitszeugnis | q3 | Geburtsdatum | Geb.-Dat. | Wann sind Sie geboren? |
| arbeitsfaehigkeitszeugnis | q4 | Adresse Arbeitnehmer | Adresse / PLZ | In welcher Strasse und Postleitzahl wohnen Sie? |
| arbeitsfaehigkeitszeugnis | q8 | Firmenname | Firmenname | Wie heisst Ihr Arbeitgeber? |
| arbeitsfaehigkeitszeugnis | q29 | REP vom (Teil-AF) | REP vom | Wann stammt das REP oder der Arbeitsplatzbeschrieb, auf den sich die Beurteilung der Teilarbeitsfähigkeit stützt? |
| arbeitsfaehigkeitszeugnis | q35 | Datum | Datum | Wann wird das Zeugnis unterschrieben? |
| betreibungsbegehren | q5 | Zahlungsverbindung | des Gläubigers des Vertreters | Wird der Gläubiger durch einen Vertreter vertreten? |
| betreibungsbegehren | q15 | Bemerkungen | Bemerkungen | Gibt es noch etwas Wichtiges zu ergänzen? |
| betreibungsbegehren | q16 | Fallreferenz | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallnummer, die Sie nennen können? |
| schadenmeldung-uvg | q15 | Geburtsdatum | Geburtsdatum | Wann ist die verletzte Person geboren? |
| schadenmeldung-uvg | q22 | Wohnort | Wohnort | In welcher Gemeinde wohnt die verletzte Person? |
| schadenmeldung-uvg | q59 | Letzter Arbeitstag | Letztmals im Betrieb gearbeitet bis (Wochenta | Bis zu welchem Datum, Wochentag und Uhrzeit war die verletzte Person zuletzt im Betrieb? |
| schadenmeldung-uvg | q62 | Seite | links · rechts | Ist der betroffene Körperteil links, rechts oder unbestimmt? |
| schadenmeldung-uvg | q83 | Bezeichnung Zulagen | Bezeichnung der anderen Lohnzulagen | Wie heissen die anderen Lohnzulagen? |
| schadenmeldung-uvg | q86 | Weiterer Arbeitgeber | Nein · Ja | Müssen Steuern abgezogen werden? Ja oder Nein? |

The 86 that share a word were not read one by one, and the 66 holding questions of the Suva form have no reference.

### Places without a printed label

On the Suva form the model wrote "Ist etwas angekreuzt? (Kästchen)" 2 times and "Was ist hier einzutragen?" 26 times
instead of KEINE; 1 of these hold.

## Who the other person is

Reference: the places about a third party are the two of the Betreibungsbegehren labelled "Schuldner" and
"Geburtsdatum" and those of the section "Verletzte / Verletzter" of the rebuilt accident report
(`tools/forms/schadenmeldung-uvg.js`) that got a question. A question addresses the other person as that party when it
holds "Ihr", "Ihre" … or "sind / haben / wohnen / heissen / arbeiten / wurden / waren Sie".

Places about a third party: 13 (2 and 11). Addressed as that party: **0**.

| form | unit | printed label | question |
|---|---|---|---|
| betreibungsbegehren | q9 | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heisst der Schuldner mit Vorname und Nachname und wo wohnt er? |
| betreibungsbegehren | q11 | Geburtsdatum (falls bekannt) | Wissen Sie das Geburtsdatum des Schuldners? |
| schadenmeldung-uvg | q14 | Name und Vorname | Wie heisst die verletzte Person mit Vorname und Nachname? |
| schadenmeldung-uvg | q15 | Geburtsdatum | Wann ist die verletzte Person geboren? |
| schadenmeldung-uvg | q16 | AHV-Nummer | Wie lautet die AHV-Nummer der verletzten Person? |
| schadenmeldung-uvg | q17 | Strasse | In welcher Strasse wohnt die verletzte Person? |
| schadenmeldung-uvg | q18 | Tel.-Nr. | Wie lautet die Telefonnummer der verletzten Person? |
| schadenmeldung-uvg | q19 | Zivilstand | Wie ist der Zivilstand der verletzten Person? |
| schadenmeldung-uvg | q20 | Land | Aus welchem Land kommt die verletzte Person? |
| schadenmeldung-uvg | q21 | PLZ | In welcher Postleitzahl wohnt die verletzte Person? |
| schadenmeldung-uvg | q22 | Wohnort | In welcher Gemeinde wohnt die verletzte Person? |
| schadenmeldung-uvg | q23 | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat die verletzte Person? |
| schadenmeldung-uvg | q24 | E-Mail | Wie lautet die E-Mail-Adresse der verletzten Person? |

## The language of the questions

LIX is the readability index: words per sentence plus the share of words longer than six letters in percent, over all
questions of a form. With an abbreviation: one of bzw., ggf., evtl., inkl., exkl., usw., etc., resp., Nr., Tel., z.
B., d. h. With a bracket or slash: the question holds `(`, `[` or `/`. Impersonal: "wird … eingetragen / angegeben /
ausgefüllt / verwendet / erwünscht", "werden … eingetragen / angegeben" or "soll … eingetragen". Asks to enter: a form
of eintragen, ankreuzen or ausfüllen. Speaks of the form: Formular, Feld, Zeile, Spalte, Kästchen, Tabelle, Stelle,
Merkblatt or Rückseite. Label word for word: a printed label of two words or more stands in the question, letters and
digits compared. Shares a word: a word of four letters or more is equal or begins with the same five letters; a lower
bound, since a right question need not repeat a word.

| form | questions | LIX | with an abbreviation | with a bracket or slash | impersonal | asks to enter | speaks of the form | label word for word | shares a word with the label | shares a word with the PDF name |
|---|---|---|---|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | 34 | 42 | 0 | 0 | 0 | 0 | 3 | 0 | 21 of 28 | 26 of 33 |
| betreibungsbegehren | 17 | 34 | 0 | 0 | 1 | 1 | 2 | 1 | 13 of 17 | 9 of 12 |
| schadenmeldung-uvg | 84 | 39 | 3 | 0 | 0 | 0 | 4 | 5 | 70 of 80 | 60 of 69 |
| suva-bagatellunfall | 110 | 38 | 0 | 10 | 3 | 32 | 9 | 1 | 66 of 73 | 0 of 0 |
| all (LIX per form) | 245 | 42 / 34 / 39 / 38 | 3 | 10 | 4 | 33 | 18 | 7 | 170 of 198 | 95 of 114 |

## All questions

### arbeitsfaehigkeitszeugnis

| unit | kind | printed label | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|---|
| q1 | choice | w · m | Sind Sie weiblich oder männlich? | own, own | yes |
| q2 | single | Name / Vorname | Wie heissen Sie mit Vorname und Nachname? | own, own | yes |
| q3 | single | Geb.-Dat. | Wann sind Sie geboren? | own, own | yes |
| q4 | single | Adresse / PLZ | In welcher Strasse und Postleitzahl wohnen Sie? | own, own | yes |
| q5 | single | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | own, own | yes |
| q6 | single | Telefon | Unter welcher Telefonnummer sind Sie erreichbar? | own, own | yes |
| q7 | single | E-Mail | Wie lautet Ihre E-Mail-Adresse? | own, own | yes |
| q8 | single | Firmenname | Wie heisst Ihr Arbeitgeber? | own, own | yes |
| q9 | single | Kontaktperson | Wer ist die Kontaktperson bei Ihrem Arbeitgeber? | own, own | yes |
| q10 | single | Adresse / PLZ | In welcher Strasse und Postleitzahl befindet sich Ihr Arbeitgeber? | own, own | yes |
| q11 | single | Telefon | Unter welcher Telefonnummer ist Ihr Arbeitgeber erreichbar? | own, own | yes |
| q12 | single | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | own, own | yes |
| q13 | mark | Eintrittsjahr | In welchem Jahr haben Sie Ihre Stelle angetreten? | own, own | yes |
| q14 | single | Funktion / ausgeübter Beruf * | Welche Funktion oder welchen Beruf üben Sie aus? | own, own | yes |
| q15 | single | – | KEINE | – | no question |
| q16 | single | Std. / Tag | Wie viele Stunden arbeiten Sie pro Tag? | own, own | yes |
| q17 | mark | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie Vollzeit? | own, own | yes |
| q18 | mark | Teilzeit | Arbeiten Sie Teilzeit? | own, own | yes |
| q19 | single | – | KEINE | – | no question |
| q20 | single | Wochenarbeitszeit / Einsatztage | Wie viele Stunden oder Einsatztage umfasst Ihre Wochenarbeitszeit? | **q16**, **q16** | no |
| q21 | single | Bei Kündigung: Arbeitsverhältnis gekündigt pe | Wenn das Arbeitsverhältnis gekündigt wurde, wann ist das Kündigungsdatum? | own, own | yes |
| q22 | choice | Krankheit · Unfall | Was ist die Ursache der Arbeitsunfähigkeit? Ist es eine Krankheit, ein Unfall oder eine Berufskrankheit? | own, own | yes |
| q23 | choice | REP · Arbeitsplatzbeschrieb | Welches Dokument liegt der Beurteilung zugrunde? Ist es ein REP oder ein Arbeitsplatzbeschrieb? | **q28**, own | no |
| q24 | single | REP vom | Wann stammt das REP oder der Arbeitsplatzbeschrieb, auf den sich die Beurteilung stützt? | **q29**, own | no |
| q25 | single | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb erstellt, auf den sich die Beurteilung stützt? | **q29**, own | no |
| q26 | table | Konsultationsdatum · von | Bitte nennen Sie das Konsultationsdatum, das Datum der nächsten Konsultation, das Visum-Datum und den Zeitraum der Arbeitsunfähigkeit in Prozent. Wiederholen Sie das für alle drei Zeilen der Tabelle. | own, own | yes |
| q27 | choice | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? Ja oder nein? | own, own | yes |
| q28 | choice | Basierend auf * REP | Welches Dokument liegt der Beurteilung der Teilarbeitsfähigkeit zugrunde? Ist es ein REP oder ein Arbeitsplatzbeschrieb? | own, own | yes |
| q29 | single | REP vom | Wann stammt das REP oder der Arbeitsplatzbeschrieb, auf den sich die Beurteilung der Teilarbeitsfähigkeit stützt? | own, own | yes |
| q30 | single | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb erstellt, auf den sich die Beurteilung der Teilarbeitsfähigkeit stützt? | **q29**, own | no |
| q31 | table | Präsenzzeit Std. pro Tag · Präsenzzeit % Pens | Bitte nennen Sie für jede Zeile die Präsenzzeit in Stunden pro Tag, das Pensum in Prozent, die Leistungsfähigkeit in Prozent und die gesamte Arbeitsfähigkeit in Prozent, sowie das Datum der nächsten Konsultation, das Visum-Datum und den Zeitraum der Arbeitsfähigkeit. | own, own | yes |
| q32 | single | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann ist die vollständige Wiederaufnahme der Arbeit zu 100 Prozent vorgesehen? | own, own | yes |
| q33 | choice | ja · nein | Wünschen Sie den Kontakt mit Ihrer Arbeitgeberin oder Ihrem Arbeitgeber? | own, own | yes |
| q34 | single | Arzt / Ärztin (Name, Stempel) | Wie heisst die Ärztin oder der Arzt, die oder der das Zeugnis ausstellt? | own, own | yes |
| q35 | single | Datum | Wann wird das Zeugnis unterschrieben? | own, own | yes |
| q36 | single | Bemerkungen | Gibt es noch Bemerkungen oder zusätzliche Informationen, die wichtig sind? | own, own | yes |

### betreibungsbegehren

| unit | kind | printed label | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|---|
| q1 | single | Bitte in Blockschrift ausfüllen und Hinweise  | Bitte schreiben Sie alles in Blockschrift aus. | own, own | yes |
| q2 | single | Durch das Amt auszufüllen | Wird dieses Formular vom Amt ausgefüllt? | own, own | yes |
| q3 | single | Eingang | Wann ist das Formular beim Amt eingegangen? | own, own | yes |
| q4 | single | Betreibung Nr. | Wie lautet die Nummer dieser Betreibung? | own, own | yes |
| q5 | choice | des Gläubigers des Vertreters | Wird der Gläubiger durch einen Vertreter vertreten? | own, own | yes |
| q6 | single | IBAN | Wie lautet die IBAN des Gläubigers? | own, own | yes |
| q7 | single | Forderungsgrund oder Forderungsurkunde mit Da | Worum geht es bei der Forderung oder welche Urkunde liegt vor? | own, own | yes |
| q8 | table | Weitere Forderungen | Bitte nennen Sie alle weiteren Forderungen, den Betrag in CHF, den Zinssatz in Prozent und das Datum, ab wann der Zins läuft. | own, own | yes |
| q9 | single | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heisst der Schuldner mit Vorname und Nachname und wo wohnt er? | own, own | yes |
| q10 | single | Adresse des Betreibungsamtes | Wie lautet die Adresse des Betreibungsamtes? | own, own | yes |
| q11 | single | Geburtsdatum (falls bekannt) | Wissen Sie das Geburtsdatum des Schuldners? | own, own | yes |
| q12 | single | Gläubiger (Name und Vorname bzw. Firma; Adres | Wie heisst der Gläubiger mit Vorname und Nachname und wo wohnt er? | own, own | yes |
| q13 | single | vertreten durch (Name und Vorname bzw. Firma; | Wie heisst der Vertreter des Gläubigers mit Vorname und Nachname und wo wohnt er? | own, own | yes |
| q14 | single | Telefon oder E-Mail | Wie kann man Sie für Rückfragen erreichen? Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an. | own, own | yes |
| q15 | single | Bemerkungen | Gibt es noch etwas Wichtiges zu ergänzen? | own, own | yes |
| q16 | single | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallnummer, die Sie nennen können? | own, own | yes |
| q17 | mark | Die Angaben des vorliegenden Merkblatts stütz | Müssen wir für diesen Fall noch etwas Besonderes beachten? | own, own | yes |

### schadenmeldung-uvg

| unit | kind | printed label | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|---|
| q1 | single | Nachgebaut nach dem Vorbild der Schadenmeldun | Ist das eine Erstmeldung oder eine Nachmeldung? | **q6**, **q6** | no |
| q2 | single | Nachgebaut nach dem Vorbild der Schadenmeldun | Gibt es noch weitere Bemerkungen zu dieser Meldung? | **q50**, **q50** | no |
| q3 | single | Schaden-Nummer | Wie lautet die Schaden-Nummer? | own, own | yes |
| q4 | choice | Unfall · Berufskrankheit | Was ist passiert? War es ein Unfall, eine Berufskrankheit, ein Zahnschaden oder ein Rückfall? | own, own | yes |
| q5 | choice | Zahnschaden · Rückfall | Was ist passiert? War es ein Zahnschaden oder ein Rückfall? | own, **q4** | no |
| q6 | single | Art der Meldung | Um welche Art von Meldung handelt es sich? | own, own | yes |
| q7 | single | Name und Adresse mit Postleitzahl | Wie lautet der Name und die Adresse des Arbeitgebers mit Postleitzahl? | own, own | yes |
| q8 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers? | own, own | yes |
| q9 | single | E-Mail | Wie lautet die E-Mail-Adresse des Arbeitgebers? | own, own | yes |
| q10 | single | Police-Nr. UVG | Wie lautet die Police-Nr. UVG? | own, own | yes |
| q11 | single | Police-Nr. UVG-Zusatz | Wie lautet die Police-Nr. UVG-Zusatz? | own, own | yes |
| q12 | single | Üblicher Arbeitsplatz des/der Verletzten (Bet | In welchem Betriebszweig war die verletzte Person tätig? | own, own | yes |
| q13 | single | 2 Verletzte / Verletzter | Wie viele verletzte Personen sind zu melden? | own, own | yes |
| q14 | single | Name und Vorname | Wie heisst die verletzte Person mit Vorname und Nachname? | own, own | yes |
| q15 | single | Geburtsdatum | Wann ist die verletzte Person geboren? | own, own | yes |
| q16 | single | AHV-Nummer | Wie lautet die AHV-Nummer der verletzten Person? | own, own | yes |
| q17 | single | Strasse | In welcher Strasse wohnt die verletzte Person? | own, own | yes |
| q18 | single | Tel.-Nr. | Wie lautet die Telefonnummer der verletzten Person? | own, own | yes |
| q19 | single | Zivilstand | Wie ist der Zivilstand der verletzten Person? | own, own | yes |
| q20 | single | Land | Aus welchem Land kommt die verletzte Person? | own, own | yes |
| q21 | single | PLZ | In welcher Postleitzahl wohnt die verletzte Person? | own, own | yes |
| q22 | single | Wohnort | In welcher Gemeinde wohnt die verletzte Person? | own, own | yes |
| q23 | single | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat die verletzte Person? | own, own | yes |
| q24 | single | E-Mail | Wie lautet die E-Mail-Adresse der verletzten Person? | own, own | yes |
| q25 | single | 3 Anstellung | Wann hat die verletzte Person ihre Anstellung begonnen? | **q26**, **q26** | no |
| q26 | single | Datum der Anstellung | Welchen Beruf übt die verletzte Person aus? | **q27**, **q27** | no |
| q27 | single | Ausgeübter Beruf | In welcher Stellung war die verletzte Person tätig? | **q28**, **q28** | no |
| q28 | mark | Höheres Kader | War die verletzte Person im höheren Kader? | own, own | yes |
| q29 | mark | Mittleres Kader | War die verletzte Person im mittleren Kader? | own, own | yes |
| q30 | mark | Angestellte/r / Mitarbeiter/in | War die verletzte Person eine angestellte Person oder Mitarbeiterin? | own, own | yes |
| q31 | choice | Lehrling · Praktikant/in | War die verletzte Person ein Lehrling oder eine Praktikantin? | own, own | yes |
| q32 | choice | unbefristeter Arbeitsvertrag | War der Arbeitsvertrag unbefristet? | own, own | yes |
| q33 | mark | befristeter Arbeitsvertrag | War der Arbeitsvertrag befristet? | own, own | yes |
| q34 | mark | Arbeitsverhältnis gekündigt per | Wurde das Arbeitsverhältnis gekündigt? Wenn ja, bis wann? | own, own | yes |
| q35 | single | – | KEINE | – | no question |
| q36 | single | Verhältnis | Wie war das Arbeitsverhältnis geregelt? | own, own | yes |
| q37 | single | – | KEINE | – | no question |
| q38 | single | Arbeitszeit des/der Verletzten (Std./Woche) | Wie viele Stunden arbeitete die verletzte Person pro Woche? | own, own | yes |
| q39 | single | Betriebsübliche Vollarbeitszeit (Std./Woche) | Wie viele Stunden betrug die betriebsübliche Vollarbeitszeit pro Woche? | own, own | yes |
| q40 | single | Vertraglicher Beschäftigungsgrad (Prozent) | Wie hoch war der vertragliche Beschäftigungsgrad in Prozent? | own, own | yes |
| q41 | choice | unregelmässig | War der Arbeitseinsatz unregelmässig, wegen Kurzarbeit oder gab es einen Zwischenverdienst? | own, own | yes |
| q42 | choice | Kurzarbeit · Zwischenverdienst | **no line** | – | – |
| q43 | single | 4 Schadendatum | An welchem Datum ist der Schaden passiert? | own, own | yes |
| q44 | single | 4 Schadendatum | In welchem Monat ist der Schaden passiert? | **q45**, **q45** | no |
| q45 | single | Monat | In welchem Jahr ist der Schaden passiert? | **q46**, **q46** | no |
| q46 | single | Jahr | Um welche Uhrzeit ist der Schaden passiert? | **q48**, **q48** | no |
| q47 | single | Tag | An welchem Tag der Woche ist der Schaden passiert? | own, own | yes |
| q48 | single | Zeit (Stunden, Minuten) | **no line** | – | – |
| q49 | single | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo genau ist der Unfall passiert? Nennen Sie Ort und Stelle, zum Beispiel Werkstatt oder Strasse. | own, own | yes |
| q50 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was hat die verletzte Person zur Zeit des Unfalls gemacht? Beschreiben Sie bitte den Unfallhergang und beteiligte Gegenstände oder Fahrzeuge. | own, own | yes |
| q51 | single | Beteiligte Person(en) | Welche Personen waren am Unfall beteiligt? | own, own | yes |
| q52 | single | Wenn ja, aufgenommen durch | Von welcher Stelle wurde ein Polizeirapport aufgenommen, falls vorhanden? | own, own | yes |
| q53 | choice | Ja · Nein | Gibt es einen Polizeirapport? Ja, Nein oder Unbekannt? | own, own | yes |
| q54 | single | Besteht ein Polizeirapport? | Besteht ein Polizeirapport? | own, own | yes |
| q55 | choice | Ja · Nein | **no line** | – | – |
| q56 | single | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren am Unfall beteiligt, zum Beispiel Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | own, own | yes |
| q57 | single | 8 Nichtberufsunfall | Handelt es sich um einen Nichtberufsunfall? | own, own | yes |
| q58 | single | Grund der Absenz | Aus welchem Grund war die verletzte Person zuletzt nicht im Betrieb? | own, own | yes |
| q59 | single | Letztmals im Betrieb gearbeitet bis (Wochenta | Bis zu welchem Datum, Wochentag und Uhrzeit war die verletzte Person zuletzt im Betrieb? | own, own | yes |
| q60 | single | 9 Verletzung | Welche Verletzung liegt vor? | own, own | yes |
| q61 | single | Betroffener Körperteil | Welcher Körperteil ist betroffen? | own, own | yes |
| q62 | choice | links · rechts | Ist der betroffene Körperteil links, rechts oder unbestimmt? | own, own | yes |
| q63 | single | Seite | **no line** | – | – |
| q64 | single | Art der Schädigung | Um welche Art der Schädigung handelt es sich? | own, own | yes |
| q65 | single | 10 Arbeitsunfähigkeit | Wurde die Arbeit wegen des Unfalls ausgesetzt? | **q68**, **q68** | no |
| q66 | single | Wenn ja, ab wann? | Wenn ja, ab wann wurde die Arbeit ausgesetzt? | own, own | yes |
| q67 | choice | Ja · Nein | Wurde die Arbeit wegen des Unfalls ausgesetzt? Ja oder Nein? | **q68**, **q68** | no |
| q68 | single | Arbeit zufolge Unfalles ausgesetzt? | **no line** | – | – |
| q69 | single | Falls Arbeit wieder aufgenommen: ab wann? | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | own, own | yes |
| q70 | choice | länger als 1 Monat | Wie lange wird die Arbeit voraussichtlich ganz ausgesetzt sein? Länger als einen Monat oder nicht? | own, own | yes |
| q71 | choice | ganz · teilweise | Wie lange wird die Arbeit voraussichtlich wieder aufgenommen? Ganz oder teilweise? | own, own | yes |
| q72 | single | 11 Arztadressen | **no line** | – | – |
| q73 | single | Erstbehandelnder Arzt bzw. Spital/Klinik | Wie heisst der erstbehandelnde Arzt oder das Spital, das die verletzte Person behandelt hat? | own, own | yes |
| q74 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie heisst der nachbehandelnde Arzt oder das Spital, das die verletzte Person behandelt? | own, own | yes |
| q75 | choice | ambulant · stationär | War die Erstbehandlung ambulant oder stationär? | own, own | yes |
| q76 | choice | ambulant · stationär | War die Nachbehandlung ambulant oder stationär? | own, own | yes |
| q77 | single | Erstbehandlung, falls Spital/Klinik | **no line** | – | – |
| q78 | single | Nachbehandlung, falls Spital/Klinik | **no line** | – | – |
| q79 | table | CHF pro Stunde · CHF pro Monat | Wie hoch ist der Lohnbestandteil pro Stunde, pro Monat und pro Jahr? Bitte geben Sie die Beträge für alle drei Zeilen an. | own, own | yes |
| q80 | single | Andere Lohnzulagen (Akkord, Provision, Natura | Welche anderen Lohnzulagen gibt es, zum Beispiel Akkord, Provision, Naturallohn oder Schichtzulage? | own, own | yes |
| q81 | single | Andere Lohnzulagen (Akkord, Provision, Natura | Wie hoch ist der Betrag dieser anderen Lohnzulage? | own, own | yes |
| q82 | single | Anzahl Kinder (bis 18 J., in Ausbildung bis 2 | Wie viele Kinder hat die verletzte Person, die bis 18 Jahre alt sind oder in Ausbildung bis 25 Jahre? | own, own | yes |
| q83 | single | Bezeichnung der anderen Lohnzulagen | Wie heissen die anderen Lohnzulagen? | own, own | yes |
| q84 | single | 13 Sonderfälle | Gibt es besondere Umstände, die für diesen Fall relevant sind? | own, own | yes |
| q85 | single | Wenn ja, Name und Adresse | Gibt es einen weiteren Arbeitgeber? Wenn ja, wie heisst er und wo ist er? | own, own | yes |
| q86 | choice | Nein · Ja | Müssen Steuern abgezogen werden? Ja oder Nein? | own, own | yes |
| q87 | mark | Quellensteuerpflicht | Besteht eine Quellensteuerpflicht? | own, own | yes |
| q88 | mark | Freiwillige Versicherung (Arbeitgeber / Selbs | Hat die verletzte Person eine freiwillige Versicherung als Arbeitgeber oder Selbständigerwerbende? | own, own | yes |
| q89 | mark | Familienmitglied / Gesellschafter | Ist die verletzte Person ein Familienmitglied oder Gesellschafter? | own, own | yes |
| q90 | mark | Entsandte/r | Handelt es sich um eine entsandte Person? | own, own | yes |
| q91 | single | 14 Andere Sozialversicherungsleistungen | Bezieht die verletzte Person Taggeld oder Rente von einer anderen Sozialversicherung? | **q94**, **q94** | no |
| q92 | single | Wenn ja, wo? | Wenn ja, von welcher Stelle? | own, **q85** | no |
| q93 | choice | Nein · Ja | Bezieht die verletzte Person Taggeld oder Rente von einer anderen Sozialversicherung? Ja oder Nein? | **q94**, own | no |
| q94 | single | Anspruch auf Taggeld oder Rente bei einer and | **no line** | – | – |
| q95 | single | Name der obligatorischen Krankenversicherung  | Wie lautet der Name und die Police-Nr. der obligatorischen Krankenversicherung? | own, own | yes |
| q96 | single | Ort und Datum | **no line** | – | – |

### suva-bagatellunfall

| unit | kind | printed label | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|---|
| q1 | single | – | Wie lautet die Schaden-Nummer? | **q2**, **q2** | no |
| q2 | single | Schaden-Nummer | Welche Schaden-Nummer soll hier eingetragen werden? | own, own | yes |
| q3 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers? | own, own | yes |
| q4 | single | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber bei der Suva? | own, own | yes |
| q5 | single | Name und Adresse mit Postleitzahl | Wie heisst der Arbeitgeber und wo ist er ansässig (mit Postleitzahl)? | own, own | yes |
| q6 | single | Üblicher Arbeitsplatz des/der Verletzten (Bet | In welchem Betriebszweig oder an welchem Arbeitsplatz war die verletzte Person tätig? | own, own | yes |
| q7 | mark | – | Ist etwas angekreuzt? (Kästchen) | own, own | yes |
| q8 | single | Geburtsdatum | Wann ist die verletzte Person geboren? (Tag, Monat, Jahr) | own, own | yes |
| q9 | single | AHV-Nummer | Wie lautet die AHV-Nummer der verletzten Person? | own, own | yes |
| q10 | single | Name und Vorname | Wie heisst die verletzte Person mit Vorname und Nachname? | own, own | yes |
| q11 | single | – | In welcher Strasse wohnt die verletzte Person? | **q13**, **q13** | no |
| q12 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit hat die verletzte Person? | own, own | yes |
| q13 | single | Strasse | Welche Postleitzahl hat der Wohnort der verletzten Person? | **q14**, **q14** | no |
| q14 | single | Staatsangehörigkeit | Gibt es noch eine weitere Staatsangehörigkeit? | **q12**, own | no |
| q15 | mark | – | Ist etwas angekreuzt? (Kästchen) | **q23**, **q7** | no |
| q16 | single | Zivilstand | Wie ist der Zivilstand der verletzten Person? | own, own | yes |
| q17 | single | Ausgeübter Beruf | Welchen Beruf übt die verletzte Person aus? | own, own | yes |
| q18 | single | Datum der Anstellung | Wann hat die verletzte Person ihre Anstellung begonnen? | own, own | yes |
| q19 | mark | 씲 Höheres Kader | Gehört die verletzte Person zum höheren Kader? | own, own | yes |
| q20 | mark | 씲 Mittleres Kader | Gehört die verletzte Person zum mittleren Kader? | own, own | yes |
| q21 | mark | 씲 Angestellte/r / Arbeiter/in | Ist die verletzte Person Angestellte, Arbeiterin oder Arbeiter? | own, own | yes |
| q22 | choice | 씲 Lehrling · 씲 Praktikant/in | Ist die verletzte Person Lehrling oder Praktikantin? | own, own | yes |
| q23 | mark | 씲 Praktikant/in | Ist die verletzte Person Praktikantin? | own, own | yes |
| q24 | single | Arbeitszeit des/der Verletzten: Stunden je Wo | Wie viele Stunden arbeitet die verletzte Person pro Woche? | own, own | yes |
| q25 | single | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo und an welcher Stelle hat sich der Unfall ereignet? | own, own | yes |
| q26 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was hat die verletzte Person zum Zeitpunkt des Unfalls gemacht und wie ist der Unfall genau abgelaufen? | own, own | yes |
| q27 | single | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren am Unfall beteiligt, zum Beispiel Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | own, own | yes |
| q28 | mark | – | Bis wann hat die verletzte Person vor dem Unfall im Betrieb gearbeitet? Bitte nennen Sie Wochentag, Datum und Zeit. | own, own | yes |
| q29 | choice | 씲 links · 씲 rechts | Ist die Verletzung links, rechts oder unbestimmt? | own, own | yes |
| q30 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | own, own | yes |
| q31 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie heisst der Arzt oder das Spital, das die verletzte Person nachbehandelt? | own, own | yes |
| q32 | single | 10. Arzt- adressen | Wie lauten die Adressen der behandelnden Ärzte oder des Spitals? | **q31**, **q31** | no |
| q33 | single | Für Rückerstattungsgesuche von bereits bezahl | Wie lautet die Post- oder Bankkontonummer für Rückerstattungsgesuche? | own, own | yes |
| q34 | single | – | Wie lautet die Schaden-Nummer auf dem Betriebsdoppel? | **q35**, **q35** | no |
| q35 | single | Schaden-Nummer | Welche Schaden-Nummer soll hier auf dem Betriebsdoppel eingetragen werden? | own, own | yes |
| q36 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers auf dem Betriebsdoppel? | own, own | yes |
| q37 | single | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber auf dem Betriebsdoppel? | own, own | yes |
| q38 | single | Name und Adresse mit Postleitzahl | Wie heisst der Arbeitgeber und wo ist er ansässig (mit Postleitzahl) auf dem Betriebsdoppel? | own, own | yes |
| q39 | single | Üblicher Arbeitsplatz des/der Verletzten (Bet | In welchem Betriebszweig war die verletzte Person tätig? | own, own | yes |
| q40 | single | Geburtsdatum | Wann ist die verletzte Person geboren? (Tag, Monat, Jahr) | own, own | yes |
| q41 | single | AHV-Nummer | Wie lautet die AHV-Nummer der verletzten Person auf dem Betriebsdoppel? | own, own | yes |
| q42 | single | Name und Vorname | Wie heisst die verletzte Person mit Vorname und Nachname auf dem Betriebsdoppel? | own, own | yes |
| q43 | single | Geburtsdatum | Wann ist die verletzte Person geboren? (Tag, Monat, Jahr) [zweite Angabe] | **q40**, **q40** | no |
| q44 | single | Staatsangehörigkeit | Welche Staatsangehörigkeit hat die verletzte Person auf dem Betriebsdoppel? | own, own | yes |
| q45 | single | Strasse | In welcher Strasse wohnt die verletzte Person? | own, own | yes |
| q46 | single | Staatsangehörigkeit | Gibt es noch eine weitere Staatsangehörigkeit? | own, own | yes |
| q47 | single | Zivilstand | Wie ist der Zivilstand der verletzten Person auf dem Betriebsdoppel? | own, own | yes |
| q48 | single | Ausgeübter Beruf | Welchen Beruf übt die verletzte Person aus? | own, own | yes |
| q49 | single | Datum der Anstellung | Wann hat die verletzte Person ihre Anstellung begonnen? | own, own | yes |
| q50 | choice | 씲 Höheres Kader · 씲 Mittleres Kader | Gehört die verletzte Person zum höheren Kader? | own, own | yes |
| q51 | choice | 씲 Lehrling · 씲 Praktikant/in | Ist die verletzte Person Lehrling oder Praktikantin? | own, own | yes |
| q52 | single | Arbeitszeit des/der Verletzten: Stunden je Wo | Wie viele Stunden arbeitet die verletzte Person pro Woche? | own, own | yes |
| q53 | single | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo und an welcher Stelle hat sich der Unfall ereignet? | own, own | yes |
| q54 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was hat die verletzte Person zum Zeitpunkt des Unfalls gemacht und wie ist der Unfall genau abgelaufen? | **q55**, **q55** | no |
| q55 | single | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Gibt es noch weitere Details zum Unfallhergang? | **q63**, own | no |
| q56 | single | – | Was ist hier einzutragen? | **q45**, **q44** | no |
| q57 | single | – | Was ist hier einzutragen? | **q52**, **q52** | no |
| q58 | single | – | Was ist hier einzutragen? | **q38**, **q45** | no |
| q59 | single | – | Was ist hier einzutragen? | **q52**, **q75** | no |
| q60 | single | – | Was ist hier einzutragen? | **q40**, **q52** | no |
| q61 | single | – | Was ist hier einzutragen? | **q54**, **q74** | no |
| q62 | single | – | Was ist hier einzutragen? | **q55**, **q36** | no |
| q63 | single | – | Was ist hier einzutragen? | **q38**, **q54** | no |
| q64 | single | – | Was ist hier einzutragen? | **q74**, **q38** | no |
| q65 | single | – | Was ist hier einzutragen? | **q45**, **q54** | no |
| q66 | single | – | Was ist hier einzutragen? | **q77**, **q35** | no |
| q67 | single | – | Was ist hier einzutragen? | **q38**, **q53** | no |
| q68 | single | – | Was ist hier einzutragen? | **q39**, **q35** | no |
| q69 | single | – | Was ist hier einzutragen? | **q76**, **q37** | no |
| q70 | single | – | Was ist hier einzutragen? | **q48**, **q74** | no |
| q71 | single | – | Was ist hier einzutragen? | **q52**, **q36** | no |
| q72 | single | – | Was ist hier einzutragen? | **q76**, **q39** | no |
| q73 | single | – | Was ist hier einzutragen? | **q54**, **q49** | no |
| q74 | single | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren am Unfall beteiligt, zum Beispiel Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | own, own | yes |
| q75 | choice | 씲 links · 씲 rechts | Ist die Verletzung links, rechts oder unbestimmt? | own, own | yes |
| q76 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | own, own | yes |
| q77 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie heisst der Arzt oder das Spital, das die verletzte Person nachbehandelt? | own, own | yes |
| q78 | single | 10. Arzt- adressen | Wie lauten die Adressen der behandelnden Ärzte oder des Spitals? | **q77**, own | no |
| q79 | single | – | Wie lautet die Schaden-Nummer auf dem Apothekerschein? | **q80**, **q80** | no |
| q80 | single | Schaden-Nummer | Welche Schaden-Nummer soll hier auf dem Apothekerschein eingetragen werden? | own, own | yes |
| q81 | single | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers auf dem Apothekerschein? | own, own | yes |
| q82 | single | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber auf dem Apothekerschein? | own, own | yes |
| q83 | single | Name und Adresse mit Postleitzahl | Wie heisst der Arbeitgeber und wo ist er ansässig (mit Postleitzahl) auf dem Apothekerschein? | own, own | yes |
| q84 | single | Üblicher Arbeitsplatz des/der Verletzten (Bet | In welchem Betriebszweig war die verletzte Person tätig? | own, own | yes |
| q85 | single | Geburtsdatum | Wann ist die verletzte Person geboren? (Tag, Monat, Jahr) | own, own | yes |
| q86 | single | AHV-Nummer | Wie lautet die AHV-Nummer der verletzten Person auf dem Apothekerschein? | own, own | yes |
| q87 | single | Name und Vorname | Wie heisst die verletzte Person mit Vorname und Nachname auf dem Apothekerschein? | own, own | yes |
| q88 | single | – | Was ist hier einzutragen? | **q80**, **q80** | no |
| q89 | single | – | Was ist hier einzutragen? | **q96**, **q85** | no |
| q90 | single | Strasse | In welcher Strasse wohnt die verletzte Person? | own, own | yes |
| q91 | single | – | Was ist hier einzutragen? | **q90**, **q83** | no |
| q92 | single | – | Was ist hier einzutragen? | **q84**, **q84** | no |
| q93 | single | – | Wann hat sich der Unfall ereignet? (Tag, Monat, Jahr) | **q85**, **q85** | no |
| q94 | choice | 씲 links · 씲 rechts | Ist die Verletzung links, rechts oder unbestimmt? | own, own | yes |
| q95 | single | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | own, own | yes |
| q96 | single | Nachbehandelnder Arzt bzw. Spital/Klinik | Wie heisst der Arzt oder das Spital, das die verletzte Person nachbehandelt? | own, own | yes |
| q97 | single | Arzt- adressen | Wie lauten die Adressen der behandelnden Ärzte oder des Spitals? | own, own | yes |
| q98 | single | Rechnung der Apotheke | Welche Rechnung der Apotheke soll hier eingefügt werden? | own, own | yes |
| q99 | single | Art und Menge | Welches Medikament wurde abgegeben? | own, own | yes |
| q100 | table | Datum der Abgabe · Art und Menge | Bitte tragen Sie für jedes Medikament Menge, Preis in CHF und Rappen ein. | **q99**, **q99** | no |
| q101 | single | – | Was ist hier einzutragen? | **q84**, **q95** | no |
| q102 | single | – | Was ist hier einzutragen? | **q90**, **q81** | no |
| q103 | single | – | Was ist hier einzutragen? | **q95**, **q110** | no |
| q104 | single | – | Was ist hier einzutragen? | **q96**, **q84** | no |
| q105 | single | 3 Code | Welcher Code gehört in das erste Feld? | own, **q106** | no |
| q106 | single | 3 Code | Welcher Code gehört in das zweite Feld? | own, own | yes |
| q107 | single | 3 Code | Welcher Code gehört in das dritte Feld? | own, **q105** | no |
| q108 | single | 3 Code | Welcher Code gehört in das vierte Feld? | **q105**, own | no |
| q109 | single | 3 Code | Welcher Code gehört in das fünfte Feld? | **q108**, **q107** | no |
| q110 | single | Total | Wie lautet die Postkonto-Nummer oder die zugeteilte Suva-Nummer? | own, own | yes |

"own" is the unit of the question itself.
