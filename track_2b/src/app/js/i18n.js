// Translations. One JSON per language with flat keys; a value is a string with {name} placeholders, or an
// object { one, other } chosen by the parameter n. Form content (labels, transcript, legal text) stays in the
// language of the form and never goes through here. English is the fallback for a missing key.

export const LANGUAGES = [ [ 'en', 'English' ], [ 'de', 'Deutsch' ], [ 'fr', 'Français' ], [ 'it', 'Italiano' ] ];

const LOCALE = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' };

export function createI18n( tables, lang ) {
    const state = { lang: tables[ lang ] ? lang : 'en' };

    // t( key, params ): params.n picks the plural form, every param fills its {placeholder}.
    function t( key, params = {} ) {
        let v = tables[ state.lang ][ key ] ?? tables.en[ key ];
        if ( v === undefined ) {
            return key;
        }
        if ( typeof v === 'object' ) {
            v = params.n === 1 ? v.one : v.other;
        }
        return v.replace( /\{(\w+)\}/g, ( _, name ) => ( params[ name ] === undefined ? '{' + name + '}' : String( params[ name ] ) ) );
    }

    return {
        t,
        get lang() {
            return state.lang;
        },
        set( lang ) {
            if ( tables[ lang ] ) {
                state.lang = lang;
            }
        },
        locale: () => LOCALE[ state.lang ],
        // weekday, day and month, in the language of the app
        longDate: ( d = new Date() ) => d.toLocaleDateString( LOCALE[ state.lang ], { weekday: 'long', day: 'numeric', month: 'long' } ),
        date: ( d = new Date() ) => d.toLocaleDateString( LOCALE[ state.lang ] ),
        time: ( d = new Date() ) => d.toLocaleTimeString( LOCALE[ state.lang ], { hour: '2-digit', minute: '2-digit' } ),
    };
}
