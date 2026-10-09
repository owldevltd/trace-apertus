import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { jobDir, saveJob, saveRun, record } from '../job.js';
import { LANGUAGE, foreign } from '../language.js';
import { levenshtein } from '../read/fluffy.js';
import { swiss } from '../fields/dates.js';
import { parse } from './writer.js';
import { checkQuestions } from './checker.js';
import { holding } from './dialogue.js';

// The form in the language of the person. Two steps, both only where that language is not the form's.
//
// When the form is opened: its questions, the printed labels and the options of its choices are translated
// once and kept with the form. A translated question is checked like a written one, against the list of the
// form itself; one that no longer points at its place is dropped and the translated label is asked instead.
// Measured 9 October 2026 (tests/translate.js): a page's questions come back complete from one call, and of 40
// questions that hold in German 35 still hold in French, 35 in Italian, 39 in English – the rest had moved
// ("Wo und wann ist der Abschluss passiert?" became the place and time of the accident).
//
// When the person goes on after answering: every value is translated into the language of the form, one value
// per call. In a bundle the small model leaves everything as it is as soon as names and numbers stand in it:
// of 28 values to translate, 0 came back translated from bundles of six or from the whole form in three
// wordings, with and without the question in front, 27 from single calls. Not every translation is right:
// "nubile" came back as "verheiratet". A value without a letter needs no
// translation. What code can hold against the person's own words it does: the digits must be the same, and a
// translation that differs from the answer by a character or two is a name that got bent.

// a translation this close to what the person said, and not the same, counts as bent
const NEAR = 2;

const numbered = ( list ) => list.map( ( x, i ) => ( i + 1 ) + ': ' + x ).join( '\n' );

function askPrompt( questions, language ) {
    return 'Jemand führt ein Gespräch und stellt diese Fragen auf Deutsch. Übersetze jede Frage ins ' + LANGUAGE[ language ] + ', für ein Gegenüber, das ' + LANGUAGE[ language ] + ' spricht: '
        + 'dieselbe Frage in einfachen Worten, nichts dazu und nichts weg. Eigennamen und Zahlen bleiben stehen.\n\n'
        + numbered( questions ) + '\n\n'
        + 'Antworte nur als JSON, ohne weiteren Text: {"texte": [{"nummer": 1, "text": "..."}]}';
}

function labelPrompt( labels, language ) {
    return 'Auf einem deutschen Formular stehen diese Beschriftungen. Übersetze jede ins ' + LANGUAGE[ language ] + ', kurz, wie eine Beschriftung, nichts dazu und nichts weg. Eigennamen und Zahlen bleiben stehen.\n\n'
        + numbered( labels ) + '\n\n'
        + 'Antworte nur als JSON, ohne weiteren Text: {"texte": [{"nummer": 1, "text": "..."}]}';
}

function valuePrompt( value, label, from, to ) {
    return 'Übersetze die Angabe unten vom ' + LANGUAGE[ from ] + ' ins ' + LANGUAGE[ to ] + '. ' + ( label ? 'Sie steht in einem Formular bei «' + label + '». ' : 'Sie steht in einem Formular. ' )
        + 'Eigennamen, Strassen, Orte, Nummern und Daten bleiben Zeichen für Zeichen stehen. Antworte nur mit der Angabe auf ' + LANGUAGE[ to ] + ', ohne weiteren Text.\n\nAngabe: ' + value;
}

// One call for a list of texts; the lines that did not come back are asked once more. Returns the texts in order.
async function translateList( texts, make, client, log, tag ) {
    const out = texts.map( () => null );
    for ( let round = 0; round < 2; round++ ) {
        const open = out.map( ( t, i ) => ( t === null ? i : -1 ) ).filter( ( i ) => i >= 0 );
        if ( !open.length ) {
            break;
        }
        const answer = await client.ask( make( open.map( ( i ) => texts[ i ] ) ), { room: 70 * open.length + 400, log, tag } );
        for ( const e of parse( answer ? answer.text : '', 'texte', 'nummer', 'text' ) ) {
            const i = open[ Number( e.nummer ) - 1 ];
            const text = String( e.text ?? '' ).trim();
            if ( i !== undefined && out[ i ] === null && text ) {
                out[ i ] = text;
            }
        }
    }
    return out;
}

