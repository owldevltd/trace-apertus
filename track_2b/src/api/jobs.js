import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { createJob, jobDir, saveJob, loadJob, loadRun, listJobs, addPage } from '../job.js';
import { listShipped, startShipped } from '../shipped.js';
import { runPipeline } from '../pipeline.js';
import { transcribeJob, transcribeAnswer } from '../speech/transcriber.js';
import { fillJob, fillUnit } from '../fields/filler.js';
import { hints, loadCatalogue, judgeVague, judgeEnough } from '../review/hints.js';
import { answered } from '../dialogue/dialogue.js';
import { LANGUAGE } from '../language.js';
import { translateJob, translateJobValues, loadTranslation, toTranslate } from '../dialogue/translate.js';
import { writeOutput } from '../output/pdf.js';

const DECISIONS = [ 'confirmed', 'changed', 'rejected' ];

const AUDIO = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav' };

// The job routes. A page arrives as a PNG body and the pipeline runs over it; the app asks for the job until
// run.step is done. A job can also start from a shipped form in data/forms: that one was captured when it was
// put there and is ready at once.

// the steps during which a job is at work and takes no other
const RUNNING = [ 'analyze', 'read', 'fields', 'dialogue', 'transcribe', 'fill', 'translate' ];

const PNG = Buffer.from( [ 0x89, 0x50, 0x4e, 0x47 ] );
const ID = /^[a-z0-9]{6,20}$/;
const FORM = /^[a-z0-9-]+$/;

