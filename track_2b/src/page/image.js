import path from 'node:path';
import { createMask } from './mask.js';
import { readImage, toGray, coverage } from './raster.js';

// Page image → ink masks. The geometry works on a mask shrunk to about WORK_WIDTH pixels: object
// borders do not need 300 dpi, and loops over eight million pixels are not needed either.

const WORK_WIDTH = 1240;

// Ink is clearly darker than the paper, but at most this grey value.
const INK_MAX = 160;
const INK_DIST = 60;

// Tone starts just below paper white: grey field areas are often only 10–15 steps darker.
const TONE_DIST = 8;

export async function loadPage( file ) {
    const image = await readImage( file );
    const data = toGray( image );
    const width = image.width;
    const height = image.height;
    const scale = Math.max( 1, Math.round( width / WORK_WIDTH ) );
    const w = Math.floor( width / scale );
    const h = Math.floor( height / scale );

    // Paper white = the most frequent light grey. Scans sit at 235–250, old paper around 205;
    // a fixed threshold would be blind there.
    const hist = new Uint32Array( 256 );
    for ( let i = 0; i < data.length; i++ ) {
        hist[ data[ i ] ]++;
    }
    let paper = 255;
    let max = 0;
    for ( let v = 128; v < 256; v++ ) {
        if ( hist[ v ] > max ) {
            max = hist[ v ];
            paper = v;
        }
    }
    const ink = Math.min( INK_MAX, paper - INK_DIST );

    return {
        file: path.basename( file ),
        path: file,
        width,
        height,
        scale,
        w,
        h,
        paper,
        ink,
        unit: 10,
        gray: data,
        masks: {
            ink:   mask( data, width, height, w, h, scale, ink, false ),
            tone:  mask( data, width, height, w, h, scale, paper - TONE_DIST, false ),
            solid: mask( data, width, height, w, h, scale, paper - TONE_DIST, true ),
        },
    };
}

// First black and white at full resolution, then shrunk by area averaging, the way an image library scales:
// a work pixel covers width/w source pixels, fractions included, so the blocks drift slightly across the page.
// Loose: a single dark pixel in the block is enough, so 1-px lines survive. Strict: the whole block must be
// dark, so 1-px fringes drop out.
function mask( gray, width, height, w, h, scale, level, strict ) {
    const out = createMask( w, h );
    const part = Math.floor( 127 / ( scale * scale ) );
    const cut = strict ? part + 1 : 255 - part;
    const cols = coverage( width, w );
    const rows = coverage( height, h );
    const area = ( width / w ) * ( height / h );
    for ( let y = 0; y < h; y++ ) {
        const ry = rows[ y ];
        for ( let x = 0; x < w; x++ ) {
            const cx = cols[ x ];
            let sum = 0;
            for ( let j = 0; j < ry.length; j++ ) {
                const base = ( ry[ j ][ 0 ] ) * width;
                for ( let i = 0; i < cx.length; i++ ) {
                    if ( gray[ base + cx[ i ][ 0 ] ] >= level ) {
                        sum += ry[ j ][ 1 ] * cx[ i ][ 1 ];
                    }
                }
            }
            if ( 255 * sum / area < cut ) {
                out.data[ y * w + x ] = 1;
            }
        }
    }
    return out;
}
