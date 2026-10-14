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

// the words the dictionary is introduced with in the prompt
const LIST = 'Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können';

export function prompt( language, words ) {
    let p = 'Transkribiere die Aufnahme wortwörtlich. Ausgangssprache ist ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ', bitte gib ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ' zurück.';
    if ( words.length ) {
        p += ' ' + LIST + ': ' + words.join( ', ' ) + '.';
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
    // a label that says two things with a colon between them ("Kinderzulagen: CHF pro Monat", the row and the
    // column of a table cell) is two terms, each once: as whole labels the fifteen cells of one wage table
    // took fifteen of the forty places, the name of the form fell out, and a recording of four minutes came
    // back as one sentence repeated to the end (11 October 2026)
    const labels = job.fields.filter( ( f ) => !skipped.has( f.id ) ).flatMap( ( f ) => ( f.label || '' ).split( /:\s+/ ) );
    for ( const w of [ job.form.name, job.form.issuer, ...labels ] ) {
        const t = ( w || '' ).replace( /\s+/g, ' ' ).trim();
        if ( t.length > 2 && !seen.has( t.toLowerCase() ) ) {
            seen.add( t.toLowerCase() );
            out.push( t );
        }
    }
    return out.sort( ( a, b ) => b.length - a.length ).slice( 0, WORDS );
}

// What a run says when the model gave no answer for a piece of the recording: the app tells the person so in
// their language. The piece keeps its sound and has no transcript, so it is transcribed when asked again.
export const UNANSWERED = 'unanswered';

// Transcribes every piece of the job's recording that has no transcript yet. One call per piece, a second one
// where the first brought no answer.
export async function transcribeJob( job, client ) {
    const dir = jobDir( job.id );
    const state = { step: 'transcribe', page: 0, at: now(), error: null };
    await saveRun( job.id, state );
    try {
        const pieces = JSON.parse( await fs.readFile( path.join( dir, 'audio', 'pieces.json' ), 'utf8' ) );
        const words = dictionary( job );
        job.transcript = job.transcript || [];
        let unanswered = 0;
        for ( const piece of pieces ) {
            if ( job.transcript.some( ( t ) => t.n === piece.n ) ) {
                continue;
            }
            await saveRun( job.id, Object.assign( state, { page: piece.n, at: now() } ) );
            const heard = await hear( job, piece, words, client );
            if ( !heard ) {
                unanswered++;
                continue;
            }
            job.transcript.push( heard );
            job.transcript.sort( ( a, b ) => a.n - b.n );
            await saveJob( job );
        }
        if ( unanswered ) {
            throw new Error( UNANSWERED );
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
        const heard = await hear( job, piece, words, client );
        // no answer from the model: the piece is not taken for silence; the caller says so
        if ( heard ) {
            said.push( { ...heard, question } );
        }
    }
    job.transcript = [ ...( job.transcript || [] ).filter( ( t ) => !numbers.includes( t.n ) ), ...said ].sort( ( a, b ) => a.n - b.n );
    return said;
}

// One piece as a transcript piece, or null when the model gave no answer. One call; where it brings nothing back
// (the network, a timeout, an error of the service) one more, and no more than that. Not where access is halted
// by a 403 or 429. Seen 11 October 2026: a call for a recording of four minutes broke off after 86 seconds, the
// piece was kept as heard and empty, the filling said nothing was dictated, and there was no way to ask again.
async function hear( job, piece, words, client ) {
    const dir = jobDir( job.id );
    const bytes = await fs.readFile( path.join( dir, 'audio', piece.file ) );
    // the language that is spoken: the person's, where it is not the form's; its number words become digits
    const spoken = foreign( job ) || job.form.language;
    const ask = ( tag ) => client.ask( prompt( spoken, words ), { audio: { bytes, format: piece.format }, room: 1500, log: path.join( dir, 'model' ), tag } );
    const answer = await ask( 'audio #' + piece.n ) || ( client.state.halted ? null : await ask( 'audio #' + piece.n + ' again' ) );
    if ( !answer ) {
        return null;
    }
    const raw = answer.text;
    const echo = echoAt( raw, words );
    const said = echo < 0 ? raw : raw.slice( 0, echo ).trim();
    return {
        n: piece.n,
        start: piece.start,
        text: digits( said, spoken ),
        raw,
        // a person should listen: nothing came back, the prompt came back, or the answer was cut off
        approve: said === '' || echo >= 0 || answer.finish === 'length',
    };
}

// The model hands back the names and terms it was given: alone when there is nothing to hear, or behind what
// was said. Three entries of the dictionary in a row, in its order and with its commas, are the prompt and not
// a person; from there on the transcript is cut, together with the end of the entry before, which the model
// starts the list with as often as not. Returns where the list begins, or -1. Seen 9 October 2026: a tone
// without speech came back as the whole list and went into a field as a literal value, and a spoken sentence
// came back with the list behind it.
//
// The list also comes back broken off, and with its own introduction. Seen 11 October 2026 on answers of one
// word spoken by a synthetic voice, 15 recordings of about a second: seven came back as the first entry of the
// list and nothing else, a whole sentence printed on the form, and one as the words the list is introduced with
// and the list behind them; the introduction stood in the field as its value. So the introduction is the prompt
// wherever it stands, and a transcript that is the first entry of the list and nothing else is the list.
export function echoAt( raw, words ) {
    const bare = ( t ) => t.trim().replace( /[.!?]+$/, '' ).toLowerCase();
    if ( words.length && bare( raw ) === bare( words[ 0 ] ) ) {
        return 0;
    }
    let at = raw.indexOf( LIST );
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
