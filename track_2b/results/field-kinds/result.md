# Result: the kind of a field, proposed by the model

Three runs on 11 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, one call per page that holds places to
write into: seven calls a run, 21 calls, all answered. Two runs with the first wording (eight kinds to choose from),
one run with the second (nine kinds).

Computed from the answers in `calls/` over the 178 places of `places.json` (144 of them with a label): the word an
answer gives for a place, in lower case. "–" is a place the answer has no word for. The words are those of the prompt:
`text`, `zahl` (number), `telefon`, `email`, `plz` (postcode), `iban`, `datum` (date), `uhrzeit` (time of day) and, in
the second wording, `nummer` (identifier).

## Counts

| | first wording, run 1 | first wording, run 2 | second wording |
|---|---:|---:|---:|
| places asked | 178 | 178 | 178 |
| places with a word in the answer | 176 | 176 | 173 |
| the word is one of the kinds of the wording | 176 | 176 | 173 |
| places without a word | 2 | 2 | 5 |
| words given for places that were not asked | 1 | 1 | 5 |

First wording, run 1 against run 2: a word in both runs for 176 places, the same word for 176 of them. Without a word
in both runs: schadenmeldung-uvg f123 "Wenn ja, wo?", suva-bagatellunfall f16 "Zivilstand".

Second wording against the first (run 1): the same for 143 places, another word or none for 35.

## What the model returned

| word | first wording, run 1 | first wording, run 2 | second wording |
|---|---:|---:|---:|
| `text` | 130 | 130 | 107 |
| `nummer` | 0 | 0 | 22 |
| `zahl` | 18 | 18 | 10 |
| `telefon` | 8 | 8 | 8 |
| `email` | 4 | 4 | 4 |
| `plz` | 0 | 0 | 2 |
| `iban` | 1 | 1 | 1 |
| `datum` | 14 | 14 | 18 |
| `uhrzeit` | 1 | 1 | 1 |
| – | 2 | 2 | 5 |

## Labels that name their kind

The reference comes from the labels: a label that contains one of the words below names the kind. Counted per run:
places whose word in the answer is that kind. The first wording has no word `nummer`.

| kind | words looked for in the label | labels | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---:|---:|---:|---:|
| `telefon` | Tel, Telefon, Natel, Mobile | 8 | 8 | 8 | 8 |
| `email` | E-Mail, Email | 5 | 4 | 4 | 4 |
| `plz` | PLZ, Postleitzahl | 13 | 0 | 0 | 1 |
| `iban` | IBAN | 1 | 1 | 1 | 1 |
| `datum` | Datum, Geb., geboren | 14 | 11 | 11 | 11 |
| `nummer` | Nr., Nummer (not of a telephone) | 15 | no such word | no such word | 13 |

The labels of the table above that came back as another word in at least one run (for `nummer` all 15, the first
wording having no such word):

