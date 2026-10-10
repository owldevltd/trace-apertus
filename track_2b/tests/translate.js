import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';
import { createClient } from '../src/model/client.js';
import { LANGUAGE } from '../src/language.js';
import { LARGE } from '../src/review/catalogue.js';
import { buildUnits } from '../src/dialogue/units.js';
import { parse } from '../src/dialogue/writer.js';
import { translateDialogue, translateValues } from '../src/dialogue/translate.js';
import { plain } from '../src/fields/filler.js';
import { FORMS } from '../src/app/js/mock/forms.js';
import { DIALOGUES } from '../src/app/js/mock/dialogues.js';

// A form filled in in another language than it is printed in, measured on the two walk-through forms for French,
// Italian and English, with the code the app runs.
//
// The dialogue: the stored German questions, labels and options are translated, and a translated question
// counts when it passes the check against the form itself. In German all of them hold.
//
// The values: there and back. The made-up German values are put into the other language by the large model,
// which stands for what a person would have answered; the app's step brings them back, one value per call. The
// reference is the German value they started from. Counted apart: values the way there changed (they are
// language) and values it left alone (names, numbers, days). "Flagged" is what code holds against the
// person's words: other digits, or a difference of a character or two.
// Needs LLM_API_KEY; about 100 calls, six of them to the large model.
//
//   node tests/translate.js [--out=<file.md>]

const outFile = ( process.argv.find( ( a ) => a.startsWith( '--out=' ) ) || '' ).slice( 6 );
if ( !config.apiKey ) {
    console.log( 'no LLM_API_KEY: nothing to measure' );
    process.exit( 1 );
}

// character height of a page of the click-through, in its pixels at 300 dpi
const UNIT = 30;
const client = createClient( config );
const log = outFile ? path.join( path.dirname( outFile ), 'translate-model' ) : null;

// A form of the click-through as the pipeline would hand it on, with its stored dialogue.
function asJob( form, language ) {
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
    const job = { id: path.join( 'bench', 'translate' ), form: { name: form.name, language: 'de' }, language, pages: [ { n: 1, width: form.page.w, height: form.page.h, unit: UNIT } ], blocks, fields };
    const stored = new Map( DIALOGUES[ form.id ].map( ( u ) => [ u.id, u.question ] ) );
    job.dialogue = { units: buildUnits( job ).map( ( u ) => ( stored.get( u.id ) ? { ...u, question: stored.get( u.id ) } : u ) ) };
    return job;
}

