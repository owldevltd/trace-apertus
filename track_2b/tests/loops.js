import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A list of entries, without a model: which table is one, which row is free, and that an answer to it goes into
// one row and leaves the others alone. On the shipped forms as they are kept, and on a job of its own with a
// stand-in in the place of the model.
//
//   node tests/loops.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
process.env.STORAGE_DIR = path.join( root, 'storage', 'tests', 'loops' );
const { createJob, saveJob } = await import( '../src/job.js' );
const { buildUnits, repeats, rowsOf, freeRow } = await import( '../src/dialogue/units.js' );
const { fillUnit, fillJob, fillEntries, entries } = await import( '../src/fields/filler.js' );
const { dictionary } = await import( '../src/speech/transcriber.js' );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};
const shipped = ( id ) => JSON.parse( fs.readFileSync( path.join( root, 'data', 'forms', id, 'captured.json' ), 'utf8' ) );
// a date in three boxes is kept as a table of one row too; counted apart, further down
const tables = ( job, units ) => units.filter( ( u ) => u.kind === 'table' && !u.parts ).map( ( u ) => u.rows + 'x' + u.columns + ( u.repeat ? ' list' : '' ) ).join( ', ' );

// what a list is
const cell = ( label ) => ( { label } );
check( repeats( [ 'Grund', 'Betrag', 'Grund', 'Betrag', 'Grund', 'Betrag' ].map( cell ), 2 ) && !repeats( [ 'Lohn: Stunde', 'Lohn: Monat', 'Zulage: Stunde', 'Zulage: Monat' ].map( cell ), 2 )
    && !repeats( [ '', '', '', '' ].map( cell ), 2 ) && !repeats( [ 'Grund', 'Betrag', 'Grund', '' ].map( cell ), 2 ) && !repeats( [ 'Grund', 'Betrag' ].map( cell ), 2 ),
    'a table is a list of entries when every cell has a label and each row carries the labels of the first; rows with labels of their own, cells without one and a single row are none' );
const claims = shipped( 'betreibungsbegehren' );
const report = shipped( 'schadenmeldung-uvg' );
const certificate = shipped( 'arbeitsfaehigkeitszeugnis' );
check( tables( claims, buildUnits( claims ) ) === '9x4 list' && tables( report, buildUnits( report ) ) === '5x3' && tables( certificate, buildUnits( certificate ) ) === '3x5 list, 4x9 list',
    'on the shipped forms: the further claims and the two tables of the certificate are lists, the wage table is none' );
check( [ claims, report, certificate ].every( ( job ) => tables( job, job.dialogue.units ) === tables( job, buildUnits( job ) ) ),
    'the forms as they are kept say the same' );

// the dictionary the recognition is given: the cells of a table do not crowd out the terms of the form
const terms = dictionary( report );
check( terms.includes( 'Schadenmeldung UVG' ) && terms.includes( 'Kinder-/Familienzulagen' ) && terms.filter( ( w ) => w.includes( 'Grundlohn' ) ).length === 1 && !terms.some( ( w ) => /:\s/.test( w ) )
    && new Set( terms ).size === terms.length,
    'a label that says two things with a colon between them goes into the dictionary as two terms, each once; the name of the form stays in' );

// one answer, one row
const job = createJob( { name: 'Probe', language: 'de', pages: 1 } );
job.pages = [ { n: 1, width: 1000, height: 1400, unit: 20 } ];
const box = ( id, label, row, column ) => ( { id, label, kind: column ? 'number' : 'text', kindBy: 'person', page: 1, x: 100 + column * 300, y: 100 + row * 40, width: 280, height: 30, by: 'person' } );
job.fields = [ 0, 1, 2 ].flatMap( ( r ) => [ box( 'f' + ( r * 2 + 1 ), 'Grund', r, 0 ), box( 'f' + ( r * 2 + 2 ), 'Betrag (CHF)', r, 1 ) ] );
job.dialogue = { units: buildUnits( job ) };
const list = job.dialogue.units[ 0 ];
check( job.dialogue.units.length === 1 && list.kind === 'table' && list.repeat === true && JSON.stringify( rowsOf( list ) ) === '[["f1","f2"],["f3","f4"],["f5","f6"]]' && freeRow( job, list ) === 1,
    'a table of three rows built alike with the same labels is one unit, a list, and its first row is free' );
job.transcript = [ { n: 1, start: 0, text: 'Eine Rechnung vom Mai, 500 Franken.', raw: '', question: list.id, row: 1 } ];
await saveJob( job );
const asked = [];
const model = { state: { halted: 0 }, ask: async ( prompt ) => {
    asked.push( prompt );
    return { text: asked.length === 1 ? 'f1: Rechnung vom Mai [p1]\nf2: 500 Franken [p1]' : 'f3: Miete Juni [p2]\nf4: 1200 [p2]' };
} };
await fillUnit( job, list, job.transcript.filter( ( p ) => p.row === 1 ), model, rowsOf( list )[ 0 ] );
const by = ( id ) => job.fields.find( ( f ) => f.id === id );
check( asked.length === 1 && /- f1: Grund/.test( asked[ 0 ] ) && /- f2: Betrag/.test( asked[ 0 ] ) && !/- f3:/.test( asked[ 0 ] ) && by( 'f1' ).value === 'Rechnung vom Mai' && by( 'f2' ).value === '500'
    && !by( 'f3' ).value && freeRow( job, list ) === 2,
    'an entry is read into the fields of its row only, in one call, the amount without its unit; the next free row is the second' );
