import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';
import { createClient } from '../src/model/client.js';
import { invalid, applyEdit, rebuild, askFresh, planned, unkinded } from '../src/fields/editor.js';
import { pages as kindPages, predictKinds } from '../src/fields/predictor.js';
import { buildUnits, repeats } from '../src/dialogue/units.js';
import { listShipped } from '../src/shipped.js';

// Sets the fields of the shipped forms right, the way a person does it in the mask in which a form is corrected,
// and through the same code: what the pipeline found is a proposal, and a form that ships should not carry its
// mistakes. Two sources say what is right, and neither is the pipeline:
//
// The PDF. A fillable form knows its fields: every form field of the PDF is one field, at most one, of the
// kind the PDF gives it. A place the geometry took for a field without a form field behind it is none (a
// section bar, a footer, an office note); two fields on one form field are one; a form field the geometry
// found no box for becomes a field at its place; a box that reaches over other form fields takes the place of
// its own; radio buttons share the group the PDF gives them. A signature stays, the PDF has no field for it.
//
// data/forms/<form>/corrections.json, where a form has one: what a person says about a form field, by its name
// in the PDF ("Name/2" for the second radio button of a group, in reading order): label, kind, option, group,
// question, required, values, as the mask takes them. Left out means: as found.
//
// A form that is not fillable has no form fields to go by: there the pipeline's fields stand, and the corrections
// name a field by its id. "remove": true takes a field away that is none; "copies" lists the pages that only
// repeat another page or are filled in by somebody else, so that none of their fields is kept; "add" puts a
// field where the pipeline found none, with its page, place, label and kind.
//
// The job is put together anew as after any correction: the units from the fields as they now stand, each
// keeping its question where its fields are the same; only a unit whose fields or labels changed gets a new
// question from the model, written and checked like the others, and the kind of a field that is new or named
// anew is proposed. Running it again changes nothing and calls nothing. Needs LLM_API_KEY.
//
// Last, the dialogue of every form in the other languages of the app: data/forms/translations.json holds the
// labels, options and questions by their German wording, translated by hand, and each form gets its questions,
// labels and options from it (dialogue.translations). A shipped form then opens in French, Italian or English
// at once, without the model translating it first. A text the table does not have stays as the form has it.
//
//   node --env-file=.env tools/correct.js [--plan] [<form> …]      --plan: say what would change, write nothing

const only = process.argv.slice( 2 ).filter( ( a ) => !a.startsWith( '--' ) );
const plan = process.argv.includes( '--plan' );
if ( !plan && !config.apiKey ) {
    console.log( 'no LLM_API_KEY: the changed questions could not be written' );
    process.exit( 1 );
}
const client = createClient( config );
const KIND = { text: 'text', checkbox: 'checkbox', radio: 'radio', unterschrift: 'signature' };
const SAID = [ 'label', 'kind', 'option', 'group', 'question', 'required', 'values' ];
const area = ( a, b ) => Math.max( 0, Math.min( a.x + a.width, b.x + b.width ) - Math.max( a.x, b.x ) ) * Math.max( 0, Math.min( a.y + a.height, b.y + b.height ) - Math.max( a.y, b.y ) );
const share = ( a, b ) => area( a, b ) / ( a.width * a.height + b.width * b.height - area( a, b ) );
const within = ( w, f ) => w.x + w.width / 2 > f.x && w.x + w.width / 2 < f.x + f.width && w.y + w.height / 2 > f.y && w.y + w.height / 2 < f.y + f.height;

