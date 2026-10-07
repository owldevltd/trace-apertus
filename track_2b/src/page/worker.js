import { parentPort } from 'node:worker_threads';
import { analyzePage } from './analyze.js';
import { drawGeometry, drawElements, drawFields } from './painter.js';
import { readImage, toGray } from './raster.js';
import { cropElement } from '../read/reader.js';
import { styleElements } from '../read/styler.js';
import { checkElements } from '../read/fluffy.js';

// Worker entry: one task per message, the result or the error goes back. Pixel work (geometry, crops, measuring
// and checking the read text, control images) runs here so the server's event loop stays free.
const tasks = {
    // page image → geometry, with a control image when asked
    analyze: async ( payload ) => {
        const result = await analyzePage( payload.file );
        if ( payload.control ) {
            await drawGeometry( payload.file, payload.control, result );
        }
        return result;
    },

    // page image + reading tasks → one PNG per task, keyed by the task key
    crops: async ( payload ) => {
        const image = await readImage( payload.file );
        const out = {};
        for ( const box of payload.boxes ) {
            out[ box.key ] = cropElement( image, box );
        }
        return out;
    },

    // read elements → with font size, colours and the Fluffy check; a control image when asked
    finish: async ( payload ) => {
        const image = await readImage( payload.file );
        const gray = toGray( image );
        const styled = styleElements( payload.page, image, gray, payload.elements );
        const elements = checkElements( styled, gray, image.width, image.height );
        if ( payload.control ) {
            await drawElements( payload.file, payload.control, elements );
        }
        return elements;
    },

    // fields and their blocks → control image
    paintFields: async ( payload ) => {
        await drawFields( payload.file, payload.control, payload.fields, payload.blocks );
        return true;
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
