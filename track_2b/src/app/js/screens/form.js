import { $, on } from '../dom.js';
import { escape } from '../template.js';
import { fieldsOf } from '../model.js';
import { drawPreview, wirePreview } from '../preview.js';
import { switchPane } from '../router.js';
import * as record from './record.js';
import * as sign from './sign.js';

// One form: its fields with state and value, the page preview, the transcript, the legal texts. Before
// dictation the fields are empty and the button says "Start listening"; after it, every entry carries ok,
// unclear or missing, and unclear or missing ones ask for a decision.

const PILLS = [ 'fields', 'preview', 'transcript', 'legal' ];
const CHIP = { ok: [ 'ok', 'ok' ], unclear: [ 'warn', 'unclear' ], missing: [ 'bad', 'missing' ], empty: [ '', 'empty' ], sign: [ '', 'type.sign' ] };

// a job's form is fetched from the server the first time it is opened
export async function show( ctx, entry ) {
    if ( !ctx.model.formOf( entry ) ) {
        ctx.body( 'form' ).innerHTML = '<div class="grey row"><div class="spinner"></div></div>';
        ctx.bottom( 'form' ).innerHTML = '';
        if ( ctx.router.top().id !== 'form' ) {
            ctx.router.push( 'form' );
        }
        try {
            await ctx.model.loadForm( entry );
        } catch ( error ) {
            ctx.body( 'form' ).innerHTML = '<div class="hero">' + escape( ctx.t( 'job.failed', { e: error.message } ) ) + '</div>';
            return;
        }
    }
    render( ctx, entry );
    if ( ctx.router.top().id !== 'form' ) {
        ctx.router.push( 'form' );
    }
}

export function render( ctx, entry ) {
    const { t, tpl, state } = ctx;
    state.current = entry;
    const f = ctx.model.formOf( entry );
    const all = fieldsOf( f, entry.off );
    const filled = !!entry.values;
    const count = ( k ) => all.filter( ( fl ) => entry.values?.[ fl.id ]?.[ 1 ] === k ).length;
    const unclear = count( 'unclear' );
    const missing = count( 'missing' );
    const meta = filled
        ? [ t( 'meta.spoken', { d: entry.duration || '0:00' } ), t( 'meta.ok', { n: count( 'ok' ) } ), unclear ? t( 'meta.unclear', { n: unclear } ) : '', missing ? t( 'meta.missing', { n: missing } ) : '' ].filter( Boolean )
        : [ f.issuer, t( 'nfields', { n: all.length } ), t( 'meta.captured', { t: entry.created } ) ];
    const card = !filled ? t( 'form.empty', { f: f.name } )
        : unclear + missing ? [ unclear ? t( 'form.unclear', { n: unclear } ) : '', missing ? t( 'form.missing', { n: missing } ) : '', t( 'form.then' ) ].filter( Boolean ).join( ' ' )
        : t( 'form.done' );
    const sections = f.sections.map( ( s ) => {
        const fields = s.fields.filter( ( fl ) => !entry.off.includes( fl.id ) );
        return {
            title: s.title,
            ok: filled ? t( 'sec.ok', { a: fields.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'ok' ).length, b: fields.length } ) : '',
            fields: fields.map( ( fl ) => fieldView( ctx, fl, entry.values?.[ fl.id ], f, filled ) ),
        };
    } ).filter( ( s ) => s.fields.length );
    const laws = f.laws.map( ( l ) => ( { ...l, fields: l.fields.map( ( id ) => all.find( ( x ) => x.id === id )?.label || id ).join( ', ' ) } ) );
    const body = ctx.body( 'form' );
    body.innerHTML = tpl.render( 'form', {
        name: f.name,
        meta,
        pills: PILLS.map( ( key ) => ( { key, label: t( key ), on: state.tab === key } ) ),
        isFields: state.tab === 'fields',
        isPreview: state.tab === 'preview',
        isTranscript: state.tab === 'transcript',
        isLegal: state.tab === 'legal',
        card,
        sections,
        transcript: filled ? f.transcript : [],
        laws,
        pvHint: filled ? t( 'form.pv.filled' ) : t( 'form.pv.empty' ),
        pvMeta: t( 'pv.meta', { n: f.pages } ),
        preview: drawPreview( f.sizes, f.blocks, all, entry.values, entry.off ),
    } );
    ctx.bottom( 'form' ).innerHTML = entry.status === 'sent'
        ? '<button class="btn outline block" disabled>' + escape( t( 'btn.sentdone' ) ) + '</button>'
        : filled
            ? '<div class="row"><button class="btn outline press" data-record aria-label="' + escape( t( 'btn.again' ) ) + '"><span class="dot"></span></button><button class="btn grow press" data-sign' + ( missing ? ' disabled' : '' ) + '>' + escape( t( 'btn.sign' ) ) + '</button></div>'
            : '<button class="btn block press" data-record><span class="dot"></span>&nbsp;' + escape( t( 'btn.listen' ) ) + '</button>';
    for ( const pv of body.querySelectorAll( '.pv' ) ) {
        wirePreview( pv, ( id ) => {
            const fl = all.find( ( x ) => x.id === id );
            const v = entry.values?.[ id ]?.[ 0 ];
            ctx.toast( fl.label + ( v ? ': ' + v : '' ) );
        } );
    }
}

