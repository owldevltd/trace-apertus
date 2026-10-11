import { groupRadios } from '../fields/builder.js';
import { entries, rank } from './listing.js';

// Units: every field hangs on exactly one question, so an answer has a place to go back to. A unit is a single
// field, a choice (tick marks that belong together) or a table (rows built alike). Built by code from the
// geometry, without a model. On the four shipped forms 407 fields make 259 units: 225 single fields, 29 choices
// with 65 tick marks, 5 tables with 117 cells (9 October 2026). The signature is no unit; it is set when signing.

// Cells whose upper edges lie this close, in character heights, stand in one row; rows are built alike when
// every cell starts and ends within COLUMN of the one above and the rows follow within ROW_GAP. Set by eye on
// the shipped forms, not measured against a reference: none names the tables.
const ROW = 0.7;
const COLUMN = 1.0;
const ROW_GAP = 2.0;

// A table is a list of entries when its rows say the same thing again: every cell has a label, and each row
// carries the labels of the first, column by column ("further claims": ground, amount, interest, nine times).
// Such a table repeats: it is asked one entry at a time, and a row nobody filled is not shown. A table whose
// rows each mean something of their own (a wage table with a line per kind of pay) is asked as a whole.
export function repeats( cells, columns ) {
    const labels = cells.map( ( f ) => ( f.label || '' ).trim() );
    return columns > 0 && cells.length > columns && labels.every( ( l, i ) => l !== '' && l === labels[ i % columns ] );
}

// The rows of a table unit, each the ids of its cells.
export function rowsOf( unit ) {
    return Array.from( { length: unit.rows }, ( _, r ) => unit.fields.slice( r * unit.columns, ( r + 1 ) * unit.columns ) );
}

// A date printed as three boxes in a row, for the day, the month and the year, is one thing to ask and to say:
// the three are one unit, a table of one row that carries parts "date". The answer is read as one date and
// code puts its parts into the boxes. Known by the labels, in the four languages of the app.
const PARTS = [ /^(tag|jour|giorno|day)$/i, /^(monat|mois|mese|month)$/i, /^(jahr|année|annee|anno|year)$/i ];

function dates( inputs, unit ) {
    const out = [];
    const rows = [ ...inputs ].sort( ( a, b ) => a.x - b.x );
    for ( const first of rows.filter( ( f ) => PARTS[ 0 ].test( ( f.label || '' ).trim() ) ) ) {
        const row = rows.filter( ( f ) => Math.abs( f.y - first.y ) <= ROW * unit && f.x >= first.x );
        if ( row.length >= 3 && PARTS[ 1 ].test( ( row[ 1 ].label || '' ).trim() ) && PARTS[ 2 ].test( ( row[ 2 ].label || '' ).trim() ) ) {
            out.push( row.slice( 0, 3 ) );
        }
    }
    return out;
}

// The first row of a table nothing stands in yet, counted from 1; 0 when every row is taken.
export function freeRow( job, unit ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    return rowsOf( unit ).findIndex( ( row ) => !row.some( ( id ) => fields.get( id ) && ( fields.get( id ).value || fields.get( id ).source ) ) ) + 1;
}

