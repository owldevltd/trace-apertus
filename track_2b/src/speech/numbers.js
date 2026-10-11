// German number words become digits: "vierzehnten Mai neunzehnhundertachtunddreissig" → "14. Mai 1938".
// Zero to 9 999, ordinals too ("dritten" → "3."). Articles stay words ("ein Rollator"). Everything else in the
// text is left as it is. Ported from the evaluation script of the speech measurements (3 October 2026).
//
// "eins" is a number and no article. Counted 11 October 2026 in the 281 German transcripts of the speech
// measurements: it occurs four times, each time said as a number ("halb eins", "mal eins neunhundert…"); in a
// tester's dictation it stood as a word between digits ("fünf, eins, zwei") and behind a street name.
// Digits said one after the other are not joined here: what a row of them is depends on the field it goes
// into (src/fields/kinds.js).

const ONES = { null: 0, ein: 1, eins: 1, eine: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9 };
const TEENS = { zehn: 10, elf: 11, zwölf: 12, dreizehn: 13, vierzehn: 14, fünfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 };
const TENS = { zwanzig: 20, dreissig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90 };
const ORDINAL = { erst: 1, dritt: 3, siebt: 7, acht: 8 };
const ARTICLES = [ 'ein', 'eine', 'einen', 'einem', 'einer' ];
const ENDINGS = [ 'sten', 'ster', 'stes', 'stem', 'ste', 'ten', 'ter', 'tes', 'tem', 'te' ];

function below100( w ) {
    if ( w in ONES ) {
        return ONES[ w ];
    }
    if ( w in TEENS ) {
        return TEENS[ w ];
    }
    if ( w in TENS ) {
        return TENS[ w ];
    }
    const i = w.indexOf( 'und' );
    if ( i > 0 ) {
        const a = w.slice( 0, i );
        const b = w.slice( i + 3 );
        if ( a in ONES && b in TENS ) {
            return ONES[ a ] + TENS[ b ];
        }
    }
    return null;
}

function below1000( w ) {
    const i = w.indexOf( 'hundert' );
    if ( i >= 0 ) {
        const a = w.slice( 0, i );
        const b = w.slice( i + 7 );
        // years are said in hundreds: "neunzehnhundert" is 19 of them
        const x = a === '' || a === 'ein' ? 1 : below100( a );
        const y = b === '' ? 0 : below100( b );
        return x === null || y === null ? null : x * 100 + y;
    }
    return below100( w );
}

function value( w ) {
    if ( w === '' ) {
        return 0;
    }
    const i = w.indexOf( 'tausend' );
    if ( i >= 0 ) {
        const a = w.slice( 0, i );
        const b = w.slice( i + 7 );
        const x = a === '' || a === 'ein' ? 1 : below1000( a );
        const y = value( b );
        return x === null || x === undefined || y === null ? null : x * 1000 + y;
    }
    return below1000( w );
}

// The number a word stands for, with ordinal: true for "vierzehnten"; null when it is not a number word.
export function numberWord( word ) {
    const w = word.toLowerCase().replace( /ß/g, 'ss' );
    if ( ARTICLES.includes( w ) ) {
        return null;
    }
    for ( const [ stem, v ] of Object.entries( ORDINAL ) ) {
        if ( [ 'e', 'en', 'er', 'es' ].some( ( e ) => w === stem + e ) ) {
            return { value: v, ordinal: true };
        }
    }
    for ( const ending of ENDINGS ) {
        if ( w.endsWith( ending ) && w.length > ending.length + 2 ) {
            const stem = w.slice( 0, -ending.length );
            if ( stem in ORDINAL ) {
                return { value: ORDINAL[ stem ], ordinal: true };
            }
            const v = value( stem );
            if ( v !== null ) {
                return { value: v, ordinal: true };
            }
        }
    }
    const v = value( w );
    return v === null ? null : { value: v, ordinal: false };
}

// The text with every number word replaced by digits; an ordinal gets its full stop. A year or amount the
// model splits in two ("neunzehnhundert achtunddreissig", "zweitausend sechsundzwanzig") is joined.
export function digits( text ) {
    const tokens = text.split( /([A-Za-zÄÖÜäöüß]+)/ );
    const out = [];
    for ( let i = 0; i < tokens.length; i++ ) {
        const n = i % 2 === 1 ? numberWord( tokens[ i ] ) : null;
        if ( n === null ) {
            out.push( tokens[ i ] );
            continue;
        }
        let value = n.value;
        let ordinal = n.ordinal;
        // a round hundred or thousand followed by a number word below the gap: one number
        const round = value >= 100 && ( value % 1000 === 0 || ( value % 100 === 0 && value < 10000 ) );
        if ( round && !ordinal && i + 2 < tokens.length && /^\s*$/.test( tokens[ i + 1 ] ) ) {
            const next = numberWord( tokens[ i + 2 ] );
            const gap = value % 1000 === 0 ? 1000 : 100;
            if ( next && next.value < gap && next.value > 0 ) {
                value += next.value;
                ordinal = next.ordinal;
                i += 2;
            }
        }
        out.push( String( value ) + ( ordinal ? '.' : '' ) );
    }
    return out.join( '' ).replace( /(\d+)\.\s*\./g, '$1.' );
}