job.transcript.push( { n: 2, start: 0, text: 'Die Miete für Juni, 1200.', raw: '', question: list.id, row: 2 } );
await fillUnit( job, list, job.transcript.filter( ( p ) => p.row === 2 ), model, rowsOf( list )[ 1 ] );
check( by( 'f3' ).value === 'Miete Juni' && by( 'f4' ).value === '1200' && by( 'f1' ).value === 'Rechnung vom Mai' && by( 'f2' ).value === '500' && !/Rechnung vom Mai/.test( asked[ 1 ] ) && freeRow( job, list ) === 3,
    'the second entry goes into the second row; the first stays as it is and is not read again' );
by( 'f5' ).value = 'x';
check( freeRow( job, list ) === 0, 'a list with something in every row has no free row' );

// one answer, several entries: the model says how many
check( JSON.stringify( entries( 'EINTRAG\n1: Mahngebühr\n2: 40\n\nEINTRAG\nGrund oder Urkunde: Miete\nBetrag (CHF): 1200 [p1]', 2 ) ) === '[["Mahngebühr","40"],["Miete","1200"]]'
    && entries( 'KEINE', 2 ).length === 0 && JSON.stringify( entries( 'EINTRAG\n1: Miete\n2: -', 2 ) ) === '[["Miete",""]]' && entries( 'EINTRAG\n1: -\n2: -', 2 ).length === 0 && entries( '1: Miete\n2: 40', 2 ).length === 0,
    'the entries of an answer are read block by block, a value per line in the order of the columns, whatever stands in front of it' );
const many = createJob( { name: 'Probe', language: 'de', pages: 1 } );
many.pages = [ { n: 1, width: 1000, height: 1400, unit: 20 } ];
many.fields = [ 0, 1, 2 ].flatMap( ( r ) => [ box( 'f' + ( r * 2 + 1 ), 'Grund', r, 0 ), box( 'f' + ( r * 2 + 2 ), 'Betrag (CHF)', r, 1 ) ] );
many.dialogue = { units: buildUnits( many ) };
const both = [ { n: 1, start: 0, text: 'Eine Mahngebühr von 40 Franken und die Miete für Juni, 1200 Franken.', raw: '', question: 'q1', row: 1 } ];
many.transcript = both;
await saveJob( many );
const prompts = [];
const two = { state: { halted: 0 }, ask: async ( prompt ) => {
    prompts.push( prompt );
    return { text: 'EINTRAG\n1: Mahngebühr\n2: 40 Franken\nEINTRAG\nGrund: Miete für Juni\nBetrag (CHF): 1200 Franken' };
} };
const got = await fillEntries( many, many.dialogue.units[ 0 ], both, two, 1 );
const cellOf = ( id ) => many.fields.find( ( f ) => f.id === id );
check( prompts.length === 1 && /1: Grund\n2: Betrag \(CHF\)/.test( prompts[ 0 ] ) && got.entries === 2 && got.left === 0 && got.fields.length === 4
    && cellOf( 'f1' ).value === 'Mahngebühr' && cellOf( 'f1' ).source.how === 'literal' && cellOf( 'f2' ).value === '40' && cellOf( 'f3' ).value === 'Miete für Juni' && cellOf( 'f4' ).value === '1200' && !cellOf( 'f5' ).value
    && freeRow( many, many.dialogue.units[ 0 ] ) === 3,
    'two entries said in one answer go into two rows, in one call, each value held against what was said and written by its kind' );
const more = await fillEntries( many, many.dialogue.units[ 0 ], both, two, 3 );
check( more.entries === 2 && more.left === 1 && more.fields.length === 2 && cellOf( 'f5' ).value === 'Mahngebühr' && cellOf( 'f1' ).value === 'Mahngebühr' && cellOf( 'f3' ).value === 'Miete für Juni',
    'entries the table has no row left for are counted and not written; the rows before stay as they are' );
const none = await fillEntries( many, many.dialogue.units[ 0 ], both, { state: { halted: 0 }, ask: async () => ( { text: 'KEINE' } ) }, 1 );
check( none.entries === 0 && none.fields.length === 0 && cellOf( 'f1' ).value === 'Mahngebühr', 'an answer that names no entry writes nothing' );

// a date printed as three boxes: one unit, read as one date, its parts put into the boxes by code
const dateUnit = report.dialogue.units.find( ( u ) => u.parts === 'date' );
check( !!dateUnit && dateUnit.kind === 'table' && dateUnit.rows === 1 && dateUnit.columns === 3 && !dateUnit.repeat
    && dateUnit.fields.map( ( id ) => report.fields.find( ( f ) => f.id === id ).label ).join() === 'Tag,Monat,Jahr' && !!dateUnit.question
    && buildUnits( report ).filter( ( u ) => u.parts === 'date' ).length === 1 && buildUnits( claims ).every( ( u ) => !u.parts ),
    'on the shipped accident report day, month and year are one unit with one question; a form without such boxes has none' );
