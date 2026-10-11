import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { buildSheet } from './sheet.js';
import { pageReference } from './reference.js';

// Builds the rebuilt forms: the fillable PDF from its definition, one PNG per page at 300 dpi (poppler's
// pdftoppm), and the reference JSON per page that the tests measure against. A preparation step, run once;
// the results are committed under data/forms/<id>/. The app does not need poppler.
//
//   node tools/forms/build.js [<id> …]        default: every definition in this folder

const run = promisify( execFile );
const here = path.dirname( fileURLToPath( import.meta.url ) );
const root = path.resolve( here, '..', '..' );

const ALL = [ 'arbeitsfaehigkeitszeugnis', 'austrittsmeldung', 'schadenmeldung-uvg' ];
const ids = process.argv.slice( 2 ).length ? process.argv.slice( 2 ) : ALL;

for ( const id of ids ) {
    const { form } = await import( './' + id + '.js' );
    const dir = path.join( root, 'data', 'forms', id );
    await fs.mkdir( dir, { recursive: true } );
    for ( const old of ( await fs.readdir( dir ) ).filter( ( f ) => /-s\d+\.(png|json)$/.test( f ) ) ) {
        await fs.unlink( path.join( dir, old ) );
    }
    const pdfFile = path.join( dir, 'form.pdf' );
    const bytes = await buildSheet( form );
    await fs.writeFile( pdfFile, bytes );
    await run( 'pdftoppm', [ '-r', '300', '-png', pdfFile, path.join( dir, id ) ] );
    const pages = ( await fs.readdir( dir ) ).filter( ( f ) => new RegExp( '^' + id + '-\\d+\\.png$' ).test( f ) ).sort();
    let n = 0;
    for ( const file of pages ) {
        n++;
        const png = path.join( dir, id + '-s' + n + '.png' );
        await fs.rename( path.join( dir, file ), png );
        const ref = await pageReference( pdfFile, png, n, { source: 'data/forms/' + id + '/form.pdf', lang: form.language || 'de' } );
        await fs.writeFile( path.join( dir, id + '-s' + n + '.json' ), JSON.stringify( ref ) );
        console.log( id.padEnd( 28 ) + ' page ' + n + ': ' + ref.width + '×' + ref.height + ', ' + ref.words.length + ' words, ' + ref.widgets.length + ' widgets' );
    }
    console.log( id.padEnd( 28 ) + ' form.pdf ' + bytes.length + ' bytes, ' + n + ' page' + ( n === 1 ? '' : 's' ) );
}
