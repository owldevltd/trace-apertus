import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// A form sheet from a definition: title and note, sections of rows, each row a few cells on a twelve-column
// grid. Two looks: 'boxes' draws every field as an outlined box with its label in the top band, 'lines' prints
// the label and a writing line under it. Every field is also an AcroForm widget without a border, sitting inside
// the drawn shape, so the print looks the same with or without the widgets. A table is a header row and rows of
// cells. Pages break between rows; a section title stays with its first row.

const A4 = [ 595.28, 841.89 ];
const MARGIN = 36;
const COLUMNS = 12;
const GUTTER = 4;
const ROW_GAP = 3;
const SECTION_GAP = 5;
const LABEL = 6.5;
const SMALL = 7.5;
const TEXT = 9;
const LINE = 12;
const BAND = 9;
const MARK = 8;
const INK = rgb( 0.1, 0.1, 0.1 );
const GREY = rgb( 0.4, 0.4, 0.4 );
const RULE = rgb( 0.55, 0.55, 0.55 );
const TINT = rgb( 0.92, 0.92, 0.92 );

export async function buildSheet( form ) {
    const doc = await PDFDocument.create();
    const sheet = {
        doc,
        form: doc.getForm(),
        style: form.style,
        fonts: {
            regular: await doc.embedFont( StandardFonts.Helvetica ),
            bold: await doc.embedFont( StandardFonts.HelveticaBold ),
            italic: await doc.embedFont( StandardFonts.HelveticaOblique ),
        },
        page: null,
        y: 0,
        names: new Set(),
        groups: new Map(),
    };
    newPage( sheet, form );
    for ( const section of form.sections ) {
        const head = section.title ? 16 : 0;
        ensure( sheet, form, head + rowHeight( sheet, section.rows[ 0 ] ) );
        if ( section.title ) {
            sectionTitle( sheet, section );
        }
        for ( const row of section.rows ) {
            ensure( sheet, form, rowHeight( sheet, row ) );
            drawRow( sheet, row );
        }
        sheet.y += SECTION_GAP;
    }
    const pages = doc.getPages();
    pages.forEach( ( page, i ) => footer( sheet, page, form, i + 1, pages.length ) );
    doc.setTitle( form.title );
    doc.setLanguage( 'de-CH' );
    doc.setProducer( 'Trace' );
    return doc.save();
}

// ---- pages ----

function newPage( sheet, form ) {
    sheet.page = sheet.doc.addPage( A4 );
    sheet.y = MARGIN;
    const first = sheet.doc.getPageCount() === 1;
    if ( first ) {
        text( sheet, form.title, MARGIN, sheet.y + 14, 17, 'bold', INK );
        if ( form.subtitle ) {
            text( sheet, form.subtitle, MARGIN, sheet.y + 27, 9, 'regular', GREY );
        }
        sheet.y += 34;
        const lines = wrap( sheet, form.note, 'italic', SMALL, width() );
        lines.forEach( ( l ) => {
            text( sheet, l, MARGIN, sheet.y + SMALL, SMALL, 'italic', GREY );
            sheet.y += SMALL + 2;
        } );
        sheet.y += 5;
    } else {
        text( sheet, form.title + ' – Fortsetzung', MARGIN, sheet.y + 9, 9, 'bold', INK );
        sheet.y += 20;
    }
}

function ensure( sheet, form, height ) {
    if ( sheet.y + height > A4[ 1 ] - MARGIN - 10 ) {
        newPage( sheet, form );
    }
}

function footer( sheet, page, form, n, total ) {
    const y = A4[ 1 ] - MARGIN + 6;
    const font = sheet.fonts.italic;
    page.drawText( form.footer, { x: MARGIN, y: A4[ 1 ] - y, size: LABEL, font, color: GREY } );
    const label = 'Seite ' + n + ' / ' + total;
    page.drawText( label, { x: A4[ 0 ] - MARGIN - font.widthOfTextAtSize( label, LABEL ), y: A4[ 1 ] - y, size: LABEL, font, color: GREY } );
}

// ---- rows ----

function width() {
    return A4[ 0 ] - 2 * MARGIN;
}

function column() {
    return ( width() - GUTTER * ( COLUMNS - 1 ) ) / COLUMNS;
}

function span( w ) {
    return w * column() + ( w - 1 ) * GUTTER;
}

function cellHeight( sheet, lines ) {
    return sheet.style === 'boxes' ? BAND + lines * LINE + 2 : LABEL + 2 + lines * LINE;
}

function rowHeight( sheet, row ) {
    if ( row.heading ) {
        return 12;
    }
    if ( row.text ) {
        return wrap( sheet, row.text, 'regular', SMALL, width() ).length * ( SMALL + 2 ) + ROW_GAP;
    }
    if ( row.table ) {
        const t = row.table;
        const rows = Array.isArray( t.rows ) ? t.rows.length : t.rows;
        return headHeight( sheet, t ) + rows * ( LINE + 5 ) + ROW_GAP;
    }
    return cellHeight( sheet, row.lines || 1 ) + ROW_GAP;
}

