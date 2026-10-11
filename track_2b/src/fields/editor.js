import path from 'node:path';
import { config } from '../config.js';
import { jobDir, saveRun } from '../job.js';
import { buildUnits } from '../dialogue/units.js';
import { writeQuestions } from '../dialogue/writer.js';
import { checkQuestions, RUNS, BUNDLE } from '../dialogue/checker.js';
import { holding } from '../dialogue/dialogue.js';
import { buildCatalogue, extendCatalogue } from '../review/catalogue.js';
import { loadCatalogue, saveCatalogue } from '../review/hints.js';
import { WRITTEN } from './kinds.js';
import { pages, predictKinds } from './predictor.js';

// A captured form corrected by hand. What the pipeline found is a proposal: the model reads a label wrongly, the
// geometry misses a field or takes a bar for one, a question points at the right place and is worded badly. A
// person changes a field's label and kind, moves it and sets its size, takes it away, adds one, groups tick marks,
// writes a question, says what is required and which values a writing field may take. A kind a person sets stands
// (kindBy "person"); a field a person adds or names anew and leaves as text is shown to the model once more, which
// proposes a kind for it as it does when a form is captured. The job is then put together
// anew by code: the units of the dialogue from the fields as they now stand, each keeping what belonged to it where
// its fields are the same (question, required mark, the answers given), and the pieces of the transcript pointing
// at their units under their new ids. Only a unit whose fields or labels changed gets a new question from the
// model, written and checked like the others; a question a person wrote stands as it is and is not checked.
//
// An edit: { name?, fields: [ { id?, page, x, y, width, height, label, kind, option?, group?, values?, question?,
// required? } ] }. values is the list a writing field may take, or left out for a field that takes anything. fields
// is the whole list after editing: a field of the job that is missing from it was taken away, one without an id is
// new. question and required speak for the unit the field ends up in.

export const KINDS = [ ...WRITTEN, 'checkbox', 'radio', 'signature' ];
const MARK = [ 'checkbox', 'radio' ];
// a field a person writes into: only such a field can be given values to choose from
const WRITING = [ 'text', 'multiline', 'number' ];

// the smallest side a field can have, in page pixels
const MIN = 12;

