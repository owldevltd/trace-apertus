import { on } from '../dom.js';
import * as form from './form.js';
import * as listen from '../listen.js';

// Today: a headline on where things stand, the to-dos per saved form, and what happened today.

export function enter( ctx ) {
    const { t, store, tpl, body } = ctx;
    const saved = store.get( 'saved' );
    const count = ( status ) => saved.filter( ( e ) => e.status === status ).length;
    const n = saved.length;
    const filled = count( 'filled' );
    const empty = count( 'verified' );
    const sentN = count( 'sent' );
    const head = !n ? t( 'home.none' ) : filled ? t( 'home.review', { n: filled } ) : empty ? t( 'home.ready', { n: empty } ) : t( 'home.sent' );
    const card = !n ? t( 'home.card0' ) : t( 'home.card', { n, e: empty, f: filled, s: sentN } ) + ' ' + ( filled ? t( 'home.card.review' ) : empty ? t( 'home.card.dictate' ) : '' );
    const todos = saved.slice( 0, 6 ).map( ( e ) => {
        const done = e.status === 'sent';
        return {
            uid: e.uid,
            done,
            review: e.status === 'filled',
            dictate: e.status === 'verified',
            text: done ? t( 'todo.sent', { f: e.name } ) : e.status === 'filled' ? t( 'todo.review', { f: e.name } ) : t( 'todo.dictate', { f: e.name } ),
            issuer: e.issuer,
            created: e.created,
        };
    } );
    const events = store.get( 'events' ).map( ( e ) => ( { ...e, issuer: e.issuer || '' } ) );
    body( 'home' ).innerHTML = tpl.render( 'home', { date: ctx.i18n.longDate(), head, card, todos, events } );
}

export function wire( ctx ) {
    const el = ctx.body( 'home' );
    on( el, 'click', '[data-open]', ( b ) => {
        ctx.state.tab = 'fields';
        form.show( ctx, ctx.store.entry( b.dataset.open ) );
    } );
    on( el, 'click', '[data-listen]', async ( b ) => {
        const entry = ctx.store.entry( b.dataset.listen );
        ctx.state.tab = 'fields';
        await form.show( ctx, entry );
        listen.start( ctx, entry );
    } );
}
