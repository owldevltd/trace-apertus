import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The kinds of a field, without a model: how code writes a value of each kind and when it says a value is none
// of its kind; where the model's proposal is taken and where it is not; that a kind a person sets stands; that
// what was proposed is not told back to the model that fills in the form; and that a value that does not fit
// stays as it was said and asks for a look. A stand-in answers in the place of the model.
//
//   node tests/kinds.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
process.env.STORAGE_DIR = path.join( root, 'storage', 'tests', 'kinds' );
const { createJob, saveJob } = await import( '../src/job.js' );
const { write, fits, WRITTEN } = await import( '../src/fields/kinds.js' );
const { prompt, places, pages, predictKinds } = await import( '../src/fields/predictor.js' );
const filler = await import( '../src/fields/filler.js' );
const { hints } = await import( '../src/review/hints.js' );
const { KINDS, applyEdit, unkinded } = await import( '../src/fields/editor.js' );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};
// [ kind, value as said, value as written, whether that is one of its kind ]
const table = ( rows ) => rows.every( ( [ kind, said, written, one ] ) => write( kind, said ) === written && fits( kind, written ) === one );

// what code writes, and what it says is none of its kind
check( table( [
    [ 'phone', '0, 3, 2, 3, 4, 8, 4, 2, 3', '032348423', true ], [ 'phone', '0 7 9 4 5 6 1 2 3 4', '079 456 12 34', true ], [ 'phone', '+41 79 456 12 34', '+41 79 456 12 34', true ],
    [ 'phone', '0 79 41 23 68 5', '079 412 36 85', true ], [ 'phone', '0794123685', '079 412 36 85', true ], [ 'phone', '0041 79 4561234', '+41 79 456 12 34', true ],
    [ 'phone', '079 412 36 85 abends', '079 412 36 85 abends', false ],
    [ 'phone', '0313 328 4715', '0313 328 4715', true ], [ 'phone', 'Gregor.ch', 'Gregor.ch', false ],
] ), 'a telephone number: digits said one by one are one number, a number written in groups stays, a word is none' );
check( table( [
    [ 'postcode', '3 0 0 1', '3001', true ], [ 'postcode', '3600', '3600', true ], [ 'postcode', '3, 1', '31', false ], [ 'postcode', '3, 1, Bern', '31, Bern', false ],
] ), 'a postcode: four digits; two digits, or a place behind it, are for a person to look at' );
check( table( [
    [ 'identifier', '9, 3, 8, 5, 4, 2, 5, 1, 2', '938542512', true ], [ 'identifier', '9,3,8,5,4,2,5,1,2', '938542512', true ], [ 'identifier', '756.1234.5678.97', '756.1234.5678.97', true ],
    [ 'identifier', 'K-44701', 'K-44701', true ],
] ), 'an identifier: digits said one by one are joined, what is written with its marks stays, and anything is one' );
check( table( [
    [ 'number', '42 Stunden', '42', true ], [ 'number', '100 Prozent', '100', true ], [ 'number', '100 %', '100', true ], [ 'number', '1\'200.50 Franken', '1\'200.50', true ],
    [ 'number', '3,5', '3,5', true ], [ 'number', '2, 3', '2, 3', false ], [ 'number', 'ca. 40', 'ca. 40', false ], [ 'number', 'November', 'November', false ],
    [ 'number', '25 / 50 / 75', '25 / 50 / 75', false ],
] ), 'a number: the unit behind it falls away; two numbers, a word in front or no number stay as said and are none' );
check( table( [
    [ 'time', '13 Uhr 5', '13:05', true ], [ 'time', 'um 14 Uhr 30', '14:30', true ], [ 'time', '13.05 Uhr', '13:05', true ], [ 'time', '9 Uhr', '09:00', true ],
    [ 'time', '13:05', '13:05', true ], [ 'time', 'halb drei', 'halb drei', false ], [ 'time', '25 Uhr 10', '25 Uhr 10', false ],
] ), 'a time of day: hour and minute as said become 13:05; what is no hour of the day stays' );
check( table( [
    [ 'iban', 'C H 9 3, 0 0 7 6, 2 0 1 1, 6 2 3 8, 5 2 9 5, 7', 'CH93 0076 2011 6238 5295 7', true ], [ 'iban', 'CH9300762011623852957', 'CH93 0076 2011 6238 5295 7', true ],
    [ 'iban', 'CH 67 225 008 356 00', 'CH 67 225 008 356 00', false ], [ 'iban', 'CH93 0076 2011 6238 5295 8', 'CH93 0076 2011 6238 5295 8', false ],
] ), 'an IBAN: in groups of four when its check digits hold; one whose check digits do not hold stays as said' );
check( table( [
    [ 'email', 'office@musterbau.ch', 'office@musterbau.ch', true ], [ 'email', 'Gregor.ch', 'Gregor.ch', false ], [ 'email', 'office at musterbau.ch', 'office at musterbau.ch', false ],
    [ 'date', '3. November 2025', '03.11.2025', true ], [ 'date', 'gestern', 'gestern', false ],
    [ 'text', 'Hansi Strasse 1, 3, 2, 0, 0, Tun', 'Hansi Strasse 1, 3200 Tun', true ], [ 'text', '3, 0, 0, 1 Bern', '3001 Bern', true ], [ 'multiline', '2, 3 Mal die Woche', '2, 3 Mal die Woche', true ],
    [ 'text', '9, 3, 8, 5, 4, 2, 5, 1, 2 und mehr', '9, 3, 8, 5, 4, 2, 5, 1, 2 und mehr', true ], [ 'text', '3, 1, Bern', '3, 1, Bern', true ],
] ), 'an e-mail address is checked and not rewritten, a date is a day; in text four single digits in front of a word are a postcode, five a house number and a postcode, and any other row stays' );
check( WRITTEN.every( ( k ) => KINDS.includes( k ) ) && [ 'checkbox', 'radio', 'signature' ].every( ( k ) => KINDS.includes( k ) && !WRITTEN.includes( k ) ),
    'the mask offers every kind a person writes into, and the tick marks and the signature beside them' );

