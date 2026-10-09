import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { createJob, jobDir, saveJob, saveRun, addPage } from './job.js';

// The forms that ship with the app, in data/forms/<id>/: the PDF, its pages as PNG, the reference of every page
// (the words of the text layer, the form widgets) and form.json. A shipped form is captured once, when it is put
// there: tools/capture.js runs the pipeline over it and keeps the result beside it as captured.json, with pages,
// blocks, fields and dialogue. A job from a shipped form is therefore ready the moment it is created; nothing
// is recognized when a person opens it.

const dir = ( id ) => path.join( config.dataDir, 'forms', id );

export async function listShipped() {
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

// A job from a shipped form: its pages, the words of its text layer and the widgets of a fillable original, and,
// unless fresh is asked for, everything the capture found. Returns { job, ready }, or null for no such form;
// ready says that the job needs no pipeline run.
export async function startShipped( id, fresh = false ) {
    let form;
    try {
        form = JSON.parse( await fs.readFile( path.join( dir( id ), 'form.json' ), 'utf8' ) );
    } catch {
        return null;
    }
    const job = createJob( { name: form.name, issuer: form.issuer, language: form.language, pages: 0, origin: form.origin, file: 'forms/' + id + '/' + form.file } );
    await saveJob( job );
    const widgets = {};
    const words = {};
    for ( const png of ( await fs.readdir( dir( id ) ) ).filter( ( f ) => f.endsWith( '.png' ) ).sort() ) {
        const n = await addPage( job, await fs.readFile( path.join( dir( id ), png ) ) );
        try {
            const ref = JSON.parse( await fs.readFile( path.join( dir( id ), png.replace( /\.png$/, '.json' ) ), 'utf8' ) );
            widgets[ n ] = ( ref.widgets || [] ).map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) );
            if ( ( ref.words || [] ).length ) {
                words[ n ] = ref.words;
            }
        } catch {
            // no reference beside the page
        }
    }
    job.form.pages = job.pages.length;
    await fs.writeFile( path.join( jobDir( job.id ), 'widgets.json' ), JSON.stringify( widgets ) );
    await fs.writeFile( path.join( jobDir( job.id ), 'words.json' ), JSON.stringify( words ) );
    let ready = false;
    if ( !fresh ) {
        try {
            const captured = JSON.parse( await fs.readFile( path.join( dir( id ), 'captured.json' ), 'utf8' ) );
            Object.assign( job, { pages: captured.pages, blocks: captured.blocks, fields: captured.fields, dialogue: captured.dialogue } );
            await saveRun( job.id, { step: 'done', page: 0, at: new Date().toISOString(), error: null } );
            ready = true;
        } catch {
            // not captured yet: the pipeline has to run
        }
    }
    await saveJob( job );
    return { job, ready };
}

// What the pipeline found on a job, as it is kept beside a shipped form.
export async function keepCaptured( id, job ) {
    const captured = { schema: job.schema, form: job.form, pages: job.pages, blocks: job.blocks, fields: job.fields, dialogue: job.dialogue };
    const file = path.join( dir( id ), 'captured.json' );
    await fs.writeFile( file, JSON.stringify( captured ) + '\n' );
    return file;
}
