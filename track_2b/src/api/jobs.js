import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { createJob, jobDir, saveJob, loadJob, loadRun, listJobs } from '../job.js';
import { runPipeline } from '../pipeline.js';
import { transcribeJob } from '../speech/transcriber.js';
import { fillJob } from '../fields/filler.js';
import { hints, loadCatalogue } from '../review/hints.js';

const DECISIONS = [ 'confirmed', 'changed', 'rejected' ];

const AUDIO = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav' };

// The job routes. A page arrives as a PNG body; a job can also start from a shipped form in data/forms, which
// brings the form widgets of a fillable original along. Running the pipeline answers at once; the app asks for
// the job until run.step is done.

const PNG = Buffer.from( [ 0x89, 0x50, 0x4e, 0x47 ] );
const ID = /^[a-z0-9]{6,20}$/;
const FORM = /^[a-z0-9-]+$/;

export function registerJobs( router, client ) {

    router.add( 'GET', '/api/forms', async () => ( { status: 200, json: await listForms() } ) );

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
        if ( !FORM.test( params.form ) ) {
            return { status: 404, json: { error: 'no such form' } };
        }
        const dir = path.join( config.dataDir, 'forms', params.form );
        let form;
        try {
            form = JSON.parse( await fs.readFile( path.join( dir, 'form.json' ), 'utf8' ) );
        } catch {
            return { status: 404, json: { error: 'no such form' } };
        }
        const job = createJob( { name: form.name, issuer: form.issuer, language: form.language, pages: 0, origin: form.origin, file: 'forms/' + params.form + '/' + form.file } );
        await saveJob( job );
        const widgets = {};
        for ( const png of ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.png' ) ).sort() ) {
            const n = await addPage( job, await fs.readFile( path.join( dir, png ) ) );
            try {
                const ref = JSON.parse( await fs.readFile( path.join( dir, png.replace( /\.png$/, '.json' ) ), 'utf8' ) );
                widgets[ n ] = ( ref.widgets || [] ).map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) );
            } catch {
                // no reference beside the page
            }
        }
        job.form.pages = job.pages.length;
        await saveJob( job );
        await fs.writeFile( path.join( jobDir( job.id ), 'widgets.json' ), JSON.stringify( widgets ) );
        return { status: 201, json: { id: job.id, pages: job.pages.length } };
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
        if ( [ 'analyze', 'read', 'fields' ].includes( run.step ) ) {
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
        const n = Number( req.headers[ 'x-piece' ] ) || pieces.length + 1;
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
        if ( [ 'analyze', 'read', 'fields', 'transcribe' ].includes( run.step ) ) {
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
        if ( [ 'analyze', 'read', 'fields', 'transcribe', 'fill' ].includes( run.step ) ) {
            return { status: 409, json: { error: 'already running', run } };
        }
        fillJob( job, client ).catch( () => {} );
        return { status: 202, json: { id: job.id, step: 'fill' } };
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
        if ( data.decision === 'changed' ) {
            review.before = field.value || '';
            field.value = String( data.value ?? '' ).trim();
            field.source = { how: 'entered', approve: false, review };
        } else if ( data.decision === 'rejected' ) {
            review.before = field.value || '';
            field.value = '';
            field.source = { how: 'entered', approve: false, review };
        } else {
            field.source = { ...( field.source || { how: 'entered' } ), approve: false, review };
        }
        // the code hints anew for every field; a vague judgement stays, except on the field just decided
        const fresh = hints( job, await loadCatalogue( job ) );
        for ( const f of job.fields ) {
            const keep = ( f.hints || [] ).filter( ( h ) => h.kind === 'vague' && f.id !== field.id );
            const mine = fresh.filter( ( h ) => h.field === f.id ).map( ( { field: _, ...h } ) => h );
            if ( keep.length || mine.length ) {
                f.hints = [ ...mine, ...keep ];
            } else {
                delete f.hints;
            }
        }
        // every flagged value decided: the form is reviewed
        if ( job.status === 'filled' && !job.fields.some( ( f ) => f.source && f.source.approve ) ) {
            job.status = 'reviewed';
            job.history.push( { at: review.at, event: 'reviewed' } );
        }
        await saveJob( job );
        return { status: 200, json: { job } };
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

// Stores a page image in the job and records it; returns its number.
async function addPage( job, png ) {
    const n = job.pages.length + 1;
    const dir = path.join( jobDir( job.id ), 'pages' );
    await fs.mkdir( dir, { recursive: true } );
    await fs.writeFile( path.join( dir, n + '.png' ), png );
    job.pages.push( { n, width: 0, height: 0, image: 'pages/' + n + '.png' } );
    await saveJob( job );
    return n;
}

function isPng( body ) {
    return body && body.length > 8 && body.subarray( 0, 4 ).equals( PNG );
}

async function listForms() {
    const root = path.join( config.dataDir, 'forms' );
    const out = [];
    for ( const name of ( await fs.readdir( root ) ).sort() ) {
        try {
            const form = JSON.parse( await fs.readFile( path.join( root, name, 'form.json' ), 'utf8' ) );
            out.push( { id: name, name: form.name, issuer: form.issuer, language: form.language, pages: form.pages, origin: form.origin } );
        } catch {
            // a folder without form.json is not a shipped form
        }
    }
    return out;
}