for ( const form of ( await listShipped() ).filter( ( f ) => !only.length || only.includes( f.id ) ) ) {
    const dir = path.join( config.dataDir, 'forms', form.id );
    const file = path.join( dir, 'captured.json' );
    const job = { ...JSON.parse( await fs.readFile( file, 'utf8' ) ), id: 'correct-' + form.id, history: [] };
    const widgets = await formFields( dir );
    const given = await corrections( dir );
    const said = given.fields || {};
    const copies = given.copies || [];
    const fillable = widgets.length > 0;
    if ( !fillable && !Object.keys( said ).length && !copies.length && !( given.add || [] ).length ) {
        console.log( form.id.padEnd( 28 ) + ' no form fields in the PDF and no corrections: left as it is' );
        continue;
    }
    // a field that was taken away before is not there to be found again
    const unknown = Object.keys( said ).filter( ( key ) => ( fillable ? !widgets.some( ( w ) => w.key === key ) : !said[ key ].remove && !job.fields.some( ( f ) => f.id === key ) ) );
    if ( unknown.length ) {
        console.log( form.id + ': corrections.json names ' + ( fillable ? 'form fields the PDF does not have: ' : 'fields the form does not have: ' ) + unknown.join( ', ' ) );
        process.exit( 1 );
    }
    const before = JSON.stringify( job.fields );
    const was = { fields: job.fields.length, units: job.dialogue.units.length };
    const count = { bare: 0, double: 0, placed: 0 };
    // every form field takes the built field that lies on it best
    const owner = new Map();
    const taken = new Set();
    for ( const w of widgets ) {
        const mine = job.fields.filter( ( f ) => f.page === w.page && f.widget === w.name && !taken.has( f.id ) && area( f, w ) > 0 ).sort( ( a, b ) => share( b, w ) - share( a, w ) );
        if ( mine.length ) {
            owner.set( mine[ 0 ].id, w );
            taken.add( mine[ 0 ].id );
        }
    }
    // radio buttons the geometry grouped as the PDF does keep their group: no reason for a new question
    const agrees = ( w ) => {
        const mine = job.fields.filter( ( f ) => owner.get( f.id )?.name === w.name );
        const group = mine[ 0 ].group;
        return !!group && mine.every( ( f ) => f.kind === 'radio' && f.group === group ) && !job.fields.some( ( f ) => f.group === group && !mine.includes( f ) );
    };
    const edit = [];
    for ( const f of job.fields ) {
        const w = owner.get( f.id );
        const kept = { id: f.id, page: f.page, x: f.x, y: f.y, width: f.width, height: f.height, label: f.label, kind: f.kind, option: f.option, group: f.group };
        if ( !fillable ) {
            if ( copies.includes( f.page ) || ( said[ f.id ] && said[ f.id ].remove ) ) {
                count.bare++;
            } else {
                edit.push( { ...kept, ...told( said[ f.id ] ) } );
            }
            continue;
        }
        if ( !w ) {
            if ( f.kind === 'signature' ) {
                edit.push( kept );
            } else {
                count[ f.widget ? 'double' : 'bare' ]++;
            }
            continue;
        }
        const over = widgets.some( ( x ) => x !== w && x.page === f.page && within( x, f ) );
        count.placed += over ? 1 : 0;
        edit.push( { ...kept, ...( over ? { x: w.x, y: w.y, width: w.width, height: w.height } : {} ), ...( w.typ === 'radio' && !agrees( w ) ? { kind: 'radio', group: w.name } : {} ), ...told( said[ w.key ] ) } );
    }
    const added = widgets.filter( ( w ) => ![ ...owner.values() ].includes( w ) );
    for ( const w of added ) {
        edit.push( { page: w.page, x: w.x, y: w.y, width: w.width, height: w.height, label: '', kind: KIND[ w.typ ] || 'text', ...( w.typ === 'radio' ? { group: w.name } : {} ), ...told( said[ w.key ] ), formField: w.name } );
    }
    // what a person puts on the page where nothing was found; where a field lies there already, it was added before
    const put = ( given.add || [] ).filter( ( e ) => !edit.some( ( x ) => x.page === e.page && area( x, e ) * 2 > e.width * e.height ) );
    edit.push( ...put.map( ( e ) => ( { ...e } ) ) );
    const wrong = invalid( job, { fields: edit } );
    if ( wrong ) {
        console.log( form.id + ': ' + wrong );
        process.exit( 1 );
    }
    // the print is right and only the place a label was taken from was not: a field whose label is set here
    // carries it itself, and the text of the page stays as it is printed
    for ( const e of edit.filter( ( x ) => x.id ) ) {
        const f = job.fields.find( ( x ) => x.id === e.id );
        if ( f.label && e.label !== f.label ) {
            delete f.labelBlock;
        }
    }
    const change = applyEdit( job, { fields: edit } );
    // a field put on a form field writes into it
    for ( const e of edit.filter( ( x ) => x.formField ) ) {
        job.fields.find( ( f ) => f.id === e.id ).widget = e.formField;
    }
    // the fields stand, but the rules may put them into other units than the form keeps (a date in three boxes
    // that is one question now): then the job is put together anew like after a correction
    const grouping = ( list ) => list.map( ( u ) => u.kind + ':' + u.fields.join( ',' ) + ( u.parts || '' ) ).join( '|' );
    if ( JSON.stringify( job.fields ) === before && grouping( buildUnits( job ) ) === grouping( job.dialogue.units ) ) {
        // the fields stand; what a table is by its labels is said anew, in case the rule for it is newer than the form
        const lists = [];
        for ( const u of job.dialogue.units.filter( ( x ) => x.kind === 'table' ) ) {
            const is = repeats( u.fields.map( ( id ) => job.fields.find( ( f ) => f.id === id ) ), u.columns );
            if ( is !== !!u.repeat ) {
                lists.push( u.id );
                if ( is ) {
                    u.repeat = true;
                } else {
                    delete u.repeat;
                }
            }
        }
        // and what a person says about a question stands, as when it is typed into the mask: a question written
        // by hand is not checked, an empty one lets the label be asked, required is the person's word
        const asked = [];
        for ( const e of edit.filter( ( x ) => x.id && ( typeof x.question === 'string' || typeof x.required === 'boolean' ) ) ) {
            const u = job.dialogue.units.find( ( x ) => x.fields.includes( e.id ) );
            const question = typeof e.question === 'string' ? e.question.replace( /\s+/g, ' ' ).trim() : null;
            if ( question !== null && question !== ( u.question || '' ) ) {
                asked.push( u.id );
                if ( question ) {
                    u.question = question;
                    u.by = 'person';
                } else {
                    delete u.question;
                    delete u.by;
                }
            }
            if ( typeof e.required === 'boolean' && e.required !== !!u.required ) {
                asked.push( u.id );
                if ( e.required ) {
                    u.required = true;
                } else {
                    delete u.required;
                }
            }
        }
        if ( ( lists.length || asked.length ) && !plan ) {
            await fs.writeFile( file, JSON.stringify( { schema: job.schema, form: job.form, pages: job.pages, blocks: job.blocks, fields: job.fields, dialogue: job.dialogue } ) + '\n' );
        }
        console.log( form.id.padEnd( 28 ) + ( asked.length ? ' fields stand; ' + new Set( asked ).size + ' questions set by hand' : ' nothing to correct' )
            + ( lists.length ? '; ' + lists.join( ', ' ) + ' marked anew as a list of entries or as none' : '' ) );
        continue;
    }
    const fresh = rebuild( job, { fields: edit }, change );
    const kinds = unkinded( job, change );
    const calls = planned( fresh ) + ( kinds ? kindPages( job, job.dialogue.units, kinds ).length : 0 );
    const units = job.dialogue.units;
    console.log( form.id.padEnd( 28 ) + ' fields ' + was.fields + ' → ' + job.fields.length + ' (' + count.bare + ( fillable ? ' without a form field and ' : ' that are none or stand on a copy page and ' ) + count.double + ' double taken away, ' + ( added.length + put.length ) + ' added, '
        + count.placed + ' moved to their form field, ' + change.named.size + ' named anew), ' + job.fields.filter( ( f ) => !f.label ).length + ' without a label; units ' + was.units + ' → ' + units.length
        + ', ' + units.filter( ( u ) => u.skip ).length + ' not asked; ' + fresh.length + ' questions to write, ' + calls + ' calls' );
    if ( plan ) {
        // what a person would want to see before saying yes: the labels that were another one
        for ( const f of job.fields.filter( ( x ) => change.named.has( x.id ) ) ) {
            const old = JSON.parse( before ).find( ( x ) => x.id === f.id ).label;
            if ( old ) {
                console.log( '    ' + f.id + ': "' + old + '" → "' + f.label + '"' );
            }
        }
        continue;
    }
    const start = client.state.calls;
    await askFresh( job, fresh, client, null );
    if ( kinds ) {
        await predictKinds( job, units, client, null, kinds );
    }
    if ( client.state.halted ) {
        console.log( form.id + ': halted by HTTP ' + client.state.halted + ', nothing kept' );
        process.exit( 1 );
    }
    await fs.writeFile( file, JSON.stringify( { schema: job.schema, form: job.form, pages: job.pages, blocks: job.blocks, fields: job.fields, dialogue: job.dialogue } ) + '\n' );
    console.log( ''.padEnd( 28 ) + ' kept; ' + fresh.filter( ( u ) => u.question ).length + ' of ' + fresh.length + ' questions written, ' + ( client.state.calls - start ) + ' calls' );
}

