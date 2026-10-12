# Result: who fills in which place, as the small model names it

Run of 9 October 2026 with swiss-ai/Apertus-v1.5-8B at temperature 0, one call per form on the four forms, 4 calls,
all answered with status 200. Counted again from the answers in `calls/`.

| form | units | units with a line | valid JSON | parties the model lists | what it names for the units |
|---|---|---|---|---|---|
| arbeitsfaehigkeitszeugnis | 36 | 36 | yes | Arbeitnehmerin / Arbeitnehmer · Arbeitgeberin / Arbeitgeber · Ärztin / Arzt | Arbeitnehmerin / Arbeitgeber 11 · Ärztin / Arzt 11 · Arbeitgeberin / Arbeitgeber 9 · Arbeitnehmerin / Arbeitnehmer 3 · unklar 2 |
| betreibungsbegehren | 17 | 17 | yes | Schuldner · Gläubiger · Vertreter des Gläubigers | Schuldner 6 · Gläubiger 6 · Amt 3 · Gläubiger des Vertreters 1 · unklar 1 |
| schadenmeldung-uvg | 96 | 96 | yes | Arbeitgeber · Verletzter | Arbeitgeber 75 · Verletzter 19 · unklar 2 |
| suva-bagatellunfall | 110 | 110 | no | – | Verletzte/r 38 · unklar 36 · Arbeitgeber 26 · Arzt bzw. Spital/Klinik 6 · Apotheker 4 |

The answer for the Suva form is not valid JSON; its lines are read one by one, and its list of parties is lost with
that.

## The certificate against the sections of its definition

