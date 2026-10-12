# Result: a short answer alone, and the dictionary of the recognition

The 15 spoken answers of the conversation on the sheet (one word to one sentence), each a recording of its own, sent to
the recognition alone, on 11 October 2026 (times in the logs are UTC) with swiss-ai/Apertus-v1.5-8B at temperature 0. 150 calls, all
answered.

Three dictionaries in the prompt: as the app builds it (the name of the form, its issuer and the labels of its fields,
22 entries, three of them whole sentences printed beside tick boxes), the same without the entries that are a sentence
(17), and none. Two kinds of recording: as short as it was spoken (0.9 to 2.6 s), and with the silence the app leaves
around an answer (half a second before, one and a half after).

## Heard as said

The transcript equals what was said, once number words are written as digits, ß as ss, and capitals, spaces and
punctuation are left out.

| voice | recording | dictionary as built | terms only | none |
|---|---|---:|---:|---:|
| voice-a | short | 1 of 15 | 1 of 15 | 2 of 15 |
| voice-a | with silence | 2 of 15 | 2 of 15 | – |
| voice-b | short | 9 of 15 | 9 of 15 | 8 of 15 |
| voice-b | with silence | 8 of 15 | 7 of 15 | – |

## Heard as said, the word before a date left aside

The same count, where a leading "am", "per" or "der" before a date is left out on both sides ("14. März 1988." for
"Am vierzehnten März ...").

| voice | recording | dictionary as built | terms only | none |
|---|---|---:|---:|---:|
| voice-a | short | 2 of 15 | 3 of 15 | 4 of 15 |
| voice-a | with silence | 2 of 15 | 2 of 15 | – |
| voice-b | short | 9 of 15 | 9 of 15 | 9 of 15 |
| voice-b | with silence | 8 of 15 | 7 of 15 | – |

With the dictionary as built, the app cuts a transcript that is only the first entry of the dictionary or the words
that introduce it (see `src/speech/transcriber.js`); in the table below such a transcript stands as it came back.

## Every answer

Bold: heard as said. Italic: as said but for the word before the date. Columns: the short recording with the
dictionary as built, with terms only, with none; the recording with silence with the dictionary as built, with terms
only.