// the proposal: on a shipped form, with a stand-in that names a kind by the label
const form = JSON.parse( fs.readFileSync( path.join( root, 'data', 'forms', 'schadenmeldung-uvg', 'captured.json' ), 'utf8' ) );
// the form as the geometry left it, whatever was proposed and kept since
for ( const f of form.fields.filter( ( x ) => x.kindBy ) ) {
    f.kind = 'text';
    delete f.kindBy;
}
const units = form.dialogue.units;
const field = ( label, n = 0 ) => form.fields.filter( ( f ) => f.label === label )[ n ];
const unitOf = ( f ) => units.find( ( u ) => u.fields[ 0 ] === f.id );
const phone = field( 'Tel.-Nr.' );
const policy = field( 'Police-Nr. UVG' );
const plz = field( 'PLZ' );
const hired = field( 'Datum der Anstellung' );
const dayBox = field( 'Tag' );
const address = field( 'Name und Adresse mit Postleitzahl' );
const street = field( 'Strasse' );
const mail = field( 'E-Mail' );
const hours = field( 'Arbeitszeit des/der Verletzten (Std./Woche)' );
street.kind = 'number';
street.kindBy = 'person';
mail.values = [ 'a@b.ch', 'c@d.ch' ];
const named = new Map( [ [ phone.id, 'telefon' ], [ policy.id, 'nummer' ], [ plz.id, 'plz' ], [ hired.id, 'nummer' ], [ dayBox.id, 'datum' ], [ address.id, 'telefon' ], [ street.id, 'telefon' ],
    [ mail.id, 'email' ], [ hours.id, 'Zahl' ] ] );
const asked = [];
const model = { state: { halted: 0 }, ask: async ( text, options ) => {
    asked.push( { text, tag: options.tag } );
    const ids = text.match( /Die Kennungen: (.*)/ )[ 1 ].split( ', ' );
    const arten = ids.map( ( id ) => ( { kennung: id, art: named.get( units.find( ( u ) => u.id === id ).fields[ 0 ] ) || 'text' } ) );
    // a word that is no kind, a place the page does not have, and a place named twice
    return { text: JSON.stringify( { arten: [ ...arten, { kennung: 'q9999', art: 'telefon' }, { kennung: unitOf( phone ).id, art: 'iban' }, { kennung: ids[ 0 ], art: 'adresse' } ] } ) };
} };
check( phone.kind === 'text' && hired.kind === 'date' && address.kind === 'multiline' && places( form, units ).length > 40 && JSON.stringify( pages( form, units ) ) === '[1,2]',
    'the model is asked about the places a person writes into, page by page' );
