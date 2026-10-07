import { readImage, writeImage, scaleImage, fillRect, strokeRect, fillEllipse, hexColour } from './raster.js';

// Control images: the found geometry drawn over the page. Areas green, lines blue (light ones light blue),
// objects red, cells green, tick marks orange. Drawn into the pixels, then scaled down for viewing.

const OUT_WIDTH = 1400;

// Colour and fill opacity per element type; without fill only the border.
const TYPES = {
    text:     [ '#e00000', 0.0 ],
    image:    [ '#8a2be2', 0.2 ],
    input:    [ '#00a000', 0.25 ],
    checkbox: [ '#ff8c00', 0.45 ],
    radio:    [ '#ff8c00', 0.45 ],
    line:     [ '#0030ff', 0.6 ],
    unknown:  [ '#ff00c8', 0.3 ],
};

export async function drawGeometry( file, target, result ) {
    const image = await readImage( file );
    for ( const a of result.areas ) {
        fillRect( image, a.x, a.y, a.w, a.h, hexColour( '#00a000' ), 0.18 );
        strokeRect( image, a.x, a.y, a.w, a.h, hexColour( '#008000' ), 4 );
    }
    for ( const l of result.lines ) {
        const pad = 3;
        fillRect( image, l.x - pad, l.y - pad, l.w + 2 * pad, l.h + 2 * pad, hexColour( l.light ? '#00b0ff' : '#0030ff' ), 0.6 );
    }
    for ( const o of result.objects ) {
        strokeRect( image, o.x, o.y, o.w, o.h, hexColour( '#e00000' ), 4 );
    }
    for ( const c of result.cells ) {
        fillRect( image, c.x, c.y, c.w, c.h, hexColour( '#00a000' ), 0.18 );
    }
    for ( const m of result.marks ) {
        if ( m.kind === 'radio' ) {
            fillEllipse( image, m.x, m.y, m.w, m.h, hexColour( '#ff8c00' ), 0.45 );
        } else {
            fillRect( image, m.x, m.y, m.w, m.h, hexColour( '#ff8c00' ), 0.45 );
        }
    }
    await writeImage( target, scaleImage( image, Math.min( OUT_WIDTH, image.width ) ) );
}

// The element list by type: text red border, image violet, input green, tick mark orange, line blue,
// unknown magenta. Yellow fill: approve, a person has to confirm the text.
export async function drawElements( file, target, elements ) {
    const image = await readImage( file );
    for ( const e of elements ) {
        const [ colour, fill ] = TYPES[ e.type ] || TYPES.unknown;
        if ( fill > 0 ) {
            fillRect( image, e.x, e.y, e.width, e.height, hexColour( colour ), fill );
        }
        if ( e.type !== 'line' ) {
            strokeRect( image, e.x, e.y, e.width, e.height, hexColour( colour ), 4 );
        }
        if ( e.approve ) {
            fillRect( image, e.x, e.y, e.width, e.height, hexColour( '#ffd400' ), 0.4 );
        }
    }
    await writeImage( target, scaleImage( image, Math.min( OUT_WIDTH, image.width ) ) );
}
