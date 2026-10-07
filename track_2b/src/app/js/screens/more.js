import { on } from '../dom.js';
import { LANGUAGES } from '../i18n.js';

// More: the language, what is real and what is mocked, and the reset.

export function enter( ctx ) {
    const { i18n, tpl } = ctx;
    ctx.body( 'more' ).innerHTML = tpl.render( 'more', { langs: LANGUAGES.map( ( [ code, name ] ) => ( { code, name, on: code === i18n.lang } ) ) } );
}

export function wire( ctx ) {
    const el = ctx.body( 'more' );
    on( el, 'click', '[data-lang]', ( b ) => {
        ctx.i18n.set( b.dataset.lang );
        ctx.store.set( 'lang', ctx.i18n.lang );
        ctx.applyStatic();
        enter( ctx );
    } );
    on( el, 'click', '[data-reset]', () => {
        ctx.store.reset();
        ctx.toast( ctx.t( 'deleted' ) );
        ctx.router.root( 'home' );
    } );
}