function drawRow( sheet, row ) {
    if ( row.heading ) {
        text( sheet, row.heading, MARGIN, sheet.y + 9, 8, 'bold', INK );
        sheet.y += 12;
        return;
    }
    if ( row.text ) {
        for ( const l of wrap( sheet, row.text, 'regular', SMALL, width() ) ) {
            text( sheet, l, MARGIN, sheet.y + SMALL, SMALL, 'regular', GREY );
            sheet.y += SMALL + 2;
        }
        sheet.y += ROW_GAP;
        return;
    }
    if ( row.table ) {
        drawTable( sheet, row.table );
        return;
    }
    const lines = row.lines || 1;
    const h = cellHeight( sheet, lines );
    let x = MARGIN;
    for ( const cell of row.cells ) {
        const w = span( cell.w );
        drawCell( sheet, cell, x, sheet.y, w, h, lines );
        x += w + GUTTER;
    }
    sheet.y += h + ROW_GAP;
}

function sectionTitle( sheet, section ) {
    const label = ( section.n ? section.n + '  ' : '' ) + section.title;
    if ( sheet.style === 'boxes' ) {
        rect( sheet, MARGIN, sheet.y, width(), 12, { fill: TINT } );
        text( sheet, label, MARGIN + 3, sheet.y + 8.5, 8, 'bold', INK );
    } else {
        text( sheet, label, MARGIN, sheet.y + 8.5, 8.5, 'bold', INK );
        line( sheet, MARGIN, sheet.y + 11.5, MARGIN + width(), sheet.y + 11.5, 0.6, INK );
    }
    sheet.y += 16;
}

// ---- cells ----

// A cell: its frame (box or writing line), the label, and either a text widget or marks with their options.
function drawCell( sheet, cell, x, y, w, h, lines ) {
    const boxes = sheet.style === 'boxes';
    if ( boxes ) {
        rect( sheet, x, y, w, h, { stroke: RULE, width: 0.5 } );
    } else if ( !cell.options ) {
        line( sheet, x, y + h - 0.5, x + w, y + h - 0.5, 0.5, INK );
    }
    if ( cell.label ) {
        text( sheet, fit( sheet, cell.label, 'regular', LABEL, w - 4 ), x + ( boxes ? 2 : 0 ), y + LABEL + 0.5, LABEL, 'regular', GREY );
    }
    const top = y + ( boxes ? BAND : LABEL + 2 );
    const inner = h - ( boxes ? BAND + 1 : LABEL + 3 );
    if ( cell.options ) {
        drawOptions( sheet, cell, x + ( boxes ? 3 : 0 ), top, w, inner );
        return;
    }
    if ( cell.name ) {
        textWidget( sheet, cell.name, x + ( boxes ? 1.5 : 0 ), top, w - ( boxes ? 3 : 0 ), inner, lines );
    }
}

// Marks in a row with their option text; a radio group when the cell is a radio, one tick box per option
// otherwise. An `after` field follows the last option.
function drawOptions( sheet, cell, x, top, w, inner ) {
    const radio = cell.kind === 'radio';
    const baseline = top + inner / 2 + SMALL / 2 - 1;
    const my = top + inner / 2 - MARK / 2;
    let cx = x;
    const group = radio ? radioGroup( sheet, cell.name ) : null;
    cell.options.forEach( ( option ) => {
        if ( radio ) {
            circle( sheet, cx + MARK / 2, my + MARK / 2, MARK / 2, RULE );
            group.addOptionToPage( option, sheet.page, { x: cx + 1.5, y: flip( my + MARK - 1.5 ), width: MARK - 3, height: MARK - 3, borderWidth: 0 } );
        } else {
            rect( sheet, cx, my, MARK, MARK, { stroke: RULE, width: 0.5 } );
            const box = sheet.form.createCheckBox( unique( sheet, cell.name + ' ' + option ) );
            box.addToPage( sheet.page, { x: cx + 1, y: flip( my + MARK - 1 ), width: MARK - 2, height: MARK - 2, borderWidth: 0, borderColor: undefined, backgroundColor: undefined } );
        }
        text( sheet, option, cx + MARK + 3, baseline, SMALL, 'regular', INK );
        cx += MARK + 3 + sheet.fonts.regular.widthOfTextAtSize( option, SMALL ) + 10;
    } );
    if ( cell.after ) {
        const fw = Math.min( cell.after.width || 60, x + w - cx - 2 );
        if ( fw > 20 ) {
            line( sheet, cx, my + MARK, cx + fw, my + MARK, 0.5, INK );
            textWidget( sheet, cell.after.name, cx, my - 3, fw, MARK + 3, 1 );
            if ( cell.after.unit ) {
                text( sheet, cell.after.unit, cx + fw + 3, baseline, SMALL, 'regular', INK );
            }
        }
    }
}

// ---- tables ----

function headHeight( sheet, t ) {
    const deep = Math.max( ...t.columns.map( ( c ) => c.label.split( '\n' ).length ) );
    return deep * ( LABEL + 1.5 ) + 4;
}

