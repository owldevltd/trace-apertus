import fs from 'node:fs/promises';
import { config } from '../src/config.js';
import { createClient } from '../src/model/client.js';
import { close } from '../src/workers.js';
import { jobDir, loadRun } from '../src/job.js';
import { runPipeline } from '../src/pipeline.js';
import { listShipped, startShipped, keepCaptured } from '../src/shipped.js';

// Captures the shipped forms: runs the pipeline over each one once, as the app does for a photographed form, and
// keeps what it found beside the form as data/forms/<form>/captured.json (pages, blocks, fields, dialogue). The
// app then opens a shipped form without recognizing anything. The text comes from the text layer of the PDF; the
// questions of the dialogue are written and checked by the model, 47 calls for the four forms. A preparation
// step, its result is committed; a form's questions are written once and kept, not anew for every job.
// Needs API_KEY.
//
//   node --env-file=.env tools/capture.js [<form> …]

if ( !config.apiKey ) {
    console.log( 'no API_KEY: the forms would be captured without questions' );
    process.exit( 1 );
}

const only = process.argv.slice( 2 );
const client = createClient( config );
for ( const form of ( await listShipped() ).filter( ( f ) => !only.length || only.includes( f.id ) ) ) {
    const before = client.state.calls;
    const { job } = await startShipped( form.id, true );
    await runPipeline( job, client );
    const run = await loadRun( job.id );
    if ( run.step !== 'done' || client.state.halted ) {
        console.log( form.id + ': ' + ( client.state.halted ? 'halted by HTTP ' + client.state.halted : run.error ) + ', nothing kept' );
        close();
        process.exit( 1 );
    }
    const file = await keepCaptured( form.id, job );
    const units = job.dialogue.units;
    console.log( form.id.padEnd( 28 ) + ' ' + job.pages.length + ' pages, ' + job.fields.length + ' fields, ' + units.length + ' units, ' + units.filter( ( u ) => u.skip ).length + ' not asked, '
        + units.filter( ( u ) => u.question ).length + ' with a question, ' + ( client.state.calls - before ) + ' calls  → ' + file );
    await fs.rm( jobDir( job.id ), { recursive: true, force: true } );
}
close();
