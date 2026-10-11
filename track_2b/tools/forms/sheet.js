import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// A form sheet from a definition: title and note, sections of rows, each row a few cells on a twelve-column
// grid. Three looks: 'boxes' draws every field as an outlined box with its label in the top band, 'lines' prints
// the label and a writing line under it, 'sturdy' is a sheet to be printed and photographed: boxes in dark lines
// with dark labels, nothing tinted, the marks of a choice standing free, a section title sitting right on its
// first row, and the boxes of a section drawn as one grid: neighbours share their border. Two things decide
// that look. The geometry takes a line with free paper above it and a text near it for a writing line, so no
// border may have that: a title leaves no room over the boxes under it, and the sections stand apart. And on a
// photograph two borders a few points apart run into each other and into the labels beside them (tried 11
// October 2026 on made-up photographs: boxes with a gutter between them lost up to 3 of 24 fields and brought up
// to 7 twice). Every field is also an AcroForm widget without a border, sitting inside
// the drawn shape, so the print looks the same with or without the widgets. A table is a header row and rows of
// cells. Pages break between rows; a section title stays with its first row.
//
// A form can ask for more: `zoom` sets the whole sheet larger (type, boxes, margins), `logo` puts a wordmark over
// the title (a dot in a colour and a word), `plain` leaves the note under the title away (the footer still says
// what the sheet is). A row can be a statement to tick: a tick box, its sentence over as many lines as it takes,
// and a field behind it.

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

// The sheet being built, one at a time: how much larger than the plain layout it is set, and its page in the
// units of the layout. Everything is laid out as before and comes onto the paper times zoom.
let zoom = 1;
let PAGE = A4;

// the room between the cells of a row and between rows: none on a sturdy sheet
let gutter = GUTTER;
let gap = ROW_GAP;

// on a sturdy sheet: the size of a label, the band of a box that holds it, and the air over a row that is no box
const STURDY_LABEL = 8;
const STURDY_BAND = 13.5;
const AIR = 6;

export async function buildSheet( form ) {
    zoom = form.zoom || 1;
    PAGE = [ A4[ 0 ] / zoom, A4[ 1 ] / zoom ];
    gutter = form.style === 'sturdy' ? 0 : GUTTER;
    gap = form.style === 'sturdy' ? 0 : ROW_GAP;
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
            // over a statement a title keeps its distance: close together, the two are read as one text
            if ( sheet.style === 'sturdy' && section.rows[ 0 ].check ) {
                sheet.y += AIR + 2;
            }
        }
        for ( const row of section.rows ) {
            ensure( sheet, form, rowHeight( sheet, row ) );
            drawRow( sheet, row );
        }
        sheet.y += sheet.style === 'sturdy' ? 3 * SECTION_GAP : SECTION_GAP;
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
        if ( form.logo ) {
            dot( sheet, MARGIN + 4.5, sheet.y + 6.5, 4.5, rgb( ...form.logo.colour ) );
            text( sheet, form.logo.word, MARGIN + 13, sheet.y + 11, 13, 'bold', INK );
            sheet.y += 26;
        }
        text( sheet, form.title, MARGIN, sheet.y + 14, 17, 'bold', INK );
        if ( form.subtitle ) {
            text( sheet, form.subtitle, MARGIN, sheet.y + 27, 9, 'regular', GREY );
        }
        sheet.y += 34;
        const lines = form.plain ? [] : wrap( sheet, form.note, 'italic', SMALL, width() );
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
    if ( sheet.y + height > PAGE[ 1 ] - MARGIN - 10 ) {
        newPage( sheet, form );
    }
}

function footer( sheet, page, form, n, total ) {
    const y = PAGE[ 1 ] - MARGIN + 6;
    const font = sheet.fonts.italic;
    page.drawText( form.footer, { x: MARGIN * zoom, y: flip( y ), size: LABEL * zoom, font, color: GREY } );
    const label = 'Seite ' + n + ' / ' + total;
    page.drawText( label, { x: ( PAGE[ 0 ] - MARGIN - font.widthOfTextAtSize( label, LABEL ) ) * zoom, y: flip( y ), size: LABEL * zoom, font, color: GREY } );
}

// ---- rows ----

function width() {
    return PAGE[ 0 ] - 2 * MARGIN;
}

function column() {
    return ( width() - gutter * ( COLUMNS - 1 ) ) / COLUMNS;
}

function span( w ) {
    return w * column() + ( w - 1 ) * gutter;
}

function band( sheet ) {
    return sheet.style === 'sturdy' ? STURDY_BAND : BAND;
}

function cellHeight( sheet, lines ) {
    return sheet.style === 'lines' ? LABEL + 2 + lines * LINE : band( sheet ) + lines * LINE + 2;
}

// On a sturdy sheet a row that is no box stands clear of the grid over it: a text, the marks of a choice, a
// statement without a field behind it.
function air( sheet, row ) {
    const free = row.text || ( row.check && !row.after ) || ( row.cells && row.cells.some( ( c ) => c.options ) );
    return sheet.style === 'sturdy' && free ? AIR : 0;
}

