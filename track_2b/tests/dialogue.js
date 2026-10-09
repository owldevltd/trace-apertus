import fs from 'node:fs/promises';
import path from 'node:path';
import { loadShipped } from './shipped.js';
import { buildUnits } from '../src/dialogue/units.js';
import { listing } from '../src/dialogue/listing.js';
import { buildDialogue } from '../src/dialogue/dialogue.js';
import { fillJob, fillUnit } from '../src/fields/filler.js';
import { saveJob, jobDir } from '../src/job.js';
import { judgeEnough } from '../src/review/hints.js';
import { createGate } from '../src/app/js/capture/recorder.js';
import { dictionary, echoAt } from '../src/speech/transcriber.js';

// The dialogue of the shipped forms without a model: the units the code builds from the fields, the list of
// lines the model would read, and the rule that decides which written question holds. For the rule a stand-in
// answers instead of the model, with answers chosen to hit every case: a place with nothing to ask, two places
// asked with the same words, a question the check assigns elsewhere in one run. The same way for an answer: it
// goes into the fields of its unit whatever name the model puts on the line, and into no other field. The order
// of the conversation is held against the order of the form fields in the PDF, the only order a form states.
//
//   node tests/dialogue.js --got=<analyzed dir> [--out=<file.md>] <form dir> [<form dir> …]

const dirs = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const gotDir = ( process.argv.find( ( a ) => a.startsWith( '--got=' ) ) || '' ).slice( 6 );
const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !dirs.length || !gotDir ) {
    console.log( 'usage: node tests/dialogue.js --got=<analyzed dir> [--out=<file.md>] <form dir> [<form dir> …]' );
    process.exit( 1 );
}

// the units against the contract: its keys, its required keys, its kinds
const contract = JSON.parse( await fs.readFile( new URL( '../data/schema/trace.json', import.meta.url ), 'utf8' ) ).properties.dialogue.properties.units.items;
const fits = ( u ) => Object.keys( u ).every( ( k ) => k in contract.properties ) && contract.required.every( ( k ) => u[ k ] !== undefined ) && contract.properties.kind.enum.includes( u.kind );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};

// Answers like the model: a question per id of the list, and for the check the unit each question was written
// for. The first five asked units of the first page get the special cases.
function standIn( special ) {
    const owner = new Map();
    const seen = new Set();
    return {
        seen,
        ask: async ( prompt, options ) => {
            if ( options.tag.startsWith( 'questions' ) ) {
                const ids = [ ...new Set( [ ...prompt.split( '-----' )[ 1 ].matchAll( /\[(q\d+)[\]:]/g ) ].map( ( m ) => m[ 1 ] ) ) ];
                ids.forEach( ( id ) => seen.add( id ) );
                const fragen = ids.map( ( id ) => {
                    const frage = id === special[ 0 ] ? 'KEINE'
                        : id === special[ 1 ] || id === special[ 2 ] ? 'Wie heisst die Person?'
                        : id === special[ 4 ] ? 'Wie groß ist der Schaden bei ' + id + '?'
                        : 'Was gehört zu ' + id + '?';
                    owner.set( frage.replace( /ß/g, 'ss' ), id );
                    return { kennung: id, frage };
                } );
                return { text: JSON.stringify( { fragen } ) };
            }
            const second = options.tag.startsWith( 'check run 2' );
            const zuordnung = [ ...prompt.split( '-----' )[ 2 ].matchAll( /^([A-Z]): (.+)$/gm ) ].map( ( m ) => {
                const id = owner.get( m[ 2 ] );
                // one question is assigned to another place in the second run
                return { frage: m[ 1 ], kennung: second && id === special[ 3 ] ? special[ 0 ] : id };
            } );
            return { text: '```json\n' + JSON.stringify( { zuordnung } ) + '\n```' };
        },
    };
}

