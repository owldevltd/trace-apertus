# Result: the questions of the two walk-through forms

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0: for each of the two forms of the walk-through
one call writes a question per unit, and two runs of the check name the unit of every question, twelve questions per
call. 12 calls, all answered with status 200. Counted again from the prompts and answers in `calls/`.

A question holds when both runs of the check name its own unit and no other unit of the form is asked with the same
words. A question with ß is taken with ss; the word KEINE is no question; an id the list does not show is not taken.

| form | calls | seconds at the model | tokens in / out | units | lines returned | ids the list does not show | questions taken | both runs name the own unit | hold |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|
| Betreibungsbegehren | 5 | 6 | 3352 / 824 | 14 | 16 | 1 | 14 | 14 | **14 of 14** |
| Suva form | 7 | 11 | 6822 / 1612 | 27 | 27 | 0 | 27 | 26 | **26 of 27** |

## All questions

### Betreibungsbegehren

| unit | label in the list | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|
| q1 | Betreibungsamt | Um welches Betreibungsamt handelt es sich? | own, own | yes |
| q2 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heisst der Schuldner und wo wohnt er? | own, own | yes |
| q3 | Geburtsdatum (falls bekannt) | Wann ist das Geburtsdatum des Schuldners? | own, own | yes |
| q4 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wie heisst der Gläubiger und wo ist er ansässig? | own, own | yes |
| q5 | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Welche Zahlungsverbindung wählt der Gläubiger? | own, own | yes |
| q6 | IBAN | Welche IBAN wird angegeben? | own, own | yes |
| q7 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Wer vertritt den Gläubiger? | own, own | yes |
| q8 | Für Rückfragen: Telefon oder E-Mail | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | own, own | yes |
| q9 | Forderungsgrund oder Forderungsurkunde mit Datum | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | own, own | yes |
| q10 | Betrag (CHF) | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | own, own | yes |
| q11 | Zins % | Welcher Zinssatz wird verlangt? | own, own | yes |
| q12 | Zins seit (Datum) | Seit welchem Datum wird Zins verlangt? | own, own | yes |
| q13 | Bemerkungen | Gibt es Bemerkungen zum Abschluss? | own, own | yes |
| q14 | Ihre Fallreferenz (falls vorhanden) | Welche Fallreferenz ist vorhanden? | own, own | yes |

### Suva form

| unit | label in the list | question | unit named, run 1 and 2 | holds |
|---|---|---|---|---|
| q1 | Name und Adresse mit Postleitzahl | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | own, own | yes |
| q2 | Tel.-Nr. | Welche Telefonnummer hat der Arbeitgeber? | own, own | yes |
| q3 | Kunden-Nr. | Welche Kunden-Nummer hat der Arbeitgeber? | own, own | yes |
| q4 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | In welchem Bereich arbeitet die verletzte Person im Betrieb? | own, own | yes |
| q5 | Name und Vorname | Wie heissen die verletzte Person? | own, own | yes |
| q6 | Geburtsdatum | Wann ist die verletzte Person geboren? | own, own | yes |
| q7 | AHV-Nummer | Welche AHV-Nummer hat die verletzte Person? | own, own | yes |
| q8 | Strasse | Welche Strasse hat die verletzte Person? | own, own | yes |
| q9 | Staatsangehörigkeit | Welche Staatsangehörigkeit hat die verletzte Person? | own, own | yes |
| q10 | Zivilstand | Welcher Zivilstand ist bei der verletzten Person? | own, own | yes |
| q11 | Datum der Anstellung | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | own, own | yes |
| q12 | Ausgeübter Beruf | Welchen Beruf übt die verletzte Person aus? | own, own | yes |
| q13 | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrli | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | own, own | yes |
| q14 | Arbeitszeit des/der Verletzten: Stunden je Woche | Wie viele Stunden arbeitet die verletzte Person pro Woche? | own, own | yes |
| q15 | Tag | Welcher Tag war es, als der Unfall passierte? | **q17**, **q17** | no |
| q16 | Monat | Welcher Monat war es, als der Unfall passierte? | own, own | yes |
| q17 | Jahr | Welches Jahr war es, als der Unfall passierte? | own, own | yes |
| q18 | Zeit (Stunden, Minuten) | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | own, own | yes |
| q19 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | own, own | yes |
| q20 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, b | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | own, own | yes |
| q21 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitssto | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | own, own | yes |
| q22 | Betroffener Körperteil | Welcher Körperteil der verletzten Person ist betroffen? | own, own | yes |
| q23 | links / rechts / unbestimmt | Ist die Verletzung links, rechts oder unbestimmt? | own, own | yes |
| q24 | Art der Schädigung | Wie ist die Art der Schädigung bei der Verletzung? | own, own | yes |
| q25 | Erstbehandelnder Arzt bzw. Spital/Klinik | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | own, own | yes |
| q26 | Nachbehandelnder Arzt bzw. Spital/Klinik | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | own, own | yes |
| q27 | Ort und Datum | Wo und wann ist der Abschluss passiert? | own, own | yes |

"own" is the unit of the question itself.
