// An accident report to the accident insurer under the UVG, rebuilt after the Helsana form: the same fields,
// our own layout. Numbered sections on tinted bars, every field a box with its label in the top band.

export const form = {
    id: 'schadenmeldung-uvg',
    title: 'Schadenmeldung UVG',
    subtitle: 'Meldung eines Unfalls, einer Berufskrankheit, eines Zahnschadens oder eines Rückfalls durch den Arbeitgeber',
    note: 'Nachgebaut nach dem Vorbild der Schadenmeldung UVG der Helsana Unfall AG (Ausgabe 12.2016) mit denselben Feldern in eigener Gestaltung – nicht das Original. Testmaterial des Projekts Trace.',
    footer: 'Nachgebaut nach dem Vorbild der Helsana-Schadenmeldung UVG – nicht das Original',
    language: 'de',
    style: 'boxes',
    sections: [
        {
            rows: [
                { cells: [
                    { label: 'Art der Meldung', kind: 'check', name: 'Meldung', options: [ 'Unfall', 'Berufskrankheit', 'Zahnschaden', 'Rückfall' ], w: 8 },
                    { label: 'Schaden-Nummer', name: 'Schaden-Nummer', w: 4 },
                ] },
            ],
        },
        {
            n: 1,
            title: 'Arbeitgeber',
            rows: [
                { lines: 2, cells: [
                    { label: 'Name und Adresse mit Postleitzahl', name: 'Arbeitgeber', w: 12 },
                ] },
                { cells: [
                    { label: 'Tel.-Nr.', name: 'Telefon Arbeitgeber', w: 4 },
                    { label: 'E-Mail', name: 'E-Mail Arbeitgeber', w: 4 },
                    { label: 'Police-Nr. UVG', name: 'Police UVG', w: 4 },
                ] },
                { cells: [
                    { label: 'Police-Nr. UVG-Zusatz', name: 'Police UVG-Zusatz', w: 4 },
                    { label: 'Üblicher Arbeitsplatz des/der Verletzten (Betriebszweig)', name: 'Arbeitsplatz Betriebszweig', w: 8 },
                ] },
            ],
        },
        {
            n: 2,
            title: 'Verletzte / Verletzter',
            rows: [
                { cells: [
                    { label: 'Name und Vorname', name: 'Name Vorname', w: 6 },
                    { label: 'Geburtsdatum', name: 'Geburtsdatum', w: 3 },
                    { label: 'AHV-Nummer', name: 'AHV-Nummer', w: 3 },
                ] },
                { cells: [
                    { label: 'Strasse', name: 'Strasse', w: 6 },
                    { label: 'Tel.-Nr.', name: 'Telefon Verletzte', w: 3 },
                    { label: 'Zivilstand', name: 'Zivilstand', w: 3 },
                ] },
                { cells: [
                    { label: 'Land', name: 'Land', w: 2 },
                    { label: 'PLZ', name: 'PLZ', w: 2 },
                    { label: 'Wohnort', name: 'Wohnort', w: 4 },
                    { label: 'Staatsangehörigkeit / Bewilligung', name: 'Staatsangehörigkeit Bewilligung', w: 4 },
                ] },
                { cells: [
                    { label: 'E-Mail', name: 'E-Mail Verletzte', w: 6 },
                ] },
            ],
        },
        {
            n: 3,
            title: 'Anstellung',
            rows: [
                { cells: [
                    { label: 'Datum der Anstellung', name: 'Datum der Anstellung', w: 4 },
                    { label: 'Ausgeübter Beruf', name: 'Beruf', w: 8 },
                ] },
                { cells: [
                    { label: 'Stellung', kind: 'check', name: 'Stellung', options: [ 'Höheres Kader', 'Mittleres Kader', 'Angestellte/r / Mitarbeiter/in', 'Lehrling', 'Praktikant/in' ], w: 12 },
                ] },
                { cells: [
                    { label: 'Verhältnis', kind: 'check', name: 'Verhältnis', options: [ 'unbefristeter Arbeitsvertrag', 'befristeter Arbeitsvertrag', 'Arbeitsverhältnis gekündigt per' ], after: { name: 'Gekündigt per', width: 70 }, w: 12 },
                ] },
                { cells: [
                    { label: 'Arbeitszeit des/der Verletzten (Std./Woche)', name: 'Arbeitszeit Std', w: 4 },
                    { label: 'Betriebsübliche Vollarbeitszeit (Std./Woche)', name: 'Vollarbeitszeit Std', w: 4 },
                    { label: 'Vertraglicher Beschäftigungsgrad (Prozent)', name: 'Beschäftigungsgrad Prozent', w: 4 },
                ] },
                { cells: [
                    { label: 'Arbeitseinsatz', kind: 'check', name: 'Arbeitseinsatz', options: [ 'unregelmässig', 'Kurzarbeit', 'Zwischenverdienst' ], w: 12 },
                ] },
            ],
        },
        {
            n: 4,
            title: 'Schadendatum',
            rows: [
                { cells: [
                    { label: 'Tag', name: 'Schadendatum Tag', w: 2 },
                    { label: 'Monat', name: 'Schadendatum Monat', w: 3 },
                    { label: 'Jahr', name: 'Schadendatum Jahr', w: 2 },
                    { label: 'Zeit (Stunden, Minuten)', name: 'Schadendatum Zeit', w: 5 },
                ] },
            ],
        },
        {
            n: 5,
            title: 'Unfallort',
            rows: [
                { cells: [
                    { label: 'Ort (Name oder PLZ) und Stelle (z. B. Werkstatt, Strasse)', name: 'Unfallort', w: 12 },
                ] },
            ],
        },
        {
            n: 6,
            title: 'Sachverhalt (Unfallbeschreibung, Verdacht auf Berufskrankheit)',
            rows: [
                { lines: 4, cells: [
                    { label: 'Tätigkeit zur Zeit des Unfalles; Unfallhergang, beteiligte Gegenstände, Fahrzeuge', name: 'Unfallbeschreibung', w: 12 },
                ] },
                { cells: [
                    { label: 'Beteiligte Person(en)', name: 'Beteiligte Personen', w: 12 },
                ] },
                { cells: [
                    { label: 'Besteht ein Polizeirapport?', kind: 'radio', name: 'Polizeirapport', options: [ 'Ja', 'Nein', 'Unbekannt' ], w: 6 },
                    { label: 'Wenn ja, aufgenommen durch', name: 'Polizeirapport aufgenommen durch', w: 6 },
                ] },
                { cells: [
                    { label: 'Besteht ein Unfallprotokoll? Wenn ja, bitte Kopie beilegen.', kind: 'radio', name: 'Unfallprotokoll', options: [ 'Ja', 'Nein' ], w: 12 },
                ] },
            ],
        },
        {
            n: 7,
            title: 'Berufsunfall',
            rows: [
                { cells: [
                    { label: 'Beteiligte Gegenstände (z. B. Maschine, Werkzeug, Fahrzeug, Arbeitsstoff; bitte genaue Bezeichnung)', name: 'Beteiligte Gegenstände', w: 12 },
                ] },
            ],
        },
        {
            n: 8,
            title: 'Nichtberufsunfall',
            rows: [
                { cells: [
                    { label: 'Letztmals im Betrieb gearbeitet bis (Wochentag, Datum, Zeit)', name: 'Letzter Arbeitstag', w: 6 },
                    { label: 'Grund der Absenz', name: 'Grund Absenz', w: 6 },
                ] },
            ],
        },
        {
            n: 9,
            title: 'Verletzung',
            rows: [
                { cells: [
                    { label: 'Betroffener Körperteil', name: 'Betroffener Körperteil', w: 6 },
                    { label: 'Seite', kind: 'radio', name: 'Seite', options: [ 'links', 'rechts', 'unbestimmt' ], w: 6 },
                ] },
                { cells: [
                    { label: 'Art der Schädigung', name: 'Art der Schädigung', w: 12 },
                ] },
            ],
        },
        {
            n: 10,
            title: 'Arbeitsunfähigkeit',
            rows: [
                { cells: [
                    { label: 'Arbeit zufolge Unfalles ausgesetzt?', kind: 'radio', name: 'Arbeit ausgesetzt', options: [ 'Ja', 'Nein' ], w: 5 },
                    { label: 'Wenn ja, ab wann?', name: 'Arbeitsunfähig ab', w: 7 },
                ] },
                { cells: [
                    { label: 'Voraussichtliche Dauer', kind: 'check', name: 'Dauer', options: [ 'länger als 1 Monat' ], w: 4 },
                    { label: 'Falls Arbeit wieder aufgenommen: ab wann?', name: 'Arbeit wieder aufgenommen ab', w: 4 },
                    { label: 'Wiederaufnahme', kind: 'radio', name: 'Wiederaufnahme', options: [ 'ganz', 'teilweise' ], w: 4 },
                ] },
            ],
        },
        {
            n: 11,
            title: 'Arztadressen',
            rows: [
                { cells: [
                    { label: 'Erstbehandelnder Arzt bzw. Spital/Klinik', name: 'Erstbehandelnder Arzt', w: 6 },
                    { label: 'Nachbehandelnder Arzt bzw. Spital/Klinik', name: 'Nachbehandelnder Arzt', w: 6 },
                ] },
                { cells: [
                    { label: 'Erstbehandlung, falls Spital/Klinik', kind: 'radio', name: 'Erstbehandlung', options: [ 'ambulant', 'stationär' ], w: 6 },
                    { label: 'Nachbehandlung, falls Spital/Klinik', kind: 'radio', name: 'Nachbehandlung', options: [ 'ambulant', 'stationär' ], w: 6 },
                ] },
            ],
        },
        {
            n: 12,
            title: 'Lohn',
            rows: [
                { table: {
                    name: 'Lohn',
                    columns: [
                        { label: 'Lohnbestandteil', labels: true, w: 6 },
                        { label: 'CHF pro Stunde', name: 'Stunde', w: 2 },
                        { label: 'CHF pro Monat', name: 'Monat', w: 2 },
                        { label: 'CHF pro Jahr', name: 'Jahr', w: 2 },
                    ],
                    rows: [
                        { label: 'Vertraglicher Grundlohn inkl. Teuerungszulage (brutto)', name: 'Grundlohn' },
                        { label: 'Kinder-/Familienzulagen', name: 'Familienzulagen' },
                        { label: 'Ferien-/Feiertagsentschädigung', name: 'Ferienentschädigung' },
                        { label: 'Gratifikation / 13. Monatslohn (und weitere)', name: 'Gratifikation' },
                        { label: 'Andere Lohnzulagen (Akkord, Provision, Naturallohn, Schichtzulage)', name: 'Andere Zulagen' },
                    ],
                } },
                { cells: [
                    { label: 'Anzahl Kinder (bis 18 J., in Ausbildung bis 25 J.)', name: 'Anzahl Kinder', w: 4 },
                    { label: 'Bezeichnung der anderen Lohnzulagen', name: 'Bezeichnung Zulagen', w: 8 },
                ] },
            ],
        },
        {
            n: 13,
            title: 'Sonderfälle',
            rows: [
                { cells: [
                    { label: 'Weitere(r) Arbeitgeber', kind: 'radio', name: 'Weiterer Arbeitgeber', options: [ 'Nein', 'Ja' ], w: 3 },
                    { label: 'Wenn ja, Name und Adresse', name: 'Weiterer Arbeitgeber Adresse', w: 6 },
                    { label: 'Steuern', kind: 'check', name: 'Steuern', options: [ 'Quellensteuerpflicht' ], w: 3 },
                ] },
                { cells: [
                    { label: 'Besondere Versicherungsverhältnisse', kind: 'check', name: 'Versicherung', options: [ 'Freiwillige Versicherung (Arbeitgeber / Selbständigerwerbende)', 'Familienmitglied / Gesellschafter', 'Entsandte/r' ], w: 12 },
                ] },
            ],
        },
        {
            n: 14,
            title: 'Andere Sozialversicherungsleistungen',
            rows: [
                { cells: [
                    { label: 'Anspruch auf Taggeld oder Rente bei einer anderen Sozialversicherung?', kind: 'radio', name: 'Andere Leistungen', options: [ 'Nein', 'Ja' ], w: 6 },
                    { label: 'Wenn ja, wo?', name: 'Andere Leistungen wo', w: 6 },
                ] },
                { cells: [
                    { label: 'Name der obligatorischen Krankenversicherung (inkl. Police-Nr.)', name: 'Krankenversicherung', w: 12 },
                ] },
            ],
        },
        {
            title: 'Unterschriften',
            rows: [
                { lines: 2, cells: [
                    { label: 'Ort und Datum', name: 'Ort und Datum', w: 4 },
                    { label: 'Unterschrift des/der Verletzten', name: 'Unterschrift Verletzte', w: 4 },
                    { label: 'Stempel und Unterschrift des Arbeitgebers', name: 'Unterschrift Arbeitgeber', w: 4 },
                ] },
            ],
        },
    ],
};
