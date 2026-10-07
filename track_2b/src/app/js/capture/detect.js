// Finds the sheet of paper in a picture: the largest bright patch against a darker background and its four
// corners. Works on a small copy of the frame (about 160 px wide), so it runs on every camera frame. A sheet on
// a white table has no edge for this to see; then the shutter stays with the person.

// working width of the small copy
export const SMALL = 160;

// a patch must fill its own corner quad this far to be a sheet (a sheet is a filled quadrilateral)
const SOLID = 0.8;

// smaller than this share of the picture is not the document
const MIN_AREA = 0.08;

// The quad of the document in the small picture's coordinates, or null. data: ImageData of the small copy.
export function findDocument( data ) {
    const { width, height } = data;
    const lum = new Float32Array( width * height );
    for ( let i = 0; i < lum.length; i++ ) {
        lum[ i ] = 0.299 * data.data[ i * 4 ] + 0.587 * data.data[ i * 4 + 1 ] + 0.114 * data.data[ i * 4 + 2 ];
    }
    const t = threshold( lum );
    const mask = new Uint8Array( lum.length );
    for ( let i = 0; i < lum.length; i++ ) {
        mask[ i ] = lum[ i ] > t ? 1 : 0;
    }
    const patch = largest( mask, width, height );
    if ( !patch || patch.n < MIN_AREA * width * height ) {
        return null;
    }
    const quad = corners( patch.pixels, width );
    const area = Math.abs( polygonArea( quad ) );
    if ( area <= 0 || patch.n < SOLID * area ) {
        return null;
    }
    return { quad, area, share: area / ( width * height ) };
}

// Light against dark: the mean between the means of the two halves, twice refined.
function threshold( lum ) {
    let t = 128;
    for ( let k = 0; k < 3; k++ ) {
        let lo = 0;
        let nlo = 0;
        let hi = 0;
        let nhi = 0;
        for ( const v of lum ) {
            if ( v > t ) {
                hi += v;
                nhi++;
            } else {
                lo += v;
                nlo++;
            }
        }
        t = ( ( nlo ? lo / nlo : 0 ) + ( nhi ? hi / nhi : 255 ) ) / 2;
    }
    return t;
}

// The largest connected bright patch, by flood fill. Returns its pixel count and its pixels.
function largest( mask, width, height ) {
    const seen = new Uint8Array( mask.length );
    const stack = new Int32Array( mask.length );
    let best = null;
    for ( let start = 0; start < mask.length; start++ ) {
        if ( !mask[ start ] || seen[ start ] ) {
            continue;
        }
        const pixels = [];
        let top = 0;
        stack[ top++ ] = start;
        seen[ start ] = 1;
        while ( top ) {
            const i = stack[ --top ];
            pixels.push( i );
            const x = i % width;
            const y = ( i - x ) / width;
            const around = [ i - 1, i + 1, i - width, i + width ];
            const ok = [ x > 0, x < width - 1, y > 0, y < height - 1 ];
            for ( let k = 0; k < 4; k++ ) {
                const j = around[ k ];
                if ( ok[ k ] && mask[ j ] && !seen[ j ] ) {
                    seen[ j ] = 1;
                    stack[ top++ ] = j;
                }
            }
        }
        if ( !best || pixels.length > best.n ) {
            best = { n: pixels.length, pixels };
        }
    }
    return best;
}

// Four corners of a patch: the pixels farthest towards each corner of the picture.
function corners( pixels, width ) {
    const pick = ( score ) => {
        let bestI = pixels[ 0 ];
        let bestS = -Infinity;
        for ( const i of pixels ) {
            const x = i % width;
            const y = ( i - x ) / width;
            const s = score( x, y );
            if ( s > bestS ) {
                bestS = s;
                bestI = i;
            }
        }
        const x = bestI % width;
        return { x, y: ( bestI - x ) / width };
    };
    return [ pick( ( x, y ) => -x - y ), pick( ( x, y ) => x - y ), pick( ( x, y ) => x + y ), pick( ( x, y ) => -x + y ) ];
}

export function polygonArea( q ) {
    let a = 0;
    for ( let i = 0; i < q.length; i++ ) {
        const p = q[ i ];
        const n = q[ ( i + 1 ) % q.length ];
        a += p.x * n.y - n.x * p.y;
    }
    return a / 2;
}

// Does the quad sit inside the guide frame (a rectangle in the same coordinates), within a tolerance, and fill
// most of it?
export function inFrame( quad, frame, tolerance = 0.06, fill = 0.7 ) {
    const dx = frame.w * tolerance;
    const dy = frame.h * tolerance;
    const inside = quad.every( ( p ) => p.x >= frame.x - dx && p.x <= frame.x + frame.w + dx && p.y >= frame.y - dy && p.y <= frame.y + frame.h + dy );
    return inside && Math.abs( polygonArea( quad ) ) >= fill * frame.w * frame.h;
}

// Two quads are the same when no corner moved more than a share of the picture width.
export function sameQuad( a, b, width, share = 0.02 ) {
    return a && b && a.every( ( p, i ) => Math.hypot( p.x - b[ i ].x, p.y - b[ i ].y ) <= share * width );
}