function rowHeight( sheet, row ) {
    if ( row.heading ) {
        return 12;
    }
    if ( row.text ) {
        return air( sheet, row ) + wrap( sheet, row.text, 'regular', SMALL, width() ).length * ( SMALL + 2 ) + ROW_GAP;
    }
    if ( row.check ) {
        return air( sheet, row ) + checkHeight( sheet, row ) + ( row.after ? gap : ROW_GAP );
    }
    if ( row.table ) {
        const t = row.table;
        const rows = Array.isArray( t.rows ) ? t.rows.length : t.rows;
        return headHeight( sheet, t ) + rows * ( LINE + 5 ) + ROW_GAP;
    }
    return air( sheet, row ) + cellHeight( sheet, row.lines || 1 ) + gap;
}

function drawRow( sheet, row ) {
    if ( row.heading ) {
        text( sheet, row.heading, MARGIN, sheet.y + 9, 8, 'bold', INK );
        sheet.y += 12;
        return;
    }
    sheet.y += air( sheet, row );
    if ( row.text ) {
        for ( const l of wrap( sheet, row.text, 'regular', SMALL, width() ) ) {
            text( sheet, l, MARGIN, sheet.y + SMALL, SMALL, 'regular', sheet.style === 'sturdy' ? INK : GREY );
            sheet.y += SMALL + 2;
        }
        sheet.y += ROW_GAP;
        return;
    }
    if ( row.table ) {
        drawTable( sheet, row.table );
        return;
    }
    if ( row.check ) {
        drawCheck( sheet, row );
        return;
    }
    const lines = row.lines || 1;
    const h = cellHeight( sheet, lines );
    let x = MARGIN;
    for ( const cell of row.cells ) {
        const w = span( cell.w );
        drawCell( sheet, cell, x, sheet.y, w, h, lines );
        x += w + gutter;
    }
    sheet.y += h + gap;
}

function sectionTitle( sheet, section ) {
    const label = ( section.n ? section.n + '  ' : '' ) + section.title;
    if ( sheet.style === 'sturdy' ) {
        text( sheet, label, MARGIN, sheet.y + 8.5, 8.5, 'bold', INK );
        sheet.y += 10.5;
        return;
    }
    if ( sheet.style === 'boxes' ) {
        rect( sheet, MARGIN, sheet.y, width(), 12, { fill: TINT } );
        text( sheet, label, MARGIN + 3, sheet.y + 8.5, 8, 'bold', INK );
    } else {
        text( sheet, label, MARGIN, sheet.y + 8.5, 8.5, 'bold', INK );
        line( sheet, MARGIN, sheet.y + 11.5, MARGIN + width(), sheet.y + 11.5, 0.6, INK );
    }
    sheet.y += 16;
}

// ---- statements ----

// the width a statement has for its sentence: the row less the tick box and the field behind it
function checkWidth( row ) {
    return width() - MARK - 4 - ( row.after ? span( row.after.w ) + 6 : 0 );
}

function checkLines( sheet, row ) {
    return wrap( sheet, row.check.text, row.check.bold ? 'bold' : 'regular', SMALL, checkWidth( row ) );
}

// a statement with a field behind it is as high as that field, so the fields of statements under each other
// share their borders
function checkHeight( sheet, row ) {
    return row.after ? cellHeight( sheet, 1 ) : Math.max( checkLines( sheet, row ).length * ( SMALL + 2.5 ), MARK );
}

// A statement to tick: the box, its sentence, and behind it a field of its own where the row has one. The box
// stands at the first line of the sentence, and with a field behind it at the top of the row: the statement is
// read before the field that belongs to it.
function drawCheck( sheet, row ) {
    const h = checkHeight( sheet, row );
    const face = row.check.bold ? 'bold' : 'regular';
    const lines = checkLines( sheet, row );
    const top = sheet.y + ( row.after ? 2 : 1 );
    rect( sheet, MARGIN, top, MARK, MARK, { stroke: INK, width: 0.7 } );
    const box = sheet.form.createCheckBox( unique( sheet, row.check.name ) );
    // the widget inside the drawn frame, its own border in the colour of the paper: a border without a colour is
    // rendered as a hairline, and the box would be two frames
    box.addToPage( sheet.page, { x: ( MARGIN + 1.5 ) * zoom, y: flip( top + MARK - 1.5 ), width: ( MARK - 3 ) * zoom, height: ( MARK - 3 ) * zoom, borderWidth: 0, borderColor: rgb( 1, 1, 1 ), backgroundColor: undefined } );
    lines.forEach( ( l, i ) => {
        text( sheet, l, MARGIN + MARK + 4, top + SMALL - 0.5 + i * ( SMALL + 2.5 ), SMALL, face, INK );
    } );
    if ( row.after ) {
        const w = span( row.after.w );
        drawCell( sheet, row.after, MARGIN + width() - w, sheet.y, w, h, 1 );
    }
    sheet.y += h + ( row.after ? gap : ROW_GAP );
}

