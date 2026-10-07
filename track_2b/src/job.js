import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

// One job per captured form. It travels through the pipeline as a plain object and is written to
// storage/<id>/job.json after every step, so nothing is held in module state between requests. The job file
// follows the contract; where the pipeline stands (not part of the contract) is kept beside it in run.json.

export function createJob( form ) {
    const id = Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2, 6 );
    return {
        id,
        schema: '2b-0.1',
        form,
        pages: [],
        blocks: [],
        fields: [],
        status: 'captured',
        history: [ { at: new Date().toISOString(), event: 'captured' } ],
    };
}

export function jobDir( id ) {
    return path.join( config.storageDir, id );
}

export async function saveJob( job ) {
    const dir = jobDir( job.id );
    await fs.mkdir( dir, { recursive: true } );
    await fs.writeFile( path.join( dir, 'job.json' ), JSON.stringify( job, null, 2 ) );
    return dir;
}

export async function loadJob( id ) {
    return JSON.parse( await fs.readFile( path.join( jobDir( id ), 'job.json' ), 'utf8' ) );
}

export function record( job, event, note ) {
    job.history.push( { at: new Date().toISOString(), event, ...( note ? { note } : {} ) } );
    return job;
}

// Where the pipeline stands: { step, page, at, error }. step is idle, analyze, read, fields, done or error.
export async function saveRun( id, run ) {
    await fs.writeFile( path.join( jobDir( id ), 'run.json' ), JSON.stringify( run, null, 2 ) );
    return run;
}

export async function loadRun( id ) {
    try {
        return JSON.parse( await fs.readFile( path.join( jobDir( id ), 'run.json' ), 'utf8' ) );
    } catch {
        return { step: 'idle', page: 0, at: null, error: null };
    }
}

// Ids of all jobs in storage, newest first.
export async function listJobs() {
    let names = [];
    try {
        names = await fs.readdir( config.storageDir );
    } catch {
        return [];
    }
    const jobs = [];
    for ( const name of names ) {
        try {
            const job = await loadJob( name );
            jobs.push( { id: job.id, form: job.form.name, pages: job.pages.length, fields: job.fields.length, status: job.status, at: job.history[ 0 ].at } );
        } catch {
            // not a job folder
        }
    }
    return jobs.sort( ( a, b ) => ( a.at < b.at ? 1 : -1 ) );
}
