import fs from 'node:fs/promises';
import path from 'node:path';
import { run as work } from './workers.js';
import { toRead, readElements } from './read/reader.js';
import { layerElements } from './read/layer.js';
import { buildFields } from './fields/builder.js';
import { buildDialogue } from './dialogue/dialogue.js';
import { bindRequired } from './dialogue/required.js';
import { loadCatalogue } from './review/hints.js';
import { jobDir, saveJob, saveRun } from './job.js';

// The pipeline of a job: geometry → reading → fields → dialogue, saved after every step so the app can show
// where it stands. Pixel work runs in the workers, the model calls go through the one client of the process.
// A shipped form brings the words of its PDF along and is read from them, not from the image. Without a key the
// reading of a photographed form is skipped, its fields come without labels, and no dialogue gets questions.

export async function runPipeline( job, client ) {
    const dir = jobDir( job.id );
    const state = { step: 'analyze', page: 0, at: now(), error: null };
    await saveRun( job.id, state );
    try {
        // the form widgets of a fillable original, when the job was started from a shipped form
        let widgets = {};
        try {
            widgets = JSON.parse( await fs.readFile( path.join( dir, 'widgets.json' ), 'utf8' ) );
        } catch {
            // a photographed form has none
        }
        // and the words of its text layer with their place on the page
        let words = {};
        try {
            words = JSON.parse( await fs.readFile( path.join( dir, 'words.json' ), 'utf8' ) );
        } catch {
            // a photographed form has none: the model reads it
        }
        const pages = [];
        for ( const p of job.pages ) {
            const file = path.join( dir, p.image );
            const base = path.join( dir, 'pages', String( p.n ) );
            await saveRun( job.id, Object.assign( state, { step: 'analyze', page: p.n, at: now() } ) );
            const geometry = await work( 'analyze', { file, control: base + '-page.png' } );
            await fs.writeFile( base + '.json', JSON.stringify( geometry ) );
            p.width = geometry.width;
            p.height = geometry.height;
            p.unit = geometry.unit;
            await saveJob( job );

            await saveRun( job.id, Object.assign( state, { step: 'read', at: now() } ) );
            let elements;
            if ( words[ p.n ] ) {
                elements = layerElements( geometry, words[ p.n ] );
            } else {
                const crops = await work( 'crops', { file, boxes: toRead( geometry ) } );
                ( { elements } = await readElements( geometry, crops, client, base + '.read', path.join( dir, 'model' ) ) );
            }
            const finished = await work( 'finish', { file, page: geometry, elements, control: base + '-elements.png' } );
            await fs.writeFile( base + '-elements.json', JSON.stringify( finished ) );
            pages.push( { page: p.n, unit: geometry.unit, elements: finished, widgets: widgets[ p.n ] || [] } );
        }

        await saveRun( job.id, Object.assign( state, { step: 'fields', at: now() } ) );
        const { blocks, fields } = buildFields( pages );
        job.blocks = blocks;
        job.fields = fields;
        await saveJob( job );
        for ( const p of job.pages ) {
            await work( 'paintFields', {
                file: path.join( dir, p.image ),
                control: path.join( dir, 'pages', p.n + '-fields.png' ),
                fields: fields.filter( ( f ) => f.page === p.n ),
                blocks,
            } );
        }
        // the form as a conversation, once, kept with the form
        await saveRun( job.id, Object.assign( state, { step: 'dialogue', page: 0, at: now() } ) );
        job.dialogue = ( await buildDialogue( job, client, path.join( dir, 'model' ) ) ).dialogue;
        // which of its questions the form requires, where the form has a catalogue that says what is required
        const catalogue = await loadCatalogue( job );
        if ( catalogue ) {
            await bindRequired( job, catalogue, client, path.join( dir, 'model' ) );
        }
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
