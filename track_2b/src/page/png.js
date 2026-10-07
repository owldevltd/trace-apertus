import zlib from 'node:zlib';

// PNG in and out without a library: the page images come from the browser as PNG, the control images and
// the crops for the model go out as PNG. Decoding covers the usual files (8 and 16 bit, grey, RGB, palette,
// with or without alpha, no interlacing); encoding writes 8-bit RGB. Alpha is flattened on white.

const SIGNATURE = [ 137, 80, 78, 71, 13, 10, 26, 10 ];

// Decodes a PNG buffer into { width, height, data } with three bytes (RGB) per pixel.
export function decodePng( buffer ) {
    for ( let i = 0; i < 8; i++ ) {
        if ( buffer[ i ] !== SIGNATURE[ i ] ) {
            throw new Error( 'not a PNG file' );
        }
    }
    let width = 0;
    let height = 0;
    let depth = 8;
    let type = 2;
    let palette = null;
    const idat = [];
    let pos = 8;
    while ( pos < buffer.length ) {
        const length = buffer.readUInt32BE( pos );
        const name = buffer.toString( 'latin1', pos + 4, pos + 8 );
        const body = buffer.subarray( pos + 8, pos + 8 + length );
        if ( name === 'IHDR' ) {
            width = body.readUInt32BE( 0 );
            height = body.readUInt32BE( 4 );
            depth = body[ 8 ];
            type = body[ 9 ];
            if ( body[ 12 ] !== 0 ) {
                throw new Error( 'interlaced PNG is not supported' );
            }
        } else if ( name === 'PLTE' ) {
            palette = body;
        } else if ( name === 'IDAT' ) {
            idat.push( body );
        } else if ( name === 'IEND' ) {
            break;
        }
        pos += 12 + length;
    }
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ type ];
    if ( !channels || !width || !height ) {
        throw new Error( 'unsupported PNG' );
    }
    const raw = zlib.inflateSync( Buffer.concat( idat ) );
    const bitsPerPixel = channels * depth;
    const rowBytes = Math.ceil( width * bitsPerPixel / 8 );
    const bpp = Math.max( 1, bitsPerPixel >> 3 );
    const rows = unfilter( raw, width, height, rowBytes, bpp );
    return { width, height, data: toRgb( rows, width, height, depth, type, channels, palette ) };
}

// Undo the per-row filters: None, Sub, Up, Average, Paeth. Returns the raw scanlines, one Uint8Array per row.
function unfilter( raw, width, height, rowBytes, bpp ) {
    const rows = [];
    let prev = new Uint8Array( rowBytes );
    let pos = 0;
    for ( let y = 0; y < height; y++ ) {
        const filter = raw[ pos++ ];
        const row = new Uint8Array( raw.subarray( pos, pos + rowBytes ) );
        pos += rowBytes;
        if ( filter === 1 ) {
            for ( let i = bpp; i < rowBytes; i++ ) {
                row[ i ] = ( row[ i ] + row[ i - bpp ] ) & 255;
            }
        } else if ( filter === 2 ) {
            for ( let i = 0; i < rowBytes; i++ ) {
                row[ i ] = ( row[ i ] + prev[ i ] ) & 255;
            }
        } else if ( filter === 3 ) {
            for ( let i = 0; i < rowBytes; i++ ) {
                const left = i >= bpp ? row[ i - bpp ] : 0;
                row[ i ] = ( row[ i ] + ( ( left + prev[ i ] ) >> 1 ) ) & 255;
            }
        } else if ( filter === 4 ) {
            for ( let i = 0; i < rowBytes; i++ ) {
                const a = i >= bpp ? row[ i - bpp ] : 0;
                const b = prev[ i ];
                const c = i >= bpp ? prev[ i - bpp ] : 0;
                const p = a + b - c;
                const pa = Math.abs( p - a );
                const pb = Math.abs( p - b );
                const pc = Math.abs( p - c );
                row[ i ] = ( row[ i ] + ( pa <= pb && pa <= pc ? a : ( pb <= pc ? b : c ) ) ) & 255;
            }
        }
        rows.push( row );
        prev = row;
    }
    return rows;
}

