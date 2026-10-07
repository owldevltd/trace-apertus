import { $$, on } from '../dom.js';
import { escape } from '../template.js';
import { fieldsOf } from '../mock/forms.js';
import { BLOCKS } from '../mock/blocks.js';
import { drawPreview, wirePreview } from '../preview.js';
import { switchPane } from '../router.js';

// Verify: the recognized form with its fields; a person unticks what is not a field, looks at the page and
// the photo, then saves. Recognition itself is mocked: the shipped forms take turns.

const PILLS = [ 'fields', 'preview', 'photo' ];
const KIND = { checkbox: 'type.choice', radio: 'type.choice', signature: 'type.sign', multiline: 'type.long', date: 'type.date', text: 'type.text' };

export function recognize( ctx ) {
    const { store, forms, state } = ctx;
    state.form = forms[ store.get( 'mockIndex' ) % forms.length ];
    state.off = [];
    state.tab = 'fields';
    ctx.bottom( 'verify' ).innerHTML = '';
    ctx.body( 'verify' ).innerHTML = ctx.tpl.render( 'recognizing' );
    ctx.router.push( 'verify' );
    setTimeout( () => render( ctx ), 1400 );
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
        preview: drawPreview( f.page, BLOCKS[ f.id ], all.filter( ( fl ) => !fl.page || fl.page === 1 ), null, state.off ),
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
        const { state, store, forms } = ctx;
        const f = state.form;
        const n = fieldsOf( f ).length;
        store.addEntry( { uid: Date.now().toString( 36 ), formId: f.id, photo: state.photo, off: [ ...state.off ], status: 'verified', created: ctx.now(), values: null } );
        store.set( 'mockIndex', ( store.get( 'mockIndex' ) + 1 ) % forms.length );
        ctx.event( ctx.t( 'ev.captured', { f: f.name, a: n - state.off.length, b: n } ), f.id, state.photo );
        ctx.toast( ctx.t( 'saved' ) );
        ctx.router.finish( 'forms' );
    } );
}