Reference, set before the run: the rebuilt certificate prints over its sections who fills them in ("Von der
Arbeitgeberin / dem Arbeitgeber auszufüllen (evtl. von der Patientin / dem Patienten)", "Von der Ärztin / dem Arzt
auszufüllen"); the section of a unit is that of its form fields in `tools/forms/arbeitsfaehigkeitszeugnis.js`. A unit
of the employer's section counts as right when the answer names the employer, the employee or the patient and not the
doctor; a unit of the doctor's section when it names the doctor and neither of the others. Units of the last section
(remarks and signature) and units without a form field have no reference.

Employer's section: **18 of 20** units right. Doctor's section: **10 of 11**.

| unit | printed label | section | the model names | right |
|---|---|---|---|---|
| q1 | w · m | employer | Arbeitnehmerin / Arbeitnehmer | yes |
| q2 | Name / Vorname | employer | Arbeitnehmerin / Arbeitnehmer | yes |
| q3 | Geb.-Dat. | employer | Arbeitnehmerin / Arbeitnehmer | yes |
| q4 | Adresse / PLZ | employer | Arbeitgeberin / Arbeitgeber | yes |
| q5 | AHV-Nr. | employer | Arbeitgeberin / Arbeitgeber | yes |
| q6 | Telefon | employer | Arbeitgeberin / Arbeitgeber | yes |
| q7 | E-Mail | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q8 | Firmenname | employer | Arbeitgeberin / Arbeitgeber | yes |
| q9 | Kontaktperson | employer | Arbeitgeberin / Arbeitgeber | yes |
| q10 | Adresse / PLZ | employer | Arbeitgeberin / Arbeitgeber | yes |
| q11 | Telefon | employer | Arbeitgeberin / Arbeitgeber | yes |
| q12 | E-Mail | employer | Arbeitgeberin / Arbeitgeber | yes |
| q14 | Funktion / ausgeübter Beruf * | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q15 | – | employer | unklar | **no** |
| q16 | Std. / Tag | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q17 | Arbeitszeit Vollzeit (100 %) | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q18 | Teilzeit | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q19 | – | employer | unklar | **no** |
| q20 | Wochenarbeitszeit / Einsatztage | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q21 | Bei Kündigung: Arbeitsverhältnis gekündigt per | employer | Arbeitnehmerin / Arbeitgeber | yes |
| q22 | Krankheit · Unfall | doctor | Ärztin / Arzt | yes |
| q23 | REP · Arbeitsplatzbeschrieb | doctor | Ärztin / Arzt | yes |
| q24 | REP vom | doctor | Ärztin / Arzt | yes |
| q25 | Arbeitsplatzbeschrieb vom | doctor | Ärztin / Arzt | yes |
| q26 | Konsultationsdatum · von | doctor | Ärztin / Arzt | yes |
| q27 | ja · nein | doctor | Ärztin / Arzt | yes |
| q28 | Basierend auf * REP | doctor | Ärztin / Arzt | yes |
| q29 | REP vom | doctor | Ärztin / Arzt | yes |
| q30 | Arbeitsplatzbeschrieb vom | doctor | Ärztin / Arzt | yes |
| q31 | Präsenzzeit Std. pro Tag · Präsenzzeit % Pensum | doctor | Ärztin / Arzt | yes |
| q32 | Wiederaufnahme der Arbeit zu 100 % ab | doctor | Arbeitnehmerin / Arbeitgeber | **no** |

## The Betreibungsbegehren against the form fields of its PDF

Reference, set before the run: a place the PDF has no form field for is not filled in by the person who applies; the
form prints "Durch das Amt auszufüllen" there. A unit counts as named for the office when the answer holds "Amt" or
"Behörde".

Units without a form field named for the office: **3 of 5**. Units with a form field not named for the office: **12 of
12**.

| unit | printed label | form field in the PDF | the model names |
|---|---|---|---|
| q1 | Bitte in Blockschrift ausfüllen und Hinweise auf d | no | Schuldner |
| q2 | Durch das Amt auszufüllen | no | Amt |
| q3 | Eingang | no | Amt |
| q4 | Betreibung Nr. | no | Amt |
| q5 | des Gläubigers des Vertreters | yes | Gläubiger des Vertreters |
| q6 | IBAN | yes | Gläubiger |
| q7 | Forderungsgrund oder Forderungsurkunde mit Datum | yes | Gläubiger |
| q8 | Weitere Forderungen | yes | Gläubiger |
| q9 | Schuldner (Name und Vorname bzw. Firma; Adresse; P | yes | Schuldner |
| q10 | Adresse des Betreibungsamtes | yes | Schuldner |
| q11 | Geburtsdatum (falls bekannt) | yes | Schuldner |
| q12 | Gläubiger (Name und Vorname bzw. Firma; Adresse; P | yes | Gläubiger |
| q13 | vertreten durch (Name und Vorname bzw. Firma; Adre | yes | Gläubiger |
| q14 | Telefon oder E-Mail | yes | Gläubiger |
| q15 | Bemerkungen | yes | Schuldner |
| q16 | Ihre Fallreferenz (falls vorhanden) | yes | Schuldner |
| q17 | Die Angaben des vorliegenden Merkblatts stützen si | no | unklar |

The form is filled in by the creditor. Among the 12 units with a form field the model names: Gläubiger des Vertreters
1, Gläubiger 6, Schuldner 5.

## The accident report and the Suva form

No reference per unit. Shown are the units at whose label the form itself prints something about who fills in (first
twelve per form).

### schadenmeldung-uvg

| unit | printed label | the model names |
|---|---|---|
| q3 | Schaden-Nummer | Arbeitgeber |
| q72 | 11 Arztadressen | Arbeitgeber |
| q73 | Erstbehandelnder Arzt bzw. Spital/Klinik | Arbeitgeber |
| q74 | Nachbehandelnder Arzt bzw. Spital/Klinik | Arbeitgeber |

### suva-bagatellunfall

| unit | printed label | the model names |
|---|---|---|
| q2 | Schaden-Nummer | Arbeitgeber |
| q31 | Nachbehandelnder Arzt bzw. Spital/Klinik | Arzt bzw. Spital/Klinik |
| q32 | 10. Arzt- adressen | Arzt bzw. Spital/Klinik |
| q35 | Schaden-Nummer | Arbeitgeber |
| q77 | Nachbehandelnder Arzt bzw. Spital/Klinik | Arzt bzw. Spital/Klinik |
| q78 | 10. Arzt- adressen | Arzt bzw. Spital/Klinik |
| q80 | Schaden-Nummer | Arbeitgeber |
| q96 | Nachbehandelnder Arzt bzw. Spital/Klinik | Arzt bzw. Spital/Klinik |
| q97 | Arzt- adressen | Arzt bzw. Spital/Klinik |
| q98 | Rechnung der Apotheke | Apotheker |
| q99 | Art und Menge | Apotheker |
| q100 | Datum der Abgabe · Art und Menge · CHF | Apotheker |
