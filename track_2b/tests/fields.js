import fs from 'node:fs/promises';
import path from 'node:path';
import { buildFields, groupRadios, same } from '../src/fields/builder.js';

// The built fields against the form widgets of the PDFs, without a model: the text layer stands in for the
// reading (an element with reference words in it is a text). Per widget: hit by a field of the right kind.
// Per built field: on a widget, or invented. Labels: found, and sharing a word with the widget's name where the
// name is a word. Radio groups against the widget names (radios of one group share the name in the PDF), for
// grouping by row only and by row and column.
//
//   node tests/fields.js --got=<analyzed dir> [--out=<file.md>] <reference dir> [<reference dir> …]

const FIELD = [ 'text', 'auswahl', 'unterschrift' ];
const MARK = [ 'checkbox', 'radio' ];

const refDirs = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const gotDir = ( process.argv.find( ( a ) => a.startsWith( '--got=' ) ) || '' ).slice( 6 );
const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !refDirs.length || !gotDir ) {
    console.log( 'usage: node tests/fields.js --got=<analyzed dir> [--out=<file.md>] <reference dir> [<reference dir> …]' );
    process.exit( 1 );
}

const files = [];
for ( const dir of refDirs ) {
    if ( !( await fs.stat( dir ) ).isDirectory() ) {
        continue;
    }
    for ( const f of ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.json' ) ).sort() ) {
        files.push( path.join( dir, f ) );
    }
}

const sum = {
    pages: 0, noWidgets: 0,
    widgets: 0, hit: 0, built: 0, onField: 0, onMark: 0, onNothing: 0,
    checkbox: 0, checkboxHit: 0, radio: 0, radioHit: 0,
    labelled: 0, named: 0, agree: 0, markRight: 0, markLeft: 0, markIn: 0, markNone: 0,
    signature: 0, signatureHit: 0, kinds: {},
    groups: { row: { same: 0, other: 0, missed: 0 }, both: { same: 0, other: 0, missed: 0 }, 'row-else-column': { same: 0, other: 0, missed: 0 } },
};
let rows = '';
let names = '';
for ( const file of files ) {
    const name = path.basename( file, '.json' );
    let got;
    try {
        got = JSON.parse( await fs.readFile( path.join( gotDir, name + '.json' ), 'utf8' ) );
    } catch {
        continue;
    }
    const ref = JSON.parse( await fs.readFile( file, 'utf8' ) );
    if ( !( ref.widgets || [] ).length ) {
        sum.noWidgets++;
        continue;
    }
    sum.pages++;
    const widgets = ref.widgets.map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) );
    const elements = standIn( got.elements, ref.words );
    const { fields } = buildFields( [ { page: 1, unit: got.unit, elements, widgets } ] );
    const texts = elements.filter( ( e ) => e.type === 'text' );

    const p = { widgets: 0, hit: 0, built: 0, onField: 0, onMark: 0, onNothing: 0, labelled: 0 };
    for ( const f of fields ) {
        sum.kinds[ f.kind ] = ( sum.kinds[ f.kind ] || 0 ) + 1;
        if ( MARK.includes( f.kind ) ) {
            const side = markSide( f, texts, got.unit );
            sum[ side ]++;
            continue;
        }
        p.built++;
        const on = widgets.find( ( w ) => FIELD.includes( w.typ ) && same( f, w ) ) ? 'onField' : ( widgets.find( ( w ) => MARK.includes( w.typ ) && same( f, w ) ) ? 'onMark' : 'onNothing' );
        p[ on ]++;
    }
    for ( const w of widgets ) {
        if ( MARK.includes( w.typ ) ) {
            sum[ w.typ ]++;
            if ( fields.some( ( f ) => MARK.includes( f.kind ) && same( f, w ) ) ) {
                sum[ w.typ + 'Hit' ]++;
            }
            continue;
        }
        p.widgets++;
        const f = fields.find( ( f ) => !MARK.includes( f.kind ) && same( f, w ) );
        if ( !f ) {
            continue;
        }
        p.hit++;
        if ( w.typ === 'unterschrift' ) {
            sum.signature++;
            sum.signatureHit += f.kind === 'signature' ? 1 : 0;
        }
        if ( f.labelBlock ) {
            p.labelled++;
        }
        if ( wordy( w.name ) ) {
            sum.named++;
            const shared = f.label !== '' && shares( f.label, w.name );
            sum.agree += shared ? 1 : 0;
            if ( names.split( '\n' ).length <= 80 ) {
                names += '| ' + name + ' | ' + w.name + ' | ' + ( f.label || '–' ) + ' | ' + ( shared ? 'yes' : '' ) + ' |\n';
            }
        }
    }
    for ( const key of Object.keys( p ) ) {
        sum[ key ] += p[ key ];
    }
    rows += '| ' + name + ' | ' + p.widgets + ' | ' + p.hit + ' | ' + p.built + ' | ' + p.onField + ' | ' + p.onMark + ' | ' + p.onNothing + ' | ' + p.labelled + ' |\n';

    // radio groups: pairs of built radios on radio widgets, in one group against sharing the widget's name
    const radios = fields.filter( ( f ) => f.kind === 'radio' && f.widget );
    for ( const key of Object.keys( sum.groups ) ) {
        const groupOf = new Map();
        groupRadios( radios, got.unit, key ).forEach( ( g, i ) => g.forEach( ( f ) => groupOf.set( f, i ) ) );
        for ( let i = 0; i < radios.length; i++ ) {
            for ( let j = i + 1; j < radios.length; j++ ) {
                const together = groupOf.get( radios[ i ] ) === groupOf.get( radios[ j ] );
                const shared = radios[ i ].widget === radios[ j ].widget;
                if ( together ) {
                    sum.groups[ key ][ shared ? 'same' : 'other' ]++;
                } else if ( shared ) {
                    sum.groups[ key ].missed++;
                }
            }
        }
    }
}

