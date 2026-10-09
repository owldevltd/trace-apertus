import fs from 'node:fs/promises';
import path from 'node:path';
import { digits } from './numbers.js';
import { LANGUAGE, foreign } from '../language.js';
import { jobDir, saveJob, saveRun, record } from '../job.js';

// Transcription: every piece of the recording goes to the model as audio, with the wording the measurements
// were made with, the language said explicitly (without it the model translates and invents) and the names and
// words of the form as a dictionary (71 → 76 of 78 facts). Number words become digits afterwards; the raw
// answer is kept beside it.

// at most this many dictionary entries, the longest labels first
const WORDS = 40;

// the end of a dictionary entry in front of the echoed list counts as part of it from this many characters on
const ECHO_TAIL = 8;

export function prompt( language, words ) {
    let p = 'Transkribiere die Aufnahme wortwörtlich. Ausgangssprache ist ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ', bitte gib ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ' zurück.';
    if ( words.length ) {
        p += ' Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: ' + words.join( ', ' ) + '.';
    }
    return p;
}

// The dictionary of a job: the form's name and issuer and its field labels, short ones first dropped. Where the
// form has a dialogue, only the labels of what is asked: a note the geometry took for a field is no term.
// A person who answers in another language than the form's does not say its labels: no dictionary then.
export function dictionary( job ) {
    if ( foreign( job ) ) {
        return [];
    }
    const seen = new Set();
    const out = [];
    const skipped = new Set( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => u.skip ).flatMap( ( u ) => u.fields ) );
    for ( const w of [ job.form.name, job.form.issuer, ...job.fields.filter( ( f ) => !skipped.has( f.id ) ).map( ( f ) => f.label ) ] ) {
        const t = ( w || '' ).replace( /\s+/g, ' ' ).trim();
        if ( t.length > 2 && !seen.has( t.toLowerCase() ) ) {
            seen.add( t.toLowerCase() );
            out.push( t );
        }
    }
    return out.sort( ( a, b ) => b.length - a.length ).slice( 0, WORDS );
}

// Transcribes every piece of the job's recording that has no transcript yet. One call per piece.
export async function transcribeJob( job, client ) {
    const dir = jobDir( job.id );
    const state = { step: 'transcribe', page: 0, at: now(), error: null };
    await saveRun( job.id, state );
    try {
        const pieces = JSON.parse( await fs.readFile( path.join( dir, 'audio', 'pieces.json' ), 'utf8' ) );
        const words = dictionary( job );
        job.transcript = job.transcript || [];
        for ( const piece of pieces ) {
            if ( job.transcript.some( ( t ) => t.n === piece.n ) ) {
                continue;
            }
            await saveRun( job.id, Object.assign( state, { page: piece.n, at: now() } ) );
            job.transcript.push( await hear( job, piece, words, client ) );
            job.transcript.sort( ( a, b ) => a.n - b.n );
            await saveJob( job );
        }
        record( job, 'dictated', pieces.length + ' piece(s)' );
        await saveJob( job );
        state.step = 'done';
    } catch ( error ) {
        state.step = 'error';
        state.error = error.message;
    }
    await saveRun( job.id, Object.assign( state, { at: now() } ) );
    return job;
}

// The pieces of the recording said in reply to one question of the dialogue: transcribed like any piece, and
// each carries the unit it answers. numbers: the piece numbers; returns their transcript pieces.
export async function transcribeAnswer( job, numbers, question, client ) {
    const pieces = JSON.parse( await fs.readFile( path.join( jobDir( job.id ), 'audio', 'pieces.json' ), 'utf8' ) ).filter( ( p ) => numbers.includes( p.n ) );
    const words = dictionary( job );
    const said = [];
    for ( const piece of pieces ) {
        said.push( { ...( await hear( job, piece, words, client ) ), question } );
    }
    job.transcript = [ ...( job.transcript || [] ).filter( ( t ) => !numbers.includes( t.n ) ), ...said ].sort( ( a, b ) => a.n - b.n );
    return said;
}

// One piece as a transcript piece. One call.
async function hear( job, piece, words, client ) {
    const dir = jobDir( job.id );
    const bytes = await fs.readFile( path.join( dir, 'audio', piece.file ) );
    // the language that is spoken: the person's, where it is not the form's; number words are known in German only
    const spoken = foreign( job ) || job.form.language;
    const answer = await client.ask( prompt( spoken, words ), { audio: { bytes, format: piece.format }, room: 1500, log: path.join( dir, 'model' ), tag: 'audio #' + piece.n } );
    const raw = answer ? answer.text : '';
    const echo = echoAt( raw, words );
    const said = echo < 0 ? raw : raw.slice( 0, echo ).trim();
    return {
        n: piece.n,
        start: piece.start,
        text: foreign( job ) ? said : digits( said ),
        raw,
        // a person should listen: nothing came back, the prompt came back, or the answer was cut off
        approve: said === '' || echo >= 0 || !!( answer && answer.finish === 'length' ),
    };
}

// The model hands back the names and terms it was given: alone when there is nothing to hear, or behind what
// was said. Three entries of the dictionary in a row, in its order and with its commas, are the prompt and not
// a person; from there on the transcript is cut, together with the end of the entry before, which the model
// starts the list with as often as not. Returns where the list begins, or -1. Seen 9 October 2026: a tone
// without speech came back as the whole list and went into a field as a literal value, and a spoken sentence
// came back with the list behind it.
export function echoAt( raw, words ) {
    let at = -1;
    words.forEach( ( w, i ) => {
        const found = i + 2 < words.length ? raw.indexOf( [ w, words[ i + 1 ], words[ i + 2 ] ].join( ', ' ) ) : -1;
        if ( found < 0 || ( at >= 0 && found >= at ) ) {
            return;
        }
        at = found;
        const before = i > 0 ? words[ i - 1 ] : '';
        for ( let k = before.length; k >= ECHO_TAIL; k-- ) {
            if ( raw.slice( 0, found ).endsWith( before.slice( -k ) + ', ' ) ) {
                at = found - k - 2;
                break;
            }
        }
    } );
    return at;
}

function now() {
    return new Date().toISOString();
}
