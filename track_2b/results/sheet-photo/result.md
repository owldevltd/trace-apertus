# Result: the sheet of the walk-through photographed

Four uploads on 11 October 2026 (times in the logs are UTC) through the upload path of the app in a browser (the sheet is found in the picture,
straightened, its light evened out, then sent to the pipeline), with swiss-ai/Apertus-v1.5-8B at temperature 0 and one
call to swiss-ai/Apertus-v1.5-70B for the catalogue. 148 calls, all answered.

The reference is the fillable PDF of the sheet: its 20 form fields with their place on the page, the label printed at
each, and the kind each field has in the shipped form. A field counts as found when it overlaps a form field by more
than half of the smaller of the two; a label counts when its letters and digits are those printed.

| upload | page as sent | fields built | form fields found | fields beside any form field | label as printed | kind as shipped | questions that hold | calls | from choosing the file to the finished dialogue | reading | catalogue | questions and kinds |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| rendered-page | 2481×3508 | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 48 s | 15 s | 17 s | 9 s |
| photo-level | 2480×3582 | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 57 s | 20 s | 18 s | 9 s |
| photo-slanted | 2361×3600 | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 57 s | 21 s | 16 s | 9 s |
| photo-small-dark | 2430×3600 | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 58 s | 22 s | 17 s | 8 s |

The three photographs are made up: computed from the page image of the sheet (laid slanted on a table, uneven light,
blur, noise, JPEG). A print photographed with a telephone was not tested.

## Every field

