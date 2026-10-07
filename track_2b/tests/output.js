import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { writeOutput } from '../src/output/pdf.js';

// The filled PDF, without a model: values written into the fields of the fillable Betreibungsbegehren and read
// back; a photographed page as a new PDF with the values drawn on it.
//
//   node tests/output.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};

// a job on the fillable original: text fields by widget name, the radio by its place, one drawn value
const original = await fs.readFile( path.join( root, 'data/forms/betreibungsbegehren/form.pdf' ) );
const job = {
    id: 'test',
    form: { name: 'Betreibungsbegehren', language: 'de', pages: 2, origin: 'original', file: 'forms/betreibungsbegehren/form.pdf' },
    pages: [ { n: 1, width: 2481, height: 3509 }, { n: 2, width: 2481, height: 3509 } ],
    fields: [
        { id: 'f1', label: 'Schuldner', kind: 'multiline', page: 1, x: 148, y: 550, width: 973, height: 193, widget: 'Schuldner', value: 'Peter Hartmann, Via Nova 14, 7013 Domat/Ems' },
        { id: 'f2', label: 'IBAN', kind: 'text', page: 1, x: 1298, y: 1242, width: 1076, height: 92, widget: 'IBAN', value: 'CH93 0076 2011 6238 5295 7' },
        { id: 'f3', label: 'des Vertreters', kind: 'radio', page: 1, x: 1601, y: 1131, width: 56, height: 56, widget: 'Zahlungsverbindung', value: 'x' },
        { id: 'f4', label: 'Datum und Unterschrift', kind: 'text', page: 1, x: 1286, y: 3180, width: 1088, height: 150, value: 'Chur, 7. Oktober 2026 – Caduff' },
        { id: 'f5', label: 'leer', kind: 'text', page: 1, x: 10, y: 10, width: 100, height: 30, widget: 'Fallreferenz', value: '' },
    ],
    history: [],
};
const bytes = await writeOutput( job, { original } );
check( bytes.length > original.length / 2, 'filled original written (' + bytes.length + ' bytes)' );
const back = await PDFDocument.load( bytes );
const form = back.getForm();
check( form.getTextField( 'Schuldner' ).getText() === job.fields[ 0 ].value, 'Schuldner reads back from its form field' );
check( form.getTextField( 'IBAN' ).getText() === job.fields[ 1 ].value, 'IBAN reads back from its form field' );
const selected = form.getRadioGroup( 'Zahlungsverbindung' ).getSelected();
check( !!selected, 'radio group Zahlungsverbindung has a selection (' + selected + ')' );
check( form.getTextField( 'Fallreferenz' ).getText() === undefined, 'an empty value leaves the field empty' );
check( back.getPageCount() === 2, 'both pages kept' );
check( back.getTitle() === 'Betreibungsbegehren', 'title set' );

// a photographed form: the page picture with values on it
const png = await fs.readFile( path.join( root, 'data/forms/suva-bagatellunfall/suva-bagatellunfall-uvg-s1.png' ) );
const photo = {
    id: 'test2',
    form: { name: 'Bagatellunfall-Meldung UVG', language: 'de', pages: 1, origin: 'original' },
    pages: [ { n: 1, width: 2481, height: 3697 } ],
    fields: [
        { id: 'f1', label: 'Tel.-Nr.', kind: 'text', page: 1, x: 1390, y: 574, width: 368, height: 62, value: '041 728 40 10' },
        { id: 'f2', label: 'rechts', kind: 'checkbox', page: 1, x: 1810, y: 2356, width: 28, height: 28, value: 'x' },
        { id: 'f3', label: 'Hergang', kind: 'multiline', page: 1, x: 472, y: 1492, width: 1772, height: 592, value: 'Beim Abladen einer Palette ausgerutscht\nund auf das rechte Handgelenk gestürzt.' },
    ],
    history: [],
};
const flat = await writeOutput( photo, { pages: [ png ] } );
const flatDoc = await PDFDocument.load( flat );
check( flatDoc.getPageCount() === 1 && flat.length > 100000, 'photographed page becomes a one-page PDF with the picture (' + flat.length + ' bytes)' );
await fs.mkdir( path.join( root, 'storage', 'tests' ), { recursive: true } );
await fs.writeFile( path.join( root, 'storage', 'tests', 'output-original.pdf' ), bytes );
await fs.writeFile( path.join( root, 'storage', 'tests', 'output-photo.pdf' ), flat );
console.log( 'written storage/tests/output-original.pdf and output-photo.pdf' );
process.exit( failed ? 1 : 0 );
