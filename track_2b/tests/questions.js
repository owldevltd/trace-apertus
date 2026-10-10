import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';
import { createClient } from '../src/model/client.js';
import { buildDialogue } from '../src/dialogue/dialogue.js';
import { shuffle } from '../src/dialogue/checker.js';
import { loadShipped } from './shipped.js';

// The dialogue of the shipped forms with the model: the small model writes a question per unit and checks it
// twice, as the pipeline does for a captured form. No reference names the right question, so the check itself is
// measured with errors put in on purpose: every place is handed the question of its neighbour, or of another
// place of the page, and counted is how often the check would have let that through. Needs LLM_API_KEY; a call per
// page to write and two per twelve questions to check, 47 calls on the four forms, one after the other.
//
//   node tests/questions.js --got=<analyzed dir> [--out=<file.md>] <form dir> [<form dir> …]

const dirs = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const gotDir = ( process.argv.find( ( a ) => a.startsWith( '--got=' ) ) || '' ).slice( 6 );
const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !dirs.length || !gotDir ) {
    console.log( 'usage: node tests/questions.js --got=<analyzed dir> [--out=<file.md>] <form dir> [<form dir> …]' );
    process.exit( 1 );
}
if ( !config.apiKey ) {
    console.log( 'no LLM_API_KEY: nothing to measure' );
    process.exit( 1 );
}

// how many times the places of a page are mixed for the question of another place
const MIXES = 20;
// every how many units one is shown to read, and the first
const SAMPLE = [ 20, 7 ];

const plain = ( t ) => t.toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
const client = createClient( config );
const log = outFile ? path.join( path.dirname( outFile ), 'dialogue-model' ) : null;

// the client, counting what a form costs
function counted( cost ) {
    return {
        ask: async ( prompt, options ) => {
            const started = Date.now();
            const answer = await client.ask( prompt, options );
            cost.calls++;
            cost.seconds += ( Date.now() - started ) / 1000;
            cost.in += answer?.usage?.prompt_tokens || 0;
            cost.out += answer?.usage?.completion_tokens || 0;
            return answer;
        },
    };
}

const sum = { units: 0, skip: 0, written: 0, agreed: 0, alike: 0, hold: 0, near: 0, nearAll: 0, nearAlike: 0, far: 0, farAll: 0, calls: 0, seconds: 0, in: 0, out: 0 };
let rows = '';
let costs = '';
let sample = '';
let seen = 0;
for ( const dir of dirs ) {
    if ( !( await fs.stat( dir ) ).isDirectory() ) {
        continue;
    }
    const job = await loadShipped( dir, gotDir );
    const cost = { calls: 0, seconds: 0, in: 0, out: 0 };
    const { dialogue, written, said } = await buildDialogue( job, counted( cost ), log );
    if ( client.state.halted ) {
        console.log( 'halted by HTTP ' + client.state.halted );
        process.exit( 1 );
    }
    const units = dialogue.units;
    const asked = units.filter( ( u ) => written[ u.id ] );
    // the place every run names for the question of a unit, when they name the same
    const named = ( u ) => ( said[ u.id ] && said[ u.id ].every( ( s ) => s && s === said[ u.id ][ 0 ] ) ? said[ u.id ][ 0 ] : null );
    const count = {};
    asked.forEach( ( u ) => {
        count[ u.page + ' ' + plain( written[ u.id ] ) ] = ( count[ u.page + ' ' + plain( written[ u.id ] ) ] || 0 ) + 1;
    } );
    const p = {
        units: units.length,
        skip: units.filter( ( u ) => u.skip ).length,
        written: asked.length,
        agreed: asked.filter( ( u ) => named( u ) === u.id ).length,
        alike: asked.filter( ( u ) => count[ u.page + ' ' + plain( written[ u.id ] ) ] > 1 ).length,
        hold: units.filter( ( u ) => u.question ).length,
        near: 0, nearAll: 0, nearAlike: 0, far: 0, farAll: 0,
    };
    for ( const page of job.pages ) {
        const here = asked.filter( ( u ) => u.page === page.n );
        here.forEach( ( u, i ) => {
            // the question of the place before and of the place after
            for ( const j of [ i - 1, i + 1 ] ) {
                if ( j >= 0 && j < here.length ) {
                    p.nearAll++;
                    if ( named( here[ j ] ) === u.id ) {
                        p.near++;
                        p.nearAlike += plain( written[ here[ j ].id ] ) === plain( written[ u.id ] ) ? 1 : 0;
                    }
                }
            }
        } );
        for ( let k = 0; k < MIXES; k++ ) {
            const mixed = shuffle( here, job.id + ' mix ' + k + ' page ' + page.n );
            here.forEach( ( u, i ) => {
                if ( mixed[ i ] !== u ) {
                    p.farAll++;
                    p.far += named( mixed[ i ] ) === u.id ? 1 : 0;
                }
            } );
        }
    }
    rows += '| ' + job.id + ' | ' + p.units + ' | ' + p.skip + ' | ' + p.written + ' | ' + p.agreed + ' | ' + p.alike + ' | **' + p.hold + '** | ' + ( p.units - p.skip - p.hold ) + ' | '
        + p.near + ' of ' + p.nearAll + ' | ' + p.nearAlike + ' | ' + p.far + ' of ' + p.farAll + ' |\n';
    costs += '| ' + job.id + ' | ' + job.pages.length + ' | ' + cost.calls + ' | ' + Math.round( cost.seconds ) + ' | ' + cost.in + ' / ' + cost.out + ' |\n';
    for ( const key of Object.keys( p ) ) {
        sum[ key ] += p[ key ];
    }
    for ( const key of Object.keys( cost ) ) {
        sum[ key ] += cost[ key ];
    }
    for ( const u of units ) {
        if ( ++seen % SAMPLE[ 0 ] === SAMPLE[ 1 ] ) {
            sample += '| ' + job.id + ' ' + u.id + ' | ' + ( u.label || '–' ).replace( /\|/g, '/' ) + ' | ' + ( u.skip ? 'not asked' : ( written[ u.id ] || 'none written' ).replace( /\|/g, '/' ) ) + ' | ' + ( u.question ? 'yes' : '' ) + ' |\n';
        }
    }
    console.log( job.id + ': ' + p.units + ' units, ' + p.written + ' questions written, ' + p.hold + ' hold, ' + cost.calls + ' calls, ' + Math.round( cost.seconds ) + ' s' );
}