// ---- the other languages: from the table, without the model
const table = await texts();
for ( const form of ( await listShipped() ).filter( ( f ) => !only.length || only.includes( f.id ) ) ) {
    const file = path.join( config.dataDir, 'forms', form.id, 'captured.json' );
    const captured = JSON.parse( await fs.readFile( file, 'utf8' ) );
    const fields = new Map( captured.fields.map( ( f ) => [ f.id, f ] ) );
    const missing = new Set();
    const said = ( text, language ) => {
        const row = table[ text ];
        if ( !row || !row[ language ] ) {
            missing.add( text );
        }
        return row && row[ language ] || null;
    };
    // a label that says two things with a colon between them is translated part by part
    const label = ( text, language ) => {
        const parts = text.split( /:\s+/ ).map( ( part ) => said( part, language ) );
        return parts.every( Boolean ) ? parts.join( ': ' ) : null;
    };
    const translations = {};
    const count = { questions: 0, labels: 0, options: 0 };
    for ( const language of [ 'fr', 'it', 'en' ].filter( ( l ) => l !== captured.form.language ) ) {
        const units = {};
        for ( const u of captured.dialogue.units.filter( ( x ) => !x.skip ) ) {
            const own = {};
            if ( u.question && said( u.question, language ) ) {
                own.question = said( u.question, language );
                count.questions++;
            }
            const labels = [ ...new Set( u.fields.map( ( id ) => fields.get( id ).label ).filter( Boolean ) ) ].map( ( l ) => label( l, language ) );
            if ( labels.length && labels.every( Boolean ) ) {
                own.label = labels.join( ' / ' );
                count.labels++;
            }
            if ( u.kind === 'choice' ) {
                const options = Object.fromEntries( u.fields.map( ( id ) => [ id, said( fields.get( id ).option || fields.get( id ).label, language ) ] ).filter( ( [ , text ] ) => text ) );
                if ( Object.keys( options ).length ) {
                    own.options = options;
                    count.options += Object.keys( options ).length;
                }
            }
            units[ u.id ] = own;
        }
        const was = ( captured.dialogue.translations || {} )[ language ];
        // made anew only where something is another text now
        translations[ language ] = was && JSON.stringify( was.units ) === JSON.stringify( units ) ? was : { built: new Date().toISOString(), model: null, units };
    }
    const changed = JSON.stringify( captured.dialogue.translations || {} ) !== JSON.stringify( translations );
    if ( changed && !plan ) {
        captured.dialogue.translations = translations;
        await fs.writeFile( file, JSON.stringify( captured ) + '\n' );
    }
    console.log( form.id.padEnd( 28 ) + ' ' + Object.keys( translations ).join( ', ' ) + ': ' + count.questions + ' questions, ' + count.labels + ' labels, ' + count.options + ' options from the table'
        + ( missing.size ? ', ' + missing.size + ' texts without a translation' : '' ) + ( changed ? ( plan ? ' (would be written)' : ' (written)' ) : ' (as kept)' ) );
}

