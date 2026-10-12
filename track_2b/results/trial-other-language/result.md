# Result: asked and answered in another language, the value written in German in one step

One run on 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0 on the two walk-through forms, 41 units with
48 fields, 31 of them with a made-up value: in German with the stored questions, and in French, Italian and English
with questions written in that language. 208 calls, all answered. The answers are text, no recording.

Counted again from the answers in `calls/` with the reading rules of the repository as they were on that day, against
`expected.json`. A question **holds** when both runs of the check name its own unit and no other unit of the page is
asked with the same words. A value is **same** when its letters and digits equal those of the made-up German value;
"empty, as expected" also where the walk-through marks the value as missing. Origin, by code at the answer: literal
(the value stands in the answer), word for word (every word of it does), neither.

| language | calls | units | questions written | questions hold | answers given | value same | value different | empty, value expected | value, none expected | origin literal | word for word | neither |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| German | 43 | 41 | 40 | 40 | 41 | 16 | 14 | 1 | 2 | 29 | 0 | 3 |
| French | 55 | 41 | 41 | 38 | 41 | 14 | 17 | 0 | 2 | 23 | 0 | 10 |
| Italian | 55 | 41 | 41 | 39 | 41 | 14 | 16 | 1 | 1 | 16 | 2 | 13 |
| English | 55 | 41 | 41 | 39 | 41 | 9 | 22 | 0 | 1 | 20 | 2 | 10 |

The respondent answers every one of the 41 questions, also where the dictation says nothing ("Tag", "Monat" as the
answer), and the made-up values write some things otherwise than the dictation says them ("Keller Sandra"); the German
row counts 14 values as different for that reason.

## The questions written in the other language

### French

| form | unit | printed label | question written | unit named in run 1 / run 2 | holds |
|---|---|---|---|---|---|
| betreibungsbegehren | q1 | Betreibungsamt | De quel bureau de poursuite s'agit-il ? | q1 / q1 | yes |
| betreibungsbegehren | q2 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Quel est le nom et le prénom du débiteur, ou le nom de l'entreprise, ainsi que son adresse et son code postal et sa localité ? | q2 / q2 | yes |
| betreibungsbegehren | q3 | Geburtsdatum (falls bekannt) | Quelle est la date de naissance du débiteur, si vous la connaissez ? | q3 / q3 | yes |
| betreibungsbegehren | q4 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Quel est le nom et le prénom du créancier, ou le nom de l'entreprise, ainsi que son adresse et son code postal et sa localité ? | q4 / q4 | yes |
| betreibungsbegehren | q5 | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Quel moyen de paiement le créancier utilise-t-il ? | q5 / q5 | yes |
| betreibungsbegehren | q6 | IBAN | Quel est le numéro IBAN ? | q6 / q6 | yes |
| betreibungsbegehren | q7 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Qui représente le créancier (nom et prénom ou entreprise, adresse, code postal et localité) ? | q4 / q4 | no |
| betreibungsbegehren | q8 | Für Rückfragen: Telefon oder E-Mail | Quel est le numéro de téléphone ou l'adresse e-mail pour toute question ? | q8 / q8 | yes |
| betreibungsbegehren | q9 | Forderungsgrund oder Forderungsurkunde mit Datum | Quel est le motif de la créance ou le document de créance avec sa date ? | q9 / q9 | yes |
| betreibungsbegehren | q10 | Betrag (CHF) | Quel est le montant de la créance en francs suisses ? | q10 / q10 | yes |
| betreibungsbegehren | q11 | Zins % | Quel est le taux d'intérêt en pourcentage ? | q11 / q11 | yes |
| betreibungsbegehren | q12 | Zins seit (Datum) | Depuis quelle date le taux d'intérêt s'applique-t-il ? | q12 / q12 | yes |
| betreibungsbegehren | q13 | Bemerkungen | Quelles sont les observations ou remarques concernant cette affaire ? | q13 / q13 | yes |
| betreibungsbegehren | q14 | Ihre Fallreferenz (falls vorhanden) | Quel est votre référence de dossier, si vous en avez une ? | q14 / q14 | yes |
| suva-bagatellunfall | q1 | Name und Adresse mit Postleitzahl | Quel est le nom et l'adresse complète de l'employeur, y compris le code postal? | q1 / q1 | yes |
| suva-bagatellunfall | q2 | Tel.-Nr. | Quel est le numéro de téléphone de l'employeur? | q2 / q2 | yes |
| suva-bagatellunfall | q3 | Kunden-Nr. | Quel est le numéro de client? | q3 / q3 | yes |
| suva-bagatellunfall | q4 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | Dans quel secteur ou département travaille habituellement la personne blessée? | q4 / q4 | yes |
| suva-bagatellunfall | q5 | Name und Vorname | Quel est le nom et le prénom de la personne blessée? | q5 / q5 | yes |
| suva-bagatellunfall | q6 | Geburtsdatum | Quel est la date de naissance de la personne blessée? | q6 / q6 | yes |
| suva-bagatellunfall | q7 | AHV-Nummer | Quel est le numéro AVS de la personne blessée? | q7 / q7 | yes |
| suva-bagatellunfall | q8 | Strasse | Quelle est la rue où habite la personne blessée? | q8 / q8 | yes |
| suva-bagatellunfall | q9 | Staatsangehörigkeit | De quelle nationalité est la personne blessée? | q9 / q9 | yes |
| suva-bagatellunfall | q10 | Zivilstand | Quel est l'état civil de la personne blessée? | q10 / q10 | yes |
| suva-bagatellunfall | q11 | Datum der Anstellung | À quelle date la personne blessée a-t-elle commencé son emploi? | q11 / q11 | yes |
| suva-bagatellunfall | q12 | Ausgeübter Beruf | Quel est le métier exercé par la personne blessée? | q12 / q12 | yes |
| suva-bagatellunfall | q13 | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | La personne blessée fait-elle partie du personnel de cadre supérieur, du personnel de cadre intermédiaire, des employés, des apprentis ou des stagiaires? | q13 / q13 | yes |
| suva-bagatellunfall | q14 | Arbeitszeit des/der Verletzten: Stunden je Woche | Combien d'heures par semaine la personne blessée travaille-t-elle? | q14 / q21 | no |
| suva-bagatellunfall | q15 | Tag | Quel est le jour de l'accident? | q17 / q15 | no |
| suva-bagatellunfall | q16 | Monat | Quel est le mois de l'accident? | q16 / q16 | yes |
| suva-bagatellunfall | q17 | Jahr | Quel est l'année de l'accident? | q17 / q17 | yes |
| suva-bagatellunfall | q18 | Zeit (Stunden, Minuten) | À quelle heure précise s'est produit l'accident (heures et minutes)? | q18 / q18 | yes |
| suva-bagatellunfall | q19 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Quel est le lieu de l'accident (nom ou code postal) et l'endroit précis (atelier, rue, etc.)? | q19 / q19 | yes |
| suva-bagatellunfall | q20 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | Quelle était l'activité de la personne blessée au moment de l'accident ? Comment s'est déroulé l'accident ? Quelles personnes et quels objets ou véhicules étaient impliqués? | q20 / q20 | yes |
| suva-bagatellunfall | q21 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Quels objets ou équipements (machine, outil, véhicule, produit, etc.) étaient impliqués dans l'accident ? Veuillez donner des détails précis. | q21 / q21 | yes |
| suva-bagatellunfall | q22 | Betroffener Körperteil | Quel est le membre du corps concerné par la blessure ? | q22 / q22 | yes |
| suva-bagatellunfall | q23 | links / rechts / unbestimmt | La blessure concerne-t-elle le côté gauche, le côté droit ou est-elle indéterminée ? | q23 / q23 | yes |
| suva-bagatellunfall | q24 | Art der Schädigung | Quel est le type de dommage subi par la personne blessée ? | q24 / q24 | yes |
| suva-bagatellunfall | q25 | Erstbehandelnder Arzt bzw. Spital/Klinik | Quel est le nom du médecin ou de l'hôpital/clinique qui a traité la personne blessée en premier ? | q25 / q25 | yes |
| suva-bagatellunfall | q26 | Nachbehandelnder Arzt bzw. Spital/Klinik | Quel est le nom du médecin ou de l'hôpital/clinique qui a pris en charge le suivi de la personne blessée ? | q26 / q26 | yes |
| suva-bagatellunfall | q27 | Ort und Datum | Dans quelle ville et quelle date l'accident a-t-il été finalisé ? | q27 / q27 | yes |

