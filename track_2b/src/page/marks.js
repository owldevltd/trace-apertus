import { label, row, hasInk, countRuns, byPosition } from './mask.js';

// Tick marks the geometry can name on its own: empty boxes and empty circles, and on a form also the
// ticked box and the filled circle (content "x").

// Side length in character heights of the page, and how far width and height may differ.
const MIN_SIZE = 0.6;
const MAX_SIZE = 4.0;
const SQUARE = 1.25;
const ROUND = 1.15;

// Share of an edge that carries ink: almost all of it for a box, only its middle part for a circle.
const EDGE_FULL = 0.8;
const EDGE_ARC = 0.75;

// Inside at most this share of ink.
const HOLLOW = 0.05;

// Free to the left and right, in shares of the own height: an O in a word does not stand free.
const CLEAR = 0.25;

// Ticked box: smallest side in character heights. Measured 2026-10-06: from 0.9 to 1.2 all 351 real crosses
// stay and false finds drop from 151 to 30–34 (the "n" of bold type); from 1.4 real ones drop out. Set by hand, open.
const MARK_X_MIN = 1.0;

export function findMarks( page ) {
    const ink = page.masks.ink;
    const s = page.scale;
    const marks = [];
    for ( const b of label( ink ) ) {
        const w = b[ 2 ] - b[ 0 ] + 1;
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( Math.min( w, h ) < MIN_SIZE * page.unit || Math.max( w, h ) > MAX_SIZE * page.unit ) {
            continue;
        }
        if ( Math.max( w, h ) > SQUARE * Math.min( w, h ) ) {
            continue;
        }
        const kind = shape( ink, page.unit, b[ 0 ], b[ 1 ], w, h );
        if ( kind === '' ) {
            continue;
        }
        marks.push( { x: b[ 0 ] * s, y: b[ 1 ] * s, w: w * s, h: h * s, kind: kind.replace( '+', '' ), content: kind.endsWith( '+' ) ? 'x' : '' } );
    }
    return marks.sort( byPosition );
}

// 'checkbox', 'radio', 'checkbox+' (ticked), 'radio+' (filled), or ''. Work pixels.
function shape( ink, unit, x, y, w, h ) {
    // edges: only the outermost pixels. Deeper in, even a circle has almost the whole width under ink.
    const t = Math.max( 1, Math.floor( Math.min( w, h ) / 10 ) );
    const rows = [];
    for ( let r = 0; r < h; r++ ) {
        rows.push( row( ink, y + r ).subarray( x, x + w ) );
    }
    let top = 0;
    let bottom = 0;
    for ( let r = 0; r < t; r++ ) {
        top = Math.max( top, sum( rows[ r ] ) );
        bottom = Math.max( bottom, sum( rows[ h - 1 - r ] ) );
    }
    let left = 0;
    let right = 0;
    for ( const line of rows ) {
        left += any( line.subarray( 0, t ) ) ? 1 : 0;
        right += any( line.subarray( w - t ) ) ? 1 : 0;
    }

    // inside: only the middle field. Closer to the edge, the ring of a circle would already lie in the corners of the field.
    const q = Math.max( t + 1, Math.round( 0.35 * Math.min( w, h ) ) );
    let inside = 0;
    for ( let r = q; r < h - q; r++ ) {
        inside += sum( rows[ r ].subarray( q, w - q ) );
    }
    if ( w - 2 * q < 1 || h - 2 * q < 1 ) {
        return '';
    }
    const hollow = inside <= HOLLOW * ( w - 2 * q ) * ( h - 2 * q );

    if ( top >= EDGE_FULL * w && bottom >= EDGE_FULL * w && left >= EDGE_FULL * h && right >= EDGE_FULL * h ) {
        if ( hollow ) {
            return 'checkbox';
        }
        // the "n" of bold type is a frame with ink inside too, but smaller than a box
        return Math.min( w, h ) >= MARK_X_MIN * unit ? 'checkbox+' : '';
    }

    // circle: every edge touched only in the middle, all four corners empty, free on the left and right
    if ( top > EDGE_ARC * w || bottom > EDGE_ARC * w || left > EDGE_ARC * h || right > EDGE_ARC * h ) {
        return '';
    }
    if ( !top || !bottom || !left || !right ) {
        return '';
    }
    if ( Math.max( w, h ) > ROUND * Math.min( w, h ) ) {
        return '';
    }

    // closed: from the middle, every direction meets ink (a C or U is open)
    const mid = rows[ Math.floor( h / 2 ) ];
    const col = new Uint8Array( h );
    for ( let r = 0; r < h; r++ ) {
        col[ r ] = rows[ r ][ Math.floor( w / 2 ) ];
    }
    const half = Math.floor( w / 2 );
    const halfH = Math.floor( h / 2 );
    if ( hollow && ( !any( mid.subarray( 0, half ) ) || !any( mid.subarray( half ) ) || !any( col.subarray( 0, halfH ) ) || !any( col.subarray( halfH ) ) ) ) {
        return '';
    }
    // filled circle: ring, dot, ring – three ink runs in the middle row and the middle column
    if ( !hollow && ( countRuns( mid ) !== 3 || countRuns( col ) !== 3 ) ) {
        return '';
    }

    const c = Math.max( 1, Math.floor( Math.min( w, h ) / 8 ) );
    for ( const r0 of [ 0, h - c ] ) {
        for ( let r = r0; r < r0 + c; r++ ) {
            if ( any( rows[ r ].subarray( 0, c ) ) || any( rows[ r ].subarray( w - c ) ) ) {
                return '';
            }
        }
    }
    const gap = Math.max( 2, Math.round( CLEAR * h ) );
    for ( let r = 0; r < h; r++ ) {
        const leftFrom = Math.max( 0, x - gap );
        if ( ( x - leftFrom > 0 && hasInk( ink, y + r, leftFrom, x - leftFrom ) ) || hasInk( ink, y + r, x + w, Math.min( gap, ink.width - x - w ) ) ) {
            return '';
        }
    }
    return hollow ? 'radio' : 'radio+';
}

function sum( bytes ) {
    let n = 0;
    for ( let i = 0; i < bytes.length; i++ ) {
        n += bytes[ i ];
    }
    return n;
}

function any( bytes ) {
    for ( let i = 0; i < bytes.length; i++ ) {
        if ( bytes[ i ] === 1 ) {
            return true;
        }
    }
    return false;
}