// The units of a job in the order of the conversation, which is the order of the paper: q1, q2, …
// A unit: { id, kind, page, fields: [ field ids ], label, rows?, columns?, repeat?, parts?, skip? }.
export function buildUnits( job ) {
    const units = [];
    // a fillable original knows its fields: a place it has no form field for is not asked (a section bar, an
    // office note the geometry takes for a field); the output could not write there either
    const fillable = job.fields.some( ( f ) => f.widget );
    for ( const page of job.pages ) {
        const here = job.fields.filter( ( f ) => f.page === page.n && f.kind !== 'signature' );
        const found = [];
        const taken = new Set();
        const take = ( kind, fields, more = {} ) => {
            found.push( { kind, fields, ...more } );
            fields.forEach( ( f ) => taken.add( f ) );
        };
        // tick marks that carry a group belong together; a radio without one stands alone, and tick boxes
        // without one are grouped by the rule the radios were measured with
        const grouped = new Map();
        for ( const f of here.filter( ( x ) => x.kind === 'radio' || ( x.kind === 'checkbox' && x.group ) ) ) {
            const key = f.group || f.id;
            grouped.set( key, [ ...( grouped.get( key ) || [] ), f ] );
        }
        const boxes = groupRadios( here.filter( ( x ) => x.kind === 'checkbox' && !x.group ), page.unit );
        for ( const group of [ ...grouped.values(), ...boxes ] ) {
            take( group.length > 1 ? 'choice' : 'single', group );
        }
        const written = ( x ) => !taken.has( x ) && x.kind !== 'checkbox' && x.kind !== 'radio';
        for ( const three of dates( here.filter( written ), page.unit ) ) {
            take( 'table', three, { rows: 1, columns: 3, parts: 'date' } );
        }
        for ( const rows of tables( here.filter( ( x ) => !taken.has( x ) ), page.unit ) ) {
            take( 'table', rows.flat(), { rows: rows.length, columns: rows[ 0 ].length } );
        }
        for ( const f of here.filter( ( x ) => !taken.has( x ) ) ) {
            take( 'single', [ f ] );
        }
        const list = entries( job, page.n );
        const order = ( u ) => Math.min( ...u.fields.map( ( f ) => rank( list, f ) ) );
        found.sort( ( a, b ) => order( a ) - order( b ) );
        for ( const u of found ) {
            const unit = { id: 'q' + ( units.length + 1 ), kind: u.kind, page: page.n, fields: u.fields.map( ( f ) => f.id ), label: [ ...new Set( u.fields.map( ( f ) => f.label ).filter( Boolean ) ) ].join( ' / ' ) };
            if ( u.kind === 'table' ) {
                unit.rows = u.rows;
                unit.columns = u.columns;
                if ( u.parts ) {
                    unit.parts = u.parts;
                } else if ( repeats( u.fields, u.columns ) ) {
                    unit.repeat = true;
                }
            }
            // a field a person put there is asked: the output draws its value on the page
            if ( fillable && !u.fields.some( ( f ) => f.widget || f.by === 'person' ) ) {
                unit.skip = true;
            }
            units.push( unit );
        }
    }
    return units;
}

// Runs of at least two rows built alike, each of at least two writing fields: [ [ row, row, … ], … ].
function tables( inputs, unit ) {
    const rows = [];
    for ( const f of [ ...inputs ].sort( ( a, b ) => a.y - b.y || a.x - b.x ) ) {
        const row = rows.find( ( r ) => Math.abs( r.y - f.y ) <= ROW * unit );
        if ( row ) {
            row.cells.push( f );
        } else {
            rows.push( { y: f.y, cells: [ f ] } );
        }
    }
    rows.sort( ( a, b ) => a.y - b.y );
    for ( const r of rows ) {
        r.cells.sort( ( a, b ) => a.x - b.x );
        r.bottom = Math.max( ...r.cells.map( ( c ) => c.y + c.height ) );
    }
    const alike = ( a, b ) => a.cells.length >= 2 && a.cells.length === b.cells.length && b.y - a.bottom <= ROW_GAP * unit
        && a.cells.every( ( c, i ) => Math.abs( c.x - b.cells[ i ].x ) <= COLUMN * unit && Math.abs( c.width - b.cells[ i ].width ) <= COLUMN * unit );
    const out = [];
    let run = [];
    for ( const r of [ ...rows, null ] ) {
        if ( r && run.length && alike( run[ run.length - 1 ], r ) ) {
            run.push( r );
            continue;
        }
        if ( run.length >= 2 ) {
            out.push( run.map( ( x ) => x.cells ) );
        }
        run = r ? [ r ] : [];
    }
    return out;
}
