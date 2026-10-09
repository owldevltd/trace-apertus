import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';
import { createClient } from '../src/model/client.js';
import { buildDialogue } from '../src/dialogue/dialogue.js';
import { FORMS } from '../src/app/js/mock/forms.js';

// The dialogues of the click-through's forms, built by the code the pipeline runs for a captured form: units by
// code, one question per unit from the small model, checked twice. A form of the click-through is defined by
// hand and has no text blocks its labels rest on, so its section titles and labels become the lines of the list,
// in the order of the definition. One call per form to write, two per twelve questions to check.
// Writes src/app/js/mock/dialogues.js; a preparation step, its result is committed. Needs API_KEY.
//
//   node --env-file=.env tools/dialogue.js

// character height of a page of the click-through, in its pixels at 300 dpi
const UNIT = 30;

const target = path.join( config.root, 'src', 'app', 'js', 'mock', 'dialogues.js' );

if ( !config.apiKey ) {
    console.log( 'no API_KEY: nothing to write' );
    process.exit( 1 );
}

// A form of the click-through as the pipeline would hand it on: one line per section title and per label.
function asJob( form ) {
    const blocks = [];
    const fields = [];
    const line = ( content ) => {
        blocks.push( { id: 'b' + ( blocks.length + 1 ), page: 1, type: 'text', content, x: 0, y: 10 * blocks.length, width: 10, height: 10 } );
        return blocks[ blocks.length - 1 ].id;
    };
    for ( const s of form.sections ) {
        line( s.title );
        for ( const f of s.fields ) {
            fields.push( { id: f.id, label: f.label, kind: f.kind, page: 1, x: f.x, y: f.y, width: f.w, height: f.h, labelBlock: line( f.label ), ...( f.group ? { group: f.group, option: f.option } : {} ) } );
        }
    }
    return { form: { name: form.name }, pages: [ { n: 1, width: form.page.w, height: form.page.h, unit: UNIT } ], blocks, fields };
}

const quote = ( s ) => '\'' + s.replace( /\\/g, '\\\\' ).replace( /'/g, '\\\'' ) + '\'';

const client = createClient( config );
const log = path.join( config.storageDir, 'tools', 'dialogue', 'model' );
let out = '// The dialogues of the click-through\'s forms: their fields in units, each with the printed label and, where one\n'
    + '// holds, a plain question. Written by tools/dialogue.js on ' + new Date().toISOString().slice( 0, 10 ) + ' with ' + config.model + ', checked twice;\n'
    + '// not edited by hand. A unit without a question is asked with its label.\n\n'
    + 'export const DIALOGUES = {\n';
for ( const form of FORMS ) {
    const before = client.state.calls;
    const { dialogue, written } = await buildDialogue( asJob( form ), client, log );
    out += '    ' + ( /^[a-z_$][\w$]*$/i.test( form.id ) ? form.id : quote( form.id ) ) + ': [\n';
    for ( const u of dialogue.units ) {
        out += '        { id: ' + quote( u.id ) + ', kind: ' + quote( u.kind ) + ', fields: [ ' + u.fields.map( quote ).join( ', ' ) + ' ], label: ' + quote( u.label )
            + ( u.kind === 'table' ? ', rows: ' + u.rows + ', columns: ' + u.columns : '' )
            + ( u.question ? ', question: ' + quote( u.question ) : '' ) + ' },\n';
    }
    out += '    ],\n';
    console.log( form.id + ': ' + dialogue.units.length + ' units, ' + Object.keys( written ).length + ' questions written, ' + dialogue.units.filter( ( u ) => u.question ).length + ' hold, '
        + ( client.state.calls - before ) + ' calls' );
    for ( const u of dialogue.units ) {
        console.log( '  ' + u.id + ' ' + ( u.question ? 'holds  ' : written[ u.id ] ? 'no     ' : 'none   ' ) + u.label.slice( 0, 40 ).padEnd( 40 ) + ' | ' + ( written[ u.id ] || '' ) );
    }
    if ( client.state.halted ) {
        console.log( 'halted by HTTP ' + client.state.halted + ': nothing written' );
        process.exit( 1 );
    }
}
out += '};\n';
await fs.writeFile( target, out );
console.log( 'written ' + target + ', ' + client.state.calls + ' calls' );
