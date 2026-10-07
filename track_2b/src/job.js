import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

// One job per captured form. It travels through the pipeline as a plain object and is written to
// storage/<id>/job.json after every step, so nothing is held in module state between requests.

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