const changed = await predictKinds( form, units, model, null );
const sample = prompt( 'x', [ 'q1' ] );
check( asked.length === 2 && asked.every( ( a, i ) => a.tag === 'kinds page ' + ( i + 1 ) ) && [ 'text', 'nummer', 'zahl', 'telefon', 'email', 'plz', 'iban', 'datum', 'uhrzeit' ].every( ( w ) => sample.includes( '- ' + w + ': ' ) ),
    'one call per page, with the nine words a place can be named by' );
check( phone.kind === 'phone' && phone.kindBy === 'model' && policy.kind === 'identifier' && plz.kind === 'postcode' && hours.kind === 'number' && hours.kindBy === 'model'
    && [ phone.id, policy.id, plz.id, hours.id ].every( ( id ) => changed.includes( id ) ),
    'a field the geometry calls text takes the kind the model names, and says who named it' );
check( hired.kind === 'date' && !hired.kindBy && address.kind === 'multiline' && !address.kindBy && dayBox.kind === 'text' && !dayBox.kindBy,
    'a date named by its label and a box several lines high stay what they are, and the model\'s word for a date is not taken' );
check( street.kind === 'number' && street.kindBy === 'person' && mail.kind === 'text' && !mail.kindBy && changed.length === 4,
    'a kind a person set stands, a field with values to choose from is not given one, and nothing else changed' );
named.set( phone.id, 'text' );
named.set( policy.id, 'plz' );
const again = await predictKinds( form, units, model, null, new Set( [ phone.id ] ) );
check( JSON.stringify( again ) === JSON.stringify( [ phone.id ] ) && phone.kind === 'text' && !phone.kindBy && policy.kind === 'identifier' && asked.length === 3,
    'asked for one field only, the proposal changes that field alone: named as text now, it is text again' );

// a person corrects the form: the kind a person sets is the person's, and what is new or named anew is asked about
const at = ( f, more ) => ( { id: f.id, page: f.page, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.kind, option: f.option, group: f.group, ...more } );
const edit = { fields: [ ...form.fields.map( ( f ) => at( f, f === policy ? { kind: 'text' } : f === hours ? { label: 'Stunden je Woche' } : {} ) ),
    { page: 1, x: 100, y: 100, width: 300, height: 40, label: 'Mobile', kind: 'text' }, { page: 1, x: 100, y: 160, width: 300, height: 40, label: 'Notfallnummer', kind: 'phone' } ] };
const change = applyEdit( form, edit );
const mobile = form.fields.find( ( f ) => f.label === 'Mobile' );
const emergency = form.fields.find( ( f ) => f.label === 'Notfallnummer' );
check( policy.kind === 'text' && policy.kindBy === 'person' && mobile.kind === 'text' && !mobile.kindBy && emergency.kind === 'phone' && emergency.kindBy === 'person'
    && change.named.has( hours.id ) && !change.named.has( policy.id ) && plz.kindBy === 'model',
    'the kind chosen in the mask is the person\'s; a new field left as text is nobody\'s yet' );
form.dialogue.units = [ ...units, { id: 'q9001', kind: 'single', page: 1, fields: [ mobile.id ], label: 'Mobile' }, { id: 'q9002', kind: 'single', page: 1, fields: [ emergency.id ], label: 'Notfallnummer' } ];
const wanted = unkinded( form, change );
check( wanted && wanted.has( mobile.id ) && wanted.has( hours.id ) && JSON.stringify( pages( form, form.dialogue.units, wanted ) ) === JSON.stringify( [ ...new Set( [ mobile.page, hours.page ] ) ].sort() )
    && pages( form, form.dialogue.units, new Set( [ emergency.id, policy.id ] ) ).length === 0,
    'the field a person added and the one named anew are shown to the model; one whose kind the person set is not' );

