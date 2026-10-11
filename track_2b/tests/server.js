import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Smoke test of the server without a model: start it on a free port and start a job from a shipped form, which
// is ready at once because the form was captured beforehand. Then the pipeline is run over it anyway, as for a
// new form: a shipped form is read from the text layer of its PDF, so the fields have their labels without a
// key; the dialogue of that run comes without questions. Further down: the questions answered one by one, a form
// corrected by hand, and the values a field may take.
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
    // the job and its run are two files: asked for once more, the job is the one the finished run left
    state = await ( await fetch( base + '/api/jobs/' + id ) ).json();
    check( state.run.step === 'done', 'pipeline finishes (' + state.run.step + ( state.run.error ? ': ' + state.run.error : '' ) + ', ' + ( ( Date.now() - started ) / 1000 ).toFixed( 1 ) + 's)' );
    check( state.job.pages.every( ( p ) => p.width > 0 && p.height > 0 ), 'pages carry their size' );
    check( state.run.of > 0 && state.run.done >= 0 && state.run.done <= state.run.of, 'the run counts the calls of its last step: ' + state.run.done + ' of ' + state.run.of + ' planned' );
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

    // the values a field may take: a person sets the list when correcting the form; the field then takes an
    // entry of it and nothing else, typed, picked or changed, and the kept form carries the list
    const fifth = await ( await fetch( base + '/api/jobs/from/arbeitsfaehigkeitszeugnis', { method: 'POST' } ) ).json();
    const whole5 = ( await ( await fetch( base + '/api/jobs/' + fifth.id ) ).json() ).job;
    const unit5 = whole5.dialogue.units.find( ( u ) => !u.skip && u.kind === 'single' && whole5.fields.find( ( f ) => f.id === u.fields[ 0 ] ).kind === 'text' );
    const list5 = whole5.fields.map( ( f ) => ( { id: f.id, page: f.page, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.kind, option: f.option, group: f.group } ) );
    list5.find( ( f ) => f.id === unit5.fields[ 0 ] ).values = [ 'Büro', 'Werkstatt', 'Lager' ];
    const made5 = ( await ( await fetch( base + '/api/jobs/' + fifth.id + '/form', { method: 'PUT', body: JSON.stringify( { name: 'Zeugnis mit Liste', fields: list5 } ) } ) ).json() ).job;
    const field5 = () => fetch( base + '/api/jobs/' + fifth.id ).then( ( r ) => r.json() ).then( ( j ) => j.job.fields.find( ( f ) => f.id === unit5.fields[ 0 ] ) );
    check( JSON.stringify( made5.fields.find( ( f ) => f.id === unit5.fields[ 0 ] ).values ) === '["Büro","Werkstatt","Lager"]' && made5.schema === '2b-0.3'
        && made5.dialogue.units.find( ( u ) => u.fields[ 0 ] === unit5.fields[ 0 ] ).question === unit5.question,
        'PUT /api/jobs/:id/form gives a field the values it may take; its question stays as it was' );
    const reply5 = ( body ) => fetch( base + '/api/jobs/' + fifth.id + '/answers/' + made5.dialogue.units.find( ( u ) => u.fields[ 0 ] === unit5.fields[ 0 ] ).id, { method: 'POST', body: JSON.stringify( body ) } );
    const typed5 = await reply5( { text: 'werkstatt' } );
    const after5 = await field5();
    check( typed5.status === 200 && after5.value === 'Werkstatt' && after5.source.how === 'entered' && ( await reply5( { text: 'im Büro, glaube ich' } ) ).status === 503,
        'a typed answer that is an entry of the list is taken as that entry; other words would have to be read against the list by the model' );
    const decide5 = ( body ) => fetch( base + '/api/jobs/' + fifth.id + '/fields/' + unit5.fields[ 0 ], { method: 'PUT', body: JSON.stringify( body ) } );
    const refused5 = await decide5( { decision: 'changed', value: 'Projektleiter' } );
    const picked5 = await decide5( { decision: 'changed', value: 'Lager' } );
    check( refused5.status === 400 && JSON.stringify( ( await refused5.json() ).values ) === '["Büro","Werkstatt","Lager"]' && picked5.status === 200 && ( await field5() ).value === 'Lager',
        'a change to something that is not on the list is refused with the list; an entry of it is taken' );
    const own5 = ( await ( await fetch( base + '/api/forms' ) ).json() ).find( ( f ) => f.own && f.id === made5.form.own );
    const again5 = own5 ? await ( await fetch( base + '/api/jobs/from/' + own5.id, { method: 'POST' } ) ).json() : {};
    const copy5 = again5.id ? ( await ( await fetch( base + '/api/jobs/' + again5.id ) ).json() ).job : { fields: [] };
    check( copy5.fields.some( ( f ) => f.id === unit5.fields[ 0 ] && JSON.stringify( f.values ) === '["Büro","Werkstatt","Lager"]' && !f.value ),
        'the kept form carries the list: a job made of it starts with it, and with the field empty' );

    // the kind of a field: a person sets it when correcting the form; a typed answer stands as typed, and one
    // that is none of the field's kind is shown to the person once more
    const sixth = await ( await fetch( base + '/api/jobs/from/arbeitsfaehigkeitszeugnis', { method: 'POST' } ) ).json();
    const whole6 = ( await ( await fetch( base + '/api/jobs/' + sixth.id ) ).json() ).job;
    const unit6 = whole6.dialogue.units.find( ( u ) => !u.skip && u.kind === 'single' && whole6.fields.find( ( f ) => f.id === u.fields[ 0 ] ).label === 'Telefon' );
    const list6 = whole6.fields.map( ( f ) => ( { id: f.id, page: f.page, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.id === unit6.fields[ 0 ] ? 'email' : f.kind, option: f.option, group: f.group } ) );
    const made6 = ( await ( await fetch( base + '/api/jobs/' + sixth.id + '/form', { method: 'PUT', body: JSON.stringify( { name: 'Zeugnis mit Art', fields: list6 } ) } ) ).json() ).job;
    const field6 = () => fetch( base + '/api/jobs/' + sixth.id ).then( ( r ) => r.json() ).then( ( j ) => j.job.fields.find( ( f ) => f.id === unit6.fields[ 0 ] ) );
    const reply6 = ( body ) => fetch( base + '/api/jobs/' + sixth.id + '/answers/' + made6.dialogue.units.find( ( u ) => u.fields[ 0 ] === unit6.fields[ 0 ] ).id, { method: 'POST', body: JSON.stringify( body ) } );
    const set6 = made6.fields.find( ( f ) => f.id === unit6.fields[ 0 ] );
    check( set6.kind === 'email' && set6.kindBy === 'person' && ( await fetch( base + '/api/jobs/' + sixth.id + '/form', { method: 'PUT', body: JSON.stringify( { fields: list6.map( ( f ) => ( { ...f, kind: f.id === unit6.fields[ 0 ] ? 'fax' : f.kind } ) ) } ) } ) ).status === 400,
        'PUT /api/jobs/:id/form takes the kind a person sets for a field and says whose it is; a kind the contract does not have is refused' );
    await reply6( { text: 'Gregor.ch' } );
    const wrong6 = await field6();
    await reply6( { text: 'office@musterbau.ch' } );
    const right6 = await field6();
    check( wrong6.value === 'Gregor.ch' && wrong6.source.approve === true && wrong6.hints.some( ( h ) => h.kind === 'format' ) && right6.value === 'office@musterbau.ch' && right6.source.approve === false && !( right6.hints || [] ).some( ( h ) => h.kind === 'format' ),
        'a typed answer that is none of its field\'s kind stands as typed, with a format hint and a look asked for; one that fits asks for none' );
    const kept6 = ( await ( await fetch( base + '/api/forms' ) ).json() ).find( ( f ) => f.own && f.id === made6.form.own );
    const again6 = kept6 ? await ( await fetch( base + '/api/jobs/from/' + kept6.id, { method: 'POST' } ) ).json() : {};
    const copy6 = again6.id ? ( await ( await fetch( base + '/api/jobs/' + again6.id ) ).json() ).job : { fields: [] };
    check( copy6.fields.some( ( f ) => f.id === unit6.fields[ 0 ] && f.kind === 'email' && f.kindBy === 'person' ), 'the kept form carries the kind: a job made of it starts with it' );

    // a date printed as three boxes: typed as one date, code puts day, month and year into them, without a model
    const seventh = await ( await fetch( base + '/api/jobs/from/schadenmeldung-uvg', { method: 'POST' } ) ).json();
    const whole7 = ( await ( await fetch( base + '/api/jobs/' + seventh.id ) ).json() ).job;
    const unit7 = whole7.dialogue.units.find( ( u ) => u.parts === 'date' );
    const typed7 = await fetch( base + '/api/jobs/' + seventh.id + '/answers/' + unit7.id, { method: 'POST', body: JSON.stringify( { text: 'am 3. November 2025' } ) } );
    const after7 = ( await typed7.json() ).job;
    check( typed7.status === 200 && unit7.required === true && unit7.fields.map( ( id ) => after7.fields.find( ( f ) => f.id === id ).value ).join( '.' ) === '3.11.2025'
        && unit7.fields.every( ( id ) => after7.fields.find( ( f ) => f.id === id ).source.how === 'entered' ),
        'a date typed for its three boxes goes into them as day, month and year' );

    // a shipped form brings its dialogue in the other languages along: it opens in French at once, without the model
    const eighth = await ( await fetch( base + '/api/jobs/from/betreibungsbegehren', { method: 'POST' } ) ).json();
    const french8 = await fetch( base + '/api/jobs/' + eighth.id + '/translate', { method: 'POST', body: JSON.stringify( { language: 'fr' } ) } );
    const ready8 = ( await french8.json() ).ready;
    const job8 = ( await ( await fetch( base + '/api/jobs/' + eighth.id ) ).json() ).job;
    const own8 = ( job8.dialogue.translations || {} ).fr;
    check( french8.status === 200 && ready8 === true && job8.language === 'fr' && !!own8 && own8.model === null
        && job8.dialogue.units.every( ( u ) => own8.units[ u.id ] && own8.units[ u.id ].question && own8.units[ u.id ].label )
        && [ 'it', 'en' ].every( ( l ) => Object.keys( job8.dialogue.translations[ l ].units ).length === job8.dialogue.units.length ),
        'a shipped form opens in French at once: every question and label is there, translated by hand, and in Italian and English too' );

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