// What a unit is asked with in the language of the person: its translated question, else its translated
// label; in the language of the form the question or the label as they are.
export function asked( job, unit ) {
    const mine = foreign( job ) && job.dialogue.translations && job.dialogue.translations[ job.language ];
    const own = mine && mine.units[ unit.id ];
    return ( own && ( own.question || own.label ) ) || unit.question || unit.label;
}

// Translates the dialogue of a job into a language and returns the translation as the contract has it:
// { built, model, units: { id: { question?, label?, options? } } }. A call per page for the questions and one
// for the labels and options, then the check of the translated questions, twice.
export async function translateDialogue( job, language, client, log ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    const units = job.dialogue.units.filter( ( u ) => !u.skip );
    const out = {};
    const written = {};
    for ( const page of job.pages ) {
        const here = units.filter( ( u ) => u.page === page.n );
        const withQuestion = here.filter( ( u ) => u.question );
        const questions = withQuestion.length ? await translateList( withQuestion.map( ( u ) => u.question ), ( list ) => askPrompt( list, language ), client, log, 'translate questions page ' + page.n ) : [];
        withQuestion.forEach( ( u, i ) => {
            if ( questions[ i ] ) {
                written[ u.id ] = questions[ i ];
            }
        } );
        // the labels of the units and the options of the choices, each text once
        const texts = [ ...new Set( here.flatMap( ( u ) => [ u.label, ...( u.kind === 'choice' ? u.fields.map( ( id ) => fields.get( id ).option || fields.get( id ).label ) : [] ) ] ).filter( Boolean ) ) ];
        const labels = texts.length ? await translateList( texts, ( list ) => labelPrompt( list, language ), client, log, 'translate labels page ' + page.n ) : [];
        const said = new Map( texts.map( ( t, i ) => [ t, labels[ i ] ] ) );
        for ( const u of here ) {
            const own = {};
            if ( said.get( u.label ) ) {
                own.label = said.get( u.label );
            }
            if ( u.kind === 'choice' ) {
                const options = Object.fromEntries( u.fields.map( ( id ) => [ id, said.get( fields.get( id ).option || fields.get( id ).label ) ] ).filter( ( [ , t ] ) => t ) );
                if ( Object.keys( options ).length ) {
                    own.options = options;
                }
            }
            out[ u.id ] = own;
        }
    }
    // a translated question holds like a written one: both runs name its unit, no other is asked alike
    const held = Object.keys( written ).length ? holding( job.dialogue.units, written, await checkQuestions( job, job.dialogue.units, written, client, log ) ) : {};
    for ( const [ id, question ] of Object.entries( held ) ) {
        out[ id ].question = question;
    }
    return { built: new Date().toISOString(), model: Object.keys( written ).length ? config.model : null, units: out };
}

