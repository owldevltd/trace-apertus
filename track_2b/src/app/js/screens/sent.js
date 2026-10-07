// Signature: what is on its way and waits for the recipient.

export function enter( ctx ) {
    const { t, store, tpl } = ctx;
    const entries = store.get( 'saved' ).filter( ( e ) => e.status === 'sent' ).map( ( e ) => {
        const f = ctx.model.formOf( e );
        return { name: e.name, photo: e.photo, to: t( 'sent.to', { r: f?.recipient || '', t: e.sent } ) };
    } );
    ctx.body( 'sent' ).innerHTML = tpl.render( 'sent', { entries } );
}
