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
process.env.LLM_API_KEY = '';
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

    // going on with questions open: the form is filled as far as the person wants it, what is required and
    // empty is a hint and not a lock
    const third = await ( await fetch( base + '/api/jobs/from/arbeitsfaehigkeitszeugnis', { method: 'POST' } ) ).json();
    const early = await fetch( base + '/api/jobs/' + third.id + '/review', { method: 'POST' } );
    const left = ( await early.json() ).job;
    const lacks = left.fields.filter( ( f ) => ( f.hints || [] ).some( ( h ) => h.kind === 'missing' ) ).length;
    check( early.status === 200 && left.status === 'filled' && left.history.some( ( h ) => h.event === 'filled' && /questions left open/.test( h.note ) ) && lacks > 0,
        'POST /api/jobs/:id/review fills the form with questions open; what is required shows as missing (' + lacks + ')' );
    const anyway = await fetch( base + '/api/jobs/' + third.id + '/send', { method: 'POST' } );
    const gone = ( await anyway.json() ).job;
    check( anyway.status === 200 && gone.status === 'sent' && gone.history.some( ( h ) => h.event === 'sent' && h.note === lacks + ' required left empty' ), 'a form with something required missing is sent all the same, and its history says so' );
    check( ( await fetch( base + '/api/jobs/' + third.id + '/review', { method: 'POST' } ) ).status === 409, 'a form that is sent is not gone on with' );

    // a form corrected by hand: a label, a place, a field taken away, one added, a question written, something
    // required; the job is put together anew, and the form is kept as one to choose from
    const fourth = await ( await fetch( base + '/api/jobs/from/arbeitsfaehigkeitszeugnis', { method: 'POST' } ) ).json();
    const whole4 = ( await ( await fetch( base + '/api/jobs/' + fourth.id ) ).json() ).job;
    const asked4 = whole4.dialogue.units.filter( ( u ) => !u.skip );
    const [ first4, out4 ] = asked4.filter( ( u ) => u.kind === 'single' && u.question );
    const kept4 = asked4.find( ( u ) => u.kind === 'choice' );
    const put4 = ( edit ) => fetch( base + '/api/jobs/' + fourth.id + '/form', { method: 'PUT', body: JSON.stringify( edit ) } );
    const list4 = whole4.fields.filter( ( f ) => !out4.fields.includes( f.id ) ).map( ( f ) => ( { id: f.id, page: f.page, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.kind, option: f.option, group: f.group } ) );
    Object.assign( list4.find( ( f ) => f.id === first4.fields[ 0 ] ), { label: 'Von Hand', x: whole4.fields.find( ( f ) => f.id === first4.fields[ 0 ] ).x + 30, question: 'Wie heisst sie?', required: true } );
    list4.push( { page: 1, x: 200, y: 3100, width: 500, height: 60, label: 'Neu von Hand', kind: 'text' } );
    const done4 = await put4( { name: 'Zeugnis von Hand', fields: list4 } );
    const made4 = ( await done4.json() ).job;
    const unit4 = made4.dialogue.units.find( ( u ) => u.fields[ 0 ] === first4.fields[ 0 ] );
    const new4 = made4.fields.find( ( f ) => f.label === 'Neu von Hand' );
    check( done4.status === 200 && made4.form.name === 'Zeugnis von Hand' && made4.fields.length === whole4.fields.length && !made4.fields.some( ( f ) => out4.fields.includes( f.id ) )
        && made4.fields.find( ( f ) => f.id === first4.fields[ 0 ] ).label === 'Von Hand' && unit4.question === 'Wie heisst sie?' && unit4.by === 'person' && unit4.required === true,
        'PUT /api/jobs/:id/form takes the corrections of a person: label, place, a field less, a question, required' );
    check( new4 && new4.by === 'person' && made4.dialogue.units.some( ( u ) => u.fields.includes( new4.id ) && !u.skip ) && made4.dialogue.units.length === whole4.dialogue.units.length
        && made4.dialogue.units.find( ( u ) => u.fields[ 0 ] === kept4.fields[ 0 ] ).question === kept4.question && made4.history.some( ( h ) => h.event === 'edited' ),
        'a field put there by hand is asked, the other questions stay, the history says the form was edited' );
    const kinds4 = await ( await fetch( base + '/api/forms' ) ).json();
    const mine4 = kinds4.find( ( f ) => f.own && f.id === made4.form.own );
    const again4 = mine4 ? await ( await fetch( base + '/api/jobs/from/' + mine4.id, { method: 'POST' } ) ).json() : {};
    const copy4 = again4.id ? ( await ( await fetch( base + '/api/jobs/' + again4.id ) ).json() ).job : { fields: [], dialogue: { units: [] }, form: {} };
    check( !!mine4 && mine4.name === 'Zeugnis von Hand' && again4.ready === true && copy4.fields.length === made4.fields.length && copy4.fields.some( ( f ) => f.label === 'Neu von Hand' )
        && copy4.dialogue.units.some( ( u ) => u.question === 'Wie heisst sie?' ) && copy4.form.own === mine4.id && !copy4.fields.some( ( f ) => f.value ),
        'the corrected form is kept as a form of its own, and a job made of it starts with the corrections' );
    check( ( await put4( { fields: [ { id: 'f99999', page: 1, x: 0, y: 0, width: 10, height: 10, label: '', kind: 'text' } ] } ) ).status === 400 && ( await put4( { name: 'x' } ) ).status === 400,
        'an edit that names a field the form does not have, or no fields at all, is refused' );

    // another language than the form's: nothing to do for the form's own, refused without a model
    const say = ( language ) => fetch( base + '/api/jobs/' + other.id + '/translate', { method: 'POST', body: JSON.stringify( { language } ) } );
    const own = await say( 'de' );
    check( own.status === 200 && ( await own.json() ).ready === true && ( await say( 'fr' ) ).status === 503 && ( await say( 'xx' ) ).status === 400,
        'POST /api/jobs/:id/translate has nothing to do for the form\'s own language and refuses another one without a key' );
    const values = await fetch( base + '/api/jobs/' + other.id + '/translate/values', { method: 'POST' } );
    check( values.status === 200 && ( await values.json() ).ready === true, 'POST /api/jobs/:id/translate/values has nothing to do for a form answered in its own language' );

    const outside = await fetch( base + '/../package.json' );
    check( outside.status === 404 || outside.status === 200 && !( await outside.text() ).includes( '"name"' ), 'static files stay inside the app folder' );
} catch ( error ) {
    check( false, 'request failed: ' + error.message );
}
await close();
process.exit( failed ? 1 : 0 );
