import fs from 'node:fs/promises';
import path from 'node:path';
import { digits } from './numbers.js';
import { jobDir, saveJob, saveRun, record } from '../job.js';

// Transcription: every piece of the recording goes to the model as audio, with the wording the measurements
// were made with, the language said explicitly (without it the model translates and invents) and the names and
// words of the form as a dictionary (71 → 76 of 78 facts). Number words become digits afterwards; the raw
// answer is kept beside it.

const LANGUAGE = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', en: 'Englisch' };

// at most this many dictionary entries, the longest labels first
const WORDS = 40;

export function prompt( language, words ) {
    let p = 'Transkribiere die Aufnahme wortwörtlich. Ausgangssprache ist ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ', bitte gib ' + ( LANGUAGE[ language ] || LANGUAGE.de ) + ' zurück.';
    if ( words.length ) {
        p += ' Bekannte Namen und Begriffe, die in der Aufnahme vorkommen können: ' + words.join( ', ' ) + '.';
    }
    return p;
}

// The dictionary of a job: the form's name and issuer and its field labels, short ones first dropped.
export function dictionary( job ) {
    const seen = new Set();
    const out = [];
    for ( const w of [ job.form.name, job.form.issuer, ...job.fields.map( ( f ) => f.label ) ] ) {
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
            const bytes = await fs.readFile( path.join( dir, 'audio', piece.file ) );
            const answer = await client.ask( prompt( job.form.language, words ), { audio: { bytes, format: piece.format }, room: 1500, log: path.join( dir, 'model' ), tag: 'audio #' + piece.n } );
            const raw = answer ? answer.text : '';
            job.transcript.push( {
                n: piece.n,
                start: piece.start,
                text: digits( raw ),
                raw,
                // a person should listen: nothing came back, or the answer was cut off
                approve: raw.trim() === '' || ( answer && answer.finish === 'length' ),
            } );
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

function now() {
    return new Date().toISOString();
}
