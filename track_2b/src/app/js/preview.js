import { $, $$ } from './dom.js';
import { escape } from './template.js';

// The page rebuilt from its blocks: text at its place in its size and colour, lines, images as placeholders,
// inputs as faint boxes, and the fields on top with their state and value. Drawn as SVG in page pixels, so
// the fields of the walk-through and the blocks of a real job share one picture. Two-finger zoom, dragging,
// double tap and the mouse wheel; wirePreview() adds the hands. Where a person corrects the fields the same
// picture is the place to do it: a field is moved with the finger or the mouse, and sized at its corner.

const COLOUR = { ok: 'var(--ok)', unclear: 'var(--warn)', missing: 'var(--bad)' };

// points → page pixels at 300 dpi
const PX = 300 / 72;

// a glyph is about this wide in ems; used to fit a line into its block
const EM = 0.5;

// space between the pages of a form, in page pixels
const GAP = 80;

// Where each page begins in the picture: the pages stand one below the other.
export function offsets( sizes ) {
    const out = [];
    let top = 0;
    for ( const s of sizes ) {
        out.push( top );
        top += s.h + GAP;
    }
    return out;
}

// sizes: [ { w, h } ] per page, drawn one below the other; blocks and fields carry their page (1 when absent);
// values: { id: [ value, state ] } or null; off: ids a person unticked.
export function drawPreview( sizes, blocks, fields, values, off = [] ) {
    const offsets = [];
    let top = 0;
    let width = 0;
    for ( const s of sizes ) {
        offsets.push( top );
        top += s.h + GAP;
        width = Math.max( width, s.w );
    }
    const height = top - GAP;
    const shift = ( page ) => offsets[ Math.max( 0, ( page || 1 ) - 1 ) ] || 0;
    let svg = '';
    sizes.forEach( ( s, i ) => {
        svg += '<rect x="0" y="' + offsets[ i ] + '" width="' + s.w + '" height="' + s.h + '" fill="var(--paper)"/>';
    } );
    for ( const b of blocks || [] ) {
        svg += drawBlock( { ...b, y: b.y + shift( b.page ) } );
    }
    for ( const f of fields ) {
        svg += drawField( { ...f, y: f.y + shift( f.page ) }, values ? values[ f.id ] : null, off.includes( f.id ) );
    }
    return '<div class="pv-stage"><div class="pv-zoomer"><svg viewBox="0 0 ' + width + ' ' + height + '" font-family="Geist, system-ui, sans-serif">' + svg + '</svg></div></div>';
}

function drawBlock( b ) {
    if ( b.type === 'line' ) {
        return '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + ( b.color || 'var(--ink)' ) + '"/>';
    }
    if ( b.type === 'image' ) {
        return '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="8" fill="var(--ground)" stroke="var(--line)" stroke-width="3"/>';
    }
    if ( b.type === 'input' ) {
        return '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="var(--ground)" opacity="0.6"/>';
    }
    if ( b.type !== 'text' || !b.content ) {
        return '';
    }
    const lines = b.content.split( '\n' );
    const size = ( b.fontSize || 9 ) * PX;
    // several lines share the block height; one line sits on its baseline near the bottom of the block
    const step = lines.length > 1 ? Math.min( size * 1.25, b.h / lines.length ) : 0;
    const first = lines.length > 1 ? b.y + size * 0.85 : b.y + b.h - size * 0.2;
    let out = b.background ? '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + b.background + '"/>' : '';
    out += '<text x="' + b.x + '" y="' + first + '" font-size="' + size + '" fill="' + ( b.color || 'var(--ink)' ) + '" style="pointer-events:none">';
    lines.forEach( ( line, i ) => {
        const fit = line.length * size * EM > b.w ? ' textLength="' + b.w + '" lengthAdjust="spacingAndGlyphs"' : '';
        out += '<tspan x="' + b.x + '"' + ( i ? ' dy="' + step + '"' : '' ) + fit + '>' + escape( line ) + '</tspan>';
    } );
    return out + '</text>';
}

