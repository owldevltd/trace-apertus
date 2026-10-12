# Result: the check back over the page layout, on all four forms

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-70B at temperature 0 as the checking model: the questions written
from the interviewer's seat (`results/catalogue-interviewer-seat/`) are asked back twice in another mixing, twelve per
call, with the page as a picture of text. First the questions of the large model on the four forms, 50 calls; then the
questions of the small model on two forms, 12 calls. 62 calls, all answered with status 200. Counted again from the
prompts and answers in `calls/`.

A run names the own unit of a question when the id it returns for the question is the id the question was written for.

## The questions of 70B

| form | questions | calls | own unit named, run 1 / run 2 | both runs name the same unit | both runs name the own unit | neither run names the own unit |
|---|---:|---:|---|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 6 | 26 / 29 | 25 | 23 | 4 |
| betreibungsbegehren | 17 | 6 | 13 / 15 | 13 | 12 | 1 |
| schadenmeldung-uvg | 96 | 18 | 69 / 58 | 74 | 56 | 25 |
| suva-bagatellunfall | 109 | 20 | 42 / 44 | 60 | 37 | 60 |
| all | 258 | 50 | 150 / 146 | 172 | 128 | 90 |

On the two forms `arbeitsfaehigkeitszeugnis` and `betreibungsbegehren` together: both runs name the own unit for 35 of
53; on the other two for 93 of 205.

Among the questions neither run names the own unit for are the units the model had answered with "Hier ist nichts
einzutragen, bitte weiter zur nächsten Frage.": 0 / 0 / 0 / 31 per form.

Both runs name one and the same other unit for 43 questions (2 / 1 / 18 / 22 per form). Of these, 15 lie on a form
field of the PDF, and 13 of the 15 share a word with the name of that form field (a word of four letters or more,
equal or with the same first five letters).

