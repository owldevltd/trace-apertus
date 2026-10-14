import { $ } from '../dom.js';
import { fieldsOf } from '../model.js';
import { api } from '../api.js';

// Send for signature: like a mail draft, with the filled PDF attached. For a job the server writes the PDF and
// marks the form sent; the signature service itself is mocked.

export async function open( ctx, entry ) {
    const { t, tpl } = ctx;
    const f = ctx.model.formOf( entry );
    const all = fieldsOf( f, entry.off );
    const ok = all.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'ok' ).length;
    const empty = all.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'empty' ).length;
    // what is required and empty does not keep the form from going out; the person is told
    const missing = all.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'missing' ).length;
    ctx.state.current = entry;
    let draft = { to: f.recipient, subject: f.subject, pdf: null };
    if ( entry.jobId ) {
        try {
            draft = await api.draft( entry.jobId );
        } catch ( error ) {
            ctx.toast( t( 'job.failed', { e: error.message } ) );
        }
    }
    ctx.body( 'sign' ).innerHTML = tpl.render( 'sign', {
        name: f.name,
        pdf: t( 'sign.pdf', { n: f.pages } ),
        pdfUrl: draft.pdf,
        ok: t( 'sign.ok', { n: ok } ),
        empty: empty ? t( 'sign.empty', { n: empty } ) : '',
        missing: missing ? t( 'sign.missing', { n: missing } ) : '',
        recipient: draft.to || t( 'sign.norecipient' ),
        subject: draft.subject,
        greeting: t( 'mail.greeting' ),
        body: t( 'mail.body', { f: f.name, d: ctx.i18n.date() } ),
        closing: t( 'mail.closing' ),
    } );
    ctx.router.push( 'sign' );
}

export function wire( ctx ) {
    $( '[data-send]', ctx.screen( 'sign' ) ).addEventListener( 'click', async () => {
        const entry = ctx.state.current;
        const f = ctx.model.formOf( entry );
        if ( entry.jobId ) {
            try {
                const { job } = await api.send( entry.jobId );
                ctx.model.keep( job );
            } catch ( error ) {
                ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
                return;
            }
        }
        entry.status = 'sent';
        entry.sent = ctx.now();
        ctx.store.touch();
        ctx.event( ctx.t( 'ev.sent', { f: f.name, r: f.recipient || '' } ), f.id, entry.photo );
        ctx.toast( ctx.t( 'sign.toast' ) );
        ctx.router.finish( 'sent' );
    } );
}