const dated = createJob( { name: 'Probe', language: 'de', pages: 1 } );
dated.pages = [ { n: 1, width: 1000, height: 1400, unit: 20 } ];
const part = ( id, label, x ) => ( { id, label, kind: 'text', page: 1, x, y: 100, width: 150, height: 30, by: 'person' } );
dated.fields = [ { id: 'f9', label: 'Name', kind: 'text', page: 1, x: 100, y: 20, width: 400, height: 30, by: 'person' }, part( 'f1', 'Tag', 100 ), part( 'f2', 'Monat', 300 ), part( 'f3', 'Jahr', 500 ) ];
dated.dialogue = { units: buildUnits( dated ) };
const whenUnit = dated.dialogue.units.find( ( u ) => u.parts === 'date' );
dated.transcript = [ { n: 1, start: 0, text: 'Hans Rietli. Der Unfall war am 3. November 2025.', raw: '', approve: false } ];
await saveJob( dated );
const seenDate = [];
await fillJob( dated, { state: { halted: 0 }, ask: async ( prompt ) => {
    seenDate.push( prompt );
    return { text: 'f9: Hans Rietli [p1]\nf1: 3. November 2025 [p1]' };
} } );
const box3 = ( id ) => dated.fields.find( ( f ) => f.id === id );
check( dated.dialogue.units.length === 2 && whenUnit.fields.join() === 'f1,f2,f3' && seenDate.length === 1 && /- f1: Tag \/ Monat \/ Jahr — Vorgabe: Datum als TT\.MM\.JJJJ/.test( seenDate[ 0 ] ) && !/- f[23]:/.test( seenDate[ 0 ] )
    && box3( 'f1' ).value === '3' && box3( 'f2' ).value === '11' && box3( 'f3' ).value === '2025' && [ 'f1', 'f2', 'f3' ].every( ( id ) => box3( id ).source.how === 'literal' && box3( id ).source.approve === false ),
    'a dictation in one go reads the three boxes as one date and writes day, month and year as numbers, each with the origin of the date' );
dated.transcript.push( { n: 2, start: 0, text: 'Am 14. Mai 2024.', raw: '', question: whenUnit.id } );
await fillUnit( dated, whenUnit, [ dated.transcript[ 1 ] ], { state: { halted: 0 }, ask: async () => ( { text: 'f1: 14.05.2024 [p2]' } ) } );
check( box3( 'f1' ).value === '14' && box3( 'f2' ).value === '5' && box3( 'f3' ).value === '2024', 'an answer to the question of the date goes into the three boxes the same way' );
await fillUnit( dated, whenUnit, [ { n: 3, start: 0, text: 'Letzten Dienstag.', raw: '', question: whenUnit.id } ], { state: { halted: 0 }, ask: async () => ( { text: 'f1: letzten Dienstag [p3]' } ) } );
check( box3( 'f1' ).value === 'letzten Dienstag' && box3( 'f1' ).source.approve === true && !box3( 'f2' ).value && !box3( 'f3' ).value, 'what is no date stands in the first box as it was said, and a person looks' );

// a dictation in one go leaves a list alone
const whole = createJob( { name: 'Probe', language: 'de', pages: 1 } );
whole.pages = [ { n: 1, width: 1000, height: 1400, unit: 20 } ];
whole.fields = [ { id: 'f9', label: 'Name', kind: 'text', page: 1, x: 100, y: 20, width: 400, height: 30, by: 'person' }, ...[ 0, 1 ].flatMap( ( r ) => [ box( 'f' + ( r * 2 + 1 ), 'Grund', r, 0 ), box( 'f' + ( r * 2 + 2 ), 'Betrag (CHF)', r, 1 ) ] ) ];
whole.dialogue = { units: buildUnits( whole ) };
whole.transcript = [ { n: 1, start: 0, text: 'Ich heisse Hans Rietli. Dazu kommt eine Mahngebühr von 40 Franken.', raw: '', approve: false } ];
await saveJob( whole );
const said = [];
await fillJob( whole, { state: { halted: 0 }, ask: async ( prompt ) => {
    said.push( prompt );
    return { text: 'f9: Hans Rietli [p1]\nf1: Mahngebühr [p1]\nf2: 40 [p1]' };
} } );
check( whole.dialogue.units.some( ( u ) => u.repeat ) && said.length === 1 && /- f9: Name/.test( said[ 0 ] ) && !/- f[1-4]:/.test( said[ 0 ] ) && whole.fields.find( ( f ) => f.id === 'f9' ).value === 'Hans Rietli'
    && whole.fields.filter( ( f ) => f.id !== 'f9' ).every( ( f ) => !f.value && !f.source ) && whole.status === 'filled',
    'a dictation in one go fills the other fields and leaves a list of entries open: it is asked entry by entry' );

process.exit( failed ? 1 : 0 );
