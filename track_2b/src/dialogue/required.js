import { listing } from './listing.js';
import { INTRO } from './writer.js';
import { LARGE } from '../review/catalogue.js';
import { entryOf } from '../review/hints.js';

// Which questions of a dialogue ask for something the form requires. What is required stands in the catalogue of
// the form, entry by entry, checked by a person; the dialogue asks unit by unit. An entry reaches its units in
// three steps. By code: a field of the unit carries the entry's name as its label. Where no label says so, the
// small and the large model each get the list of a page with the required entries and name the units; taken is
// only what both name. Then the check back, as with the questions: the small model is shown the unit and names
// the entry that is entered there, or none, and the binding stays when it names the same entry.
//
// Measured 9 October 2026 on the four shipped forms, 28 required entries with a place in the dialogue, read
// against the pages: the label binds 17 and no wrong unit; either model alone names 26 and 34 wrong units; what
// both name binds 26 with 3 wrong units, of which the check back drops 2 and no right one. A unit only one of
// the two names is right in 3 of 31 cases. Without a catalogue the small model calls 121 of 230 units
// indispensable, 80 of 110 on one form and 2 of 35 on another: it does not tell them apart.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const entries = ( required, mark ) => required.map( ( e, i ) => mark( i ) + ': ' + e.field + ' – ' + e.requirement ).join( '\n' );

function bindPrompt( text, required ) {
    return INTRO + '\n\n-----\n' + text + '\n-----\n\n'
        + 'Für dieses Formular gelten die folgenden Pflichtangaben:\n' + entries( required, ( i ) => i + 1 ) + '\n\n'
        + 'Nenne zu jeder Pflichtangabe die Kennung der Stelle auf dieser Seite, an der sie eingetragen wird. Gehört sie zu mehreren Stellen, nenne alle; '
        + 'steht sie auf dieser Seite nicht, gib eine leere Liste. Rate nicht.\n'
        + 'Antworte nur als JSON, ohne weiteren Text: {"zuordnung": [{"nummer": 1, "kennungen": ["q5"]}]}';
}

function backPrompt( text, unit, required ) {
    return INTRO + '\n\n-----\n' + text + '\n-----\n\n'
        + 'Es geht um die Stelle [' + unit + ']. Welche der folgenden Angaben wird genau an dieser Stelle eingetragen?\n' + entries( required, ( i ) => LETTERS[ i ] ) + '\n\n'
        + 'Antworte nur mit dem Buchstaben. Passt keine der Angaben zu dieser Stelle, antworte mit dem Wort KEINE.';
}

// { number of the entry: [ unit ids ] } from an answer, also from one that is no clean JSON
function named( text, count ) {
    const out = {};
    for ( const m of ( text || '' ).matchAll( /\{\s*"nummer"\s*:\s*"?(\d+)"?\s*,\s*"kennungen"\s*:\s*\[([^\]]*)\]/g ) ) {
        const n = Number( m[ 1 ] );
        if ( n >= 1 && n <= count ) {
            out[ n ] = [ ...( out[ n ] || [] ), ...( m[ 2 ].match( /q\d+/g ) || [] ) ];
        }
    }
    return out;
}

// The units each required entry reaches by the label of their fields, in the order of `required`.
export function byLabel( job, catalogue, required ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    const out = required.map( () => [] );
    for ( const u of job.dialogue.units.filter( ( x ) => !x.skip ) ) {
        for ( const id of u.fields ) {
            const i = required.indexOf( entryOf( catalogue, fields.get( id ) ) );
            if ( i >= 0 && !out[ i ].includes( u.id ) ) {
                out[ i ].push( u.id );
            }
        }
    }
    return out;
}

// Marks the units of job.dialogue at which a required entry of the catalogue is entered (unit.required) and
// returns how every entry was bound: [ { field, units, how: 'label' | 'models' | null, dropped } ], dropped being
// the units both models named and the check back did not confirm. Two calls per page with questions and one per
// unit to check; none when every entry is bound by its label. Without a model only the labels bind.
export async function bindRequired( job, catalogue, client, log ) {
    const units = job.dialogue.units;
    const asked = units.filter( ( u ) => !u.skip );
    const required = ( catalogue.fields || [] ).filter( ( e ) => e.required );
    const bound = byLabel( job, catalogue, required ).map( ( list, i ) => ( { field: required[ i ].field, units: list, how: list.length ? 'label' : null, dropped: [] } ) );
    // the check back answers with a letter, so it carries no more entries than there are letters
    if ( bound.some( ( b ) => !b.how ) && required.length <= LETTERS.length ) {
        const said = { small: required.map( () => [] ), large: required.map( () => [] ) };
        for ( const page of job.pages ) {
            const here = asked.filter( ( u ) => u.page === page.n );
            if ( !here.length ) {
                continue;
            }
            const text = listing( job, units, page.n );
            for ( const [ who, model ] of [ [ 'small', undefined ], [ 'large', LARGE ] ] ) {
                const answer = await client.ask( bindPrompt( text, required ), { model, room: 40 * required.length + 300, log, tag: 'required ' + who + ' page ' + page.n } );
                const got = named( answer ? answer.text : '', required.length );
                required.forEach( ( e, i ) => said[ who ][ i ].push( ...( got[ i + 1 ] || [] ).filter( ( q ) => here.some( ( u ) => u.id === q ) ) ) );
            }
        }
        for ( const [ i, b ] of bound.entries() ) {
            if ( b.how ) {
                continue;
            }
            for ( const q of [ ...new Set( said.small[ i ] ) ].filter( ( x ) => said.large[ i ].includes( x ) ) ) {
                const page = units.find( ( u ) => u.id === q ).page;
                const answer = await client.ask( backPrompt( listing( job, units, page ), q, required ), { room: 20, log, tag: 'required back ' + q } );
                const letter = ( ( answer ? answer.text : '' ).trim().match( /^(KEINE|[A-Z])\b/i ) || [ '', '' ] )[ 1 ].toUpperCase();
                ( letter === LETTERS[ i ] ? b.units : b.dropped ).push( q );
            }
            b.how = b.units.length ? 'models' : null;
        }
    }
    const marked = new Set( bound.flatMap( ( b ) => b.units ) );
    for ( const u of units ) {
        if ( marked.has( u.id ) ) {
            u.required = true;
        } else {
            delete u.required;
        }
    }
    return bound;
}