let questions = '';
let values = '';
let moved = '';
let read = '';
for ( const language of [ 'fr', 'it', 'en' ] ) {
    const q = { asked: 0, hold: 0, labels: 0, labelled: 0, options: 0, optioned: 0, calls: 0 };
    const v = { language: 0, same: 0, other: 0, kept: 0, plain: 0, plainSame: 0, flagged: 0, calls: 0 };
    for ( const form of FORMS ) {
        // ---- the dialogue
        const job = asJob( form, language );
        let before = client.state.calls;
        const translation = await translateDialogue( job, language, client, log );
        q.calls += client.state.calls - before;
        for ( const u of job.dialogue.units ) {
            const own = translation.units[ u.id ] || {};
            q.asked += u.question ? 1 : 0;
            q.hold += own.question ? 1 : 0;
            q.labels += u.label ? 1 : 0;
            q.labelled += own.label ? 1 : 0;
            q.options += u.kind === 'choice' ? u.fields.length : 0;
            q.optioned += Object.keys( own.options || {} ).length;
            if ( u.question ) {
                read += '| ' + language + ' | ' + form.id + ' ' + u.id + ' | ' + u.question + ' | ' + ( own.question || '' ) + ' | ' + ( own.question ? '' : own.label || '–' ) + ' |\n';
            }
        }
        // ---- the values, there
        const written = job.fields.filter( ( f ) => f.kind !== 'checkbox' && f.kind !== 'radio' && f.kind !== 'signature' && ( form.values[ f.id ] || [ '' ] )[ 0 ] );
        const there = await client.ask( 'Unten stehen Angaben aus einem ausgefüllten deutschen Formular, je Feld die Beschriftung und der Wert.\n\n'
            + written.map( ( f ) => '- ' + f.id + ' | Beschriftung: ' + f.label + ' | Wert: ' + form.values[ f.id ][ 0 ] ).join( '\n' ) + '\n\n'
            + 'Gib jeden Wert so wieder, wie ihn eine Person angeben würde, die ' + LANGUAGE[ language ] + ' spricht: übersetze, was Sprache ist, ins ' + LANGUAGE[ language ] + '. '
            + 'Namen, Firmen, Adressen, Nummern und Daten bleiben unverändert.\nAntworte nur als JSON, ohne weiteren Text: {"werte": [{"feld": "name", "wert": "..."}]}',
            { room: 60 * written.length + 400, model: LARGE, log, tag: 'there ' + language + ' ' + form.id } );
        const said = Object.fromEntries( parse( there ? there.text : '', 'werte', 'feld', 'wert' ).map( ( e ) => [ e.feld, String( e.wert ?? '' ).trim() ] ) );
        // ---- and back, with the app's step
        job.fields = written.map( ( f ) => ( { ...f, value: said[ f.id ] || form.values[ f.id ][ 0 ], source: { how: 'entered', approve: false } } ) );
        before = client.state.calls;
        await translateValues( job, client, log );
        v.calls += client.state.calls - before;
        for ( const f of job.fields ) {
            const german = form.values[ f.id ][ 0 ];
            const given = f.source.said.value;
            const same = plain( f.value ) === plain( german );
            const flagged = !!f.source.said.check;
            v.flagged += flagged ? 1 : 0;
            if ( plain( given ) === plain( german ) ) {
                v.plain++;
                v.plainSame += same ? 1 : 0;
            } else {
                v.language++;
                v.same += same ? 1 : 0;
                v.kept += plain( f.value ) === plain( given ) ? 1 : 0;
                v.other += !same && plain( f.value ) !== plain( given ) ? 1 : 0;
            }
            if ( !same ) {
                moved += '| ' + language + ' | ' + form.id + ' ' + f.id + ' | ' + german + ' | ' + given + ' | ' + f.value.replace( /\|/g, '/' ) + ' | ' + ( flagged ? f.source.said.check : '' ) + ' |\n';
            }
        }
        if ( client.state.halted ) {
            console.log( 'halted by HTTP ' + client.state.halted );
            process.exit( 1 );
        }
    }
    questions += '| ' + LANGUAGE[ language ] + ' | ' + q.asked + ' | ' + q.hold + ' | ' + q.labelled + ' of ' + q.labels + ' | ' + q.optioned + ' of ' + q.options + ' | ' + q.calls + ' |\n';
    values += '| ' + LANGUAGE[ language ] + ' | ' + v.language + ' | ' + v.same + ' | ' + v.other + ' | ' + v.kept + ' | ' + v.plain + ' | ' + v.plainSame + ' | ' + v.flagged + ' | ' + v.calls + ' |\n';
    console.log( language + ': ' + JSON.stringify( { q, v } ) );
}

const md = '# A form in another language than its own\n\nGenerated by `tests/translate.js` on ' + new Date().toISOString().slice( 0, 10 ) + ' with ' + config.model + ' at temperature 0, ' + client.state.calls + ' calls '
    + '(six of them to ' + LARGE + ', for the way there). The two walk-through forms, printed in German.\n\n'
    + '## The dialogue, translated when the form is opened\n\nA translated question holds when both runs of the check name its own unit and no other unit is asked with the same words; '
    + 'where it does not, the translated label is asked. In German every one of these questions holds.\n\n'
    + '| language | questions | hold after translation | labels translated | options translated | calls |\n|---|---:|---:|---|---|---:|\n' + questions
    + '\n## The values, translated when the person goes on\n\nOne value per call; a value without a letter is not sent. Same = letters and digits as the German value it started from; '
    + 'another right word counts as "translated otherwise". Flagged = code found other digits than in what was said, or a difference of a character or two.\n\n'
    + '| language | values that are language | same as the German value | translated otherwise | left untranslated | names and numbers | stay the same | flagged by code | calls |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|\n' + values
    + '\n### Every value that did not come back as it started\n\n| language | field | German value | given in the other language | translated back | flagged |\n|---|---|---|---|---|---|\n' + moved
    + '\n### The questions, to read\n\n| language | unit | German | translated, when it holds | else asked with |\n|---|---|---|---|---|\n' + read;
console.log( '\n' + md.split( '### The questions, to read' )[ 0 ] );
if ( outFile ) {
    await fs.mkdir( path.dirname( outFile ), { recursive: true } );
    await fs.writeFile( outFile, md );
}
