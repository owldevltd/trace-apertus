import fs from 'node:fs/promises';
import path from 'node:path';
import { buildFields } from '../src/fields/builder.js';
import { layerElements } from '../src/read/layer.js';

// A shipped form as the pipeline hands it on, without a model: the geometry of its pages, read from the text
// layer of the PDF as the pipeline does for a shipped form, the form widgets of the fillable original. Used by
// the tests that need the whole form and not one page.

// The text layer standing in for the reading in the measurements of single pages against the widgets: an unknown
// element with reference words in it is a text, as a whole. The numbers of tests/fields.js rest on this.
export function standIn( elements, words ) {
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

// dir: a folder of data/forms; gotDir: where `cli.js analyze` wrote the geometry of its pages.
// Returns { id, form, pages, blocks, fields, widgets } with pages, blocks and fields as the contract has them;
// widgets are the names of the PDF's form fields per page, in the order of the PDF.
export async function loadShipped( dir, gotDir ) {
    const meta = JSON.parse( await fs.readFile( path.join( dir, 'form.json' ), 'utf8' ) );
    const pages = [];
    const built = [];
    const widgets = [];
    for ( const png of ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.png' ) ).sort() ) {
        const name = png.replace( /\.png$/, '' );
        const got = JSON.parse( await fs.readFile( path.join( gotDir, name + '.json' ), 'utf8' ) );
        const ref = JSON.parse( await fs.readFile( path.join( dir, name + '.json' ), 'utf8' ) );
        const n = pages.length + 1;
        const own = ( ref.widgets || [] ).map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) );
        pages.push( { n, width: got.width, height: got.height, unit: got.unit } );
        built.push( { page: n, unit: got.unit, elements: layerElements( got, ref.words || [] ), widgets: own } );
        widgets.push( own.map( ( w ) => w.name ) );
    }
    const { blocks, fields } = buildFields( built );
    const id = path.basename( dir );
    return { id, form: { name: meta.name, issuer: meta.issuer, language: meta.language, pages: pages.length, origin: meta.origin, file: 'forms/' + id + '/' + meta.file }, pages, blocks, fields, widgets };
}