// filling: the proposed kind is not told to the model, code writes and checks by it
const job = createJob( { name: 'Probe', language: 'de', pages: 1 } );
job.pages = [ { n: 1, width: 1000, height: 1400 } ];
const box = ( id, label, kind, more = {} ) => ( { id, label, kind, page: 1, x: 10, y: 10, width: 400, height: 40, ...more } );
job.fields = [ box( 'f1', 'Tel.-Nr.', 'phone', { kindBy: 'model' } ), box( 'f2', 'Arbeitszeit (Std./Woche)', 'number', { kindBy: 'model' } ), box( 'f3', 'PLZ', 'postcode', { kindBy: 'model' } ),
    box( 'f4', 'Telefon oder E-Mail', 'phone', { kindBy: 'model' } ), box( 'f5', 'Anzahl Kinder', 'number', { kindBy: 'person' } ), box( 'f6', 'Strasse', 'text' ),
    box( 'f7', 'Durch das Amt auszufüllen', 'text' ) ];
job.dialogue = { units: [ { id: 'q1', kind: 'single', page: 1, fields: [ 'f7' ], label: 'Durch das Amt auszufüllen', skip: true } ] };
job.transcript = [ { n: 1, start: 0, text: 'Telefon 0, 3, 2, 3, 4, 8, 4, 2, 3. Ich arbeite 42 Stunden. Postleitzahl 3, 1, Bern. Rückfragen an Gregor.ch. Hansi Strasse 1, 3, 2, 0, 0, Tun.', raw: '', approve: false } ];
await saveJob( job );
const given = filler.prompt( job.fields, 'x' );
check( /- f1: Tel\.-Nr\. — Vorgabe: Text\n/.test( given ) && /- f2: .* — Vorgabe: Text\n/.test( given ) && /- f5: Anzahl Kinder — Vorgabe: Zahl\n/.test( given ) && /- f6: Strasse — Vorgabe: Text\n/.test( given ),
    'the model that fills in the form reads a proposed kind as text, as before; a kind a person set is told' );
const filling = [];
await filler.fillJob( job, { state: { halted: 0 }, ask: async ( text ) => {
    filling.push( text );
    return { text: 'f1: 0, 3, 2, 3, 4, 8, 4, 2, 3 [p1]\nf2: 42 Stunden [p1]\nf3: 3, 1, Bern [p1]\nf4: Gregor.ch [p1]\nf5: -\nf6: Hansi Strasse 1, 3, 2, 0, 0, Tun [p1]\nf7: Telefon [p1]' };
} } );
const by = ( id ) => job.fields.find( ( f ) => f.id === id );
check( by( 'f1' ).value === '032348423' && by( 'f1' ).source.how === 'literal' && by( 'f1' ).source.approve === false && by( 'f1' ).source.quote === '0, 3, 2, 3, 4, 8, 4, 2, 3'
    && by( 'f2' ).value === '42' && by( 'f2' ).source.approve === false && !by( 'f1' ).hints && !by( 'f2' ).hints,
    'digits said one by one stand as one number and the unit is gone; what was said is kept as the quote, and nobody has to look' );
check( by( 'f3' ).value === '31, Bern' && by( 'f3' ).source.approve === true && by( 'f3' ).hints.some( ( h ) => h.kind === 'format' )
    && by( 'f4' ).value === 'Gregor.ch' && by( 'f4' ).source.approve === true && by( 'f4' ).hints.some( ( h ) => h.kind === 'format' ),
    'a value that is none of its kind stays as it was said, with a format hint, and a person looks' );
check( by( 'f6' ).value === 'Hansi Strasse 1, 3200 Tun' && by( 'f6' ).source.how === 'literal' && by( 'f6' ).source.approve === false && !by( 'f6' ).hints && by( 'f5' ).value === '',
    'an address is written with its postcode as one number, and stays what was said' );
check( filling.length === 1 && !filling[ 0 ].includes( '- f7:' ) && !by( 'f7' ).value && !by( 'f7' ).source,
    'a place the conversation does not ask for is not filled from the dictation' );