// The translation of a shipped form's dialogue is kept in the storage folder, so the next job from that form
// has it at once: storage/translations/<form>.<language>.json, valid for the dialogue it was made of.
const kept = ( job, language ) => {
    const m = ( job.form.file || '' ).match( /^forms\/([a-z0-9-]+)\// );
    return m ? path.join( config.storageDir, 'translations', m[ 1 ] + '.' + language + '.json' ) : null;
};

export async function loadTranslation( job, language ) {
    try {
        const data = JSON.parse( await fs.readFile( kept( job, language ), 'utf8' ) );
        return data.of === job.dialogue.built ? data.translation : null;
    } catch {
        return null;
    }
}

export async function keepTranslation( job, language, translation ) {
    const file = kept( job, language );
    if ( file ) {
        await fs.mkdir( path.dirname( file ), { recursive: true } );
        await fs.writeFile( file, JSON.stringify( { of: job.dialogue.built, translation } ) );
    }
}

// What code can hold a translation against: the person's own words. Returns why a person should look, or null.
export function suspect( said, value ) {
    const digits = ( t ) => ( t.match( /\d/g ) || [] ).join( '' );
    if ( !value.trim() ) {
        return 'empty';
    }
    if ( digits( said ) !== digits( value ) ) {
        return 'digits';
    }
    const a = said.toLowerCase().trim();
    const b = value.toLowerCase().trim();
    return a !== b && levenshtein( a, b ) <= NEAR ? 'near' : null;
}

// The fields whose value is still in the language of the person: written, with a value, not translated yet.
export function toTranslate( job ) {
    return foreign( job ) ? job.fields.filter( ( f ) => f.value && f.kind !== 'checkbox' && f.kind !== 'radio' && f.kind !== 'signature' && !( f.source && f.source.said ) ) : [];
}

// Translates the values of a job into the language of the form, field by field; every field keeps what the
// person said beside it. onStep( done, all ) after every field. Returns the fields it went through.
export async function translateValues( job, client, log, onStep ) {
    const from = foreign( job );
    const fields = toTranslate( job );
    let done = 0;
    for ( const f of fields ) {
        const said = f.value;
        let value = said;
        let why = null;
        // a value without a letter is the same in every language
        if ( /\p{L}/u.test( said ) ) {
            const answer = await client.ask( valuePrompt( said, f.label, from, job.form.language ), { room: Math.max( 200, said.length ), log, tag: 'translate value ' + f.id } );
            value = ( answer ? answer.text : '' ).replace( /^Angabe:\s*/i, '' ).trim().replace( /^["«„“]+|["»“”]+$/g, '' ).trim();
            why = suspect( said, value );
            if ( why === 'empty' ) {
                value = said;
            }
        }
        // a day comes out of the translation in words: written the way the form takes it
        if ( f.kind === 'date' ) {
            value = swiss( value );
        }
        f.value = value;
        f.source = { ...( f.source || { how: 'entered' } ), said: { language: from, value: said }, approve: !!( ( f.source && f.source.approve ) || why ) };
        if ( why ) {
            f.source.said.check = why;
        }
        await onStep?.( ++done, fields.length );
    }
    return fields;
}

// Runs the translation of a job's dialogue as a step of its own, so the app can show that it is at work; the
// translation is kept with the job, and for a shipped form in the storage folder as well.
export async function translateJob( job, language, client ) {
    const state = { step: 'translate', page: 0, at: new Date().toISOString(), error: null };
    await saveRun( job.id, state );
    try {
        const translation = await translateDialogue( job, language, client, path.join( jobDir( job.id ), 'model' ) );
        if ( client.state.halted || !translation.model ) {
            throw new Error( 'the model did not translate' );
        }
        job.language = language;
        job.dialogue.translations = { ...( job.dialogue.translations || {} ), [ language ]: translation };
        await keepTranslation( job, language, translation );
        await saveJob( job );
        state.step = 'done';
    } catch ( error ) {
        state.step = 'error';
        state.error = error.message;
    }
    await saveRun( job.id, Object.assign( state, { at: new Date().toISOString() } ) );
    return job;
}

// Runs the translation of a job's values as a step of its own; run.page counts the fields done. after( job ):
// what the caller does with the job once the values are in the language of the form (the hints anew).
export async function translateJobValues( job, client, after ) {
    const state = { step: 'translate', page: 0, at: new Date().toISOString(), error: null };
    await saveRun( job.id, state );
    try {
        const fields = await translateValues( job, client, path.join( jobDir( job.id ), 'model' ), ( done ) => saveRun( job.id, Object.assign( state, { page: done, at: new Date().toISOString() } ) ) );
        if ( client.state.halted ) {
            throw new Error( 'the model stopped answering' );
        }
        record( job, 'translated', fields.length + ' values from ' + job.language + ' into ' + job.form.language );
        await after?.( job );
        await saveJob( job );
        state.step = 'done';
    } catch ( error ) {
        state.step = 'error';
        state.error = error.message;
    }
    await saveRun( job.id, Object.assign( state, { at: new Date().toISOString() } ) );
    return job;
}
