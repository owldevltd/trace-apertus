import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { run, close } from './workers.js';
import { createClient } from './model/client.js';
import { toRead, readElements } from './read/reader.js';

// The pipeline from the command line, step by step.
//
//   node src/cli.js analyze [--out=<dir>] <image> [<image> …]
//   node src/cli.js read    [--out=<dir>] <image> [<image> …]
//
// analyze writes <dir>/<name>.json (the geometry) and <dir>/<name>-page.png (control image) per page.
// read takes that geometry, asks the model for every unknown element (API_KEY in the environment) and writes
// <dir>/<name>-elements.json and <dir>/<name>-elements.png; raw answers go to <dir>/<name>.read/ and the
// exchange with the model to <dir>/model/. The default <dir> is storage/pages/.

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
        console.log( 'no API_KEY: nothing is asked, the unknown elements stay unknown' );
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
} else {
    console.log( 'usage: node src/cli.js analyze|read [--out=<dir>] <image> [<image> …]' );
    process.exit( 1 );
}
