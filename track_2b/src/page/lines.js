import { cloneMask, fillRect, transpose, countInk, runs } from './mask.js';

// Straight lines: found and taken out of the masks. Lines are scaffolding (tables, frames, writing lines),
// not content; left in, the smearing would glue everything along a table line into one object.

// In character heights: longer than any stroke of a letter, thinner than a bar.
const MIN_LENGTH = 4.0;
const MAX_THICK = 0.5;

// Runs on top of each other belong to the same line when start and length are this close.
const TOLERANCE = 3;

// Ink above and below the run to this share means it is part of an area (title bar with light text), not a line.
const MAX_FLANK = 0.5;

// The fringe of a dark line: this many work pixels to either side of it go out of the masks with it. On a
// photographed page a line is blurred: the rows at its edge are ink only in places, so they are no part of the
// line found, and what stays of them lies in the boxes as crumbs and glues the label beside a border to it.
// Where such a row is long enough to be found as a line of its own, it is none: a dark line that lies along a
// longer one, no further from it than the fringe and nowhere beyond its ends, is that line's edge. Measured 11
// October 2026 on five made-up photographs of a sheet of boxes (24 form fields): without the fringe 12 to 18 of
// the 24 were found, with two pixels 24 on every one, with one pixel 23 on one of them. On the rendered pages of
// the fillable forms nothing changes. Set by the assistant, open.
const FRINGE = 2;

// Finds the lines of the page and erases them from the ink, tone and solid masks. Original pixels.
export function findLines( page ) {
    const lines = [];
    const { ink, tone, solid } = page.masks;

    // Light lines exist only in the tone mask. The ink is subtracted there, otherwise a dark line
    // merges with the grey area next to it.
    const light = cloneMask( tone );
    for ( let i = 0; i < light.data.length; i++ ) {
        light.data[ i ] = tone.data[ i ] ^ ink.data[ i ];
    }

    // Both directions are searched on the untouched masks: at a crossing the pixel belongs to both lines.
    const found = [
        [ scan( ink, page.unit ), 'h', false ],
        [ scan( transpose( ink ), page.unit ), 'v', false ],
        [ scan( light, page.unit ), 'h', true ],
        [ scan( transpose( light ), page.unit ), 'v', true ],
    ];

    const s = page.scale;
    for ( const [ list, dir, isLight ] of found ) {
        for ( const l of list ) {
            const [ x, y, w, h ] = dir === 'h' ? l : [ l[ 1 ], l[ 0 ], l[ 3 ], l[ 2 ] ];
            if ( isLight && known( lines, x * s, y * s, w * s, h * s, dir, s ) ) {
                continue;
            }
            lines.push( { x: x * s, y: y * s, w: w * s, h: h * s, dir, light: isLight } );
            const fx = !isLight && dir === 'v' ? FRINGE : 0;
            const fy = !isLight && dir === 'h' ? FRINGE : 0;
            for ( const mask of [ ink, tone, solid ] ) {
                fillRect( mask, Math.max( 0, x - fx ), Math.max( 0, y - fy ), Math.min( mask.width - 1, x + w - 1 + fx ), Math.min( mask.height - 1, y + h - 1 + fy ), 0 );
            }
        }
    }
    return lines.filter( ( l ) => l.light || !lines.some( ( o ) => edgeOf( l, o, s ) ) );
}

// Is the dark line a the edge of the dark line b? Same direction, b longer, a beside it within the fringe and
// inside its length.
function edgeOf( a, b, scale ) {
    if ( a === b || b.light || a.dir !== b.dir ) {
        return false;
    }
    const f = FRINGE * scale;
    const [ along, across, length, thick ] = a.dir === 'h' ? [ 'x', 'y', 'w', 'h' ] : [ 'y', 'x', 'h', 'w' ];
    if ( b[ length ] <= a[ length ] || a[ along ] < b[ along ] - f || a[ along ] + a[ length ] > b[ along ] + b[ length ] + f ) {
        return false;
    }
    const between = Math.max( a[ across ] - b[ across ] - b[ thick ], b[ across ] - a[ across ] - a[ thick ] );
    return between <= f;
}

// The light fringe of a dark line is not a second line. Near is measured between the two, not between their
// upper edges: the fringe under a line six pixels thick starts eight below its top.
function known( lines, x, y, w, h, dir, scale ) {
    const near = 3 * scale;
    for ( const l of lines ) {
        if ( l.dir !== dir ) {
            continue;
        }
        if ( dir === 'h' && Math.max( y - l.y - l.h, l.y - y - h ) <= near && l.x < x + w && l.x + l.w > x ) {
            return true;
        }
        if ( dir === 'v' && Math.max( x - l.x - l.w, l.x - x - w ) <= near && l.y < y + h && l.y + l.h > y ) {
            return true;
        }
    }
    return false;
}

// Long runs per row, bundled over neighbouring rows into lines with a thickness.
// Returns [ start, row, length, thickness ] in the coordinates of the given mask.
function scan( mask, unit ) {
    const min = Math.max( 8, Math.round( MIN_LENGTH * unit ) );
    const thick = Math.max( 3, Math.round( MAX_THICK * unit ) );

    let open = [];
    const done = [];
    for ( let y = 0; y < mask.height; y++ ) {
        const next = [];
        for ( const [ x0, x1 ] of runs( mask, y ) ) {
            const len = x1 - x0 + 1;
            if ( len < min ) {
                continue;
            }
            let hit = false;
            for ( let k = 0; k < open.length; k++ ) {
                const o = open[ k ];
                if ( Math.abs( o[ 0 ] - x0 ) <= TOLERANCE && Math.abs( o[ 2 ] - len ) <= 2 * TOLERANCE ) {
                    const a = Math.min( o[ 0 ], x0 );
                    const b = Math.max( o[ 0 ] + o[ 2 ], x0 + len );
                    next.push( [ a, o[ 1 ], b - a, o[ 3 ] + 1 ] );
                    open.splice( k, 1 );
                    hit = true;
                    break;
                }
            }
            if ( !hit ) {
                next.push( [ x0, y, len, 1 ] );
            }
        }
        done.push( ...open );
        open = next;
    }
    done.push( ...open );

    const out = [];
    for ( const l of done ) {
        // thick runs are bars or filled areas and stay content
        if ( l[ 3 ] > thick ) {
            continue;
        }
        const above = l[ 1 ] - 2;
        const below = l[ 1 ] + l[ 3 ] + 1;
        let flank = 0;
        if ( above >= 0 ) {
            flank += countInk( mask, above, l[ 0 ], l[ 2 ] );
        }
        if ( below < mask.height ) {
            flank += countInk( mask, below, l[ 0 ], l[ 2 ] );
        }
        if ( flank > MAX_FLANK * 2 * l[ 2 ] ) {
            continue;
        }
        out.push( l );
    }
    return out;
}