const pct = ( a, b ) => ( 100 * a / Math.max( 1, b ) ).toFixed( 1 ) + ' %';
let md = '# Fields against the form widgets\n\n'
    + 'Generated by `tests/fields.js` on ' + new Date().toISOString().slice( 0, 10 ) + '. ' + sum.pages + ' pages with widgets (' + sum.noWidgets + ' without, skipped). '
    + 'The text layer stands in for the reading. Hit = field and widget overlap by more than half of the smaller area.\n\n'
    + '## Inputs\n\n'
    + '- Field widgets: ' + sum.widgets + ', hit by a built field: ' + sum.hit + ' (' + pct( sum.hit, sum.widgets ) + ')\n'
    + '- Built fields: ' + sum.built + ', on a field widget ' + sum.onField + ' (' + pct( sum.onField, sum.built ) + '), on a tick-mark widget ' + sum.onMark + ', on nothing ' + sum.onNothing + ' (' + pct( sum.onNothing, sum.built ) + ')\n'
    + '- Of the hit widgets, fields with a label: ' + sum.labelled + ' (' + pct( sum.labelled, sum.hit ) + ')\n'
    + '- Widgets whose name is a word: ' + sum.named + ', label shares a word with it: ' + sum.agree + '\n'
    + '- Signature widgets hit: ' + sum.signature + ', built as signature: ' + sum.signatureHit + '\n'
    + '- Kinds of all built fields: ' + JSON.stringify( sum.kinds ) + '\n\n'
    + '## Tick marks\n\n'
    + '- Checkbox widgets: ' + sum.checkbox + ', hit: ' + sum.checkboxHit + ' (' + pct( sum.checkboxHit, sum.checkbox ) + ')\n'
    + '- Radio widgets: ' + sum.radio + ', hit: ' + sum.radioHit + ' (' + pct( sum.radioHit, sum.radio ) + ')\n'
    + '- Where the label of a built tick mark stands: in the text ' + sum.markIn + ', right ' + sum.markRight + ', left ' + sum.markLeft + ', none ' + sum.markNone + '\n\n'
    + '## Radio groups against the widget names\n\nPairs of built radios on radio widgets.\n\n| grouping | in one group, same name | in one group, other name | same name, not grouped |\n|---|---:|---:|---:|\n';
for ( const [ key, label ] of [ [ 'row', 'row only' ], [ 'both', 'row and column' ], [ 'row-else-column', 'row, else column (the rule)' ] ] ) {
    md += '| ' + label + ' | ' + sum.groups[ key ].same + ' | ' + sum.groups[ key ].other + ' | ' + sum.groups[ key ].missed + ' |\n';
}
md += '\n## Per page\n\n| page | field widgets | hit | built | on field | on tick mark | on nothing | hit with label |\n|---|---:|---:|---:|---:|---:|---:|---:|\n' + rows;
md += '\n## Widget name and built label (names that are words, first 80)\n\n| page | widget | label | shares a word |\n|---|---|---|---|\n' + names;

console.log( md.split( '\n## Per page' )[ 0 ] );
if ( outFile ) {
    await fs.mkdir( path.dirname( outFile ), { recursive: true } );
    await fs.writeFile( outFile, md );
    console.log( 'written ' + outFile );
}

// Elements with the text layer standing in for the reading: an unknown with reference words in it is a text.
function standIn( elements, words ) {
    return elements.map( ( e ) => {
        if ( e.type !== 'unknown' ) {
            return e;
        }
        const inside = words.filter( ( w ) => {
            if ( !w.ink ) {
                return false;
            }
            const cx = w.ink.x + Math.floor( w.ink.w / 2 );
            const cy = w.ink.y + Math.floor( w.ink.h / 2 );
            return cx >= e.x && cx <= e.x + e.width && cy >= e.y && cy <= e.y + e.height;
        } ).sort( ( a, b ) => a.line - b.line || a.x - b.x );
        return inside.length ? { ...e, type: 'text', content: inside.map( ( w ) => w.t ).join( ' ' ) } : e;
    } );
}

// On which side of a built tick mark its label was found.
function markSide( f, texts, u ) {
    if ( !f.labelBlock ) {
        return 'markNone';
    }
    const cy = f.y + f.height / 2;
    const t = texts.find( ( t ) => t.y <= cy + u && t.y + t.height >= cy - u && f.label === t.content.replace( /\s+/g, ' ' ).trim() );
    if ( !t ) {
        return 'markNone';
    }
    const cx = f.x + f.width / 2;
    if ( cx >= t.x && cx <= t.x + t.width ) {
        return 'markIn';
    }
    return t.x >= f.x + f.width ? 'markRight' : 'markLeft';
}

function wordy( name ) {
    return name.length > 2 && !/\d/.test( name );
}

function shares( label, name ) {
    const words = ( s ) => s.toLowerCase().split( /[^\p{L}]+/u ).filter( ( w ) => w.length >= 3 );
    const n = words( name );
    return words( label ).some( ( w ) => n.includes( w ) );
}
