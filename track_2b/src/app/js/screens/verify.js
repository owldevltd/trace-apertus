import { $$, on } from '../dom.js';
import { escape } from '../template.js';
import { fieldsOf } from '../model.js';
import { api } from '../api.js';
import { drawPreview, wirePreview } from '../preview.js';
import { switchPane } from '../router.js';

// Verify: the recognized form with its fields; a person unticks what is not a field, looks at the page and
// the photo, then saves. A photographed or uploaded form goes through the pipeline on the server and comes
// back as a job; the template path of the walk-through stays mocked, the shipped forms take turns there.

const PILLS = [ 'fields', 'preview', 'photo' ];
const KIND = { checkbox: 'type.choice', radio: 'type.choice', signature: 'type.sign', multiline: 'type.long', date: 'type.date', text: 'type.text' };

// the mocked path: the next shipped form in turn
export function recognize( ctx ) {
    const { store, model, state } = ctx;
    const mocks = model.mocks;
    state.form = model.formOf( { formId: mocks[ store.get( 'mockIndex' ) % mocks.length ].id } );
    state.off = [];
    state.tab = 'fields';
    ctx.bottom( 'verify' ).innerHTML = '';
    ctx.body( 'verify' ).innerHTML = ctx.tpl.render( 'recognizing', { progress: '' } );
    ctx.router.push( 'verify' );
    setTimeout( () => render( ctx ), 1400 );
}

// the real path: the pages go to the server, the pipeline runs, the job comes back with fields and blocks
export async function startJob( ctx, pages ) {
    const { t, tpl, state } = ctx;
    state.form = null;
    state.off = [];
    state.tab = 'fields';
    const body = ctx.body( 'verify' );
    ctx.bottom( 'verify' ).innerHTML = '';
    const progress = ( text ) => {
        body.innerHTML = tpl.render( 'recognizing', { progress: text } );
    };
    progress( t( 'job.upload', { n: pages.length } ) );
    if ( ctx.router.top().id !== 'verify' ) {
        await ctx.router.push( 'verify' );
    }
    try {
        const { id } = await api.createJob( pages[ 0 ].blob );
        for ( const p of pages.slice( 1 ) ) {
            await api.addPage( id, p.blob );
        }
        await api.run( id );
        const { job, run } = await api.wait( id, ( r ) => progress( t( 'job.' + r.step, { n: r.page } ) ) );
        if ( run.step === 'error' ) {
            throw new Error( run.error || 'pipeline' );
        }
        state.form = ctx.model.keep( job );
        render( ctx );
    } catch ( error ) {
        body.innerHTML = '<div class="hero"><p class="eyebrow">' + escape( t( 'cam.title' ) ) + '</p>' + escape( t( 'job.failed', { e: error.message } ) ) + '</div>';
    }
}

export function render( ctx ) {
    const { t, tpl, state } = ctx;
    const f = state.form;
    const all = fieldsOf( f );
    const body = ctx.body( 'verify' );
    body.innerHTML = tpl.render( 'verify', {
        name: f.name,
        issuer: f.issuer,
        pages: t( 'pages', { n: f.pages } ),
        nfields: t( 'nfields', { n: all.length } ),
        pills: PILLS.map( ( key ) => ( { key, label: t( key ), on: state.tab === key } ) ),
        isFields: state.tab === 'fields',
        isPreview: state.tab === 'preview',
        isPhoto: state.tab === 'photo',
        card: t( 'verify.card', { f: f.name, i: f.issuer, n: all.length } ),
        sections: f.sections.map( ( s ) => ( { title: s.title, n: s.fields.length, fields: s.fields.map( ( fl ) => ( { id: fl.id, label: fl.label, on: !state.off.includes( fl.id ), type: t( KIND[ fl.kind ] || 'type.text' ) } ) ) } ) ),
        pvMeta: t( 'pv.meta', { n: f.pages } ),
        preview: drawPreview( f.sizes, f.blocks, all, null, state.off ),
        photo: state.photo,
    } );
    ctx.bottom( 'verify' ).innerHTML = '<button class="btn block press" data-save-form>' + escape( t( 'save' ) ) + '</button>';
    for ( const pv of body.querySelectorAll( '.pv' ) ) {
        wirePreview( pv, ( id ) => ctx.toast( all.find( ( x ) => x.id === id ).label ) );
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
    on( body, 'change', 'input[type=checkbox]', () => {
        ctx.state.off = $$( 'input[type=checkbox]', body ).filter( ( x ) => !x.checked ).map( ( x ) => x.dataset.field );
    } );
    on( body, 'click', '[data-camera]', () => ctx.router.pop() );
    on( ctx.bottom( 'verify' ), 'click', '[data-save-form]', () => {
        const { state, store, model } = ctx;
        const f = state.form;
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
