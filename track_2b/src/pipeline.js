import fs from 'node:fs/promises';
import path from 'node:path';
import { run as work } from './workers.js';
import { toRead, readElements } from './read/reader.js';
import { layerElements } from './read/layer.js';
import { buildFields } from './fields/builder.js';
import { buildDialogue } from './dialogue/dialogue.js';
import { pages as kindPages, predictKinds } from './fields/predictor.js';
import { planned } from './fields/editor.js';
import { buildUnits } from './dialogue/units.js';
import { bindRequired } from './dialogue/required.js';
import { loadCatalogue, saveCatalogue } from './review/hints.js';
import { buildCatalogue } from './review/catalogue.js';
import { jobDir, saveJob, saveRun } from './job.js';

// The pipeline of a job: geometry → reading → fields → catalogue → dialogue, saved after every step so the app
// can show where it stands. Pixel work runs in the workers, the model calls go through the one client of the
// process. A step that calls the model says how far it is: run.done calls of run.of planned, so the app can draw
// a bar for a step that takes minutes (a photographed page is read element by element, one call each).
// A shipped form brings the words of its PDF along and is read from them, not from the image. Without a key the
// reading of a photographed form is skipped, its fields come without labels, and no dialogue gets questions.

export async function runPipeline( job, client ) {
    const dir = jobDir( job.id );
    const state = { step: 'analyze', page: 0, done: 0, of: 0, at: now(), error: null };
    await saveRun( job.id, state );
    // every call to the model counts; more calls than planned do not run the bar over
    const counting = {
        state: client.state,
        ask: async ( prompt, options ) => {
            const answer = await client.ask( prompt, options );
            await saveRun( job.id, Object.assign( state, { done: Math.min( state.done + 1, state.of || state.done + 1 ), at: now() } ) );
            return answer;
        },
    };
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
            await saveRun( job.id, Object.assign( state, { step: 'analyze', page: p.n, done: 0, of: 0, at: now() } ) );
            const geometry = await work( 'analyze', { file, control: base + '-page.png' } );
            await fs.writeFile( base + '.json', JSON.stringify( geometry ) );
            p.width = geometry.width;
            p.height = geometry.height;
            p.unit = geometry.unit;
            await saveJob( job );

            await saveRun( job.id, Object.assign( state, { step: 'read', done: 0, of: words[ p.n ] ? 0 : toRead( geometry ).length, at: now() } ) );
            let elements;
            if ( words[ p.n ] ) {
                elements = layerElements( geometry, words[ p.n ] );
            } else {
                const crops = await work( 'crops', { file, boxes: toRead( geometry ) } );
                ( { elements } = await readElements( geometry, crops, counting, base + '.read', path.join( dir, 'model' ) ) );
            }
            const finished = await work( 'finish', { file, page: geometry, elements, control: base + '-elements.png' } );
            await fs.writeFile( base + '-elements.json', JSON.stringify( finished ) );
            pages.push( { page: p.n, unit: geometry.unit, elements: finished, widgets: widgets[ p.n ] || [] } );
        }

        await saveRun( job.id, Object.assign( state, { step: 'fields', done: 0, of: 0, at: now() } ) );
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
        // what the law or the practice asks of each field: a form that ships has its catalogue, checked by a
        // person; any other gets one from the large model here, unchecked, so that its fields have hints too
        let catalogue = await loadCatalogue( job );
        if ( !catalogue ) {
            await saveRun( job.id, Object.assign( state, { step: 'catalogue', page: 0, done: 0, of: 1, at: now() } ) );
            try {
                await saveCatalogue( job, await buildCatalogue( job, counting, path.join( dir, 'model' ) ) );
                catalogue = await loadCatalogue( job );
            } catch {
                // no catalogue came back: the form has no legal hints
            }
        }
        // the form as a conversation, once, kept with the form
        // planned: a call per page to write the questions and the checks in their bundles, then a call per page
        // for the kinds; what the required entries take on top is not known beforehand
        const units = buildUnits( job );
        const calls = planned( units.filter( ( u ) => !u.skip ) ) + kindPages( job, units ).length;
        await saveRun( job.id, Object.assign( state, { step: 'dialogue', page: 0, done: 0, of: calls, at: now() } ) );
        job.dialogue = ( await buildDialogue( job, counting, path.join( dir, 'model' ) ) ).dialogue;
        // what each place a person writes into takes, where the geometry only knows it as text: proposed by the
        // model, to be set otherwise in the mask
        await predictKinds( job, job.dialogue.units, counting, path.join( dir, 'model' ) );
        // which of its questions the form requires, where its catalogue says what is required
        if ( catalogue ) {
            await bindRequired( job, catalogue, counting, path.join( dir, 'model' ) );
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
