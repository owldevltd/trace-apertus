import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { createJob, jobDir, saveJob, saveRun, addPage } from './job.js';

// The forms that ship with the app, in data/forms/<id>/: the PDF, its pages as PNG, the reference of every page
// (the words of the text layer, the form widgets) and form.json. A shipped form is captured once, when it is put
// there: tools/capture.js runs the pipeline over it and keeps the result beside it as captured.json, with pages,
// blocks, fields and dialogue. A job from a shipped form is therefore ready the moment it is created; nothing
// is recognized when a person opens it.

// A form a person captured or corrected is kept in the same shape under storage/forms/<id>/ and stands beside
// the shipped ones from then on: it is a form of its own that can be filled in again, with the fields, the
// questions and the catalogue as the person left them.

const shipped = ( id ) => path.join( config.dataDir, 'forms', id );
const own = ( id ) => path.join( config.storageDir, 'forms', id );

// where a form lies: with the shipped ones, else with the kept ones
const dir = ( id ) => ( existsSync( path.join( shipped( id ), 'form.json' ) ) ? shipped( id ) : own( id ) );

export async function listShipped() {
    return list( path.join( config.dataDir, 'forms' ) );
}

// The forms a person can choose from: the shipped ones, then the kept ones, newest first.
export async function listForms() {
    const kept = ( await list( path.join( config.storageDir, 'forms' ) ) ).map( ( f ) => ( { ...f, own: true } ) );
    return [ ...await listShipped(), ...kept.sort( ( a, b ) => ( a.kept < b.kept ? 1 : -1 ) ) ];
}

async function list( root ) {
    const out = [];
    let names = [];
    try {
        names = ( await fs.readdir( root ) ).sort();
    } catch {
        // no such folder yet
    }
    for ( const name of names ) {
        try {
            const form = JSON.parse( await fs.readFile( path.join( root, name, 'form.json' ), 'utf8' ) );
            out.push( { id: name, name: form.name, issuer: form.issuer, language: form.language, pages: form.pages, origin: form.origin, ...( form.kept ? { kept: form.kept } : {} ) } );
        } catch {
            // a folder without form.json is not a form
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
    // a kept form names the file of the form it was made of, when there is one, and itself
    const kept = dir( id ) === own( id );
    const meta = { name: form.name, ...( form.issuer ? { issuer: form.issuer } : {} ), language: form.language, pages: 0, ...( form.origin ? { origin: form.origin } : {} ) };
    const job = createJob( kept ? { ...meta, ...( form.file ? { file: form.file } : {} ), own: id } : { ...meta, file: 'forms/' + id + '/' + form.file } );
    await saveJob( job );
    if ( kept ) {
        await fs.copyFile( path.join( dir( id ), 'catalogue.json' ), path.join( jobDir( job.id ), 'catalogue.json' ) ).catch( () => {} );
    }
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

// Keeps the form of a job as a form of its own: its pages, the words and widgets it brought along, its fields
// without what was filled in, its dialogue without the translations, and its catalogue. A job that was kept
// before is kept again under the same id; any other gets a new one and carries it from then on (form.own).
// Returns the id.
export async function keepOwn( job ) {
    const id = job.form.own || 'own-' + job.id;
    const target = own( id );
    await fs.mkdir( target, { recursive: true } );
    const read = async ( name ) => {
        try {
            return JSON.parse( await fs.readFile( path.join( jobDir( job.id ), name ), 'utf8' ) );
        } catch {
            return {};
        }
    };
    const widgets = await read( 'widgets.json' );
    const words = await read( 'words.json' );
    for ( const p of job.pages ) {
        // page images sort by their name: two digits keep ten pages in order
        const name = 'page-' + String( p.n ).padStart( 2, '0' );
        await fs.copyFile( path.join( jobDir( job.id ), p.image ), path.join( target, name + '.png' ) );
        await fs.writeFile( path.join( target, name + '.json' ), JSON.stringify( {
            widgets: ( widgets[ p.n ] || [] ).map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, w: w.width, h: w.height } ) ),
            words: words[ p.n ] || [],
        } ) );
    }
    job.form.own = id;
    const { own: _, ...form } = job.form;
    const fields = job.fields.map( ( { value: _v, source: _s, hints: _h, ...f } ) => f );
    const dialogue = job.dialogue ? { built: job.dialogue.built, model: job.dialogue.model, units: job.dialogue.units } : undefined;
    await fs.writeFile( path.join( target, 'captured.json' ), JSON.stringify( { schema: job.schema, form, pages: job.pages, blocks: job.blocks, fields, dialogue } ) + '\n' );
    await fs.writeFile( path.join( target, 'form.json' ), JSON.stringify( { ...form, pages: job.pages.length, kept: new Date().toISOString() }, null, 4 ) + '\n' );
    await fs.copyFile( path.join( jobDir( job.id ), 'catalogue.json' ), path.join( target, 'catalogue.json' ) ).catch( () => {} );
    return id;
}
