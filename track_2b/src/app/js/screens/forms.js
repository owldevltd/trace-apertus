import { on } from '../dom.js';
import * as form from './form.js';

// Forms: what was captured, and the templates by kind.

const CHIP = { sent: 'accent', filled: 'warn', verified: '' };
const STATUS = { verified: 'st.verified', filled: 'st.filled', sent: 'st.sent' };

export function enter( ctx ) {
    const { t, store, tpl, body } = ctx;
    const entries = store.get( 'saved' ).map( ( e ) => ( { uid: e.uid, name: e.name, issuer: e.issuer, created: e.created, photo: e.photo, chip: CHIP[ e.status ], status: t( STATUS[ e.status ] ) } ) );
    const byKind = new Map();
    for ( const f of ctx.model.mocks ) {
        if ( !byKind.has( f.kind ) ) {
            byKind.set( f.kind, { kind: f.kind, label: t( 'kind.' + f.kind ), ico: f.ico, items: [] } );
        }
        byKind.get( f.kind ).items.push( { id: f.id, name: f.name, issuer: f.issuer } );
    }
    const groups = [ ...byKind.values() ].map( ( g ) => ( { ...g, odd: g.items.length % 2 === 1 } ) );
    body( 'forms' ).innerHTML = tpl.render( 'forms', { entries, groups } );
}

export function wire( ctx ) {
    const el = ctx.body( 'forms' );
    on( el, 'click', '[data-open]', ( b ) => {
        ctx.state.tab = 'fields';
        form.show( ctx, ctx.store.entry( b.dataset.open ) );
    } );
    on( el, 'click', '[data-template]', ( b ) => {
        const f = ctx.model.formOf( { formId: b.dataset.template } );
        const entry = ctx.store.addEntry( { uid: Date.now().toString( 36 ), formId: f.id, name: f.name, issuer: f.issuer, photo: null, off: [], status: 'verified', created: ctx.now(), values: null } );
        ctx.state.tab = 'fields';
        form.show( ctx, entry );
    } );
}
