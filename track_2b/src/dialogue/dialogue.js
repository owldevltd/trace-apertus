import { config } from '../config.js';
import { buildUnits } from './units.js';
import { writeQuestions } from './writer.js';
import { checkQuestions, RUNS } from './checker.js';

// The form as a conversation: its units in the order of the paper, each with the printed label and, where one
// holds, a plain question. Built once when the form is captured and kept with it; nothing is asked of the model
// while a person fills in. The same order twice does not give the same wording even at temperature 0 (9 October
// 2026: 121 of 236 questions word for word on a second writing), which is why the questions are stored and not
// written anew.
//
// A question holds when every run of the check names its own unit and no other unit of the page is asked with
// the same words: two places asked alike cannot be told apart by the person either. What does not hold keeps
// the printed label, as before. On the four shipped forms 156 of 259 units get a plain question that way,
// 29 are not asked and 74 keep the label (results/dialogue.md).

const plain = ( t ) => t.toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );

// Which of the written questions hold: { unit id: question }.
export function holding( units, written, said ) {
    const count = {};
    for ( const u of units ) {
        if ( written[ u.id ] ) {
            const key = u.page + ' ' + plain( written[ u.id ] );
            count[ key ] = ( count[ key ] || 0 ) + 1;
        }
    }
    const out = {};
    for ( const u of units ) {
        const runs = said[ u.id ] || [];
        if ( written[ u.id ] && runs.length === RUNS && runs.every( ( s ) => s === u.id ) && count[ u.page + ' ' + plain( written[ u.id ] ) ] === 1 ) {
            out[ u.id ] = written[ u.id ];
        }
    }
    return out;
}

// A unit is answered when something stands in one of its fields, a person left it empty, or something was said
// in reply to it; a piece of the recording with nothing heard in it is no answer.
export function answered( job, unit ) {
    return unit.fields.some( ( id ) => {
        const f = job.fields.find( ( x ) => x.id === id );
        return f && ( f.value || f.source );
    } ) || ( job.transcript || [] ).some( ( p ) => p.question === unit.id && p.text.trim() !== '' );
}

// Returns { dialogue, written, said }: the dialogue as the contract has it, and what the model wrote and named
// on the way, for a measurement. Without a key, or after a halt, the units come with their labels only.
export async function buildDialogue( job, client, log ) {
    const units = buildUnits( job );
    const written = await writeQuestions( job, units, client, log );
    const said = Object.keys( written ).length ? await checkQuestions( job, units, written, client, log ) : {};
    const questions = holding( units, written, said );
    for ( const u of units ) {
        if ( questions[ u.id ] ) {
            u.question = questions[ u.id ];
        }
    }
    return {
        dialogue: { built: new Date().toISOString(), model: Object.keys( written ).length ? config.model : null, units },
        written,
        said,
    };
}
