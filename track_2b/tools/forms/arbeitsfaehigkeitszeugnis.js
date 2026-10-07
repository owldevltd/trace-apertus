// A certificate of (partial) fitness for work, rebuilt after the SIM certificate: the same fields, our own
// layout. Labels and writing lines, the tables as grids. Names are the widget names the app fills.

export const form = {
    id: 'arbeitsfaehigkeitszeugnis',
    title: 'Arbeitsfähigkeitszeugnis',
    subtitle: 'Beurteilung der Arbeitsfähigkeit und der Reintegration bei Krankheit oder Unfall',
    note: 'Nachgebaut nach dem Vorbild des SIM-Arbeitsfähigkeitszeugnisses (Swiss Insurance Medicine, Ausgabe Januar 2019) mit denselben Feldern in eigener Gestaltung – nicht das Original. Testmaterial des Projekts Trace.',
    footer: 'Nachgebaut nach dem Vorbild des SIM-Arbeitsfähigkeitszeugnisses – nicht das Original',
    language: 'de',
    style: 'lines',
    sections: [
        {
            title: 'Von der Arbeitgeberin / dem Arbeitgeber auszufüllen (evtl. von der Patientin / dem Patienten)',
            rows: [
                { heading: 'Arbeitnehmerin / Arbeitnehmer' },
                { cells: [
                    { label: 'Name / Vorname', name: 'Name Vorname', w: 6 },
                    { label: 'Geb.-Dat.', name: 'Geburtsdatum', w: 3 },
                    { label: 'Geschlecht', kind: 'radio', name: 'Geschlecht', options: [ 'w', 'm' ], w: 3 },
                ] },
                { cells: [
                    { label: 'Adresse / PLZ', name: 'Adresse Arbeitnehmer', w: 6 },
                    { label: 'AHV-Nr.', name: 'AHV-Nummer', w: 3 },
                    { label: 'Telefon', name: 'Telefon Arbeitnehmer', w: 3 },
                ] },
                { cells: [
                    { label: 'E-Mail', name: 'E-Mail Arbeitnehmer', w: 6 },
                ] },
                { heading: 'Arbeitgeberin / Arbeitgeber' },
                { cells: [
                    { label: 'Firmenname', name: 'Firmenname', w: 6 },
                    { label: 'Kontaktperson', name: 'Kontaktperson', w: 6 },
                ] },
                { cells: [
                    { label: 'Adresse / PLZ', name: 'Adresse Arbeitgeber', w: 6 },
                    { label: 'Telefon', name: 'Telefon Arbeitgeber', w: 3 },
                    { label: 'E-Mail', name: 'E-Mail Arbeitgeber', w: 3 },
                ] },
                { heading: 'Anstellung' },
                { cells: [
                    { label: 'Funktion / ausgeübter Beruf *', name: 'Funktion Beruf', w: 6 },
                    { label: 'Eintrittsjahr', name: 'Eintrittsjahr', w: 3 },
                    { label: 'Std. / Tag', name: 'Stunden pro Tag', w: 3 },
                ] },
                { cells: [
                    { label: 'Arbeitszeit', kind: 'radio', name: 'Arbeitszeit', options: [ 'Vollzeit (100 %)', 'Teilzeit' ], after: { name: 'Teilzeit Prozent', width: 40, unit: '%' }, w: 6 },
                    { label: 'Wochenarbeitszeit / Einsatztage', name: 'Wochenarbeitszeit Einsatztage', w: 6 },
                ] },
                { cells: [
                    { label: 'Bei Kündigung: Arbeitsverhältnis gekündigt per', name: 'Gekündigt per', w: 6 },
                ] },
            ],
        },
        {
            title: 'Von der Ärztin / dem Arzt auszufüllen',
            rows: [
                { cells: [
                    { label: 'Ursache', kind: 'radio', name: 'Ursache', options: [ 'Krankheit', 'Unfall', 'Berufskrankheit' ], w: 12 },
                ] },
                { heading: 'Volle Arbeitsunfähigkeit' },
                { cells: [
                    { label: 'Basierend auf *', kind: 'radio', name: 'Grundlage volle Arbeitsunfähigkeit', options: [ 'REP', 'Arbeitsplatzbeschrieb' ], w: 6 },
                    { label: 'REP vom', name: 'REP vom (volle AU)', w: 3 },
                    { label: 'Arbeitsplatzbeschrieb vom', name: 'Arbeitsplatzbeschrieb vom (volle AU)', w: 3 },
                ] },
                { table: {
                    name: 'Volle AU',
                    columns: [
                        { label: 'Konsultationsdatum', name: 'Konsultation', w: 3 },
                        { label: 'Arbeitsunfähigkeit', value: '100 %', w: 2 },
                        { label: 'von', w: 2 },
                        { label: 'bis', w: 2 },
                        { label: 'nächste Konsultation', name: 'Nächste Konsultation', w: 2 },
                        { label: 'Visum', w: 1 },
                    ],
                    rows: 3,
                } },
                { cells: [
                    { label: 'Es liegt eine arbeitsplatzbezogene Arbeitsunfähigkeit vor', kind: 'radio', name: 'Arbeitsplatzbezogene Arbeitsunfähigkeit', options: [ 'ja', 'nein' ], w: 12 },
                ] },
                { heading: 'Teilarbeitsfähigkeit / Reintegration (Beurteilung für den Reintegrationsprozess)' },
                { cells: [
                    { label: 'Basierend auf *', kind: 'radio', name: 'Grundlage Teilarbeitsfähigkeit', options: [ 'REP', 'Arbeitsplatzbeschrieb' ], w: 6 },
                    { label: 'REP vom', name: 'REP vom (Teil-AF)', w: 3 },
                    { label: 'Arbeitsplatzbeschrieb vom', name: 'Arbeitsplatzbeschrieb vom (Teil-AF)', w: 3 },
                ] },
                { table: {
                    name: 'Teil-AF',
                    columns: [
                        { label: 'Konsultationsdatum', name: 'Konsultation', w: 2 },
                        { label: 'Präsenzzeit\nStd. pro Tag', name: 'Präsenzzeit Std', w: 1 },
                        { label: 'Präsenzzeit\n% Pensum', name: 'Präsenzzeit Prozent', w: 1 },
                        { label: 'Leistungsfähigkeit in\nder Präsenzzeit\n25 / 50 / 75 / 100 %', name: 'Leistungsfähigkeit', w: 2 },
                        { label: 'Arbeits-\nfähigkeit\ngesamt %', name: 'Arbeitsfähigkeit', w: 1 },
                        { label: 'von', w: 1 },
                        { label: 'bis', w: 1 },
                        { label: 'nächste\nKonsultation', name: 'Nächste Konsultation', w: 2 },
                        { label: 'Visum', w: 1 },
                    ],
                    rows: 4,
                } },
                { cells: [
                    { label: 'Wiederaufnahme der Arbeit zu 100 % ab', name: 'Wiederaufnahme ab', w: 4 },
                ] },
            ],
        },
        {
            title: 'Bemerkungen und Unterschrift',
            rows: [
                { lines: 3, cells: [
                    { label: 'Bemerkungen', name: 'Bemerkungen', w: 12 },
                ] },
                { cells: [
                    { label: 'Kontakt mit Arbeitgeberin / Arbeitgeber erwünscht', kind: 'radio', name: 'Kontakt erwünscht', options: [ 'ja', 'nein' ], w: 6 },
                    { label: 'Arzt / Ärztin (Name, Stempel)', name: 'Arzt', w: 6 },
                ] },
                { cells: [
                    { label: 'Datum', name: 'Datum', w: 3 },
                    { label: 'Unterschrift', name: 'Unterschrift', w: 5 },
                ] },
                { text: '* Bitte beifügen: Arbeitsplatzbeschrieb / Stellenprofil oder REP (Ressourcenorientiertes Eingliederungsprofil).' },
            ],
        },
    ],
};
