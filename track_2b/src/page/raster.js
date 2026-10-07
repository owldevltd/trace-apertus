import fs from 'node:fs/promises';
import { decodePng, encodePng } from './png.js';

// Pixel work on RGB images: grey values, scaling by area averaging, crops, rectangles for the control
// images. An image is { width, height, data } with three bytes per pixel.

export async function readImage( file ) {
    return decodePng( await fs.readFile( file ) );
}

export async function writeImage( file, image ) {
    await fs.writeFile( file, encodePng( image.width, image.height, image.data ) );
}

// One grey byte per pixel, Rec. 709 luma on the stored values.
export function toGray( image ) {
    const n = image.width * image.height;
    const gray = new Uint8Array( n );
    const d = image.data;
    for ( let i = 0; i < n; i++ ) {
        gray[ i ] = Math.round( 0.2126 * d[ i * 3 ] + 0.7152 * d[ i * 3 + 1 ] + 0.0722 * d[ i * 3 + 2 ] );
    }
    return gray;
}

// Source pixels covered by each target pixel when scaling, with the share of each: [ [ index, weight ], … ].
// Fractions included, so the blocks drift slightly across the page, the way image libraries scale.
export function coverage( source, target ) {
    const ratio = source / target;
    const out = [];
    for ( let t = 0; t < target; t++ ) {
        const s0 = t * ratio;
        const s1 = s0 + ratio;
        const list = [];
        for ( let c = Math.floor( s0 ); c < Math.min( source, Math.ceil( s1 ) ); c++ ) {
            const weight = Math.min( c + 1, s1 ) - Math.max( c, s0 );
            if ( weight > 1e-9 ) {
                list.push( [ c, weight ] );
            }
        }
        out.push( list );
    }
    return out;
}

// Scales an RGB image to a width, height by the same ratio, averaging over the covered pixels.
// Separable: first every row across, then the rows down.
export function scaleImage( image, width ) {
    const height = Math.max( 1, Math.round( image.height * width / image.width ) );
    const cols = coverage( image.width, width );
    const rows = coverage( image.height, height );
    const across = new Float32Array( width * image.height * 3 );
    for ( let y = 0; y < image.height; y++ ) {
        const base = y * image.width * 3;
        for ( let x = 0; x < width; x++ ) {
            let r = 0;
            let g = 0;
            let b = 0;
            let total = 0;
            for ( const [ sx, wx ] of cols[ x ] ) {
                const i = base + sx * 3;
                r += image.data[ i ] * wx;
                g += image.data[ i + 1 ] * wx;
                b += image.data[ i + 2 ] * wx;
                total += wx;
            }
            const o = ( y * width + x ) * 3;
            across[ o ] = r / total;
            across[ o + 1 ] = g / total;
            across[ o + 2 ] = b / total;
        }
    }
    const out = new Uint8Array( width * height * 3 );
    for ( let y = 0; y < height; y++ ) {
        for ( let x = 0; x < width; x++ ) {
            let r = 0;
            let g = 0;
            let b = 0;
            let total = 0;
            for ( const [ sy, wy ] of rows[ y ] ) {
                const i = ( sy * width + x ) * 3;
                r += across[ i ] * wy;
                g += across[ i + 1 ] * wy;
                b += across[ i + 2 ] * wy;
                total += wy;
            }
            const o = ( y * width + x ) * 3;
            out[ o ] = Math.round( r / total );
            out[ o + 1 ] = Math.round( g / total );
            out[ o + 2 ] = Math.round( b / total );
        }
    }
    return { width, height, data: out };
}

export function cropImage( image, x0, y0, width, height ) {
    const out = new Uint8Array( width * height * 3 );
    for ( let y = 0; y < height; y++ ) {
        out.set( image.data.subarray( ( ( y0 + y ) * image.width + x0 ) * 3, ( ( y0 + y ) * image.width + x0 + width ) * 3 ), y * width * 3 );
    }
    return { width, height, data: out };
}

// Blends a colour into a rectangle; opacity 1 paints it solid.
export function fillRect( image, x, y, w, h, colour, opacity ) {
    const x0 = Math.max( 0, Math.round( x ) );
    const y0 = Math.max( 0, Math.round( y ) );
    const x1 = Math.min( image.width, Math.round( x + w ) );
    const y1 = Math.min( image.height, Math.round( y + h ) );
    const keep = 1 - opacity;
    for ( let py = y0; py < y1; py++ ) {
        for ( let px = x0; px < x1; px++ ) {
            const i = ( py * image.width + px ) * 3;
            image.data[ i ] = Math.round( image.data[ i ] * keep + colour[ 0 ] * opacity );
            image.data[ i + 1 ] = Math.round( image.data[ i + 1 ] * keep + colour[ 1 ] * opacity );
            image.data[ i + 2 ] = Math.round( image.data[ i + 2 ] * keep + colour[ 2 ] * opacity );
        }
    }
}

// Draws the border of a rectangle, the stroke centred on the edge.
export function strokeRect( image, x, y, w, h, colour, thickness ) {
    const t = thickness / 2;
    fillRect( image, x - t, y - t, w + 2 * t, thickness, colour, 1 );
    fillRect( image, x - t, y + h - t, w + 2 * t, thickness, colour, 1 );
    fillRect( image, x - t, y - t, thickness, h + 2 * t, colour, 1 );
    fillRect( image, x + w - t, y - t, thickness, h + 2 * t, colour, 1 );
}

// Blends a colour into an ellipse that fills the given box.
export function fillEllipse( image, x, y, w, h, colour, opacity ) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const keep = 1 - opacity;
    for ( let py = Math.max( 0, Math.floor( y ) ); py < Math.min( image.height, Math.ceil( y + h ) ); py++ ) {
        for ( let px = Math.max( 0, Math.floor( x ) ); px < Math.min( image.width, Math.ceil( x + w ) ); px++ ) {
            const dx = ( px + 0.5 - cx ) / rx;
            const dy = ( py + 0.5 - cy ) / ry;
            if ( dx * dx + dy * dy > 1 ) {
                continue;
            }
            const i = ( py * image.width + px ) * 3;
            image.data[ i ] = Math.round( image.data[ i ] * keep + colour[ 0 ] * opacity );
            image.data[ i + 1 ] = Math.round( image.data[ i + 1 ] * keep + colour[ 1 ] * opacity );
            image.data[ i + 2 ] = Math.round( image.data[ i + 2 ] * keep + colour[ 2 ] * opacity );
        }
    }
}

export function hexColour( hex ) {
    return [ parseInt( hex.slice( 1, 3 ), 16 ), parseInt( hex.slice( 3, 5 ), 16 ), parseInt( hex.slice( 5, 7 ), 16 ) ];
}
