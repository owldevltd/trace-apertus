import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The values a field may take, without a model: what an answer of the model names is an entry of the list or
// nothing; a field with values is asked alone, takes an entry and says where it came from; a passage offered
// instead of a value stands in what was said; a person sets the list when correcting the form; the list goes
// into the language of the person with the labels, and its entries are not translated back. A stand-in answers
// in the place of the model.
//
//   node tests/values.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
process.env.STORAGE_DIR = path.join( root, 'storage', 'tests', 'values' );
const { createJob, saveJob } = await import( '../src/job.js' );
const { fillJob, fillUnit, pickPrompt, picked } = await import( '../src/fields/filler.js' );
const { offered, suggest } = await import( '../src/review/hints.js' );
const { applyEdit } = await import( '../src/fields/editor.js' );
const { translateDialogue, toTranslate } = await import( '../src/dialogue/translate.js' );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};

const PLACES = [ 'Büro', 'Werkstatt', 'Lager', 'Baustelle' ];
const place = { id: 'f1', label: 'Üblicher Arbeitsplatz', kind: 'text', page: 1, x: 10, y: 10, width: 400, height: 40, values: PLACES };

// what an answer names
check( picked( '1', place ) === 'Büro' && picked( ' 3.', place ) === 'Lager' && picked( 'Nummer 2', place ) === 'Werkstatt',
    'the number in an answer names the entry of the list' );
check( picked( '0', place ) === '' && picked( '7', place ) === '' && picked( 'keiner', place ) === '' && picked( '', place ) === '',
    '0, a number the list does not have and an answer without a number name nothing' );
const asks = pickPrompt( place, '[p1] Ich arbeite im Büro.', null, 'de' );
const foreignAsks = pickPrompt( place, '[p1] Je travaille au bureau.', 'fr', 'de' );
check( asks.includes( '«Üblicher Arbeitsplatz»' ) && PLACES.every( ( v, i ) => asks.includes( ( i + 1 ) + ': ' + v ) ) && !asks.includes( 'spricht' )
    && foreignAsks.includes( 'Die Person spricht Französisch, das Formular ist deutsch.' ),
    'the question for a field with values carries its label and its list by number, and the two languages where they differ' );

// a dictation in one go: the field with values alone, the others in their bundle
const job = createJob( { name: 'Probe', language: 'de', pages: 1 } );
job.pages = [ { n: 1, width: 1000, height: 1400 } ];
job.fields = [
    { ...place },
    { id: 'f2', label: 'Beruf', kind: 'text', page: 1, x: 10, y: 80, width: 400, height: 40 },
    { id: 'f3', label: 'Stellung', kind: 'text', page: 1, x: 10, y: 150, width: 400, height: 40, values: [ 'Höheres Kader', 'Mittleres Kader', 'Mitarbeiter' ] },
    { id: 'f4', label: 'Seite', kind: 'text', page: 1, x: 10, y: 220, width: 400, height: 40, values: [ 'links', 'rechts' ] },
];
job.transcript = [ { n: 1, start: 0, text: 'Ich arbeite als Projektleiter im Büro und führe ein Team.', raw: '', approve: false } ];
await saveJob( job );
const seen = [];
const model = { state: { halted: 0 }, ask: async ( prompt, options ) => {
    seen.push( { prompt, tag: options.tag } );
    if ( options.tag === 'pick f1' ) {
        return { text: '1' };
    }
    if ( options.tag === 'pick f3' ) {
        return { text: '2' };
    }
    if ( options.tag === 'pick f4' ) {
        return { text: '0' };
    }
    return { text: 'f2: Projektleiter [p1]' };
} };
await fillJob( job, model );
const by = ( id ) => job.fields.find( ( f ) => f.id === id );
check( seen.filter( ( s ) => s.tag.startsWith( 'pick ' ) ).length === 3 && seen.filter( ( s ) => s.tag.startsWith( 'fill ' ) ).every( ( s ) => !/- f[134]:/.test( s.prompt ) && /- f2:/.test( s.prompt ) ),
    'a field with values is asked alone, with its list; the bundle holds the others only' );
check( by( 'f1' ).value === 'Büro' && by( 'f1' ).source.how === 'literal' && by( 'f1' ).source.approve === false && by( 'f1' ).source.quote === 'Büro',
    'an entry whose words stand in what was said is literal and asks for no look' );
check( by( 'f3' ).value === 'Mittleres Kader' && by( 'f3' ).source.how === 'chosen' && by( 'f3' ).source.approve === true,
    'an entry the words of the dictation do not carry is chosen, and a person looks' );
check( by( 'f4' ).value === '' && !by( 'f4' ).source && by( 'f2' ).value === 'Projektleiter' && job.status === 'filled',
    'a field of which no value was said stays empty; a field without values is read as before' );
// "erledigt" holds the letters of "ledig" but not the word
const civil = { id: 'f9', label: 'Zivilstand', kind: 'text', page: 1, x: 0, y: 0, width: 10, height: 10, values: [ 'ledig', 'verheiratet' ] };
const unit = { id: 'q9', kind: 'single', page: 1, fields: [ 'f9' ], label: 'Zivilstand' };
const asked = { ...job, fields: [ civil ], dialogue: { units: [ unit ] } };
await fillUnit( asked, unit, [ { n: 2, text: 'Das ist erledigt.' } ], { ask: async () => ( { text: '1' } ) } );
check( civil.value === 'ledig' && civil.source.how === 'chosen', 'an entry counts as said only as a word of its own, not as letters inside another' );

