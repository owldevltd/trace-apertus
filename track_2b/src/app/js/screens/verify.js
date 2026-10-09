import { $, $$, on } from '../dom.js';
import { escape } from '../template.js';
import { fieldsOf } from '../model.js';
import { api } from '../api.js';
import { drawPreview, wirePreview, offsets } from '../preview.js';
import { switchPane } from '../router.js';

// Verify: the recognized form with its fields, and the place where a person corrects what the pipeline got
// wrong. This is where a form is created: a photographed or uploaded form goes through the pipeline on the
// server and comes back as a job; the same mask opens again from a saved form. What the program itself doubts
// is marked red: a label the model read and the shape check does not believe, a field without any label. Every
// field can be changed, red or not: its label, its kind, the question it is asked with, whether it is required;
// on the page it is moved with the finger or the mouse and, with a mouse, sized at its corner; a field that is
// none is unticked, one that is missing is put on the page. Saving sends the whole list to the server, which
// puts the job together anew and keeps the form as a form of its own.
// In the demo the recognition is made up, the walk-through's two forms take turns, and a field can only be
// unticked.

const PILLS = [ 'fields', 'preview', 'photo' ];
const KIND = { checkbox: 'type.choice', radio: 'type.choice', signature: 'type.sign', multiline: 'type.long', date: 'type.date', text: 'type.text', number: 'type.number' };
// the kinds a person can choose from, by what they are called in the mask
const KINDS = [ [ 'text', 'type.text' ], [ 'multiline', 'type.long' ], [ 'date', 'type.date' ], [ 'number', 'type.number' ], [ 'checkbox', 'type.box' ], [ 'radio', 'type.radio' ], [ 'signature', 'type.sign' ] ];
const MARK = [ 'checkbox', 'radio' ];

// a new field where the page has none to take the size from, and the corner a field is sized at, in page pixels
const FIELD = [ 600, 64 ];
const CORNER = 56;

// the mocked path: the next shipped form in turn
export function recognize( ctx ) {
    const { store, model, state } = ctx;
    const mocks = model.mocks;
    state.form = model.formOf( { formId: mocks[ store.get( 'mockIndex' ) % mocks.length ].id } );
    state.off = [];
    state.work = null;
    state.editing = null;
    state.tab = 'fields';
    ctx.bottom( 'verify' ).innerHTML = '';
    ctx.body( 'verify' ).innerHTML = ctx.tpl.render( 'recognizing', { progress: '' } );
    ctx.router.push( 'verify' );
    setTimeout( () => render( ctx ), 1400 );
}

// the real path: the pages go to the server, the pipeline runs, the job comes back with fields and blocks
export function startJob( ctx, pages ) {
    return runJob( ctx, async ( progress ) => {
        progress( ctx.t( 'job.upload', { n: pages.length } ) );
        const { id } = await api.createJob( pages[ 0 ].blob );
        for ( const p of pages.slice( 1 ) ) {
            await api.addPage( id, p.blob );
        }
        return id;
    } );
}

// a shipped form that was never captured: its job exists on the server, and the same pipeline runs
export function startForm( ctx, id ) {
    ctx.state.photo = null;
    return runJob( ctx, async () => id );
}

// A saved form opened again to be corrected: the same mask, on the job as it stands. done(): what happens once
// it is saved.
export function edit( ctx, entry, done ) {
    const { state } = ctx;
    state.form = ctx.model.formOf( entry );
    state.photo = entry.photo;
    state.off = [];
    state.tab = 'fields';
    state.editing = { entry, done };
    begin( ctx );
    render( ctx );
    ctx.router.push( 'verify' );
}

