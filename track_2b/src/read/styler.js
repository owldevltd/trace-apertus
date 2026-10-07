// Font size and colours per element, measured on the image. The size comes from the x-height band of the text
// lines inside the element, the colours from the pixels in its box. Nothing is rendered.

// Heights in em (Arial/Helvetica): x-height 0.519, cap and ascender height 0.716, ascender to descender 0.93.
// Between typefaces the x-height varies most (Times 0.45), ascender to descender least.
const X_HEIGHT = 0.52;
const CAP_HEIGHT = 0.72;
const FULL_HEIGHT = 0.93;

// A pixel row belongs to the x-height band when it carries at least this share of the fullest row's ink.
const BAND = 0.5;

// When the band fills the line this far, only capitals or digits stand there.
const ALL_CAPS = 0.85;

// From this share of the x-height above or below the band the line has ascenders or descenders.
const ASCENT = 0.25;
const DESCENT = 0.15;

// More ink than this in the box: light text on dark ground, the paper is what gets measured.
const INVERSE = 0.55;

// Page width in points, portrait and landscape: A4 unless told otherwise. Pixels → points hangs on it.
const PAGE_PT = [ 595.28, 841.89 ];

// Colours: samples per element, and from which grey distance to the ground a pixel is foreground.
const SAMPLES = 4000;
const CONTRAST = 48;

// Writes fontSize (points), color and background (#rrggbb) to every element. gray: one byte per pixel of the
// full page; image: the RGB page; page: the analyze result (strips, marks, ink level, width, height).
export function styleElements( page, image, gray, elements ) {
    const pt = PAGE_PT[ page.width > page.height ? 1 : 0 ] / page.width;
    const marks = elements.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' ).map( ( e ) => ( { x: e.x, y: e.y, w: e.width, h: e.height } ) );
    return elements.map( ( e ) => {
        const sizes = [];
        if ( e.type === 'text' && e.content ) {
            for ( const t of stripsOf( e, page.strips ) ) {
                const [ x0, x1 ] = span( t, marks );
                if ( x1 - x0 < 4 ) {
                    continue;
                }
                const px = profile( rows( gray, page.ink, page.width, t, x0, x1 ) );
                if ( px > 0 ) {
                    sizes.push( px * pt );
                }
            }
        }
        const [ fore, ground ] = colours( image, e );
        // a line and an input are the colour of their box and have no ground; everything else: color is what
        // stands out from the ground (white text on a blue bar: white on blue)
        const own = e.type === 'line' || e.type === 'input';
        return { ...e, color: own ? ground : fore, background: own ? null : ground, fontSize: sizes.length ? Math.round( median( sizes ) * 10 ) / 10 : null };
    } );
}

// The text lines of an element: those whose centre lies in its box. Lines that lie wholly inside another one do
// not count: with light text on a bar the bar is the line, and what appears as a line inside it are the counters
// of the letters.
function stripsOf( e, strips ) {
    const inside = strips.filter( ( t ) => {
        const cx = t.x + t.w / 2;
        const cy = t.y + t.h / 2;
        return cx >= e.x && cx <= e.x + e.width && cy >= e.y && cy <= e.y + e.height;
    } );
    return inside.filter( ( t ) => !inside.some( ( o ) => o !== t && o.x <= t.x && o.y <= t.y && o.x + o.w >= t.x + t.w && o.y + o.h >= t.y + t.h ) );
}

// The part of a text line that carries writing: a tick mark at its start or end does not belong to it.
function span( t, marks ) {
    let x0 = t.x;
    let x1 = t.x + t.w;
    for ( const m of marks ) {
        if ( m.y + m.h / 2 < t.y || m.y + m.h / 2 > t.y + t.h || m.x + m.w < x0 || m.x > x1 ) {
            continue;
        }
        if ( m.x + m.w / 2 < ( x0 + x1 ) / 2 ) {
            x0 = m.x + m.w + 2;
        } else {
            x1 = m.x - 2;
        }
    }
    return [ x0, x1 ];
}

