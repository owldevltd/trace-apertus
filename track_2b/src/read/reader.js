import fs from 'node:fs/promises';
import path from 'node:path';
import { cropImage, scaleImage } from '../page/raster.js';
import { encodePng } from '../page/png.js';

// Reading: every element the geometry could not name ("unknown") goes to the model as a single crop with a little
// margin, and the model answers two things: does it contain picture parts, and what text stands in it. One element
// per call: bundled, the model loses type and assignment (measured 4 October 2026). Answers are cached per element,
// so a rerun only asks what it has not asked before.

const MARGIN = 12;

// Wider images are scaled down by the service anyway.
const MAX_WIDTH = 1240;

// Below this many character heights (larger side) the picture-parts answer does not count: for a crop the size of
// one glyph ("1.", "—") the model reports picture parts where there are none.
const TINY = 2.0;

// The wording the measurements were made with, kept as it is (German, like the forms); the answer is JSON.
const PROMPT = 'Das Bild ist ein Ausschnitt aus einem Dokument, ein einzelnes Element. Beantworte zwei Dinge. '
    + 'bildanteile: Hat das Element Bildanteile (Logo, Foto, Zeichnung, Grafik)? '
    + 'text: der Text im Element, exakt wiedergegeben, ohne Kästchen und Kreise; steht kein Text darin, "". '
    + 'Antworte nur als JSON: {"bildanteile": true oder false, "text": "..."}';

// The elements a page needs read: index and box of every unknown one.
export function toRead( page ) {
    const list = [];
    page.elements.forEach( ( e, i ) => {
        if ( e.type === 'unknown' ) {
            list.push( { i, x: e.x, y: e.y, width: e.width, height: e.height } );
        }
    } );
    return list;
}

// The crop of one element as a PNG, with margin, no wider than the service keeps. CPU work: runs in a worker.
export function cropElement( image, e ) {
    const x = Math.max( 0, e.x - MARGIN );
    const y = Math.max( 0, e.y - MARGIN );
    const w = Math.min( image.width - x, e.width + 2 * MARGIN );
    const h = Math.min( image.height - y, e.height + 2 * MARGIN );
    let part = cropImage( image, x, y, w, h );
    if ( part.width > MAX_WIDTH ) {
        part = scaleImage( part, MAX_WIDTH );
    }
    return encodePng( part.width, part.height, part.data );
}

// Reads the unknown elements of a page. page: the analyze result; crops: PNG per element index; client: the model
// door; cacheDir: where the answer per element is kept; log: where the client writes the raw exchange.
// Returns the elements with content, type and isOCR, and how many calls were made.
export async function readElements( page, crops, client, cacheDir, log = null ) {
    const elements = page.elements.map( ( e ) => ( { ...e } ) );
    await fs.mkdir( cacheDir, { recursive: true } );
    let calls = 0;
    for ( let i = 0; i < elements.length; i++ ) {
        const e = elements[ i ];
        if ( e.type !== 'unknown' || !crops[ i ] ) {
            continue;
        }
        const file = path.join( cacheDir, i + '.json' );
        let text = null;
        try {
            text = JSON.parse( await fs.readFile( file, 'utf8' ) ).text;
        } catch {
            const answer = await client.ask( PROMPT, { image: crops[ i ], room: 800, log, tag: page.file + ' #' + i } );
            if ( answer === null ) {
                continue;
            }
            calls++;
            text = answer.text;
            await fs.writeFile( file, JSON.stringify( { text, http: answer.http, usage: answer.usage, finish: answer.finish } ) );
        }
        const a = parse( text );
        const content = typeof a.text === 'string' ? a.text.trim() : '';

        // A box or circle inside the element looks like a graphic to the model; the geometry already knows it.
        const mark = elements.some( ( k ) => ( k.type === 'checkbox' || k.type === 'radio' )
            && k.x + k.width / 2 >= e.x && k.x + k.width / 2 <= e.x + e.width && k.y + k.height / 2 >= e.y && k.y + k.height / 2 <= e.y + e.height );
        const tiny = Math.max( e.width, e.height ) < TINY * page.unit;
        if ( a.bildanteile === true && !mark && !tiny ) {
            e.type = 'image';
        } else if ( content !== '' ) {
            e.type = 'text';
        }
        e.content = content;
        // the text was read from the image, not taken from a text layer
        e.isOCR = true;
    }
    return { elements, calls };
}

// The answer as JSON, with the fences and chatter the model sometimes adds stripped off.
function parse( text ) {
    const cleaned = ( text || '' ).replace( /^```(?:json)?\s*|\s*```$/gm, '' ).trim();
    try {
        return JSON.parse( cleaned );
    } catch {
        const m = cleaned.match( /\{[\s\S]*\}/ );
        if ( m ) {
            try {
                return JSON.parse( m[ 0 ] );
            } catch {
                return {};
            }
        }
        return {};
    }
}
