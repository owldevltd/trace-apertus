// Straightening a photographed sheet: the four corners give a homography, the picture is mapped back into a
// rectangle, then the light is evened out so the result looks like a scan. All on canvases, no library.

// A straightened page comes out at the width the pipeline is measured on, A4 at 300 dpi: a smaller sheet in the
// photo is scaled up (no detail gained, but the geometry's pixel thresholds stay in their tested range), a larger
// one down; the longer side is capped.
const WIDTH = 2480;
const MAX_SIDE = 3600;

// share of the way from each corner towards the centre that is cut off
const INSET = 0.006;

// a quad counts as a sheet when its corners are this close to right angles and its sides pair up
const ANGLE = 25;
const SIDES = 0.75;

// light: blocks for the background map, and the percentiles that become black and white
const BLOCK = 32;
const BLACK = 0.02;
const WHITE = 0.9;

// Does the quad look like a rectangle seen in perspective? Angles near 90°, opposite sides of similar length.
export function isRectangular( q ) {
    for ( let i = 0; i < 4; i++ ) {
        const a = q[ ( i + 3 ) % 4 ];
        const b = q[ i ];
        const c = q[ ( i + 1 ) % 4 ];
        const v1 = { x: a.x - b.x, y: a.y - b.y };
        const v2 = { x: c.x - b.x, y: c.y - b.y };
        const n1 = Math.hypot( v1.x, v1.y );
        const n2 = Math.hypot( v2.x, v2.y );
        const cos = n1 && n2 ? ( v1.x * v2.x + v1.y * v2.y ) / ( n1 * n2 ) : 0;
        if ( Math.abs( Math.acos( Math.max( -1, Math.min( 1, cos ) ) ) * 180 / Math.PI - 90 ) > ANGLE ) {
            return false;
        }
    }
    const top = dist( q[ 0 ], q[ 1 ] );
    const bottom = dist( q[ 3 ], q[ 2 ] );
    const left = dist( q[ 0 ], q[ 3 ] );
    const right = dist( q[ 1 ], q[ 2 ] );
    return Math.min( top, bottom ) / Math.max( top, bottom ) >= SIDES && Math.min( left, right ) / Math.max( left, right ) >= SIDES;
}

// The straightened sheet as a new canvas. source: a canvas with the photo; quad: its corners in source
// pixels, top-left, top-right, bottom-right, bottom-left.
export function rectify( source, corners ) {
    // the corners come from a coarse search: a hair inward, so no table shows along the edges
    const cx = corners.reduce( ( a, p ) => a + p.x, 0 ) / 4;
    const cy = corners.reduce( ( a, p ) => a + p.y, 0 ) / 4;
    const quad = corners.map( ( p ) => ( { x: p.x + ( cx - p.x ) * INSET, y: p.y + ( cy - p.y ) * INSET } ) );
    const w0 = ( dist( quad[ 0 ], quad[ 1 ] ) + dist( quad[ 3 ], quad[ 2 ] ) ) / 2;
    const h0 = ( dist( quad[ 0 ], quad[ 3 ] ) + dist( quad[ 1 ], quad[ 2 ] ) ) / 2;
    const k = Math.min( WIDTH / w0, MAX_SIDE / Math.max( w0, h0 ) );
    const width = Math.max( 1, Math.round( w0 * k ) );
    const height = Math.max( 1, Math.round( h0 * k ) );
    // H maps a point of the rectangle to the photo
    const H = homography( [ { x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height } ], quad );
    const src = source.getContext( '2d' ).getImageData( 0, 0, source.width, source.height );
    const out = document.createElement( 'canvas' );
    out.width = width;
    out.height = height;
    const dst = out.getContext( '2d' ).createImageData( width, height );
    const sw = src.width;
    const sh = src.height;
    const s = src.data;
    const d = dst.data;
    for ( let y = 0; y < height; y++ ) {
        for ( let x = 0; x < width; x++ ) {
            const den = H[ 6 ] * x + H[ 7 ] * y + 1;
            const u = ( H[ 0 ] * x + H[ 1 ] * y + H[ 2 ] ) / den;
            const v = ( H[ 3 ] * x + H[ 4 ] * y + H[ 5 ] ) / den;
            const o = ( y * width + x ) * 4;
            if ( u < 0 || v < 0 || u >= sw - 1 || v >= sh - 1 ) {
                d[ o ] = d[ o + 1 ] = d[ o + 2 ] = 255;
                d[ o + 3 ] = 255;
                continue;
            }
            // bilinear
            const x0 = Math.floor( u );
            const y0 = Math.floor( v );
            const fx = u - x0;
            const fy = v - y0;
            const i00 = ( y0 * sw + x0 ) * 4;
            const i10 = i00 + 4;
            const i01 = i00 + sw * 4;
            const i11 = i01 + 4;
            for ( let c = 0; c < 3; c++ ) {
                d[ o + c ] = ( s[ i00 + c ] * ( 1 - fx ) + s[ i10 + c ] * fx ) * ( 1 - fy ) + ( s[ i01 + c ] * ( 1 - fx ) + s[ i11 + c ] * fx ) * fy;
            }
            d[ o + 3 ] = 255;
        }
    }
    out.getContext( '2d' ).putImageData( dst, 0, 0 );
    return out;
}