function fieldView( ctx, fl, v, f, filled ) {
    const { t } = ctx;
    const [ val, st, note ] = v || [ '', filled ? 'empty' : 'open' ];
    const chip = CHIP[ st ];
    const mark = fl.kind === 'checkbox' || fl.kind === 'radio';
    const shown = val ? ( mark ? '✓ ' + ( fl.option || fl.label ) : val ) : st === 'sign' ? t( 'v.sign' ) : st === 'missing' ? t( 'v.missing' ) : st === 'open' ? t( 'v.open' ) : t( 'v.left' );
    return {
        id: fl.id,
        label: fl.label,
        law: f.laws.some( ( l ) => l.fields.includes( fl.id ) ),
        state: st,
        chip: chip ? chip[ 0 ] || 'plain' : '',
        chipLabel: chip ? t( chip[ 1 ] ) : '',
        shown,
        isEmpty: !val,
        note: note || '',
        unclear: st === 'unclear',
        missing: st === 'missing',
        editable: filled && st !== 'unclear' && st !== 'missing' && st !== 'sign',
    };
}

export function wire( ctx ) {
    const body = ctx.body( 'form' );
    on( body, 'click', '[data-pill]', ( b ) => {
        const key = b.dataset.pill;
        if ( key === ctx.state.tab ) {
            return;
        }
        const dir = PILLS.indexOf( key ) >= PILLS.indexOf( ctx.state.tab ) ? 1 : -1;
        switchPane( body, dir, () => {
            ctx.state.tab = key;
            render( ctx, ctx.state.current );
        } );
    } );
    on( body, 'click', '.seg', ( el ) => el.classList.toggle( 'open' ) );
    on( body, 'click', '[data-confirm]', ( b ) => {
        const entry = ctx.state.current;
        entry.values[ b.dataset.confirm ][ 1 ] = 'ok';
        entry.values[ b.dataset.confirm ][ 2 ] = '';
        ctx.store.touch();
        render( ctx, entry );
    } );
    on( body, 'click', '[data-edit]', ( b ) => edit( ctx, b.dataset.edit, b.closest( '.field' ) ) );
    on( body, 'click', '[data-save]', ( b ) => {
        const entry = ctx.state.current;
        const v = $( '[data-input]', body ).value.trim();
        entry.values[ b.dataset.save ] = [ v, v ? 'ok' : 'missing', v ? '' : ctx.t( 'v.notsaid' ) ];
        ctx.store.touch();
        render( ctx, entry );
    } );
    on( body, 'click', '[data-cancel]', () => render( ctx, ctx.state.current ) );
    const bottom = ctx.bottom( 'form' );
    on( bottom, 'click', '[data-record]', () => record.start( ctx, ctx.state.current ) );
    on( bottom, 'click', '[data-sign]', () => sign.open( ctx, ctx.state.current ) );
}

// change a value in place: a text box, a text area, or a tick for a mark
function edit( ctx, id, wrap ) {
    const { t, state } = ctx;
    const entry = state.current;
    const f = ctx.model.formOf( entry );
    const fl = fieldsOf( f ).find( ( x ) => x.id === id );
    const cur = entry.values[ id ]?.[ 0 ] || '';
    if ( fl.kind === 'checkbox' || fl.kind === 'radio' ) {
        entry.values[ id ] = [ cur ? '' : 'x', cur ? 'empty' : 'ok', '' ];
        ctx.store.touch();
        render( ctx, entry );
        return;
    }
    const value = $( '.value', wrap );
    value.classList.remove( 'empty' );
    value.innerHTML = fl.kind === 'multiline'
        ? '<textarea data-input>' + escape( cur ) + '</textarea>'
        : '<input data-input value="' + escape( cur ) + '">';
    const wide = $( '.wide', wrap ) || value.insertAdjacentElement( 'afterend', document.createElement( 'div' ) );
    wide.className = 'wide';
    wide.hidden = false;
    wide.innerHTML = '<div class="row gap"><button class="btn sm press" data-save="' + escape( id ) + '">' + escape( t( 'apply' ) ) + '</button><button class="btn outline sm press" data-cancel>' + escape( t( 'cancel' ) ) + '</button></div>';
    $( '[data-input]', wrap ).focus();
}
