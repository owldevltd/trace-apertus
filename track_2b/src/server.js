import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { close as closeWorkers } from './workers.js';
import { createClient } from './model/client.js';
import { registerJobs } from './api/jobs.js';

// The web server: the app from src/app/ as static files, the API under /api/. Plain node:http with a small
// router; a request body is read whole (a page or a recording), limited in size. One model client for the
// process, so every call of every job goes through the same queue.

const APP = path.join( config.root, 'src', 'app' );
const BODY_LIMIT = 32 * 1024 * 1024;
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
};

// Routes are method and path pattern; :name in the pattern becomes params.name.
export function createRouter() {
    const routes = [];
    return {
        add( method, pattern, handler ) {
            const regex = new RegExp( '^' + pattern.replace( /\//g, '\\/' ).replace( /:([a-z]+)/g, '(?<$1>[^/]+)' ) + '$' );
            routes.push( { method, regex, handler } );
        },
        match( method, pathname ) {
            for ( const r of routes ) {
                const m = method === r.method ? pathname.match( r.regex ) : null;
                if ( m ) {
                    return { handler: r.handler, params: m.groups || {} };
                }
            }
            return null;
        },
    };
}

export async function start( port = config.port ) {
    const router = createRouter();
    const client = createClient( config );
    registerJobs( router, client );
    const server = http.createServer( ( req, res ) => {
        handle( router, req, res ).catch( ( error ) => {
            respond( res, { status: 500, json: { error: error.message } } );
        } );
    } );
    await new Promise( ( resolve, reject ) => {
        server.once( 'error', reject );
        server.listen( port, resolve );
    } );
    return {
        server,
        port: server.address().port,
        close: () => new Promise( ( resolve ) => {
            server.close( () => {
                closeWorkers();
                resolve();
            } );
        } ),
    };
}

async function handle( router, req, res ) {
    const url = new URL( req.url, 'http://localhost' );
    const route = router.match( req.method, url.pathname );
    if ( route ) {
        const body = req.method === 'POST' || req.method === 'PUT' ? await readBody( req ) : null;
        if ( body === false ) {
            return respond( res, { status: 413, json: { error: 'body too large' } } );
        }
        return respond( res, await route.handler( { req, params: route.params, body, url } ) );
    }
    if ( url.pathname.startsWith( '/api/' ) ) {
        return respond( res, { status: 404, json: { error: 'no such route' } } );
    }
    return serveStatic( url.pathname, res );
}

// The whole body as a Buffer; false when it exceeds the limit.
function readBody( req ) {
    return new Promise( ( resolve, reject ) => {
        const chunks = [];
        let size = 0;
        req.on( 'data', ( chunk ) => {
            size += chunk.length;
            if ( size > BODY_LIMIT ) {
                req.destroy();
                resolve( false );
                return;
            }
            chunks.push( chunk );
        } );
        req.on( 'end', () => resolve( Buffer.concat( chunks ) ) );
        req.on( 'error', reject );
    } );
}

// A handler answers with { status, json } or { status, file, type }.
async function respond( res, answer ) {
    if ( answer.file ) {
        try {
            const data = await fs.readFile( answer.file );
            res.writeHead( answer.status, { 'Content-Type': answer.type, 'Content-Length': data.length } );
            res.end( data );
        } catch {
            respond( res, { status: 404, json: { error: 'not found' } } );
        }
        return;
    }
    const data = JSON.stringify( answer.json ?? null );
    res.writeHead( answer.status, { 'Content-Type': TYPES[ '.json' ], 'Content-Length': Buffer.byteLength( data ) } );
    res.end( data );
}

// Files of the app; nothing outside its folder, no listing. Without an app yet, a line of text.
async function serveStatic( pathname, res ) {
    const file = path.resolve( APP, '.' + ( pathname === '/' ? '/index.html' : decodeURIComponent( pathname ) ) );
    if ( file !== APP && !file.startsWith( APP + path.sep ) ) {
        return respond( res, { status: 404, json: { error: 'not found' } } );
    }
    try {
        const data = await fs.readFile( file );
        res.writeHead( 200, { 'Content-Type': TYPES[ path.extname( file ) ] || 'application/octet-stream', 'Content-Length': data.length } );
        res.end( data );
    } catch {
        if ( pathname === '/' ) {
            res.writeHead( 200, { 'Content-Type': 'text/plain; charset=utf-8' } );
            res.end( 'Trace is up. The app follows; the API answers under /api/.\n' );
            return;
        }
        respond( res, { status: 404, json: { error: 'not found' } } );
    }
}

if ( process.argv[ 1 ] && path.resolve( process.argv[ 1 ] ) === fileURLToPath( import.meta.url ) ) {
    const { port, close } = await start();
    console.log( 'Trace listening on http://localhost:' + port + ( config.apiKey ? '' : ' (no API_KEY: the reading step is skipped)' ) );
    for ( const signal of [ 'SIGINT', 'SIGTERM' ] ) {
        process.on( signal, async () => {
            await close();
            process.exit( 0 );
        } );
    }
}