// Evens out the light: shading goes away against a coarse background map, then the darkest percentile becomes
// black and the paper white. Changes the canvas in place.
export function enhance( canvas ) {
    const g = canvas.getContext( '2d' );
    const img = g.getImageData( 0, 0, canvas.width, canvas.height );
    const { width, height, data } = img;
    const bw = Math.ceil( width / BLOCK );
    const bh = Math.ceil( height / BLOCK );
    // background: the bright side of every block (its 90th percentile of luminance)
    const back = new Float32Array( bw * bh );
    for ( let by = 0; by < bh; by++ ) {
        for ( let bx = 0; bx < bw; bx++ ) {
            const values = [];
            for ( let y = by * BLOCK; y < Math.min( height, ( by + 1 ) * BLOCK ); y += 2 ) {
                for ( let x = bx * BLOCK; x < Math.min( width, ( bx + 1 ) * BLOCK ); x += 2 ) {
                    const i = ( y * width + x ) * 4;
                    values.push( 0.299 * data[ i ] + 0.587 * data[ i + 1 ] + 0.114 * data[ i + 2 ] );
                }
            }
            values.sort( ( a, b ) => a - b );
            back[ by * bw + bx ] = Math.max( 32, values[ Math.floor( values.length * 0.9 ) ] || 255 );
        }
    }
    // flatten: every pixel relative to the (bilinearly read) background of its place
    const flat = new Float32Array( width * height );
    for ( let y = 0; y < height; y++ ) {
        const fy = Math.min( bh - 1, Math.max( 0, y / BLOCK - 0.5 ) );
        const y0 = Math.floor( fy );
        const y1 = Math.min( bh - 1, y0 + 1 );
        const ty = fy - y0;
        for ( let x = 0; x < width; x++ ) {
            const fx = Math.min( bw - 1, Math.max( 0, x / BLOCK - 0.5 ) );
            const x0 = Math.floor( fx );
            const x1 = Math.min( bw - 1, x0 + 1 );
            const tx = fx - x0;
            const b = ( back[ y0 * bw + x0 ] * ( 1 - tx ) + back[ y0 * bw + x1 ] * tx ) * ( 1 - ty ) + ( back[ y1 * bw + x0 ] * ( 1 - tx ) + back[ y1 * bw + x1 ] * tx ) * ty;
            const i = ( y * width + x ) * 4;
            const lum = 0.299 * data[ i ] + 0.587 * data[ i + 1 ] + 0.114 * data[ i + 2 ];
            flat[ y * width + x ] = Math.min( 255, lum / b * 255 );
        }
    }
    // stretch between the dark and the paper percentile
    const sample = [];
    for ( let i = 0; i < flat.length; i += 7 ) {
        sample.push( flat[ i ] );
    }
    sample.sort( ( a, b ) => a - b );
    const black = sample[ Math.floor( sample.length * BLACK ) ];
    const white = Math.max( black + 1, sample[ Math.floor( sample.length * WHITE ) ] );
    for ( let p = 0; p < flat.length; p++ ) {
        const i = p * 4;
        const lum = 0.299 * data[ i ] + 0.587 * data[ i + 1 ] + 0.114 * data[ i + 2 ];
        const target = Math.max( 0, Math.min( 255, ( flat[ p ] - black ) / ( white - black ) * 255 ) );
        const gain = lum > 0 ? target / lum : 0;
        data[ i ] = Math.min( 255, data[ i ] * gain );
        data[ i + 1 ] = Math.min( 255, data[ i + 1 ] * gain );
        data[ i + 2 ] = Math.min( 255, data[ i + 2 ] * gain );
    }
    g.putImageData( img, 0, 0 );
    return canvas;
}

// The homography that maps the four points from to the four points to, as [ h11 … h32 ] with h33 = 1.
export function homography( from, to ) {
    const A = [];
    const b = [];
    for ( let i = 0; i < 4; i++ ) {
        const { x, y } = from[ i ];
        const { x: u, y: v } = to[ i ];
        A.push( [ x, y, 1, 0, 0, 0, -u * x, -u * y ] );
        b.push( u );
        A.push( [ 0, 0, 0, x, y, 1, -v * x, -v * y ] );
        b.push( v );
    }
    return solve( A, b );
}

// Gaussian elimination with pivoting for an 8 × 8 system.
function solve( A, b ) {
    const n = b.length;
    const M = A.map( ( row, i ) => [ ...row, b[ i ] ] );
    for ( let c = 0; c < n; c++ ) {
        let p = c;
        for ( let r = c + 1; r < n; r++ ) {
            if ( Math.abs( M[ r ][ c ] ) > Math.abs( M[ p ][ c ] ) ) {
                p = r;
            }
        }
        [ M[ c ], M[ p ] ] = [ M[ p ], M[ c ] ];
        const pivot = M[ c ][ c ] || 1e-12;
        for ( let r = 0; r < n; r++ ) {
            if ( r === c ) {
                continue;
            }
            const f = M[ r ][ c ] / pivot;
            for ( let k = c; k <= n; k++ ) {
                M[ r ][ k ] -= f * M[ c ][ k ];
            }
        }
    }
    return M.map( ( row, i ) => row[ n ] / ( row[ i ] || 1e-12 ) );
}

function dist( a, b ) {
    return Math.hypot( a.x - b.x, a.y - b.y );
}