| voice | said | short, as built | short, terms only | short, none | with silence, as built | with silence, terms only |
|---|---|---|---|---|---|---|
| voice-a | Keller | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | The | Ja. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | jetzt |
| voice-a | Anna | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Herr | Hallo. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Herr |
| voice-a | Am vierzehnten März neunzehnhundertachtundachtzig | *14. März 1988.* | *Vierzehnten März neunzehnhundertachtundachtzig.* | *Vierzehnten März neunzehnhundertachtundachtzig.* | **Am vierzehnten März neunzehnhundertachtundachtzig.** | **Am vierzehnten März neunzehnhundertachtundachtzig.** |
| voice-a | Schweiz | Falls | Fett. | Fett. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Fett |
| voice-a | Buchhalterin | Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: | Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: Nachbau nach der SWICA-Austrittsmeldung, Aufenthaltsbewilligung, Austrittsmeldung, Austrittsdatum, Geburtsdatum, Nationalität, Unterschrift, Nachname, männlich, weiblich, Vorname, Telefon, E-Mail, Beruf, Datum, PLZ, Ort. | Behalte den. | Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte., Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen., Ich werde/bin aus der Firma austreten/ausgetreten., Nachbau nach der SWICA-Austrittsmeldung, Aufenthaltsbewilligung, Austrittsmeldung, Versicherten-Nr., Austrittsdatum, Geburtsdatum, Nationalität, Unterschrift, Strasse/Nr., Nachname, männlich, weiblich, Vorname, Telefon, E-Mail, Beruf, Datum, PLZ, Ort. | Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: Nachbau nach der SWICA-Austrittsmeldung, Aufenthaltsbewilligung, Austrittsmeldung, Austrittsdatum, Geburtsdatum, Nationalität, Unterschrift, Nachname, männlich, weiblich, Vorname, Telefon, E-Mail, Beruf, Datum, PLZ, Ort. |
| voice-a | Bahnhofstrasse zwölf | Anmelderstrasse 12 | Anmelde-Tasse zwölf | An der Osttasse zwölf. | Anlaufstrasse 12 | Anmeldestraße zwölf |
| voice-a | acht vier null null | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Aktienrundol | Aktien 1,0 | Aktien 1.0. | Aktien 00. |
| voice-a | Winterthur | für die Tour. | für Tattoo | Für Toto. | für die Tour. | für Tattoo |
| voice-a | null sieben neun, vier eins zwei, drei sechs, acht fünf | 07.04. für ein Spytei 3685 | 07.04. für ein Spital 3685 | **Null sieben neun vier eins zwei drei sechs acht fünf.** | 07.09. für ein Spytei 3685 | 07.04. für ein zwei drei sechs acht fünf |
| voice-a | weiblich | Feinrich | Halt dich! | Halt dich! | Feinrich | Freundlich. |
| voice-a | Ja | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Herr | Tut. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Herr |
| voice-a | Per einunddreissigsten Dezember zweitausendsechsundzwanzig | Der 31. Dezember 2026 und 2020. | *Der Einunddreißigsten Dezember zweitausendsechsundzwanzig* | *Der 31. Dezember 2026.* | Der EINUNDDREISSIGSTEN DEZEMBER ZWEITausendSIECHUNDZWANZIG | Der Ehemann, dreißig. Dezember zweitausendsechsundzwanzig. |
| voice-a | Ja, gerne | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Kanton. | Danke, Evan. | Danke, Annem. | Danke, Herr. |
| voice-a | Nein | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | keine | Danke. | Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte. | Okay. |
| voice-a | Am elften Oktober zweitausendsechsundzwanzig | **Am 11. Oktober 2026.** | **Am elften Oktober zweitausend sechsundzwanzig.** | **Am elften Oktober zweitausend sechsundzwanzig.** | **Am elften Oktober zweitausend sechsundzwanzig** | **Am elften Oktober zweitausend sechsundzwanzig** |
| voice-b | Keller | Könne. | Können. | Könne. | Könne | Können. |
| voice-b | Anna | Hama. | Hama | Hallo. | Hama. | Hanna |
| voice-b | Am vierzehnten März neunzehnhundertachtundachtzig | **Am 14 März 1988.** | **Am vierzehn März neunzehnhundert achtundachtzig** | **Am vierzehnten März neunzehnhundertachtundachtzig.** | **Am vierzehnten März neunzehnhundertachtundachtzig.** | **Am vierzehnten März neunzehnhundertachtundachtzig.** |
| voice-b | Schweiz | **Schweiz.** | **Schweiz.** | **Schweiz.** | **Schweiz.** | **Schweiz** |
| voice-b | Buchhalterin | Hochrätin. | Hochrätin. | Hochleiterin. | Hochwartin. | Hochwartin. |
| voice-b | Bahnhofstrasse zwölf | **Bahnhofstrasse 12** | **Bahnhofstrasse 12** | **Bahnhofstraße zwölf** | **Bahnhofstrasse 12** | **Bahnhofstrasse 12** |
| voice-b | acht vier null null | **8 4 0 0** | **acht vier null null** | acht fünfundnull | acht fünf null null | acht fünf null null |
| voice-b | Winterthur | **Winterthur** | **Winterthur** | Wintertour | **Winterthur.** | **Winterthur.** |
| voice-b | null sieben neun, vier eins zwei, drei sechs, acht fünf | 07.09.4123685 | Muldin, Mann, vier eins zwei, drei sechs, acht fünf. | **Null sieben neun vier eins zwei drei sechs acht fünf.** | 07.09.4123685 | 07.09.4123685 |
| voice-b | weiblich | Freundlich. | Freundlich. | Freundlich. | **Weiblich** | Höflich. |
| voice-b | Ja | **Ja.** | **Ja.** | **Ja.** | **Ja.** | **Ja.** |
| voice-b | Per einunddreissigsten Dezember zweitausendsechsundzwanzig | Herr 31. Dezember 2026 | Herr [Nachname], 31. Dezember 2026 | *Einunddreißigsten Dezember zweitausendsechsundzwanzig.* | Herr einunddreißigster Dezember zweitausendsechsundzwanzig | Herr einunddreißigster Dezember zweitausendsechsundzwanzig |
| voice-b | Ja, gerne | **Ja, gerne.** | **Ja, gerne.** | **Ja, gerne.** | **Ja, gerne.** | **Ja, gerne.** |
| voice-b | Nein | **Nein.** | **Nein.** | **Nein.** | **Nein.** | **Nein.** |
| voice-b | Am elften Oktober zweitausendsechsundzwanzig | **Am 11. Oktober 2026.** | **Am elften Oktober zweitausendsechsundzwanzig** | **Am. elf. Oktober. zweitausendsechsundzwanzig.** | Am fünften Oktober zweitausendsechsundzwanzig | Am fünften Oktober zweitausendsechsundzwanzig |

The two voices are synthetic. A person at the microphone was not tested.