// create: makes the job on the server and resolves with its id
async function runJob( ctx, create ) {
    const { t, tpl, state } = ctx;
    state.form = null;
    state.off = [];
    state.work = null;
    state.editing = null;
    state.tab = 'fields';
    const body = ctx.body( 'verify' );
    ctx.bottom( 'verify' ).innerHTML = '';
    const progress = ( text ) => {
        body.innerHTML = tpl.render( 'recognizing', { progress: text } );
    };
    progress( t( 'job.idle' ) );
    if ( ctx.router.top().id !== 'verify' ) {
        await ctx.router.push( 'verify' );
    }
    try {
        const id = await create( progress );
        await api.run( id );
        const { job, run } = await api.wait( id, ( r ) => progress( t( 'job.' + r.step, { n: r.page } ) ) );
        if ( run.step === 'error' ) {
            throw new Error( run.error || 'pipeline' );
        }
        state.form = ctx.model.keep( job );
        begin( ctx );
        render( ctx );
    } catch ( error ) {
        body.innerHTML = '<div class="hero"><p class="eyebrow">' + escape( t( 'cam.title' ) ) + '</p>' + escape( t( 'job.failed', { e: error.message } ) ) + '</div>';
    }
}

// The working copy of a job's form while a person corrects it: every field with its place in page pixels and
// what can be said about it. question and required belong to the unit and stand at its first field; join says
// that a tick mark belongs to the choice of the mark before it.
function begin( ctx ) {
    const { state, t } = ctx;
    const f = state.form;
    const fields = fieldsOf( f ).map( ( fl ) => ( {
        key: fl.id, id: fl.id, page: fl.page || 1, x: fl.x, y: fl.y, w: fl.w, h: fl.h, label: fl.bare ? '' : fl.label, kind: fl.kind, option: fl.opt || '', group: fl.group || '',
        doubt: !!fl.doubt, on: true, unit: fl.id in f.asks, question: f.asks[ fl.id ]?.question || '', required: !!f.asks[ fl.id ]?.required,
    } ) );
    let before = null;
    for ( const w of fields ) {
        if ( MARK.includes( w.kind ) ) {
            w.join = !!w.group && !!before && before.page === w.page && before.group === w.group;
            before = w;
        }
    }
    // a form made of another one becomes a form of its own when it is saved: it gets a name that says so
    const name = state.editing && f.made && !f.own ? f.name + ' ' + t( 'edit.suffix' ) : f.name;
    state.work = { name, fields, added: 0, sel: null, placing: false, views: [ {}, {} ] };
}

