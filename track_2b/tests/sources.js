import fs from 'node:fs/promises';
import path from 'node:path';
import { compare } from './compare.js';

// Error sources: every difference between the object layer and the reference gets a cause, per set and
// per document. Two levels: blocks against objects, lines against text lines (strips). For forms also:
// what lies at the place of each widget.
//
//   node tests/sources.js <reference dir> <analyzed dir> [--out=<file.md>]
//
// The reference dir holds <name>.json per page (words, images, widgets from the PDF); the analyzed dir
// holds <name>.json as written by `cli.js analyze`.

// An object from this share of the page on is background or frame, not a neighbour.
const PAGE_SIZED = 0.25;

// Distance up to which a line belongs to a widget (original pixels).
const NEAR = 8;

const CAUSES = [ 'single', 'page-sized', 'merged below/above', 'merged beside', 'cut between lines', 'number cut off', 'cut at wide gap', 'as line', 'missed' ];

const [ refDir, gotDir ] = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !refDir || !gotDir ) {
    console.log( 'usage: node tests/sources.js <reference dir> <analyzed dir> [--out=<file.md>]' );
    process.exit( 1 );
}

function inside( boxes, x, y ) {
    return boxes.some( ( b ) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h );
}

// Only a number, a letter with a bracket or a bullet before the cut?
function marker( text ) {
    const p = text.split( ' ¦ ' );
    return p.length === 2 && /^(\(?\d{1,3}[.)]?|\(?[a-zA-Z][.)]|[IVXivx]{1,5}[.)]|[^\p{L}\p{N}\s]{1,2})$/u.test( p[ 0 ].trim() );
}

// Cause per block from the result of compare().
function causes( res, got, page ) {
    const n = Object.fromEntries( CAUSES.map( ( c ) => [ c, 0 ] ) );
    const inObj = {};
    for ( const [ i, b ] of Object.entries( res.blocks ) ) {
        for ( const o of b.objs ) {
            ( inObj[ o ] ??= [] ).push( i );
        }
    }
    for ( const [ i, b ] of Object.entries( res.blocks ) ) {
        let cause = b.state;
        if ( cause === 'merged' ) {
            const o = got.objects[ b.objs[ 0 ] ];
            cause = 'merged beside';
            if ( o.w * o.h >= PAGE_SIZED * page ) {
                cause = 'page-sized';
            } else {
                for ( const j of inObj[ b.objs[ 0 ] ] ) {
                    const c = res.blocks[ j ];
                    if ( j !== i && Math.min( b.x + b.w, c.x + c.w ) > Math.max( b.x, c.x ) ) {
                        cause = 'merged below/above';
                    }
                }
            }
        } else if ( cause === 'cut inside a line' ) {
            const cut = b.lines.filter( ( l ) => res.lines[ l ].state === 'cut' );
            const plain = cut.filter( ( l ) => !marker( res.lines[ l ].t ) );
            cause = plain.length ? 'cut at wide gap' : 'number cut off';
        } else if ( cause === 'line' ) {
            cause = 'as line';
        }
        n[ cause ]++;
    }
    return n;
}

const pct = ( v, all ) => v + ( all ? ' (' + ( 100 * v / all ).toFixed( 1 ) + ' %)' : '' );
const row = ( label, n ) => {
    const all = Object.values( n ).reduce( ( a, b ) => a + b, 0 );
    return '| ' + label + ' | ' + all + ' |' + CAUSES.map( ( c ) => ' ' + pct( n[ c ], all ) + ' |' ).join( '' ) + '\n';
};
const add = ( sum, n ) => {
    for ( const [ k, v ] of Object.entries( n ) ) {
        sum[ k ] = ( sum[ k ] || 0 ) + v;
    }
    return sum;
};

const head = '| all | ' + CAUSES.join( ' | ' ) + ' |\n|---|---:|' + '---:|'.repeat( CAUSES.length ) + '\n';
let md = '# Error sources\n\nProduced by `tests/sources.js`. Reference is the text layer of the PDFs (words, lines, blocks by poppler), for forms also the widgets of the AcroForm. Every block and line of the reference stands in exactly one column.\n';