### Italian

| form | unit | printed label | question written | unit named in run 1 / run 2 | holds |
|---|---|---|---|---|---|
| betreibungsbegehren | q1 | Betreibungsamt | Di quale Ufficio di esecuzione si tratta? | q1 / q1 | yes |
| betreibungsbegehren | q2 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Come si chiama il debitore e qual è il suo indirizzo? | q2 / q2 | yes |
| betreibungsbegehren | q3 | Geburtsdatum (falls bekannt) | Qual è la data di nascita del debitore, se nota? | q3 / q3 | yes |
| betreibungsbegehren | q4 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Come si chiama il creditore e qual è il suo indirizzo? | q4 / q4 | yes |
| betreibungsbegehren | q5 | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | Qual è la forma di pagamento del creditore? | q5 / q5 | yes |
| betreibungsbegehren | q6 | IBAN | Qual è il numero IBAN? | q6 / q6 | yes |
| betreibungsbegehren | q7 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Chi rappresenta il creditore e qual è il suo indirizzo? | q7 / q4 | no |
| betreibungsbegehren | q8 | Für Rückfragen: Telefon oder E-Mail | Qual è il numero di telefono o l'indirizzo e-mail per eventuali domande? | q8 / q8 | yes |
| betreibungsbegehren | q9 | Forderungsgrund oder Forderungsurkunde mit Datum | Qual è il motivo della richiesta o il documento di riferimento con data? | q9 / q9 | yes |
| betreibungsbegehren | q10 | Betrag (CHF) | Qual è l'importo della richiesta in franchi svizzeri? | q10 / q10 | yes |
| betreibungsbegehren | q11 | Zins % | Qual è il tasso di interesse applicato? | q11 / q11 | yes |
| betreibungsbegehren | q12 | Zins seit (Datum) | Da quando è previsto l'interesse? | q12 / q12 | yes |
| betreibungsbegehren | q13 | Bemerkungen | Quali sono le osservazioni o note relative al caso? | q13 / q13 | yes |
| betreibungsbegehren | q14 | Ihre Fallreferenz (falls vorhanden) | Qual è il riferimento del caso, se disponibile? | q14 / q14 | yes |
| suva-bagatellunfall | q1 | Name und Adresse mit Postleitzahl | Come si chiama e dove si trova il datore di lavoro, con il codice postale? | q1 / q1 | yes |
| suva-bagatellunfall | q2 | Tel.-Nr. | Qual è il numero di telefono del datore di lavoro? | q2 / q2 | yes |
| suva-bagatellunfall | q3 | Kunden-Nr. | Qual è il numero di cliente? | q3 / q3 | yes |
| suva-bagatellunfall | q4 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | In quale settore lavora solitamente la persona infortunata? | q4 / q4 | yes |
| suva-bagatellunfall | q5 | Name und Vorname | Come si chiama la persona infortunata? | q5 / q5 | yes |
| suva-bagatellunfall | q6 | Geburtsdatum | In che data è nata la persona infortunata? | q6 / q6 | yes |
| suva-bagatellunfall | q7 | AHV-Nummer | Qual è il numero AVS della persona infortunata? | q7 / q7 | yes |
| suva-bagatellunfall | q8 | Strasse | In quale via abita la persona infortunata? | q8 / q8 | yes |
| suva-bagatellunfall | q9 | Staatsangehörigkeit | Di quale nazionalità è la persona infortunata? | q9 / q9 | yes |
| suva-bagatellunfall | q10 | Zivilstand | Qual è lo stato civile della persona infortunata? | q10 / q10 | yes |
| suva-bagatellunfall | q11 | Datum der Anstellung | In che data è iniziata l'impiego della persona infortunata? | q11 / q11 | yes |
| suva-bagatellunfall | q12 | Ausgeübter Beruf | Qual è la professione svolta dalla persona infortunata? | q12 / q12 | yes |
| suva-bagatellunfall | q13 | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | La persona infortunata fa parte di un cader superiore, medio o è impiegata, apprendista o praticante? | q13 / q13 | yes |
| suva-bagatellunfall | q14 | Arbeitszeit des/der Verletzten: Stunden je Woche | Quante ore alla settimana lavora la persona infortunata? | q14 / q14 | yes |
| suva-bagatellunfall | q15 | Tag | In che giorno è avvenuto l'incidente? | q17 / q17 | no |
| suva-bagatellunfall | q16 | Monat | In che mese è avvenuto l'incidente? | q16 / q16 | yes |
| suva-bagatellunfall | q17 | Jahr | In che anno è avvenuto l'incidente? | q17 / q17 | yes |
| suva-bagatellunfall | q18 | Zeit (Stunden, Minuten) | A che ora è avvenuto l'incidente (ore e minuti)? | q18 / q18 | yes |
| suva-bagatellunfall | q19 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | Dove è avvenuto l'incidente, indicando luogo e luogo specifico come officina o strada? | q19 / q19 | yes |
| suva-bagatellunfall | q20 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | Qual era l'attività svolta al momento dell'incidente? Descrivi l'incidente, le persone coinvolte e gli oggetti o veicoli coinvolti. | q20 / q20 | yes |
| suva-bagatellunfall | q21 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | Quali oggetti o macchine sono stati coinvolti nell'incidente? Indica con precisione. | q21 / q21 | yes |
| suva-bagatellunfall | q22 | Betroffener Körperteil | Qual è la parte del corpo interessata dall'infortunio? | q22 / q22 | yes |
| suva-bagatellunfall | q23 | links / rechts / unbestimmt | È l'infortunio a sinistra, a destra o non specificato? | q23 / q23 | yes |
| suva-bagatellunfall | q24 | Art der Schädigung | Qual è il tipo di danno subito? | q24 / q24 | yes |
| suva-bagatellunfall | q25 | Erstbehandelnder Arzt bzw. Spital/Klinik | Qual è il medico o l'ospedale che ha trattato per primo l'infortunato? | q25 / q25 | yes |
| suva-bagatellunfall | q26 | Nachbehandelnder Arzt bzw. Spital/Klinik | Qual è il medico o l'ospedale che ha seguito il trattamento successivo? | q26 / q26 | yes |
| suva-bagatellunfall | q27 | Ort und Datum | Dove e quando è stato concluso il trattamento? | q27 / q27 | yes |