export function render( ctx ) {
    const { t, tpl, state } = ctx;
    const f = state.form;
    const work = state.work;
    const all = fieldsOf( f );
    const body = ctx.body( 'verify' );
    const shown = work ? work.fields : all;
    const row = ( fl ) => ( { id: fl.id, label: fl.label, on: !state.off.includes( fl.id ), type: t( KIND[ fl.kind ] || 'type.text' ) } );
    const mine = ( w ) => ( {
        key: w.key,
        label: w.label || t( 'edit.nolabel' ),
        raw: w.label,
        type: t( KIND[ w.kind ] || 'type.text' ),
        on: w.on,
        doubt: w.doubt && w.on,
        open: work.sel === w.key,
        kinds: KINDS.map( ( [ value, key ] ) => ( { value, label: t( key ), on: value === w.kind } ) ),
        mark: MARK.includes( w.kind ),
        option: w.option,
        join: !!w.join,
        unit: w.unit,
        question: w.question,
        required: w.required,
    } );
    const doubts = work ? work.fields.filter( ( w ) => w.doubt && w.on ).length : 0;
    const chosen = work && work.fields.find( ( w ) => w.key === work.sel );
    // the page with the fields as they stand in the working copy: red what is doubted, dashed what is unticked
    const drawn = work
        ? drawPreview( f.sizes, f.blocks, work.fields.map( ( w ) => ( { ...w, id: w.key } ) ), Object.fromEntries( work.fields.filter( ( w ) => w.doubt ).map( ( w ) => [ w.key, [ '', 'missing' ] ] ) ), work.fields.filter( ( w ) => !w.on ).map( ( w ) => w.key ) )
            .replace( /data-field="([^"]+)"/g, ( m, key ) => m + ( key === work.sel ? ' class="chosen"' : '' ) )
        : drawPreview( f.sizes, f.blocks, all, null, state.off );
    body.innerHTML = tpl.render( 'verify', {
        name: work ? work.name : f.name,
        issuer: f.issuer,
        pages: t( 'pages', { n: f.pages } ),
        nfields: t( 'nfields', { n: shown.filter( ( x ) => x.on !== false ).length } ),
        pills: PILLS.map( ( key ) => ( { key, label: t( key === 'preview' && work ? 'edit.page' : key ), on: state.tab === key } ) ),
        isFields: state.tab === 'fields',
        isPreview: state.tab === 'preview',
        isPhoto: state.tab === 'photo',
        edit: !!work,
        card: work ? t( 'edit.card', { n: work.fields.length } ) : t( 'verify.card', { f: f.name, i: f.issuer, n: all.length } ),
        doubts: doubts ? t( 'edit.doubts', { n: doubts } ) : '',
        sections: work
            ? f.sizes.map( ( _, i ) => ( { title: t( 'page', { n: i + 1 } ), fields: work.fields.filter( ( w ) => w.page === i + 1 ).map( mine ) } ) ).map( ( s ) => ( { ...s, n: s.fields.length } ) ).filter( ( s ) => s.n )
            : f.sections.map( ( s ) => ( { title: s.title, n: s.fields.length, fields: s.fields.map( row ) } ) ),
        pvHint: t( work ? ( work.placing ? 'edit.place' : 'edit.pv' ) : 'verify.pv' ),
        chosen: chosen ? t( 'edit.selected', { l: chosen.label || t( 'edit.nolabel' ) } ) : '',
        pvMeta: t( 'pv.meta', { n: f.pages } ),
        preview: drawn,
        photo: state.photo,
    } );
    ctx.bottom( 'verify' ).innerHTML = '<button class="btn block press" data-save-form>' + escape( t( 'save' ) ) + '</button>';
    $$( '.pv', body ).forEach( ( pv, i ) => {
        if ( !work ) {
            wirePreview( pv, ( id ) => ctx.toast( all.find( ( x ) => x.id === id ).label ) );
            return;
        }
        // the corner to size the chosen field at, where there is a mouse to take it with
        const svg = $( 'svg', pv );
        if ( chosen && chosen.on && ( state.mouse || matchMedia( '(pointer: fine)' ).matches ) ) {
            const top = offsets( f.sizes )[ chosen.page - 1 ] || 0;
            svg.insertAdjacentHTML( 'beforeend', '<rect class="corner" data-handle="' + escape( chosen.key ) + '" x="' + ( chosen.x + chosen.w - CORNER / 2 ) + '" y="' + ( chosen.y + top + chosen.h - CORNER / 2 ) + '" width="' + CORNER + '" height="' + CORNER + '" rx="10"/>' );
        }
        wirePreview( pv, ( key ) => pick( ctx, key, 'page' ), {
            view: work.views[ i ],
            placing: () => work.placing,
            onPlace: ( p ) => place( ctx, p ),
            onMove: ( key, dx, dy ) => moved( ctx, key, dx, dy, 0, 0 ),
            onResize: ( key, dw, dh ) => moved( ctx, key, 0, 0, dw, dh ),
        } );
    } );
}

// A field is chosen: its row opens in the list, the page shows it. where: 'row' when its row was tapped (a
// second tap closes it), 'list' to go to its row from the page, 'page' when it was tapped on the page.
function pick( ctx, key, where ) {
    const work = ctx.state.work;
    work.sel = work.sel === key && where === 'row' ? null : key;
    work.placing = false;
    if ( where !== 'page' ) {
        ctx.state.tab = 'fields';
    }
    render( ctx );
    if ( work.sel ) {
        $( '[data-row="' + CSS.escape( work.sel ) + '"]', ctx.body( 'verify' ) )?.scrollIntoView( { block: 'nearest', behavior: 'smooth' } );
    }
}

// A field was moved or sized on the page: it stays inside its page and keeps a size one can hit.
function moved( ctx, key, dx, dy, dw, dh ) {
    const { state } = ctx;
    const w = state.work.fields.find( ( x ) => x.key === key );
    const size = state.form.sizes[ w.page - 1 ];
    w.w = Math.round( Math.max( 12, Math.min( w.w + dw, size.w - w.x ) ) );
    w.h = Math.round( Math.max( 12, Math.min( w.h + dh, size.h - w.y ) ) );
    w.x = Math.round( Math.max( 0, Math.min( w.x + dx, size.w - w.w ) ) );
    w.y = Math.round( Math.max( 0, Math.min( w.y + dy, size.h - w.h ) ) );
    state.work.sel = key;
    render( ctx );
}

