// The app's state: what the person saved, what happened today, the language. Kept in localStorage under one
// key, read once, written on every change. Screens read through get() and change through set(); a subscriber
// hears every change. No module state: main.js creates the store and hands it around.

const EVENTS = 30;

// key: where the state is kept; the demo keeps its own, so its made-up forms never show in the app
export function createStore( KEY = 'trace' ) {
    // the language of the system until the person chooses one; one the app does not speak falls back to English
    const state = Object.assign( { saved: [], events: [], lang: ( navigator.language || 'en' ).slice( 0, 2 ).toLowerCase(), mockIndex: 0 }, read() );
    const listeners = new Set();

    function read() {
        try {
            return JSON.parse( localStorage.getItem( KEY ) ) || {};
        } catch {
            return {};
        }
    }

    function write() {
        try {
            localStorage.setItem( KEY, JSON.stringify( state ) );
        } catch {
            // private mode or full: the app still works for this visit
        }
    }

    function set( key, value ) {
        state[ key ] = value;
        write();
        for ( const fn of listeners ) {
            fn( key, value );
        }
    }

    return {
        get: ( key ) => state[ key ],
        set,
        // a saved form by its uid
        entry: ( uid ) => state.saved.find( ( e ) => e.uid === uid ),
        // saves a change to an entry that was taken from get( 'saved' )
        touch: () => set( 'saved', state.saved ),
        addEntry( entry ) {
            set( 'saved', [ entry, ...state.saved ] );
            return entry;
        },
        addEvent( text, formId, photo, time ) {
            set( 'events', [ { time, text, formId, photo }, ...state.events ].slice( 0, EVENTS ) );
        },
        reset() {
            set( 'saved', [] );
            set( 'events', [] );
        },
        subscribe( fn ) {
            listeners.add( fn );
            return () => listeners.delete( fn );
        },
    };
}
