import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from 'pdf-lib';
import { decodePng } from '../../src/page/png.js';

// The reference JSON for one page of a form, in the shape the tests read: words with line and block from the
// text layer (poppler's pdftotext), the ink box of each word measured on the page image, and the AcroForm
// widgets with type and name. Coordinates are pixels of the page image.

const run = promisify( execFile );

// a pixel darker than this is ink
const INK = 160;

export async function pageReference( pdfFile, pngFile, page, { source, lang = 'de' } ) {
    const png = decodePng( await fs.readFile( pngFile ) );
    const pdf = await fs.readFile( pdfFile );
    const words = await wordsOf( pdfFile, page, png );
    return {
        source,
        page,
        kind: 'form',
        lang,
        dpi: 300,
        width: png.width,
        height: png.height,
        words,
        images: [],
        widgets: await widgetsOf( pdf, page, png ),
    };
}

// Words with poppler's line and block numbers; the box is the font box, ink the box of what is dark inside it.
async function wordsOf( pdfFile, page, png ) {
    const { stdout } = await run( 'pdftotext', [ '-bbox-layout', '-f', String( page ), '-l', String( page ), pdfFile, '-' ], { maxBuffer: 64 * 1024 * 1024 } );
    const size = stdout.match( /<page width="([\d.]+)" height="([\d.]+)"/ );
    if ( !size ) {
        return [];
    }
    const fx = png.width / parseFloat( size[ 1 ] );
    const fy = png.height / parseFloat( size[ 2 ] );
    const re = /<(block|line|word) xMin="([-\d.]+)" yMin="([-\d.]+)" xMax="([-\d.]+)" yMax="([-\d.]+)">(?:([^<]*)<\/word>)?/g;
    const words = [];
    let block = -1;
    let line = -1;
    let m;
    while ( ( m = re.exec( stdout ) ) ) {
        if ( m[ 1 ] === 'block' ) {
            block++;
            continue;
        }
        if ( m[ 1 ] === 'line' ) {
            line++;
            continue;
        }
        const x = Math.round( parseFloat( m[ 2 ] ) * fx );
        const y = Math.round( parseFloat( m[ 3 ] ) * fy );
        const w = Math.round( parseFloat( m[ 4 ] ) * fx ) - x;
        const h = Math.round( parseFloat( m[ 5 ] ) * fy ) - y;
        if ( w < 1 || h < 1 ) {
            continue;
        }
        words.push( { x, y, w, h, t: decode( m[ 6 ] || '' ), line, block, ink: ink( png, x, y, w, h ) } );
    }
    return words;
}

function decode( s ) {
    return s.replace( /&(amp|lt|gt|quot|apos|#(\d+)|#x([0-9a-fA-F]+));/g, ( _, name, dec, hex ) => {
        if ( dec ) {
            return String.fromCodePoint( parseInt( dec, 10 ) );
        }
        if ( hex ) {
            return String.fromCodePoint( parseInt( hex, 16 ) );
        }
        return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[ name ];
    } );
}

// the box of the dark pixels inside a box, or null when nothing dark is there
function ink( png, x, y, w, h ) {
    let l = Infinity;
    let r = -1;
    let t = -1;
    let b = -1;
    const x1 = Math.min( png.width, x + w );
    const y1 = Math.min( png.height, y + h );
    for ( let row = Math.max( 0, y ); row < y1; row++ ) {
        for ( let col = Math.max( 0, x ); col < x1; col++ ) {
            const i = ( row * png.width + col ) * 3;
            const grey = 0.2126 * png.data[ i ] + 0.7152 * png.data[ i + 1 ] + 0.0722 * png.data[ i + 2 ];
            if ( grey < INK ) {
                l = Math.min( l, col );
                r = Math.max( r, col );
                if ( t < 0 ) {
                    t = row;
                }
                b = row;
            }
        }
    }
    return r < 0 ? null : { x: l, y: t, w: r - l + 1, h: b - t + 1 };
}

// The widgets of the page: one entry per widget, radios of a group all under the group's name, as the
// originals have it.
async function widgetsOf( pdf, page, png ) {
    const doc = await PDFDocument.load( pdf );
    const pages = doc.getPages();
    const target = pages[ page - 1 ];
    if ( !target ) {
        return [];
    }
    const fx = png.width / target.getWidth();
    const fy = png.height / target.getHeight();
    const out = [];
    for ( const field of doc.getForm().getFields() ) {
        const typ = field instanceof PDFTextField ? 'text'
            : field instanceof PDFCheckBox ? 'checkbox'
                : field instanceof PDFRadioGroup ? 'radio'
                    : field instanceof PDFDropdown ? 'auswahl' : null;
        if ( !typ ) {
            continue;
        }
        for ( const widget of field.acroField.getWidgets() ) {
            const ref = widget.P();
            if ( ref && ref !== target.ref ) {
                continue;
            }
            const r = widget.getRectangle();
            const x = Math.round( r.x * fx );
            const y = Math.round( ( target.getHeight() - r.y - r.height ) * fy );
            out.push( { x, y, w: Math.round( ( r.x + r.width ) * fx ) - x, h: Math.round( ( target.getHeight() - r.y ) * fy ) - y, typ, name: field.getName() } );
        }
    }
    return out.sort( ( a, b ) => a.y - b.y || a.x - b.x );
}