const byDoc = {};
const widgets = {};
const words = { all: 0, object: 0, line: 0, missed: 0 };
const levels = { blocks: {}, lines: {} };
for ( const file of ( await fs.readdir( refDir ) ).filter( ( f ) => f.endsWith( '.json' ) ).sort() ) {
    const name = path.basename( file, '.json' );
    let got;
    try {
        got = JSON.parse( await fs.readFile( path.join( gotDir, name + '.json' ), 'utf8' ) );
    } catch {
        continue;
    }
    const ref = JSON.parse( await fs.readFile( path.join( refDir, file ), 'utf8' ) );
    const page = ref.width * ref.height;
    const doc = ref.kind === 'formular' ? path.basename( ref.source, '.pdf' ) : name;

    if ( ref.words.length ) {
        const res = compare( ref, got );
        const b = causes( res, got, page );
        levels.blocks = add( levels.blocks, b );
        ( byDoc[ doc ] ??= { blocks: {}, lines: {} } ).blocks = add( byDoc[ doc ].blocks, b );
        add( words, res.count.words );

        // lines against text lines: the same count, block = line, object = strip
        if ( got.strips ) {
            const flat = { ...ref, words: ref.words.map( ( w ) => ( { ...w, block: w.line } ) ) };
            const thin = { ...got, objects: got.strips };
            const l = causes( compare( flat, thin ), thin, page );
            levels.lines = add( levels.lines, l );
            byDoc[ doc ].lines = add( byDoc[ doc ].lines, l );
        }
    }

    // widgets: what lies at the place. Boxes are printed, text fields are empty places.
    for ( const w of ref.widgets || [] ) {
        const cx = w.x + Math.floor( w.w / 2 );
        const cy = w.y + Math.floor( w.h / 2 );
        const line = got.lines.some( ( l ) => l.x <= w.x + w.w + NEAR && l.x + l.w >= w.x - NEAR && l.y <= w.y + w.h + NEAR && l.y + l.h >= w.y - NEAR );
        const obj = inside( got.objects, cx, cy );
        const box = w.typ === 'checkbox' || w.typ === 'radio';
        const what = box
            ? ( obj ? 'object' : ( line ? 'line' : ( inside( got.areas, cx, cy ) ? 'area' : 'nothing' ) ) )
            : ( inside( got.areas, cx, cy ) ? 'area' : ( line ? 'line' : 'nothing' ) );
        const n = ( widgets[ w.typ ] ??= { all: 0, object: 0, area: 0, line: 0, nothing: 0, 'covered by object': 0 } );
        n[ what ]++;
        if ( !box && obj ) {
            n[ 'covered by object' ]++;
        }
        n.all++;
    }
}

for ( const [ level, title ] of [ [ 'blocks', 'Blocks of the reference against objects' ], [ 'lines', 'Lines of the reference against text lines (strips)' ] ] ) {
    md += '\n## ' + title + '\n\n| Set ' + head + row( '**all**', levels[ level ] );
    const docs = Object.entries( byDoc ).filter( ( [ , n ] ) => Object.keys( n[ level ] ).length );
    docs.sort( ( a, b ) => ( a[ 1 ][ level ].single / Math.max( 1, Object.values( a[ 1 ][ level ] ).reduce( ( x, y ) => x + y, 0 ) ) ) - ( b[ 1 ][ level ].single / Math.max( 1, Object.values( b[ 1 ][ level ] ).reduce( ( x, y ) => x + y, 0 ) ) ) );
    md += '\n### Per document (worst first)\n\n| Document ' + head;
    for ( const [ doc, n ] of docs ) {
        md += row( doc, n[ level ] );
    }
}
md += '\n## Words\n\n| all | in an object | as line | in no object |\n|---:|---:|---:|---:|\n| ' + words.all + ' | ' + pct( words.object, words.all ) + ' | ' + words.line + ' | ' + words.missed + ' |\n';
if ( Object.keys( widgets ).length ) {
    md += '\n## Widgets of the forms: what lies at the place\n\nBoxes and radios are printed: "object" = their centre lies in an object. Text fields, choices and signatures are empty places: "area" = centre on a tinted area, "line" = a line touches the field, "nothing" = the layer has nothing there. "covered by object" counts in addition when an object\'s box lies over the field centre.\n\n| Type | all | object | area | line | nothing | covered by object |\n|---|---:|---:|---:|---:|---:|---:|\n';
    for ( const [ typ, n ] of Object.entries( widgets ) ) {
        md += '| ' + typ + ' | ' + n.all + [ 'object', 'area', 'line', 'nothing', 'covered by object' ].map( ( k ) => ' | ' + pct( n[ k ], n.all ) ).join( '' ) + ' |\n';
    }
}
if ( outFile ) {
    await fs.writeFile( outFile, md );
}
console.log( md );
