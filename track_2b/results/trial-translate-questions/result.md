# Result: the stored German questions translated

One run on 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0: the 40 stored German questions of the two
walk-through forms (14 and 26) translated into French, Italian and English, twice: twelve questions per call, and the
whole form in one call. The translation made twelve per call was then checked twice. 49 calls, all answered: 15
translate twelve per call, 6 the whole form, 28 check.

Counted again from the answers in `calls/` with the check of the repository as it was on that day. "Lines back": a
translation came back under the number of the question. "Digits kept": the digits of the translation are those of the
German question. A translated question **holds** when both runs of the check, over the German list of lines, name its
own unit and no other unit of the page is asked with the same words. In German all 40 hold: they are the stored
questions.

| language | translated | questions | lines back | digits kept | holds | calls to translate | calls to check |
|---|---|---:|---:|---:|---|---:|---:|
| French | twelve per call | 40 | 40 | 40 | 34 of 40 | 5 | 10 |
| French | whole form in one call | 40 | 40 | 40 | not checked | 2 | 0 |
| Italian | twelve per call | 40 | 40 | 40 | 34 of 40 | 5 | 10 |
| Italian | whole form in one call | 40 | 40 | 40 | not checked | 2 | 0 |
| English | twelve per call | 40 | 28 | 28 | 25 of 28 | 5 | 8 |
| English | whole form in one call | 40 | 40 | 40 | not checked | 2 | 0 |

In English one call with twelve questions gave no line that was read: call 9 of `calls/en/`, questions 1 to 12 of the
Suva form. Its answer closes the JSON once too often (`…practice?"]}]}`), and the reader of that day took single
entries only with their number in quotes. The twelve questions are in the answer; they were not checked.

## The translated questions that do not hold

| language | form | unit | German question | translated, whole form | translated, twelve per call | unit named in run 1 / run 2 | holds |
|---|---|---|---|---|---|---|---|
| French | betreibungsbegehren | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | Comment peut-on joindre le créancier par téléphone ou par e-mail? | Comment peut-on joindre le créancier par téléphone ou par e-mail? | q8 / q5 | no |
| French | suva-bagatellunfall | q8 | Welche Strasse hat die verletzte Person? | Quelle est la rue de la personne blessée? | Quelle est la rue de la personne blessée? | none / q8 | no |
| French | suva-bagatellunfall | q16 | Welcher Monat war es, als der Unfall passierte? | Quel mois était-ce lorsque l'accident s'est produit? | Quel mois l'accident s'est-il produit? | q17 / q16 | no |
| French | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Qui est le médecin traitant ou l'hôpital/clinique? | Quel est le médecin traitant ou l'hôpital/clinique? | q26 / q26 | no |
| French | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Qui est le médecin de suivi ou l'hôpital/clinique? | Qui est le médecin traitant ou l'hôpital/clinique? | q25 / q25 | no |
| French | suva-bagatellunfall | q27 | Wo und wann ist der Abschluss passiert? | Où et quand l'accident a-t-il été clôturé? | Où et quand l'accident s'est-il produit? | q19 / q17 | no |
| Italian | betreibungsbegehren | q7 | Wer vertritt den Gläubiger? | Chi rappresenta il creditore? | Chi rappresenta il creditore? | q7 / q5 | no |
| Italian | suva-bagatellunfall | q14 | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Quante ore lavora la persona infortunata a settimana? | Quante ore lavora la persona ferita a settimana? | none / q14 | no |
| Italian | suva-bagatellunfall | q16 | Welcher Monat war es, als der Unfall passierte? | In quale mese è avvenuto l'incidente? | In quale mese è avvenuto l'incidente? | q17 / q16 | no |
| Italian | suva-bagatellunfall | q22 | Welcher Körperteil der verletzten Person ist betroffen? | Quale parte del corpo della persona infortunata è interessata? | Quale parte del corpo della persona ferita è interessata? | q22 / none | no |
| Italian | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Chi è il medico curante o l'ospedale/clinica? | Chi è il medico che ha trattato per primo o l'ospedale/clinica? | q26 / q26 | no |
| Italian | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Chi è il medico di seguito o l'ospedale/clinica? | Chi è il medico curante o l'ospedale/clinica? | q25 / q25 | no |
| English | betreibungsbegehren | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | How can one reach the creditor for follow-up questions by phone or email? | How can one reach the creditor for follow-up questions by phone or email? | q8 / q5 | no |
| English | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Who is the treating physician or the hospital/clinic? | Who is the treating doctor or the hospital/clinic? | none / q26 | no |
| English | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Who is the follow-up physician or the hospital/clinic? | Who is the attending doctor or the hospital/clinic? | q25 / q25 | no |

