// A notice of leaving a group insurance, rebuilt after the first page of the SWICA form: the fields of the
// insured person and their declaration, in our own layout, with a date and a signature at the foot. The sheet of
// the walk-through: set large, every field a box with its label inside, so it can be printed and photographed.
// Names are the widget names the app fills.
//
// Where the sheet leaves its model, a dictation in one go said why (tried 11 October 2026): "Name" beside
// "Vorname" took first name and surname together, so the field says "Nachname"; of three telephone fields two
// took the one number said, so there is one; of two statements with a date behind each both dates took the one
// date said, so the statement about the employer's contract and its date are left away; postcode and town are
// two fields, each of one kind. The town is labelled "Wohnort": the round O of "Ort" stands two pixels higher
// than the P of "PLZ" beside it, and the conversation, which follows the page from the top, asked for the town
// before the postcode.

export const form = {
    id: 'austrittsmeldung',
    title: 'Austrittsmeldung',
    note: 'Nachgebaut nach dem Vorbild der ersten Seite der SWICA-Austrittsmeldung (Formular 303, Ausgabe 06.2025) in eigener Gestaltung – nicht das Original. Testmaterial des Projekts Trace.',
    footer: 'Nachgebaut nach dem Vorbild der SWICA-Austrittsmeldung – nicht das Original',
    language: 'de',
    style: 'sturdy',
    zoom: 1.4,
    plain: true,
    logo: { word: 'Trace', colour: [ 0.545, 0.424, 1 ] },
    sections: [
        {
            title: 'Versicherte Person',
            rows: [
                { cells: [
                    { label: 'Nachname', name: 'Nachname', w: 6 },
                    { label: 'Vorname', name: 'Vorname', w: 6 },
                ] },
                { cells: [
                    { label: 'Geburtsdatum', name: 'Geburtsdatum', w: 4 },
                    { label: 'Nationalität', name: 'Nationalität', w: 4 },
                    { label: 'Versicherten-Nr.', name: 'Versichertennummer', w: 4 },
                ] },
                { cells: [
                    { label: 'Aufenthaltsbewilligung', name: 'Aufenthaltsbewilligung', w: 4 },
                    { label: 'Beruf', name: 'Beruf', w: 8 },
                ] },
                { cells: [
                    { label: 'Strasse/Nr.', name: 'Strasse Nummer', w: 6 },
                    { label: 'PLZ', name: 'PLZ', w: 2 },
                    { label: 'Wohnort', name: 'Ort', w: 4 },
                ] },
                { cells: [
                    { label: 'Telefon', name: 'Telefon', w: 4 },
                    { label: 'E-Mail', name: 'E-Mail', w: 8 },
                ] },
                // the choice last: under its marks stands text and no border
                { cells: [
                    { label: 'Geschlecht', kind: 'radio', name: 'Geschlecht', options: [ 'männlich', 'weiblich' ], w: 12 },
                ] },
                { text: 'Den in der Schweiz oder im Fürstentum Liechtenstein wohnhaften Versicherten steht innerhalb von 90 Tagen nach dem Austritt aus der Firma das Recht zu, in die Einzelversicherung überzutreten.' },
            ],
        },
        {
            title: 'Erklärung der versicherten Person',
            rows: [
                { check: { name: 'Austritt aus der Firma', text: 'Ich werde/bin aus der Firma austreten/ausgetreten.' }, after: { label: 'Austrittsdatum', name: 'Austrittsdatum', w: 3 } },
                { check: { name: 'Offerte gewünscht', text: 'Ich bin an einer Weiterführung der Versicherung interessiert und wünsche eine unverbindliche Offerte.' } },
                { check: { name: 'Verzicht', text: 'Ich verzichte auf mein Recht, die betreffende Versicherung weiterzuführen.' } },
            ],
        },
        {
            title: 'Unterschrift',
            rows: [
                { lines: 2, cells: [
                    { label: 'Datum', name: 'Datum', w: 4 },
                    { label: 'Unterschrift', name: 'Unterschrift', w: 8 },
                ] },
                { text: 'Mit der Unterschrift wird die Richtigkeit der gemachten Angaben bestätigt.' },
            ],
        },
    ],
};