### English

| form | unit | printed label | question written | unit named in run 1 / run 2 | holds |
|---|---|---|---|---|---|
| betreibungsbegehren | q1 | Betreibungsamt | Which office is handling this case? | q1 / q1 | yes |
| betreibungsbegehren | q2 | Schuldner (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | What is the name, first name, company, address, postal code, and town of the debtor? | q2 / q2 | yes |
| betreibungsbegehren | q3 | Geburtsdatum (falls bekannt) | What is the date of birth of the debtor, if known? | q3 / q3 | yes |
| betreibungsbegehren | q4 | Gläubiger (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | What is the name, first name, company, address, postal code, and town of the creditor? | q4 / q4 | yes |
| betreibungsbegehren | q5 | Zahlungsverbindung des Gläubigers / Zahlungsverbindung des Vertreters | What payment method does the creditor use? | q5 / q5 | yes |
| betreibungsbegehren | q6 | IBAN | What is the IBAN number? | q6 / q6 | yes |
| betreibungsbegehren | q7 | vertreten durch (Name und Vorname bzw. Firma; Adresse; PLZ Ort) | Who represents the creditor, and what is their name, first name, company, address, postal code, and town? | q2 / q7 | no |
| betreibungsbegehren | q8 | Für Rückfragen: Telefon oder E-Mail | What is the phone number or email for any questions? | q8 / q8 | yes |
| betreibungsbegehren | q9 | Forderungsgrund oder Forderungsurkunde mit Datum | What is the reason for the claim or the document number and date of the claim? | q9 / q9 | yes |
| betreibungsbegehren | q10 | Betrag (CHF) | What is the amount in Swiss francs? | q10 / q10 | yes |
| betreibungsbegehren | q11 | Zins % | What is the interest rate? | q11 / q11 | yes |
| betreibungsbegehren | q12 | Zins seit (Datum) | From what date is the interest calculated? | q12 / q12 | yes |
| betreibungsbegehren | q13 | Bemerkungen | What are the comments or notes about the case? | q13 / q13 | yes |
| betreibungsbegehren | q14 | Ihre Fallreferenz (falls vorhanden) | What is your case reference, if available? | q14 / q14 | yes |
| suva-bagatellunfall | q1 | Name und Adresse mit Postleitzahl | What is the name and address of your employer, including the postal code? | q1 / q1 | yes |
| suva-bagatellunfall | q2 | Tel.-Nr. | What is the telephone number of your employer? | q2 / q2 | yes |
| suva-bagatellunfall | q3 | Kunden-Nr. | What is your customer number? | q3 / q3 | yes |
| suva-bagatellunfall | q4 | Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig) | What is the usual department or branch where the injured person works? | q4 / q4 | yes |
| suva-bagatellunfall | q5 | Name und Vorname | What is the full name of the injured person? | q5 / q5 | yes |
| suva-bagatellunfall | q6 | Geburtsdatum | What is the date of birth of the injured person? | q6 / q6 | yes |
| suva-bagatellunfall | q7 | AHV-Nummer | What is the AHV number of the injured person? | q7 / q7 | yes |
| suva-bagatellunfall | q8 | Strasse | What is the street address of the injured person? | q8 / q8 | yes |
| suva-bagatellunfall | q9 | Staatsangehörigkeit | What is the nationality of the injured person? | q9 / q9 | yes |
| suva-bagatellunfall | q10 | Zivilstand | What is the marital status of the injured person? | q10 / q10 | yes |
| suva-bagatellunfall | q11 | Datum der Anstellung | When did the injured person start working for this employer? | q11 / q11 | yes |
| suva-bagatellunfall | q12 | Ausgeübter Beruf | What is the profession or job title of the injured person? | q12 / q12 | yes |
| suva-bagatellunfall | q13 | Höheres Kader / Mittleres Kader / Angestellte/r / Arbeiter/in / Lehrling / Praktikant/in | Is the injured person part of the higher management, middle management, regular employee, apprentice, or intern? | q13 / q13 | yes |
| suva-bagatellunfall | q14 | Arbeitszeit des/der Verletzten: Stunden je Woche | How many hours per week does the injured person work? | q14 / q14 | yes |
| suva-bagatellunfall | q15 | Tag | What is the day of the accident? | q17 / q17 | no |
| suva-bagatellunfall | q16 | Monat | What is the month of the accident? | q16 / q16 | yes |
| suva-bagatellunfall | q17 | Jahr | What is the year of the accident? | q17 / q17 | yes |
| suva-bagatellunfall | q18 | Zeit (Stunden, Minuten) | What time did the accident occur (hours and minutes)? | q18 / q18 | yes |
| suva-bagatellunfall | q19 | Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse) | What is the location of the accident (place name or postal code) and the specific place or street where it happened? | q19 / q19 | yes |
| suva-bagatellunfall | q20 | Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Personen, beteiligte Gegenstände, Fahrzeuge | What activity was the injured person doing at the time of the accident, and what was the sequence of events? | q20 / q20 | yes |
| suva-bagatellunfall | q21 | Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung) | What objects were involved in the accident, such as machines, tools, vehicles, or materials, and please describe them in detail? | q21 / q21 | yes |
| suva-bagatellunfall | q22 | Betroffener Körperteil | Which body part was injured in the accident? | q22 / q22 | yes |
| suva-bagatellunfall | q23 | links / rechts / unbestimmt | Was the injury on the left side, right side, or is it unclear? | q23 / q23 | yes |
| suva-bagatellunfall | q24 | Art der Schädigung | What type of injury or damage occurred? | q24 / q24 | yes |
| suva-bagatellunfall | q25 | Erstbehandelnder Arzt bzw. Spital/Klinik | Who was the first doctor or hospital that treated the injured person? | q25 / q25 | yes |
| suva-bagatellunfall | q26 | Nachbehandelnder Arzt bzw. Spital/Klinik | Who was the doctor or hospital that provided follow-up treatment? | q26 / q26 | yes |
| suva-bagatellunfall | q27 | Ort und Datum | Where and when was the final assessment or conclusion made? | q27 / q27 | yes |

