# Result: the sheet typed and clicked in the app

One pass on 11 October 2026 in a browser without a window, the app in German, on a server without a key: no call to the
model. The list of forms shows the five shipped forms; the sheet is opened; its 18 questions are answered in their
order by typing, with yes and no, with a choice and by skipping; then the preview is opened.

Counted afterwards on the job the server holds: 19 of 19 fields as typed or clicked (the twentieth is the signature,
which the conversation does not ask for), no hint on any field, status `filled`, the button to send the form for
signature on the screen, no error in the browser's console.

A pass before it, with the browser reporting English, showed the questions in their English translation; the driver
of that pass looked for the choice by its German word and did not find it, so that pass has no count.

## The answers

| question | as asked | answer |
|---:|---|---|
| 1 | Wie heisst die versicherte Person mit Nachnamen? | typed "Keller" |
| 2 | Wie heisst die versicherte Person mit Vornamen? | typed "Anna" |
| 3 | Wann ist die versicherte Person geboren? | typed "14.03.1988" |
| 4 | Welche Nationalität hat die versicherte Person? | typed "Schweiz" |
| 5 | Wie lautet die Versichertennummer der versicherten Person? | skipped |
| 6 | Welche Aufenthaltsbewilligung hat die versicherte Person, falls sie eine braucht? | skipped |
| 7 | Welchen Beruf übt die versicherte Person aus? | typed "Buchhalterin" |
| 8 | In welcher Strasse wohnt die versicherte Person, mit Hausnummer? | typed "Bahnhofstrasse 12" |
| 9 | Welche Postleitzahl hat der Wohnort der versicherten Person? | typed "8400" |
| 10 | In welchem Ort wohnt die versicherte Person? | typed "Winterthur" |
| 11 | Welche Telefonnummer hat die versicherte Person? | typed "079 412 36 85" |
| 12 | Welche E-Mail-Adresse hat die versicherte Person? | skipped |
| 13 | Welches Geschlecht hat die versicherte Person: männlich oder weiblich? | chose "weiblich" |
| 14 | Tritt die versicherte Person aus der Firma aus, oder ist sie schon ausgetreten? | clicked yes |
| 15 | Per wann tritt die versicherte Person aus der Firma aus? | typed "31.12.2026" |
| 16 | Möchte die versicherte Person die Versicherung weiterführen und dafür eine unverbindliche Offerte erhalten? | clicked yes |
| 17 | Verzichtet die versicherte Person auf ihr Recht, die Versicherung weiterzuführen? | clicked no |
| 18 | An welchem Datum wird die Austrittsmeldung unterschrieben? | typed "11.10.2026" |

## The fields afterwards

| form field | kind | value |
|---|---|---|
| Nachname | text | Keller |
| Vorname | text | Anna |
| Geburtsdatum | date | 14.03.1988 |
| Nationalität | text | Schweiz |
| Versichertennummer | identifier | (empty) |
| Beruf | text | Buchhalterin |
| Aufenthaltsbewilligung | text | (empty) |
| PLZ | postcode | 8400 |
| Strasse Nummer | text | Bahnhofstrasse 12 |
| Ort | text | Winterthur |
| Telefon | phone | 079 412 36 85 |
| E-Mail | email | (empty) |
| Geschlecht / männlich | radio | (empty) |
| Geschlecht / weiblich | radio | x |
| Austritt aus der Firma / Ich werde/bin aus der Firma austreten/ausgetreten. | checkbox | x |
| Austrittsdatum | date | 31.12.2026 |
| Offerte gewünscht / Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | checkbox | x |
| Verzicht / Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen. | checkbox | (empty) |
| Datum | date | 11.10.2026 |
| Unterschrift | signature | (empty) |
