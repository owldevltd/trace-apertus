import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Everything the app needs from outside: model access and where files live. Values come from the environment,
// or from a .env file in the project folder (see .env.example); the environment wins. Paths default to the
// project folders.

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );

try {
    for ( const line of readFileSync( path.join( root, '.env' ), 'utf8' ).split( /\r?\n/ ) ) {
        const m = line.match( /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/ );
        if ( m && !m[ 1 ].startsWith( '#' ) && process.env[ m[ 1 ] ] === undefined ) {
            process.env[ m[ 1 ] ] = m[ 2 ].replace( /^(['"])(.*)\1$/, '$2' );
        }
    }
} catch {
    // no .env: the environment alone
}

export const config = {
    model:   process.env.MODEL    || 'swiss-ai/Apertus-v1.5-8B',
    baseUrl: process.env.BASE_URL || 'https://api.inference.cscs.ch/v1',
    apiKey:  process.env.API_KEY  || '',
    port:    Number( process.env.PORT || 8080 ),
    dataDir:    process.env.DATA_DIR    || path.join( root, 'data' ),
    storageDir: process.env.STORAGE_DIR || path.join( root, 'storage' ),
    root,
};
