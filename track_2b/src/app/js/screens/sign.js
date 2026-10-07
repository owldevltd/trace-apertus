import { $ } from '../dom.js';
import { fieldsOf } from '../model.js';

// Send for signature: like a mail draft. The signature service is mocked.

export function open( ctx, entry ) {
    const { t, tpl } = ctx;
    const f = ctx.model.formOf( entry );
    const all = fieldsOf( f, entry.off );
    const ok = all.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'ok' ).length;
    const empty = all.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'empty' ).length;
    ctx.state.current = entry;
    ctx.body( 'sign' ).innerHTML = tpl.render( 'sign', {
        name: f.name,
        pdf: t( 'sign.pdf', { n: f.pages } ),
        ok: t( 'sign.ok', { n: ok } ),
        empty: empty ? t( 'sign.empty', { n: empty } ) : '',
        recipient: f.recipient,
        subject: f.subject,
        greeting: t( 'mail.greeting' ),
        body: t( 'mail.body', { f: f.name, d: ctx.i18n.date() } ),
        closing: t( 'mail.closing' ),
        me: t( 'more.me' ),
    } );
    ctx.router.push( 'sign' );
}

export function wire( ctx ) {
    $( '[data-send]', ctx.screen( 'sign' ) ).addEventListener( 'click', () => {
        const entry = ctx.state.current;
        const f = ctx.model.formOf( entry );
        entry.status = 'sent';
        entry.sent = ctx.now();
        ctx.store.touch();
        ctx.event( ctx.t( 'ev.sent', { f: f.name, r: f.recipient } ), f.id, entry.photo );
        ctx.toast( ctx.t( 'sign.toast' ) );
        ctx.router.finish( 'sent' );
    } );
}
