import { on } from '../dom.js';
import { api } from '../api.js';
import * as form from './form.js';
import * as verify from './verify.js';

// Forms: what was captured and the forms that ship with the app. A shipped form was captured when it was put
// into the app, so choosing it opens it at once; recognizing is what happens when a new form is photographed.
// In the demo the walk-through's two forms stand below, by kind.

const CHIP = { sent: 'accent', filled: 'warn', verified: '' };
const STATUS = { verified: 'st.verified', filled: 'st.filled', sent: 'st.sent' };

export function enter( ctx ) {
    const { t, store, tpl, body } = ctx;
    const entries = store.get( 'saved' ).map( ( e ) => ( { uid: e.uid, name: e.name, issuer: e.issuer, created: e.created, photo: e.photo, chip: CHIP[ e.status ], status: t( STATUS[ e.status ] ) } ) );
    const byKind = new Map();
    for ( const f of ctx.demo ? ctx.model.mocks : [] ) {
        if ( !byKind.has( f.kind ) ) {
            byKind.set( f.kind, { kind: f.kind, label: t( 'kind.' + f.kind ), ico: f.ico, items: [] } );
        }
        byKind.get( f.kind ).items.push( { id: f.id, name: f.name, issuer: f.issuer } );
    }
    const groups = [ ...byKind.values() ].map( ( g ) => ( { ...g, odd: g.items.length % 2 === 1 } ) );
    const shipped = ( ctx.state.shipped || [] ).map( ( f ) => ( { id: f.id, name: f.name, issuer: f.issuer, rebuilt: f.origin === 'rebuilt' ? t( 'shipped.rebuilt' ) : '' } ) );
    body( 'forms' ).innerHTML = tpl.render( 'forms', { entries, groups, shipped } );
    // the list of shipped forms comes from the server, once
    if ( !ctx.state.shipped ) {
        ctx.state.shipped = [];
        api.forms().then( ( list ) => {
            ctx.state.shipped = list;
            if ( list.length && ctx.router.top().id === 'forms' ) {
                enter( ctx );
            }
        } ).catch( () => {} );
    }
}

export function wire( ctx ) {
    const el = ctx.body( 'forms' );
    on( el, 'click', '[data-open]', ( b ) => {
        ctx.state.tab = 'fields';
        form.show( ctx, ctx.store.entry( b.dataset.open ) );
    } );
    on( el, 'click', '[data-shipped]', ( b ) => openShipped( ctx, b.dataset.shipped ) );
    on( el, 'click', '[data-template]', ( b ) => {
        const f = ctx.model.formOf( { formId: b.dataset.template } );
        const entry = ctx.store.addEntry( { uid: Date.now().toString( 36 ), formId: f.id, name: f.name, issuer: f.issuer, photo: null, off: [], status: 'verified', created: ctx.now(), values: null } );
        ctx.state.tab = 'fields';
        form.show( ctx, entry );
    } );
}

// A shipped form: the server makes a job of it, ready with fields and questions, and it opens like a saved
// form. One that was never captured goes through the pipeline first, like a photographed form.
async function openShipped( ctx, id ) {
    try {
        const started = await api.fromForm( id );
        if ( !started.ready ) {
            verify.startForm( ctx, started.id );
            return;
        }
        const { job } = await api.job( started.id );
        const f = ctx.model.keep( job );
        const entry = ctx.store.addEntry( { uid: Date.now().toString( 36 ), jobId: job.id, name: f.name, issuer: f.issuer, photo: null, off: [], status: 'verified', created: ctx.now(), values: null } );
        ctx.state.tab = 'fields';
        form.show( ctx, entry );
    } catch ( error ) {
        ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
    }
}