## Every field that got a value or should have got one

### German

| form | field | asked with | answer | expected | value read | origin | verdict |
|---|---|---|---|---|---|---|---|
| betreibungsbegehren | amt | Um welches Betreibungsamt handelt es sich? | Betreibungsamt Chur | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| betreibungsbegehren | schuldner | Wie heisst der Schuldner und wo wohnt er? | Peter Hartmann, Via Nova vierzehn, siebentausenddreizehn Domat Ems | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7013 Domat Ems | literal | same |
| betreibungsbegehren | glaeubiger | Wie heisst der Gläubiger und wo ist er ansässig? | Garage Caduff AG, Kasernenstrasse acht, siebentausend Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | literal | same |
| betreibungsbegehren | zahlung-g | Welche Zahlungsverbindung wählt der Gläubiger? | Zahlung aufs Konto | x | x | neither | same |
| betreibungsbegehren | iban | Welche IBAN wird angegeben? | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | CH93 0076 201 11 6238 5295 7 | neither | different |
| betreibungsbegehren | forderung | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn vom zwölften Juni | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Rechnung Nummer 20 26 strich 118 vom 12. Juni | literal | different |
| betreibungsbegehren | betrag | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | zweitausenddreihundertvierzig Franken fünfzig | 2'340.50 | 2340 Franken 50 | literal | different |
| betreibungsbegehren | zins | Welcher Zinssatz wird verlangt? | fünf Prozent | 5 | 5 | literal | same |
| betreibungsbegehren | zinsseit | Seit welchem Datum wird Zins verlangt? | ab dreizehntem Juli | 13.07.2026 | ab 13. Juli | literal | different |
| betreibungsbegehren | bemerkung | Gibt es Bemerkungen zum Abschluss? | Nicht bekannt | – | Nicht bekannt | literal | value, none expected |
| suva-bagatellunfall | arbeitgeber | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Logistik Zugersee AG, Werkstrasse zwölf, 6301 Zug | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | Logistik Zugersee AG, Werkstrasse 12, 6301 Zug | literal | different |
| suva-bagatellunfall | tel | Welche Telefonnummer hat der Arbeitgeber? | 041 728 4010 | 041 728 40 10 | 041 728 4010 | literal | same |
| suva-bagatellunfall | arbeitsplatz | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Lager | Lager | Lager | literal | same |
| suva-bagatellunfall | name | Wie heissen die verletzte Person? | Sandra Keller | Keller Sandra | Sandra Keller | literal | different |
| suva-bagatellunfall | geburt | Wann ist die verletzte Person geboren? | 14. März 1988 | 14.03.1988 | 14.03.1988 | literal | same |
| suva-bagatellunfall | strasse | Welche Strasse hat die verletzte Person? | Werkstrasse zwölf | Werkstrasse 12, 6300 Zug | Werkstrasse 12 | literal | different |
| suva-bagatellunfall | staat | Welche Staatsangehörigkeit hat die verletzte Person? | Schweizerin | Schweiz | Schweizerin | literal | different |
| suva-bagatellunfall | zivilstand | Welcher Zivilstand ist bei der verletzten Person? | ledig | ledig | ledig | literal | same |
| suva-bagatellunfall | anstellung | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | 1. Februar 2019 | 01.02.2019 | 01.02.2019 | literal | same |
| suva-bagatellunfall | beruf | Welchen Beruf übt die verletzte Person aus? | Lagermitarbeiterin | Lagermitarbeiterin | Lagermitarbeiterin | literal | same |
| suva-bagatellunfall | st-angestellt | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Angestellte/r | x | x | neither | same |
| suva-bagatellunfall | stunden | Wie viele Stunden arbeitet die verletzte Person pro Woche? | 40 | 40 | 40 | literal | same |
| suva-bagatellunfall | tag | Tag | Tag | 05 | Tag | literal | different |
| suva-bagatellunfall | monat | Welcher Monat war es, als der Unfall passierte? | Monat | 10 | Monat | literal | different |
| suva-bagatellunfall | jahr | Welches Jahr war es, als der Unfall passierte? | Jahr | 2026 | – | – | empty, value expected |
| suva-bagatellunfall | zeit | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | 20:02 | 14:20 | 20:02 | literal | different |
| suva-bagatellunfall | ort | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Werkstrasse zwölf, Zug | Lager, Werkstrasse 12, Zug | Werkstrasse 12, Zug | literal | different |
| suva-bagatellunfall | hergang | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt | literal | same |
| suva-bagatellunfall | gegenstaende | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Palette | Palette | Palette | literal | same |
| suva-bagatellunfall | koerperteil | Welcher Körperteil der verletzten Person ist betroffen? | Rechtes Handgelenk | Handgelenk | Rechtes Handgelenk | literal | different |
| suva-bagatellunfall | seite-rechts | Ist die Verletzung links, rechts oder unbestimmt? | Rechts | x | x | literal | same |
| suva-bagatellunfall | schaedigung | Wie ist die Art der Schädigung bei der Verletzung? | Prellung/Verletzung des rechten Handgelenks | – | Prellung/Verletzung des rechten Handgelenks | literal | value, none expected |
| suva-bagatellunfall | arzt1 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Kantonsspital Zug | Kantonsspital Zug, Notfall | Kantonsspital Zug | literal | different |