// what else of what was said fits
const said = 'Ich arbeite als Projektleiter im Büro. Der Arbeitgeber ist die Aharitest AG.';
check( JSON.stringify( offered( 'Projektleiter\n- „Büro“\n3. Aharitest AG.\nWerkstatt', 'Projektleiter', said ) ) === JSON.stringify( [ 'Büro', 'Aharitest AG' ] ),
    'of the passages named, those are offered that stand in what was said and are not the value itself' );
check( offered( 'KEINE', 'x', said ).length === 0 && offered( 'a\nb\nc\nd\nBüro\nArbeitgeber\nAharitest\nProjektleiter im Büro', 'x', said ).length === 3,
    'none when the model names none, and never more than three' );
const hintJob = { ...job, fields: [ { id: 'f2', label: 'Arbeitsplatz', kind: 'text', value: 'Projektleiter' }, { ...place, value: 'Büro' } ] };
const vague = [ { field: 'f2', kind: 'vague', text: 'ist eine Funktion', requirement: 'Bezeichnung des Arbeitsplatzes' }, { field: 'f1', kind: 'vague', text: 'x', requirement: 'y' } ];
const hintAsks = [];
await suggest( hintJob, vague, [ { n: 1, text: said } ], { ask: async ( prompt ) => {
    hintAsks.push( prompt );
    return { text: 'Projektleiter\nBüro' };
} } );
check( hintAsks.length === 1 && hintAsks[ 0 ].includes( 'Verlangt ist: Bezeichnung des Arbeitsplatzes' ) && JSON.stringify( vague[ 0 ].suggestions ) === '["Büro"]'
    && !vague[ 1 ].suggestions && vague.every( ( h ) => !( 'requirement' in h ) ),
    'a value found wanting gets what else was said as suggestions; a field with values is not asked, and the hint keeps to the contract' );

// a person sets the list
const form = { ...job, blocks: [], fields: [
    { id: 'f1', label: 'Arbeitsplatz', kind: 'text', page: 1, x: 10, y: 10, width: 400, height: 40, value: 'Projektleiter', source: { how: 'literal', approve: false } },
    { id: 'f2', label: 'Beruf', kind: 'text', page: 1, x: 10, y: 80, width: 400, height: 40, values: [ 'a', 'b' ], value: 'a' },
    { id: 'f3', label: 'Ja', kind: 'text', page: 1, x: 10, y: 150, width: 40, height: 40, values: [ 'a' ] },
] };
const at = ( f, more ) => ( { id: f.id, page: 1, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.kind, ...more } );
applyEdit( form, { fields: [ at( form.fields[ 0 ], { values: ' Büro \nWerkstatt\n\nbüro\nLager' } ), at( form.fields[ 1 ], {} ), at( form.fields[ 2 ], { kind: 'checkbox', values: [ 'a' ] } ) ] } );
check( JSON.stringify( form.fields[ 0 ].values ) === '["Büro","Werkstatt","Lager"]' && form.fields[ 0 ].value === '' && !form.fields[ 0 ].source,
    'a list as typed, one value per line: each once, in its order; a value that is not on it is taken out of the field' );
check( JSON.stringify( form.fields[ 1 ].values ) === '["a","b"]' && form.fields[ 1 ].value === 'a' && !( 'values' in form.fields[ 2 ] ),
    'an edit that says nothing about the list leaves it; a tick mark carries none' );
applyEdit( form, { fields: [ at( form.fields[ 0 ], { values: [] } ), at( form.fields[ 1 ], {} ), at( form.fields[ 2 ], {} ) ] } );
check( !( 'values' in form.fields[ 0 ] ), 'an empty list takes the values away: the field takes anything again' );

// another language: the list is shown translated and stays the form's own
const french = { ...job, language: 'fr', fields: [ { ...place, value: 'Büro', source: { how: 'chosen', approve: true } }, { id: 'f2', label: 'Beruf', kind: 'text', page: 1, x: 0, y: 0, width: 10, height: 10, value: 'chef de projet' } ],
    dialogue: { units: [ { id: 'q1', kind: 'single', page: 1, fields: [ 'f1' ], label: 'Üblicher Arbeitsplatz' }, { id: 'q2', kind: 'single', page: 1, fields: [ 'f2' ], label: 'Beruf' } ] } };
const translation = await translateDialogue( french, 'fr', { ask: async ( prompt ) => {
    const lines = [ ...prompt.matchAll( /^(\d+): (.*)$/gm ) ].map( ( m ) => ( { nummer: Number( m[ 1 ] ), text: { 'Büro': 'bureau', 'Werkstatt': 'atelier', 'Lager': 'entrepôt', 'Üblicher Arbeitsplatz': 'Lieu de travail', 'Beruf': 'Profession' }[ m[ 2 ] ] } ) );
    return { text: JSON.stringify( { texte: lines.filter( ( l ) => l.text ) } ) };
} }, null );
check( JSON.stringify( translation.units.q1.values ) === JSON.stringify( { f1: [ 'bureau', 'atelier', 'entrepôt', 'Baustelle' ] } ) && translation.units.q1.label === 'Lieu de travail' && !translation.units.q2.values,
    'the values go into the language of the person with the labels; the list keeps its order, an entry that did not come back stands as the form has it' );
check( toTranslate( french ).map( ( f ) => f.id ).join() === 'f2', 'an entry of a list is in the language of the form already: only the free value is still to translate' );

process.exit( failed ? 1 : 0 );