const plain = ( t ) => ( t || '' ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
const tidy = ( t ) => String( t ?? '' ).replace( /\s+/g, ' ' ).trim();

// What is wrong with an edit, or null.
export function invalid( job, edit ) {
    if ( !edit || !Array.isArray( edit.fields ) ) {
        return 'an edit carries the list of fields';
    }
    const ids = new Set( job.fields.map( ( f ) => f.id ) );
    const seen = new Set();
    for ( const e of edit.fields ) {
        if ( !e || !KINDS.includes( e.kind ) || ![ e.x, e.y, e.width, e.height ].every( Number.isFinite ) ) {
            return 'a field has a kind and a place';
        }
        if ( e.id ? !ids.has( e.id ) || seen.has( e.id ) : !job.pages.some( ( p ) => p.n === e.page ) ) {
            return e.id ? 'no such field: ' + e.id : 'a new field stands on a page of the form';
        }
        seen.add( e.id );
    }
    return null;
}

// Puts the fields of an edit into the job and returns what changed: { touched, named, added, removed }, touched
// being the fields whose label, kind, option or group is another one now, named those of them with a new label.
// A place alone is no reason for a new question.
export function applyEdit( job, edit ) {
    const pages = new Map( job.pages.map( ( p ) => [ p.n, p ] ) );
    const blocks = new Map( job.blocks.map( ( b ) => [ b.id, b ] ) );
    const wanted = new Map( edit.fields.filter( ( e ) => e.id ).map( ( e ) => [ e.id, e ] ) );
    const change = { touched: new Set(), named: new Set(), added: [], removed: [] };
    const fields = [];
    for ( const f of job.fields ) {
        const e = wanted.get( f.id );
        if ( !e ) {
            change.removed.push( f.id );
            continue;
        }
        place( f, e, pages.get( f.page ) );
        if ( e.kind !== f.kind ) {
            f.kind = e.kind;
            f.kindBy = 'person';
            change.touched.add( f.id );
        }
        if ( tidy( e.label ) !== tidy( f.label ) ) {
            relabel( job, blocks, f, tidy( e.label ) );
            change.touched.add( f.id );
            change.named.add( f.id );
        }
        if ( marks( f, e ) ) {
            change.touched.add( f.id );
        }
        // the values are no reason for a new question: what is asked stays the same, what can be answered changes
        if ( listed( f, e ) ) {
            unfit( f );
        }
        fields.push( f );
    }
    let last = Math.max( 0, ...job.fields.map( ( f ) => Number( f.id.replace( /\D/g, '' ) ) || 0 ) );
    for ( const e of edit.fields.filter( ( x ) => !x.id ) ) {
        const f = { id: 'f' + ( ++last ), label: tidy( e.label ), kind: e.kind, page: e.page, x: 0, y: 0, width: 0, height: 0, by: 'person' };
        // text is what the mask starts a new field with: only another kind is the person's word
        if ( e.kind !== 'text' ) {
            f.kindBy = 'person';
        }
        place( f, e, pages.get( f.page ) );
        marks( f, e );
        listed( f, e );
        fields.push( f );
        change.added.push( f.id );
        // from here on the edit speaks of the field by its id
        e.id = f.id;
    }
    job.fields = fields;
    if ( tidy( edit.name ) ) {
        job.form.name = tidy( edit.name );
    }
    return change;
}

// the place of a field, whole pixels inside its page
function place( f, e, page ) {
    const width = Math.max( MIN, Math.round( e.width ) );
    const height = Math.max( MIN, Math.round( e.height ) );
    Object.assign( f, {
        x: Math.max( 0, Math.min( Math.round( e.x ), ( page.width || width ) - width ) ),
        y: Math.max( 0, Math.min( Math.round( e.y ), ( page.height || height ) - height ) ),
        width,
        height,
    } );
}

// A label set by hand. Where the text block it was read from names this field alone, the reading is corrected
// there and no longer doubted; where the block names other fields too, or there is none, the field carries its
// label itself and the list of lines prints it at the field.
function relabel( job, blocks, f, label ) {
    const block = f.labelBlock && blocks.get( f.labelBlock );
    if ( block && label && !job.fields.some( ( x ) => x !== f && x.labelBlock === f.labelBlock ) ) {
        block.content = label;
        block.approve = false;
    } else {
        delete f.labelBlock;
    }
    f.label = label;
}

// option and group of a tick mark; a field that is none carries neither. Returns whether something changed.
function marks( f, e ) {
    const option = MARK.includes( f.kind ) ? tidy( e.option ) : '';
    const group = MARK.includes( f.kind ) ? tidy( e.group ) : '';
    const changed = option !== ( f.option || '' ) || group !== ( f.group || '' );
    for ( const [ key, value ] of [ [ 'option', option ], [ 'group', group ] ] ) {
        if ( value ) {
            f[ key ] = value;
        } else {
            delete f[ key ];
        }
    }
    return changed;
}

// The values a writing field may take, as the edit gives them: every entry once, in the order given; an edit
// that says nothing about them leaves them as they are, an empty list takes them away. Returns whether the
// list is another one now.
function listed( f, e ) {
    if ( !WRITING.includes( f.kind ) ) {
        const had = !!f.values;
        delete f.values;
        return had;
    }
    if ( e.values === undefined ) {
        return false;
    }
    const seen = new Set();
    const values = ( Array.isArray( e.values ) ? e.values : String( e.values ).split( /\r?\n/ ) ).map( tidy ).filter( ( v ) => v && !seen.has( v.toLowerCase() ) && seen.add( v.toLowerCase() ) );
    const changed = values.join( '\n' ) !== ( f.values || [] ).join( '\n' );
    if ( values.length ) {
        f.values = values;
    } else {
        delete f.values;
    }
    return changed;
}

// A value that is no entry of the field's list any more is taken out: the field takes one of its values or
// stays empty.
function unfit( f ) {
    if ( f.values && f.value && !f.values.includes( f.value ) ) {
        f.value = '';
        delete f.source;
    }
}

// The dialogue anew from the fields as they stand after applyEdit. Returns the units that need a question from
// the model: asked, with fields or labels that changed, and no question written by a person.
export function rebuild( job, edit, change ) {
    const before = job.dialogue ? job.dialogue.units : [];
    const old = new Map( before.map( ( u ) => [ u.fields.join( ' ' ), u ] ) );
    const said = new Map( edit.fields.map( ( e ) => [ e.id, e ] ) );
    const units = buildUnits( job );
    const moved = {};
    const fresh = [];
    for ( const u of units ) {
        const was = old.get( u.fields.join( ' ' ) );
        if ( was ) {
            moved[ was.id ] = u.id;
        }
        const mine = u.fields.map( ( id ) => said.get( id ) ).filter( Boolean );
        // required: what the person says; an edit that says nothing about it leaves the mark as it was
        const says = mine.filter( ( e ) => typeof e.required === 'boolean' );
        if ( says.length ? says.some( ( e ) => e.required ) : was && was.required ) {
            u.required = true;
        }
        const typed = mine.map( ( e ) => e.question ).find( ( q ) => typeof q === 'string' );
        const same = was && !u.fields.some( ( id ) => change.touched.has( id ) );
        if ( typed !== undefined && tidy( typed ) !== tidy( was && was.question ) ) {
            // written by a person, or taken away by one: then the label is asked
            if ( tidy( typed ) ) {
                u.question = tidy( typed );
                u.by = 'person';
            }
        } else if ( was && ( same || was.by === 'person' ) ) {
            if ( was.question ) {
                u.question = was.question;
                if ( was.by ) {
                    u.by = was.by;
                }
            }
        } else if ( !u.skip ) {
            fresh.push( u );
        }
    }
    for ( const p of job.transcript || [] ) {
        if ( p.question && moved[ p.question ] ) {
            p.question = moved[ p.question ];
        } else {
            delete p.question;
        }
    }
    // a translation was made of the dialogue as it was: it is made anew when the form is next opened in that language
    job.dialogue = { built: new Date().toISOString(), model: job.dialogue ? job.dialogue.model : null, units };
    return fresh;
}

// The calls the questions for these units take: per page one to write and the check in its bundles.
export function planned( fresh ) {
    const pages = [ ...new Set( fresh.map( ( u ) => u.page ) ) ];
    return pages.reduce( ( calls, n ) => calls + 1 + RUNS * Math.ceil( fresh.filter( ( u ) => u.page === n ).length / BUNDLE ), 0 );
}

// Writes and checks the questions of the units that need one, page by page, with the list of the whole page in
// front of the model as for a captured form. A question holds as there, and not when the page keeps a question
// with the same words. The questions of the other units stay as they are.
export async function askFresh( job, fresh, client, log ) {
    if ( !fresh.length ) {
        return;
    }
    const units = job.dialogue.units;
    const view = { ...job, pages: job.pages.filter( ( p ) => fresh.some( ( u ) => u.page === p.n ) ) };
    const all = await writeQuestions( view, units, client, log );
    const written = Object.fromEntries( fresh.filter( ( u ) => all[ u.id ] ).map( ( u ) => [ u.id, all[ u.id ] ] ) );
    if ( !Object.keys( written ).length ) {
        return;
    }
    const held = holding( units, written, await checkQuestions( view, units, written, client, log ) );
    for ( const u of fresh ) {
        const question = held[ u.id ];
        if ( question && !units.some( ( x ) => x !== u && x.page === u.page && x.question && plain( x.question ) === plain( question ) ) ) {
            u.question = question;
            job.dialogue.model = config.model;
        }
    }
}

// The labels an edit brought into the form that its catalogue has no entry for: of the fields a person added or
// changed. For these the catalogue is asked to say something, so that a new field has hints like the others.
export async function uncatalogued( job, change ) {
    const plain = ( t ) => ( t || '' ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
    const catalogue = await loadCatalogue( job );
    const ids = new Set( [ ...change.added, ...change.touched ] );
    const labels = [ ...new Set( job.fields.filter( ( f ) => ids.has( f.id ) && f.label ).map( ( f ) => f.label ) ) ];
    return labels.filter( ( l ) => !catalogue || !catalogue.fields.some( ( e ) => plain( e.field ) === plain( l ) ) );
}

// The fields an edit asks the model's proposal of a kind for: those a person added or named anew, where their
// kind is open. Returns their ids, or null when there is nothing to ask.
export function unkinded( job, change ) {
    const ids = new Set( [ ...change.added, ...change.named ] );
    return job.dialogue && pages( job, job.dialogue.units, ids ).length ? ids : null;
}

// What an edit needs from the model, as a step of its own so the app can show how far it is: the questions of
// the units that changed, the kind of the fields that are new or named anew (one call per page), and the
// catalogue entries for the new labels (one call to the large model). run.page counts the calls done, run.of
// the calls planned. after( job ): what the caller does with the job once that is through, and also when the
// model failed: the corrections of the person are kept either way.
export async function runEdit( job, fresh, labels, client, after, kinds = null ) {
    const asked = kinds ? pages( job, job.dialogue.units, kinds ).length : 0;
    const state = { step: 'edit', page: 0, of: planned( fresh ) + asked + ( labels.length ? 1 : 0 ), at: new Date().toISOString(), error: null };
    await saveRun( job.id, state );
    const log = path.join( jobDir( job.id ), 'model' );
    const counting = {
        state: client.state,
        ask: async ( prompt, options ) => {
            const answer = await client.ask( prompt, options );
            await saveRun( job.id, Object.assign( state, { page: Math.min( state.page + 1, state.of ), at: new Date().toISOString() } ) );
            return answer;
        },
    };
    let failed = null;
    try {
        await askFresh( job, fresh, counting, log );
        if ( kinds ) {
            await predictKinds( job, job.dialogue.units, counting, log, kinds );
        }
        if ( labels.length ) {
            const catalogue = await loadCatalogue( job );
            if ( !catalogue ) {
                await saveCatalogue( job, await buildCatalogue( job, counting, log ) );
            } else if ( await extendCatalogue( job, catalogue, labels, counting, log ) ) {
                await saveCatalogue( job, catalogue );
            }
        }
    } catch ( error ) {
        failed = error.message;
    }
    try {
        await after( job );
        state.step = 'done';
    } catch ( error ) {
        failed = error.message;
        state.step = 'error';
    }
    // a catalogue that did not come back is no reason to call the edit failed
    state.error = state.step === 'error' ? failed : null;
    await saveRun( job.id, Object.assign( state, { at: new Date().toISOString() } ) );
    return job;
}
