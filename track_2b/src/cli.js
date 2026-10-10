import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { run, close } from './workers.js';
import { createClient } from './model/client.js';
import { toRead, readElements } from './read/reader.js';
import { buildFields } from './fields/builder.js';
import { buildCatalogue } from './review/catalogue.js';

// The pipeline from the command line, step by step.
//
//   node src/cli.js analyze   [--out=<dir>] <image> [<image> …]
//   node src/cli.js read      [--out=<dir>] <image> [<image> …]
//   node src/cli.js fields    [--out=<dir>] <image> [<image> …]
//   node src/cli.js catalogue <form>
//
// catalogue asks the large model once for the catalogue of a shipped form (data/forms/<form>), from the text
// layer of its pages, and writes data/catalogues/<form>.json, unverified; a person checks the sources against
// the statute text and sets `verified`.
//
// analyze writes <dir>/<name>.json (the geometry) and <dir>/<name>-page.png (control image) per page.
// read takes that geometry, asks the model for every unknown element (LLM_API_KEY in the environment) and writes
// <dir>/<name>-elements.json and <dir>/<name>-elements.png; raw answers go to <dir>/<name>.read/ and the
// exchange with the model to <dir>/model/. fields takes the read elements (else the bare geometry), the form
// widgets from a <name>.json next to the image when there is one, and writes <dir>/<name>-fields.json and
// <dir>/<name>-fields.png. The default <dir> is storage/pages/.

const args = process.argv.slice( 2 );
const command = args.shift();
const options = {};
const files = [];
for ( const a of args ) {
    if ( a.startsWith( '--' ) ) {
        const [ key, value ] = a.slice( 2 ).split( '=' );
        options[ key ] = value ?? true;
    } else {
        files.push( a );
    }
}

const out = options.out || path.join( config.storageDir, 'pages' );

