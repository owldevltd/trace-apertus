import { listing } from '../dialogue/listing.js';
import { INTRO, parse } from '../dialogue/writer.js';

// The kind of a field, proposed by the small model: when a form is captured, and for the fields a person adds or
// names anew when a form is corrected. One call per page, with the same list of the page the questions are
// written from; the answer is one of nine words per place. The proposal is taken only where code has no word of
// its own: a field the geometry calls text. A date the label names, a box several lines high, a signature, a
// tick mark and a field with values to choose from stay what they are, and a kind a person set in the mask is
// never asked about again.
//
// Measured 11 October 2026 on the 178 places a person writes into on the four shipped forms. With eight words,
// two runs named the same kind for 176 of 176 places; every place with "Nr." or "Nummer" in its label came back
// as text, and so did the one labelled "PLZ". With the nine words below, one run: 13 of those 15 as an
// identifier, "PLZ" as a postcode, telephone 8 of 8, e-mail 4 of 5 ("Telefon oder E-Mail" is called a
// telephone number), IBAN 1 of 1; against that, "Anzahl Kinder" and one "Geburtsdatum" came back as an
// identifier, and four places without a label got no answer. So the proposal is a proposal: the mask shows it,
// and a person sets another kind there. The wording is the measured one.
//
// The model's word for a date is not taken. A date is written as a day and nothing else, so a wrong one costs
// what else was said: of the eight places it called a date where the label rule of the geometry does not,
// three take a date, three are the boxes for day, month and year, one asks for weekday, date and time, and
// one is no date. Set by the assistant, open.
//
// What the model proposed is not told back to it when it fills in a form: the given of such a field reads as
// before (src/fields/filler.js). Tried 11 October 2026 on a tester's two dictations: with the proposed kind
// behind the field, 23 of 78 values came back as another, 14 of them in fields whose kind had not changed, one
// was the word "Zahl" and one was gone; the unit behind a number was dropped by the model as code drops it.

// the model's word for a kind; "text" and "datum" leave the field as it is
const WORDS = [
    [ 'text', null, 'ein Name, eine Adresse, ein Wort oder ein Satz' ],
    [ 'nummer', 'identifier', 'eine Kennnummer oder ein Aktenzeichen, zum Beispiel eine Policen-, Kunden-, Versicherten- oder Schadennummer' ],
    [ 'zahl', 'number', 'eine Menge, ein Betrag oder ein Prozentsatz' ],
    [ 'telefon', 'phone', 'eine Telefonnummer' ],
    [ 'email', 'email', 'eine E-Mail-Adresse' ],
    [ 'plz', 'postcode', 'eine Postleitzahl allein, ohne Ort und Strasse' ],
    [ 'iban', 'iban', 'eine IBAN' ],
    [ 'datum', null, 'ein Datum' ],
    [ 'uhrzeit', 'time', 'eine Uhrzeit' ],
];


// room for the answer: tokens per place and a base
const ROOM = [ 18, 300 ];

export function prompt( text, ids ) {
    return INTRO + '\n\n-----\n' + text + '\n-----\n\n'
        + 'Sage zu jeder der Kennungen unten, welche Art von Angabe an dieser Stelle eingetragen wird. Wähle genau eine dieser Arten:\n'
        + WORDS.map( ( [ word, , what ] ) => '- ' + word + ': ' + what ).join( '\n' ) + '\n\n'
        + 'Die Kennungen: ' + ids.join( ', ' ) + '\n'
        + 'Antworte nur als JSON, ohne weiteren Text: {"arten": [{"kennung": "q1", "art": "text"}]}';
}

// The units the model is asked about: one place a person writes into, asked in the dialogue.
export function places( job, units ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    return units.filter( ( u ) => !u.skip && u.kind === 'single' && ![ 'checkbox', 'radio', 'signature' ].includes( fields.get( u.fields[ 0 ] )?.kind ) );
}

// May the proposal set this field's kind? Not where a person did, not where the field has values to choose
// from, and not where code named the kind itself.
function open( f ) {
    return f.kindBy !== 'person' && !f.values && ( f.kind === 'text' || f.kindBy === 'model' );
}

// The pages a proposal is asked for: those with a place whose kind is open; only: the ids of the fields it is
// about, where not the whole form is.
export function pages( job, units, only = null ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    const mine = places( job, units ).filter( ( u ) => open( fields.get( u.fields[ 0 ] ) ) && ( !only || only.has( u.fields[ 0 ] ) ) );
    return job.pages.filter( ( p ) => mine.some( ( u ) => u.page === p.n ) ).map( ( p ) => p.n );
}

// Asks the model page by page and sets the kind of every open field it names one for, with kindBy "model".
// Returns the ids of the fields whose kind is another one now. Without a key, or after a halt, the model gives
// no answer and nothing changes.
export async function predictKinds( job, units, client, log, only = null ) {
    const fields = new Map( job.fields.map( ( f ) => [ f.id, f ] ) );
    const kinds = new Map( WORDS.map( ( [ word, kind ] ) => [ word, kind ] ) );
    const changed = [];
    for ( const n of pages( job, units, only ) ) {
        const here = places( job, units ).filter( ( u ) => u.page === n );
        const answer = await client.ask( prompt( listing( job, units, n ), here.map( ( u ) => u.id ) ), { room: ROOM[ 0 ] * here.length + ROOM[ 1 ], log, tag: 'kinds page ' + n } );
        const seen = new Set();
        for ( const e of parse( answer ? answer.text : '', 'arten', 'kennung', 'art' ) ) {
            const unit = here.find( ( u ) => u.id === String( e.kennung || '' ).trim() );
            const word = String( e.art || '' ).trim().toLowerCase();
            const f = unit && fields.get( unit.fields[ 0 ] );
            if ( !f || seen.has( f.id ) || !kinds.has( word ) || !open( f ) || ( only && !only.has( f.id ) ) ) {
                continue;
            }
            seen.add( f.id );
            const kind = kinds.get( word );
            if ( kind && kind !== f.kind ) {
                f.kind = kind;
                f.kindBy = 'model';
                changed.push( f.id );
            } else if ( !kind && f.kindBy === 'model' ) {
                // named anew as text: the proposal of before is taken back
                f.kind = 'text';
                delete f.kindBy;
                changed.push( f.id );
            }
        }
    }
    return changed;
}
