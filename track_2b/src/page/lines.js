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
            for ( const mask of [ ink, tone, solid ] ) {
                fillRect( mask, x, y, x + w - 1, y + h - 1, 0 );
            }
        }
    }
    return lines;
}

// The light fringe of a dark line is not a second line.
function known( lines, x, y, w, h, dir, scale ) {
    const near = 3 * scale;
    for ( const l of lines ) {
        if ( l.dir !== dir ) {
            continue;
        }
        if ( dir === 'h' && Math.abs( l.y - y ) <= near && l.x < x + w && l.x + l.w > x ) {
            return true;
        }
        if ( dir === 'v' && Math.abs( l.x - x ) <= near && l.y < y + h && l.y + l.h > y ) {
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