// A new field where the person tapped: a text field of the size the fields of that page usually have.
function place( ctx, p ) {
    const { state } = ctx;
    const work = state.work;
    const tops = offsets( state.form.sizes );
    const page = Math.max( 1, tops.filter( ( top ) => p.y >= top ).length );
    const size = state.form.sizes[ page - 1 ];
    const like = work.fields.filter( ( w ) => w.page === page && !MARK.includes( w.kind ) && w.kind !== 'signature' ).sort( ( a, b ) => a.h - b.h );
    const mid = like[ Math.floor( like.length / 2 ) ];
    const [ width, height ] = mid ? [ Math.min( mid.w, FIELD[ 0 ] ), mid.h ] : FIELD;
    const key = 'new' + ( ++work.added );
    work.fields.push( {
        key, id: null, page, w: width, h: height, label: '', kind: 'text', option: '', group: '', doubt: false, on: true, unit: true, question: '', required: false, join: false,
        x: Math.round( Math.max( 0, Math.min( p.x - width / 2, size.w - width ) ) ),
        y: Math.round( Math.max( 0, Math.min( p.y - tops[ page - 1 ] - height / 2, size.h - height ) ) ),
    } );
    work.sel = key;
    work.placing = false;
    render( ctx );
}

// What a person typed or chose in the open row goes into the working copy.
function set( ctx, el ) {
    const work = ctx.state.work;
    const w = work.fields.find( ( x ) => x.key === el.closest( '[data-row]' ).dataset.row );
    const name = el.dataset.set;
    if ( el.type === 'checkbox' ) {
        w[ name ] = el.checked;
        w.joined = name === 'join' ? true : w.joined;
        return;
    }
    w[ name ] = el.value.trim();
    if ( name === 'label' ) {
        // a label a person wrote is not doubted any more
        w.doubt = false;
    }
    if ( name === 'label' || name === 'kind' ) {
        render( ctx );
    }
}

// The edit as the server takes it: the fields that are still fields, each with its place and what was said about
// it. A tick mark a person joined to the one before it takes that one's group, and gives it one where it had
// none; one a person took out of its choice stands alone.
function edited( work ) {
    let before = null;
    for ( const w of work.fields.filter( ( x ) => x.on && MARK.includes( x.kind ) ) ) {
        if ( w.joined && w.join && before && before.page === w.page ) {
            before.group = before.group || 'g-' + before.key;
            w.group = before.group;
        } else if ( w.joined && !w.join ) {
            w.group = '';
        }
        before = w;
    }
    return {
        name: work.name,
        fields: work.fields.filter( ( w ) => w.on ).map( ( w ) => ( {
            ...( w.id ? { id: w.id } : {} ), page: w.page, x: w.x, y: w.y, width: w.w, height: w.h, label: w.label, kind: w.kind,
            ...( MARK.includes( w.kind ) ? { option: w.option, group: w.group } : {} ),
            ...( w.unit ? { question: w.question, required: w.required } : {} ),
        } ) ),
    };
}

// Saving a job's form: the edit goes to the server, which builds the job anew; where the model has to write
// questions for what changed, the page says how far that is. Resolves with the job, or null when it failed.
async function save( ctx ) {
    const { t, state } = ctx;
    const id = state.form.jobId;
    const body = ctx.body( 'verify' );
    const edit = edited( state.work );
    body.innerHTML = ctx.tpl.render( 'recognizing', { title: t( 'edit.saving' ), steps: [ t( 'edit.s1' ), t( 'edit.s2' ) ], progress: t( 'edit.wait' ), bar: { pct: 0 } } );
    ctx.bottom( 'verify' ).innerHTML = '';
    try {
        const started = await api.saveForm( id, edit );
        if ( started.ready ) {
            return started.job;
        }
        const { job, run } = await api.wait( id, ( r ) => {
            const bar = $( '[data-bar]', body );
            if ( bar && r.step === 'edit' && r.of ) {
                bar.style.width = Math.round( 100 * r.page / r.of ) + '%';
            }
        }, 700 );
        if ( run.step === 'error' ) {
            throw new Error( run.error || 'edit' );
        }
        return job;
    } catch ( error ) {
        ctx.toast( t( 'job.failed', { e: error.message } ) );
        render( ctx );
        return null;
    }
}