// ---- cells ----

// A cell: its frame (box or writing line), the label, and either a text widget or marks with their options.
function drawCell( sheet, cell, x, y, w, h, lines ) {
    const sturdy = sheet.style === 'sturdy';
    const boxes = sheet.style !== 'lines';
    if ( sturdy ) {
        // the marks of a choice stand free: a frame around them would be a field of its own on a photograph
        if ( !cell.options ) {
            rect( sheet, x, y, w, h, { stroke: INK, width: 0.7 } );
        }
    } else if ( boxes ) {
        rect( sheet, x, y, w, h, { stroke: RULE, width: 0.5 } );
    } else if ( !cell.options ) {
        line( sheet, x, y + h - 0.5, x + w, y + h - 0.5, 0.5, INK );
    }
    if ( cell.label ) {
        // on a sturdy sheet the label is set larger and keeps clear of the border: blurred, the two would be one shape
        const inset = sturdy && !cell.options ? [ 4, 2.5 ] : [ boxes ? 2 : 0, 0.5 ];
        const size = sturdy ? STURDY_LABEL : LABEL;
        text( sheet, fit( sheet, cell.label, 'regular', size, w - 4 - ( sturdy ? 4 : 0 ) ), x + inset[ 0 ], y + size + inset[ 1 ], size, 'regular', sturdy ? INK : GREY );
    }
    const top = y + ( boxes ? band( sheet ) : LABEL + 2 );
    const inner = h - ( boxes ? band( sheet ) + 1 : LABEL + 3 );
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
            group.addOptionToPage( option, sheet.page, { x: ( cx + 1.5 ) * zoom, y: flip( my + MARK - 1.5 ), width: ( MARK - 3 ) * zoom, height: ( MARK - 3 ) * zoom, borderWidth: 0 } );
        } else {
            rect( sheet, cx, my, MARK, MARK, { stroke: RULE, width: 0.5 } );
            const box = sheet.form.createCheckBox( unique( sheet, cell.name + ' ' + option ) );
            box.addToPage( sheet.page, { x: ( cx + 1 ) * zoom, y: flip( my + MARK - 1 ), width: ( MARK - 2 ) * zoom, height: ( MARK - 2 ) * zoom, borderWidth: 0, borderColor: undefined, backgroundColor: undefined } );
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
        x += w + gutter;
    }
    rows.forEach( ( r, i ) => {
        const y = sheet.y + head + i * rh;
        let cx = MARGIN;
        for ( const c of t.columns ) {
            const w = span( c.w );
            rect( sheet, cx, y, w + gutter, rh, { stroke: RULE, width: 0.4 } );
            if ( c.labels ) {
                text( sheet, fit( sheet, r.label || '', 'regular', SMALL, w - 4 ), cx + 2, y + rh / 2 + SMALL / 2 - 1, SMALL, 'regular', INK );
            } else if ( c.value ) {
                text( sheet, c.value, cx + 2, y + rh / 2 + SMALL / 2 - 1, SMALL, 'regular', INK );
            } else {
                textWidget( sheet, [ t.name, c.name || c.label, r.name ].filter( Boolean ).join( ' ' ), cx + 1.5, y + 1.5, w + gutter - 3, rh - 3, 1 );
            }
            cx += w + gutter;
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
    field.addToPage( sheet.page, { x: x * zoom, y: flip( y + h ), width: w * zoom, height: h * zoom, borderWidth: 0, borderColor: undefined, backgroundColor: undefined } );
    field.setFontSize( ( lines > 1 ? TEXT - 1 : TEXT ) * zoom );
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

// ---- drawing, in the units of the layout, with y measured from the top of the page ----

function flip( y ) {
    return A4[ 1 ] - y * zoom;
}

function text( sheet, s, x, baseline, size, face, color ) {
    sheet.page.drawText( s, { x: x * zoom, y: flip( baseline ), size: size * zoom, font: sheet.fonts[ face ], color } );
}

function rect( sheet, x, y, w, h, { stroke, width: bw, fill } ) {
    sheet.page.drawRectangle( { x: x * zoom, y: flip( y + h ), width: w * zoom, height: h * zoom, borderColor: stroke, borderWidth: stroke ? bw * zoom : 0, color: fill } );
}

function line( sheet, x1, y1, x2, y2, thickness, color ) {
    sheet.page.drawLine( { start: { x: x1 * zoom, y: flip( y1 ) }, end: { x: x2 * zoom, y: flip( y2 ) }, thickness: thickness * zoom, color } );
}

function circle( sheet, cx, cy, r, color ) {
    sheet.page.drawCircle( { x: cx * zoom, y: flip( cy ), size: r * zoom, borderColor: color, borderWidth: 0.5 * zoom, color: undefined } );
}

function dot( sheet, cx, cy, r, color ) {
    sheet.page.drawCircle( { x: cx * zoom, y: flip( cy ), size: r * zoom, color } );
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