## Every question

| language | form | unit | German question | translated, whole form | translated, twelve per call | unit named in run 1 / run 2 | holds |
|---|---|---|---|---|---|---|---|
| French | betreibungsbegehren | q1 | Um welches Betreibungsamt handelt es sich? | De quel office des poursuites s'agit-il? | De quel office des poursuites s'agit-il? | q1 / q1 | yes |
| French | betreibungsbegehren | q2 | Wie heisst der Schuldner und wo wohnt er? | Comment s'appelle le débiteur et où habite-t-il? | Comment s'appelle le débiteur et où habite-t-il? | q2 / q2 | yes |
| French | betreibungsbegehren | q3 | Wann ist das Geburtsdatum des Schuldners? | Quelle est la date de naissance du débiteur? | Quelle est la date de naissance du débiteur? | q3 / q3 | yes |
| French | betreibungsbegehren | q4 | Wie heisst der Gläubiger und wo ist er ansässig? | Comment s'appelle le créancier et où est-il domicilié? | Comment s'appelle le créancier et où est-il domicilié? | q4 / q4 | yes |
| French | betreibungsbegehren | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | Quel moyen de paiement choisit le créancier? | Quel moyen de paiement choisit le créancier? | q5 / q5 | yes |
| French | betreibungsbegehren | q6 | Welche IBAN wird angegeben? | Quel IBAN est indiqué? | Quelle IBAN est indiquée? | q6 / q6 | yes |
| French | betreibungsbegehren | q7 | Wer vertritt den Gläubiger? | Qui représente le créancier? | Qui représente le créancier? | q7 / q7 | yes |
| French | betreibungsbegehren | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | Comment peut-on joindre le créancier par téléphone ou par e-mail? | Comment peut-on joindre le créancier par téléphone ou par e-mail? | q8 / q5 | no |
| French | betreibungsbegehren | q9 | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Quel motif de la créance ou quel document daté est présenté? | Quel motif de la créance ou quel document daté est présenté? | q9 / q9 | yes |
| French | betreibungsbegehren | q10 | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | Quel est le montant de la créance en francs suisses? | Quel est le montant de la créance en francs suisses? | q10 / q10 | yes |
| French | betreibungsbegehren | q11 | Welcher Zinssatz wird verlangt? | Quel taux d'intérêt est exigé? | Quel taux d'intérêt est exigé? | q11 / q11 | yes |
| French | betreibungsbegehren | q12 | Seit welchem Datum wird Zins verlangt? | À partir de quelle date l'intérêt est-il exigé? | À partir de quelle date l'intérêt est-il exigé? | q12 / q12 | yes |
| French | betreibungsbegehren | q13 | Gibt es Bemerkungen zum Abschluss? | Y a-t-il des observations concernant la clôture? | Y a-t-il des observations pour conclure? | q13 / q13 | yes |
| French | betreibungsbegehren | q14 | Welche Fallreferenz ist vorhanden? | Quelle est la référence de l'affaire? | Quelle référence de cas est disponible? | q14 / q14 | yes |
| French | suva-bagatellunfall | q1 | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Comment s'appelle l'employeur et où se trouve-t-il avec le code postal? | Comment s'appelle l'employeur et où se trouve-t-il avec le code postal? | q1 / q1 | yes |
| French | suva-bagatellunfall | q2 | Welche Telefonnummer hat der Arbeitgeber? | Quel est le numéro de téléphone de l'employeur? | Quel est le numéro de téléphone de l'employeur? | q2 / q2 | yes |
| French | suva-bagatellunfall | q3 | Welche Kunden-Nummer hat der Arbeitgeber? | Quel est le numéro de client de l'employeur? | Quel est le numéro de client de l'employeur? | q3 / q3 | yes |
| French | suva-bagatellunfall | q4 | In welchem Bereich arbeitet die verletzte Person im Betrieb? | Dans quel domaine travaille la personne blessée dans l'entreprise? | Dans quel domaine travaille la personne blessée dans l'entreprise? | q4 / q4 | yes |
| French | suva-bagatellunfall | q5 | Wie heissen die verletzte Person? | Comment s'appelle la personne blessée? | Comment s'appelle la personne blessée? | q5 / q5 | yes |
| French | suva-bagatellunfall | q6 | Wann ist die verletzte Person geboren? | Quand la personne blessée est-elle née? | Quand la personne blessée est-elle née? | q6 / q6 | yes |
| French | suva-bagatellunfall | q7 | Welche AHV-Nummer hat die verletzte Person? | Quel est le numéro AVS de la personne blessée? | Quel est le numéro AVS de la personne blessée? | q7 / q7 | yes |
| French | suva-bagatellunfall | q8 | Welche Strasse hat die verletzte Person? | Quelle est la rue de la personne blessée? | Quelle est la rue de la personne blessée? | none / q8 | no |
| French | suva-bagatellunfall | q9 | Welche Staatsangehörigkeit hat die verletzte Person? | Quelle est la nationalité de la personne blessée? | Quelle est la nationalité de la personne blessée? | q9 / q9 | yes |
| French | suva-bagatellunfall | q10 | Welcher Zivilstand ist bei der verletzten Person? | Quel est l'état civil de la personne blessée? | Quel est l'état civil de la personne blessée? | q10 / q10 | yes |
| French | suva-bagatellunfall | q11 | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Quand la personne blessée a-t-elle commencé à travailler chez cet employeur? | Quand la personne blessée a-t-elle commencé à travailler chez cet employeur? | q11 / q11 | yes |
| French | suva-bagatellunfall | q12 | Welchen Beruf übt die verletzte Person aus? | Quel métier exerce la personne blessée? | Quel métier exerce la personne blessée? | q12 / q12 | yes |
| French | suva-bagatellunfall | q13 | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | La personne blessée est-elle cadre supérieur, cadre intermédiaire, employé(e), ouvrier(ère), apprenti(e) ou stagiaire? | La personne blessée fait-elle partie du personnel de direction supérieure, du personnel de direction intermédiaire, des employés, des travailleurs, des apprentis ou des stagiaires? | q13 / q13 | yes |
| French | suva-bagatellunfall | q14 | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Combien d'heures la personne blessée travaille-t-elle par semaine? | Combien d'heures la personne blessée travaille-t-elle par semaine? | q14 / q14 | yes |
| French | suva-bagatellunfall | q16 | Welcher Monat war es, als der Unfall passierte? | Quel mois était-ce lorsque l'accident s'est produit? | Quel mois l'accident s'est-il produit? | q17 / q16 | no |
| French | suva-bagatellunfall | q17 | Welches Jahr war es, als der Unfall passierte? | Quelle année était-ce lorsque l'accident s'est produit? | Quelle année l'accident s'est-il produit? | q17 / q17 | yes |
| French | suva-bagatellunfall | q18 | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | À quelle heure l'accident s'est-il produit, en heures et minutes? | À quelle heure l'accident s'est-il produit, en heures et minutes? | q18 / q18 | yes |
| French | suva-bagatellunfall | q19 | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Où l'accident s'est-il produit exactement, par exemple lieu et rue ou code postal? | Où l'accident s'est-il produit exactement, par exemple lieu et rue ou code postal? | q19 / q19 | yes |
| French | suva-bagatellunfall | q20 | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Que faisait exactement la personne blessée au moment de l'accident, comment l'accident s'est-il déroulé, qui était présent et quoi était impliqué? | Que faisait exactement la personne blessée au moment de l'accident, comment l'accident s'est-il déroulé, qui était présent et quoi était impliqué? | q20 / q20 | yes |
| French | suva-bagatellunfall | q21 | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Quels objets étaient impliqués dans l'accident, comme machine, outil, véhicule ou substance de travail? | Quels objets étaient impliqués dans l'accident, comme machine, outil, véhicule ou matériau de travail? | q21 / q21 | yes |
| French | suva-bagatellunfall | q22 | Welcher Körperteil der verletzten Person ist betroffen? | Quel membre du corps de la personne blessée est concerné? | Quel membre du corps de la personne blessée est affecté? | q22 / q22 | yes |
| French | suva-bagatellunfall | q23 | Ist die Verletzung links, rechts oder unbestimmt? | La blessure est-elle du côté gauche, du côté droit ou indéterminée? | La blessure est-elle du côté gauche, du côté droit ou indéterminée? | q23 / q23 | yes |
| French | suva-bagatellunfall | q24 | Wie ist die Art der Schädigung bei der Verletzung? | Quel est le type de dommage de la blessure? | Quel est le type de dommage de la blessure? | q24 / q24 | yes |
| French | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Qui est le médecin traitant ou l'hôpital/clinique? | Quel est le médecin traitant ou l'hôpital/clinique? | q26 / q26 | no |
| French | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Qui est le médecin de suivi ou l'hôpital/clinique? | Qui est le médecin traitant ou l'hôpital/clinique? | q25 / q25 | no |
| French | suva-bagatellunfall | q27 | Wo und wann ist der Abschluss passiert? | Où et quand l'accident a-t-il été clôturé? | Où et quand l'accident s'est-il produit? | q19 / q17 | no |
| Italian | betreibungsbegehren | q1 | Um welches Betreibungsamt handelt es sich? | Di quale Ufficio di esecuzione si tratta? | Di quale Ufficio di esecuzione si tratta? | q1 / q1 | yes |
| Italian | betreibungsbegehren | q2 | Wie heisst der Schuldner und wo wohnt er? | Come si chiama il debitore e dove risiede? | Come si chiama il debitore e dove risiede? | q2 / q2 | yes |
| Italian | betreibungsbegehren | q3 | Wann ist das Geburtsdatum des Schuldners? | Quando è il giorno di nascita del debitore? | Quando è il giorno di nascita del debitore? | q3 / q3 | yes |
| Italian | betreibungsbegehren | q4 | Wie heisst der Gläubiger und wo ist er ansässig? | Come si chiama il creditore e dove è domiciliato? | Come si chiama il creditore e dove è domiciliato? | q4 / q4 | yes |
| Italian | betreibungsbegehren | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | Quale collegamento di pagamento sceglie il creditore? | Quale collegamento di pagamento sceglie il creditore? | q5 / q5 | yes |
| Italian | betreibungsbegehren | q6 | Welche IBAN wird angegeben? | Quale IBAN viene indicato? | Quale IBAN viene indicato? | q6 / q6 | yes |
| Italian | betreibungsbegehren | q7 | Wer vertritt den Gläubiger? | Chi rappresenta il creditore? | Chi rappresenta il creditore? | q7 / q5 | no |
| Italian | betreibungsbegehren | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | Come si può contattare per domande telefoniche o per e-mail? | Come si può contattare per domande telefoniche o per e-mail? | q8 / q8 | yes |
| Italian | betreibungsbegehren | q9 | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | Qual è il motivo della richiesta o quale documento con data è presente? | Qual è il motivo della richiesta o quale documento con data è presente? | q9 / q9 | yes |
| Italian | betreibungsbegehren | q10 | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | Qual è l'importo della richiesta in franchi svizzeri? | Qual è l'importo della richiesta in franchi svizzeri? | q10 / q10 | yes |
| Italian | betreibungsbegehren | q11 | Welcher Zinssatz wird verlangt? | Qual è il tasso di interesse richiesto? | Qual è il tasso di interesse richiesto? | q11 / q11 | yes |
| Italian | betreibungsbegehren | q12 | Seit welchem Datum wird Zins verlangt? | Da quando viene richiesto l'interesse? | Da quando viene richiesto l'interesse? | q12 / q12 | yes |
| Italian | betreibungsbegehren | q13 | Gibt es Bemerkungen zum Abschluss? | Ci sono osservazioni sulla conclusione? | Ci sono osservazioni per la conclusione? | q13 / q13 | yes |
| Italian | betreibungsbegehren | q14 | Welche Fallreferenz ist vorhanden? | Qual è il riferimento del caso? | Qual è il riferimento del caso? | q14 / q14 | yes |
| Italian | suva-bagatellunfall | q1 | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | Come si chiama il datore di lavoro e dove si trova con il codice postale? | Come si chiama il datore di lavoro e dove si trova con il codice postale? | q1 / q1 | yes |
| Italian | suva-bagatellunfall | q2 | Welche Telefonnummer hat der Arbeitgeber? | Qual è il numero di telefono del datore di lavoro? | Qual è il numero di telefono del datore di lavoro? | q2 / q2 | yes |
| Italian | suva-bagatellunfall | q3 | Welche Kunden-Nummer hat der Arbeitgeber? | Qual è il numero di cliente del datore di lavoro? | Qual è il numero del cliente del datore di lavoro? | q3 / q3 | yes |
| Italian | suva-bagatellunfall | q4 | In welchem Bereich arbeitet die verletzte Person im Betrieb? | In quale settore lavora la persona infortunata nell'azienda? | In quale settore lavora la persona infortunata nell'azienda? | q4 / q4 | yes |
| Italian | suva-bagatellunfall | q5 | Wie heissen die verletzte Person? | Come si chiama la persona infortunata? | Come si chiama la persona infortunata? | q5 / q5 | yes |
| Italian | suva-bagatellunfall | q6 | Wann ist die verletzte Person geboren? | Quando è nata la persona infortunata? | Quando è nata la persona infortunata? | q6 / q6 | yes |
| Italian | suva-bagatellunfall | q7 | Welche AHV-Nummer hat die verletzte Person? | Qual è il numero AVS della persona infortunata? | Qual è il numero AVS della persona infortunata? | q7 / q7 | yes |
| Italian | suva-bagatellunfall | q8 | Welche Strasse hat die verletzte Person? | In quale via abita la persona infortunata? | In quale strada vive la persona infortunata? | q8 / q8 | yes |
| Italian | suva-bagatellunfall | q9 | Welche Staatsangehörigkeit hat die verletzte Person? | Qual è la nazionalità della persona infortunata? | Qual è la cittadinanza della persona infortunata? | q9 / q9 | yes |
| Italian | suva-bagatellunfall | q10 | Welcher Zivilstand ist bei der verletzten Person? | Qual è lo stato civile della persona infortunata? | Qual è lo stato civile della persona infortunata? | q10 / q10 | yes |
| Italian | suva-bagatellunfall | q11 | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | Quando ha iniziato a lavorare presso questo datore di lavoro la persona infortunata? | Quando ha iniziato a lavorare presso questo datore di lavoro la persona infortunata? | q11 / q11 | yes |
| Italian | suva-bagatellunfall | q12 | Welchen Beruf übt die verletzte Person aus? | Qual è la professione della persona infortunata? | Qual è la professione della persona infortunata? | q12 / q12 | yes |
| Italian | suva-bagatellunfall | q13 | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | La persona infortunata è dirigente superiore, dirigente medio, impiegato/a, operaio/a, apprendista o praticante? | La persona ferita è un membro del personale dirigenziale superiore, del personale dirigenziale medio, un impiegato/a, un lavoratore/a, un apprendista o uno stagista? | q13 / q13 | yes |
| Italian | suva-bagatellunfall | q14 | Wie viele Stunden arbeitet die verletzte Person pro Woche? | Quante ore lavora la persona infortunata a settimana? | Quante ore lavora la persona ferita a settimana? | none / q14 | no |
| Italian | suva-bagatellunfall | q16 | Welcher Monat war es, als der Unfall passierte? | In quale mese è avvenuto l'incidente? | In quale mese è avvenuto l'incidente? | q17 / q16 | no |
| Italian | suva-bagatellunfall | q17 | Welches Jahr war es, als der Unfall passierte? | In quale anno è avvenuto l'incidente? | In che anno è avvenuto l'incidente? | q17 / q17 | yes |
| Italian | suva-bagatellunfall | q18 | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | A che ora è avvenuto l'incidente, in ore e minuti? | A che ora è avvenuto l'incidente, in ore e minuti? | q18 / q18 | yes |
| Italian | suva-bagatellunfall | q19 | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Dove è avvenuto esattamente l'incidente, ad esempio luogo e via o codice postale? | Dove è avvenuto esattamente l'incidente, ad esempio luogo e strada o codice postale? | q19 / q19 | yes |
| Italian | suva-bagatellunfall | q20 | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | Cosa stava facendo esattamente la persona infortunata al momento dell'incidente, come si è verificato l'incidente, chi era presente e cosa era coinvolto? | Cosa stava facendo esattamente la persona ferita al momento dell'incidente, come si è verificato l'incidente, chi era presente e cosa era coinvolto? | q20 / q20 | yes |
| Italian | suva-bagatellunfall | q21 | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Quali oggetti erano coinvolti nell'incidente, come macchina, attrezzo, veicolo o materiale di lavoro? | Quali oggetti erano coinvolti nell'incidente, come macchina, attrezzo, veicolo o materiale di lavoro? | q21 / q21 | yes |
| Italian | suva-bagatellunfall | q22 | Welcher Körperteil der verletzten Person ist betroffen? | Quale parte del corpo della persona infortunata è interessata? | Quale parte del corpo della persona ferita è interessata? | q22 / none | no |
| Italian | suva-bagatellunfall | q23 | Ist die Verletzung links, rechts oder unbestimmt? | La lesione è a sinistra, a destra o indeterminata? | La lesione è a sinistra, a destra o indeterminata? | q23 / q23 | yes |
| Italian | suva-bagatellunfall | q24 | Wie ist die Art der Schädigung bei der Verletzung? | Qual è la natura del danno alla lesione? | Qual è la natura del danno alla lesione? | q24 / q24 | yes |
| Italian | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Chi è il medico curante o l'ospedale/clinica? | Chi è il medico che ha trattato per primo o l'ospedale/clinica? | q26 / q26 | no |
| Italian | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Chi è il medico di seguito o l'ospedale/clinica? | Chi è il medico curante o l'ospedale/clinica? | q25 / q25 | no |
| Italian | suva-bagatellunfall | q27 | Wo und wann ist der Abschluss passiert? | Dove e quando è avvenuta la chiusura? | Dove e quando è avvenuta la conclusione? | q27 / q27 | yes |
| English | betreibungsbegehren | q1 | Um welches Betreibungsamt handelt es sich? | Which enforcement office is involved? | Which enforcement office is involved? | q1 / q1 | yes |
| English | betreibungsbegehren | q2 | Wie heisst der Schuldner und wo wohnt er? | What is the debtor's name and where does he live? | What is the debtor's name and where does he live? | q2 / q2 | yes |
| English | betreibungsbegehren | q3 | Wann ist das Geburtsdatum des Schuldners? | What is the debtor's date of birth? | What is the debtor's date of birth? | q3 / q3 | yes |
| English | betreibungsbegehren | q4 | Wie heisst der Gläubiger und wo ist er ansässig? | What is the creditor's name and where is he based? | What is the creditor's name and where is he based? | q4 / q4 | yes |
| English | betreibungsbegehren | q5 | Welche Zahlungsverbindung wählt der Gläubiger? | Which payment method does the creditor choose? | Which payment method does the creditor choose? | q5 / q5 | yes |
| English | betreibungsbegehren | q6 | Welche IBAN wird angegeben? | Which IBAN is provided? | Which IBAN is provided? | q6 / q6 | yes |
| English | betreibungsbegehren | q7 | Wer vertritt den Gläubiger? | Who represents the creditor? | Who represents the creditor? | q7 / q7 | yes |
| English | betreibungsbegehren | q8 | Wie kann man bei Rückfragen telefonisch oder per E-Mail erreichen? | How can one reach the creditor for follow-up questions by phone or email? | How can one reach the creditor for follow-up questions by phone or email? | q8 / q5 | no |
| English | betreibungsbegehren | q9 | Welchen Forderungsgrund oder welche Urkunde mit Datum liegt vor? | What is the claim basis or document with date? | What is the claim basis or document with a date? | q9 / q9 | yes |
| English | betreibungsbegehren | q10 | Wie hoch ist der Betrag der Forderung in Schweizer Franken? | What is the amount of the claim in Swiss francs? | What is the amount of the claim in Swiss francs? | q10 / q10 | yes |
| English | betreibungsbegehren | q11 | Welcher Zinssatz wird verlangt? | What interest rate is being demanded? | What interest rate is being demanded? | q11 / q11 | yes |
| English | betreibungsbegehren | q12 | Seit welchem Datum wird Zins verlangt? | From which date is interest being demanded? | From which date is interest being demanded? | q12 / q12 | yes |
| English | betreibungsbegehren | q13 | Gibt es Bemerkungen zum Abschluss? | Are there any comments on the conclusion? | Are there any comments for closing? | q13 / q13 | yes |
| English | betreibungsbegehren | q14 | Welche Fallreferenz ist vorhanden? | What is the case reference? | What case reference is available? | q14 / q14 | yes |
| English | suva-bagatellunfall | q1 | Wie heisst der Arbeitgeber und wo befindet er sich mit Postleitzahl? | What is the employer's name and where is it located with the postal code? | (no line) | – | – |
| English | suva-bagatellunfall | q2 | Welche Telefonnummer hat der Arbeitgeber? | What is the employer's phone number? | (no line) | – | – |
| English | suva-bagatellunfall | q3 | Welche Kunden-Nummer hat der Arbeitgeber? | What is the employer's customer number? | (no line) | – | – |
| English | suva-bagatellunfall | q4 | In welchem Bereich arbeitet die verletzte Person im Betrieb? | In which area does the injured person work in the company? | (no line) | – | – |
| English | suva-bagatellunfall | q5 | Wie heissen die verletzte Person? | What is the injured person's name? | (no line) | – | – |
| English | suva-bagatellunfall | q6 | Wann ist die verletzte Person geboren? | When was the injured person born? | (no line) | – | – |
| English | suva-bagatellunfall | q7 | Welche AHV-Nummer hat die verletzte Person? | What is the injured person's AHV number? | (no line) | – | – |
| English | suva-bagatellunfall | q8 | Welche Strasse hat die verletzte Person? | What street does the injured person live on? | (no line) | – | – |
| English | suva-bagatellunfall | q9 | Welche Staatsangehörigkeit hat die verletzte Person? | What nationality does the injured person have? | (no line) | – | – |
| English | suva-bagatellunfall | q10 | Welcher Zivilstand ist bei der verletzten Person? | What is the injured person's marital status? | (no line) | – | – |
| English | suva-bagatellunfall | q11 | Wann hat die verletzte Person angefangen bei diesem Arbeitgeber zu arbeiten? | When did the injured person start working for this employer? | (no line) | – | – |
| English | suva-bagatellunfall | q12 | Welchen Beruf übt die verletzte Person aus? | What profession does the injured person practice? | (no line) | – | – |
| English | suva-bagatellunfall | q13 | Ist die verletzte Person höheres Kader, mittleres Kader, Angestellte/r, Arbeiter/in, Lehrling oder Praktikant/in? | Is the injured person upper management, middle management, employee, worker, apprentice, or intern? | Is the injured person upper management, middle management, employee, worker, apprentice, or intern? | q13 / q13 | yes |
| English | suva-bagatellunfall | q14 | Wie viele Stunden arbeitet die verletzte Person pro Woche? | How many hours does the injured person work per week? | How many hours does the injured person work per week? | q14 / q14 | yes |
| English | suva-bagatellunfall | q16 | Welcher Monat war es, als der Unfall passierte? | Which month was it when the accident happened? | Which month was it when the accident happened? | q16 / q16 | yes |
| English | suva-bagatellunfall | q17 | Welches Jahr war es, als der Unfall passierte? | Which year was it when the accident happened? | Which year was it when the accident happened? | q17 / q17 | yes |
| English | suva-bagatellunfall | q18 | Zu welcher Zeit passierte der Unfall in Stunden und Minuten? | At what time did the accident happen in hours and minutes? | At what time did the accident happen, in hours and minutes? | q18 / q18 | yes |
| English | suva-bagatellunfall | q19 | Wo genau ist der Unfall passiert, zum Beispiel Ort und Strasse oder Postleitzahl? | Where exactly did the accident happen, for example location and street or postal code? | Where exactly did the accident happen, for example, location and street or postal code? | q19 / q19 | yes |
| English | suva-bagatellunfall | q20 | Was hat die verletzte Person genau zur Zeit des Unfalls gemacht, wie der Unfall verlaufen ist, wer war dabei und was war beteiligt? | What was the injured person doing exactly at the time of the accident, how the accident occurred, who was involved, and what was involved? | What was the injured person doing exactly at the time of the accident, how the accident occurred, who was involved, and what was involved? | q20 / q20 | yes |
| English | suva-bagatellunfall | q21 | Welche Gegenstände waren am Unfall beteiligt, wie Maschine, Werkzeug, Fahrzeug oder Arbeitsstoff? | Which objects were involved in the accident, such as machine, tool, vehicle, or work material? | What objects were involved in the accident, such as machine, tool, vehicle, or work material? | q21 / q21 | yes |
| English | suva-bagatellunfall | q22 | Welcher Körperteil der verletzten Person ist betroffen? | Which body part of the injured person is affected? | Which body part of the injured person is affected? | q22 / q22 | yes |
| English | suva-bagatellunfall | q23 | Ist die Verletzung links, rechts oder unbestimmt? | Is the injury on the left, right, or undetermined? | Is the injury on the left, right, or undetermined? | q23 / q23 | yes |
| English | suva-bagatellunfall | q24 | Wie ist die Art der Schädigung bei der Verletzung? | What is the nature of the injury? | What is the nature of the injury? | q24 / q24 | yes |
| English | suva-bagatellunfall | q25 | Wer ist der Erstbehandelnde Arzt oder das Spital/Klinik? | Who is the treating physician or the hospital/clinic? | Who is the treating doctor or the hospital/clinic? | none / q26 | no |
| English | suva-bagatellunfall | q26 | Wer ist der Nachbehandelnde Arzt oder das Spital/Klinik? | Who is the follow-up physician or the hospital/clinic? | Who is the attending doctor or the hospital/clinic? | q25 / q25 | no |
| English | suva-bagatellunfall | q27 | Wo und wann ist der Abschluss passiert? | Where and when did the discharge happen? | Where and when did the discharge occur? | q27 / q27 | yes |