check( hints( { fields: [ box( 'f1', 'IBAN', 'iban', { value: 'CH93 0076 2011 6238 5295 8' } ), box( 'f2', 'IBAN', 'iban', { value: 'CH93 0076 2011 6238 5295 7' } ), box( 'f3', 'Nr.', 'identifier', { value: 'x' } ),
    box( 'f4', 'Zeit', 'time', { value: 'mittags' } ), box( 'f5', 'Zeit', 'time', { value: '' } ) ] } ).map( ( h ) => h.field + ' ' + h.kind ).join( ', ' ) === 'f1 format, f4 format',
    'the format hint stands on a value that is none of its kind, and on nothing else' );

// a dictation in one go: the question says whose entry is meant, a field's own name is no part of its value, and
// the same value in two fields asks for a look at both
const dict = createJob( { name: 'Probe', language: 'de', pages: 1 } );
dict.pages = [ { n: 1, width: 1000, height: 1400 } ];
dict.fields = [ box( 'f1', 'Tel.-Nr.', 'phone' ), box( 'f2', 'Tel.-Nr.', 'phone' ), box( 'f3', 'Adresse des Betreibungsamtes', 'multiline' ), box( 'f4', 'Schuldner (Name und Vorname bzw. Firma; Adresse)', 'multiline' ),
    box( 'f5', 'Arbeitszeit (Std./Woche)', 'number' ), box( 'f6', 'Vollarbeitszeit (Std./Woche)', 'number' ), box( 'f7', 'Strasse', 'text' ) ];
dict.dialogue = { units: dict.fields.map( ( f, i ) => ( { id: 'q' + ( i + 1 ), kind: 'single', page: 1, fields: [ f.id ], label: f.label,
    ...( i < 2 ? { question: [ 'Welche Telefonnummer hat der Arbeitgeber?', 'Welche Telefonnummer hat die verletzte Person?' ][ i ] } : {} ) } ) ) };
dict.transcript = [ { n: 1, start: 0, text: 'Telefon 032 348 42 30. Adresse des Betreibungsamtes ist Aare Strasse 1, 8002 Zürich. Schuldner: Urs Meier. 42 Stunden, betriebsüblich 42. Strasse 5.', raw: '', approve: false } ];
await saveJob( dict );
const read = [];
await filler.fillJob( dict, { state: { halted: 0 }, ask: async ( text ) => {
    read.push( text );
    return { text: 'f1: 032 348 42 30 [p1]\nf2: 032 348 42 30 [p1]\nf3: Adresse des Betreibungsamtes ist Aare Strasse 1, 8002 Zürich [p1]\nf4: Schuldner: Urs Meier [p1]\nf5: 42 Stunden [p1]\nf6: 42 [p1]' };
} } );
const got = ( id ) => dict.fields.find( ( f ) => f.id === id );
check( /- f1: Tel\.-Nr\. \(Welche Telefonnummer hat der Arbeitgeber\?\) — Vorgabe: Text\n/.test( read[ 0 ] ) && /- f2: Tel\.-Nr\. \(Welche Telefonnummer hat die verletzte Person\?\) — /.test( read[ 0 ] ) && /- f3: Adresse des Betreibungsamtes — /.test( read[ 0 ] ),
    'a dictation in one go is read with the question of each field behind its label, where it has one' );
check( got( 'f3' ).value === 'Aare Strasse 1, 8002 Zürich' && got( 'f3' ).source.how === 'literal' && got( 'f4' ).value === 'Urs Meier' && filler.unnamed( got( 'f7' ), 'Strasse 5' ) === 'Strasse 5'
    && filler.unnamed( got( 'f3' ), 'Adresse des Betreibungsamtes' ) === 'Adresse des Betreibungsamtes',
    'a value that begins with the name of its own field and "ist" or a colon is written without them; anything else stays' );
check( got( 'f1' ).value === '032 348 42 30' && got( 'f1' ).source.approve === true && got( 'f2' ).source.approve === true && got( 'f1' ).hints.some( ( h ) => h.kind === 'double' && h.text.includes( 'Tel.-Nr.' ) )
    && got( 'f2' ).hints.some( ( h ) => h.kind === 'double' ) && got( 'f5' ).value === '42' && got( 'f6' ).value === '42' && got( 'f5' ).source.approve === false && !( got( 'f5' ).hints || [] ).some( ( h ) => h.kind === 'double' ),
    'the same value in two fields of one dictation asks for a look at both and says where else it stands; a short one may stand twice' );