// The texts of the forms in the other languages, by their German wording; none where the table is not there.
async function texts() {
    try {
        return JSON.parse( await fs.readFile( path.join( config.dataDir, 'forms', 'translations.json' ), 'utf8' ) ).texts || {};
    } catch {
        return {};
    }
}

// The form fields of a form's PDF, from the reference beside its pages, in reading order; key is the name, and
// for the radio buttons of one group the name with their number.
async function formFields( dir ) {
    const out = [];
    const pages = ( await fs.readdir( dir ) ).filter( ( f ) => f.endsWith( '.png' ) ).sort();
    for ( const [ i, png ] of pages.entries() ) {
        try {
            const ref = JSON.parse( await fs.readFile( path.join( dir, png.replace( /\.png$/, '.json' ) ), 'utf8' ) );
            out.push( ...( ref.widgets || [] ).map( ( w ) => ( { page: i + 1, typ: w.typ, name: w.name, x: w.x, y: w.y, width: w.w, height: w.h } ) ) );
        } catch {
            // no reference beside the page
        }
    }
    out.sort( ( a, b ) => a.page - b.page || a.y - b.y || a.x - b.x );
    // a PDF can hold a form field twice at one place: that is one field
    const once = new Set();
    const fields = out.filter( ( w ) => {
        const at = [ w.page, w.name, w.x, w.y, w.width, w.height ].join( ' ' );
        return !once.has( at ) && once.add( at );
    } );
    const seen = {};
    for ( const w of fields ) {
        w.key = w.typ === 'radio' ? w.name + '/' + ( seen[ w.name ] = ( seen[ w.name ] || 0 ) + 1 ) : w.name;
    }
    return fields;
}

async function corrections( dir ) {
    try {
        return JSON.parse( await fs.readFile( path.join( dir, 'corrections.json' ), 'utf8' ) );
    } catch {
        return {};
    }
}

// what a correction says about a field, as the mask sends it
function told( entry ) {
    return Object.fromEntries( SAID.filter( ( key ) => entry && entry[ key ] !== undefined ).map( ( key ) => [ key, entry[ key ] ] ) );
}