| form | unit | printed label | name of the form field | question | both runs name | label of that unit |
|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | q17 | Arbeitszeit Vollzeit (100 %) | Arbeitszeit | Arbeiten Sie Vollzeit? | q18 | Teilzeit |
| arbeitsfaehigkeitszeugnis | q29 | REP vom | REP vom (Teil-AF) | Seit wann gilt das REP? | q23 | REP · Arbeitsplatzbeschrieb |
| betreibungsbegehren | q9 | Schuldner (Name und Vorname bzw. Firma; Adres | Schuldner | Wie heissen Sie und wo wohnen Sie? Bitte geben Sie Ihren Namen, Ihre Adresse und die Postleitzahl Ihres Wohnorts an. | q11 | Geburtsdatum (falls bekannt) |
| schadenmeldung-uvg | q3 | Schaden-Nummer | Schaden-Nummer | Wie lautet die Schaden-Nummer? | q10 | Police-Nr. UVG |
| schadenmeldung-uvg | q4 | Unfall · Berufskrankheit | Meldung Unfall · Meldung Berufskrankheit | Handelt es sich um einen Unfall, eine Berufskrankheit oder etwas anderes? | q6 | Art der Meldung |
| schadenmeldung-uvg | q9 | E-Mail | E-Mail Arbeitgeber | Wie lautet die E-Mail-Adresse des Arbeitgebers? | q24 | E-Mail |
| schadenmeldung-uvg | q10 | Police-Nr. UVG | Police UVG | Welche Police-Nummer der UVG hat der Arbeitgeber? | q11 | Police-Nr. UVG-Zusatz |
| schadenmeldung-uvg | q34 | Arbeitsverhältnis gekündigt per | Verhältnis Arbeitsverhältnis gekündigt p | Wurde das Arbeitsverhältnis gekündigt? Wenn ja, bis wann? | q37 | – |
| schadenmeldung-uvg | q38 | Arbeitszeit des/der Verletzten (Std./Woche) | Arbeitszeit Std | Wie viele Stunden pro Woche arbeitet der Verletzte normalerweise? | q39 | Betriebsübliche Vollarbeitszeit (Std./Woche) |
| schadenmeldung-uvg | q42 | Kurzarbeit · Zwischenverdienst | Arbeitseinsatz Kurzarbeit · Arbeitseinsa | Gilt Kurzarbeit oder Zwischenverdienst? | q41 | unregelmässig |
| schadenmeldung-uvg | q68 | Arbeit zufolge Unfalles ausgesetzt? | Arbeit ausgesetzt | Ist der Verletzte wegen des Unfalls ganz oder teilweise arbeitsunfähig? | q67 | Ja · Nein |
| schadenmeldung-uvg | q69 | Falls Arbeit wieder aufgenommen: ab wann? | Arbeit wieder aufgenommen ab | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | q66 | Wenn ja, ab wann? |
| schadenmeldung-uvg | q76 | ambulant · stationär | Nachbehandlung | War die Nachbehandlung ambulant oder stationär? | q78 | Nachbehandlung, falls Spital/Klinik |
| schadenmeldung-uvg | q86 | Nein · Ja | Weiterer Arbeitgeber | Gibt es einen weiteren Arbeitgeber? | q85 | Wenn ja, Name und Adresse |
| schadenmeldung-uvg | q93 | Nein · Ja | Andere Leistungen | Besteht Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | q92 | Wenn ja, wo? |

## The questions of 8B, two forms

| form | questions | calls | own unit named, run 1 / run 2 | both runs name the same unit | both runs name the own unit | neither run names the own unit |
|---|---:|---:|---|---:|---:|---:|
| arbeitsfaehigkeitszeugnis | 36 | 6 | 28 / 26 | 27 | 25 | 7 |
| betreibungsbegehren | 17 | 6 | 15 / 14 | 14 | 13 | 1 |
| all | 53 | 12 | 43 / 40 | 41 | 38 | 8 |

No reference says which questions are right.

## All questions of 70B

### arbeitsfaehigkeitszeugnis

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q1 | w · m | Sind Sie weiblich oder männlich? | own, own |
| q2 | Name / Vorname | Wie heissen Sie mit Vor- und Nachname? | own, own |
| q3 | Geb.-Dat. | Wann sind Sie geboren? | own, own |
| q4 | Adresse / PLZ | In welcher Gemeinde wohnen Sie und welche Postleitzahl hat diese Gemeinde? | own, own |
| q5 | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | own, own |
| q6 | Telefon | Unter welcher Telefonnummer sind Sie erreichbar? | own, own |
| q7 | E-Mail | Wie lautet Ihre E-Mail-Adresse? | own, own |
| q8 | Firmenname | Wie heisst Ihr Arbeitgeber genau? | **q9**, own |
| q9 | Kontaktperson | Wer ist die Kontaktperson bei Ihrem Arbeitgeber? | own, own |
| q10 | Adresse / PLZ | In welcher Gemeinde und mit welcher Postleitzahl befindet sich Ihr Arbeitsplatz? | own, **q4** |
| q11 | Telefon | Unter welcher Telefonnummer ist Ihr Arbeitgeber erreichbar? | own, **q6** |
| q12 | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | own, own |
| q13 | Eintrittsjahr | In welchem Jahr haben Sie Ihre aktuelle Stelle angetreten? | **q15**, own |
| q14 | Funktion / ausgeübter Beruf * | Welche Funktion haben Sie und welchen Beruf üben Sie aus? | own, own |
| q15 | – | Wie viele Stunden arbeiten Sie pro Tag? | **q31**, own |
| q16 | Std. / Tag | Wie ist Ihre tägliche Arbeitszeit geregelt? | **q20**, own |
| q17 | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie Vollzeit? | **q18**, **q18** |
| q18 | Teilzeit | Arbeiten Sie Teilzeit? | own, own |
| q19 | – | Wenn Sie nicht Vollzeit arbeiten, wie viel Prozent beträgt Ihr Pensum? | **q31**, own |
| q20 | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage haben Sie pro Woche? | own, own |
| q21 | Bei Kündigung: Arbeitsverhältnis gekündigt pe | Wurde Ihr Arbeitsverhältnis gekündigt? Wenn ja, wann? | own, own |
| q22 | Krankheit · Unfall | Was ist die Ursache für Ihre Arbeitsunfähigkeit: Krankheit, Unfall oder Berufskrankheit? | own, own |
| q23 | REP · Arbeitsplatzbeschrieb | Basiert die Beurteilung auf einem REP oder einem Arbeitsplatzbeschrieb? | **q28**, own |
| q24 | REP vom | Seit wann gilt das REP oder der Arbeitsplatzbeschrieb? | **q28**, **q23** |
| q25 | Arbeitsplatzbeschrieb vom | Seit wann gilt der aktuelle Arbeitsplatzbeschrieb? | **q23**, **q28** |
| q26 | Konsultationsdatum · von | An welchen Daten waren Sie in den letzten Konsultationen? Von wann bis wann war die Arbeitsunfähigkeit jeweils 100 %? Wann war die nächste Konsultation und wann war das Visum gültig? | own, own |
| q27 | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor? | own, own |
| q28 | Basierend auf * REP | Basiert die Beurteilung der Teilarbeitsfähigkeit auf einem REP oder einem Arbeitsplatzbeschrieb? | own, own |
| q29 | REP vom | Seit wann gilt das REP? | **q23**, **q23** |
| q30 | Arbeitsplatzbeschrieb vom | Seit wann gilt der aktuelle Arbeitsplatzbeschrieb? | own, **q28** |
| q31 | Präsenzzeit Std. pro Tag · Präsenzzeit % Pens | An welchen Konsultationstagen waren Sie wie viele Stunden pro Tag anwesend, wie viel Prozent Pensum haben Sie geleistet, wie war Ihre Leistungsfähigkeit während der Anwesenheit und wie hoch war Ihre gesamte Arbeitsfähigkeit? Bitte geben Sie diese Angaben für jede Konsultation an. | own, own |
| q32 | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann können Sie die Arbeit wieder zu 100 % aufnehmen? | own, own |
| q33 | ja · nein | Wünschen Sie Kontakt mit Ihrer Arbeitgeberin oder Ihrem Arbeitgeber? | own, own |
| q34 | Arzt / Ärztin (Name, Stempel) | Wie heisst der Arzt oder die Ärztin, die das Zeugnis ausstellt, und wo können wir diese Person erreichen? | own, own |
| q35 | Datum | Wann wurde das Zeugnis unterschrieben? | own, own |
| q36 | Bemerkungen | Gibt es noch Bemerkungen, die wir berücksichtigen sollten? | own, own |

### betreibungsbegehren

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q1 | Bitte in Blockschrift ausfüllen und Hinweise  | Bitte schreiben Sie alles in Druckbuchstaben und beachten Sie die Hinweise auf der Rückseite. | own, **null** |
| q2 | Durch das Amt auszufüllen | Wird dieses Feld vom Amt ausgefüllt? | own, own |
| q3 | Eingang | Wann ist das Betreibungsbegehren eingegangen? | own, own |
| q4 | Betreibung Nr. | Wie lautet die Nummer dieser Betreibung? | own, own |
| q5 | des Gläubigers des Vertreters | Gehört die Zahlungsverbindung dem Gläubiger oder seinem Vertreter? | own, own |
| q6 | IBAN | Wie lautet Ihre IBAN? | **q14**, own |
| q7 | Forderungsgrund oder Forderungsurkunde mit Da | Was ist der Grund für die Forderung und wann wurde die dazugehörige Urkunde ausgestellt? | own, own |
| q8 | Weitere Forderungen | Gibt es noch weitere Forderungen? Bitte nennen Sie für jede Forderung den Betrag in CHF, den Zinssatz in Prozent und das Datum, ab dem der Zins läuft. | **q7**, own |
| q9 | Schuldner (Name und Vorname bzw. Firma; Adres | Wie heissen Sie und wo wohnen Sie? Bitte geben Sie Ihren Namen, Ihre Adresse und die Postleitzahl Ihres Wohnorts an. | **q11**, **q11** |
| q10 | Adresse des Betreibungsamtes | Wie lautet die Adresse des Betreibungsamtes? | own, own |
| q11 | Geburtsdatum (falls bekannt) | Wann sind Sie geboren? | own, own |
| q12 | Gläubiger (Name und Vorname bzw. Firma; Adres | Wie heisst der Gläubiger und wo ist er erreichbar? Bitte nennen Sie den Namen, die Adresse und die Postleitzahl. | own, own |
| q13 | vertreten durch (Name und Vorname bzw. Firma; | Wird der Gläubiger von jemandem vertreten? Wenn ja, wie heisst und wo wohnt der Vertreter? | **q11**, own |
| q14 | Telefon oder E-Mail | Wie kann man Sie für Rückfragen erreichen? Bitte geben Sie Ihre Telefonnummer oder E-Mail-Adresse an. | own, own |
| q15 | Bemerkungen | Haben Sie noch besondere Hinweise oder Anmerkungen zu diesem Fall? | own, own |
| q16 | Ihre Fallreferenz (falls vorhanden) | Haben Sie eine Fallnummer, die Sie bereits vom Amt erhalten haben? | own, own |
| q17 | Die Angaben des vorliegenden Merkblatts stütz | Auf welche Gesetze und Verordnungen stützen sich die Angaben auf diesem Merkblatt? | own, own |

### schadenmeldung-uvg

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q1 | Nachgebaut nach dem Vorbild der Schadenmeldun | Wurde dieses Formular nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall AG erstellt? | **q2**, **q2** |
| q2 | Nachgebaut nach dem Vorbild der Schadenmeldun | Wurde dieses Formular nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall AG erstellt? | own, own |
| q3 | Schaden-Nummer | Wie lautet die Schaden-Nummer? | **q10**, **q10** |
| q4 | Unfall · Berufskrankheit | Handelt es sich um einen Unfall, eine Berufskrankheit oder etwas anderes? | **q6**, **q6** |
| q5 | Zahnschaden · Rückfall | Handelt es sich um einen Zahnschaden oder einen Rückfall? | own, own |
| q6 | Art der Meldung | Welche Art von Meldung ist das? | own, own |
| q7 | Name und Adresse mit Postleitzahl | Wie lautet der vollständige Name und die Adresse des Arbeitgebers inklusive Postleitzahl? | own, own |
| q8 | Tel.-Nr. | Wie lautet die Telefonnummer des Arbeitgebers? | **q10**, **q18** |
| q9 | E-Mail | Wie lautet die E-Mail-Adresse des Arbeitgebers? | **q24**, **q24** |
| q10 | Police-Nr. UVG | Welche Police-Nummer der UVG hat der Arbeitgeber? | **q11**, **q11** |
| q11 | Police-Nr. UVG-Zusatz | Welche Police-Nummer der UVG-Zusatz hat der Arbeitgeber? | own, own |
| q12 | Üblicher Arbeitsplatz des/der Verletzten (Bet | Wo war der Verletzte üblicherweise tätig (Betriebszweig)? | own, own |
| q13 | 2 Verletzte / Verletzter | Wie viele Verletzte sind zu melden? | own, own |
| q14 | Name und Vorname | Wie heisst der Verletzte mit Vorname und Nachname? | own, own |
| q15 | Geburtsdatum | Wann ist der Verletzte geboren? | own, own |
| q16 | AHV-Nummer | Wie lautet die AHV-Nummer des Verletzten? | own, own |
| q17 | Strasse | In welcher Strasse wohnt der Verletzte? | own, own |
| q18 | Tel.-Nr. | Wie lautet die Telefonnummer des Verletzten? | own, own |
| q19 | Zivilstand | Welchen Zivilstand hat der Verletzte? | own, own |
| q20 | Land | In welchem Land lebt der Verletzte? | own, own |
| q21 | PLZ | Welche Postleitzahl hat der Wohnort des Verletzten? | own, own |
| q22 | Wohnort | In welcher Gemeinde wohnt der Verletzte? | own, own |
| q23 | Staatsangehörigkeit / Bewilligung | Welche Staatsangehörigkeit oder Bewilligung hat der Verletzte? | own, own |
| q24 | E-Mail | Wie lautet die E-Mail-Adresse des Verletzten? | own, own |
| q25 | 3 Anstellung | Seit wann ist der Verletzte bei diesem Arbeitgeber angestellt? | **q26**, **q26** |
| q26 | Datum der Anstellung | Wann hat die Anstellung des Verletzten begonnen? | own, own |
| q27 | Ausgeübter Beruf | Welchen Beruf übt der Verletzte aus? | own, own |
| q28 | Höheres Kader | Ist der Verletzte im höheren Kader? | own, own |
| q29 | Mittleres Kader | Ist der Verletzte im mittleren Kader? | own, own |
| q30 | Angestellte/r / Mitarbeiter/in | Ist der Verletzte Angestellte/r oder Mitarbeiter/in? | own, own |
| q31 | Lehrling · Praktikant/in | Ist der Verletzte Lehrling oder Praktikant/in? | own, **q30** |
| q32 | unbefristeter Arbeitsvertrag | Ist das Arbeitsverhältnis unbefristet? | own, own |
| q33 | befristeter Arbeitsvertrag | Ist das Arbeitsverhältnis befristet? | own, **q32** |
| q34 | Arbeitsverhältnis gekündigt per | Wurde das Arbeitsverhältnis gekündigt? Wenn ja, bis wann? | **q37**, **q37** |
| q35 | – | Was steht hier noch? (keine Beschriftung vorhanden) | own, own |
| q36 | Verhältnis | Wie ist das Arbeitsverhältnis geregelt? | **q34**, **q34** |
| q37 | – | Was steht hier noch? (keine Beschriftung vorhanden) | **q1**, **q35** |
| q38 | Arbeitszeit des/der Verletzten (Std./Woche) | Wie viele Stunden pro Woche arbeitet der Verletzte normalerweise? | **q39**, **q39** |
| q39 | Betriebsübliche Vollarbeitszeit (Std./Woche) | Wie viele Stunden pro Woche beträgt die betriebsübliche Vollarbeitszeit? | own, own |
| q40 | Vertraglicher Beschäftigungsgrad (Prozent) | Wie hoch ist der vertragliche Beschäftigungsgrad in Prozent? | own, own |
| q41 | unregelmässig | Ist der Arbeitseinsatz unregelmässig? | own, own |
| q42 | Kurzarbeit · Zwischenverdienst | Gilt Kurzarbeit oder Zwischenverdienst? | **q41**, **q41** |
| q43 | 4 Schadendatum | An welchem Tag, Monat und Jahr ist der Schaden passiert? | own, **q45** |
| q44 | 4 Schadendatum | An welchem Tag, Monat und Jahr ist der Schaden passiert? | **q45**, **q43** |
| q45 | Monat | In welchem Monat ist der Schaden passiert? | own, own |
| q46 | Jahr | In welchem Jahr ist der Schaden passiert? | own, own |
| q47 | Tag | An welchem Tag ist der Schaden passiert? | own, **q43** |
| q48 | Zeit (Stunden, Minuten) | Um welche Uhrzeit ist der Schaden passiert (Stunden und Minuten)? | own, own |
| q49 | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo genau ist der Unfall passiert (Ort oder PLZ und genaue Stelle)? | own, own |
| q50 | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was hat der Verletzte zum Zeitpunkt des Unfalls gemacht? Beschreibe bitte auch, was genau passiert ist und welche Gegenstände oder Fahrzeuge beteiligt waren. | own, own |
| q51 | Beteiligte Person(en) | Welche Personen waren beim Vorfall dabei? | own, own |
| q52 | Wenn ja, aufgenommen durch | Wenn ein Polizeirapport erstellt wurde, von wem wurde er aufgenommen? | own, own |
| q53 | Ja · Nein | Gibt es einen Polizeirapport? Ja, Nein oder Unbekannt? | own, **q54** |
| q54 | Besteht ein Polizeirapport? | Wurde ein Polizeirapport erstellt? | own, **q53** |
| q55 | Ja · Nein | Gibt es ein Unfallprotokoll? Ja oder Nein? | own, own |
| q56 | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren beim Unfall beteiligt (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff)? | own, own |
| q57 | 8 Nichtberufsunfall | Handelt es sich um einen Nichtberufsunfall? | own, own |
| q58 | Grund der Absenz | Weshalb war der Verletzte zuletzt nicht im Betrieb? Was war der Grund der Absenz? | own, own |
| q59 | Letztmals im Betrieb gearbeitet bis (Wochenta | Wann hat der Verletzte zuletzt im Betrieb gearbeitet (Wochentag, Datum, Zeit)? | own, own |
| q60 | 9 Verletzung | Welcher Körperteil ist verletzt? | **q61**, **q61** |
| q61 | Betroffener Körperteil | Welchen Körperteil betrifft die Verletzung? | own, **q60** |
| q62 | links · rechts | Ist die Verletzung auf der linken Seite, der rechten Seite oder unbestimmt? | own, own |
| q63 | Seite | Auf welcher Seite ist die Verletzung? | own, **q62** |
| q64 | Art der Schädigung | Wie lautet die Art der Schädigung? | own, own |
| q65 | 10 Arbeitsunfähigkeit | Ist der Verletzte wegen des Unfalls ganz oder teilweise arbeitsunfähig? Wenn ja, ab wann? | **q66**, **q66** |
| q66 | Wenn ja, ab wann? | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | own, own |
| q67 | Ja · Nein | Wird der Verletzte wegen des Unfalls ganz arbeitsunfähig sein? | **q70**, **q71** |
| q68 | Arbeit zufolge Unfalles ausgesetzt? | Ist der Verletzte wegen des Unfalls ganz oder teilweise arbeitsunfähig? | **q67**, **q67** |
| q69 | Falls Arbeit wieder aufgenommen: ab wann? | Wenn die Arbeit wieder aufgenommen wird, ab wann ist das geplant? | **q66**, **q66** |
| q70 | länger als 1 Monat | Wird die Arbeitsunfähigkeit länger als einen Monat dauern? | own, own |
| q71 | ganz · teilweise | Wird die Arbeit ganz oder teilweise wieder aufgenommen? | own, own |
| q72 | 11 Arztadressen | Wie heissen der erstbehandelnde und der nachbehandelnde Arzt oder das Spital? | **q73**, **q73** |
| q73 | Erstbehandelnder Arzt bzw. Spital/Klinik | Wo wurde der Verletzte zuerst behandelt (Arzt oder Spital)? | **q75**, own |
| q74 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wo wird der Verletzte nachbehandelt (Arzt oder Spital)? | **q75**, own |
| q75 | ambulant · stationär | War die Erstbehandlung ambulant oder stationär? | own, own |
| q76 | ambulant · stationär | War die Nachbehandlung ambulant oder stationär? | **q78**, **q78** |
| q77 | Erstbehandlung, falls Spital/Klinik | Wie war die Erstbehandlung, falls im Spital oder in der Klinik? | own, **q75** |
| q78 | Nachbehandlung, falls Spital/Klinik | Wie war die Nachbehandlung, falls im Spital oder in der Klinik? | own, **q76** |
| q79 | CHF pro Stunde · CHF pro Monat | Wie hoch ist der Lohn pro Stunde, pro Monat und pro Jahr für den vertraglichen Grundlohn inklusive Teuerungszulage? | own, own |
| q80 | Andere Lohnzulagen (Akkord, Provision, Natura | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage gibt es? | own, own |
| q81 | Andere Lohnzulagen (Akkord, Provision, Natura | Welche anderen Lohnzulagen wie Akkord, Provision, Naturallohn oder Schichtzulage gibt es? | **q80**, **q83** |
| q82 | Anzahl Kinder (bis 18 J., in Ausbildung bis 2 | Wie viele Kinder (bis 18 Jahre, in Ausbildung bis 25 Jahre) hat der Verletzte? | own, own |
| q83 | Bezeichnung der anderen Lohnzulagen | Wie heissen die anderen Lohnzulagen genau? | own, own |
| q84 | 13 Sonderfälle | Gibt es besondere Fälle oder Anmerkungen zu vermerken? | own, own |
| q85 | Wenn ja, Name und Adresse | Wenn ja, wie heisst der Arbeitgeber und wo ist er ansässig? | own, own |
| q86 | Nein · Ja | Gibt es einen weiteren Arbeitgeber? | **q85**, **q85** |
| q87 | Quellensteuerpflicht | Ist eine Quellensteuerpflicht gegeben? | own, own |
| q88 | Freiwillige Versicherung (Arbeitgeber / Selbs | Besteht eine freiwillige Versicherung beim Arbeitgeber oder als Selbständigerwerbender? | own, own |
| q89 | Familienmitglied / Gesellschafter | Handelt es sich um eine Versicherung über ein Familienmitglied oder einen Gesellschafter? | own, **q90** |
| q90 | Entsandte/r | Ist der Verletzte entsandt? | own, **none** |
| q91 | 14 Andere Sozialversicherungsleistungen | Bezieht der Verletzte Leistungen von einer anderen Sozialversicherung? | **q94**, **q92** |
| q92 | Wenn ja, wo? | Wenn ja, bei welcher Stelle? | own, **q59** |
| q93 | Nein · Ja | Besteht Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung? | **q92**, **q92** |
| q94 | Anspruch auf Taggeld oder Rente bei einer and | Bezieht der Verletzte Leistungen von einer anderen Sozialversicherung? | **none**, **q93** |
| q95 | Name der obligatorischen Krankenversicherung  | Wie heisst die obligatorische Krankenversicherung inklusive Police-Nummer? | own, own |
| q96 | Ort und Datum | Wo und wann wurde die Meldung unterschrieben? | own, own |

### suva-bagatellunfall

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q2 | Schaden-Nummer | Wie lautet die Schaden-Nummer? | own, own |
| q3 | Tel.-Nr. | Was ist Ihre Telefonnummer? | own, own |
| q4 | Kunden-Nr. | Welche Kunden-Nummer hat Ihr Arbeitgeber bei der Suva? | **q6**, **q6** |
| q5 | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | own, own |
| q6 | Üblicher Arbeitsplatz des/der Verletzten (Bet | Wo ist der übliche Arbeitsplatz im Betrieb? | **q4**, **q4** |
| q7 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q24**, own |
| q8 | Geburtsdatum | Wann sind Sie geboren? | **q11**, **q11** |
| q9 | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | **q12**, **q12** |
| q10 | Name und Vorname | Wie heissen Sie mit Vorname und Name? | **q4**, **q4** |
| q11 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q7**, **q1** |
| q12 | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | **q14**, own |
| q13 | Strasse | In welcher Strasse wohnen Sie? | own, own |
| q14 | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | **q16**, **q12** |
| q15 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q24**, **q7** |
| q16 | Zivilstand | Sind Sie ledig, verheiratet oder verwitwet? | own, **q14** |
| q17 | Ausgeübter Beruf | Welchen Beruf üben Sie aus? | own, own |
| q18 | Datum der Anstellung | Wann haben Sie diese Stelle angetreten? | own, own |
| q19 | 씲 Höheres Kader | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | **q20**, **q23** |
| q20 | 씲 Mittleres Kader | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | own, **q23** |
| q21 | 씲 Angestellte/r / Arbeiter/in | Sind Sie Angestellte/r / Arbeiter/in oder Lehrling? | **q23**, **q22** |
| q22 | 씲 Lehrling · 씲 Praktikant/in | Sind Sie Lehrling oder Praktikant/in? | own, own |
| q23 | 씲 Praktikant/in | Sind Sie Praktikant/in? | **q22**, **q22** |
| q24 | Arbeitszeit des/der Verletzten: Stunden je Wo | Wie viele Stunden arbeiten Sie pro Woche? | **q18**, **q17** |
| q25 | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo und an welcher Stelle ist der Unfall passiert? | own, own |
| q26 | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was haben Sie genau gemacht und wie ist der Unfall passiert? | own, own |
| q27 | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren beim Unfall beteiligt, zum Beispiel Maschine, Werkzeug oder Fahrzeug? | own, own |
| q28 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q10**, **q7** |
| q29 | 씲 links · 씲 rechts | Ist der verletzte Körperteil links, rechts oder unbestimmt? | own, own |
| q30 | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | **q32**, **q32** |
| q31 | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | own, own |
| q32 | 10. Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | **q31**, **q31** |
| q33 | Für Rückerstattungsgesuche von bereits bezahl | Wo soll die Rückerstattung der bereits bezahlten Rechnung erfolgen? Bitte geben Sie die Zahladresse an. | own, own |
| q34 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **L**, **none** |
| q35 | Schaden-Nummer | Wie lautet die Schaden-Nummer? | **q36**, **q36** |
| q36 | Tel.-Nr. | Was ist die Telefonnummer des Arbeitgebers? | own, own |
| q37 | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber bei der Suva? | **q36**, **q39** |
| q38 | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | own, own |
| q39 | Üblicher Arbeitsplatz des/der Verletzten (Bet | Wo ist der übliche Arbeitsplatz im Betrieb? | **none**, **q37** |
| q40 | Geburtsdatum | Wann sind Sie geboren? | own, **q43** |
| q41 | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | own, own |
| q42 | Name und Vorname | Wie heissen Sie mit Vorname und Name? | own, own |
| q43 | Geburtsdatum | Wann sind Sie geboren? | **q40**, own |
| q44 | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | **q47**, own |
| q45 | Strasse | In welcher Strasse wohnen Sie? | own, own |
| q46 | Staatsangehörigkeit | Welche Staatsangehörigkeit haben Sie? | **q44**, **q47** |
| q47 | Zivilstand | Sind Sie ledig, verheiratet oder verwitwet? | **q46**, **q46** |
| q48 | Ausgeübter Beruf | Welchen Beruf üben Sie aus? | own, own |
| q49 | Datum der Anstellung | Wann haben Sie diese Stelle angetreten? | own, own |
| q50 | 씲 Höheres Kader · 씲 Mittleres Kader | Sind Sie im höheren Kader, im mittleren Kader oder Angestellte/r / Arbeiter/in? | **none**, own |
| q51 | 씲 Lehrling · 씲 Praktikant/in | Sind Sie Lehrling oder Praktikant/in? | own, own |
| q52 | Arbeitszeit des/der Verletzten: Stunden je Wo | Wie viele Stunden arbeiten Sie pro Woche? | own, own |
| q53 | Ort (Name oder PLZ) und Stelle (z. B. Werksta | Wo und an welcher Stelle ist der Unfall passiert? | **q5**, **q5** |
| q54 | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was haben Sie genau gemacht und wie ist der Unfall passiert? | **q55**, **q55** |
| q55 | Tätigkeit zur Zeit des Unfalles; Unfallhergan | Was haben Sie genau gemacht und wie ist der Unfall passiert? | **q54**, own |
| q56 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **G**, **q35** |
| q57 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **none** |
| q58 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q52**, **q51** |
| q59 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q42**, **none** |
| q60 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **q46** |
| q61 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q49**, **H** |
| q62 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **F** |
| q63 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q50**, **E** |
| q64 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **L** |
| q65 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **E** |
| q66 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **L**, **E** |
| q67 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **L**, **E** |
| q68 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q34**, **q75** |
| q69 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q45**, **q51** |
| q70 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **H**, **none** |
| q71 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q48**, **none** |
| q72 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **none**, **none** |
| q73 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **I**, **none** |
| q74 | Beteiligte Gegenstände (z. B. Maschine, Werkz | Welche Gegenstände waren beim Unfall beteiligt, zum Beispiel Maschine, Werkzeug oder Fahrzeug? | own, own |
| q75 | 씲 links · 씲 rechts | Ist der verletzte Körperteil links, rechts oder unbestimmt? | own, own |
| q76 | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | **q78**, **q78** |
| q77 | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | own, own |
| q78 | 10. Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | **q77**, **q77** |
| q79 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | own, **q80** |
| q80 | Schaden-Nummer | Wie lautet die Schaden-Nummer? | own, own |
| q81 | Tel.-Nr. | Was ist die Telefonnummer des Arbeitgebers? | own, own |
| q82 | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber bei der Suva? | **q84**, **q84** |
| q83 | Name und Adresse mit Postleitzahl | Bitte geben Sie Name und Adresse mit Postleitzahl an. | **q81**, own |
| q84 | Üblicher Arbeitsplatz des/der Verletzten (Bet | Wo ist der übliche Arbeitsplatz im Betrieb? | **q82**, **q82** |
| q85 | Geburtsdatum | Wann sind Sie geboren? | own, own |
| q86 | AHV-Nummer | Wie lautet Ihre AHV-Nummer? | own, own |
| q87 | Name und Vorname | Wie heissen Sie mit Vorname und Name? | own, own |
| q88 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **K**, **q80** |
| q89 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q80**, **q79** |
| q90 | Strasse | In welcher Strasse wohnen Sie? | own, own |
| q91 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q80**, **q83** |
| q92 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **E**, **q79** |
| q93 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q80**, **q80** |
| q94 | 씲 links · 씲 rechts | Ist der verletzte Körperteil links, rechts oder unbestimmt? | own, own |
| q95 | Betroffener Körperteil: | Welcher Körperteil ist verletzt? | own, own |
| q96 | Nachbehandelnder Arzt bzw. Spital/Klinik | Bei welchem Arzt oder Spital wurden Sie nach dem Unfall behandelt? | own, own |
| q97 | Arzt- adressen | Wo ist der Arzt oder das Spital, das Sie behandelt hat? | own, **q96** |
| q98 | Rechnung der Apotheke | Wie lautet die Rechnung der Apotheke? | **q108**, **q109** |
| q99 | Art und Menge | Welche Medikamente wurden abgegeben und in welcher Menge? | **q100**, **q100** |
| q100 | Datum der Abgabe · Art und Menge | Bitte geben Sie für jede Medikamentenabgabe an: Datum der Abgabe, Art und Menge, Betrag in CHF und Rappen | own, own |
| q101 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q79**, **q83** |
| q102 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **q83**, **q87** |
| q103 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **K**, **q79** |
| q104 | – | Hier ist nichts einzutragen, bitte weiter zur nächsten Frage. | **L**, **q93** |
| q105 | 3 Code | Wie lautet der 3er Code? | **q106**, **q106** |
| q106 | 3 Code | Wie lautet der 3er Code? | own, own |
| q107 | 3 Code | Wie lautet der 3er Code? | **q106**, **q106** |
| q108 | 3 Code | Wie lautet der 3er Code? | **q106**, **q106** |
| q109 | 3 Code | Wie lautet der 3er Code? | **q106**, **q106** |
| q110 | Total | Wie hoch ist der Gesamtbetrag der Rechnung? | own, own |

## All questions of 8B, two forms

### arbeitsfaehigkeitszeugnis

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q1 | w · m | Welches Geschlecht haben Sie? | own, own |
| q2 | Name / Vorname | Wie lautet Ihr Vorname? | own, own |
| q3 | Geb.-Dat. | Wie lautet Ihr Geburtsdatum? | own, own |
| q4 | Adresse / PLZ | Wie lautet Ihre Adresse und PLZ? | own, own |
| q5 | AHV-Nr. | Wie lautet Ihre AHV-Nummer? | own, own |
| q6 | Telefon | Wie lautet Ihre Telefonnummer? | own, own |
| q7 | E-Mail | Wie lautet Ihre E-Mail-Adresse? | own, own |
| q8 | Firmenname | Wie heißt das Unternehmen, bei dem Sie arbeiten? | own, own |
| q9 | Kontaktperson | Wie heißt die Kontaktperson bei Ihrem Arbeitgeber? | **q11**, own |
| q10 | Adresse / PLZ | Wie lautet die Adresse und PLZ Ihres Arbeitgebers? | own, own |
| q11 | Telefon | Wie lautet die Telefonnummer Ihres Arbeitgebers? | own, own |
| q12 | E-Mail | Wie lautet die E-Mail-Adresse Ihres Arbeitgebers? | own, own |
| q13 | Eintrittsjahr | In welchem Jahr sind Sie bei Ihrem Arbeitgeber eingetreten? | own, own |
| q14 | Funktion / ausgeübter Beruf * | Welche Funktion oder welchen Beruf üben Sie aus? | own, own |
| q15 | – | Wie viele Stunden arbeiten Sie pro Tag? | **q31**, **q31** |
| q16 | Std. / Tag | Arbeiten Sie in Vollzeit (100 %) oder Teilzeit? | **q17**, **q19** |
| q17 | Arbeitszeit Vollzeit (100 %) | Arbeiten Sie in Vollzeit (100 %)? | **q19**, **q18** |
| q18 | Teilzeit | Arbeiten Sie in Teilzeit? | own, own |
| q19 | – | Wie viele Prozent beträgt Ihre Wochenarbeitszeit? | **q20**, **q20** |
| q20 | Wochenarbeitszeit / Einsatztage | Wie viele Einsatztage haben Sie pro Woche? | own, own |
| q21 | Bei Kündigung: Arbeitsverhältnis gekündigt pe | Wann wurde Ihr Arbeitsverhältnis gekündigt? | own, own |
| q22 | Krankheit · Unfall | Wodurch ist Ihre Arbeitsunfähigkeit verursacht: durch Krankheit, Unfall oder Berufskrankheit? | own, own |
| q23 | REP · Arbeitsplatzbeschrieb | Wird Ihre Arbeitsunfähigkeit auf Basis eines REP oder eines Arbeitsplatzbeschriebs beurteilt? | own, **q28** |
| q24 | REP vom | Wann wurde das REP erstellt? | own, **q23** |
| q25 | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb erstellt? | **q24**, **q23** |
| q26 | Konsultationsdatum · von | Wann war die letzte Konsultation? Wann war die Arbeitsunfähigkeit von? Wann war die Arbeitsunfähigkeit bis? Wann ist die nächste Konsultation? Wann ist das Visum? | own, own |
| q27 | ja · nein | Liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor: ja oder nein? | own, own |
| q28 | Basierend auf * REP | Wird die Beurteilung der Teilarbeitsfähigkeit auf Basis eines REP oder eines Arbeitsplatzbeschriebs erstellt? | own, **q29** |
| q29 | REP vom | Wann wurde das REP erstellt? | **q24**, **q23** |
| q30 | Arbeitsplatzbeschrieb vom | Wann wurde der Arbeitsplatzbeschrieb erstellt? | **q24**, **q23** |
| q31 | Präsenzzeit Std. pro Tag · Präsenzzeit % Pens | Wie viele Stunden arbeiten Sie pro Tag? Wie viel Prozent Pensum haben Sie? Wie leistungsfähig sind Sie in der Präsenzzeit (25, 50, 75 oder 100 %)? Wie hoch ist Ihre Arbeitsfähigkeit insgesamt in Prozent? Wann ist die nächste Konsultation? | own, own |
| q32 | Wiederaufnahme der Arbeit zu 100 % ab | Ab wann können Sie zu 100 % arbeiten? | own, own |
| q33 | ja · nein | Wünschen Sie Kontakt mit Ihrem Arbeitgeber: ja oder nein? | own, own |
| q34 | Arzt / Ärztin (Name, Stempel) | Wie lautet der Name und die Unterschrift des Arztes oder der Ärztin? | own, own |
| q35 | Datum | Wann ist das Datum der Unterschrift? | own, own |
| q36 | Bemerkungen | Haben Sie Bemerkungen oder zusätzliche Informationen? | own, own |

### betreibungsbegehren

| unit | printed label | question | unit named, run 1 and 2 |
|---|---|---|---|
| q1 | Bitte in Blockschrift ausfüllen und Hinweise  | Bitte in Blockschrift ausfüllen und Hinweise auf der Rückseite beachten | **null**, own |
| q2 | Durch das Amt auszufüllen | Durch das Amt auszufüllen | own, **q1** |
| q3 | Eingang | Eingang | own, own |
| q4 | Betreibung Nr. | Betreibung Nr. | own, own |
| q5 | des Gläubigers des Vertreters | des Gläubigers oder des Vertreters | own, own |
| q6 | IBAN | IBAN | own, own |
| q7 | Forderungsgrund oder Forderungsurkunde mit Da | Forderungsgrund oder Forderungsurkunde mit Datum | own, own |
| q8 | Weitere Forderungen | Weitere Forderungen | own, own |
| q9 | Schuldner (Name und Vorname bzw. Firma; Adres | Name und Adresse des Schuldners, inklusive PLZ und Ort | **q11**, **q11** |
| q10 | Adresse des Betreibungsamtes | Adresse des Betreibungsamtes | own, own |
| q11 | Geburtsdatum (falls bekannt) | Geburtsdatum des Schuldners, falls bekannt | own, **q13** |
| q12 | Gläubiger (Name und Vorname bzw. Firma; Adres | Name und Adresse des Gläubigers, inklusive PLZ und Ort | own, own |
| q13 | vertreten durch (Name und Vorname bzw. Firma; | Name und Adresse der Person, die den Gläubiger vertritt | own, own |
| q14 | Telefon oder E-Mail | Telefonnummer oder E-Mail-Adresse für Rückfragen | own, own |
| q15 | Bemerkungen | Bemerkungen | own, own |
| q16 | Ihre Fallreferenz (falls vorhanden) | Ihre Fallreferenz, falls vorhanden | own, own |
| q17 | Die Angaben des vorliegenden Merkblatts stütz | Worauf stützen sich die Angaben im Merkblatt? | own, own |

"own" is the unit of the question itself.