| kind by the label | form | field | label | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| `email` | betreibungsbegehren | f41 | Telefon oder E-Mail | telefon | telefon | telefon |
| `plz` | arbeitsfaehigkeitszeugnis | f5 | Adresse / PLZ | text | text | text |
| `plz` | arbeitsfaehigkeitszeugnis | f11 | Adresse / PLZ | text | text | text |
| `plz` | betreibungsbegehren | f36 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | text | text | text |
| `plz` | betreibungsbegehren | f39 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | text | text | text |
| `plz` | betreibungsbegehren | f40 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | text | text | text |
| `plz` | schadenmeldung-uvg | f9 | Name und Adresse mit Postleitzahl | text | text | text |
| `plz` | schadenmeldung-uvg | f23 | PLZ | text | text | plz |
| `plz` | schadenmeldung-uvg | f55 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text |
| `plz` | suva-bagatellunfall | f5 | Name und Adresse mit Postleitzahl | text | text | text |
| `plz` | suva-bagatellunfall | f26 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text |
| `plz` | suva-bagatellunfall | f41 | Name und Adresse mit Postleitzahl | text | text | text |
| `plz` | suva-bagatellunfall | f59 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text |
| `plz` | suva-bagatellunfall | f91 | Name und Adresse mit Postleitzahl | text | text | text |
| `datum` | arbeitsfaehigkeitszeugnis | f4 | Geb.-Dat. | text | text | text |
| `datum` | betreibungsbegehren | f8 | Forderungsgrund oder Forderungsurkunde mit Datum | text | text | zahl |
| `datum` | suva-bagatellunfall | f8 | Geburtsdatum | zahl | zahl | nummer |
| `nummer` | arbeitsfaehigkeitszeugnis | f6 | AHV-Nr. | text | text | nummer |
| `nummer` | schadenmeldung-uvg | f3 | Schaden-Nummer | text | text | nummer |
| `nummer` | schadenmeldung-uvg | f12 | Police-Nr. UVG | text | text | nummer |
| `nummer` | schadenmeldung-uvg | f13 | Police-Nr. UVG-Zusatz | text | text | nummer |
| `nummer` | schadenmeldung-uvg | f18 | AHV-Nummer | text | text | nummer |
| `nummer` | schadenmeldung-uvg | f127 | Name der obligatorischen Krankenversicherung (inkl. Police-Nr.) | text | text | text |
| `nummer` | suva-bagatellunfall | f2 | Schaden-Nummer | text | text | nummer |
| `nummer` | suva-bagatellunfall | f4 | Kunden-Nr. | text | text | nummer |
| `nummer` | suva-bagatellunfall | f9 | AHV-Nummer | text | text | nummer |
| `nummer` | suva-bagatellunfall | f38 | Schaden-Nummer | text | text | nummer |
| `nummer` | suva-bagatellunfall | f40 | Kunden-Nr. | text | text | nummer |
| `nummer` | suva-bagatellunfall | f44 | AHV-Nummer | text | text | nummer |
| `nummer` | suva-bagatellunfall | f88 | Schaden-Nummer | text | text | text |
| `nummer` | suva-bagatellunfall | f90 | Kunden-Nr. | text | text | nummer |
| `nummer` | suva-bagatellunfall | f94 | AHV-Nummer | text | text | nummer |

## Places the model calls a date

Places with the word `datum` in the answer whose kind in the app was not `date` when the run was made (the app knows a
date by the words of the label).

| form | field | label | kind in the app | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | f22 | Bei Kündigung: Arbeitsverhältnis gekündigt per | text | datum | datum | datum |
| arbeitsfaehigkeitszeugnis | f87 | Wiederaufnahme der Arbeit zu 100 % ab | text | datum | datum | datum |
| schadenmeldung-uvg | f53 | Tag | text | zahl | zahl | datum |
| schadenmeldung-uvg | f51 | Monat | text | zahl | zahl | datum |
| schadenmeldung-uvg | f52 | Jahr | text | zahl | zahl | datum |
| schadenmeldung-uvg | f68 | Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit) | text | datum | datum | datum |
| schadenmeldung-uvg | f81 | Falls Arbeit wieder aufgenommen: ab wann? | text | datum | datum | datum |
| suva-bagatellunfall | f108 | Rechnung der Apotheke | text | text | text | datum |

first wording, run 1: 4; first wording, run 2: 4; second wording: 8. Places whose kind in the app was `date`: 11; of
them called `datum`: 10 (first wording, run 1), 10 (first wording, run 2), 10 (second wording).

## Second wording: places with another word than in the first

