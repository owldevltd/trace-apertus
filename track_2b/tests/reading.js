import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toRead, readElements } from '../src/read/reader.js';
import { layerElements } from '../src/read/layer.js';
import { createClient, rest } from '../src/model/client.js';

// What a page sends to the model to be read, and the pace of the queue, without a model: a tick mark that stands
// alone is not read, a row with marks and words is; the queue takes its breath after every tenth call, sends a
// call the service turned down once more after half a second, and sends nothing more when it is turned down
// again. A stand-in answers in the place of the service.
//
//   node tests/reading.js [--got=<analyzed dir>]

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const gotDir = ( process.argv.find( ( a ) => a.startsWith( '--got=' ) ) || '' ).slice( 6 );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};
const sameBox = ( a, b ) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
const el = ( type, x, y, width, height ) => ( { type, content: '', x, y, width, height } );

// a page as the geometry hands it on: a tick box alone in its column, listed twice; its words beside it; a row
// with two boxes and their words in one object
const page = {
    file: 'made-up', unit: 26,
    elements: [
        el( 'unknown', 100, 100, 300, 32 ),
        el( 'checkbox', 600, 100, 32, 32 ),
        el( 'unknown', 600, 100, 32, 32 ),
        el( 'checkbox', 100, 200, 32, 32 ),
        el( 'checkbox', 400, 200, 32, 32 ),
        el( 'unknown', 100, 200, 600, 32 ),
    ],
};
const tasks = toRead( page );
check( tasks.length === 3 && !tasks.some( ( t ) => t.i === 2 ), 'a tick box that stands alone is not sent to be read: its box is the mark, listed a second time' );
check( tasks.some( ( t ) => t.i === 0 ) && tasks.filter( ( t ) => t.i === 5 ).length === 2, 'the words beside it are read, and a row with two boxes is read mark by mark' );

// reading with a stand-in: one call per task, and the box alone stays what it was
const asked = [];
const standIn = { state: {}, ask: async ( prompt, options ) => {
    asked.push( options.tag );
    return { text: '{"bildanteile": false, "text": "Wort"}', http: 200, usage: null, finish: 'stop' };
} };
const cache = path.join( root, 'storage', 'tests', 'reading' );
fs.rmSync( cache, { recursive: true, force: true } );
const { elements, calls } = await readElements( page, Object.fromEntries( tasks.map( ( t ) => [ t.key, new Uint8Array( 1 ) ] ) ), standIn, cache );
check( calls === 3 && asked.length === 3 && elements[ 2 ].type === 'unknown' && elements[ 2 ].content === '' && elements.filter( ( e ) => e.type === 'text' ).length === 3,
    'reading makes a call per task; the box alone comes back as it was, without a call' );
const layered = layerElements( page, [ { t: 'Wort', line: 1, x: 110, ink: { x: 110, y: 105, w: 60, h: 20 } } ] );
check( layered[ 0 ].content === 'Wort' && layered[ 2 ].type === 'unknown' && layered.length === 7, 'read from a text layer the same tasks hold' );

// what the model says about a short word, and an answer with a broken escape
const said = {
    0: '{"bildanteile": true, "text": "PLZ"}',
    '5-0': '{"bildanteile": false, "text": "Ich w\\u00fünsche eine \\u00dcbersicht"}',
    '5-1': '{"bildanteile": true, "text": ""}',
};
const answering = { state: {}, ask: async ( prompt, options ) => ( { text: said[ options.tag.split( ' #' )[ 1 ] ], http: 200, usage: null, finish: 'stop' } ) };
fs.rmSync( cache, { recursive: true, force: true } );
const heard = ( await readElements( page, Object.fromEntries( tasks.map( ( t ) => [ t.key, new Uint8Array( 1 ) ] ) ), answering, cache ) ).elements;
check( heard[ 0 ].type === 'text' && heard[ 0 ].content === 'PLZ', 'a crop one line high in which the model read a word is a text, whatever it says about picture parts' );
check( heard[ 5 ].type === 'text' && heard[ 5 ].content === 'Ich wünsche eine Übersicht', 'an answer that is no JSON because of one bad escape is read all the same' );