| upload | form field | printed label | label read | kind in the shipped form | kind found |
|---|---|---|---|---|---|
| rendered-page | Nachname | Nachname | Nachname | text | text |
| rendered-page | Vorname | Vorname | Vorname | text | text |
| rendered-page | Geburtsdatum | Geburtsdatum | Geburtsdatum | date | date |
| rendered-page | Nationalität | Nationalität | Nationalität | text | text |
| rendered-page | Versichertennummer | Versicherten-Nr. | Versichert-en-Nr. | identifier | identifier |
| rendered-page | Aufenthaltsbewilligung | Aufenthaltsbewilligung | Aufenthaltsbewilligung | text | text |
| rendered-page | Beruf | Beruf | Beruf | text | text |
| rendered-page | Strasse Nummer | Strasse/Nr. | Strasse/Nr. | text | text |
| rendered-page | PLZ | PLZ | PLZ | postcode | postcode |
| rendered-page | Ort | Wohnort | Wohnort | text | text |
| rendered-page | Telefon | Telefon | Telefon | phone | phone |
| rendered-page | E-Mail | E-Mail | E-Mail | email | email |
| rendered-page | Geschlecht/1 | männlich | männlich | radio | radio |
| rendered-page | Geschlecht/2 | weiblich | weiblich | radio | radio |
| rendered-page | Austritt aus der Firma | Ich werde/bin aus der Firma austreten/ausgetreten. | Ich werde/bin aus der Firma austreten/ausgetreten. | checkbox | checkbox |
| rendered-page | Austrittsdatum | Austrittsdatum | Austrittsdatum | date | date |
| rendered-page | Offerte gewünscht | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | checkbox | checkbox |
| rendered-page | Verzicht | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | checkbox | checkbox |
| rendered-page | Datum | Datum | Datum | date | date |
| rendered-page | Unterschrift | Unterschrift | Unterschrift | signature | signature |
| photo-level | Nachname | Nachname | Nachname | text | text |
| photo-level | Vorname | Vorname | Vorname | text | text |
| photo-level | Geburtsdatum | Geburtsdatum | Geburtsdatum | date | date |
| photo-level | Nationalität | Nationalität | Nationalität | text | text |
| photo-level | Versichertennummer | Versicherten-Nr. | Versicherten-Nr. | identifier | identifier |
| photo-level | Aufenthaltsbewilligung | Aufenthaltsbewilligung | Aufenthaltsbewilligung | text | text |
| photo-level | Beruf | Beruf | Beruf | text | text |
| photo-level | Strasse Nummer | Strasse/Nr. | Strasse/Nr. | text | text |
| photo-level | PLZ | PLZ | PLZ | postcode | postcode |
| photo-level | Ort | Wohnort | Wohnort | text | text |
| photo-level | Telefon | Telefon | Telefon | phone | phone |
| photo-level | E-Mail | E-Mail | E-Mail | email | email |
| photo-level | Geschlecht/1 | männlich | männlich | radio | radio |
| photo-level | Geschlecht/2 | weiblich | weiblich | radio | radio |
| photo-level | Austritt aus der Firma | Ich werde/bin aus der Firma austreten/ausgetreten. | Ich werde/bin aus der Firma austreten/ausgetreten. | checkbox | checkbox |
| photo-level | Austrittsdatum | Austrittsdatum | Austrittsdatum | date | date |
| photo-level | Offerte gewünscht | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | checkbox | checkbox |
| photo-level | Verzicht | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | checkbox | checkbox |
| photo-level | Datum | Datum | Datum | date | date |
| photo-level | Unterschrift | Unterschrift | Unterschrift | signature | signature |
| photo-slanted | Nachname | Nachname | Nachname | text | text |
| photo-slanted | Vorname | Vorname | Vorname | text | text |
| photo-slanted | Geburtsdatum | Geburtsdatum | Geburtsdatum | date | date |
| photo-slanted | Nationalität | Nationalität | Nationalität | text | text |
| photo-slanted | Versichertennummer | Versicherten-Nr. | Versicherten-Nr. | identifier | identifier |
| photo-slanted | Aufenthaltsbewilligung | Aufenthaltsbewilligung | Aufenthaltsbewilligung | text | text |
| photo-slanted | Beruf | Beruf | Beruf | text | text |
| photo-slanted | Strasse Nummer | Strasse/Nr. | Strasse/Nr. | text | text |
| photo-slanted | PLZ | PLZ | PLZ | postcode | postcode |
| photo-slanted | Ort | Wohnort | Wohnort | text | text |
| photo-slanted | Telefon | Telefon | Telefon | phone | phone |
| photo-slanted | E-Mail | E-Mail | E-Mail | email | email |
| photo-slanted | Geschlecht/1 | männlich | männlich | radio | radio |
| photo-slanted | Geschlecht/2 | weiblich | weiblich | radio | radio |
| photo-slanted | Austritt aus der Firma | Ich werde/bin aus der Firma austreten/ausgetreten. | Ich werde/bin aus der Firma austreten/ausgetreten. | checkbox | checkbox |
| photo-slanted | Austrittsdatum | Austrittsdatum | Austrittsdatum | date | date |
| photo-slanted | Offerte gewünscht | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte | checkbox | checkbox |
| photo-slanted | Verzicht | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | checkbox | checkbox |
| photo-slanted | Datum | Datum | Datum | date | date |
| photo-slanted | Unterschrift | Unterschrift | Unterschrift | signature | signature |
| photo-small-dark | Nachname | Nachname | Nachname | text | text |
| photo-small-dark | Vorname | Vorname | Vorname | text | text |
| photo-small-dark | Geburtsdatum | Geburtsdatum | Geburtsdatum | date | date |
| photo-small-dark | Nationalität | Nationalität | Nationalität | text | text |
| photo-small-dark | Versichertennummer | Versicherten-Nr. | Versicherten-Nr. | identifier | identifier |
| photo-small-dark | Aufenthaltsbewilligung | Aufenthaltsbewilligung | Aufenthaltsbewilligung | text | text |
| photo-small-dark | Beruf | Beruf | Beruf | text | text |
| photo-small-dark | Strasse Nummer | Strasse/Nr. | Strasse/Nr. | text | text |
| photo-small-dark | PLZ | PLZ | PLZ | postcode | postcode |
| photo-small-dark | Ort | Wohnort | Wohnort | text | text |
| photo-small-dark | Telefon | Telefon | Telefon | phone | phone |
| photo-small-dark | E-Mail | E-Mail | E-Mail | email | email |
| photo-small-dark | Geschlecht/1 | männlich | männlich | radio | radio |
| photo-small-dark | Geschlecht/2 | weiblich | weiblich | radio | radio |
| photo-small-dark | Austritt aus der Firma | Ich werde/bin aus der Firma austreten/ausgetreten. | Ich werde/bin aus der Firma austreten/ausgetreten. | checkbox | checkbox |
| photo-small-dark | Austrittsdatum | Austrittsdatum | Austrittsdatum | date | date |
| photo-small-dark | Offerte gewünscht | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte | checkbox | checkbox |
| photo-small-dark | Verzicht | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | checkbox | checkbox |
| photo-small-dark | Datum | Datum | Datum | date | date |
| photo-small-dark | Unterschrift | Unterschrift | Unterschrift | signature | signature |

