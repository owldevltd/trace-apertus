import { parentPort } from 'node:worker_threads';
import { analyzePage } from './analyze.js';
import { drawGeometry } from './painter.js';

// Worker entry: one task per message, the result or the error goes back. The geometry is pure CPU work
// and runs here so the server's event loop stays free.
const tasks = {
    analyze: async ( payload ) => {
        const result = await analyzePage( payload.file );
        if ( payload.control ) {
            await drawGeometry( payload.file, payload.control, result );
        }
        return result;
    },
};

parentPort.on( 'message', async ( { task, payload } ) => {
    try {
        const result = await tasks[ task ]( payload );
        parentPort.postMessage( { result } );
    } catch ( error ) {
        parentPort.postMessage( { error: error.message } );
    }
} );