export function registerJobs( router, client ) {

    router.add( 'GET', '/api/forms', async () => ( { status: 200, json: await listShipped() } ) );

    router.add( 'GET', '/api/jobs', async () => ( { status: 200, json: await listJobs() } ) );

    router.add( 'POST', '/api/jobs', async ( { body } ) => {
        if ( !isPng( body ) ) {
            return { status: 415, json: { error: 'a page is a PNG body' } };
        }
        const job = createJob( { name: 'Captured form', language: 'de', pages: 1, origin: 'original' } );
        await saveJob( job );
        await addPage( job, body );
        return { status: 201, json: { id: job.id, pages: job.pages.length } };
    } );

    router.add( 'POST', '/api/jobs/from/:form', async ( { params } ) => {
        const started = FORM.test( params.form ) ? await startShipped( params.form ) : null;
        if ( !started ) {
            return { status: 404, json: { error: 'no such form' } };
        }
        return { status: 201, json: { id: started.job.id, pages: started.job.pages.length, ready: started.ready } };
    } );

    router.add( 'POST', '/api/jobs/:id/pages', async ( { params, body } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        if ( !isPng( body ) ) {
            return { status: 415, json: { error: 'a page is a PNG body' } };
        }
        await addPage( job, body );
        job.form.pages = job.pages.length;
        await saveJob( job );
        return { status: 201, json: { id: job.id, pages: job.pages.length } };
    } );

    router.add( 'POST', '/api/jobs/:id/run', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        // runs on after the answer; the app asks for the job to see it progress
        runPipeline( job, client ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'analyze' } };
    } );

    // a piece of the recording: MP3 or WAV body, piece number, start and length in seconds in the headers
    router.add( 'POST', '/api/jobs/:id/audio', async ( { req, params, body } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const format = AUDIO[ ( req.headers[ 'content-type' ] || '' ).split( ';' )[ 0 ].trim() ];
        if ( !format || !body || !body.length ) {
            return { status: 415, json: { error: 'a piece is an MP3 or WAV body' } };
        }
        const dir = path.join( jobDir( job.id ), 'audio' );
        await fs.mkdir( dir, { recursive: true } );
        let pieces = [];
        try {
            pieces = JSON.parse( await fs.readFile( path.join( dir, 'pieces.json' ), 'utf8' ) );
        } catch {
            // the first piece
        }
        // without a number the next free one: an answer to a question is recorded apart from the dictation
        const n = Number( req.headers[ 'x-piece' ] ) || nextPiece( job, pieces );
        const piece = { n, file: n + '.' + format, format, start: Number( req.headers[ 'x-start' ] ) || 0, duration: Number( req.headers[ 'x-duration' ] ) || 0, bytes: body.length };
        await fs.writeFile( path.join( dir, piece.file ), body );
        pieces = [ ...pieces.filter( ( p ) => p.n !== n ), piece ].sort( ( a, b ) => a.n - b.n );
        await fs.writeFile( path.join( dir, 'pieces.json' ), JSON.stringify( pieces ) );
        job.audio = { file: 'audio/', duration: Math.round( pieces.reduce( ( a, p ) => a + p.duration, 0 ) * 10 ) / 10, language: job.form.language, pieces: pieces.length };
        await saveJob( job );
        return { status: 201, json: { id: job.id, piece: n, pieces: pieces.length } };
    } );

    router.add( 'POST', '/api/jobs/:id/transcribe', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        transcribeJob( job, client ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'transcribe' } };
    } );

    router.add( 'POST', '/api/jobs/:id/fill', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        fillJob( job, client ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'fill' } };
    } );

    // an answer to one question of the dialogue: { text } as typed, { pieces: [ n, … ] } as said (pieces of the
    // recording sent before), or { skip: true } when there is nothing to say. The values go into the fields of
    // that unit only. A typed answer to a single writing field is the value as it stands; everything else is
    // read by the model, from all that was said in reply to the question so far, so a missing part can be
    // added. An answer to a single writing field is then judged: does it cover what the place asks for.
    // Answers at once: one to four calls.
    router.add( 'POST', '/api/jobs/:id/answers/:unit', async ( { params, body } ) => {
        const job = await find( params.id );
        const unit = job && job.dialogue && job.dialogue.units.find( ( u ) => u.id === params.unit );
        if ( !unit ) {
            return { status: 404, json: { error: 'no such question' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        let data;
        try {
            data = JSON.parse( body.toString( 'utf8' ) );
        } catch {
            return { status: 400, json: { error: 'an answer is JSON' } };
        }
        const fields = unit.fields.map( ( id ) => job.fields.find( ( f ) => f.id === id ) );
        const text = typeof data.text === 'string' ? data.text.trim() : '';
        const said = Array.isArray( data.pieces ) ? data.pieces.map( Number ).filter( Boolean ) : [];
        const writing = fields.length === 1 && fields[ 0 ].kind !== 'checkbox' && fields[ 0 ].kind !== 'radio';
        if ( data.skip ) {
            for ( const f of fields ) {
                f.value = '';
                f.source = { how: 'entered', approve: false };
            }
        } else if ( text && writing ) {
            fields[ 0 ].value = text;
            fields[ 0 ].source = { how: 'entered', approve: false };
        } else if ( text || said.length ) {
            if ( !config.apiKey ) {
                return { status: 503, json: { error: 'no API_KEY: only a typed answer to a single field works without the model' } };
            }
            let pieces;
            if ( text ) {
                pieces = [ { n: nextPiece( job, await audioPieces( job ) ), start: 0, text, raw: text, question: unit.id } ];
                job.transcript = [ ...( job.transcript || [] ), ...pieces ];
            } else {
                pieces = await transcribeAnswer( job, said, unit.id, client );
            }
            if ( !pieces.length ) {
                return { status: 400, json: { error: 'no such piece of the recording' } };
            }
            // nothing heard: the question stays open, the piece stays in the transcript for a person to listen
            const heard = pieces.filter( ( p ) => p.text.trim() !== '' );
            if ( !heard.length ) {
                await saveJob( job );
                return { status: 200, json: { job, heard: false } };
            }
            await fillUnit( job, unit, job.transcript.filter( ( p ) => p.question === unit.id && p.text.trim() !== '' ), client );
        } else {
            return { status: 400, json: { error: 'an answer is text, pieces or skip' } };
        }
        const catalogue = await loadCatalogue( job );
        const judged = catalogue ? await judgeVague( { ...job, fields: fields.filter( ( f ) => f.value ) }, catalogue, client ) : [];
        if ( writing && fields[ 0 ].value ) {
            const said = fields[ 0 ].source.how === 'entered' ? text : job.transcript.filter( ( p ) => p.question === unit.id ).map( ( p ) => p.text ).join( ' ' );
            const enough = await judgeEnough( job, unit, fields[ 0 ], said, client );
            if ( enough ) {
                judged.push( enough );
            }
        }
        settle( job, catalogue, fields.map( ( f ) => f.id ), judged );
        await saveJob( job );
        return { status: 200, json: { job } };
    } );

    // The person goes on with questions still open: what was not answered stays empty, and the form is filled as
    // far as the person wants it. From here on a required question without an answer shows as missing.
    router.add( 'POST', '/api/jobs/:id/review', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        if ( job.status === 'sent' ) {
            return { status: 409, json: { error: 'the form is sent' } };
        }
        if ( [ 'captured', 'verified' ].includes( job.status ) ) {
            const open = job.dialogue ? job.dialogue.units.filter( ( u ) => !u.skip && !answered( job, u ) ).length : 0;
            job.status = 'filled';
            job.history.push( { at: new Date().toISOString(), event: 'filled', note: open + ' questions left open' } );
            settle( job, await loadCatalogue( job ), [] );
            await saveJob( job );
        }
        return { status: 200, json: { job } };
    } );

    // The dialogue in the language of the person: { language }. Where it is not the language of the form, the
    // questions, labels and options are translated once and kept with the form; the job then knows the language
    // it is answered in. Answers at once with ready when there is nothing to do, else the app asks for the job
    // until run.step is done.
    router.add( 'POST', '/api/jobs/:id/translate', async ( { params, body } ) => {
        const job = await find( params.id );
        if ( !job || !job.dialogue ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        let language;
        try {
            language = JSON.parse( body.toString( 'utf8' ) ).language;
        } catch {
            language = null;
        }
        if ( !LANGUAGE[ language ] ) {
            return { status: 400, json: { error: 'language is de, fr, it or en' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        if ( language === job.form.language ) {
            delete job.language;
            await saveJob( job );
            return { status: 200, json: { id: job.id, ready: true } };
        }
        const have = ( job.dialogue.translations || {} )[ language ] || await loadTranslation( job, language );
        if ( have ) {
            job.language = language;
            job.dialogue.translations = { ...( job.dialogue.translations || {} ), [ language ]: have };
            await saveJob( job );
            return { status: 200, json: { id: job.id, ready: true } };
        }
        if ( !config.apiKey ) {
            return { status: 503, json: { error: 'no API_KEY: the form stays in its own language' } };
        }
        translateJob( job, language, client ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'translate' } };
    } );

    // The values into the language of the form, before sending: every written value the person gave in their
    // own language, one after the other; each keeps what was said beside it. run.page counts the values done.
    router.add( 'POST', '/api/jobs/:id/translate/values', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const run = await loadRun( job.id );
        if ( RUNNING.includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        if ( !toTranslate( job ).length ) {
            return { status: 200, json: { id: job.id, ready: true } };
        }
        if ( !config.apiKey ) {
            return { status: 503, json: { error: 'no API_KEY: nothing can be translated' } };
        }
        translateJobValues( job, client, async ( done ) => settle( done, await loadCatalogue( done ), [] ) ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'translate', values: toTranslate( job ).length } };
    } );

    // a person's decision on a field: { decision: confirmed | changed | rejected, value?, by? }
    router.add( 'PUT', '/api/jobs/:id/fields/:fid', async ( { params, body } ) => {
        const job = await find( params.id );
        const field = job && job.fields.find( ( f ) => f.id === params.fid );
        if ( !field ) {
            return { status: 404, json: { error: 'no such field' } };
        }
        let data;
        try {
            data = JSON.parse( body.toString( 'utf8' ) );
        } catch {
            return { status: 400, json: { error: 'a decision is JSON' } };
        }
        if ( !DECISIONS.includes( data.decision ) ) {
            return { status: 400, json: { error: 'decision is confirmed, changed or rejected' } };
        }
        const review = { at: new Date().toISOString(), decision: data.decision, ...( data.by ? { by: String( data.by ) } : {} ) };
        // what the person said before the translation stays with the value: a correction after it is in the
        // language of the form and is not translated again
        const said = field.source && field.source.said ? { said: field.source.said } : {};
        if ( data.decision === 'changed' ) {
            review.before = field.value || '';
            field.value = String( data.value ?? '' ).trim();
            field.source = { how: 'entered', approve: false, review, ...said };
        } else if ( data.decision === 'rejected' ) {
            review.before = field.value || '';
            field.value = '';
            field.source = { how: 'entered', approve: false, review };
        } else {
            field.source = { ...( field.source || { how: 'entered' } ), approve: false, review };
        }
        settle( job, await loadCatalogue( job ), [ field.id ] );
        // every flagged value decided: the form is reviewed
        if ( job.status === 'filled' && !job.fields.some( ( f ) => f.source && f.source.approve ) ) {
            job.status = 'reviewed';
            job.history.push( { at: review.at, event: 'reviewed' } );
        }
        await saveJob( job );
        return { status: 200, json: { job } };
    } );

    // the filled form as PDF, written anew from the job as it stands
    router.add( 'GET', '/api/jobs/:id/output.pdf', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        const file = await output( job );
        return { status: 200, file, type: 'application/pdf' };
    } );

    // the mail draft for the signature: recipient and subject from the shipped form, when it is one
    router.add( 'GET', '/api/jobs/:id/draft', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        return { status: 200, json: await draft( job ) };
    } );

    // sending: the PDF is written, the job is marked sent; the signature service itself is not connected
    router.add( 'POST', '/api/jobs/:id/send', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        if ( toTranslate( job ).length ) {
            return { status: 409, json: { error: 'the answers are not in the language of the form yet' } };
        }
        await output( job );
        const at = new Date().toISOString();
        // what is required and empty is a warning to the person, not a lock: the history says it went out so
        const missing = job.fields.filter( ( f ) => ( f.hints || [] ).some( ( h ) => h.kind === 'missing' ) ).length;
        job.history.push( { at, event: 'exported', note: 'output.pdf' } );
        job.history.push( { at, event: 'sent', ...( missing ? { note: missing + ' required left empty' } : {} ) } );
        job.status = 'sent';
        await saveJob( job );
        return { status: 200, json: { job, draft: await draft( job ) } };
    } );

    router.add( 'GET', '/api/jobs/:id', async ( { params } ) => {
        const job = await find( params.id );
        if ( !job ) {
            return { status: 404, json: { error: 'no such job' } };
        }
        return { status: 200, json: { job, run: await loadRun( job.id ) } };
    } );

    router.add( 'GET', '/api/jobs/:id/pages/:n', async ( { params } ) => page( params, '.png' ) );
    router.add( 'GET', '/api/jobs/:id/pages/:n/fields.png', async ( { params } ) => page( params, '-fields.png' ) );
    router.add( 'GET', '/api/jobs/:id/pages/:n/elements.png', async ( { params } ) => page( params, '-elements.png' ) );
}

