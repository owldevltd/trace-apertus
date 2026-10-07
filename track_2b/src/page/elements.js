import { createMask, fillRect, label, hasInk, byPosition } from './mask.js';

// The elements of a page: what the geometry can name on its own (line, tick mark, empty tinted area,
// empty cell, input over a writing line) and every other object as "unknown", to be read, not guessed.

// Line: much longer than thick. Dotted writing lines come out of the smearing as such objects.
const LINE_ASPECT = 8.0;
const LINE_THICK = 0.6;

// Cell: smallest side in character heights of the page, and how well it fills its box.
const CELL_MIN = 0.8;
const CELL_FILL = 0.9;

// Close lines at crossings and corners: this many work pixels longer and thicker.
const CELL_SEAL = 2;

// Input over a writing line: height and free space above in character heights; from this share of the page
// width on a line is a separator; how far the label may stand to the left or above (measured, 95 %).
const LINE_FIELD = 1.5;
const LINE_WIDE = 0.8;
const LABEL_LEFT = 4.4;
const LABEL_ABOVE = 2.7;

// Cells: paper enclosed by lines on all sides. The lines are laid into an empty mask as barriers; what is
// connected afterwards and does not touch the page edge is a cell. `empty` says whether nothing is printed in it.
export function findCells( page, lines ) {
    const s = page.scale;
    const w = page.w;
    const h = page.h;
    const rows = createMask( w, h, 1 );
    for ( const l of lines ) {
        const x0 = Math.max( 0, Math.floor( l.x / s ) - CELL_SEAL );
        const x1 = Math.min( w - 1, Math.floor( ( l.x + l.w ) / s ) + CELL_SEAL );
        const y0 = Math.max( 0, Math.floor( l.y / s ) - CELL_SEAL );
        const y1 = Math.min( h - 1, Math.floor( ( l.y + l.h ) / s ) + CELL_SEAL );
        fillRect( rows, x0, y0, x1, y1, 0 );
    }

    const min = CELL_MIN * page.unit;
    const cells = [];
    for ( const b of label( rows ) ) {
        const bw = b[ 2 ] - b[ 0 ] + 1;
        const bh = b[ 3 ] - b[ 1 ] + 1;
        if ( b[ 0 ] === 0 || b[ 1 ] === 0 || b[ 2 ] === w - 1 || b[ 3 ] === h - 1 ) {
            continue;
        }
        if ( Math.min( bw, bh ) < min || b[ 4 ] < CELL_FILL * bw * bh ) {
            continue;
        }
        let empty = true;
        for ( let y = b[ 1 ]; y <= b[ 3 ]; y++ ) {
            if ( hasInk( page.masks.ink, y, b[ 0 ], bw ) ) {
                empty = false;
                break;
            }
        }
        // the barrier was thicker than the line: pull the box back out to the line
        cells.push( { x: ( b[ 0 ] - CELL_SEAL ) * s, y: ( b[ 1 ] - CELL_SEAL ) * s, w: ( bw + 2 * CELL_SEAL ) * s, h: ( bh + 2 * CELL_SEAL ) * s, empty } );
    }
    return cells.sort( byPosition );
}