// Scanlines of any colour type → RGB bytes, alpha flattened on white.
function toRgb( rows, width, height, depth, type, channels, palette ) {
    const out = new Uint8Array( width * height * 3 );
    const max = ( 1 << depth ) - 1;
    // the common files take the short way: 8-bit grey, RGB or RGBA
    if ( depth === 8 && ( type === 0 || type === 2 || type === 6 ) ) {
        for ( let y = 0; y < height; y++ ) {
            const row = rows[ y ];
            let o = y * width * 3;
            if ( type === 0 ) {
                for ( let x = 0; x < width; x++ ) {
                    out[ o++ ] = row[ x ];
                    out[ o++ ] = row[ x ];
                    out[ o++ ] = row[ x ];
                }
            } else if ( type === 2 ) {
                out.set( row.subarray( 0, width * 3 ), o );
            } else {
                for ( let x = 0, i = 0; x < width; x++, i += 4 ) {
                    const a = row[ i + 3 ];
                    if ( a === 255 ) {
                        out[ o++ ] = row[ i ];
                        out[ o++ ] = row[ i + 1 ];
                        out[ o++ ] = row[ i + 2 ];
                    } else {
                        out[ o++ ] = Math.round( ( row[ i ] * a + 255 * ( 255 - a ) ) / 255 );
                        out[ o++ ] = Math.round( ( row[ i + 1 ] * a + 255 * ( 255 - a ) ) / 255 );
                        out[ o++ ] = Math.round( ( row[ i + 2 ] * a + 255 * ( 255 - a ) ) / 255 );
                    }
                }
            }
        }
        return out;
    }
    for ( let y = 0; y < height; y++ ) {
        const row = rows[ y ];
        for ( let x = 0; x < width; x++ ) {
            const o = ( y * width + x ) * 3;
            const sample = ( k ) => {
                const i = x * channels + k;
                if ( depth === 8 ) {
                    return row[ i ];
                }
                if ( depth === 16 ) {
                    return row[ i * 2 ];
                }
                // 1, 2 or 4 bits per sample, packed from the high bit down
                const bit = i * depth;
                return ( row[ bit >> 3 ] >> ( 8 - depth - ( bit & 7 ) ) ) & max;
            };
            let r;
            let g;
            let b;
            let a = 255;
            if ( type === 3 ) {
                const p = sample( 0 ) * 3;
                r = palette[ p ];
                g = palette[ p + 1 ];
                b = palette[ p + 2 ];
            } else if ( type === 0 || type === 4 ) {
                const v = depth < 8 ? Math.round( sample( 0 ) * 255 / max ) : sample( 0 );
                r = g = b = v;
                if ( type === 4 ) {
                    a = sample( 1 );
                }
            } else {
                r = sample( 0 );
                g = sample( 1 );
                b = sample( 2 );
                if ( type === 6 ) {
                    a = sample( 3 );
                }
            }
            if ( a < 255 ) {
                r = Math.round( ( r * a + 255 * ( 255 - a ) ) / 255 );
                g = Math.round( ( g * a + 255 * ( 255 - a ) ) / 255 );
                b = Math.round( ( b * a + 255 * ( 255 - a ) ) / 255 );
            }
            out[ o ] = r;
            out[ o + 1 ] = g;
            out[ o + 2 ] = b;
        }
    }
    return out;
}

// Encodes RGB bytes as an 8-bit PNG.
export function encodePng( width, height, data ) {
    const rows = Buffer.alloc( ( width * 3 + 1 ) * height );
    for ( let y = 0; y < height; y++ ) {
        rows[ y * ( width * 3 + 1 ) ] = 0;
        rows.set( data.subarray( y * width * 3, ( y + 1 ) * width * 3 ), y * ( width * 3 + 1 ) + 1 );
    }
    const ihdr = Buffer.alloc( 13 );
    ihdr.writeUInt32BE( width, 0 );
    ihdr.writeUInt32BE( height, 4 );
    ihdr[ 8 ] = 8;
    ihdr[ 9 ] = 2;
    return Buffer.concat( [ Buffer.from( SIGNATURE ), chunk( 'IHDR', ihdr ), chunk( 'IDAT', zlib.deflateSync( rows ) ), chunk( 'IEND', Buffer.alloc( 0 ) ) ] );
}

function chunk( name, body ) {
    const head = Buffer.alloc( 4 );
    head.writeUInt32BE( body.length, 0 );
    const tagged = Buffer.concat( [ Buffer.from( name, 'latin1' ), body ] );
    const crc = Buffer.alloc( 4 );
    crc.writeUInt32BE( crc32( tagged ), 0 );
    return Buffer.concat( [ head, tagged, crc ] );
}

const TABLE = new Uint32Array( 256 );
for ( let n = 0; n < 256; n++ ) {
    let c = n;
    for ( let k = 0; k < 8; k++ ) {
        c = c & 1 ? 0xedb88320 ^ ( c >>> 1 ) : c >>> 1;
    }
    TABLE[ n ] = c >>> 0;
}

function crc32( bytes ) {
    let c = 0xffffffff;
    for ( let i = 0; i < bytes.length; i++ ) {
        c = TABLE[ ( c ^ bytes[ i ] ) & 255 ] ^ ( c >>> 8 );
    }
    return ( c ^ 0xffffffff ) >>> 0;
}
