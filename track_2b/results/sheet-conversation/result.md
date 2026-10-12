# Result: the sheet answered question by question, by voice

Two runs on 11 October 2026 (times in the logs are UTC) with swiss-ai/Apertus-v1.5-8B at temperature 0, one per voice: every question of the sheet
in its order, answered with a recording of its own or skipped. 69 calls, all answered: one to transcribe an answer,
one to read it into the field, and for a writing field one to judge whether the answer is enough.

"(nothing)" under heard: the transcript was the prompt handed back and was cut, so the question stays open.

## voice-a: 7 of 18 questions as expected, 29 calls

| question | said | heard | in the field | as expected | hints |
|---|---|---|---|---|---|
| Wie heisst die versicherte Person mit Nachnamen? | Keller | (nothing) | – | **no** |  |
| Wie heisst die versicherte Person mit Vornamen? | Anna | (nothing) | – | **no** |  |
| Wann ist die versicherte Person geboren? | Am vierzehnten März neunzehnhundertachtundachtzig | 14. März 1988. | 14.03.1988 | yes |  |
| Welche Nationalität hat die versicherte Person? | Schweiz | Falls | – | **no** |  |
| Wie lautet die Versichertennummer der versicherten Person? | (skipped) |  | – | yes |  |
| Welche Aufenthaltsbewilligung hat die versicherte Person, falls sie eine braucht? | (skipped) |  | – | yes |  |
| Welchen Beruf übt die versicherte Person aus? | Buchhalterin | (nothing) | – | **no** |  |
| In welcher Strasse wohnt die versicherte Person, mit Hausnummer? | Bahnhofstrasse zwölf | Anmelderstrasse 12 | Anmelderstrasse 12 | **no** |  |
| Welche Postleitzahl hat der Wohnort der versicherten Person? | acht vier null null | (nothing) | – | **no** |  |
| In welchem Ort wohnt die versicherte Person? | Winterthur | für die Tour. | für die Tour | **no** | incomplete: der tatsächliche Wohnort |
| Welche Telefonnummer hat die versicherte Person? | null sieben neun, vier eins zwei, drei sechs, acht fünf | 07.04. für ein Spytei 3685 | 07.04. für ein Spytei 3685 | **no** | format: Keine lesbare Telefonnummer.; incomplete: Telefonnummer |
| Welche E-Mail-Adresse hat die versicherte Person? | (skipped) |  | – | yes |  |
| Welches Geschlecht hat die versicherte Person: männlich oder weiblich? | weiblich | Feinrich | Geschlecht männlich: –, Geschlecht weiblich: – | **no** |  |
| Tritt die versicherte Person aus der Firma aus, oder ist sie schon ausgetreten? | Ja | (nothing) | – | **no** |  |
| Per wann tritt die versicherte Person aus der Firma aus? | Per einunddreissigsten Dezember zweitausendsechsundzwanzig | Der 31. Dezember 2026 und 2020. | 31.12.2026 | yes | incomplete: Ein klares Austrittsdatum wurde nicht angegeben, da zwei verschiedene Daten genannt wurden. |
| Möchte die versicherte Person die Versicherung weiterführen und dafür eine unverbindliche Offerte erhalten? | Ja, gerne | (nothing) | – | **no** |  |
| Verzichtet die versicherte Person auf ihr Recht, die Versicherung weiterzuführen? | Nein | (nothing) | – | yes |  |
| An welchem Datum wird die Austrittsmeldung unterschrieben? | Am elften Oktober zweitausendsechsundzwanzig | Am 11. Oktober 2026. | 11.10.2026 | yes |  |

## voice-b: 13 of 18 questions as expected, 40 calls

| question | said | heard | in the field | as expected | hints |
|---|---|---|---|---|---|
| Wie heisst die versicherte Person mit Nachnamen? | Keller | Könne | Könne | **no** | incomplete: Vorname |
| Wie heisst die versicherte Person mit Vornamen? | Anna | Hallo. | – | **no** | missing: Pflichtangabe, nichts gesagt. |
| Wann ist die versicherte Person geboren? | Am vierzehnten März neunzehnhundertachtundachtzig | Am 14 März 1988. | 14.03.1988 | yes |  |
| Welche Nationalität hat die versicherte Person? | Schweiz | Schweiz. | Schweiz | yes |  |
| Wie lautet die Versichertennummer der versicherten Person? | (skipped) |  | – | yes |  |
| Welche Aufenthaltsbewilligung hat die versicherte Person, falls sie eine braucht? | (skipped) |  | – | yes |  |
| Welchen Beruf übt die versicherte Person aus? | Buchhalterin | Hochrätin. | Hochrätin | **no** |  |
| In welcher Strasse wohnt die versicherte Person, mit Hausnummer? | Bahnhofstrasse zwölf | Bahnhofstrasse 12 | Bahnhofstrasse 12 | yes |  |
| Welche Postleitzahl hat der Wohnort der versicherten Person? | acht vier null null | 8 4 0 0 | 8400 | yes | incomplete: Leer |
| In welchem Ort wohnt die versicherte Person? | Winterthur | Winterthur | Winterthur | yes |  |
| Welche Telefonnummer hat die versicherte Person? | null sieben neun, vier eins zwei, drei sechs, acht fünf | 07.09.4123685 | 07.09.4123685 | **no** | incomplete: Format |
| Welche E-Mail-Adresse hat die versicherte Person? | (skipped) |  | – | yes |  |
| Welches Geschlecht hat die versicherte Person: männlich oder weiblich? | weiblich | Freundlich. | Geschlecht männlich: –, Geschlecht weiblich: – | **no** |  |
| Tritt die versicherte Person aus der Firma aus, oder ist sie schon ausgetreten? | Ja | Ja. | x | yes |  |
| Per wann tritt die versicherte Person aus der Firma aus? | Per einunddreissigsten Dezember zweitausendsechsundzwanzig | Herr 31. Dezember 2026. | 31.12.2026 | yes |  |
| Möchte die versicherte Person die Versicherung weiterführen und dafür eine unverbindliche Offerte erhalten? | Ja, gerne | Ja, gerne. | x | yes |  |
| Verzichtet die versicherte Person auf ihr Recht, die Versicherung weiterzuführen? | Nein | Nein. | – | yes |  |
| An welchem Datum wird die Austrittsmeldung unterschrieben? | Am elften Oktober zweitausendsechsundzwanzig | Am 11. Oktober 2026. | 11.10.2026 | yes |  |

The two voices are synthetic; each answer is a recording of 0.9 to 2.6 seconds. A person at the microphone was not
tested.