// Elements of the page. First the certain types, then every remaining object as "unknown".
// An input is only what is empty: a tinted area without writing in it, a cell without content.
// An area with writing is background (title bar) and no element.
export function typeElements( page, parts ) {
    const { lines, marks, areas, cells, objects } = parts;
    const thin = ( b ) => Math.min( b.w, b.h ) <= LINE_THICK * page.unit * page.scale && Math.max( b.w, b.h ) >= LINE_ASPECT * Math.min( b.w, b.h );
    const elements = [];
    // from: what an input was made of (area, cell, line); the field builder treats them differently
    const add = ( type, b, from ) => elements.push( { type, content: b.content || '', x: b.x, y: b.y, width: b.w, height: b.h, ...( from ? { from } : {} ) } );

    for ( const l of lines ) {
        add( 'line', l );
    }
    for ( const m of marks ) {
        add( m.kind, m );
    }
    for ( const a of areas ) {
        if ( objects.some( ( o ) => o.x < a.x + a.w && o.x + o.w > a.x && o.y < a.y + a.h && o.y + o.h > a.y ) ) {
            continue;
        }
        // a coloured separator bar is a line, not a field
        if ( thin( a ) ) {
            add( 'line', a );
        } else {
            add( 'input', a, 'area' );
        }
    }
    const u = page.unit * page.scale;
    for ( const c of cells ) {
        // the tinted area inside the cell already is the field
        const covered = areas.some( ( a ) => {
            const w = Math.min( a.x + a.w, c.x + c.w ) - Math.max( a.x, c.x );
            const h = Math.min( a.y + a.h, c.y + c.h ) - Math.max( a.y, c.y );
            return w > 0 && h > 0 && w * h * 2 > Math.min( a.w * a.h, c.w * c.h );
        } );
        if ( covered ) {
            continue;
        }
        if ( c.empty ) {
            add( 'input', c, 'cell' );
            continue;
        }
        // A cell whose only content stands along its top is a labelled field: the label is in the cell, the space
        // under it is the input. Of 774 field widgets the geometry missed, 157 were such cells.
        const seal = CELL_SEAL * page.scale;
        const within = objects.filter( ( o ) => o.x >= c.x - seal && o.y >= c.y - seal && o.x + o.w <= c.x + c.w + seal && o.y + o.h <= c.y + c.h + seal );
        const touching = objects.filter( ( o ) => o.x < c.x + c.w && o.x + o.w > c.x && o.y < c.y + c.h && o.y + o.h > c.y );
        if ( !within.length || within.length !== touching.length || marks.some( ( m ) => m.x >= c.x && m.x + m.w <= c.x + c.w && m.y >= c.y && m.y + m.h <= c.y + c.h ) ) {
            continue;
        }
        const top = Math.max( ...within.map( ( o ) => o.y + o.h ) );
        if ( within.some( ( o ) => o.y - c.y > u ) || ( top - c.y ) * 2 > c.h || c.y + c.h - top < CELL_MIN * u ) {
            continue;
        }
        add( 'input', { x: c.x, y: top, w: c.w, h: c.y + c.h - top }, 'cell' );
    }
    for ( const o of objects ) {
        add( thin( o ) ? 'line' : 'unknown', o );
    }
    elements.push( ...inputsOverLines( page, elements ) );
    return elements.sort( byPosition );
}

// Over a horizontal writing line that does not run across the page, with free space above it and a label
// to the left or above, lies an input. Measured 2026-10-06: 1290 instead of 1097 of 1871 field widgets hit,
// invented fields 72 instead of 54.
function inputsOverLines( page, elements ) {
    const u = page.unit * page.scale;
    const wide = LINE_WIDE * page.w * page.scale;
    const over = ( a, b ) => {
        const w = Math.min( a.x + a.width, b.x + b.width ) - Math.max( a.x, b.x );
        const h = Math.min( a.y + a.height, b.y + b.height ) - Math.max( a.y, b.y );
        return w > 0 && h > 0 && w * h * 2 > Math.min( a.width * a.height, b.width * b.height );
    };
    const found = [];
    const uprights = elements.filter( ( e ) => e.type === 'line' && e.width < e.height );
    for ( const l of elements ) {
        if ( l.type !== 'line' || l.width < l.height || l.width < 2 * u || l.width >= wide ) {
            continue;
        }
        // the line may be the bottom border of several cells: one field per stretch between the vertical lines
        const top = l.y - Math.floor( LINE_FIELD * u );
        const cuts = uprights.filter( ( v ) => v.x > l.x + u && v.x + v.width < l.x + l.width - u && v.y < l.y && v.y + v.height > top ).map( ( v ) => v.x ).sort( ( a, b ) => a - b );
        let start = l.x;
        for ( const end of [ ...cuts, l.x + l.width ] ) {
            const field = { x: start, y: top, width: end - start, height: Math.floor( LINE_FIELD * u ) - 2 };
            start = end;
            if ( field.width < 2 * u ) {
                continue;
            }
            let label = false;
            let blocked = false;
            for ( const e of elements ) {
                if ( e === l || ( e.type === 'line' && e.width < e.height ) ) {
                    continue;
                }
                if ( over( e, field ) ) {
                    blocked = true;
                    break;
                }
                if ( e.type !== 'unknown' ) {
                    continue;
                }
                const left = e.x + e.width <= field.x + u && field.x - e.x - e.width <= LABEL_LEFT * u && e.y + e.height >= field.y && e.y <= l.y + u;
                const above = e.y + e.height <= field.y + u && field.y - e.y - e.height <= LABEL_ABOVE * u && e.x < field.x + field.width && e.x + e.width > field.x;
                label = label || left || above;
            }
            if ( !blocked && label ) {
                found.push( { type: 'input', content: '', ...field, from: 'line' } );
            }
        }
    }
    return found;
}