| form | field | label | first wording, run 1 | second wording |
|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | f6 | AHV-Nr. | text | nummer |
| betreibungsbegehren | f8 | Forderungsgrund oder Forderungsurkunde mit Datum | text | zahl |
| schadenmeldung-uvg | f3 | Schaden-Nummer | text | nummer |
| schadenmeldung-uvg | f12 | Police-Nr. UVG | text | nummer |
| schadenmeldung-uvg | f13 | Police-Nr. UVG-Zusatz | text | nummer |
| schadenmeldung-uvg | f18 | AHV-Nummer | text | nummer |
| schadenmeldung-uvg | f23 | PLZ | text | plz |
| schadenmeldung-uvg | f53 | Tag | zahl | datum |
| schadenmeldung-uvg | f51 | Monat | zahl | datum |
| schadenmeldung-uvg | f52 | Jahr | zahl | datum |
| schadenmeldung-uvg | f112 | Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.) | zahl | nummer |
| suva-bagatellunfall | f2 | Schaden-Nummer | text | nummer |
| suva-bagatellunfall | f4 | Kunden-Nr. | text | nummer |
| suva-bagatellunfall | f8 | Geburtsdatum | zahl | nummer |
| suva-bagatellunfall | f9 | AHV-Nummer | text | nummer |
| suva-bagatellunfall | f16 | Zivilstand | – | text |
| suva-bagatellunfall | f37 | (none) | text | nummer |
| suva-bagatellunfall | f38 | Schaden-Nummer | text | nummer |
| suva-bagatellunfall | f40 | Kunden-Nr. | text | nummer |
| suva-bagatellunfall | f44 | AHV-Nummer | text | nummer |
| suva-bagatellunfall | f87 | (none) | text | nummer |
| suva-bagatellunfall | f90 | Kunden-Nr. | text | nummer |
| suva-bagatellunfall | f94 | AHV-Nummer | text | nummer |
| suva-bagatellunfall | f100 | (none) | text | plz |
| suva-bagatellunfall | f108 | Rechnung der Apotheke | text | datum |
| suva-bagatellunfall | f109 | Art und Menge | text | zahl |
| suva-bagatellunfall | f138 | 3 Code | zahl | nummer |
| suva-bagatellunfall | f139 | 3 Code | zahl | nummer |
| suva-bagatellunfall | f140 | 3 Code | zahl | nummer |
| suva-bagatellunfall | f141 | 3 Code | zahl | nummer |
| suva-bagatellunfall | f142 | 3 Code | zahl | nummer |
| suva-bagatellunfall | f134 | (none) | text | – |
| suva-bagatellunfall | f135 | (none) | text | – |
| suva-bagatellunfall | f136 | (none) | text | – |
| suva-bagatellunfall | f137 | (none) | text | – |

## Words for places that were not asked

- first wording, run 1: suva-bagatellunfall page 1 q10 → text
- first wording, run 2: suva-bagatellunfall page 1 q10 → text
- second wording: suva-bagatellunfall page 1 q10 → text; suva-bagatellunfall page 1 q21 → text; suva-bagatellunfall
  page 1 q22 → auswahl; suva-bagatellunfall page 1 q23 → text; suva-bagatellunfall page 1 q29 → auswahl

## Every place

The call that holds a place: `calls/<run>/call-<k>.json`, with k as below.

| form | page | k |
|---|---:|---:|
| arbeitsfaehigkeitszeugnis | 1 | 1 |
| betreibungsbegehren | 1 | 2 |
| schadenmeldung-uvg | 1 | 3 |
| schadenmeldung-uvg | 2 | 4 |
| suva-bagatellunfall | 1 | 5 |
| suva-bagatellunfall | 3 | 6 |
| suva-bagatellunfall | 4 | 7 |

### arbeitsfaehigkeitszeugnis

| field | place | label | kind in the app | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| f3 | q1 | Name / Vorname | text | text | text | text |
| f4 | q2 | Geb.-Dat. | text | text | text | text |
| f5 | q4 | Adresse / PLZ | text | text | text | text |
| f6 | q5 | AHV-Nr. | text | text | text | nummer |
| f7 | q6 | Telefon | text | telefon | telefon | telefon |
| f8 | q7 | E-Mail | text | email | email | email |
| f9 | q8 | Firmenname | text | text | text | text |
| f10 | q9 | Kontaktperson | text | text | text | text |
| f11 | q10 | Adresse / PLZ | text | text | text | text |
| f12 | q11 | Telefon | text | telefon | telefon | telefon |
| f13 | q12 | E-Mail | text | email | email | email |
| f15 | q13 | Funktion / ausgeübter Beruf * | text | text | text | text |
| f17 | q15 | Std. / Tag | text | zahl | zahl | zahl |
| f16 | q16 | (none) | text | text | text | text |
| f21 | q18 | Wochenarbeitszeit / Einsatztage | text | zahl | zahl | zahl |
| f20 | q20 | (none) | text | text | text | text |
| f22 | q21 | Bei Kündigung: Arbeitsverhältnis gekündigt per | text | datum | datum | datum |
| f28 | q23 | REP vom | text | text | text | text |
| f29 | q24 | Arbeitsplatzbeschrieb vom | text | text | text | text |
| f49 | q29 | REP vom | text | text | text | text |
| f50 | q30 | Arbeitsplatzbeschrieb vom | text | text | text | text |
| f87 | q32 | Wiederaufnahme der Arbeit zu 100 % ab | text | datum | datum | datum |
| f93 | q33 | Bemerkungen | multiline | text | text | text |
| f90 | q34 | Arzt / Ärztin (Name, Stempel) | text | text | text | text |
| f91 | q36 | Datum | date | datum | datum | datum |

