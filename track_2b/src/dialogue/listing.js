import { byPosition } from '../page/mask.js';

// The form as a list of lines in the order of the paper, the text the model reads to write and to check the
// questions. Every text block is one line; none is left out and none is classified, since code cannot tell a
// question from a paragraph. Behind the text the field builder found as the label of a place stands the id of
// that place's unit in square brackets; a place without a label of its own stands alone at its position.
// Measured 9 October 2026: with the page as a picture of text the model had to read the layout, and the same
// question pointed at the same place in only 23 of 45 cases over two runs; with this list the check holds.

const NOTE = { choice: ': Auswahl', mark: ': Kästchen' };

// The entries of a page in the order of the paper: its text blocks, and the fields no text block labels.
export function entries( job, page ) {
    const texts = job.blocks.filter( ( b ) => b.page === page && b.type === 'text' && b.content );
    const labels = new Set( texts.map( ( b ) => b.id ) );
    const out = texts.map( ( b ) => ( { x: b.x, y: b.y, block: b } ) );
    for ( const f of job.fields ) {
        if ( f.page === page && f.kind !== 'signature' && !labels.has( f.labelBlock ) ) {
            out.push( { x: f.x, y: f.y, field: f } );
        }
    }
    return out.sort( byPosition );
}

// Where a field stands in that order: at its label, else at itself.
export function rank( list, field ) {
    return list.findIndex( ( e ) => ( e.block ? e.block.id === field.labelBlock : e.field === field ) );
}

// How a unit is named in the list: its id, and what kind of place it is where that is not a single field.
export function marker( unit, fields ) {
    const mark = unit.kind === 'single' && [ 'checkbox', 'radio' ].includes( fields.find( ( f ) => f.id === unit.fields[ 0 ] )?.kind );
    const note = unit.kind === 'table' ? ': Tabelle mit ' + unit.rows + ' Zeilen und ' + unit.columns + ' Spalten' : NOTE[ mark ? 'mark' : unit.kind ] || '';
    return '[' + unit.id + note + ']';
}

// The list of one page. A unit that is not asked carries no id; its text stays.
export function listing( job, units, page ) {
    const marks = new Map();
    for ( const u of units ) {
        if ( !u.skip ) {
            for ( const id of u.fields ) {
                marks.set( id, marker( u, job.fields ) );
            }
        }
    }
    const here = job.fields.filter( ( f ) => f.page === page && marks.has( f.id ) );
    const lines = [];
    for ( const e of entries( job, page ) ) {
        if ( e.block ) {
            const named = [ ...new Set( here.filter( ( f ) => f.labelBlock === e.block.id ).map( ( f ) => marks.get( f.id ) ) ) ];
            lines.push( e.block.content.replace( /\s+/g, ' ' ).trim() + ( named.length ? '  → ' + named.join( ' ' ) : '' ) );
        } else if ( marks.has( e.field.id ) && lines[ lines.length - 1 ] !== marks.get( e.field.id ) ) {
            // the cells of a table follow each other: its id once
            lines.push( marks.get( e.field.id ) );
        }
    }
    return '===== Seite ' + page + ' =====\n' + lines.join( '\n' );
}
