import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { run, close } from './workers.js';

// The pipeline from the command line, step by step. Today: analyze.
//
//   node src/cli.js analyze [--out=<dir>] <image> [<image> …]
//
// Writes <dir>/<name>.json (the geometry) and <dir>/<name>-page.png (control image) per page;
// the default <dir> is storage/pages/.

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

if ( command === 'analyze' && files.length ) {
    const out = options.out || path.join( config.storageDir, 'pages' );
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
} else {
    console.log( 'usage: node src/cli.js analyze [--out=<dir>] <image> [<image> …]' );
    process.exit( 1 );
}
