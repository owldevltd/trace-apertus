import fs from 'node:fs/promises';
import path from 'node:path';

// Tick marks from the geometry against the checkbox and radio widgets of the forms. Per widget: found as a
// box, found as a circle, not found. Per find: does it lie on a widget.
//
//   node tests/marks.js --got=<analyzed dir> [--out=<file.md>] <reference dir> [<reference dir> …]

// How far the centre of a find may lie beside the widget (original pixels).
const NEAR = 8;

const refDirs = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const gotDir = ( process.argv.find( ( a ) => a.startsWith( '--got=' ) ) || '' ).slice( 6 );
const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !refDirs.length || !gotDir ) {
    console.log( 'usage: node tests/marks.js --got=<analyzed dir> [--out=<file.md>] <reference dir> [<reference dir> …]' );
    process.exit( 1 );
}

const sum = { checkbox: { all: 0, checkbox: 0, radio: 0, nothing: 0 }, radio: { all: 0, checkbox: 0, radio: 0, nothing: 0 }, free: 0, finds: 0, ticked: 0, tickedOnWidget: 0 };
const sizes = { checkbox: [], radio: [] };
let rows = '';
const files = [];
for ( const dir of refDirs ) {
    if ( !( await fs.stat( dir ) ).isDirectory() ) {
        continue;
    }
    for ( const f of ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.json' ) ).sort() ) {
        files.push( path.join( dir, f ) );
    }
}
for ( const file of files ) {
    const name = path.basename( file, '.json' );
    let got;
    try {
        got = JSON.parse( await fs.readFile( path.join( gotDir, name + '.json' ), 'utf8' ) );
    } catch {
        continue;
    }
    const ref = JSON.parse( await fs.readFile( file, 'utf8' ) );
    const spots = ( ref.widgets || [] ).filter( ( w ) => w.typ === 'checkbox' || w.typ === 'radio' );
    if ( !spots.length ) {
        continue;
    }
    const n = { checkbox: { all: 0, checkbox: 0, radio: 0, nothing: 0 }, radio: { all: 0, checkbox: 0, radio: 0, nothing: 0 } };
    const used = new Set();
    for ( const w of spots ) {
        sizes[ w.typ ].push( Math.max( w.w, w.h ) / got.unit );
        let hit = 'nothing';
        got.marks.forEach( ( m, i ) => {
            if ( hit !== 'nothing' ) {
                return;
            }
            const cx = m.x + m.w / 2;
            const cy = m.y + m.h / 2;
            if ( cx >= w.x - NEAR && cx <= w.x + w.w + NEAR && cy >= w.y - NEAR && cy <= w.y + w.h + NEAR ) {
                hit = m.kind;
                used.add( i );
            }
        } );
        n[ w.typ ].all++;
        n[ w.typ ][ hit ]++;
    }
    const free = got.marks.length - used.size;
    for ( const typ of [ 'checkbox', 'radio' ] ) {
        for ( const k of Object.keys( n[ typ ] ) ) {
            sum[ typ ][ k ] += n[ typ ][ k ];
        }
    }
    sum.free += free;
    sum.finds += got.marks.length;
    got.marks.forEach( ( m, i ) => {
        if ( m.content === 'x' ) {
            sum.ticked++;
            if ( used.has( i ) ) {
                sum.tickedOnWidget++;
            }
        }
    } );
    rows += '| ' + name + ' | ' + n.checkbox.all + ' | ' + n.checkbox.checkbox + ' | ' + n.checkbox.radio + ' | ' + n.checkbox.nothing
        + ' | ' + n.radio.all + ' | ' + n.radio.checkbox + ' | ' + n.radio.radio + ' | ' + n.radio.nothing + ' | ' + free + ' |\n';
}

const pct = ( v, all ) => v + ( all ? ' (' + ( 100 * v / all ).toFixed( 1 ) + ' %)' : '' );
let md = '# Tick marks from the geometry\n\nProduced by `tests/marks.js`. Reference: checkbox and radio widgets of the forms. The widget type says how the field behaves, not how it is drawn: a radio can be printed as a square.\n\n## Total\n\n| Widget | all | found as square | found as circle | not found |\n|---|---:|---:|---:|---:|\n';
for ( const typ of [ 'checkbox', 'radio' ] ) {
    const c = sum[ typ ];
    md += '| ' + typ + ' | ' + c.all + ' | ' + pct( c.checkbox, c.all ) + ' | ' + pct( c.radio, c.all ) + ' | ' + pct( c.nothing, c.all ) + ' |\n';
}
md += '\nFinds on these pages: ' + sum.finds + ', of which on no widget: ' + pct( sum.free, sum.finds ) + '. Marked as ticked: ' + sum.ticked + ', of which on a widget: ' + sum.tickedOnWidget + '.\n';
for ( const [ typ, v ] of Object.entries( sizes ) ) {
    if ( !v.length ) {
        continue;
    }
    v.sort( ( a, b ) => a - b );
    md += 'Size of the ' + typ + ' widgets in character heights of the page: smallest ' + v[ 0 ].toFixed( 2 ) + ', median ' + v[ Math.floor( v.length / 2 ) ].toFixed( 2 ) + ', largest ' + v[ v.length - 1 ].toFixed( 2 ) + '.\n';
}
md += '\n## Per page\n\n| Page | boxes | square | circle | nothing | radios | square | circle | nothing | finds without widget |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n' + rows;
if ( outFile ) {
    await fs.writeFile( outFile, md );
}
console.log( md );