### French

| form | field | asked with | answer | expected | value read | origin | verdict |
|---|---|---|---|---|---|---|---|
| betreibungsbegehren | amt | De quel bureau de poursuite s'agit-il ? | Il s'agit du bureau de poursuite de Chur. | Betreibungsamt Chur | Betreibungsamt | neither | different |
| betreibungsbegehren | schuldner | Quel est le nom et le prénom du débiteur, ou le nom de l'entreprise, ainsi que son adresse et son code postal et sa localité ? | Le débiteur est Peter Hartmann, Via Nova 14, 7313 Domat Ems. | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7313 Domat Ems | literal | different |
| betreibungsbegehren | glaeubiger | Quel est le nom et le prénom du créancier, ou le nom de l'entreprise, ainsi que son adresse et son code postal et sa localité ? | Le créancier est la Garage Caduff AG, Kasernenstrasse 8, 7000 Chur. | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Le créancier est la Garage Caduff AG, Kasernenstrasse 8, 7000 Chur. | literal | different |
| betreibungsbegehren | zahlung-g | Quel moyen de paiement le créancier utilise-t-il ? | Le créancier demande un paiement sur le compte IBAN CH93 0076 2011 6238 5295 7. | x | x | neither | same |
| betreibungsbegehren | iban | Quel est le numéro IBAN ? | Le numéro IBAN est CH93 0076 2011 6238 5295 7. | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal | same |
| betreibungsbegehren | forderung | Quel est le motif de la créance ou le document de créance avec sa date ? | Le motif de la créance est la facture numéro 2026-118 du 12 juin pour la réparation. | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Le motif de la créance est la facture numéro 2026-118 du 12 juin pour la réparation | literal | different |
| betreibungsbegehren | betrag | Quel est le montant de la créance en francs suisses ? | Le montant de la créance est de 2340,50 francs suisses. | 2'340.50 | 2340,50 CHF | neither | different |
| betreibungsbegehren | zins | Quel est le taux d'intérêt en pourcentage ? | Le taux d'intérêt est de 5%. | 5 | 5% | literal | same |
| betreibungsbegehren | zinsseit | Depuis quelle date le taux d'intérêt s'applique-t-il ? | Le taux d'intérêt s'applique à partir du 13 juillet. | 13.07.2026 | 13.07.2024 | neither | different |
| suva-bagatellunfall | arbeitgeber | Quel est le nom et l'adresse complète de l'employeur, y compris le code postal? | Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | literal | different |
| suva-bagatellunfall | tel | Quel est le numéro de téléphone de l'employeur? | 041 728 4010 | 041 728 40 10 | 041 728 4010 | literal | same |
| suva-bagatellunfall | arbeitsplatz | Dans quel secteur ou département travaille habituellement la personne blessée? | Lager | Lager | Lager | literal | same |
| suva-bagatellunfall | name | Quel est le nom et le prénom de la personne blessée? | Sandra Keller | Keller Sandra | Sandra Keller | literal | different |
| suva-bagatellunfall | geburt | Quel est la date de naissance de la personne blessée? | 14 mars 1988 | 14.03.1988 | 14.03.1988 | neither | same |
| suva-bagatellunfall | strasse | Quelle est la rue où habite la personne blessée? | Werkstrasse zwölf, 6300 Zug | Werkstrasse 12, 6300 Zug | Werkstrasse zwölf | literal | different |
| suva-bagatellunfall | staat | De quelle nationalité est la personne blessée? | Suisse | Schweiz | Schweiz | neither | same |
| suva-bagatellunfall | zivilstand | Quel est l'état civil de la personne blessée? | Ledig | ledig | Ledig | literal | same |
| suva-bagatellunfall | anstellung | À quelle date la personne blessée a-t-elle commencé son emploi? | Premier février 2019 | 01.02.2019 | 01.02.2019 | neither | same |
| suva-bagatellunfall | beruf | Quel est le métier exercé par la personne blessée? | Lagermitarbeiterin | Lagermitarbeiterin | Lagermitarbeiterin | literal | same |
| suva-bagatellunfall | st-angestellt | La personne blessée fait-elle partie du personnel de cadre supérieur, du personnel de cadre intermédiaire, des employés, des apprentis ou des stagiaires? | Employés | x | x | neither | same |
| suva-bagatellunfall | stunden | Arbeitszeit des/der Verletzten: Stunden je Woche | 40 | 40 | 40 | literal | same |
| suva-bagatellunfall | tag | Tag | 20 | 05 | 20 | literal | different |
| suva-bagatellunfall | monat | Quel est le mois de l'accident? | Mai | 10 | Mai | literal | different |
| suva-bagatellunfall | jahr | Quel est l'année de l'accident? | 2023 | 2026 | 2023 | literal | different |
| suva-bagatellunfall | zeit | À quelle heure précise s'est produit l'accident (heures et minutes)? | 20:02 | 14:20 | 20:02 | literal | different |
| suva-bagatellunfall | ort | Quel est le lieu de l'accident (nom ou code postal) et l'endroit précis (atelier, rue, etc.)? | Werkstrasse, Zug | Lager, Werkstrasse 12, Zug | Werkstrasse, Zug | literal | different |
| suva-bagatellunfall | hergang | Quelle était l'activité de la personne blessée au moment de l'accident ? Comment s'est déroulé l'accident ? Quelles personnes et quels objets ou véhicules étaient impliqués? | Abladen einer Palette, ausgerutscht und auf das rechte Handgelenk gestürzt | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Abladen einer Palette, ausgerutscht und auf das rechte Handgelenk gestürzt | literal | different |
| suva-bagatellunfall | gegenstaende | Quels objets ou équipements (machine, outil, véhicule, produit, etc.) étaient impliqués dans l'accident ? Veuillez donner des détails précis. | Palette, keine Maschine oder Fahrzeug | Palette | Palette | literal | same |
| suva-bagatellunfall | koerperteil | Quel est le membre du corps concerné par la blessure ? | Rechtes Handgelenk | Handgelenk | Rechtes Handgelenk | literal | different |
| suva-bagatellunfall | seite-rechts | La blessure concerne-t-elle le côté gauche, le côté droit ou est-elle indéterminée ? | Recht | x | x | neither | same |
| suva-bagatellunfall | schaedigung | Quel est le type de dommage subi par la personne blessée ? | Fracture du poignet droit | – | Fracture des rechten Handgelenks | neither | value, none expected |
| suva-bagatellunfall | arzt1 | Quel est le nom du médecin ou de l'hôpital/clinique qui a traité la personne blessée en premier ? | Kantonsspital Zug | Kantonsspital Zug, Notfall | Kantonsspital Zug | literal | different |
| suva-bagatellunfall | arzt2 | Quel est le nom du médecin ou de l'hôpital/clinique qui a pris en charge le suivi de la personne blessée ? | Nicht bekannt | – | Nicht bekannt | literal | value, none expected |