export function wire( ctx ) {
    const body = ctx.body( 'verify' );
    on( body, 'click', '[data-pill]', ( b ) => {
        const key = b.dataset.pill;
        if ( key === ctx.state.tab ) {
            return;
        }
        const dir = PILLS.indexOf( key ) >= PILLS.indexOf( ctx.state.tab ) ? 1 : -1;
        switchPane( body, dir, () => {
            ctx.state.tab = key;
            render( ctx );
        } );
    } );
    on( body, 'change', 'input[data-field]', () => {
        ctx.state.off = $$( 'input[data-field]', body ).filter( ( x ) => !x.checked ).map( ( x ) => x.dataset.field );
    } );
    // correcting a job's form
    on( body, 'change', '[data-on]', ( el ) => {
        ctx.state.work.fields.find( ( w ) => w.key === el.dataset.on ).on = el.checked;
        render( ctx );
    } );
    on( body, 'click', '[data-pick]', ( b ) => pick( ctx, b.dataset.pick, 'row' ) );
    on( body, 'change', '[data-set]', ( el ) => set( ctx, el ) );
    on( body, 'change', '[data-name]', ( el ) => {
        ctx.state.work.name = el.value.trim() || ctx.state.work.name;
    } );
    on( body, 'click', '[data-goto]', () => pick( ctx, ctx.state.work.sel, 'list' ) );
    // a field is sized at its corner where there is a mouse to take the corner with: known from the pointer
    // itself, since a touch screen can have a mouse too
    body.addEventListener( 'pointermove', ( e ) => {
        if ( e.pointerType === 'mouse' && !ctx.state.mouse ) {
            ctx.state.mouse = true;
            if ( ctx.state.work && ctx.state.work.sel ) {
                render( ctx );
            }
        }
    } );
    on( body, 'click', '[data-add]', () => {
        // the next tap on the page says where; on a narrow screen the page is a tab of its own
        ctx.state.work.placing = true;
        if ( !matchMedia( '(min-width: 700px)' ).matches ) {
            ctx.state.tab = 'preview';
        }
        render( ctx );
        ctx.toast( ctx.t( 'edit.place' ) );
    } );
    on( body, 'click', '[data-camera]', () => ctx.router.pop() );
    on( ctx.bottom( 'verify' ), 'click', '[data-save-form]', async () => {
        const { state, store, model } = ctx;
        const editing = state.editing;
        let f = state.form;
        if ( state.work ) {
            // a field that is still open in the list takes what was typed last
            document.activeElement?.blur?.();
            const job = await save( ctx );
            if ( !job ) {
                return;
            }
            f = model.keep( job );
            // the form is one to choose from now
            state.shipped = null;
        }
        if ( editing ) {
            Object.assign( editing.entry, { name: f.name, off: [] } );
            store.touch();
            ctx.toast( ctx.t( 'saved' ) );
            await ctx.router.pop();
            editing.done();
            return;
        }
        const n = fieldsOf( f ).length;
        store.addEntry( {
            uid: Date.now().toString( 36 ),
            ...( f.jobId ? { jobId: f.jobId } : { formId: f.id } ),
            name: f.name,
            issuer: f.issuer,
            photo: state.photo,
            off: [ ...state.off ],
            status: 'verified',
            created: ctx.now(),
            values: null,
        } );
        if ( !f.jobId ) {
            store.set( 'mockIndex', ( store.get( 'mockIndex' ) + 1 ) % model.mocks.length );
        }
        ctx.event( ctx.t( 'ev.captured', { f: f.name, a: n - state.off.length, b: n } ), f.id, state.photo );
        ctx.toast( ctx.t( 'saved' ) );
        ctx.router.finish( 'forms' );
    } );
}
