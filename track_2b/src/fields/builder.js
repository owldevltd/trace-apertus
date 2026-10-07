import { byPosition } from '../page/mask.js';

// Fields from the elements of a page: what a person fills in, with the printed label next to it. The geometry
// names the boxes (input, checkbox, radio); the label is the text in the box, else the nearest text to the left
// in the same row, else the nearest above in the same column. That is the reference assignment, measured on
// 1 810 field widgets: label left 12.5 %, above 13.8 %, in the field 1.7 %, none within reach 72 % (table cells,
// their head stands far away). A field without a label stays a field.

// How far a label may stand from its box, in character heights (measured, 95 %).
const LABEL_LEFT = 4.4;
const LABEL_ABOVE = 2.7;

// A text whose centre lies within this many character heights of the box's vertical span is in the same row.
const ROW = 1.0;

// The label of a tick mark stands beside it, right first, else left, within LABEL_LEFT. No reference names the
// label of a box; on the shipped forms it stands to the right.

// A box taller than this, in character heights, takes several lines (95 % of single-line widgets are below 3.3).
const MULTILINE = 4.0;

// Radios that exclude each other stand in one row up to this far apart, or in one column with gaps up to
// COLUMN_GAP, in character heights. Measured on 201 radio widgets (pairs in one row: same group 90 % within 5.2,
// other groups from 23 on; pairs in one column: same group half within 0.6, other groups from 0.2 on).
const ROW_GAP = 12.0;
const COLUMN_GAP = 1.0;

// Writing lines this close under a field's line, with the same extent, belong to the same field.
const LINE_CHAIN = 2.5;

// Words in a label that make the field a date or a signature; everything else is text. A date label is short
// ("Geburtsdatum", "Datum der Anstellung"); a long label that merely mentions a date is a text field. Numbers are
// not guessed from words (a phone number has spaces, an AHV number dots).
const DATE = /datum|\bdate\b|\bdata\b/i;
const DATE_WORDS = 4;
const SIGNATURE = /unterschrift|signatur|signature/i;

// Overlap by more than half of the smaller area: the same box.
export function same( a, b ) {
    const w = Math.min( a.x + a.width, b.x + b.width ) - Math.max( a.x, b.x );
    const h = Math.min( a.y + a.height, b.y + b.height ) - Math.max( a.y, b.y );
    return w > 0 && h > 0 && w * h * 2 > Math.min( a.width * a.height, b.width * b.height );
}

// pages: [ { page, unit, elements, widgets? } ]. widgets are the form fields of a fillable PDF, when known:
// { typ, name, x, y, width, height }. Returns { blocks, fields } as the contract has them.
export function buildFields( pages ) {
    const blocks = [];
    const fields = [];
    for ( const page of pages ) {
        const u = page.unit;
        const ordered = [ ...page.elements ].sort( byPosition );
        const ids = new Map();
        const byId = new Map();
        for ( const e of ordered ) {
            const id = 'b' + ( blocks.length + 1 );
            ids.set( e, id );
            byId.set( id, e );
            blocks.push( block( id, page.page, e ) );
        }
        const marks = ordered.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' );
        const texts = ordered.filter( ( e ) => e.type === 'text' && e.content );
        // a text with a tick mark in it labels the mark, not an input
        const plain = texts.filter( ( t ) => !marks.some( ( m ) => inside( m, t ) ) );
        const radios = [];
        for ( const e of ordered ) {
            if ( e.type !== 'input' && e.type !== 'checkbox' && e.type !== 'radio' ) {
                continue;
            }
            const mark = e.type !== 'input';
            const label = mark ? markLabel( e, texts, u ) : inputLabel( e, plain, u );
            const field = {
                id: '',
                label: label ? words( label.content ) : '',
                kind: mark ? e.type : kind( e, label, u ),
                page: page.page,
                x: e.x,
                y: e.y,
                width: e.width,
                height: e.height,
            };
            if ( label ) {
                field.labelBlock = ids.get( label );
            }
            field.boxBlock = ids.get( e );
            if ( mark ) {
                field.option = field.label;
            }
            const w = ( page.widgets || [] ).find( ( k ) => ( mark === ( k.typ === 'checkbox' || k.typ === 'radio' ) ) && same( e, k ) );
            if ( w ) {
                field.widget = w.name;
                if ( w.typ === 'unterschrift' ) {
                    field.kind = 'signature';
                }
            }
            if ( e.type === 'radio' ) {
                radios.push( field );
            }
            fields.push( field );
        }
        // a fillable original knows its fields even where the print shows nothing (no frame, no tint): every
        // widget no built field covers becomes a field of its own
        for ( const w of page.widgets || [] ) {
            const mark = w.typ === 'checkbox' || w.typ === 'radio';
            if ( fields.some( ( f ) => f.page === page.page && same( f, w ) ) ) {
                continue;
            }
            const box = { x: w.x, y: w.y, width: w.width, height: w.height };
            const label = mark ? markLabel( box, texts, u ) : inputLabel( box, plain, u );
            const field = {
                id: '',
                label: label ? words( label.content ) : '',
                kind: mark ? w.typ : ( w.typ === 'unterschrift' ? 'signature' : kind( box, label, u ) ),
                page: page.page,
                ...box,
                widget: w.name,
            };
            if ( label ) {
                field.labelBlock = ids.get( label );
            }
            if ( mark ) {
                field.option = field.label;
            }
            if ( w.typ === 'radio' ) {
                radios.push( field );
            }
            fields.push( field );
        }
        groupRadios( radios, u ).forEach( ( group, i ) => {
            for ( const f of group ) {
                f.group = 'p' + page.page + 'g' + ( i + 1 );
            }
        } );
        const absorbed = chainLines( fields.filter( ( f ) => f.page === page.page ), ordered, byId, u );
        for ( const f of absorbed ) {
            fields.splice( fields.indexOf( f ), 1 );
        }
    }
    fields.forEach( ( f, i ) => {
        f.id = 'f' + ( i + 1 );
    } );
    return { blocks, fields };
}

