import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, StandardFonts, rgb } from 'pdf-lib';

// The filled form as a PDF. A fillable original gets its own form fields written (text, box, radio), so the
// recipient's reader shows them as fields; everything the original has no field for, and every photographed
// page, gets the value drawn at the field's place. A photographed form becomes a new PDF with the straightened
// page as picture and the values on top. Nothing is flattened: the person who signs still sees a form.

// page pixels at 300 dpi → points
const PT = 72 / 300;

// text drawn into a box: at most this size, this share of the box height
const MAX_SIZE = 10;
const BOX_SHARE = 0.6;

const A4 = [ 595.28, 841.89 ];

// job: the job; original: bytes of the fillable PDF or null; pages: PNG bytes per page for the picture.
export async function writeOutput( job, { original = null, pages = [] } ) {
    const doc = original ? await PDFDocument.load( original, { ignoreEncryption: true } ) : await PDFDocument.create();
    const font = await doc.embedFont( StandardFonts.Helvetica );
    if ( !original ) {
        for ( const png of pages ) {
            const image = await doc.embedPng( png );
            const width = A4[ 0 ];
            const height = width * image.height / image.width;
            const page = doc.addPage( [ width, height ] );
            page.drawImage( image, { x: 0, y: 0, width, height } );
        }
    }
    const form = original ? doc.getForm() : null;
    const drawn = [];
    for ( const f of job.fields ) {
        if ( !f.value ) {
            continue;
        }
        if ( form && f.widget && fillWidget( form, f ) ) {
            continue;
        }
        drawn.push( f );
    }
    for ( const f of drawn ) {
        draw( doc, job, f, font );
    }
    if ( form ) {
        try {
            form.updateFieldAppearances( font );
        } catch {
            // an appearance the standard font cannot draw: the value is still in the field
        }
    }
    doc.setTitle( job.form.name );
    doc.setProducer( 'Trace' );
    return doc.save();
}

// Writes the value into the original's field of that name; false when the field is not there or not of a kind
// we can fill.
function fillWidget( form, f ) {
    let field;
    try {
        field = form.getField( f.widget );
    } catch {
        return false;
    }
    try {
        if ( field instanceof PDFTextField ) {
            const max = field.getMaxLength();
            field.setText( encodable( max ? f.value.slice( 0, max ) : f.value ) );
            return true;
        }
        if ( field instanceof PDFCheckBox ) {
            if ( f.value === 'x' ) {
                field.check();
            } else {
                field.uncheck();
            }
            return true;
        }
        if ( field instanceof PDFRadioGroup ) {
            if ( f.value !== 'x' ) {
                return true;
            }
            // the group's options follow its widgets; ours is the widget whose box lies where the field lies
            const widgets = field.acroField.getWidgets();
            const page = pageOf( form.doc, widgets[ 0 ] );
            const height = page ? page.getHeight() : A4[ 1 ];
            const cx = ( f.x + f.width / 2 ) * PT;
            const cy = height - ( f.y + f.height / 2 ) * PT;
            let best = null;
            let dist = Infinity;
            widgets.forEach( ( w ) => {
                const r = w.getRectangle();
                const d = Math.hypot( r.x + r.width / 2 - cx, r.y + r.height / 2 - cy );
                if ( d < dist ) {
                    dist = d;
                    best = w;
                }
            } );
            // the option names run in the order of the widgets, whether the group stores them as names or as
            // numbered export values
            const option = field.getOptions()[ widgets.indexOf( best ) ];
            if ( option !== undefined ) {
                field.select( option );
            }
            return true;
        }
        if ( field instanceof PDFDropdown ) {
            if ( field.getOptions().includes( f.value ) ) {
                field.select( f.value );
                return true;
            }
            return false;
        }
    } catch {
        return false;
    }
    return false;
}

function pageOf( doc, widget ) {
    const ref = widget.P();
    return doc.getPages().find( ( p ) => p.ref === ref ) || doc.getPages()[ 0 ] || null;
}

// The value drawn at the field's place on its page; a mark becomes a cross.
function draw( doc, job, f, font ) {
    const page = doc.getPages()[ ( f.page || 1 ) - 1 ];
    const size = job.pages.find( ( p ) => p.n === ( f.page || 1 ) );
    if ( !page || !size ) {
        return;
    }
    const sx = page.getWidth() / size.width;
    const sy = page.getHeight() / size.height;
    const x = f.x * sx;
    const y = page.getHeight() - ( f.y + f.height ) * sy;
    const w = f.width * sx;
    const h = f.height * sy;
    const mark = f.kind === 'checkbox' || f.kind === 'radio';
    if ( mark ) {
        const s = Math.min( h, w ) * 0.9;
        page.drawText( 'X', { x: x + ( w - s * 0.7 ) / 2, y: y + ( h - s * 0.72 ) / 2, size: s, font, color: rgb( 0.08, 0.08, 0.07 ) } );
        return;
    }
    const lines = encodable( f.value ).split( /\r?\n/ );
    const fontSize = Math.min( MAX_SIZE, Math.max( 6, h * BOX_SHARE / Math.max( 1, lines.length ) ) );
    lines.forEach( ( line, i ) => {
        page.drawText( fit( line, font, fontSize, w - 6 ), { x: x + 3, y: y + h - fontSize * ( i + 1 ) * 1.2 + fontSize * 0.2, size: fontSize, font, color: rgb( 0.08, 0.08, 0.07 ) } );
    } );
}

// the line shortened with an ellipsis to the box width
function fit( line, font, size, width ) {
    if ( font.widthOfTextAtSize( line, size ) <= width ) {
        return line;
    }
    let s = line;
    while ( s.length > 1 && font.widthOfTextAtSize( s + '…', size ) > width ) {
        s = s.slice( 0, -1 );
    }
    return s + '…';
}

// the standard fonts know WinAnsi: anything else becomes a question mark rather than an error
function encodable( text ) {
    return String( text ).replace( /[^\u0000-ÿ€–—‘’‚“”„•…‰ŠšŽžŒœŸˆ˜ƒ†‡™]/g, '?' );
}