## The two runs before

Run 1 and run 2 were made earlier the same day on the sheet as it then was, and were evaluated then, by the same rule,
against the sheet of that moment: 145 and 148 calls, all answered. Between run 1 and run 2 the labels of the sheet
were set larger (11 instead of 9 points), the title of a section was set off from the statement under it, and a rule
was added to the reading (`src/read/reader.js`): a crop lower than 1.6 character heights in which the model read
words is a text, whatever it says about picture parts. After run 2 a second rule was added: an answer that is no JSON
because of one broken escape is read all the same; read again from the saved answers of run 2, the label it had lost
is there (20 of 20 on that upload). Between run 2 and run 3 the label "Ort" became "Wohnort". The photographs of run 1 and run 2 are
not kept; they were computed the same way from the page of the sheet as it then was.

| run | upload | fields built | form fields found | fields beside any form field | label as printed | kind as shipped | questions that hold | calls | from choosing the file to the finished dialogue |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| run-1 | rendered-page | 20 | 20 of 20 | 0 | 18 of 20 | 19 of 20 | 16 of 18 | 37 | 42 s |
| run-1 | photo-level | 20 | 20 of 20 | 0 | 18 of 20 | 19 of 20 | 15 of 18 | 36 | 50 s |
| run-1 | photo-slanted | 20 | 20 of 20 | 0 | 16 of 20 | 18 of 20 | 14 of 18 | 36 | 53 s |
| run-1 | photo-small-dark | 20 | 20 of 20 | 0 | 16 of 20 | 19 of 20 | 15 of 17 | 36 | 50 s |
| run-2 | rendered-page | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 43 s |
| run-2 | photo-level | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 50 s |
| run-2 | photo-slanted | 20 | 20 of 20 | 0 | 19 of 20 | 20 of 20 | 17 of 18 | 37 | 52 s |
| run-2 | photo-small-dark | 20 | 20 of 20 | 0 | 20 of 20 | 20 of 20 | 18 of 18 | 37 | 50 s |

Where a label or a kind differed:

- run-1, rendered-page: PLZ: label read "", printed "PLZ"; kind text, shipped postcode
- run-1, rendered-page: Ort: label read "", printed "Ort"
- run-1, photo-level: PLZ: label read "", printed "PLZ"; kind text, shipped postcode
- run-1, photo-level: Austritt aus der Firma: label read "Erklärung der versicherten Person Ich werde/bin aus der Firma austreten/ausgetreten.", printed "Ich werde/bin aus der Firma austreten/ausgetreten."
- run-1, photo-slanted: PLZ: label read "", printed "PLZ"; kind text, shipped postcode
- run-1, photo-slanted: Austritt aus der Firma: label read "Erklärung der versicherten Person Ich werde/bin aus der Firma austreten/ausgetreten.", printed "Ich werde/bin aus der Firma austreten/ausgetreten."
- run-1, photo-slanted: Austrittsdatum: label read "Austrttisoatum", printed "Austrittsdatum"; kind text, shipped date
- run-1, photo-slanted: Offerte gewünscht: label read "", printed "Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte."
- run-1, photo-small-dark: Beruf: label read "", printed "Beruf"
- run-1, photo-small-dark: Austritt aus der Firma: label read "Erklärung der versicherten Person Ich werde/bin aus der Firma austreten/ausgetreten.", printed "Ich werde/bin aus der Firma austreten/ausgetreten."
- run-1, photo-small-dark: Austrittsdatum: label read "Austrttsdatum", printed "Austrittsdatum"
- run-1, photo-small-dark: Datum: label read "Unterschrift", printed "Datum"; kind signature, shipped date
- run-2, photo-slanted: Offerte gewünscht: label read "", printed "Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte."

In run 2 the label missing on `photo-slanted` is the sentence whose answer came back with the broken escape.