got( 'f1' ).source.review = { at: 'now', decision: 'confirmed' };
check( hints( dict ).filter( ( h ) => h.kind === 'double' ).map( ( h ) => h.field ).join() === 'f2', 'once a person decided on one of the two, the hint stays on the other until it is looked at too' );

// what was said as a question is written without its question mark, and a person looks
const asked1 = createJob( { name: 'Probe', language: 'de', pages: 1 } );
asked1.pages = [ { n: 1, width: 1000, height: 1400 } ];
asked1.fields = [ box( 'f1', 'Zivilstand', 'text' ), box( 'f2', 'Land', 'text' ) ];
asked1.transcript = [ { n: 1, start: 0, text: 'Verheiratet? Land ist Schweiz.', raw: '', approve: false } ];
await saveJob( asked1 );
await filler.fillJob( asked1, { state: { halted: 0 }, ask: async () => ( { text: 'f1: Verheiratet? [p1]\nf2: Schweiz [p1]' } ) } );
check( asked1.fields[ 0 ].value === 'Verheiratet' && asked1.fields[ 0 ].source.approve === true && asked1.fields[ 0 ].source.how === 'literal' && asked1.fields[ 1 ].value === 'Schweiz' && asked1.fields[ 1 ].source.approve === false,
    'a value said as a question stands without the question mark and asks for a look' );

// what the model leaves where the piece belongs is no part of the value
const three = [ box( 'f1', 'Wohnort', 'text' ), box( 'f2', 'Land', 'text' ), box( 'f3', 'Kurzarbeit', 'text' ), box( 'f4', 'Strasse', 'text' ) ];
const lines = filler.parse( 'f1: Bern: Strich\nf2: Schweiz [p1]\nf3: nein –\nf4: Am Strich 5 [p1]', three );
check( lines.f1.value === 'Bern' && lines.f2.value === 'Schweiz' && lines.f3.value === 'nein' && lines.f4.value === 'Am Strich 5',
    'the dash spelled out behind a value, or left behind it, is cut; a value that only holds the word stays' );

// options that exclude each other: two ticks are nobody's choice
const pos = createJob( { name: 'Probe', language: 'de', pages: 1 } );
pos.pages = [ { n: 1, width: 1000, height: 1400 } ];
const tick = ( id, label, group, kind = 'radio' ) => ( { id, label, option: label, kind, group, page: 1, x: 10, y: 10, width: 30, height: 30 } );
pos.fields = [ tick( 'f1', 'Höheres Kader', 'Stellung' ), tick( 'f2', 'Mittleres Kader', 'Stellung' ), tick( 'f3', 'Lehrling', 'Stellung' ), tick( 'f4', 'Kurzarbeit', 'Einsatz', 'checkbox' ), tick( 'f5', 'Zwischenverdienst', 'Einsatz', 'checkbox' ) ];
pos.dialogue = { units: [ { id: 'q1', kind: 'choice', page: 1, fields: [ 'f1', 'f2', 'f3' ], label: 'Stellung' }, { id: 'q2', kind: 'choice', page: 1, fields: [ 'f4', 'f5' ], label: 'Einsatz' } ] };
pos.transcript = [ { n: 1, start: 0, text: 'Mittleres Kader, in Kurzarbeit und mit Zwischenverdienst.', raw: '', approve: false } ];
await saveJob( pos );
await filler.fillJob( pos, { state: { halted: 0 }, ask: async () => ( { text: 'f1: ja [p1]\nf2: ja [p1]\nf3: nein [p1]\nf4: ja [p1]\nf5: ja [p1]' } ) } );
const mark = ( id ) => pos.fields.find( ( f ) => f.id === id );
check( mark( 'f1' ).value === 'x' && mark( 'f1' ).source.approve === true && mark( 'f2' ).value === 'x' && mark( 'f2' ).source.approve === true && !mark( 'f3' ).value
    && mark( 'f4' ).value === 'x' && mark( 'f4' ).source.approve === false && mark( 'f5' ).source.approve === false,
    'two ticks among options of which one holds both ask for a look, also the one that stands in what was said; tick boxes that go together keep theirs' );

process.exit( failed ? 1 : 0 );
