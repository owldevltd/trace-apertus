import { createMask, label } from '../page/mask.js';

// Fluffy checks what the model read against the image. Not pixel by pixel, since the typeface of the original is
// unknown, but by the shape of the character sequence: per glyph tall, x-high, with descender, dot, dash, and the
// word gaps. "bestätigt" and "bestellt" have different shapes in any typeface. The shape of the image comes from
// its ink blobs; the shape of the text comes from its letters, so nothing has to be rendered. Where the two
// sequences differ beyond the threshold, the element gets approve = true and a person has to look.

// Above this deviation (share of the shape sequence that does not match) a person must confirm. Measured
// 6 October 2026 on 172 read elements: 0.02 flags 53 of 71 wrong and 26 of 101 right readings.
export const THRESHOLD = 0.02;

// Ink is clearly darker than the ground of the crop, but at most this grey value.
const INK_MAX = 160;
const INK_DIST = 60;

// Shape, all in shares of the tall glyphs of the line: from TALL tall, from SMALL x-high, below that punctuation;
// from DESCENT below the baseline a descender; from GAP a word gap.
const TALL = 0.85;
const SMALL = 0.5;
const DESCENT = 0.15;
const GAP = 0.3;

// A blob this many character heights long and thin is a line.
const RULE = 2.5;

// More ink than this in the crop: the ground is light only at the edge, the writing stands light on a bar.
const INVERSE = 0.5;

// Sets approve on every element: true where the read text does not fit the image or nothing was read.
// An image is not checked, a logo has no letter shape. gray: one byte per pixel of the page.
export function checkElements( elements, gray, width, height ) {
    // tick marks are not text: they are blanked before the comparison
    const blank = elements.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' ).map( ( e ) => ( { x: e.x - 2, y: e.y - 2, w: e.width + 4, h: e.height + 4 } ) );
    return elements.map( ( e ) => {
        const out = { ...e, approve: e.type === 'unknown' };
        // a tick mark's content ("x") is the geometry's finding, not a reading
        if ( !e.content || e.type === 'image' || e.type === 'checkbox' || e.type === 'radio' ) {
            return out;
        }
        const seen = shapeOfImage( gray, width, height, e, blank );
        const want = shapeOfText( e.content );
        const n = Math.max( seen.length, want.length );
        out.deviation = n ? Math.round( levenshtein( seen, want ) / n * 1000 ) / 1000 : 0;
        out.approve = out.deviation > THRESHOLD;
        return out;
    } );
}

// Shape sequence of a crop with text: one letter per glyph. A tall, x x-high, J tall with descender,
// g x-high with descender, . low, ' high, - middle, _ word gap.
export function shapeOfImage( gray, width, height, e, blank = [] ) {
    const mask = cropMask( gray, width, height, e, blank );
    if ( !mask ) {
        return '';
    }
    let boxes = label( mask ).filter( ( b ) => b[ 4 ] >= 3 );
    if ( !boxes.length ) {
        return '';
    }
    const heights = boxes.map( ( b ) => b[ 3 ] - b[ 1 ] + 1 ).sort( ( a, b ) => a - b );
    const typical = heights[ Math.floor( 0.75 * ( heights.length - 1 ) ) ];

    // lines in the crop (cell borders, writing lines) are not glyphs; left in, every glyph above would hang on them
    boxes = boxes.filter( ( b ) => {
        const w = b[ 2 ] - b[ 0 ] + 1;
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( ( w > RULE * typical && h * 3 < typical ) || ( h > RULE * typical && w * 3 < typical ) ) {
            return false;
        }
        // corner or frame of a cell: big but almost empty
        return !( ( w > RULE * typical || h > RULE * typical ) && b[ 4 ] * 6 < w * h );
    } );
    if ( !boxes.length ) {
        return '';
    }

    // lines: the centres of the larger blobs, separated where they jump by more than half a blob height
    const big = boxes.filter( ( b ) => ( b[ 3 ] - b[ 1 ] + 1 ) * 2 >= typical ).sort( ( a, b ) => ( a[ 1 ] + a[ 3 ] ) - ( b[ 1 ] + b[ 3 ] ) );
    const bands = [];
    for ( const b of big ) {
        const mid = ( b[ 1 ] + b[ 3 ] ) / 2;
        const k = bands.length - 1;
        if ( k >= 0 && mid - bands[ k ].mid <= 0.6 * typical ) {
            bands[ k ].mid = ( bands[ k ].mid * bands[ k ].n + mid ) / ( bands[ k ].n + 1 );
            bands[ k ].n++;
        } else {
            bands.push( { mid, n: 1, boxes: [] } );
        }
    }
    // every blob, dots and commas too, to the nearest line
    for ( const b of boxes ) {
        const mid = ( b[ 1 ] + b[ 3 ] ) / 2;
        let best = 0;
        bands.forEach( ( band, k ) => {
            if ( Math.abs( mid - band.mid ) < Math.abs( mid - bands[ best ].mid ) ) {
                best = k;
            }
        } );
        bands[ best ].boxes.push( b );
    }
    return bands.map( ( band ) => shapeOfLine( band.boxes ) ).filter( ( s ) => s !== '' ).join( '_' );
}