// in a conversation an answer ends at the first pause after speech; the gate hears the level in blocks of 100 ms
const gate = createGate( 1500 );
const hear = ( loud, ms ) => Array.from( { length: ms / 100 }, () => gate.hear( loud, 100 ) ).filter( Boolean ).length;
check( hear( false, 5000 ) === 0 && hear( true, 2000 ) === 0 && hear( false, 1400 ) === 0 && hear( true, 500 ) === 0 && hear( false, 1500 ) === 1 && hear( false, 3000 ) === 0,
    'an answer ends once, at the first pause of 1.5 s after speech; a shorter pause or silence alone ends nothing' );
check( hear( true, 200 ) === 0 && hear( false, 2000 ) === 0 && hear( true, 1000 ) === 0 && hear( false, 1500 ) === 1, 'a crackle before a pause is no answer, and is forgotten' );

let rows = '';
const sum = { fields: 0, units: 0, single: 0, choice: 0, marks: 0, table: 0, cells: 0, skip: 0, bare: 0, pairs: 0, inOrder: 0 };
for ( const dir of dirs ) {
    if ( !( await fs.stat( dir ) ).isDirectory() ) {
        continue;
    }
    const job = await loadShipped( dir, gotDir );
    const units = buildUnits( job );
    const byId = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );

    // every field except the signature in exactly one unit
    const times = new Map();
    units.forEach( ( u ) => u.fields.forEach( ( id ) => times.set( id, ( times.get( id ) || 0 ) + 1 ) ) );
    const asked = job.fields.filter( ( f ) => f.kind !== 'signature' );
    check( asked.every( ( f ) => times.get( f.id ) === 1 ) && job.fields.filter( ( f ) => f.kind === 'signature' ).every( ( f ) => !times.has( f.id ) ),
        job.id + ': every field except the signature is in exactly one unit (' + asked.length + ' fields, ' + units.length + ' units)' );
    check( units.every( ( u, i ) => u.id === 'q' + ( i + 1 ) && ( i === 0 || units[ i - 1 ].page <= u.page ) ), job.id + ': units are numbered in the order of the pages' );

    // the list: every text of the page a line, every asked unit named, no unit that is not asked
    let lines = 0;
    let texts = 0;
    let named = true;
    for ( const page of job.pages ) {
        const text = listing( job, units, page.n );
        const have = new Set( text.split( '\n' ).map( ( l ) => l.replace( /\s+→ \[q\d.*$/, '' ) ) );
        for ( const b of job.blocks.filter( ( x ) => x.page === page.n && x.type === 'text' && x.content ) ) {
            texts++;
            lines += have.has( b.content.replace( /\s+/g, ' ' ).trim() ) ? 1 : 0;
        }
        for ( const u of units.filter( ( x ) => x.page === page.n ) ) {
            named = named && text.includes( '[' + u.id + ']' ) + text.includes( '[' + u.id + ':' ) === ( u.skip ? 0 : 1 );
        }
    }
    check( lines === texts, job.id + ': every text block is a line of the list (' + lines + ' of ' + texts + ')' );
    check( named, job.id + ': the list names every unit that is asked and no other' );

    // the order of the conversation against the order of the form fields in the PDF
    let pairs = 0;
    let inOrder = 0;
    job.pages.forEach( ( page, i ) => {
        const seq = units.filter( ( u ) => u.page === page.n ).map( ( u ) => job.widgets[ i ].indexOf( u.fields.map( ( id ) => byId.get( id ).widget ).find( Boolean ) ) ).filter( ( k ) => k >= 0 );
        pairs += Math.max( 0, seq.length - 1 );
        inOrder += seq.filter( ( k, j ) => j > 0 && seq[ j - 1 ] < k ).length;
    } );

    // the rule, with a stand-in for the model
    const first = units.filter( ( u ) => u.page === 1 && !u.skip ).slice( 0, 5 ).map( ( u ) => u.id );
    const client = standIn( first );
    const { dialogue } = await buildDialogue( job, client, null );
    const got = new Map( dialogue.units.map( ( u ) => [ u.id, u.question ] ) );
    const open = dialogue.units.filter( ( u ) => !u.skip && !first.slice( 0, 4 ).includes( u.id ) );
    check( dialogue.units.every( fits ), job.id + ': the units have the keys and kinds of the contract' );
    check( dialogue.units.filter( ( u ) => u.skip ).every( ( u ) => !client.seen.has( u.id ) && !u.question ), job.id + ': a unit that is not asked never reaches the model' );
    check( open.every( ( u ) => u.question ), job.id + ': a question every run assigns to its own unit holds (' + open.length + ')' );
    check( first.length === 5 && !got.get( first[ 0 ] ), job.id + ': "KEINE" leaves the printed label' );
    check( first.length === 5 && !got.get( first[ 1 ] ) && !got.get( first[ 2 ] ), job.id + ': two units asked with the same words both keep the label' );
    check( first.length === 5 && !got.get( first[ 3 ] ), job.id + ': a question one run assigns elsewhere does not hold' );
    check( first.length === 5 && /gross/.test( got.get( first[ 4 ] ) || '' ), job.id + ': ß becomes ss' );

    // an answer stays in its unit: a single field takes the line whatever it is named; of a choice only the
    // option named by its id is ticked, and a line for a field of another unit is dropped
    const mark = ( id ) => [ 'checkbox', 'radio' ].includes( byId.get( id ).kind );
    const single = dialogue.units.find( ( u ) => !u.skip && u.fields.length === 1 && !mark( u.fields[ 0 ] ) );
    const several = dialogue.units.find( ( u ) => !u.skip && u.kind === 'choice' );
    const foreign = job.fields.find( ( f ) => !single.fields.includes( f.id ) && !several.fields.includes( f.id ) );
    const says = ( text ) => ( { ask: async () => ( { text } ) } );
    await fillUnit( job, single, [ { n: 7, text: 'Chur, Poststrasse 1' } ], says( 'Ort und Strasse: Chur, Poststrasse 1 [p7]' ) );
    await fillUnit( job, several, [ { n: 8, text: 'das zweite' } ], says( several.fields[ 1 ] + ': ja [p8]\n' + several.fields[ 0 ] + ': nein [p8]\n' + foreign.id + ': Fremdwert [p8]' ) );
    const one = byId.get( single.fields[ 0 ] );
    check( one.value === 'Chur, Poststrasse 1' && one.source.how === 'literal' && one.source.piece === 7, job.id + ': the answer to a single field is its value, whatever name the line carries' );
    check( byId.get( several.fields[ 1 ] ).value === 'x' && !byId.get( several.fields[ 0 ] ).value && !foreign.value, job.id + ': an answer reaches the fields of its unit only' );

    // is the answer enough: only a plain yes clears it; what the model says is missing becomes the hint
    const plainly = dialogue.units.find( ( u ) => u.question && u.fields.length === 1 && !mark( u.fields[ 0 ] ) );
    const judge = ( text ) => judgeEnough( job, plainly, byId.get( plainly.fields[ 0 ] ), 'Chur', says( text ) );
    const lacking = await judge( '{"urteil": "unvollständig", "fehlt": "die Strasse"}' );
    check( ( await judge( '{"urteil": "ja", "fehlt": ""}' ) ) === null && ( await judge( 'keine Ahnung' ) ) === null && lacking?.kind === 'incomplete' && lacking.field === plainly.fields[ 0 ] && lacking.text === 'die Strasse',
        job.id + ': an answer the model finds incomplete gets a hint that says what is missing' );

    // saying the rest at once leaves alone what was answered on its own: the unit something was said in reply
    // to, and the field a person typed into; a field nobody answered is filled from the dictation
    const typed = dialogue.units.find( ( u ) => !u.skip && u !== single && u.fields.length === 1 && !mark( u.fields[ 0 ] ) );
    const rest = dialogue.units.find( ( u ) => !u.skip && u !== single && u !== typed && u.fields.length === 1 && !mark( u.fields[ 0 ] ) );
    const whole = { ...job, id: 'tests/dialogue-' + job.id, dialogue, history: [], transcript: [ { n: 7, text: 'Chur, Poststrasse 1', question: single.id }, { n: 9, text: 'und sonst noch Bern' } ] };
    Object.assign( byId.get( typed.fields[ 0 ] ), { value: 'getippt', source: { how: 'entered', approve: false } } );
    await saveJob( whole );
    await fillJob( whole, says( job.fields.map( ( f ) => f.id + ': Bern [p9]' ).join( '\n' ) ) );
    await fs.rm( jobDir( whole.id ), { recursive: true, force: true } );
    check( one.value === 'Chur, Poststrasse 1' && byId.get( typed.fields[ 0 ] ).value === 'getippt' && byId.get( rest.fields[ 0 ] ).value === 'Bern' && whole.status === 'filled',
        job.id + ': saying the rest at once keeps what was answered question by question' );

    // the model hands back the dictionary of its prompt, alone or behind what was said: the transcript is cut
    // where the list begins, with the end of the entry before it; naming words of the list is no echo
    const words = dictionary( { ...job, dialogue } );
    const list = words.slice( 2, 6 ).join( ', ' ) + '.';
    const spoken = 'Sie ist am Morgen gestürzt.';
    check( echoAt( list, words ) === 0 && echoAt( spoken + ' ' + words[ 1 ].slice( -12 ) + ', ' + list, words ) === spoken.length + 1
        && echoAt( words[ 0 ] + ' und dann ' + words[ 3 ] + ', ' + words[ 1 ], words ) === -1,
        job.id + ': the dictionary of the prompt is cut off a transcript, what was said before it stays' );
    check( dialogue.units.filter( ( u ) => u.skip && u.label ).every( ( u ) => !words.includes( u.label ) ), job.id + ': the dictionary holds no label of a place that is not asked' );

    const count = ( kind ) => units.filter( ( u ) => u.kind === kind );
    const marks = count( 'choice' ).reduce( ( a, u ) => a + u.fields.length, 0 );
    const cells = count( 'table' ).reduce( ( a, u ) => a + u.fields.length, 0 );
    const bare = units.filter( ( u ) => !u.skip && !u.label ).length;
    rows += '| ' + job.id + ' | ' + job.pages.length + ' | ' + asked.length + ' | ' + units.length + ' | ' + count( 'single' ).length + ' | ' + count( 'choice' ).length + ' (' + marks + ') | '
        + count( 'table' ).length + ' (' + cells + ') | ' + units.filter( ( u ) => u.skip ).length + ' | ' + bare + ' | ' + ( pairs ? inOrder + ' of ' + pairs : '–' ) + ' |\n';
    sum.fields += asked.length;
    sum.units += units.length;
    sum.single += count( 'single' ).length;
    sum.choice += count( 'choice' ).length;
    sum.marks += marks;
    sum.table += count( 'table' ).length;
    sum.cells += cells;
    sum.skip += units.filter( ( u ) => u.skip ).length;
    sum.bare += bare;
    sum.pairs += pairs;
    sum.inOrder += inOrder;
    // the list itself, to read
    if ( outFile ) {
        const text = job.pages.map( ( p ) => listing( job, units, p.n ) ).join( '\n\n' );
        await fs.mkdir( path.dirname( outFile ), { recursive: true } );
        await fs.writeFile( outFile.replace( /\.md$/, '' ) + '-' + job.id + '.txt', text + '\n' );
    }
}

const md = '# Dialogue: units and the list of lines\n\n'
    + 'Generated by `tests/dialogue.js` on ' + new Date().toISOString().slice( 0, 10 ) + ', without a model. The text layer stands in for the reading. '
    + 'In order = neighbouring units of a page stand in the order of their form fields in the PDF; a printed form states no order.\n\n'
    + '| form | pages | fields | units | single | choices (tick marks) | tables (cells) | not asked | asked, without a label | in order |\n|---|---:|---:|---:|---:|---|---|---:|---:|---|\n'
    + rows
    + '| all | | ' + sum.fields + ' | ' + sum.units + ' | ' + sum.single + ' | ' + sum.choice + ' (' + sum.marks + ') | ' + sum.table + ' (' + sum.cells + ') | ' + sum.skip + ' | ' + sum.bare + ' | ' + sum.inOrder + ' of ' + sum.pairs + ' |\n';
console.log( '\n' + md );
if ( outFile ) {
    await fs.writeFile( outFile, md );
    console.log( 'written ' + outFile );
}
process.exit( failed ? 1 : 0 );
