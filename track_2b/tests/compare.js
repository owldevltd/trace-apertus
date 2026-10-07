// Holds the object layer against the reference from the PDF. Counting rule: a word belongs to the object
// whose box contains the centre of its ink (the smallest one when several do). Lines and blocks follow
// from their words.

// An image from this share of the page on is the page itself (scan), not an object on it.
const PAGE_IMAGE = 0.5;

export function compare( ref, got ) {
    const pad = got.scale;
    const words = [];
    const perObj = {};
    for ( const word of ref.words ) {
        if ( !word.ink ) {
            continue;
        }
        const w = { ...word };
        const cx = w.ink.x + Math.floor( w.ink.w / 2 );
        const cy = w.ink.y + Math.floor( w.ink.h / 2 );
        w.obj = inside( got.objects, cx, cy, 0 );
        w.state = 'object';
        if ( w.obj < 0 ) {
            w.state = inside( got.lines, cx, cy, pad ) >= 0 ? 'line' : 'missed';
        } else {
            ( perObj[ w.obj ] ??= {} )[ w.block ] = true;
        }
        words.push( w );
    }

    const lines = group( words, 'line' );
    const blocks = group( words, 'block' );
    for ( const b of Object.values( blocks ) ) {
        if ( b.state === 'whole' ) {
            b.state = Object.keys( perObj[ b.objs[ 0 ] ] ).length > 1 ? 'merged' : 'single';
        } else if ( b.state === 'cut' ) {
            const cut = b.lines.filter( ( l ) => lines[ l ].state === 'cut' );
            b.state = cut.length ? 'cut inside a line' : 'cut between lines';
        }
    }

    // raster images count only where the page is not an image itself
    const page = ref.width * ref.height;
    const images = [];
    for ( const image of ref.images ) {
        if ( !image.ink || ref.kind.startsWith( 'scan' ) || image.w * image.h > PAGE_IMAGE * page ) {
            continue;
        }
        const im = { ...image, objs: [] };
        got.objects.forEach( ( o, i ) => {
            if ( overlap( o, im.ink ) * 2 > Math.min( o.w * o.h, im.ink.w * im.ink.h ) ) {
                im.objs.push( i );
            }
        } );
        im.state = im.objs.length === 0 ? 'missed' : ( im.objs.length === 1 ? 'one object' : 'several objects' );
        images.push( im );
    }

    const objects = [];
    let max = 0;
    got.objects.forEach( ( object, i ) => {
        const o = { ...object };
        max = Math.max( max, o.w * o.h );
        const n = Object.keys( perObj[ i ] || {} ).length;
        o.state = n > 1 ? 'several blocks' : ( n === 1 ? 'one block' : 'no reference' );
        for ( const im of images ) {
            if ( n === 0 && im.objs.includes( i ) ) {
                o.state = 'image';
            }
        }
        objects.push( o );
    } );

    return {
        count: {
            words:   tally( words, [ 'object', 'line', 'missed' ] ),
            lines:   tally( Object.values( lines ), [ 'whole', 'cut', 'line', 'missed' ] ),
            blocks:  tally( Object.values( blocks ), [ 'single', 'merged', 'cut between lines', 'cut inside a line', 'line', 'missed' ] ),
            images:  tally( images, [ 'one object', 'several objects', 'missed' ] ),
            objects: tally( objects, [ 'one block', 'several blocks', 'image', 'no reference' ] ),
        },
        // share of the largest object in the page: a page-sized object catches every word
        share: max / page,
        words,
        lines,
        blocks,
        images,
        objects,
    };
}

// Words gathered into the lines or blocks of the reference. whole = all words in the same object,
// cut = spread over several, line = only found as a line, missed = at least one word in no object.
function group( words, key ) {
    const sets = {};
    for ( const w of words ) {
        ( sets[ w[ key ] ] ??= [] ).push( w );
    }
    const out = {};
    for ( const [ id, set ] of Object.entries( sets ) ) {
        const x0 = Math.min( ...set.map( ( w ) => w.ink.x ) );
        const y0 = Math.min( ...set.map( ( w ) => w.ink.y ) );
        const x1 = Math.max( ...set.map( ( w ) => w.ink.x + w.ink.w ) );
        const y1 = Math.max( ...set.map( ( w ) => w.ink.y + w.ink.h ) );
        const objs = [];
        const miss = [];
        let text = '';
        let last = null;
        for ( const w of set ) {
            if ( w.state === 'missed' ) {
                miss.push( w.t );
            }
            if ( w.obj >= 0 && !objs.includes( w.obj ) ) {
                objs.push( w.obj );
            }
            // make the cuts visible in the text
            text += ( text === '' ? '' : ( last !== null && w.obj !== last ? ' ¦ ' : ' ' ) ) + w.t;
            last = w.obj;
        }
        out[ id ] = {
            x: x0, y: y0, w: x1 - x0, h: y1 - y0,
            t: text,
            lines: [ ...new Set( set.map( ( w ) => w.line ) ) ],
            objs,
            miss,
            state: miss.length ? 'missed' : ( objs.length > 1 ? 'cut' : ( objs.length ? 'whole' : 'line' ) ),
        };
    }
    return out;
}

// Index of the smallest box containing the point, else -1.
function inside( boxes, x, y, pad ) {
    let hit = -1;
    let size = Infinity;
    boxes.forEach( ( b, i ) => {
        if ( x < b.x - pad || x > b.x + b.w + pad || y < b.y - pad || y > b.y + b.h + pad ) {
            return;
        }
        if ( b.w * b.h < size ) {
            size = b.w * b.h;
            hit = i;
        }
    } );
    return hit;
}

function overlap( a, b ) {
    const w = Math.min( a.x + a.w, b.x + b.w ) - Math.max( a.x, b.x );
    const h = Math.min( a.y + a.h, b.y + b.h ) - Math.max( a.y, b.y );
    return w > 0 && h > 0 ? w * h : 0;
}

function tally( list, states ) {
    const n = { all: list.length };
    for ( const s of states ) {
        n[ s ] = 0;
    }
    for ( const e of list ) {
        n[ e.state ]++;
    }
    return n;
}