// Shape of one line. Blobs on top of each other (i and its dot, umlaut, colon) are one glyph: when they share
// most of their width, or when a small blob stands over or under a larger one and touches its width at all
// (the dot of a small i sits a little beside its stem).
function shapeOfLine( boxes ) {
    boxes.sort( ( a, b ) => a[ 0 ] - b[ 0 ] );
    const glyphs = [];
    for ( const b of boxes ) {
        const k = glyphs.length - 1;
        if ( k >= 0 ) {
            const g = glyphs[ k ];
            const over = Math.min( g[ 2 ], b[ 2 ] ) - Math.max( g[ 0 ], b[ 0 ] ) + 1;
            const stacked = b[ 1 ] > g[ 3 ] || b[ 3 ] < g[ 1 ];
            const small = Math.min( g[ 3 ] - g[ 1 ], b[ 3 ] - b[ 1 ] ) * 2 <= Math.max( g[ 3 ] - g[ 1 ], b[ 3 ] - b[ 1 ] );
            if ( over * 2 > Math.min( g[ 2 ] - g[ 0 ], b[ 2 ] - b[ 0 ] ) + 1 || ( over >= 1 && stacked && small ) ) {
                glyphs[ k ] = [ Math.min( g[ 0 ], b[ 0 ] ), Math.min( g[ 1 ], b[ 1 ] ), Math.max( g[ 2 ], b[ 2 ] ), Math.max( g[ 3 ], b[ 3 ] ) ];
                continue;
            }
        }
        glyphs.push( [ b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ] ] );
    }
    // baseline = where most glyphs end; tall = the tall glyphs above it
    const bottoms = glyphs.map( ( g ) => g[ 3 ] ).sort( ( a, b ) => a - b );
    const base = bottoms[ Math.floor( bottoms.length / 2 ) ];
    const up = glyphs.map( ( g ) => base - g[ 1 ] + 1 ).sort( ( a, b ) => a - b );
    const tall = Math.max( 1, up[ Math.floor( 0.9 * ( up.length - 1 ) ) ] );

    let s = '';
    let last = null;
    for ( const g of glyphs ) {
        if ( last !== null && g[ 0 ] - last - 1 >= GAP * tall ) {
            s += '_';
        }
        last = g[ 2 ];
        const h = base - g[ 1 ] + 1;
        const deep = g[ 3 ] - base >= DESCENT * tall;
        if ( g[ 3 ] - g[ 1 ] + 1 < SMALL * tall ) {
            // small: low (dot, comma), high (apostrophe, quote) or in the middle (hyphen)
            s += g[ 1 ] > base - SMALL * tall ? '.' : ( g[ 3 ] < base - SMALL * tall ? "'" : '-' );
        } else if ( h >= TALL * tall ) {
            s += deep ? 'J' : 'A';
        } else {
            s += deep ? 'g' : 'x';
        }
    }
    return s;
}