### betreibungsbegehren

| field | place | label | kind in the app | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| f36 | q5 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | multiline | text | text | text |
| f37 | q6 | Adresse des Betreibungsamtes | multiline | text | text | text |
| f38 | q7 | Geburtsdatum (falls bekannt) | date | datum | datum | datum |
| f39 | q8 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | multiline | text | text | text |
| f40 | q10 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | multiline | text | text | text |
| f7 | q11 | IBAN | text | iban | iban | iban |
| f41 | q12 | Telefon oder E-Mail | text | telefon | telefon | telefon |
| f8 | q13 | Forderungsgrund oder Forderungsurkunde mit Datum | multiline | text | text | zahl |
| f42 | q15 | Bemerkungen | multiline | text | text | text |
| f43 | q16 | Ihre Fallreferenz (falls vorhanden) | text | text | text | text |

### schadenmeldung-uvg

| field | place | label | kind in the app | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| f3 | q4 | Schaden-Nummer | text | text | text | nummer |
| f9 | q7 | Name und Adresse mit Postleitzahl | multiline | text | text | text |
| f10 | q8 | Tel.-Nr. | text | telefon | telefon | telefon |
| f11 | q9 | E-Mail | text | email | email | email |
| f12 | q10 | Police-Nr. UVG | text | text | text | nummer |
| f14 | q11 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | text | text | text | text |
| f13 | q12 | Police-Nr. UVG-Zusatz | text | text | text | nummer |
| f16 | q14 | Name und Vorname | text | text | text | text |
| f17 | q15 | Geburtsdatum | date | datum | datum | datum |
| f18 | q16 | AHV-Nummer | text | text | text | nummer |
| f19 | q17 | Strasse | text | text | text | text |
| f20 | q18 | Tel.-Nr. | text | telefon | telefon | telefon |
| f21 | q19 | Zivilstand | text | text | text | text |
| f22 | q20 | Land | text | text | text | text |
| f23 | q21 | PLZ | text | text | text | plz |
| f24 | q22 | Wohnort | text | text | text | text |
| f25 | q23 | Staatsangehörigkeit / Bewilligung | text | text | text | text |
| f26 | q24 | E-Mail | text | email | email | email |
| f28 | q26 | Datum der Anstellung | date | datum | datum | datum |
| f29 | q27 | Ausgeübter Beruf | text | text | text | text |
| f39 | q36 | (none) | text | text | text | text |
| f42 | q38 | Arbeitszeit des/der Verletzten (Std./Woche) | text | zahl | zahl | zahl |
| f43 | q39 | Betriebsübliche Vollarbeitszeit (Std./Woche) | text | zahl | zahl | zahl |
| f44 | q40 | Vertraglicher Beschäftigungsgrad (Prozent) | text | zahl | zahl | zahl |
| f53 | q45 | Tag | text | zahl | zahl | datum |
| f51 | q46 | Monat | text | zahl | zahl | datum |
| f52 | q47 | Jahr | text | zahl | zahl | datum |
| f54 | q48 | Zeit (Stunden, Minuten) | text | uhrzeit | uhrzeit | uhrzeit |
| f55 | q49 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text | text |
| f56 | q50 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Gegenstände… | multiline | text | text | text |
| f57 | q51 | Beteiligte Person(en) | text | text | text | text |
| f58 | q53 | Wenn ja, aufgenommen durch | text | text | text | text |
| f65 | q56 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto… | text | text | text | text |
| f68 | q58 | Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit) | text | datum | datum | datum |
| f67 | q59 | Grund der Absenz | text | text | text | text |
| f70 | q61 | Betroffener Körperteil | text | text | text | text |
| f75 | q64 | Art der Schädigung | text | text | text | text |
| f77 | q67 | Wenn ja, ab wann? | text | text | text | text |
| f81 | q69 | Falls Arbeit wieder aufgenommen: ab wann? | text | datum | datum | datum |
| f87 | q73 | Erstbehandelnder Arzt bzw. Spital/Klinik | text | text | text | text |
| f88 | q74 | Nachbehandelnder Arzt bzw. Spital/Klinik | text | text | text | text |
| f112 | q82 | Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.) | text | zahl | zahl | nummer |
| f113 | q83 | Bezeichnung der anderen Lohnzulagen | text | text | text | text |
| f115 | q85 | Wenn ja, Name und Adresse | text | text | text | text |
| f123 | q93 | Wenn ja, wo? | text | – | – | – |
| f127 | q95 | Name der obligatorischen Krankenversicherung (inkl. Police-Nr.) | text | text | text | text |
| f129 | q96 | Ort und Datum | date | datum | datum | datum |

