import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { fits } from '../fields/kinds.js';
import { LANGUAGE, foreign } from '../language.js';
import { asked } from '../dialogue/translate.js';

// Hints for the person: what to look at before sending. missing and format come from code; legal and vague come
// from the catalogue of the form, the only source of legal text. The small model judges an entry only with the
// catalogue in front of it and names only sources that stand there (measured 3 October 2026: 0 invented
// sources with the catalogue, 4 without). incomplete comes from the question itself: the model says whether an
// answer covers what the place asks for. The hint says "please look here", never "not allowed".
//
// A vague hint does not leave the person alone with a value that does not fit: where the field has no values to
// choose from, the model is asked which passages of what was said fit the requirement instead, and code keeps
// those that stand there word for word. Tried 11 October 2026 on the ten values the check turned down in two
// real dictations: passages named for eight, 17 of 20 of them standing in the dictation as they were named;
// for the workplace entered as a function, the workplace said in the same sentence was among them.

// what the person is told about a value that is none of its field's kind
const FORMAT = {
    date: 'Kein lesbares Datum.',
    time: 'Keine lesbare Uhrzeit.',
    number: 'Keine Zahl allein.',
    phone: 'Keine lesbare Telefonnummer.',
    email: 'Keine vollständige E-Mail-Adresse.',
    postcode: 'Keine vierstellige Postleitzahl.',
    iban: 'Die Prüfziffer der IBAN stimmt nicht.',
};

// A value shorter than this, in letters and digits, may well stand twice: "42" hours a week for the person and
// for the company, "5" per cent. Set by the assistant, open.
const DOUBLE = 4;

// Code hints over all fields: something required without a value, a value that is none of its field's kind (a
// date that is no day, a telephone number with letters, an IBAN whose check digits do not hold). Where the dialogue says
// which of its questions are required, a required question with nothing in any of its fields is missing, and the
// hint stands on its first field: no tick in a required choice is one thing missing, not one per box. A job
// without such marks takes the catalogue entry of each field by its label.
export function hints( job, catalogue = null ) {
    const out = [];
    const units = job.dialogue ? job.dialogue.units : [];
    const marked = units.some( ( u ) => u.required );
    const value = new Map( job.fields.map( ( f ) => [ f.id, f.value ] ) );
    const empty = new Set( units.filter( ( u ) => u.required && !u.skip && !u.fields.some( ( id ) => value.get( id ) ) ).map( ( u ) => u.fields[ 0 ] ) );
    // the same value in two fields, both read from a dictation in one go: one of them took what belongs to the
    // other (seen 11 October 2026: a policy number as the claim number too, a date of birth as the date interest
    // runs from). The hint stands on each of them until a person decided on it; a field a person answered by
    // itself is not doubted.
    const dictated = new Set( ( job.transcript || [] ).filter( ( p ) => !p.question ).map( ( p ) => p.n ) );
    const same = new Map();
    for ( const f of job.fields ) {
        const read = f.value && f.kind !== 'checkbox' && f.kind !== 'radio' && f.source && f.source.how !== 'entered' && dictated.has( f.source.piece );
        if ( read && plain( f.value ).length >= DOUBLE ) {
            same.set( plain( f.value ), [ ...( same.get( plain( f.value ) ) || [] ), f ] );
        }
    }
    const twice = new Map( [ ...same.values() ].filter( ( g ) => g.length > 1 ).flatMap( ( g ) => g.filter( ( f ) => !f.source.review ).map( ( f ) => [ f.id, g.filter( ( x ) => x !== f ).map( ( x ) => x.label || x.id ) ] ) ) );
    for ( const f of job.fields ) {
        const entry = catalogue ? entryOf( catalogue, f ) : null;
        const required = marked ? empty.has( f.id ) : f.required || ( entry && entry.required );
        if ( required && !f.value ) {
            out.push( { field: f.id, kind: 'missing', text: 'Pflichtangabe, nichts gesagt.' } );
        }
        if ( twice.has( f.id ) ) {
            out.push( { field: f.id, kind: 'double', text: 'Derselbe Wert steht auch bei «' + twice.get( f.id ).join( '», «' ) + '».' } );
        }
        if ( FORMAT[ f.kind ] && f.value && !fits( f.kind, f.value ) ) {
            out.push( { field: f.id, kind: 'format', text: FORMAT[ f.kind ] } );
        }
        if ( entry && entry.source && entry.source !== 'keine sichere Quelle' ) {
            // an entry added for a field a person made is nobody's checked work, whatever stamp the catalogue has
            out.push( { field: f.id, kind: 'legal', text: entry.requirement, article: entry.source, catalogue: catalogue.file + ' · ' + ( !entry.added && catalogue.verified || 'unverified' ) } );
        }
    }
    return out;
}