// A field over a writing line continues over the writing lines below it when they have the same extent and
// follow closely: one multiline field instead of one per line. A line below with a field of its own joins when
// that field has no label of its own or the same one; writing between the lines ends the chain.
// Returns the fields that were absorbed.
function chainLines( fields, elements, byId, u ) {
    const lines = elements.filter( ( e ) => e.type === 'line' && e.width >= e.height ).sort( ( a, b ) => a.y - b.y );
    const absorbed = new Set();
    for ( const f of fields ) {
        if ( absorbed.has( f ) || byId.get( f.boxBlock )?.from !== 'line' ) {
            continue;
        }
        let own = lines.find( ( l ) => Math.abs( l.y - f.y - f.height ) <= 3 && Math.abs( l.x - f.x ) <= u && Math.abs( l.width - f.width ) <= u );
        if ( !own ) {
            continue;
        }
        let n = 1;
        for ( const l of lines ) {
            if ( l.y <= own.y || l.y - own.y > LINE_CHAIN * u || Math.abs( l.x - f.x ) > u || Math.abs( l.width - f.width ) > u ) {
                continue;
            }
            const between = elements.some( ( e ) => e.type !== 'line' && e.type !== 'input' && e.y >= own.y && e.y + e.height <= l.y + 3 && e.x < f.x + f.width && e.x + e.width > f.x );
            if ( between ) {
                break;
            }
            const other = fields.find( ( g ) => g !== f && !absorbed.has( g ) && Math.abs( g.y + g.height - l.y ) <= 3 && g.x < f.x + f.width && g.x + g.width > f.x );
            if ( other ) {
                if ( other.labelBlock && other.labelBlock !== f.labelBlock ) {
                    break;
                }
                absorbed.add( other );
            }
            own = l;
            n++;
        }
        if ( n > 1 ) {
            f.height = own.y - f.y;
            f.kind = f.kind === 'text' ? 'multiline' : f.kind;
        }
    }
    return absorbed;
}

// Radios that exclude each other stand in one row; a radio with no partner in its row stands in a column with
// the next ones below or above it. Measured against the widget names of 201 radios (pairs: same name grouped /
// other name grouped / same name not grouped): row only 30 / 15 / 120, row and column 150 / 169 / 0,
// row else column see tests/fields.js. mode: 'row', 'both' or 'row-else-column' (the rule).
export function groupRadios( radios, u, mode = 'row-else-column', gaps = { row: ROW_GAP, column: COLUMN_GAP } ) {
    const parent = radios.map( ( _, i ) => i );
    const root = ( i ) => ( parent[ i ] === i ? i : ( parent[ i ] = root( parent[ i ] ) ) );
    const inRow = ( a, b ) => Math.abs( ( a.y + a.height / 2 ) - ( b.y + b.height / 2 ) ) <= ROW * u
        && Math.max( a.x, b.x ) - Math.min( a.x + a.width, b.x + b.width ) <= gaps.row * u;
    const inColumn = ( a, b ) => Math.abs( ( a.x + a.width / 2 ) - ( b.x + b.width / 2 ) ) <= ROW * u
        && Math.max( a.y, b.y ) - Math.min( a.y + a.height, b.y + b.height ) <= gaps.column * u;
    const paired = radios.map( () => false );
    for ( let i = 0; i < radios.length; i++ ) {
        for ( let j = i + 1; j < radios.length; j++ ) {
            if ( inRow( radios[ i ], radios[ j ] ) ) {
                parent[ root( i ) ] = root( j );
                paired[ i ] = paired[ j ] = true;
            }
        }
    }
    if ( mode !== 'row' ) {
        for ( let i = 0; i < radios.length; i++ ) {
            for ( let j = i + 1; j < radios.length; j++ ) {
                const alone = mode === 'both' || ( !paired[ i ] && !paired[ j ] );
                if ( alone && inColumn( radios[ i ], radios[ j ] ) ) {
                    parent[ root( i ) ] = root( j );
                }
            }
        }
    }
    const groups = new Map();
    radios.forEach( ( f, i ) => {
        const r = root( i );
        if ( !groups.has( r ) ) {
            groups.set( r, [] );
        }
        groups.get( r ).push( f );
    } );
    return [ ...groups.values() ];
}