### Italian

| form | field | asked with | answer | expected | value read | origin | verdict |
|---|---|---|---|---|---|---|---|
| betreibungsbegehren | amt | Di quale Ufficio di esecuzione si tratta? | L'Ufficio di esecuzione è quello di Chur. | Betreibungsamt Chur | Betreibungsamt | neither | different |
| betreibungsbegehren | schuldner | Come si chiama il debitore e qual è il suo indirizzo? | Il debitore si chiama Peter Hartmann e il suo indirizzo è Via Nova 14, 7313 Domat Ems. | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova 14, 7313 Domat Ems | derived | different |
| betreibungsbegehren | glaeubiger | Come si chiama il creditore e qual è il suo indirizzo? | Il creditore si chiama Garage Caduff AG e il suo indirizzo è Kasernenstrasse 8, 7000 Chur. | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | derived | same |
| betreibungsbegehren | zahlung-g | Qual è la forma di pagamento del creditore? | La forma di pagamento è sul conto IBAN. | x | x | neither | same |
| betreibungsbegehren | iban | Qual è il numero IBAN? | L'IBAN è CH93 0076 2011 6238 5295 7. | CH93 0076 2011 6238 5295 7 | CH93 0076 2011 6238 5295 7 | literal | same |
| betreibungsbegehren | forderung | Qual è il motivo della richiesta o il documento di riferimento con data? | Il motivo della richiesta è la fattura numero 2026-118 del 12 giugno. | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | Faktura Nr. 2026-118 vom 12. Juni | neither | different |
| betreibungsbegehren | betrag | Qual è l'importo della richiesta in franchi svizzeri? | L'importo della richiesta è di 2340.50 franchi svizzeri. | 2'340.50 | 2340.50 | literal | same |
| betreibungsbegehren | zins | Qual è il tasso di interesse applicato? | Il tasso di interesse è del cinque percento. | 5 | fünf Prozent | neither | different |
| betreibungsbegehren | zinsseit | Da quando è previsto l'interesse? | L'interesse è previsto dal 13 luglio. | 13.07.2026 | 13.07.2024 | neither | different |
| suva-bagatellunfall | arbeitgeber | Come si chiama e dove si trova il datore di lavoro, con il codice postale? | La Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | La Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | literal | different |
| suva-bagatellunfall | tel | Qual è il numero di telefono del datore di lavoro? | 041 728 4010 | 041 728 40 10 | 041 728 4010 | literal | same |
| suva-bagatellunfall | arbeitsplatz | In quale settore lavora solitamente la persona infortunata? | Lager | Lager | Lager | literal | same |
| suva-bagatellunfall | name | Come si chiama la persona infortunata? | Sandra Keller | Keller Sandra | Sandra Keller | literal | different |
| suva-bagatellunfall | geburt | In che data è nata la persona infortunata? | 14 marzo 1988 | 14.03.1988 | 14.03.1988 | neither | same |
| suva-bagatellunfall | strasse | In quale via abita la persona infortunata? | Werkstrasse zwölf, 6300 Zug | Werkstrasse 12, 6300 Zug | Werkstrasse zwölf | literal | different |
| suva-bagatellunfall | staat | Di quale nazionalità è la persona infortunata? | Svizzera | Schweiz | Schweiz | neither | same |
| suva-bagatellunfall | zivilstand | Qual è lo stato civile della persona infortunata? | Ledig | ledig | Ledig | literal | same |
| suva-bagatellunfall | anstellung | In che data è iniziata l'impiego della persona infortunata? | 1º febbraio 2019 | 01.02.2019 | 01.02.2019 | neither | same |
| suva-bagatellunfall | beruf | Qual è la professione svolta dalla persona infortunata? | Lagermitarbeiterin | Lagermitarbeiterin | Lagermitarbeiterin | literal | same |
| suva-bagatellunfall | st-angestellt | La persona infortunata fa parte di un cader superiore, medio o è impiegata, apprendista o praticante? | Impiegata | x | x | neither | same |
| suva-bagatellunfall | stunden | Quante ore alla settimana lavora la persona infortunata? | 40 | 40 | 40 | literal | same |
| suva-bagatellunfall | tag | Tag | Lunedì | 05 | Lunedì | literal | different |
| suva-bagatellunfall | monat | In che mese è avvenuto l'incidente? | Maggio | 10 | Mai | neither | different |
| suva-bagatellunfall | jahr | In che anno è avvenuto l'incidente? | 2023 | 2026 | 2023 | literal | different |
| suva-bagatellunfall | zeit | A che ora è avvenuto l'incidente (ore e minuti)? | 20:02 | 14:20 | 20:02 | literal | different |
| suva-bagatellunfall | ort | Dove è avvenuto l'incidente, indicando luogo e luogo specifico come officina o strada? | Werkstrasse, Zug | Lager, Werkstrasse 12, Zug | Werkstrasse, Zug | literal | different |
| suva-bagatellunfall | hergang | Qual era l'attività svolta al momento dell'incidente? Descrivi l'incidente, le persone coinvolte e gli oggetti o veicoli coinvolti. | Sandra Keller è scivolata mentre scaricava una palette e si è rotta il polso destro | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Sandra Keller è scivolata mentre scaricava una palette e si è rotta il polso destro | literal | different |
| suva-bagatellunfall | gegenstaende | Quali oggetti o macchine sono stati coinvolti nell'incidente? Indica con precisione. | Nessun oggetto o macchina specificata | Palette | – | – | empty, value expected |
| suva-bagatellunfall | koerperteil | Qual è la parte del corpo interessata dall'infortunio? | Polso destro | Handgelenk | Pols rechter | neither | different |
| suva-bagatellunfall | seite-rechts | È l'infortunio a sinistra, a destra o non specificato? | Destro | x | x | neither | same |
| suva-bagatellunfall | schaedigung | Qual è il tipo di danno subito? | Frattura del polso destro | – | Fraktur des rechten Handgelenks | neither | value, none expected |
| suva-bagatellunfall | arzt1 | Qual è il medico o l'ospedale che ha trattato per primo l'infortunato? | Kantonsspital Zug | Kantonsspital Zug, Notfall | Kantonsspital Zug | literal | different |