// The catalogue of a job: its own, built when the form was captured or carried on from the form it was made of
// (storage/<job>/catalogue.json), else the one of the shipped form, data/catalogues/<form>.json.
export async function loadCatalogue( job ) {
    try {
        return { ...JSON.parse( await fs.readFile( path.join( config.storageDir, job.id, 'catalogue.json' ), 'utf8' ) ), file: 'catalogue.json' };
    } catch {
        // no catalogue of its own
    }
    const m = ( job.form.file || '' ).match( /^forms\/([a-z0-9-]+)\// );
    if ( !m ) {
        return null;
    }
    try {
        const file = m[ 1 ] + '.json';
        const data = JSON.parse( await fs.readFile( path.join( config.dataDir, 'catalogues', file ), 'utf8' ) );
        return { ...data, file };
    } catch {
        return null;
    }
}

// Keeps a catalogue with its job.
export async function saveCatalogue( job, catalogue ) {
    const { file: _, ...data } = catalogue;
    await fs.writeFile( path.join( config.storageDir, job.id, 'catalogue.json' ), JSON.stringify( data, null, 4 ) + '\n' );
}

// the catalogue entry for a field: same label, or the entry's field name inside the label
export function entryOf( catalogue, f ) {
    const label = plain( f.label );
    if ( !label ) {
        return null;
    }
    return ( catalogue.fields || [] ).find( ( e ) => plain( e.field ) === label ) || ( catalogue.fields || [] ).find( ( e ) => plain( e.field ) && label.includes( plain( e.field ) ) ) || null;
}

function plain( t ) {
    return ( t || '' ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
}

// Asks the model whether a value meets the catalogue's requirement; one call per field. Adds vague hints.
export async function judgeVague( job, catalogue, client ) {
    const out = [];
    const text = JSON.stringify( catalogue.fields, null, 1 );
    for ( const f of job.fields ) {
        const entry = entryOf( catalogue, f );
        // only where the catalogue has a requirement with a source: without one the model has nothing to judge by
        // a field with values holds an entry of its list: there is nothing to judge
        if ( !entry || !f.value || f.values || f.kind === 'checkbox' || f.kind === 'radio' || !entry.source || /keine sichere quelle/i.test( entry.source ) ) {
            continue;
        }
        const p = 'Du prüfst eine Angabe in einem Schweizer Formular.\nFormular: ' + job.form.name + '\nFeld: ' + f.label + '\nGesprochene Angabe: "' + f.value + '"\n\n'
            + 'Für dieses Formular liegt ein vorab erstellter Katalog der Vorgaben je Feld vor. Stütze dich auf diesen Katalog; nenne nur Quellen, die darin stehen.\n\nKatalog:\n' + text + '\n\n'
            + '1. Reicht die Angabe für dieses Feld aus?\n2. Welche Vorgabe aus dem Katalog gilt dafür?\n3. Nenne die Quelle aus dem Katalog (Gesetz, SR-Nummer, Artikel). Steht im Katalog keine sichere Quelle, sage das.\n\n'
            + 'Antworte nur als JSON: {"ausreichend": "ja|nein|unklar", "hinweis": "...", "vorgabe": "...", "quelle": "...", "sicherheit": "hoch|mittel|niedrig"}';
        const answer = await client.ask( p, { room: 600, log: path.join( config.storageDir, job.id, 'model' ), tag: 'vague ' + f.id } );
        const a = parse( answer ? answer.text : '' );
        if ( a && a.ausreichend && a.ausreichend !== 'ja' ) {
            out.push( { field: f.id, kind: 'vague', text: a.hinweis || a.vorgabe || '', article: a.quelle || '', catalogue: catalogue.file + ' · ' + ( catalogue.verified || 'unverified' ), requirement: entry.requirement } );
        }
    }
    return out;
}

// at most this many passages are offered instead of a value
const OFFERED = 3;

function suggestPrompt( text, label, requirement, value, spoken ) {
    return 'Unten steht, was eine Person zu einem Formular gesagt hat, als Text.\n\n-----\n' + text + '\n-----\n\n'
        + 'Es geht um das Feld «' + label + '». Verlangt ist: ' + requirement + '\n'
        + 'Im Feld steht bisher «' + value + '». Das passt nicht dazu.\n\n'
        + 'Welche Stellen aus dem Gesagten passen zu dem, was verlangt ist? Nenne höchstens drei, jede in einer eigenen Zeile, wörtlich so, wie sie oben stehen, ohne weiteren Text. '
        + 'Passt nichts, schreibe nur das Wort KEINE.'
        + ( spoken ? '\nDie Person spricht ' + LANGUAGE[ spoken ] + '. Nenne die Stellen so, wie sie gesagt wurden, auf ' + LANGUAGE[ spoken ] + '; übersetze nichts.' : '' );
}

// The passages an answer names that can be offered: each standing in what was said as it is named, none of
// them the value that was turned down, each once, at most OFFERED.
export function offered( answer, value, said ) {
    const flat = ( t ) => t.toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
    const text = flat( said );
    const out = [];
    for ( const line of /^\s*KEINE\s*\.?\s*$/i.test( answer || '' ) ? [] : ( answer || '' ).split( /\r?\n/ ) ) {
        const passage = line.replace( /^[\s\-*\d.)]+/, '' ).trim().replace( /^["«„“]+|["»“”]+$/g, '' ).replace( /[.;,]+$/, '' ).trim();
        if ( flat( passage ) && text.includes( flat( passage ) ) && flat( passage ) !== flat( value ) && !out.some( ( o ) => flat( o ) === flat( passage ) ) ) {
            out.push( passage );
        }
    }
    return out.slice( 0, OFFERED );
}

// Adds suggestions to the vague hints: what else of what was said fits the requirement. One call per hint.
// vague: the hints as judgeVague returns them, each with its field; pieces: the transcript pieces the values
// were read from.
export async function suggest( job, vague, pieces, client ) {
    const said = pieces.map( ( p ) => '[p' + p.n + '] ' + p.text.trim() ).join( '\n\n' );
    for ( const h of vague.filter( ( x ) => x.kind === 'vague' ) ) {
        const f = job.fields.find( ( x ) => x.id === h.field );
        const requirement = ( h.requirement || h.text || '' ).trim();
        if ( !f || !f.value || f.values || !requirement || !said ) {
            continue;
        }
        const answer = await client.ask( suggestPrompt( said, f.label, requirement, f.value, foreign( job ) ), { room: 300, log: path.join( config.storageDir, job.id, 'model' ), tag: 'suggest ' + f.id } );
        const found = offered( answer ? answer.text : '', f.value, pieces.map( ( p ) => p.text ).join( ' ' ) );
        if ( found.length ) {
            h.suggestions = found;
        }
    }
    // the requirement was carried along for this question only
    for ( const h of vague ) {
        delete h.requirement;
    }
}

// what the model is told a place takes, when it judges an answer
const TAKES = { text: 'Text', multiline: 'Text, mehrere Angaben möglich', date: 'Datum', checkbox: 'Auswahl', radio: 'Auswahl' };

// Is a place answered with what was said? One call. Measured 9 October 2026 on the 31 places with a value of
// the two walk-through forms (tests/enough.js): of the full answers 29 are taken as enough, of "I don't know"
// none, of answers cut to their first part 1 of 5, of the answers to another question 8 of 31 – those fit the
// place by their kind. The same verdict on a second run in 31 of 31. The model sees that something is missing
// and says what; it does not see whether what was said is true, and it does not tell "incomplete" from "no".
// said: the answer as said or typed. Returns an incomplete hint for the field, or null.
export async function judgeEnough( job, unit, field, said, client ) {
    const ask = asked( job, unit );
    if ( !ask || !said.trim() ) {
        return null;
    }
    const spoken = foreign( job );
    const p = 'In einem Gespräch wird ein Schweizer Formular ausgefüllt. Jemand stellt eine Frage, die andere Person antwortet.\n\n'
        + 'Frage: ' + ask + '\n'
        + 'Auf dem Formular steht an dieser Stelle: ' + unit.label + ' (' + ( TAKES[ field.kind ] || TAKES.text ) + ')\n'
        + 'Antwort: ' + said.trim() + '\n\n'
        + 'Ist die Stelle mit dieser Antwort ausreichend beantwortet?\n'
        + '- ja: alles, was die Stelle verlangt, wurde gesagt\n'
        + '- unvollständig: etwas Passendes wurde gesagt, aber ein Teil fehlt noch\n'
        + '- nein: nichts Passendes wurde gesagt\n'
        + 'Antworte nur als JSON, ohne weiteren Text: {"urteil": "ja|unvollständig|nein", "fehlt": "was noch fehlt, sonst leer"}'
        + ( spoken ? '\nDie Person spricht ' + LANGUAGE[ spoken ] + ': schreibe, was fehlt, auf ' + LANGUAGE[ spoken ] + '.' : '' );
    const answer = await client.ask( p, { room: 150, log: path.join( config.storageDir, job.id, 'model' ), tag: 'enough ' + unit.id } );
    const a = parse( answer ? answer.text : '' );
    const verdict = a && typeof a.urteil === 'string' ? a.urteil.trim().toLowerCase() : '';
    // no verdict that can be read is no hint; only a plain yes clears the answer
    if ( !verdict || verdict === 'ja' ) {
        return null;
    }
    return { field: field.id, kind: 'incomplete', text: String( a.fehlt || '' ).trim() || 'Die Antwort deckt die Frage noch nicht ganz.' };
}

function parse( text ) {
    const m = ( text || '' ).replace( /^```(?:json)?\s*|\s*```$/gm, '' ).match( /\{[\s\S]*\}/ );
    if ( !m ) {
        return null;
    }
    try {
        return JSON.parse( m[ 0 ] );
    } catch {
        return null;
    }
}
