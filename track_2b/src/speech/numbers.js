// Number words become digits. German in full: "vierzehnten Mai neunzehnhundertachtunddreissig" → "14. Mai 1938".
// English, French and Italian below 10 000 without ordinals (see OTHER at the end), each with its own words, so that an
// English "elf" is never eleven.
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
export function digits( text, lang = 'de' ) {
    if ( lang !== 'de' ) {
        return OTHER[ lang ] ? other( text, OTHER[ lang ] ) : text;
    }
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


// English, French and Italian, added 14 October 2026: until then a person who spoke another language than the
// form's got no number words turned into digits at all ("five six nine eight" stayed words). A word's value comes
// from its language's table; a word joined with hyphens (French "quatre-vingt-dix") or written as one (Italian
// "ventotto") is put together from its parts. Articles stay words ("un", "une", "uno", "una"), as "ein" does.
const OTHER = {
    en: {
        ones: { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 },
        teens: {
            ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
            eighteen: 18, nineteen: 19,
        },
        tens: { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 },
        hundred: [ 'hundred' ], thousand: [ 'thousand' ], and: [ 'and' ], articles: [], alone: [ 'one' ],
    },
    fr: {
        ones: {
            zéro: 0, zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9,
        },
        teens: { dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16 },
        tens: {
            vingt: 20, vingts: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60, septante: 70, huitante: 80,
            octante: 80, nonante: 90,
        },
        hundred: [ 'cent', 'cents' ], thousand: [ 'mille' ], and: [ 'et' ], articles: [ 'un', 'une' ],
        alone: [],
    },
    it: {
        ones: {
            zero: 0, uno: 1, una: 1, due: 2, tre: 3, tré: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9,
        },
        teens: {
            dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16, diciassette: 17,
            diciotto: 18, diciannove: 19,
        },
        tens: {
            venti: 20, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60, settanta: 70, ottanta: 80, novanta: 90,
        },
        hundred: [ 'cento' ], thousand: [ 'mille', 'mila' ], and: [ 'e' ], articles: [ 'un', 'uno', 'una' ],
        alone: [],
    },
};

// below 100 in one piece: a table word, or (Italian) tens and ones written as one word, the tens losing their vowel
// before "uno" and "otto" ("ventuno", "trentotto", "ventitré")
function small( w, t ) {
    for ( const table of [ t.ones, t.teens, t.tens ] ) {
        if ( w in table ) {
            return table[ w ];
        }
    }
    for ( const [ ten, v ] of Object.entries( t.tens ) ) {
        for ( const head of [ ten, ten.slice( 0, -1 ) ] ) {
            const rest = w.slice( head.length );
            if ( w.startsWith( head ) && rest in t.ones && t.ones[ rest ] > 0 ) {
                return v + t.ones[ rest ];
            }
        }
    }
    return null;
}

// one word of the language, hyphens and all, below 10 000; null when it is no number word
function wordOf( word, t ) {
    const w = word.toLowerCase();
    const parts = w.split( '-' ).filter( ( p ) => !t.and.includes( p ) );
    if ( parts.length > 1 ) {
        // French: "quatre-vingt" is four twenties, every other part is added ("soixante-dix-sept", "vingt-et-un")
        let v = 0;
        for ( const p of parts ) {
            const n = t.hundred.includes( p ) ? 100 : small( p, t );
            if ( n === null ) {
                return null;
            }
            v = n === 20 && v > 0 && v < 10 ? v * 20 : n === 100 ? ( v || 1 ) * 100 : v + n;
        }
        return v;
    }
    if ( t.articles.includes( w ) ) {
        return null;
    }
    const v = small( w, t );
    if ( v !== null ) {
        return v;
    }
    // Italian writes hundreds and thousands into the word: "duecentoquaranta", "duemilasei"
    for ( const [ unit, size ] of [ [ t.thousand, 1000 ], [ t.hundred, 100 ] ] ) {
        for ( const u of unit ) {
            const i = w.indexOf( u );
            if ( i >= 0 && w !== u ) {
                const head = w.slice( 0, i );
                const tail = w.slice( i + u.length );
                const x = head === '' ? 1 : small( head, t );
                const y = tail === '' ? 0 : wordOf( tail, t );
                if ( x !== null && y !== null && y < size ) {
                    return x * size + y;
                }
            }
        }
    }
    return null;
}

// Number words in a row: tens and ones said apart are one number ("twenty one"), a hundred or thousand multiplies
// what stands before it and takes what follows ("one thousand nine hundred eighty four"); digits said one after the
// other stay apart ("five six nine eight" → "5 6 9 8"), as in German, and the field decides whether they are one
// number. A word that is also a pronoun ("one" in "this one") is a number only next to another number word.
function other( text, t ) {
    const tokens = text.split( /(\p{L}+(?:-\p{L}+)*)/u );
    const out = [];
    // every number put together: thousands and the rest below them, its place in out, its words
    const runs = [];
    let run = null;
    const join = ( word ) => {
        run.words.push( word );
        out.length = run.at + 1;
    };
    const start = ( word, high, low ) => {
        run = { at: out.length, high, low, words: [ word ] };
        runs.push( run );
        out.push( '' );
    };
    for ( let i = 0; i < tokens.length; i++ ) {
        if ( i % 2 === 0 ) {
            // between words: anything but spaces ends the number
            if ( !/^[ \t]*$/.test( tokens[ i ] ) ) {
                run = null;
            }
            out.push( tokens[ i ] );
            continue;
        }
        const word = tokens[ i ];
        const w = word.toLowerCase();
        const thousand = t.thousand.includes( w );
        const hundred = t.hundred.includes( w );
        if ( thousand && run && run.high === 0 && run.low > 0 ) {
            run.high = run.low * 1000;
            run.low = 0;
            join( word );
            continue;
        }
        if ( hundred && run && run.low > 0 && run.low < 10 ) {
            run.low *= 100;
            join( word );
            continue;
        }
        if ( thousand || hundred ) {
            // "mille", "cent", "hundred" by itself: the round number
            start( word, thousand ? 1000 : 0, hundred ? 100 : 0 );
            continue;
        }
        const v = wordOf( w, t );
        if ( v === null ) {
            // "and" after a round number may still join what follows ("two hundred and five")
            if ( !( run && t.and.includes( w ) && run.low % 100 === 0 && run.high + run.low >= 100 ) ) {
                run = null;
            }
            out.push( word );
            continue;
        }
        if ( run ) {
            const last = run.low % 100;
            const tens = last >= 20 && last % 10 === 0;
            const round = ( run.low === 0 && run.high > 0 && v < 1000 ) || ( run.low >= 100 && last === 0 && v < 100 );
            if ( ( tens && v > 0 && v < 10 ) || round ) {
                run.low += v;
                join( word );
                continue;
            }
        }
        start( word, 0, v );
    }
    // a word that is also a pronoun stays a word unless another number stands right beside it, with nothing but
    // spaces and commas between
    const beside = ( a, b ) => out.slice( a.at + 1, b.at ).every( ( s ) => /^[ \t,]*$/.test( s ) );
    runs.forEach( ( r, k ) => {
        const alone = r.words.length === 1 && t.alone.includes( r.words[ 0 ].toLowerCase() )
            && !( k > 0 && beside( runs[ k - 1 ], r ) ) && !( k + 1 < runs.length && beside( r, runs[ k + 1 ] ) );
        out[ r.at ] = alone ? r.words[ 0 ] : String( r.high + r.low );
    } );
    return out.join( '' );
}