### English

| form | field | asked with | answer | expected | value read | origin | verdict |
|---|---|---|---|---|---|---|---|
| betreibungsbegehren | amt | Which office is handling this case? | The case is being handled by the Betreibungsamt Chur. | Betreibungsamt Chur | Betreibungsamt Chur | literal | same |
| betreibungsbegehren | schuldner | What is the name, first name, company, address, postal code, and town of the debtor? | The debtor is Peter Hartmann, Via Nova fourteen, 7313 Domat Ems. | Peter Hartmann, Via Nova 14, 7013 Domat/Ems | Peter Hartmann, Via Nova fourteen, Domat Ems | derived | different |
| betreibungsbegehren | glaeubiger | What is the name, first name, company, address, postal code, and town of the creditor? | The creditor is Garage Caduff AG, Kasernenstrasse eight, 7000 Chur. | Garage Caduff AG, Kasernenstrasse 8, 7000 Chur | Garage Caduff AG, Garage Caduff AG, Kasernenstrasse eight, Chur | derived | different |
| betreibungsbegehren | zahlung-g | What payment method does the creditor use? | The creditor requests payment to the specified IBAN account. | x | x | neither | same |
| betreibungsbegehren | iban | What is the IBAN number? | The IBAN number is CH93 0076 2011 6238 5295 7. | CH93 0076 2011 6238 5295 7 | CH93 0076 2012 11 6238 5295 7 | neither | different |
| betreibungsbegehren | forderung | What is the reason for the claim or the document number and date of the claim? | The reason for the claim is a repair invoice number twenty-six one hundred eighteen from June twelfth. | Rechnung Nr. 2026-118 vom 12.06.2026, Reparatur | The reason for the claim is a repair invoice number twenty-six one hundred eighteen from June twelfth. | literal | different |
| betreibungsbegehren | betrag | What is the amount in Swiss francs? | The amount is two thousand three hundred forty francs and fifty centimes. | 2'340.50 | zwei tausend drei hundert vierzig Franken und fünfzig Centime | neither | different |
| betreibungsbegehren | zins | What is the interest rate? | The interest rate is five percent. | 5 | fünf Prozent | neither | different |
| betreibungsbegehren | zinsseit | From what date is the interest calculated? | Interest is calculated from July thirteenth. | 13.07.2026 | thirteenth.07.JJJJ | neither | different |
| suva-bagatellunfall | arbeitgeber | What is the name and address of your employer, including the postal code? | Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | Logistik Zugersee AG, Werkstrasse 12, 6300 Zug | Logistik Zugersee AG, Werkstrasse zwölf, 6300 Zug | literal | different |
| suva-bagatellunfall | tel | What is the telephone number of your employer? | 041 728 4010 | 041 728 40 10 | 041 728 4010 | literal | same |
| suva-bagatellunfall | arbeitsplatz | What is the usual department or branch where the injured person works? | Lager | Lager | Lager | literal | same |
| suva-bagatellunfall | name | What is the full name of the injured person? | Sandra Keller | Keller Sandra | Sandra Keller | literal | different |
| suva-bagatellunfall | geburt | What is the date of birth of the injured person? | 14 March 1988 | 14.03.1988 | 14.03.1988 | neither | same |
| suva-bagatellunfall | strasse | What is the street address of the injured person? | Werkstrasse zwölf, 6300 Zug | Werkstrasse 12, 6300 Zug | Werkstrasse zwölf | literal | different |
| suva-bagatellunfall | staat | What is the nationality of the injured person? | Swiss | Schweiz | Swiss | literal | different |
| suva-bagatellunfall | zivilstand | What is the marital status of the injured person? | Single | ledig | Single | literal | different |
| suva-bagatellunfall | anstellung | When did the injured person start working for this employer? | 1 February 2019 | 01.02.2019 | 01.02.2019 | neither | same |
| suva-bagatellunfall | beruf | What is the profession or job title of the injured person? | Warehouse employee | Lagermitarbeiterin | Warehouse employee | literal | different |
| suva-bagatellunfall | st-angestellt | Is the injured person part of the higher management, middle management, regular employee, apprentice, or intern? | Regular employee | x | x | neither | same |
| suva-bagatellunfall | stunden | How many hours per week does the injured person work? | 40 hours | 40 | 40 | literal | same |
| suva-bagatellunfall | tag | Tag | Day | 05 | Day | literal | different |
| suva-bagatellunfall | monat | What is the month of the accident? | May | 10 | Mai | neither | different |
| suva-bagatellunfall | jahr | What is the year of the accident? | 2023 | 2026 | 2023 | literal | different |
| suva-bagatellunfall | zeit | What time did the accident occur (hours and minutes)? | 20:10 | 14:20 | 20:10 | literal | different |
| suva-bagatellunfall | ort | What is the location of the accident (place name or postal code) and the specific place or street where it happened? | Werkstrasse, 6300 Zug | Lager, Werkstrasse 12, Zug | Werkstrasse, 6300 Zug | literal | different |
| suva-bagatellunfall | hergang | What activity was the injured person doing at the time of the accident, and what was the sequence of events? | Slipped while unloading a pallet and fell on the right wrist | Beim Abladen einer Palette ausgerutscht und auf das rechte Handgelenk gestürzt. | Slipped while unloading a pallet and fell on the right wrist | literal | different |
| suva-bagatellunfall | gegenstaende | What objects were involved in the accident, such as machines, tools, vehicles, or materials, and please describe them in detail? | Pallet | Palette | Pallet | literal | different |
| suva-bagatellunfall | koerperteil | Which body part was injured in the accident? | Right wrist | Handgelenk | Right wrist | literal | different |
| suva-bagatellunfall | seite-rechts | Was the injury on the left side, right side, or is it unclear? | Right | x | x | neither | same |
| suva-bagatellunfall | schaedigung | What type of injury or damage occurred? | Fracture or sprain of the right wrist | – | Fracture or sprain of the right wrist | literal | value, none expected |
| suva-bagatellunfall | arzt1 | Who was the first doctor or hospital that treated the injured person? | Cantonspital Zug | Kantonsspital Zug, Notfall | Cantonspital Zug | literal | different |