function drawField( f, v, isOff ) {
    const st = v ? v[ 1 ] : '';
    const val = v ? v[ 0 ] : '';
    const stroke = isOff ? 'var(--muted)' : COLOUR[ st ] || 'var(--accent)';
    const dash = isOff ? ' stroke-dasharray="14 10"' : '';
    const tap = ' data-field="' + escape( f.id ) + '"';
    const mark = f.kind === 'checkbox' || f.kind === 'radio';
    let out = f.kind === 'radio'
        ? '<circle cx="' + ( f.x + f.w / 2 ) + '" cy="' + ( f.y + f.h / 2 ) + '" r="' + ( Math.min( f.w, f.h ) / 2 ) + '" fill="var(--paper)" stroke="' + stroke + '" stroke-width="6"' + dash + tap + '/>'
        : '<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h + '" rx="' + ( mark ? 4 : 6 ) + '" fill="' + ( mark ? 'var(--paper)' : 'var(--accent-soft)' ) + '" fill-opacity="' + ( mark ? 1 : 0.5 ) + '" stroke="' + stroke + '" stroke-width="6"' + dash + tap + '/>';
    if ( isOff || !val ) {
        return out;
    }
    if ( mark ) {
        return out + '<text x="' + ( f.x + f.w / 2 ) + '" y="' + ( f.y + f.h * 0.8 ) + '" font-size="' + ( f.h * 0.85 ) + '" font-weight="700" text-anchor="middle" fill="' + ( COLOUR[ st ] || 'var(--ink)' ) + '" style="pointer-events:none">×</text>';
    }
    const size = Math.min( 40, f.h * 0.55 );
    const max = Math.max( 1, Math.floor( f.w / ( size * EM ) ) );
    return out + '<text x="' + ( f.x + 14 ) + '" y="' + ( f.y + Math.min( f.h / 2 + size * 0.35, size + 10 ) ) + '" font-size="' + size + '" font-weight="600" fill="var(--ink)" style="pointer-events:none">'
        + escape( val.length > max ? val.slice( 0, max - 1 ) + '…' : val ) + '</text>';
}

