import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Smoke test of the server without a model: start it on a free port and start a job from a shipped form, which
// is ready at once because the form was captured beforehand. Then the pipeline is run over it anyway, as for a
// new form: a shipped form is read from the text layer of its PDF, so the fields have their labels without a
// key; the dialogue of that run comes without questions.
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
    const { id, pages, ready } = await created.json();
    check( created.status === 201 && pages === 2, 'POST /api/jobs/from/betreibungsbegehren creates a job with two pages' );
    const atOnce = await ( await fetch( base + '/api/jobs/' + id ) ).json();
    check( ready === true && atOnce.run.step === 'done' && atOnce.job.fields.length > 0 && atOnce.job.dialogue.units.some( ( u ) => u.question ),
        'a shipped form was captured beforehand: the job has fields and questions before any pipeline ran (' + atOnce.job.dialogue.units.filter( ( u ) => u.question ).length + ' questions)' );

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
    const labelled = state.job.fields.filter( ( f ) => f.label ).length;
    check( labelled > 0 && state.job.blocks.some( ( b ) => b.type === 'text' && b.isOCR === false ) && !state.job.blocks.some( ( b ) => b.isOCR === true ), 'a shipped form is read from its text layer (' + labelled + ' of ' + state.job.fields.length + ' fields with a label)' );
    const inUnits = new Set( ( state.job.dialogue?.units || [] ).flatMap( ( u ) => u.fields ) );
    check( state.job.fields.every( ( f ) => ( f.kind === 'signature' ) !== inUnits.has( f.id ) ) && state.job.dialogue.model === null,
        'job has its dialogue: every field but the signature in a unit (' + ( state.job.dialogue?.units || [] ).length + '), no question without a model' );

    const image = await fetch( base + '/api/jobs/' + id + '/pages/1/fields.png' );
    check( image.status === 200 && image.headers.get( 'content-type' ) === 'image/png', 'GET /api/jobs/:id/pages/1/fields.png serves the control image' );

    const draft = await ( await fetch( base + '/api/jobs/' + id + '/draft' ) ).json();
    check( draft.pdf === '/api/jobs/' + id + '/output.pdf' && draft.to.includes( '@' ), 'GET /api/jobs/:id/draft gives recipient and PDF link' );

    const pdf = await fetch( base + '/api/jobs/' + id + '/output.pdf' );
    const pdfBytes = new Uint8Array( await pdf.arrayBuffer() );
    check( pdf.status === 200 && pdf.headers.get( 'content-type' ) === 'application/pdf' && String.fromCharCode( ...pdfBytes.slice( 0, 5 ) ) === '%PDF-', 'GET /api/jobs/:id/output.pdf serves the output PDF (' + pdfBytes.length + ' bytes)' );

    const sent = await fetch( base + '/api/jobs/' + id + '/send', { method: 'POST' } );
    const after = await sent.json();
    check( sent.status === 200 && after.job.status === 'sent' && after.job.history.some( ( h ) => h.event === 'exported' ), 'POST /api/jobs/:id/send marks the job sent' );

    // the dialogue answered question by question, on a job of its own
    const other = await ( await fetch( base + '/api/jobs/from/arbeitsfaehigkeitszeugnis', { method: 'POST' } ) ).json();
    await fetch( base + '/api/jobs/' + other.id + '/run', { method: 'POST' } );
    let asked;
    do {
        await new Promise( ( r ) => setTimeout( r, 500 ) );
        asked = await ( await fetch( base + '/api/jobs/' + other.id ) ).json();
    } while ( ![ 'done', 'error' ].includes( asked.run.step ) && Date.now() - started < 2 * WAIT );
    const reply = ( unit, data ) => fetch( base + '/api/jobs/' + other.id + '/answers/' + unit, { method: 'POST', body: JSON.stringify( data ) } );
    const kindOf = ( id ) => asked.job.fields.find( ( f ) => f.id === id ).kind;
    const units = asked.job.dialogue.units.filter( ( u ) => !u.skip );
    const writing = units.find( ( u ) => u.fields.length === 1 && ![ 'checkbox', 'radio' ].includes( kindOf( u.fields[ 0 ] ) ) );
    const choice = units.find( ( u ) => u.kind === 'choice' );
    const typed = await reply( writing.id, { text: ' Chur ' } );
    const afterTyped = ( await typed.json() ).job;
    const field = afterTyped.fields.find( ( f ) => f.id === writing.fields[ 0 ] );
    check( typed.status === 200 && field.value === 'Chur' && field.source.how === 'entered' && afterTyped.status === 'captured', 'POST /api/jobs/:id/answers/:unit takes a typed answer as the value of its field' );
    check( ( await reply( 'q999', { text: 'x' } ) ).status === 404, 'an answer to a question the form does not have is refused' );
    check( ( await reply( choice.id, { text: 'ja' } ) ).status === 503 && ( await reply( writing.id, { pieces: [ 1 ] } ) ).status === 503, 'an answer the model would have to read is refused without a key' );
    let last = afterTyped;
    for ( const u of units.filter( ( x ) => x.id !== writing.id ) ) {
        last = ( await ( await reply( u.id, { skip: true } ) ).json() ).job;
    }
    check( last.status === 'filled' && last.history.some( ( h ) => h.event === 'filled' ) && last.fields.find( ( f ) => f.id === writing.fields[ 0 ] ).value === 'Chur',
        'with the last question ticked off the form is filled (' + units.length + ' questions)' );

    const outside = await fetch( base + '/../package.json' );
    check( outside.status === 404 || outside.status === 200 && !( await outside.text() ).includes( '"name"' ), 'static files stay inside the app folder' );
} catch ( error ) {
    check( false, 'request failed: ' + error.message );
}
await close();
process.exit( failed ? 1 : 0 );
