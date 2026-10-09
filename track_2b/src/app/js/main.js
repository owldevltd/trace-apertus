import { $, $$, on, haptic } from './dom.js';
import { createTemplates } from './template.js';
import { createI18n } from './i18n.js';
import { createStore } from './store.js';
import { createRouter } from './router.js';
import { createModel } from './model.js';
import * as home from './screens/home.js';
import * as forms from './screens/forms.js';
import * as form from './screens/form.js';
import * as camera from './screens/camera.js';
import * as verify from './screens/verify.js';
import * as sign from './screens/sign.js';
import * as sent from './screens/sent.js';
import * as more from './screens/more.js';

// Start: translations and templates are loaded once, then store, i18n, templates and router are built and
// handed to every screen as ctx. A screen renders into its body when it is entered; one-time listeners are
// wired at start. Nothing lives in module state.
//
// The demo stands beside the app, under /?demo: the walk-through with two forms whose recognition, values and
// transcript are made up, for showing the flow without a model. It keeps its own state; the app itself shows
// nothing of it.

const LANGS = [ 'en', 'de', 'fr', 'it' ];
const TEMPLATES = [ 'home', 'thumb', 'forms', 'pills', 'verify', 'form', 'field', 'turn', 'sign', 'sent', 'more', 'sheet', 'recognizing' ];
const ROOTS = [ 'home', 'forms', 'sent', 'more' ];
const SCREENS = { home, forms, form, camera, verify, sign, sent, more };

async function load( urls ) {
    return Promise.all( urls.map( async ( url ) => {
        const r = await fetch( url );
        if ( !r.ok ) {
            throw new Error( url + ' ' + r.status );
        }
        return url.endsWith( '.json' ) ? r.json() : r.text();
    } ) );
}

async function boot() {
    const [ tables, sources ] = await Promise.all( [
        load( LANGS.map( ( l ) => 'lang/' + l + '.json' ) ).then( ( list ) => Object.fromEntries( list.map( ( t, i ) => [ LANGS[ i ], t ] ) ) ),
        load( TEMPLATES.map( ( n ) => 'templates/' + n + '.html' ) ).then( ( list ) => Object.fromEntries( list.map( ( s, i ) => [ TEMPLATES[ i ], s ] ) ) ),
    ] );
    const demo = new URLSearchParams( location.search ).has( 'demo' );
    document.documentElement.toggleAttribute( 'data-demo', demo );
    const store = createStore( demo ? 'trace-demo' : 'trace' );
    const i18n = createI18n( tables, store.get( 'lang' ) );
    const tpl = createTemplates( sources, i18n.t );
    const root = $( '#stage' );
    const ctx = {
        demo,
        store,
        i18n,
        t: i18n.t,
        tpl,
        root,
        model: createModel( i18n.t, () => i18n.lang ),
        screens: SCREENS,
        // what the flow holds between screens; not saved
        state: { tab: 'fields', photo: null, form: null, off: [], current: null, pending: new Set(), listen: null },
        screen: ( id ) => $( '#s-' + id, root ),
        body: ( id ) => $( '#s-' + id + ' [data-body]', root ),
        bottom: ( id ) => $( '#s-' + id + ' [data-bottom]', root ),
        now: () => i18n.time(),
        event( text, formId, photo ) {
            store.addEvent( text, formId, photo, i18n.time() );
        },
        toast( message ) {
            const el = $( '[data-toast]', root );
            el.textContent = message;
            el.classList.add( 'show' );
            clearTimeout( el.timer );
            el.timer = setTimeout( () => el.classList.remove( 'show' ), 2200 );
        },
        applyStatic() {
            $$( '[data-i18n]' ).forEach( ( el ) => {
                el.textContent = i18n.t( el.dataset.i18n );
            } );
            document.documentElement.lang = i18n.lang;
            $( '.sheet-inner', root ).innerHTML = tpl.render( 'sheet' );
        },
    };
    ctx.router = createRouter( {
        root,
        roots: ROOTS,
        onEnter( id ) {
            SCREENS[ id ].enter?.( ctx );
            $( '#s-' + id + ' .scroll', root )?.scrollTo( 0, 0 );
        },
        onLeave( id ) {
            SCREENS[ id ].leave?.( ctx );
        },
    } );
    for ( const screen of Object.values( SCREENS ) ) {
        screen.wire?.( ctx );
    }
    wireShell( ctx );
    ctx.applyStatic();
    home.enter( ctx );
}

// tabs, sidebar, back buttons, the "New" sheet, the press feedback
function wireShell( ctx ) {
    const { root, router } = ctx;
    on( document, 'click', '[data-tab]', ( el ) => router.root( el.dataset.tab ) );
    on( document, 'click', '[data-new]', () => router.sheet.open() );
    on( root, 'click', '[data-back]', () => router.pop() );
    on( root, 'click', '[data-sheet-close]', () => router.sheet.close() );
    on( root, 'click', '[data-go]', async ( el ) => {
        await router.sheet.close();
        if ( el.dataset.go === 'camera' ) {
            router.push( 'camera', 'modal' );
        } else if ( el.dataset.go === 'upload' ) {
            $( '[data-upload]', root ).click();
        } else {
            router.root( 'forms' );
        }
    } );
    // files from the desk take the camera's path: found, straightened, evened out, then sent together
    $( '[data-upload]', root ).addEventListener( 'change', ( e ) => {
        const files = [ ...e.target.files ];
        e.target.value = '';
        if ( files.length ) {
            camera.open( ctx, files );
        }
    } );
    document.addEventListener( 'pointerdown', ( e ) => {
        if ( e.target.closest( '.press' ) ) {
            haptic();
        }
    }, { passive: true } );
}

boot().catch( ( error ) => {
    document.body.innerHTML = '<p style="padding:24px;font-family:system-ui">Trace could not start: ' + error.message + '</p>';
} );
