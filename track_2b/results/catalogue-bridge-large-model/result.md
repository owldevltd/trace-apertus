# Result: the large model writes for given units, and checks back

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-70B at temperature 0 on two forms: one call per form writes a
question per unit, with the labels given; then the questions are asked back twice in another mixing, twelve per call,
with the page as a picture of text. 14 calls, all answered with status 200. Counted again from the answers in
`calls/`.

## Written

| form | units | seconds | valid JSON | questions returned | units with a question | ids that are no unit | units asked a second time |
|---|---:|---:|---|---:|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 20 | yes | 36 | 36 | 0 | 0 |
| betreibungsbegehren | 17 | 12 | yes | 17 | 17 | 0 | 0 |
| all | 53 | 32 | 2 of 2 | 53 | 53 | 0 | 0 |

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
| arbeitsfaehigkeitszeugnis | 36 | 40 | 0 | 3 | 0 | 0 | 1 | 1 | 21 of 28 | 26 of 35 |
| betreibungsbegehren | 17 | 36 | 0 | 1 | 0 | 3 | 3 | 2 | 14 of 17 | 7 of 12 |
| both (LIX per form) | 53 | 40 / 36 | 0 | 4 | 0 | 3 | 4 | 3 | 35 of 45 | 33 of 47 |

## Asked back

A run names the own unit of a question when the id it returns for the question is the id the question was written for.

| form | questions | calls | own unit named, run 1 / run 2 | both runs name the same unit | both runs name the own unit | neither run names the own unit |
|---|---:|---:|---|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 6 | 27 / 26 | 26 | 24 | 7 |
| betreibungsbegehren | 17 | 6 | 14 / 12 | 13 | 12 | 3 |
| all | 53 | 12 | 41 / 38 | 39 | 36 | 10 |

No reference says which questions are right; a question both runs name another unit for may be a wrong question or a
right one the check does not find.

## All questions

### arbeitsfaehigkeitszeugnis

| unit | kind | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|---|
| q1 | choice | w · m | Sind Sie weiblich oder männlich? | own, own |
| q2 | single | Name / Vorname | Wie heissen Sie mit Vorname? | own, own |
| q3 | single | Geb.-Dat. | Wann sind Sie geboren? | own, own |
| q4 | single | Adresse / PLZ | In welcher Strasse und welcher Postleitzahl wohnen Sie? | own, own |
| q5 | single | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | own, own |
| q6 | single | Telefon | Unter welcher Telefonnummer sind Sie erreichbar? | own, own |
| q7 | single | E-Mail | Wie lautet Ihre E-Mail-Adresse? | own, own |
| q8 | single | Firmenname | Wie heisst Ihr Arbeitgeber? | own, **q9** |
| q9 | single | Kontaktperson | Wer ist die Kontaktperson bei Ihrem Arbeitgeber? | own, own |
| q10 | single | Adresse / PLZ | In welcher Strasse und welcher Postleitzahl hat Ihr Arbeitgeber seinen Sitz? | own, own |
| q11 | single | Telefon | Unter welcher Telefonnummer ist Ihr Arbeitgeber erreichbar? | own, own |
| q12 | single | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | own, own |
| q13 | mark | Eintrittsjahr | In welchem Jahr haben Sie Ihre Stelle angetreten? | own, **q15** |
| q14 | single | Funktion / ausgeübter Beruf * | Welche Funktion oder welchen Beruf üben Sie aus? | own, own |
| q15 | single | – | Wie viele Stunden arbeiten Sie pro Tag? | **q31**, **q20** |
| q16 | single | Std. / Tag | Wie ist Ihre tägliche Arbeitszeit angegeben (Stunden pro Tag)? | **q15**, own |
| q17 | mark | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie Vollzeit (100 %) oder Teilzeit? | **q18**, **q19** |
| q18 | mark | Teilzeit | Arbeiten Sie Teilzeit? | own, **q19** |
| q19 | single | – | Wie hoch ist Ihr Teilzeitpensum in Prozent? | **q20**, own |
| q20 | single | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage haben Sie pro Woche? | own, own |
| q21 | single | Bei Kündigung: Arbeitsverhältnis gekündigt pe | Wann wurde das Arbeitsverhältnis gekündigt? | own, own |
| q22 | choice | Krankheit · Unfall | Ist die Arbeitsunfähigkeit wegen Krankheit, Unfall oder Berufskrankheit? | own, own |
| q23 | choice | REP · Arbeitsplatzbeschrieb | Basiert die Beurteilung auf einem REP oder einem Arbeitsplatzbeschrieb? | **q28**, **q28** |
| q24 | single | REP vom | Seit wann gilt das REP oder der Arbeitsplatzbeschrieb? | **q28**, **q30** |
| q25 | single | Arbeitsplatzbeschrieb vom | Seit wann gilt der Arbeitsplatzbeschrieb? | **q23**, **q23** |
| q26 | table | Konsultationsdatum · von | Wann war der erste Konsultationstermin, wann war der letzte, wann ist der nächste und wer hat das Visum erteilt? | own, own |
| q27 | choice | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? | own, own |
| q28 | choice | Basierend auf * REP | Basiert die Beurteilung der Teilarbeitsfähigkeit auf einem REP oder einem Arbeitsplatzbeschrieb? | own, own |
| q29 | single | REP vom | Seit wann gilt das REP für die Beurteilung der Teilarbeitsfähigkeit? | **q28**, **q30** |
| q30 | single | Arbeitsplatzbeschrieb vom | Seit wann gilt der Arbeitsplatzbeschrieb für die Beurteilung der Teilarbeitsfähigkeit? | **q28**, **none** |
| q31 | table | Präsenzzeit Std. pro Tag · Präsenzzeit % Pens | An welchen Konsultationsterminen waren die Präsenzzeit in Stunden pro Tag, das Pensum in Prozent, die Leistungsfähigkeit in der Präsenzzeit (25/50/75/100 %), die gesamte Arbeitsfähigkeit in Prozent und wann war die Konsultation? | own, own |
| q32 | single | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann können Sie wieder zu 100 % arbeiten? | own, own |
| q33 | choice | ja · nein | Wünschen Sie Kontakt zwischen Arzt und Arbeitgeber? | own, own |
| q34 | single | Arzt / Ärztin (Name, Stempel) | Wie heisst der Arzt oder die Ärztin und wo steht der Stempel? | own, own |
| q35 | single | Datum | Wann wurde das Zeugnis unterschrieben? | own, own |
| q36 | single | Bemerkungen | Gibt es noch besondere Bemerkungen? | own, own |

