import { cloneMask, fillRect, crop, label, smear, transpose, byPosition } from './mask.js';

// Objects: ink that lies close together belongs together. Run-length smearing (Wong, Casey, Wahl 1982):
// short paper gaps between ink are closed, first horizontally (glyph → word → line), then vertically
// (line → paragraph); whatever is connected afterwards is one object.

// Gaps in character heights. Word gaps are around 0.5, column gaps above 2. Forms want little vertical
// smearing: the line decides in the joiner.
const SMEAR_H = 1.2;
const SMEAR_V = 0.3;

// An object from this share of the page on is too big; it is computed again inside its box, horizontally only.
const BIG = 0.25;

// Smaller than this (work pixels, both sides) is dust.
const MIN_SIZE = 3;

// A tinted area fills its rectangle at least to this share.
const MIN_FILL = 0.7;

// Character height of the page = median height of all ink blobs. Every distance hangs on it,
// so the same values hold for 8 pt and 14 pt.
export function measureUnit( page ) {
    const heights = [];
    for ( const b of label( page.masks.ink ) ) {
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( h >= 4 && h <= 80 ) {
            heights.push( h );
        }
    }
    if ( !heights.length ) {
        return page.unit;
    }
    heights.sort( ( a, b ) => a - b );
    return heights[ Math.floor( heights.length / 2 ) ];
}

// The objects of the page, in original pixels. links are bridges the joiner lays into the mask first.
export function findObjects( page, links ) {
    const linked = cloneMask( page.masks.ink );
    for ( const [ x0, y0, x1, y1 ] of links ) {
        fillRect( linked, x0, y0, x1, y1, 1 );
    }
    let rows = smear( linked, Math.round( SMEAR_H * page.unit ) );
    rows = transpose( smear( transpose( rows ), Math.round( SMEAR_V * page.unit ) ) );

    // too big objects once more inside their box, smeared horizontally only
    const big = BIG * page.w * page.h;
    const list = [];
    for ( const b of label( rows ) ) {
        const w = b[ 2 ] - b[ 0 ] + 1;
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( w * h < big ) {
            list.push( b );
            continue;
        }
        const sub = smear( crop( linked, b[ 0 ], b[ 1 ], w, h ), Math.round( SMEAR_H * page.unit ) );
        for ( const c of label( sub ) ) {
            list.push( [ c[ 0 ] + b[ 0 ], c[ 1 ] + b[ 1 ], c[ 2 ] + b[ 0 ], c[ 3 ] + b[ 1 ], c[ 4 ] ] );
        }
    }

    const s = page.scale;
    const objects = [];
    for ( const b of list ) {
        const w = b[ 2 ] - b[ 0 ] + 1;
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( w < MIN_SIZE && h < MIN_SIZE ) {
            continue;
        }
        objects.push( { x: b[ 0 ] * s, y: b[ 1 ] * s, w: w * s, h: h * s } );
    }
    return objects.sort( byPosition );
}

// Tinted areas: grey fields, coloured boxes. Only what is tinted without ink and fills its rectangle well;
// the rest are fringes and gradients.
export function findAreas( page ) {
    const solid = page.masks.solid;
    const ink = page.masks.ink;
    const rows = cloneMask( solid );
    for ( let i = 0; i < rows.data.length; i++ ) {
        rows.data[ i ] = solid.data[ i ] & ( ink.data[ i ] ^ 1 );
    }

    const s = page.scale;
    const min = Math.max( 4, Math.floor( page.unit / 2 ) );
    const areas = [];
    for ( const b of label( rows ) ) {
        const w = b[ 2 ] - b[ 0 ] + 1;
        const h = b[ 3 ] - b[ 1 ] + 1;
        if ( w < 2 * page.unit || h < min ) {
            continue;
        }
        if ( b[ 4 ] < MIN_FILL * w * h ) {
            continue;
        }
        areas.push( { x: b[ 0 ] * s, y: b[ 1 ] * s, w: w * s, h: h * s } );
    }
    return areas.sort( byPosition );
}
