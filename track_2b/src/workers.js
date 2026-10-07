import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// CPU work (page geometry, rendering) runs in worker threads so the event loop stays free for requests.
// One pool, sized to the cores minus one; a task is a plain message { task, payload } and resolves with the result.

const file = path.join( path.dirname( fileURLToPath( import.meta.url ) ), 'page', 'worker.js' );
const size = Math.max( 1, availableParallelism() - 1 );
const idle = [];
const queue = [];
let spawned = 0;

export function run( task, payload ) {
    return new Promise( ( resolve, reject ) => {
        queue.push( { task, payload, resolve, reject } );
        next();
    } );
}

function next() {
    if ( !queue.length ) {
        return;
    }
    let worker = idle.pop();
    if ( !worker && spawned < size ) {
        worker = new Worker( file );
        spawned++;
    }
    if ( !worker ) {
        return;
    }
    const item = queue.shift();
    const done = ( message ) => {
        worker.off( 'message', done );
        worker.off( 'error', fail );
        idle.push( worker );
        if ( message.error ) {
            item.reject( new Error( message.error ) );
        } else {
            item.resolve( message.result );
        }
        next();
    };
    const fail = ( error ) => {
        worker.off( 'message', done );
        spawned--;
        item.reject( error );
        next();
    };
    worker.on( 'message', done );
    worker.on( 'error', fail );
    worker.postMessage( { task: item.task, payload: item.payload } );
}

export function close() {
    for ( const worker of idle ) {
        worker.terminate();
    }
    idle.length = 0;
    spawned = 0;
}
