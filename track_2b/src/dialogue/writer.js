import { listing } from './listing.js';

// One plain question per unit, written by the small model from the list of a page: everyday words, from the
// seat of the person who leads the conversation and fills in the form afterwards, the other person unknown.
// One call per page. Measured 9 October 2026 on the four shipped forms (259 units): page by page the small
// model writes 237 questions and says "KEINE" for 20 places with nothing printed; over the whole form in one
// call it repeats itself (57 questions worded like another on the same page, against 29) and keeps more of the
// form's brackets (34 against 17); in bundles of twelve it addresses the other person as the debtor or the
// injured person again (10 of 13 such places, against 0). The wording is the measured one.

export const INTRO = 'Unten steht ein Schweizer Formular als Text, Zeile für Zeile in der Reihenfolge des Papiers. '
    + 'Hinter dem Text, zu dem eine Stelle zum Ausfüllen gehört, steht nach einem Pfeil die Kennung dieser Stelle in eckigen Klammern, zum Beispiel [q7]. '
    + '"[q9: Auswahl]" ist eine Auswahl aus den Möglichkeiten, hinter denen dieselbe Kennung steht; "[q8: Tabelle mit 9 Zeilen und 3 Spalten]" ist eine Tabelle. '
    + 'Eine Kennung, die allein in einer Zeile steht, ist eine Stelle ohne eigene Beschriftung.';

const RULES = 'Du bist die Person, die das Gespräch führt, wie in einem Interview: du fragst, dein Gegenüber antwortet, und du selbst schreibst die Antworten danach ins Formular. Du sprichst also nicht als das Formular.\n'
    + 'Schreibe zu jeder Kennung genau eine Frage, so wie man sie im Gespräch einem Menschen stellt, der das Formular nicht vor sich hat und mit Ämtern und Versicherungen wenig zu tun hat:\n'
    + '- einfache, alltägliche Wörter und kurze Sätze; keine Abkürzungen, keine Klammern, keine Amtssprache\n'
    + '- sage, um wen oder was es geht, statt das Wort vom Formular zu wiederholen (statt "Wohnsitzgemeinde" zum Beispiel "In welcher Gemeinde wohnen Sie?"); schau dafür auf die Zeilen davor\n'
    + '- frage nach der Sache selbst; bitte dein Gegenüber nie, etwas einzutragen, anzukreuzen oder auszufüllen, und sprich nicht vom Formular, von Feldern, Zeilen, Spalten oder Kästchen\n'
    + '- du weisst nicht, wer dein Gegenüber ist: handelt eine Stelle von einer bestimmten Person oder Partei, dann frage nach dieser in der dritten Person und nenne sie mit einfachen Worten; sprich dein Gegenüber nur dort als diese Person an, wo das Formular selbst es so anspricht\n'
    + '- bei einer Auswahl nenne die Möglichkeiten, die auf dem Formular stehen\n'
    + '- bei einer Tabelle frage nach allen Einträgen und sage, was zu jedem Eintrag gehört\n'
    + '- erfinde nichts, was nicht auf dem Formular steht, und lasse keine Kennung aus; gibt es zu einer Kennung nichts zu fragen, schreibe als Frage genau das Wort KEINE\n'
    + 'Antworte nur als JSON, ohne weiteren Text: {"fragen": [{"kennung": "q1", "frage": "..."}]}';

// the model's word for a place with nothing to ask
const NONE = /^\s*KEINE\s*\.?\s*$/i;

// room for the answer: tokens per unit and a base, capped; a question came to about 35 tokens
const ROOM = [ 70, 600, 12000 ];

export function prompt( text ) {
    return INTRO + '\n\n-----\n' + text + '\n-----\n\n' + RULES;
}

// The entries of a JSON answer under `key`; from a cut-off or unclean answer every whole entry that can be saved
// (an id as a string or as a number; seen 9 October 2026: an answer complete but for one closing brace too many).
export function parse( text, key, id, value ) {
    const clean = ( text || '' ).replace( /^```(?:json)?\s*|\s*```$/gm, '' );
    try {
        const data = JSON.parse( clean.match( /\{[\s\S]*\}/ )[ 0 ] );
        if ( Array.isArray( data[ key ] ) ) {
            return data[ key ];
        }
    } catch {
        // cut off by the room or not clean JSON: entry by entry
    }
    const one = new RegExp( '\\{\\s*"' + id + '"\\s*:\\s*"?([^",}]*?)"?\\s*,\\s*"' + value + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\}', 'g' );
    return [ ...clean.matchAll( one ) ].map( ( m ) => ( { [ id ]: m[ 1 ], [ value ]: m[ 2 ].replace( /\\"/g, '"' ) } ) );
}

// Asks the model page by page and returns { unit id: question } for the units it wrote a question for.
// Swiss German writes ss; the model writes ß now and then ("heißt").
export async function writeQuestions( job, units, client, log ) {
    const written = {};
    for ( const page of job.pages ) {
        const here = units.filter( ( u ) => u.page === page.n && !u.skip );
        if ( !here.length ) {
            continue;
        }
        const answer = await client.ask( prompt( listing( job, units, page.n ) ), { room: Math.min( ROOM[ 2 ], ROOM[ 0 ] * here.length + ROOM[ 1 ] ), log, tag: 'questions page ' + page.n } );
        for ( const e of parse( answer ? answer.text : '', 'fragen', 'kennung', 'frage' ) ) {
            const question = String( e.frage || '' ).replace( /ß/g, 'ss' ).trim();
            if ( here.some( ( u ) => u.id === e.kennung ) && written[ e.kennung ] === undefined && question && !NONE.test( question ) ) {
                written[ e.kennung ] = question;
            }
        }
    }
    return written;
}
