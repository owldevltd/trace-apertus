// A mask is one byte per pixel, 1 for ink and 0 for paper, stored row by row in a single Uint8Array.
// The geometry works on these masks only: smearing, labelling connected runs, transposing for the
// vertical direction. Pure functions; a mask is never changed in place unless the name says so.

export function createMask( width, height, fill = 0 ) {
    const data = new Uint8Array( width * height );
    if ( fill ) {
        data.fill( fill );
    }
    return { width, height, data };
}

export function cloneMask( mask ) {
    return { width: mask.width, height: mask.height, data: new Uint8Array( mask.data ) };
}

export function row( mask, y ) {
    return mask.data.subarray( y * mask.width, ( y + 1 ) * mask.width );
}

// Rows become columns, so vertical runs are searched with the same code as horizontal ones.
export function transpose( mask ) {
    const out = createMask( mask.height, mask.width );
    const w = mask.width;
    for ( let y = 0; y < mask.height; y++ ) {
        const base = y * w;
        for ( let x = 0; x < w; x++ ) {
            out.data[ x * mask.height + y ] = mask.data[ base + x ];
        }
    }
    return out;
}

// Run-length smearing: paper runs of up to gap pixels that have ink on both sides become ink.
export function smear( mask, gap ) {
    const out = cloneMask( mask );
    if ( gap < 1 ) {
        return out;
    }
    const w = mask.width;
    for ( let y = 0; y < mask.height; y++ ) {
        const base = y * w;
        let last = -1;
        for ( let x = 0; x < w; x++ ) {
            if ( mask.data[ base + x ] !== 1 ) {
                continue;
            }
            if ( last >= 0 && x - last - 1 >= 1 && x - last - 1 <= gap ) {
                out.data.fill( 1, base + last + 1, base + x );
            }
            last = x;
        }
    }
    return out;
}

// Fill a rectangle (work pixels, inclusive bounds) with a value.
export function fillRect( mask, x0, y0, x1, y1, value ) {
    const w = mask.width;
    x0 = Math.max( 0, x0 );
    x1 = Math.min( w - 1, x1 );
    y0 = Math.max( 0, y0 );
    y1 = Math.min( mask.height - 1, y1 );
    for ( let y = y0; y <= y1; y++ ) {
        mask.data.fill( value, y * w + x0, y * w + x1 + 1 );
    }
}

// Mask of a rectangle cut out of another mask.
export function crop( mask, x0, y0, width, height ) {
    const out = createMask( width, height );
    for ( let y = 0; y < height; y++ ) {
        out.data.set( mask.data.subarray( ( y0 + y ) * mask.width + x0, ( y0 + y ) * mask.width + x0 + width ), y * width );
    }
    return out;
}

// Number of ink pixels in a row segment.
export function countInk( mask, y, x0, width ) {
    const base = y * mask.width + x0;
    let n = 0;
    for ( let i = 0; i < width; i++ ) {
        n += mask.data[ base + i ];
    }
    return n;
}

// Whether a row segment carries any ink.
export function hasInk( mask, y, x0, width ) {
    const base = y * mask.width + x0;
    for ( let i = 0; i < width; i++ ) {
        if ( mask.data[ base + i ] === 1 ) {
            return true;
        }
    }
    return false;
}

// Number of separate ink runs in a byte sequence.
export function countRuns( bytes ) {
    let n = 0;
    let inRun = false;
    for ( let i = 0; i < bytes.length; i++ ) {
        if ( bytes[ i ] === 1 ) {
            if ( !inRun ) {
                n++;
                inRun = true;
            }
        } else {
            inRun = false;
        }
    }
    return n;
}

// Ink runs of one row as [ x0, x1 ] pairs.
export function runs( mask, y ) {
    const out = [];
    const w = mask.width;
    const base = y * w;
    let start = -1;
    for ( let x = 0; x < w; x++ ) {
        if ( mask.data[ base + x ] === 1 ) {
            if ( start < 0 ) {
                start = x;
            }
        } else if ( start >= 0 ) {
            out.push( [ start, x - 1 ] );
            start = -1;
        }
    }
    if ( start >= 0 ) {
        out.push( [ start, w - 1 ] );
    }
    return out;
}

// Connected components over ink runs: a run belongs to every run of the previous row it touches,
// diagonally as well. Returns one box per component: [ x0, y0, x1, y1, pixels ] in work pixels,
// in the order the components were first seen.
export function label( mask ) {
    const parent = [];
    const box = [];
    let prev = [];
    for ( let y = 0; y < mask.height; y++ ) {
        const rowRuns = runs( mask, y );
        if ( !rowRuns.length ) {
            prev = [];
            continue;
        }
        const cur = [];
        let pi = 0;
        const pn = prev.length;
        for ( const [ x0, x1 ] of rowRuns ) {
            const id = parent.length;
            parent.push( id );
            box.push( [ x0, y, x1, y, x1 - x0 + 1 ] );
            while ( pi < pn && prev[ pi ][ 1 ] < x0 - 1 ) {
                pi++;
            }
            let pj = pi;
            while ( pj < pn && prev[ pj ][ 0 ] <= x1 + 1 ) {
                const a = root( parent, id );
                const b = root( parent, prev[ pj ][ 2 ] );
                if ( a !== b ) {
                    parent[ a ] = b;
                    const ba = box[ a ];
                    const bb = box[ b ];
                    box[ b ] = [ Math.min( ba[ 0 ], bb[ 0 ] ), Math.min( ba[ 1 ], bb[ 1 ] ), Math.max( ba[ 2 ], bb[ 2 ] ), Math.max( ba[ 3 ], bb[ 3 ] ), ba[ 4 ] + bb[ 4 ] ];
                }
                pj++;
            }
            // the last touched run of the previous row may touch the next run as well
            if ( pj > pi ) {
                pi = pj - 1;
            }
            cur.push( [ x0, x1, id ] );
        }
        prev = cur;
    }
    const out = [];
    for ( let id = 0; id < parent.length; id++ ) {
        if ( parent[ id ] === id ) {
            out.push( box[ id ] );
        }
    }
    return out;
}

export function root( parent, id ) {
    while ( parent[ id ] !== id ) {
        parent[ id ] = parent[ parent[ id ] ];
        id = parent[ id ];
    }
    return id;
}

// Sort boxes top to bottom, then left to right.
export function byPosition( a, b ) {
    return a.y - b.y || a.x - b.x;
}
