import { $, $$ } from './dom.js';
import { escape } from './template.js';

// The page rebuilt from its blocks: text at its place in its size and colour, lines, images as placeholders,
// inputs as faint boxes, and the fields on top with their state and value. Drawn as SVG in page pixels, so
// the fields of the walk-through and the blocks of a real job share one picture. Two-finger zoom, dragging,
// double tap and the mouse wheel; wirePreview() adds the hands.

const COLOUR = { ok: 'var(--ok)', unclear: 'var(--warn)', missing: 'var(--bad)' };

// points → page pixels at 300 dpi
const PX = 300 / 72;

// a glyph is about this wide in ems; used to fit a line into its block
const EM = 0.5;

// space between the pages of a form, in page pixels
const GAP = 80;

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
export function wirePreview( container, onTap ) {
    const stage = $( '.pv-stage', container );
    if ( !stage ) {
        return;
    }
    const zoomer = $( '.pv-zoomer', stage );
    const view = { s: 1, tx: 0, ty: 0, moved: false, pinch: null };
    const ptrs = new Map();
    const apply = () => {
        zoomer.style.transform = 'translate(' + view.tx + 'px, ' + view.ty + 'px) scale(' + view.s + ')';
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
        stage.setPointerCapture( e.pointerId );
        ptrs.set( e.pointerId, local( e ) );
        view.moved = false;
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
        ptrs.delete( e.pointerId );
        if ( ptrs.size < 2 ) {
            view.pinch = null;
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
    $$( '[data-field]', stage ).forEach( ( el ) => el.addEventListener( 'click', () => {
        if ( !view.moved ) {
            onTap( el.dataset.field );
        }
    } ) );
}