// on the pages of the shipped forms, as the geometry analysed them
if ( gotDir ) {
    let pages = 0;
    let boxes = 0;
    let alone = 0;
    let sent = 0;
    for ( const f of fs.readdirSync( gotDir ).filter( ( f ) => /-s\d+\.json$/.test( f ) ) ) {
        const p = JSON.parse( fs.readFileSync( path.join( gotDir, f ), 'utf8' ) );
        const marks = p.elements.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' );
        pages++;
        boxes += marks.length;
        alone += p.elements.filter( ( e ) => e.type === 'unknown' && marks.some( ( m ) => sameBox( m, e ) ) ).length;
        sent += toRead( p ).filter( ( t ) => t.part === undefined && marks.some( ( m ) => sameBox( m, p.elements[ t.i ] ) ) ).length;
    }
    check( pages > 0 && sent === 0, 'on the ' + pages + ' pages of the shipped forms ' + alone + ' of ' + boxes + ' tick marks are listed a second time as unknown; none of them is sent to be read' );
}

// the pace of the queue
const waits = Array.from( { length: 81 }, ( _, calls ) => rest( calls ) );
check( waits[ 0 ] === 0 && waits.slice( 1, 10 ).every( ( w ) => w === 0 ) && waits[ 10 ] === 500 && waits[ 11 ] === 0 && waits[ 40 ] === 500
    && waits.reduce( ( a, w ) => a + w, 0 ) === 4000, 'the queue sends ten calls one after the other and then waits half a second: four seconds of waiting in eighty calls' );

// a call the service turns down: half a second, then the same call once more
const real = globalThis.fetch;
const answer = ( status ) => status === 200
    ? { status, json: async () => ( { choices: [ { message: { content: 'ok' }, finish_reason: 'stop' } ] } ), text: async () => '' }
    : { status, json: async () => ( {} ), text: async () => '' };
let script = [];
let sentCalls = 0;
const times = [];
globalThis.fetch = async () => {
    times.push( Date.now() );
    return answer( script[ sentCalls++ ] ?? 200 );
};
const made = { apiKey: 'made-up', baseUrl: 'http://localhost:9', model: 'none' };
let client = createClient( made );
script = [ 200, 403, 200, 200 ];
let answers = [];
for ( let i = 0; i < 3; i++ ) {
    answers.push( await client.ask( 'x' ) );
}
check( answers.every( ( a ) => a?.text === 'ok' ) && sentCalls === 4 && times[ 2 ] - times[ 1 ] >= 480 && times[ 3 ] - times[ 2 ] < 400 && client.state.halted === 0,
    'a call answered with a 403 is sent once more after half a second; answered then, the queue goes on as before' );
client = createClient( made );
script = [ 400, 400, 200 ];
sentCalls = 0;
answers = [ await client.ask( 'x' ), await client.ask( 'x' ) ];
check( answers[ 0 ] === null && answers[ 1 ]?.text === 'ok' && sentCalls === 3 && client.state.halted === 0, 'a call that is wrong twice has no answer and halts nothing' );
client = createClient( made );
script = [ 200, 429, 429, 200 ];
sentCalls = 0;
answers = [];
for ( let i = 0; i < 4; i++ ) {
    answers.push( await client.ask( 'x' ) );
}
globalThis.fetch = real;
check( answers[ 0 ]?.text === 'ok' && answers.slice( 1 ).every( ( a ) => a === null ) && sentCalls === 3 && client.state.halted === 429,
    'turned down twice in a row with a 403 or 429, the queue is halted: the calls behind it are not sent' );

process.exit( failed ? 1 : 0 );
