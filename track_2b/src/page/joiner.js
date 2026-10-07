import { label, root, byPosition } from './mask.js';

// Bridges by the measure of the line instead of the page. Every text line measures itself: character height,
// word gap, baseline. What then belongs to the same line or the same paragraph gets a bridge in the mask
// before the slicer smears. Neighbourhoods of ink blobs as in Docstrum (O'Gorman 1993).

// Character height of a line = height of its tall glyphs (capitals, ascenders, digits).
// The median jumps between x-height and cap height depending on the text; this share does not.
const TALL = 0.9;

// Gap inside a line, in its own character height. Measured: word gap 0.3–0.7, next column from about 2.1.
const WORD_GAP = 0.9;
const WORD_MAX = 1.5;

// Justified text: gaps up to this multiple of the line's median word gap.
const WORD_RATIO = 1.6;

// From here a gap is a word gap, below it a letter gap.
const WORD_MIN = 0.25;

// Baseline distance to the next line of the same paragraph. Measured: inside a block 1.4–1.94, between blocks
// from 2.17; forms join tighter (1.85 measured better than 2.05).
const LINE_STEP = 1.85;

// Glyphs of a line and lines of a paragraph are of similar height.
const GLYPH_RATIO = 2.5;
const LINE_RATIO = 1.5;

// Returns the bridges (work pixels, [ x0, y0, x1, y1 ]) and the text lines (original pixels).
export function joinLines( page, lines ) {
    const links = [];

    // glyphs: blobs from half the page's character height on, sorted by x. [ x0, y0, x1, y1, h ]
    const g = [];
    for ( const b of label( page.masks.ink ) ) {
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( h * 2 < page.unit || b[ 2 ] - b[ 0 ] + 1 > 10 * h ) {
            continue;
        }
        g.push( [ b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ], h ] );
    }
    g.sort( ( a, b ) => a[ 0 ] - b[ 0 ] );

    const fence = ( dir, from, to, at ) => fenced( lines, page.scale, dir, from, to, at );
    const strips = findStrips( g, links, fence );
    stack( g, strips, links, fence );

    const s = page.scale;
    const out = strips.map( ( t ) => ( {
        x: t.x0 * s, y: t.y0 * s, w: ( t.x1 - t.x0 + 1 ) * s, h: ( t.y1 - t.y0 + 1 ) * s,
        unit: t.h * s, base: t.base * s, n: t.glyphs.length,
    } ) );
    return { links, strips: out.sort( byPosition ) };
}

// Glyphs to lines: every glyph hangs on its right neighbour at the same height. First collect generously,
// then the collection measures its own word gap and separates at it.
function findStrips( g, links, fence ) {
    const n = g.length;
    const edges = [];
    const loose = Array.from( { length: n }, ( _, i ) => i );
    for ( let i = 0; i < n; i++ ) {
        const c = g[ i ];
        const far = c[ 2 ] + 2 * WORD_MAX * GLYPH_RATIO * c[ 4 ];
        for ( let j = i + 1; j < n && g[ j ][ 0 ] <= far; j++ ) {
            const r = g[ j ];
            if ( Math.max( c[ 4 ], r[ 4 ] ) > GLYPH_RATIO * Math.min( c[ 4 ], r[ 4 ] ) ) {
                continue;
            }
            if ( ( Math.min( c[ 3 ], r[ 3 ] ) - Math.max( c[ 1 ], r[ 1 ] ) + 1 ) * 2 < Math.min( c[ 4 ], r[ 4 ] ) ) {
                continue;
            }
            // two small glyphs can stand in a line twice as high
            const gap = Math.max( 0, r[ 0 ] - c[ 2 ] - 1 );
            if ( gap <= 2 * WORD_MAX * Math.max( c[ 4 ], r[ 4 ] ) ) {
                edges.push( [ i, j, gap ] );
                loose[ root( loose, i ) ] = root( loose, j );
            }
            // sorted by x: the first hit is the nearest
            break;
        }
    }

    // per collection: character height and, from three word gaps on, its own word gap
    const heights = {};
    for ( let i = 0; i < n; i++ ) {
        const k = root( loose, i );
        ( heights[ k ] ??= [] ).push( g[ i ][ 4 ] );
    }
    const unit = {};
    for ( const k of Object.keys( heights ) ) {
        unit[ k ] = part( heights[ k ], TALL );
    }
    const gaps = {};
    for ( const [ i, , gap ] of edges ) {
        const k = root( loose, i );
        if ( gap >= WORD_MIN * unit[ k ] ) {
            ( gaps[ k ] ??= [] ).push( gap );
        }
    }

    const tight = Array.from( { length: n }, ( _, i ) => i );
    for ( const [ i, j, gap ] of edges ) {
        const k = root( loose, i );
        let max = WORD_GAP * unit[ k ];
        if ( ( gaps[ k ] || [] ).length >= 3 ) {
            max = Math.min( WORD_MAX * unit[ k ], Math.max( max, WORD_RATIO * part( gaps[ k ], 0.5 ) ) );
        }
        if ( gap > max ) {
            continue;
        }
        const y = ( Math.max( g[ i ][ 1 ], g[ j ][ 1 ] ) + Math.min( g[ i ][ 3 ], g[ j ][ 3 ] ) ) >> 1;
        if ( gap >= WORD_MIN * unit[ k ] && fence( 'v', g[ i ][ 2 ], g[ j ][ 0 ], y ) ) {
            continue;
        }
        tight[ root( tight, i ) ] = root( tight, j );
        if ( gap > 0 ) {
            links.push( [ g[ i ][ 0 ], y, g[ j ][ 2 ], y ] );
        }
    }

    const sets = {};
    for ( let i = 0; i < n; i++ ) {
        ( sets[ root( tight, i ) ] ??= [] ).push( i );
    }
    return Object.values( sets ).map( ( ids ) => ( {
        x0: Math.min( ...ids.map( ( i ) => g[ i ][ 0 ] ) ),
        y0: Math.min( ...ids.map( ( i ) => g[ i ][ 1 ] ) ),
        x1: Math.max( ...ids.map( ( i ) => g[ i ][ 2 ] ) ),
        y1: Math.max( ...ids.map( ( i ) => g[ i ][ 3 ] ) ),
        h: part( ids.map( ( i ) => g[ i ][ 4 ] ), TALL ),
        base: part( ids.map( ( i ) => g[ i ][ 3 ] ), 0.5 ),
        glyphs: ids,
    } ) );
}