// Zoom and drag on a drawn preview; onTap( fieldId ) when a field is tapped without dragging.
// edit, where the fields can be corrected: { view, placing(), onPlace( point ), onMove( id, dx, dy ),
// onResize( id, dw, dh ) }. A field is then dragged instead of the page, its corner (an element with
// data-handle) sizes it, and a tap on the page while placing() says where a new field goes. Points and
// distances are in page pixels of the picture. view keeps zoom and position over a redraw.
export function wirePreview( container, onTap, edit = null ) {
    const stage = $( '.pv-stage', container );
    if ( !stage ) {
        return;
    }
    const zoomer = $( '.pv-zoomer', stage );
    const view = Object.assign( ( edit && edit.view ) || {}, { moved: false, pinch: null } );
    view.s = view.s || 1;
    view.tx = view.tx || 0;
    view.ty = view.ty || 0;
    const ptrs = new Map();
    const apply = () => {
        zoomer.style.transform = 'translate(' + view.tx + 'px, ' + view.ty + 'px) scale(' + view.s + ')';
    };
    apply();
    // a point of the screen in page pixels of the picture, whatever the zoom
    const svg = $( 'svg', stage );
    const onPage = ( e ) => {
        const r = svg.getBoundingClientRect();
        const k = svg.viewBox.baseVal.width / r.width;
        return { x: ( e.clientX - r.left ) * k, y: ( e.clientY - r.top ) * k };
    };
    const num = ( el, name ) => Number( el.getAttribute( name ) );
    // the field or corner being dragged: its element, where it started, and how far it went
    let grip = null;
    const shift = ( dx, dy ) => {
        const { el, from, corner, body } = grip;
        if ( corner ) {
            // the corner follows the pointer, the field keeps its upper left
            el.setAttribute( 'x', from.x + dx );
            el.setAttribute( 'y', from.y + dy );
            if ( body.tagName === 'circle' ) {
                body.setAttribute( 'r', Math.max( 6, grip.size.r + Math.min( dx, dy ) / 2 ) );
            } else {
                body.setAttribute( 'width', Math.max( 12, grip.size.w + dx ) );
                body.setAttribute( 'height', Math.max( 12, grip.size.h + dy ) );
            }
        } else if ( el.tagName === 'circle' ) {
            el.setAttribute( 'cx', from.x + dx );
            el.setAttribute( 'cy', from.y + dy );
        } else {
            el.setAttribute( 'x', from.x + dx );
            el.setAttribute( 'y', from.y + dy );
        }
    };
    const clamp = () => {
        const w = stage.clientWidth;
        const h = zoomer.offsetHeight;
        view.s = Math.min( 4, Math.max( 1, view.s ) );
        view.tx = Math.min( 0, Math.max( w - w * view.s, view.tx ) );
        view.ty = Math.min( 0, Math.max( h - h * view.s, view.ty ) );
        if ( view.s === 1 ) {
            view.tx = 0;
            view.ty = 0;
        }
    };
    const local = ( e ) => {
        const r = stage.getBoundingClientRect();
        const k = stage.clientWidth / r.width;
        return { x: ( e.clientX - r.left ) * k, y: ( e.clientY - r.top ) * k };
    };
    const zoomAt = ( p, ns ) => {
        ns = Math.min( 4, Math.max( 1, ns ) );
        view.tx = p.x - ( p.x - view.tx ) * ( ns / view.s );
        view.ty = p.y - ( p.y - view.ty ) * ( ns / view.s );
        view.s = ns;
        clamp();
        apply();
    };
    stage.addEventListener( 'pointerdown', ( e ) => {
        const el = edit && ptrs.size === 0 && e.target.closest ? e.target.closest( '[data-handle], [data-field]' ) : null;
        stage.setPointerCapture( e.pointerId );
        ptrs.set( e.pointerId, local( e ) );
        view.moved = false;
        grip = null;
        if ( el ) {
            const corner = el.hasAttribute( 'data-handle' );
            const body = corner ? $$( '[data-field]', stage ).find( ( x ) => x.dataset.field === el.dataset.handle ) : el;
            grip = { el, corner, body, id: body.dataset.field, start: onPage( e ), dx: 0, dy: 0,
                from: el.tagName === 'circle' ? { x: num( el, 'cx' ), y: num( el, 'cy' ) } : { x: num( el, 'x' ), y: num( el, 'y' ) },
                size: body.tagName === 'circle' ? { r: num( body, 'r' ) } : { w: num( body, 'width' ), h: num( body, 'height' ) } };
        }
        if ( ptrs.size === 2 ) {
            const [ a, b ] = [ ...ptrs.values() ];
            view.pinch = { d: Math.hypot( a.x - b.x, a.y - b.y ), s: view.s, c: { x: ( a.x + b.x ) / 2, y: ( a.y + b.y ) / 2 }, tx: view.tx, ty: view.ty };
        }
    } );
    stage.addEventListener( 'pointermove', ( e ) => {
        if ( !ptrs.has( e.pointerId ) ) {
            return;
        }
        const prev = ptrs.get( e.pointerId );
        const cur = local( e );
        ptrs.set( e.pointerId, cur );
        if ( grip && ptrs.size === 1 ) {
            const p = onPage( e );
            grip.dx = p.x - grip.start.x;
            grip.dy = p.y - grip.start.y;
            // a finger that rests is a tap: the field moves once it went a few screen pixels
            if ( view.moved || Math.abs( cur.x - prev.x ) + Math.abs( cur.y - prev.y ) > 2 ) {
                view.moved = true;
                shift( grip.dx, grip.dy );
            }
            return;
        }
        if ( ptrs.size === 2 && view.pinch ) {
            const [ a, b ] = [ ...ptrs.values() ];
            const d = Math.hypot( a.x - b.x, a.y - b.y );
            const c = { x: ( a.x + b.x ) / 2, y: ( a.y + b.y ) / 2 };
            const ns = Math.min( 4, Math.max( 1, view.pinch.s * d / view.pinch.d ) );
            view.tx = c.x - ( view.pinch.c.x - view.pinch.tx ) * ( ns / view.pinch.s );
            view.ty = c.y - ( view.pinch.c.y - view.pinch.ty ) * ( ns / view.pinch.s );
            view.s = ns;
            clamp();
            apply();
            view.moved = true;
        } else if ( ptrs.size === 1 && view.s > 1 ) {
            view.tx += cur.x - prev.x;
            view.ty += cur.y - prev.y;
            clamp();
            apply();
            if ( Math.abs( cur.x - prev.x ) + Math.abs( cur.y - prev.y ) > 2 ) {
                view.moved = true;
            }
        }
    } );
    const up = ( e ) => {
        const held = ptrs.has( e.pointerId );
        ptrs.delete( e.pointerId );
        if ( ptrs.size < 2 ) {
            view.pinch = null;
        }
        if ( !edit || !held || e.type !== 'pointerup' ) {
            grip = null;
            return;
        }
        const g = grip;
        grip = null;
        if ( g && view.moved ) {
            ( g.corner ? edit.onResize : edit.onMove )( g.id, g.dx, g.dy );
        } else if ( g ) {
            onTap( g.id );
        } else if ( !view.moved && ptrs.size === 0 && edit.placing() ) {
            edit.onPlace( onPage( e ) );
        }
    };
    stage.addEventListener( 'pointerup', up );
    stage.addEventListener( 'pointercancel', up );
    stage.addEventListener( 'dblclick', ( e ) => {
        e.preventDefault();
        zoomAt( local( e ), view.s > 1 ? 1 : 2.5 );
    } );
    stage.addEventListener( 'wheel', ( e ) => {
        e.preventDefault();
        zoomAt( local( e ), view.s * ( e.deltaY < 0 ? 1.15 : 1 / 1.15 ) );
    }, { passive: false } );
    // where fields are corrected the tap is told from the drag above, on the pointer itself
    if ( !edit ) {
        $$( '[data-field]', stage ).forEach( ( el ) => el.addEventListener( 'click', () => {
            if ( !view.moved ) {
                onTap( el.dataset.field );
            }
        } ) );
    }
}