### betreibungsbegehren

| unit | kind | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|---|
| q1 | single | Bitte in Blockschrift ausfüllen und Hinweise  | Müssen Sie das Formular in Blockschrift ausfüllen und die Hinweise auf der Rückseite beachten? | **none**, **null** |
| q2 | single | Durch das Amt auszufüllen | Muss das Amt das Formular ausfüllen oder sind Sie dafür verantwortlich? | own, **q1** |
| q3 | single | Eingang | Welches Datum steht beim Eingang des Betreibungsbegehrens? | own, own |
| q4 | single | Betreibung Nr. | Wie lautet die Nummer der Betreibung? | own, own |
| q5 | choice | des Gläubigers des Vertreters | Für wen soll die Zahlungsverbindung angegeben werden: für den Gläubiger oder für seinen Vertreter? | own, own |
| q6 | single | IBAN | Welche IBAN-Nummer gehört zum Konto des Gläubigers oder seines Vertreters? | own, **q5** |
| q7 | single | Forderungsgrund oder Forderungsurkunde mit Da | Was ist der Grund für die Forderung und wann wurde die dazugehörige Urkunde ausgestellt? | own, own |
| q8 | table | Weitere Forderungen | Gibt es noch weitere Forderungen? Wenn ja, tragen Sie bitte für jede Forderung den Betrag, den Zins und das Datum ein. | own, own |
| q9 | single | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heissen Sie und wo wohnen Sie? Bitte geben Sie Ihren Namen, Ihre Adresse und die Postleitzahl Ihres Wohnorts an. | **q11**, **q11** |
| q10 | single | Adresse des Betreibungsamtes | Wie lautet die Adresse des Betreibungsamtes? | own, own |
| q11 | single | Geburtsdatum (falls bekannt) | Wann sind Sie geboren (falls Sie das angeben möchten)? | **q13**, **q1** |
| q12 | single | Gläubiger (Name und Vorname bzw. Firma; Adres | Wie heisst der Gläubiger und wo ist er erreichbar? Bitte geben Sie Name, Adresse und Postleitzahl an. | own, own |
| q13 | single | vertreten durch (Name und Vorname bzw. Firma; | Wird der Gläubiger von jemandem vertreten? Wenn ja, wie heisst und wo wohnt der Vertreter? | own, own |
| q14 | single | Telefon oder E-Mail | Wie kann man den Gläubiger oder seinen Vertreter telefonisch oder per E-Mail erreichen? | own, own |
| q15 | single | Bemerkungen | Haben Sie noch besondere Hinweise oder Anmerkungen zu Ihrer Anfrage? | own, own |
| q16 | single | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallnummer vom Amt? Wenn ja, welche ist es? | own, own |
| q17 | mark | Die Angaben des vorliegenden Merkblatts stütz | Auf welche Gesetze und Verordnungen stützt sich dieses Merkblatt? | own, own |

"own" is the unit of the question itself.