// Lines to paragraphs: the next line below belongs when its baseline distance in character heights is small
// enough. Baseline instead of box, because the box depends on whether the line has descenders.
function stack( g, strips, links, fence ) {
    const sorted = [ ...strips ].sort( ( a, b ) => a.base - b.base );
    const n = sorted.length;
    for ( let i = 0; i < n; i++ ) {
        const a = sorted[ i ];
        let next = null;
        for ( let j = i + 1; j < n; j++ ) {
            const b = sorted[ j ];
            const step = b.base - a.base;
            if ( step > LINE_STEP * a.h || ( next !== null && step > next + a.h / 2 ) ) {
                break;
            }
            if ( step * 2 < Math.min( a.h, b.h ) ) {
                continue;
            }
            const over = Math.min( a.x1, b.x1 ) - Math.max( a.x0, b.x0 ) + 1;
            if ( over * 2 <= Math.min( a.x1 - a.x0, b.x1 - b.x0 ) + 1 ) {
                continue;
            }
            // only the next line counts, even when it does not fit itself
            next ??= step;
            if ( Math.max( a.h, b.h ) > LINE_RATIO * Math.min( a.h, b.h ) ) {
                continue;
            }
            if ( step > LINE_STEP * Math.min( a.h, b.h ) ) {
                continue;
            }
            post( g, a.glyphs, b.glyphs, links, fence );
        }
    }
}

// Vertical bridge between two lines: through a glyph above and one below that stand on top of each other.
// Every blob has ink in each of its columns, so the bridge hits both.
function post( g, above, below, links, fence ) {
    for ( const i of above ) {
        for ( const j of below ) {
            const x0 = Math.max( g[ i ][ 0 ], g[ j ][ 0 ] );
            const x1 = Math.min( g[ i ][ 2 ], g[ j ][ 2 ] );
            if ( x0 > x1 || g[ j ][ 1 ] <= g[ i ][ 3 ] ) {
                continue;
            }
            const x = ( x0 + x1 ) >> 1;
            if ( fence( 'h', g[ i ][ 3 ], g[ j ][ 1 ], x ) ) {
                return;
            }
            links.push( [ x, g[ i ][ 1 ], x, g[ j ][ 3 ] ] );
            return;
        }
    }
}

// Is there a line across the bridge between from and to? Lines are scaffolding: nothing belongs together
// across a table line. Work pixels.
function fenced( lines, s, dir, from, to, at ) {
    for ( const l of lines ) {
        if ( l.dir !== dir ) {
            continue;
        }
        const [ pos, lo, hi ] = dir === 'v' ? [ l.x, l.y, l.y + l.h ] : [ l.y, l.x, l.x + l.w ];
        if ( pos >= from * s && pos <= to * s && at * s >= lo && at * s <= hi ) {
            return true;
        }
    }
    return false;
}

// Value at share p of the sorted list, 0.5 = median.
function part( values, p ) {
    const v = [ ...values ].sort( ( a, b ) => a - b );
    return v[ Math.floor( p * ( v.length - 1 ) ) ];
}