// The shape a text would have in print, letter by letter, as the image side would see it: an i or an umlaut
// with its dots is one tall glyph, a semicolon one x-high glyph with a descender, a hyphen a small low blob
// (its top lies under the half x-height line). The same alphabet as the image shape.
export function shapeOfText( text ) {
    const parts = text.replace( /\t/g, ' ' ).split( /\r?\n/ ).map( ( line ) => line.trim() ).filter( ( line ) => line !== '' );
    return parts.map( ( line ) => {
        let s = '';
        let gap = false;
        for ( const ch of line ) {
            if ( /\s/.test( ch ) ) {
                gap = true;
                continue;
            }
            if ( gap && s !== '' ) {
                s += '_';
            }
            gap = false;
            s += glyphClass( ch );
        }
        return s;
    } ).filter( ( s ) => s !== '' ).join( '_' );
}

function glyphClass( ch ) {
    if ( /[.,\-–—_]/.test( ch ) ) {
        return '.';
    }
    if ( /['"`´‘’“”*°]/.test( ch ) ) {
        return "'";
    }
    if ( /[=~]/.test( ch ) ) {
        return '-';
    }
    if ( /[gpqyµç;]/.test( ch ) ) {
        return 'g';
    }
    // in the sans faces of forms J and the slash sit on the baseline; brackets and the section sign hang below it
    if ( /[jQ()\[\]{}|§@]/.test( ch ) ) {
        return 'J';
    }
    if ( /[a-z]/.test( ch ) ) {
        return /[bdfhiklt]/.test( ch ) ? 'A' : 'x';
    }
    if ( /[:<>«»+]/.test( ch ) ) {
        return 'x';
    }
    if ( /[A-Z0-9ßÀ-ÿ!?%&#€$£\/\\]/.test( ch ) ) {
        return 'A';
    }
    return 'x';
}

// Ink mask of a crop at full resolution. The ground is the most frequent grey value; if it is dark, the writing is the light part.
function cropMask( gray, width, height, e, blank ) {
    const x0 = Math.max( 0, e.x );
    const y0 = Math.max( 0, e.y );
    const w = Math.min( width - x0, Math.max( 1, e.width ) );
    const h = Math.min( height - y0, Math.max( 1, e.height ) );
    if ( w < 1 || h < 1 ) {
        return null;
    }
    const hist = new Uint32Array( 256 );
    for ( let y = 0; y < h; y++ ) {
        for ( let x = 0; x < w; x++ ) {
            hist[ gray[ ( y0 + y ) * width + x0 + x ] ]++;
        }
    }
    let ground = 0;
    for ( let v = 1; v < 256; v++ ) {
        if ( hist[ v ] > hist[ ground ] ) {
            ground = v;
        }
    }
    const mask = createMask( w, h );
    let ink = 0;
    for ( let y = 0; y < h; y++ ) {
        for ( let x = 0; x < w; x++ ) {
            const v = gray[ ( y0 + y ) * width + x0 + x ];
            const isInk = ground >= 128 ? v < Math.min( INK_MAX, ground - INK_DIST ) : v > ground + INK_DIST;
            if ( isInk ) {
                mask.data[ y * w + x ] = 1;
                ink++;
            }
        }
    }
    if ( ink > INVERSE * w * h ) {
        for ( let i = 0; i < mask.data.length; i++ ) {
            mask.data[ i ] ^= 1;
        }
    }
    for ( const b of blank ) {
        for ( let y = Math.max( 0, b.y - y0 ); y < Math.min( h, b.y + b.h - y0 ); y++ ) {
            for ( let x = Math.max( 0, b.x - x0 ); x < Math.min( w, b.x + b.w - x0 ); x++ ) {
                mask.data[ y * w + x ] = 0;
            }
        }
    }
    return mask;
}

export function levenshtein( a, b ) {
    const m = a.length;
    const n = b.length;
    if ( !m ) {
        return n;
    }
    if ( !n ) {
        return m;
    }
    let prev = new Uint32Array( n + 1 );
    let cur = new Uint32Array( n + 1 );
    for ( let j = 0; j <= n; j++ ) {
        prev[ j ] = j;
    }
    for ( let i = 1; i <= m; i++ ) {
        cur[ 0 ] = i;
        for ( let j = 1; j <= n; j++ ) {
            const cost = a[ i - 1 ] === b[ j - 1 ] ? 0 : 1;
            cur[ j ] = Math.min( prev[ j ] + 1, cur[ j - 1 ] + 1, prev[ j - 1 ] + cost );
        }
        [ prev, cur ] = [ cur, prev ];
    }
    return prev[ n ];
}
