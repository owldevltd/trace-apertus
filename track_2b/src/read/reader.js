import fs from 'node:fs/promises';
import path from 'node:path';
import { cropImage, scaleImage } from '../page/raster.js';
import { encodePng } from '../page/png.js';

// Reading: every element the geometry could not name ("unknown") goes to the model as a single crop with a little
// margin, and the model answers two things: does it contain picture parts, and what text stands in it. One element
// per call: bundled, the model loses type and assignment (measured 4 October 2026). A text with several tick marks
// in it ("Stellung: ☐ Höheres Kader ☐ Mittleres Kader …") is read per mark, so every box gets the words beside it.
// Answers are cached per element, so a rerun only asks what it has not asked before.
//
// A tick mark that stands alone, not in a row with its words, comes out of the geometry twice: as the mark and
// as an unknown object with the very same box. There is nothing to read in it. Measured 11 October 2026 on a
// photographed page with 31 tick boxes in a column of their own: 31 of its 81 calls went to these boxes and all
// 31 answers were empty; without them the page gives the same 54 fields, character for character. On the first
// page of the Suva form it is 4 of 76.

const MARGIN = 12;

// Wider images are scaled down by the service anyway.
const MAX_WIDTH = 1240;

// Below this many character heights (larger side) the picture-parts answer does not count: for a crop the size of
// one glyph ("1.", "—") the model reports picture parts where there are none.
const TINY = 2.0;

// A line of type is lower than this many character heights. For a crop that low the picture-parts answer does
// not count when the model read text in it: asked about a short word alone ("PLZ", "Ort", "Beruf", "Datum"), it
// says picture parts as for a glyph. Measured 11 October 2026 on four uploads of one sheet read by the model:
// of the 10 crops with text and the answer "picture parts" that were lower than this, outside any tick mark, all
// 10 were a printed label (0.9 to 1.2 character heights), 6 of them too wide to count as tiny; the 4 others
// were the wordmark (1.9 to 2.2), which stays a picture. On the three pages of the reading bench the rule turns
// 3 of 8 pictures into text, all three printed labels ("Tag" twice, "Betroffener Körperteil:"). Set by the
// assistant, open.
const LINE_HIGH = 1.6;

// A speck: lower than this many character heights, or smaller than one in both directions. Photographed
// pages leave such crumbs of broken lines; no glyph is that small, so they are not sent to the model.
const SPECK = 0.6;

// A segment of an option row narrower than this many character heights carries no label.
const SEGMENT = 0.5;

// The wording the measurements were made with, kept as it is (German, like the forms); the answer is JSON.
const PROMPT = 'Das Bild ist ein Ausschnitt aus einem Dokument, ein einzelnes Element. Beantworte zwei Dinge. '
    + 'bildanteile: Hat das Element Bildanteile (Logo, Foto, Zeichnung, Grafik)? '
    + 'text: der Text im Element, exakt wiedergegeben, ohne Kästchen und Kreise; steht kein Text darin, "". '
    + 'Antworte nur als JSON: {"bildanteile": true oder false, "text": "..."}';

// For an empty crop the model sometimes hands the prompt back as the text.
const ECHO = 'Ausschnitt aus einem Dokument';

// What a page needs read: one task per unknown element that could carry text, or one per segment of an
// element that holds several tick marks; none for an element that is a tick mark and nothing else.
// A task: { key, i, part?, x, y, width, height }.
export function toRead( page ) {
    const u = page.unit;
    const marks = page.elements.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' );
    const list = [];
    page.elements.forEach( ( e, i ) => {
        if ( e.type !== 'unknown' || e.height < SPECK * u || ( e.width < u && e.height < u ) ) {
            return;
        }
        // the box of a tick mark, listed a second time
        if ( marks.some( ( m ) => m.x === e.x && m.y === e.y && m.width === e.width && m.height === e.height ) ) {
            return;
        }
        const inside = marks.filter( ( m ) => within( m, e ) ).sort( ( a, b ) => a.x - b.x );
        if ( inside.length < 2 ) {
            list.push( { key: String( i ), i, x: e.x, y: e.y, width: e.width, height: e.height } );
            return;
        }
        // cut the row at every mark's left edge; the part before the first mark is a segment of its own
        const cuts = [ e.x, ...inside.map( ( m ) => m.x ).filter( ( x ) => x > e.x + SEGMENT * u ), e.x + e.width ];
        let part = 0;
        for ( let k = 0; k < cuts.length - 1; k++ ) {
            const width = cuts[ k + 1 ] - cuts[ k ];
            if ( width >= SEGMENT * u ) {
                list.push( { key: i + '-' + part, i, part, x: cuts[ k ], y: e.y, width, height: e.height } );
                part++;
            }
        }
    } );
    return list;
}