// The pixel rows of a text line, 1 where there is writing. If more than half is dark, the writing is light on a bar.
function rows( gray, level, width, t, x0, x1 ) {
    const w = x1 - x0;
    const out = [];
    let dark = 0;
    for ( let y = t.y; y < t.y + t.h; y++ ) {
        const row = new Uint8Array( w );
        for ( let x = 0; x < w; x++ ) {
            if ( gray[ y * width + x0 + x ] < level ) {
                row[ x ] = 1;
                dark++;
            }
        }
        out.push( row );
    }
    if ( dark > INVERSE * w * t.h ) {
        for ( const row of out ) {
            for ( let x = 0; x < w; x++ ) {
                row[ x ] ^= 1;
            }
        }
    }
    return out;
}

// Font size in pixels from the profile of the pixel rows. The x-height is the band of rows with much ink.
// Measured at the largest measure the line offers: ascender to descender, else ascender to baseline, else the x-height alone.
function profile( lines ) {
    const n = lines.map( ( row ) => row.reduce( ( a, b ) => a + b, 0 ) );
    const max = n.length ? Math.max( ...n ) : 0;
    if ( !max ) {
        return 0;
    }
    const full = [];
    const any = [];
    n.forEach( ( v, i ) => {
        if ( v >= BAND * max ) {
            full.push( i );
        }
        if ( v ) {
            any.push( i );
        }
    } );
    const band = full[ full.length - 1 ] - full[ 0 ] + 1;
    const all = any[ any.length - 1 ] - any[ 0 ] + 1;
    const up = full[ 0 ] - any[ 0 ];
    const down = any[ any.length - 1 ] - full[ full.length - 1 ];
    if ( band > ALL_CAPS * all ) {
        return all / CAP_HEIGHT;
    }
    if ( up >= ASCENT * band && down >= DESCENT * band ) {
        return all / FULL_HEIGHT;
    }
    if ( up >= ASCENT * band ) {
        return ( band + up ) / CAP_HEIGHT;
    }
    return band / X_HEIGHT;
}

// Ground = the most frequent colour in the box. Foreground = what stands out from it in grey value, averaged over
// the tenth with the largest distance (the middle of the strokes, without the mixed tones at the edge).
function colours( image, e ) {
    const w = Math.max( 1, e.width );
    const h = Math.max( 1, e.height );
    const step = Math.max( 1, Math.floor( Math.sqrt( w * h / SAMPLES ) ) );
    const bins = new Map();
    const px = [];
    for ( let y = e.y; y < e.y + h; y += step ) {
        for ( let x = e.x; x < e.x + w; x += step ) {
            if ( y >= image.height || x >= image.width ) {
                continue;
            }
            const o = ( y * image.width + x ) * 3;
            const r = image.data[ o ];
            const g = image.data[ o + 1 ];
            const b = image.data[ o + 2 ];
            const k = ( r >> 3 ) << 10 | ( g >> 3 ) << 5 | b >> 3;
            bins.set( k, ( bins.get( k ) || 0 ) + 1 );
            px.push( [ r, g, b, k ] );
        }
    }
    if ( !px.length ) {
        return [ null, null ];
    }
    let mode = -1;
    let best = 0;
    for ( const [ k, n ] of bins ) {
        if ( n > best ) {
            best = n;
            mode = k;
        }
    }
    const back = mean( px.filter( ( p ) => p[ 3 ] === mode ) );
    const grey = ( back[ 0 ] + back[ 1 ] + back[ 2 ] ) / 3;
    const fore = px.map( ( p ) => [ p[ 0 ], p[ 1 ], p[ 2 ], Math.abs( ( p[ 0 ] + p[ 1 ] + p[ 2 ] ) / 3 - grey ) ] ).filter( ( p ) => p[ 3 ] >= CONTRAST );
    fore.sort( ( a, b ) => b[ 3 ] - a[ 3 ] );
    const top = fore.slice( 0, Math.max( 1, Math.floor( fore.length / 10 ) ) );
    return [ fore.length ? hex( mean( top ) ) : null, hex( back ) ];
}

function median( values ) {
    const v = [ ...values ].sort( ( a, b ) => a - b );
    return v[ Math.floor( v.length / 2 ) ];
}

function mean( px ) {
    const n = Math.max( 1, px.length );
    return [ 0, 1, 2 ].map( ( i ) => Math.round( px.reduce( ( a, p ) => a + p[ i ], 0 ) / n ) );
}

function hex( c ) {
    return '#' + c.map( ( v ) => v.toString( 16 ).padStart( 2, '0' ) ).join( '' );
}