// The label of an input: the text in the box, else the nearest to the left in the row or above in the column.
function inputLabel( e, texts, u ) {
    let best = null;
    let gap = Infinity;
    let cover = 0;
    let within = false;
    for ( const t of texts ) {
        const ox = Math.min( t.x + t.width, e.x + e.width ) - Math.max( t.x, e.x );
        const oy = Math.min( t.y + t.height, e.y + e.height ) - Math.max( t.y, e.y );
        if ( ox > 0 && oy > 0 ) {
            // in the box beats everything else; the largest overlap wins
            if ( !within || ox * oy > -gap ) {
                best = t;
                gap = -ox * oy;
                within = true;
            }
            continue;
        }
        if ( within ) {
            continue;
        }
        const cy = t.y + t.height / 2;
        if ( cy >= e.y - ROW * u && cy <= e.y + e.height + ROW * u && t.x < e.x ) {
            const d = Math.max( 0, e.x - t.x - t.width );
            if ( d <= LABEL_LEFT * u && d < gap ) {
                best = t;
                gap = d;
            }
        }
        if ( ox > 0 && t.y < e.y ) {
            const d = Math.max( 0, e.y - t.y - t.height );
            // at the same height the text that covers more of the box wins (the field's own label over a section title)
            if ( d <= LABEL_ABOVE * u && ( d < gap - ROW * u / 4 || ( Math.abs( d - gap ) <= ROW * u / 4 && ox > cover ) ) ) {
                best = t;
                gap = d;
                cover = ox;
            }
        }
    }
    return best;
}

// The label of a tick mark: the text it sits in, else the nearest to the right in the row, else to the left.
function markLabel( e, texts, u ) {
    const cy = e.y + e.height / 2;
    const row = texts.filter( ( t ) => t.y <= cy + ROW * u && t.y + t.height >= cy - ROW * u );
    const host = row.find( ( t ) => inside( e, t ) );
    if ( host ) {
        return host;
    }
    let best = null;
    let gap = Infinity;
    for ( const t of row ) {
        if ( t.x >= e.x + e.width ) {
            const d = t.x - e.x - e.width;
            if ( d <= LABEL_LEFT * u && d < gap ) {
                best = t;
                gap = d;
            }
        }
    }
    if ( best ) {
        return best;
    }
    for ( const t of row ) {
        if ( t.x + t.width <= e.x ) {
            const d = e.x - t.x - t.width;
            if ( d <= LABEL_LEFT * u && d < gap ) {
                best = t;
                gap = d;
            }
        }
    }
    return best;
}

function kind( e, label, u ) {
    const text = label ? label.content : '';
    if ( SIGNATURE.test( text ) ) {
        return 'signature';
    }
    if ( DATE.test( text ) && text.trim().split( /\s+/ ).length <= DATE_WORDS ) {
        return 'date';
    }
    return e.height > MULTILINE * u ? 'multiline' : 'text';
}

// The centre of a lies in b.
function inside( a, b ) {
    const cx = a.x + a.width / 2;
    const cy = a.y + a.height / 2;
    return cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height;
}

function words( text ) {
    return text.replace( /\s+/g, ' ' ).trim();
}

// A block is the element as the contract lists it, with its id and page.
function block( id, page, e ) {
    const out = { id, page, type: e.type, content: e.content || '', x: e.x, y: e.y, width: e.width, height: e.height };
    for ( const key of [ 'fontSize', 'color', 'background', 'isOCR', 'approve' ] ) {
        if ( e[ key ] !== undefined ) {
            out[ key ] = e[ key ];
        }
    }
    return out;
}