const pct = ( a, b ) => ( 100 * a / Math.max( 1, b ) ).toFixed( 1 ) + ' %';
const md = '# Dialogue: the questions of the shipped forms\n\n'
    + 'Generated by `tests/questions.js` on ' + new Date().toISOString().slice( 0, 10 ) + ' with ' + config.model + ' at temperature 0, ' + sum.calls + ' calls. '
    + 'The text layer stands in for the reading. A question holds when both runs of the check name its own unit and no other unit of the page is asked with the same words; '
    + 'a unit without one keeps its printed label.\n\n'
    + '| form | units | not asked | questions written | both runs name the unit | worded like another on the page | hold | keep the label | neighbour\'s question let through | of these worded alike | another place\'s question let through |\n'
    + '|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---|\n' + rows
    + '| all | ' + sum.units + ' | ' + sum.skip + ' | ' + sum.written + ' | ' + sum.agreed + ' | ' + sum.alike + ' | **' + sum.hold + '** | ' + ( sum.units - sum.skip - sum.hold ) + ' | '
    + sum.near + ' of ' + sum.nearAll + ' (' + pct( sum.near, sum.nearAll ) + ') | ' + sum.nearAlike + ' | ' + sum.far + ' of ' + sum.farAll + ' (' + pct( sum.far, sum.farAll ) + ') |\n\n'
    + 'Let through: a place is handed the question written for its neighbour in the list (before and after), or for another place of the page (' + MIXES + ' mixings), '
    + 'and both runs of the check had named that place for it. Worded alike: the two questions are the same words, so no error in the wording; the rule on equal wording drops both.\n\n'
    + '## What a form costs\n\n| form | pages | calls | seconds at the model | tokens in / out |\n|---|---:|---:|---:|---|\n' + costs
    + '| all | | ' + sum.calls + ' | ' + Math.round( sum.seconds ) + ' | ' + sum.in + ' / ' + sum.out + ' |\n\n'
    + 'Without the pause of two seconds between calls.\n\n'
    + '## To read: every ' + SAMPLE[ 0 ] + 'th unit, from the ' + SAMPLE[ 1 ] + 'th\n\n| unit | printed label | written question | holds |\n|---|---|---|---|\n' + sample;
console.log( '\n' + md );
if ( outFile ) {
    await fs.mkdir( path.dirname( outFile ), { recursive: true } );
    await fs.writeFile( outFile, md );
    console.log( 'written ' + outFile );
}
