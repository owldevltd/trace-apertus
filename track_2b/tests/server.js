import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Smoke test of the server without a model: start it on a free port, start a job from a shipped form, run the
// pipeline and wait for fields. The reading step is skipped without a key, so the fields come without labels.
//
//   node tests/server.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
process.env.STORAGE_DIR = path.join( root, 'storage', 'tests', 'server' );
process.env.API_KEY = '';
const { start } = await import( '../src/server.js' );

const WAIT = 120000;

const { port, close } = await start( 0 );
const base = 'http://localhost:' + port;
let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};

try {
    const forms = await ( await fetch( base + '/api/forms' ) ).json();
    check( Array.isArray( forms ) && forms.some( ( f ) => f.id === 'betreibungsbegehren' ), 'GET /api/forms lists the shipped forms (' + forms.length + ')' );

    const created = await fetch( base + '/api/jobs/from/betreibungsbegehren', { method: 'POST' } );
    const { id, pages } = await created.json();
    check( created.status === 201 && pages === 2, 'POST /api/jobs/from/betreibungsbegehren creates a job with two pages' );

    const bad = await fetch( base + '/api/jobs', { method: 'POST', body: 'not a png' } );
    check( bad.status === 415, 'POST /api/jobs refuses a body that is not a PNG' );

    const run = await fetch( base + '/api/jobs/' + id + '/run', { method: 'POST' } );
    check( run.status === 202, 'POST /api/jobs/:id/run answers at once' );

    const started = Date.now();
    let state;
    do {
        await new Promise( ( r ) => setTimeout( r, 500 ) );
        state = await ( await fetch( base + '/api/jobs/' + id ) ).json();
    } while ( ![ 'done', 'error' ].includes( state.run.step ) && Date.now() - started < WAIT );
    check( state.run.step === 'done', 'pipeline finishes (' + state.run.step + ( state.run.error ? ': ' + state.run.error : '' ) + ', ' + ( ( Date.now() - started ) / 1000 ).toFixed( 1 ) + 's)' );
    check( state.job.pages.every( ( p ) => p.width > 0 && p.height > 0 ), 'pages carry their size' );
    check( state.job.blocks.length > 0 && state.job.fields.length > 0, 'job has blocks (' + state.job.blocks.length + ') and fields (' + state.job.fields.length + ')' );
    check( state.job.fields.some( ( f ) => f.widget ), 'fields carry the widgets of the fillable original' );

    const image = await fetch( base + '/api/jobs/' + id + '/pages/1/fields.png' );
    check( image.status === 200 && image.headers.get( 'content-type' ) === 'image/png', 'GET /api/jobs/:id/pages/1/fields.png serves the control image' );

    const outside = await fetch( base + '/../package.json' );
    check( outside.status === 404 || outside.status === 200 && !( await outside.text() ).includes( '"name"' ), 'static files stay inside the app folder' );
} catch ( error ) {
    check( false, 'request failed: ' + error.message );
}
await close();
process.exit( failed ? 1 : 0 );