// The crop of one task as a PNG, with margin, no wider than the service keeps. CPU work: runs in a worker.
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

// Reads the unknown elements of a page. page: the analyze result; crops: PNG per task key; client: the model door;
// cacheDir: where the answer per task is kept; log: where the client writes the raw exchange. Returns the elements
// with content, type and isOCR (an option row split into its segments), and how many calls were made.
export async function readElements( page, crops, client, cacheDir, log = null ) {
    await fs.mkdir( cacheDir, { recursive: true } );
    const marks = page.elements.filter( ( e ) => e.type === 'checkbox' || e.type === 'radio' );
    const read = new Map();
    let calls = 0;
    for ( const task of toRead( page ) ) {
        if ( !crops[ task.key ] ) {
            continue;
        }
        const file = path.join( cacheDir, task.key + '.json' );
        let text = null;
        try {
            text = JSON.parse( await fs.readFile( file, 'utf8' ) ).text;
        } catch {
            const answer = await client.ask( PROMPT, { image: crops[ task.key ], room: 800, log, tag: page.file + ' #' + task.key } );
            if ( answer === null ) {
                continue;
            }
            calls++;
            text = answer.text;
            await fs.writeFile( file, JSON.stringify( { text, http: answer.http, usage: answer.usage, finish: answer.finish } ) );
        }
        const a = parse( text );
        let content = typeof a.text === 'string' ? a.text.trim() : '';
        if ( content.includes( ECHO ) ) {
            content = '';
        }
        const box = { type: 'unknown', content: '', x: task.x, y: task.y, width: task.width, height: task.height };
        // A box or circle inside the element looks like a graphic to the model; the geometry already knows it.
        const mark = marks.some( ( m ) => within( m, box ) );
        const tiny = Math.max( box.width, box.height ) < TINY * page.unit;
        const word = content !== '' && box.height < LINE_HIGH * page.unit;
        if ( a.bildanteile === true && !mark && !tiny && !word ) {
            box.type = 'image';
        } else if ( content !== '' ) {
            box.type = 'text';
        }
        box.content = content;
        // the text was read from the image, not taken from a text layer
        box.isOCR = true;
        if ( !read.has( task.i ) ) {
            read.set( task.i, [] );
        }
        read.get( task.i ).push( box );
    }
    const elements = [];
    page.elements.forEach( ( e, i ) => {
        if ( read.has( i ) ) {
            elements.push( ...read.get( i ) );
        } else {
            elements.push( { ...e } );
        }
    } );
    return { elements, calls };
}

// The centre of a lies in b.
function within( a, b ) {
    const cx = a.x + a.width / 2;
    const cy = a.y + a.height / 2;
    return cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height;
}

// The answer as JSON, with the fences and chatter the model sometimes adds stripped off. An answer that is no
// JSON because of one bad escape is still an answer: seen 11 October 2026, "w\u00fünsche" for "wünsche" in an
// otherwise right reading of a whole sentence, which was lost with it. Then the two values are taken out by
// their names.
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
                return loose( m[ 0 ] );
            }
        }
        return {};
    }
}

// The two values of an answer that is not quite JSON: escapes that are whole are resolved, the stump of one
// that is not goes.
function loose( text ) {
    const t = text.match( /"text"\s*:\s*"([\s\S]*)"\s*\}\s*$/ );
    if ( !t ) {
        return {};
    }
    const picture = text.match( /"bildanteile"\s*:\s*(true|false)/ );
    const content = t[ 1 ]
        .replace( /\\u([0-9a-fA-F]{4})/g, ( _, hex ) => String.fromCharCode( parseInt( hex, 16 ) ) )
        .replace( /\\u[0-9a-fA-F]{0,3}/g, '' )
        .replace( /\\n/g, '\n' )
        .replace( /\\(["\\\/])/g, '$1' );
    return { bildanteile: picture ? picture[ 1 ] === 'true' : undefined, text: content };
}