// A page image or one of its control images; a missing file answers 404 when it is read.
function page( params, suffix ) {
    if ( !ID.test( params.id ) || !/^\d{1,3}$/.test( params.n ) ) {
        return { status: 404, json: { error: 'no such page' } };
    }
    return { status: 200, file: path.join( jobDir( params.id ), 'pages', params.n + suffix ), type: 'image/png' };
}

// Writes storage/<id>/output.pdf: into the fillable original when the job came from a shipped form, else a new
// PDF from the page pictures. Returns the file's path.
async function output( job ) {
    const dir = jobDir( job.id );
    let original = null;
    if ( job.form.file ) {
        try {
            original = await fs.readFile( path.join( config.dataDir, job.form.file ) );
        } catch {
            // no original at hand: the pictures then
        }
    }
    const pages = [];
    if ( !original ) {
        for ( const p of job.pages ) {
            pages.push( await fs.readFile( path.join( dir, p.image ) ) );
        }
    }
    const bytes = await writeOutput( job, { original, pages } );
    const file = path.join( dir, 'output.pdf' );
    await fs.writeFile( file, bytes );
    return file;
}

// recipient and subject of the shipped form, from its form.json; empty for a photographed one
async function draft( job ) {
    const m = ( job.form.file || '' ).match( /^forms\/([a-z0-9-]+)\// );
    let meta = {};
    if ( m ) {
        try {
            meta = JSON.parse( await fs.readFile( path.join( config.dataDir, 'forms', m[ 1 ], 'form.json' ), 'utf8' ) );
        } catch {
            // a form without a sheet
        }
    }
    return { to: meta.recipient || '', subject: ( meta.subject || job.form.name ), pdf: '/api/jobs/' + job.id + '/output.pdf', pages: job.pages.length };
}

// After a value changed: the code hints anew for every field; a judgement of the model (vague, incomplete) stays,
// except on the fields just changed, which get the new ones. While the questions of a dialogue are being
// answered, a field nobody was asked about yet is not missing; with the last question answered the form is filled.
function settle( job, catalogue, changed, judged = [] ) {
    const asked = job.dialogue ? job.dialogue.units.filter( ( u ) => !u.skip ) : [];
    const before = [ 'captured', 'verified' ].includes( job.status );
    if ( before && asked.length && asked.every( ( u ) => answered( job, u ) ) ) {
        job.status = 'filled';
        job.history.push( { at: new Date().toISOString(), event: 'filled', note: 'question by question' } );
    }
    const open = new Set( [ 'captured', 'verified' ].includes( job.status ) ? asked.filter( ( u ) => !answered( job, u ) ).flatMap( ( u ) => u.fields ) : [] );
    const fresh = [ ...hints( job, catalogue ), ...judged ].filter( ( h ) => !( h.kind === 'missing' && open.has( h.field ) ) );
    for ( const f of job.fields ) {
        const keep = ( f.hints || [] ).filter( ( h ) => ( h.kind === 'vague' || h.kind === 'incomplete' ) && !changed.includes( f.id ) );
        const mine = fresh.filter( ( h ) => h.field === f.id ).map( ( { field: _, ...h } ) => h );
        if ( keep.length || mine.length ) {
            f.hints = [ ...mine, ...keep ];
        } else {
            delete f.hints;
        }
    }
}

// the pieces of a job's recording, as the audio route keeps them
async function audioPieces( job ) {
    try {
        return JSON.parse( await fs.readFile( path.join( jobDir( job.id ), 'audio', 'pieces.json' ), 'utf8' ) );
    } catch {
        return [];
    }
}

// the next free piece number, over the recording and the transcript (a typed answer is a piece without sound)
function nextPiece( job, pieces ) {
    return Math.max( 0, ...pieces.map( ( p ) => p.n ), ...( job.transcript || [] ).map( ( p ) => p.n ) ) + 1;
}

async function find( id ) {
    if ( !ID.test( id ) ) {
        return null;
    }
    try {
        return await loadJob( id );
    } catch {
        return null;
    }
}

function isPng( body ) {
    return body && body.length > 8 && body.subarray( 0, 4 ).equals( PNG );
}