if ( command === 'analyze' && files.length ) {
    await fs.mkdir( out, { recursive: true } );
    const started = Date.now();
    await Promise.all( files.map( async ( file ) => {
        const t0 = Date.now();
        const name = path.basename( file, path.extname( file ) );
        const result = await run( 'analyze', { file, control: path.join( out, name + '-page.png' ) } );
        await fs.writeFile( path.join( out, name + '.json' ), JSON.stringify( result, null, 2 ) );
        console.log( name.padEnd( 44 ) + ' ' + result.width + 'x' + result.height + '  paper ' + result.paper + '  unit ' + result.unit + ' px'
            + '  lines ' + result.lines.length + '  areas ' + result.areas.length + '  objects ' + result.objects.length + '  ' + ( ( Date.now() - t0 ) / 1000 ).toFixed( 1 ) + 's' );
    } ) );
    console.log( files.length + ' pages, ' + ( ( Date.now() - started ) / 1000 ).toFixed( 1 ) + 's' );
    close();
} else if ( command === 'read' && files.length ) {
    const client = createClient( config );
    const started = Date.now();
    if ( !config.apiKey ) {
        console.log( 'no LLM_API_KEY: nothing is asked, the unknown elements stay unknown' );
    }
    await Promise.all( files.map( async ( file ) => {
        const t0 = Date.now();
        const name = path.basename( file, path.extname( file ) );
        let page;
        try {
            page = JSON.parse( await fs.readFile( path.join( out, name + '.json' ), 'utf8' ) );
        } catch {
            console.log( name.padEnd( 44 ) + ' no geometry in ' + out + ', run analyze first' );
            return;
        }
        const crops = await run( 'crops', { file, boxes: toRead( page ) } );
        const { elements, calls } = await readElements( page, crops, client, path.join( out, name + '.read' ), path.join( out, 'model' ) );
        const finished = await run( 'finish', { file, page, elements, control: path.join( out, name + '-elements.png' ) } );
        await fs.writeFile( path.join( out, name + '-elements.json' ), JSON.stringify( finished, null, 2 ) );
        const types = {};
        for ( const e of finished ) {
            types[ e.type ] = ( types[ e.type ] || 0 ) + 1;
        }
        console.log( name.padEnd( 44 ) + ' ' + JSON.stringify( types ) + '  approve ' + finished.filter( ( e ) => e.approve ).length
            + '  calls ' + calls + '  ' + ( ( Date.now() - t0 ) / 1000 ).toFixed( 0 ) + 's' );
    } ) );
    console.log( files.length + ' pages, ' + client.state.calls + ' calls' + ( client.state.halted ? ', halted by HTTP ' + client.state.halted : '' )
        + ', ' + ( ( Date.now() - started ) / 1000 ).toFixed( 0 ) + 's' );
    close();
} else if ( command === 'fields' && files.length ) {
    await Promise.all( files.map( async ( file, i ) => {
        const name = path.basename( file, path.extname( file ) );
        let page;
        let elements;
        try {
            page = JSON.parse( await fs.readFile( path.join( out, name + '.json' ), 'utf8' ) );
            elements = JSON.parse( await fs.readFile( path.join( out, name + '-elements.json' ), 'utf8' ) );
        } catch {
            if ( !page ) {
                console.log( name.padEnd( 44 ) + ' no geometry in ' + out + ', run analyze first' );
                return;
            }
            elements = page.elements;
        }
        let widgets = [];
        try {
            const ref = JSON.parse( await fs.readFile( file.replace( /\.[^.]+$/, '.json' ), 'utf8' ) );
            widgets = ( ref.widgets || [] ).map( ( w ) => ( { typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) );
        } catch {
            // no fillable original beside the image
        }
        const result = buildFields( [ { page: i + 1, unit: page.unit, elements, widgets } ] );
        await fs.writeFile( path.join( out, name + '-fields.json' ), JSON.stringify( result, null, 2 ) );
        await run( 'paintFields', { file, control: path.join( out, name + '-fields.png' ), fields: result.fields, blocks: result.blocks } );
        const kinds = {};
        for ( const f of result.fields ) {
            kinds[ f.kind ] = ( kinds[ f.kind ] || 0 ) + 1;
        }
        console.log( name.padEnd( 44 ) + ' ' + result.fields.length + ' fields ' + JSON.stringify( kinds )
            + '  with label ' + result.fields.filter( ( f ) => f.labelBlock ).length + '  with widget ' + result.fields.filter( ( f ) => f.widget ).length );
    } ) );
    close();
} else if ( command === 'catalogue' && files.length === 1 ) {
    const form = files[ 0 ];
    const dir = path.join( config.dataDir, 'forms', form );
    const meta = JSON.parse( await fs.readFile( path.join( dir, 'form.json' ), 'utf8' ) );
    // the form's text from the text layer of its pages, block by block
    const blocks = [];
    for ( const file of ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.json' ) && f !== 'form.json' ).sort() ) {
        const ref = JSON.parse( await fs.readFile( path.join( dir, file ), 'utf8' ) );
        const byBlock = new Map();
        for ( const w of ref.words || [] ) {
            if ( !byBlock.has( w.block ) ) {
                byBlock.set( w.block, [] );
            }
            byBlock.get( w.block ).push( w );
        }
        for ( const words of byBlock.values() ) {
            blocks.push( { type: 'text', content: words.sort( ( a, b ) => a.line - b.line || a.x - b.x ).map( ( w ) => w.t ).join( ' ' ) } );
        }
    }
    const client = createClient( config );
    const catalogue = await buildCatalogue( { form: { name: meta.name }, blocks, fields: [] }, client );
    const target = path.join( config.dataDir, 'catalogues', form + '.json' );
    await fs.mkdir( path.dirname( target ), { recursive: true } );
    await fs.writeFile( target, JSON.stringify( catalogue, null, 4 ) + '\n' );
    console.log( target + ': ' + catalogue.fields.length + ' fields, ' + catalogue.fields.filter( ( f ) => !/keine sichere/i.test( f.source ) ).length + ' with a source; unverified' );
} else {
    console.log( 'usage: node src/cli.js analyze|read|fields [--out=<dir>] <image> [<image> …]\n       node src/cli.js catalogue <form>' );
    process.exit( 1 );
}