### suva-bagatellunfall

| field | place | label | kind in the app | first wording, run 1 | first wording, run 2 | second wording |
|---|---|---|---|---|---|---|
| f1 | q1 | (none) | text | text | text | text |
| f2 | q2 | Schaden-Nummer | text | text | text | nummer |
| f5 | q3 | Name und Adresse mit Postleitzahl | multiline | text | text | text |
| f3 | q4 | Tel.-Nr. | text | telefon | telefon | telefon |
| f4 | q5 | Kunden-Nr. | text | text | text | nummer |
| f6 | q6 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | text | text | text | text |
| f10 | q7 | Name und Vorname | text | text | text | text |
| f8 | q8 | Geburtsdatum | date | zahl | zahl | nummer |
| f9 | q9 | AHV-Nummer | text | text | text | nummer |
| f11 | q11 | (none) | text | text | text | text |
| f13 | q12 | Strasse | text | text | text | text |
| f12 | q13 | Staatsangehörigkeit | text | text | text | text |
| f14 | q14 | Staatsangehörigkeit | text | text | text | text |
| f16 | q15 | Zivilstand | text | – | – | text |
| f18 | q17 | Datum der Anstellung | date | datum | datum | datum |
| f17 | q18 | Ausgeübter Beruf | text | text | text | text |
| f25 | q24 | Arbeitszeit des/der Verletzten: Stunden je Woche | text | zahl | zahl | zahl |
| f26 | q25 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text | text |
| f27 | q26 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b… | multiline | text | text | text |
| f28 | q27 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto… | text | text | text | text |
| f33 | q30 | Betroffener Körperteil: | text | text | text | text |
| f35 | q31 | 10. Arzt- adressen | text | text | text | text |
| f34 | q32 | Nachbehandelnder Arzt bzw. Spital/Klinik | multiline | text | text | text |
| f36 | q33 | Für Rückerstattungsgesuche von bereits bezahlten Rechnungen bitten wir… | text | text | text | text |
| f37 | q34 | (none) | text | text | text | nummer |
| f38 | q35 | Schaden-Nummer | text | text | text | nummer |
| f41 | q36 | Name und Adresse mit Postleitzahl | multiline | text | text | text |
| f39 | q37 | Tel.-Nr. | text | telefon | telefon | telefon |
| f40 | q38 | Kunden-Nr. | text | text | text | nummer |
| f42 | q39 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | text | text | text | text |
| f45 | q40 | Name und Vorname | text | text | text | text |
| f43 | q41 | Geburtsdatum | date | datum | datum | datum |
| f46 | q42 | Geburtsdatum | date | datum | datum | datum |
| f44 | q43 | AHV-Nummer | text | text | text | nummer |
| f48 | q44 | Strasse | text | text | text | text |
| f47 | q45 | Staatsangehörigkeit | text | text | text | text |
| f49 | q46 | Staatsangehörigkeit | text | text | text | text |
| f50 | q47 | Zivilstand | text | text | text | text |
| f52 | q48 | Datum der Anstellung | date | datum | datum | datum |
| f51 | q49 | Ausgeübter Beruf | text | text | text | text |
| f58 | q52 | Arbeitszeit des/der Verletzten: Stunden je Woche | text | zahl | zahl | zahl |
| f59 | q53 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | text | text | text | text |
| f60 | q54 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b… | text | text | text | text |
| f61 | q55 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b… | text | text | text | text |
| f62 | q56 | (none) | text | text | text | text |
| f63 | q57 | (none) | text | text | text | text |
| f64 | q58 | (none) | text | text | text | text |
| f65 | q59 | (none) | text | text | text | text |
| f66 | q60 | (none) | text | text | text | text |
| f67 | q61 | (none) | text | text | text | text |
| f68 | q62 | (none) | text | text | text | text |
| f69 | q63 | (none) | text | text | text | text |
| f70 | q64 | (none) | text | text | text | text |
| f71 | q65 | (none) | text | text | text | text |
| f72 | q66 | (none) | text | text | text | text |
| f73 | q67 | (none) | text | text | text | text |
| f74 | q68 | (none) | text | text | text | text |
| f75 | q69 | (none) | text | text | text | text |
| f76 | q70 | (none) | text | text | text | text |
| f77 | q71 | (none) | text | text | text | text |
| f78 | q72 | (none) | text | text | text | text |
| f79 | q73 | (none) | text | text | text | text |
| f80 | q74 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto… | text | text | text | text |
| f84 | q76 | Betroffener Körperteil: | text | text | text | text |
| f86 | q77 | 10. Arzt- adressen | text | text | text | text |
| f85 | q78 | Nachbehandelnder Arzt bzw. Spital/Klinik | text | text | text | text |
| f87 | q79 | (none) | text | text | text | nummer |
| f88 | q80 | Schaden-Nummer | text | text | text | text |
| f91 | q81 | Name und Adresse mit Postleitzahl | multiline | text | text | text |
| f89 | q82 | Tel.-Nr. | text | telefon | telefon | telefon |
| f90 | q83 | Kunden-Nr. | text | text | text | nummer |
| f92 | q84 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | text | text | text | text |
| f95 | q85 | Name und Vorname | text | text | text | text |
| f93 | q86 | Geburtsdatum | date | datum | datum | datum |
| f94 | q87 | AHV-Nummer | text | text | text | nummer |
| f96 | q88 | (none) | text | text | text | text |
| f97 | q89 | (none) | text | text | text | text |
| f98 | q90 | Strasse | text | text | text | text |
| f99 | q91 | (none) | text | text | text | text |
| f100 | q92 | (none) | text | text | text | plz |
| f101 | q93 | (none) | multiline | text | text | text |
| f105 | q95 | Betroffener Körperteil: | text | text | text | text |
| f107 | q96 | Arzt- adressen | text | text | text | text |
| f106 | q97 | Nachbehandelnder Arzt bzw. Spital/Klinik | multiline | text | text | text |
| f108 | q98 | Rechnung der Apotheke | text | text | text | datum |
| f109 | q100 | Art und Menge | text | text | text | zahl |
| f138 | q101 | 3 Code | text | zahl | zahl | nummer |
| f139 | q102 | 3 Code | text | zahl | zahl | nummer |
| f140 | q103 | 3 Code | text | zahl | zahl | nummer |
| f141 | q104 | 3 Code | text | zahl | zahl | nummer |
| f142 | q105 | 3 Code | text | zahl | zahl | nummer |
| f134 | q106 | (none) | text | text | text | – |
| f135 | q107 | (none) | text | text | text | – |
| f136 | q108 | (none) | text | text | text | – |
| f137 | q109 | (none) | text | text | text | – |
| f143 | q110 | Total | text | zahl | zahl | zahl |