// Header row with the column labels, then the rows: a label column prints the row's label, a value column a
// constant, every other column a text widget named after the table, the column and the row.
function drawTable( sheet, t ) {
    const head = headHeight( sheet, t );
    const rows = Array.isArray( t.rows ) ? t.rows : Array.from( { length: t.rows }, ( _, i ) => ( { name: String( i + 1 ) } ) );
    const rh = LINE + 5;
    const total = head + rows.length * rh;
    let x = MARGIN;
    rect( sheet, MARGIN, sheet.y, width(), head, { fill: TINT } );
    for ( const c of t.columns ) {
        const w = span( c.w );
        c.label.split( '\n' ).forEach( ( l, i ) => {
            text( sheet, fit( sheet, l, 'regular', LABEL, w - 4 ), x + 2, sheet.y + 3 + ( i + 1 ) * ( LABEL + 1.5 ) - 1.5, LABEL, 'regular', INK );
        } );
        x += w + GUTTER;
    }
    rows.forEach( ( r, i ) => {
        const y = sheet.y + head + i * rh;
        let cx = MARGIN;
        for ( const c of t.columns ) {
            const w = span( c.w );
            rect( sheet, cx, y, w + GUTTER, rh, { stroke: RULE, width: 0.4 } );
            if ( c.labels ) {
                text( sheet, fit( sheet, r.label || '', 'regular', SMALL, w - 4 ), cx + 2, y + rh / 2 + SMALL / 2 - 1, SMALL, 'regular', INK );
            } else if ( c.value ) {
                text( sheet, c.value, cx + 2, y + rh / 2 + SMALL / 2 - 1, SMALL, 'regular', INK );
            } else {
                textWidget( sheet, [ t.name, c.name || c.label, r.name ].filter( Boolean ).join( ' ' ), cx + 1.5, y + 1.5, w + GUTTER - 3, rh - 3, 1 );
            }
            cx += w + GUTTER;
        }
    } );
    sheet.y += total + ROW_GAP;
}

// ---- widgets ----

function textWidget( sheet, name, x, y, w, h, lines ) {
    const field = sheet.form.createTextField( unique( sheet, name ) );
    if ( lines > 1 ) {
        field.enableMultiline();
    }
    // the widget first: the font size lives in the appearance string the widget brings
    field.addToPage( sheet.page, { x, y: flip( y + h ), width: w, height: h, borderWidth: 0, borderColor: undefined, backgroundColor: undefined } );
    field.setFontSize( lines > 1 ? TEXT - 1 : TEXT );
}

function radioGroup( sheet, name ) {
    if ( !sheet.groups.has( name ) ) {
        sheet.groups.set( name, sheet.form.createRadioGroup( name ) );
        sheet.names.add( name );
    }
    return sheet.groups.get( name );
}

// pdf-lib refuses a second field of the same name; a repeated name gets a count
function unique( sheet, name ) {
    let n = name;
    let i = 2;
    while ( sheet.names.has( n ) ) {
        n = name + ' ' + i++;
    }
    sheet.names.add( n );
    return n;
}

// ---- drawing, with y measured from the top of the page ----

function flip( y ) {
    return A4[ 1 ] - y;
}

function text( sheet, s, x, baseline, size, face, color ) {
    sheet.page.drawText( s, { x, y: flip( baseline ), size, font: sheet.fonts[ face ], color } );
}

function rect( sheet, x, y, w, h, { stroke, width: bw, fill } ) {
    sheet.page.drawRectangle( { x, y: flip( y + h ), width: w, height: h, borderColor: stroke, borderWidth: stroke ? bw : 0, color: fill } );
}

function line( sheet, x1, y1, x2, y2, thickness, color ) {
    sheet.page.drawLine( { start: { x: x1, y: flip( y1 ) }, end: { x: x2, y: flip( y2 ) }, thickness, color } );
}

function circle( sheet, cx, cy, r, color ) {
    sheet.page.drawCircle( { x: cx, y: flip( cy ), size: r, borderColor: color, borderWidth: 0.5, color: undefined } );
}

// the text shortened to the width, with an ellipsis
function fit( sheet, s, face, size, w ) {
    const font = sheet.fonts[ face ];
    if ( font.widthOfTextAtSize( s, size ) <= w ) {
        return s;
    }
    let t = s;
    while ( t.length > 1 && font.widthOfTextAtSize( t + '…', size ) > w ) {
        t = t.slice( 0, -1 );
    }
    return t.trimEnd() + '…';
}

function wrap( sheet, s, face, size, w ) {
    const font = sheet.fonts[ face ];
    const lines = [];
    let current = '';
    for ( const word of s.split( ' ' ) ) {
        const next = current ? current + ' ' + word : word;
        if ( font.widthOfTextAtSize( next, size ) > w && current ) {
            lines.push( current );
            current = word;
        } else {
            current = next;
        }
    }
    if ( current ) {
        lines.push( current );
    }
    return lines;
}
