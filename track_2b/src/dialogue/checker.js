import { listing } from './listing.js';
import { INTRO, parse } from './writer.js';

// The check of the written questions: the model gets the questions of a page without their ids, mixed, twelve
// at a time, with the list of the page, and names the place each one belongs to. A question holds when every
// run names its own unit. Measured 9 October 2026 by handing every place the question of its neighbour: such a
// question slips through in 10 of 458 cases with two runs; one run lets 28 of 496 through, two 16, three 14,
// four 14, and every further run costs ten questions that hold. The small model checks no worse than the large
// one on the same questions (8 slips of 474 against 12). The check sees a question at the wrong place; it
// does not see a question that points at the right place and is worded badly.

export const RUNS = 2;
export const BUNDLE = 12;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// room for the answer: tokens per question and a base
const ROOM = [ 40, 300 ];

export function prompt( text, lettered ) {
    return INTRO + '\n\n-----\n' + text + '\n-----\n\n'
        + 'Jemand stellt im Gespräch diese Fragen. Jede gehört zu genau einer Kennung auf dieser Seite:\n' + lettered.map( ( x ) => x.letter + ': ' + x.question ).join( '\n' ) + '\n\n'
        + 'Schreibe zu jeder Frage die Kennung der Stelle, an der die Antwort eingetragen wird. '
        + 'Antworte nur als JSON, ohne weiteren Text: {"zuordnung": [{"frage": "A", "kennung": "q1"}]}';
}

// The same mixing for the same seed, so a run can be read back: a small generator instead of Math.random.
export function shuffle( list, seed ) {
    let s = [ ...seed ].reduce( ( a, c ) => ( a * 31 + c.charCodeAt( 0 ) ) >>> 0, 7 );
    const out = [ ...list ];
    for ( let i = out.length - 1; i > 0; i-- ) {
        s = ( s * 1664525 + 1013904223 ) >>> 0;
        const j = s % ( i + 1 );
        [ out[ i ], out[ j ] ] = [ out[ j ], out[ i ] ];
    }
    return out;
}

// Returns { unit id: [ the unit named in run 1, in run 2, … ] }; null where a run gave no line for the question.
export async function checkQuestions( job, units, written, client, log, runs = RUNS ) {
    const asked = units.filter( ( u ) => written[ u.id ] );
    const said = Object.fromEntries( asked.map( ( u ) => [ u.id, [] ] ) );
    for ( let r = 0; r < runs; r++ ) {
        const got = {};
        for ( const page of job.pages ) {
            const here = shuffle( asked.filter( ( u ) => u.page === page.n ), 'run ' + r + ' page ' + page.n );
            const text = here.length ? listing( job, units, page.n ) : '';
            for ( let i = 0; i < here.length; i += BUNDLE ) {
                const lettered = here.slice( i, i + BUNDLE ).map( ( u, k ) => ( { letter: LETTERS[ k ], unit: u.id, question: written[ u.id ] } ) );
                const answer = await client.ask( prompt( text, lettered ), { room: ROOM[ 0 ] * lettered.length + ROOM[ 1 ], log, tag: 'check run ' + ( r + 1 ) + ' page ' + page.n } );
                for ( const e of parse( answer ? answer.text : '', 'zuordnung', 'frage', 'kennung' ) ) {
                    const x = lettered.find( ( l ) => l.letter === String( e.frage || '' ).trim().toUpperCase() );
                    if ( x && got[ x.unit ] === undefined ) {
                        got[ x.unit ] = ( String( e.kennung || '' ).match( /q\d+/ ) || [ null ] )[ 0 ];
                    }
                }
            }
        }
        asked.forEach( ( u ) => said[ u.id ].push( got[ u.id ] ?? null ) );
    }
    return said;
}
