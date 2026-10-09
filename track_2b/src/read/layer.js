import { toRead } from './reader.js';

// Reading from the text layer instead of the model: a shipped form comes with the words of its PDF and where
// their ink stands on the page, so nothing has to be read from the image. The same tasks as for the model: every
// unknown element, or every segment of a row with several tick marks, takes the words whose ink centre lies in
// it. An element without words stays unknown.

// A tick box printed with a symbol font comes out of the text layer as a letter of whatever script its code
// point falls in (on the Suva form a Hangul syllable): a single letter that is not Latin is such a glyph and no
// word. The geometry has found the box itself.
const GLYPH = /^[^\p{Script=Latin}\p{N}\p{P}\p{S}\s]$/u;

// page: the analyze result; words: [ { t, line, x, ink: { x, y, w, h } } ] of that page.
// Returns the elements as the reader hands them on, with isOCR false.
export function layerElements( page, words ) {
    const inked = words.filter( ( w ) => w.ink && !GLYPH.test( w.t ) ).map( ( w ) => ( { ...w, cx: w.ink.x + Math.floor( w.ink.w / 2 ), cy: w.ink.y + Math.floor( w.ink.h / 2 ) } ) );
    const read = new Map();
    for ( const task of toRead( page ) ) {
        const inside = inked.filter( ( w ) => w.cx >= task.x && w.cx <= task.x + task.width && w.cy >= task.y && w.cy <= task.y + task.height )
            .sort( ( a, b ) => a.line - b.line || a.x - b.x );
        const content = inside.map( ( w ) => w.t ).join( ' ' );
        const box = { type: content ? 'text' : 'unknown', content, x: task.x, y: task.y, width: task.width, height: task.height, isOCR: false };
        read.set( task.i, [ ...( read.get( task.i ) || [] ), box ] );
    }
    const elements = [];
    page.elements.forEach( ( e, i ) => {
        if ( read.has( i ) ) {
            elements.push( ...read.get( i ) );
        } else {
            elements.push( { ...e } );
        }
    } );
    return elements;
}
