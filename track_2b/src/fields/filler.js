import { jobDir, saveJob, saveRun, record } from '../job.js';
import { hints, loadCatalogue, judgeVague, suggest } from '../review/hints.js';
import { MONTHS, day } from './dates.js';
import { write, fits } from './kinds.js';
import { LANGUAGE, foreign } from '../language.js';
import { asked } from '../dialogue/translate.js';
import { rowsOf } from '../dialogue/units.js';

// Values from the dictation into the fields. The transcript is the text the model reads from, every piece with
// its id in front ("[p1] …"); the fields go in bundles of six with the kind of each as the given, and the answer
// is one line per field, "name: value [piece]". What comes back is taken by code only with its origin: literal
// (it stands in the transcript as is), derived (every word stands in the named piece), cited (the piece is named
// but the words are not there), composed (nothing to hold it to). Not literal or derived means a person looks.
// Measured on the sibling track: six per call answer every line most reliably; the schema excerpt per field cut
// missing lines from 35 to 2.
//
// A field with values, a list the person who keeps the form set, is not read freely: it goes to the model alone,
// with its list, and the answer is the number of an entry or 0. The field then holds that entry, in the language
// of the form whatever language was spoken, or nothing. Tried 11 October 2026 on two real dictations and their
// renderings in French, Italian and English, the lists in German: of seven lists, four gave the same entry in
// all four languages, among them the one the trial was run for (a workplace named beside a function); three did
// not, and on one of these the text names the entry plainly and two languages picked another. So a pick the
// words of the dictation do not carry asks for a look, and the person is shown the list.

export const BUNDLE = 6;

// room for the answer: tokens per field, at least this many
const ROOM = [ 50, 400 ];

// instead of the dash the model sometimes spells out that nothing was said
const NONE = /^[\-–—\s]*$|^Strich\.?$|nicht angegeben|keine angabe|nicht vorhanden|nicht genannt|nicht gesagt|nicht ersichtlich|unbekannt|TT\.MM\.JJJJ/i;

const YES = /^(ja|yes|oui|sì|si|x|angekreuzt|zutreffend)\b/i;

// what the model is told a field takes
const KIND = {
    text: 'Text',
    multiline: 'Text, mehrere Sätze möglich',
    date: 'Datum als TT.MM.JJJJ',
    number: 'Zahl',
    checkbox: 'Kästchen: ja oder nein',
    radio: 'Auswahl: ja oder nein',
};

// The given of a field. A kind the model proposed is not told back to it, and the kinds code alone writes and
// checks (a telephone number, a postcode, …) have no word here: such a field reads as text, as it did when the
// wording was measured. Tried 11 October 2026 with the proposed kind behind the field: 23 of 78 values came
// back as another, 14 of them in fields whose kind had not changed.
const given = ( f ) => ( f.kindBy === 'model' ? KIND.text : KIND[ f.kind ] || KIND.text );

// how the language of the form is named beside the person's (the wording that was tried)
const PRINTED = { de: 'deutsch', fr: 'französisch', it: 'italienisch', en: 'englisch' };

// The question for a field with values: which entry of its list was said, by number, or 0.
export function pickPrompt( field, text, spoken = null, printed = 'de' ) {
    return 'Unten steht, was eine Person zu einem Formular gesagt hat, als Text.' + ( spoken ? ' Die Person spricht ' + LANGUAGE[ spoken ] + ', das Formular ist ' + PRINTED[ printed ] + '.' : '' ) + '\n\n'
        + '-----\n' + text + '\n-----\n\n'
        + 'Es geht um das Feld «' + ( field.label || 'Feld ' + field.id ) + '». Dafür sind nur diese Werte erlaubt:\n' + field.values.map( ( v, i ) => ( i + 1 ) + ': ' + v ).join( '\n' ) + '\n\n'
        + 'Welcher dieser Werte wurde gesagt? Antworte nur mit der Nummer, ohne weiteren Text. Wurde keiner davon gesagt, antworte mit 0.';
}

// The entry an answer names: the first number in it. Empty for 0, for a number the list does not have and for
// an answer without a number: the field then stays empty rather than hold something that is not on its list.
export function picked( answer, field ) {
    const m = ( answer || '' ).match( /\d+/ );
    return ( m && field.values[ Number( m[ 0 ] ) - 1 ] ) || '';
}

// The entry with its origin: literal when every word of it stands in a piece of what was said, as a word; else
// chosen, and a person looks.
function chosen( entry, transcript ) {
    const piece = transcript.find( ( p ) => covers( entry, p.text ) ) || null;
    const source = { how: piece ? 'literal' : 'chosen', approve: !piece || !!piece.approve };
    if ( piece ) {
        source.piece = piece.n;
        source.quote = entry;
    }
    return { value: entry, source };
}

// One field with values from what was said: one call. The field is emptied first and holds an entry of its list
// afterwards, or nothing.
async function pick( client, f, text, transcript, job, tag ) {
    f.value = '';
    delete f.source;
    const answer = await client.ask( pickPrompt( f, text, foreign( job ), job.form.language ), { room: 20, log: jobDir( job.id ) + '/model', tag } );
    const entry = picked( answer ? answer.text : '', f );
    if ( entry ) {
        Object.assign( f, chosen( entry, transcript ) );
    }
}

// The transcript as the text the model reads: every piece with its id.
export function picture( transcript ) {
    return transcript.map( ( p ) => '[p' + p.n + '] ' + p.text.trim() ).join( '\n\n' );
}

// spoken: the language of the person, when it is not the form's. The value then stays as it was said: it is
// held against the person's own words here and translated in a step of its own (measured 9 October 2026: 24 of
// 28 values literal in French answers, 22 of 27 in English, 29 of 32 in German).
//
// questions: field id → the question of its unit, for a dictation in one go. A label alone does not say whose
// entry is meant: a form prints "Tel.-Nr." for the employer and again for the injured person, and the question
// names the party. Tried 11 October 2026 on a tester's two dictations on the corrected forms: with the label
// alone the two telephone numbers came back swapped, one e-mail address stood in both fields and the debtor's
// date of birth also as the date of the interest; with the question behind the label each stood with its own
// party and the name came back without the words around it. 37 of 117 fields came back as another; one value
// then stood twice that had not ("Projektleiter" as the workplace too), and one creditor came back as the
// sentence he was named in. Set by the assistant, open: the form "label (question)".
export function prompt( fields, text, spoken = null, questions = null ) {
    const lines = fields.map( ( f ) => {
        const asks = questions && questions.get( f.id );
        return '- ' + f.id + ': ' + ( f.label || 'Feld ' + f.id ) + ( asks ? ' (' + asks + ')' : f.option && f.option !== f.label ? ' (' + f.option + ')' : '' ) + ' — Vorgabe: ' + given( f );
    } );
    return 'Unten steht, was eine Person zu einem Formular gesagt hat, als Text. Jedes Stück der Aufnahme beginnt mit seiner Kennung in eckigen Klammern, zum Beispiel [p1].\n\n'
        + '-----\n' + text + '\n-----\n\n'
        + 'Lies daraus ab, was in diese Felder des Formulars gehört:\n' + lines.join( '\n' ) + '\n\n'
        + 'Wurde zu einem Feld nichts gesagt, schreibe dafür einen Strich (-). Erfinde nichts. Bei einem Kästchen schreibe ja oder nein. '
        + 'Antworte mit genau einer Zeile je Feld, in der Form "name: wert [Kennung des Stücks, aus dem der Wert stammt]", ohne weiteren Text.'
        + ( spoken ? '\nDie Person spricht ' + LANGUAGE[ spoken ] + '. Schreibe jeden Wert so, wie er gesagt wurde, auf ' + LANGUAGE[ spoken ] + '; übersetze nichts.' : '' );
}

export function room( count ) {
    return Math.max( ROOM[ 1 ], ROOM[ 0 ] * count );
}

// The answer lines for the asked fields: { id: { value, cited: [ pieceNumbers ] } }. A missing line is a missing id.
export function parse( answer, fields ) {
    const lines = [];
    for ( const line of answer.split( /\r?\n/ ) ) {
        const m = line.match( /^[\s\-*]*([\p{L}\p{N} _-]{1,40}?)\s*:\s*(.*)$/u );
        if ( m ) {
            lines.push( [ m[ 1 ].trim().toLowerCase(), m[ 2 ].trim() ] );
        }
    }
    const out = {};
    for ( const fits of [ ( key, id ) => key === id, ( key, id ) => key.endsWith( id ) ] ) {
        for ( let i = 0; i < lines.length; i++ ) {
            if ( !lines[ i ] ) {
                continue;
            }
            const [ key, raw ] = lines[ i ];
            for ( const f of fields ) {
                if ( !out[ f.id ] && fits( key, f.id.toLowerCase() ) ) {
                    const cited = [ ...raw.matchAll( /\[\s*p(\d+)\s*\]/g ) ].map( ( m ) => Number( m[ 1 ] ) );
                    // where the piece belongs the model now and then spells out the dash it was told to write for
                    // nothing ("Bern: Strich"), or leaves one behind the value ("nein –"): no part of the value
                    const value = raw.replace( /\s*\[\s*p\d+\s*\]/g, '' ).trim().replace( /\s*:\s*Strich\.?$/i, '' ).replace( /\s+[\-–—]$/, '' ).replace( /^["'`]+|["'`]+$/g, '' );
                    out[ f.id ] = { value, cited: [ ...new Set( cited ) ] };
                    lines[ i ] = null;
                }
            }
        }
    }
    return out;
}

export function plain( t ) {
    return t.toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
}

function plainWords( t ) {
    return t.toLowerCase().replace( /[^\p{L}\p{N}]+/gu, ' ' ).trim();
}

// Does the value stand in the text as is; a date in any usual writing of the same day.
export function within( value, text ) {
    const d = day( value );
    if ( d ) {
        const [ y, mo, da ] = d.split( '-' );
        const flat = text.toLowerCase().replace( /\s+/g, '' );
        const forms = [ Number( da ) + '.' + Number( mo ) + '.' + y, da + '.' + mo + '.' + y, Number( da ) + '.' + MONTHS[ Number( mo ) - 1 ] + y, d ];
        return forms.some( ( f ) => new RegExp( '(?<!\\d)' + f.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) ).test( flat ) );
    }
    return plain( value ) !== '' && plain( text ).includes( plain( value ) );
}

// Does every word of the value, numbers included, stand in the text.
export function covers( value, text ) {
    const words = plainWords( value ).split( /\s+/ ).filter( Boolean );
    const inText = ' ' + plainWords( text ) + ' ';
    return words.length > 0 && words.every( ( w ) => inText.includes( ' ' + w + ' ' ) );
}

// Fills the fields of a job from its transcript: bundles, one follow-up for missing lines, origin by code.
export async function fillJob( job, client ) {
    const state = { step: 'fill', page: 0, at: now(), error: null };
    await saveRun( job.id, state );
    try {
        // What was answered on its own stays: the fields of a unit something was said in reply to, and every
        // field a person typed an answer into or ticked off. The dictation fills the rest, from the pieces
        // that were not the answer to one question.
        const replied = new Set( ( job.transcript || [] ).filter( ( p ) => p.question && p.text.trim() !== '' ).map( ( p ) => p.question ) );
        const kept = new Set( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => replied.has( u.id ) ).flatMap( ( u ) => u.fields ) );
        const transcript = ( job.transcript || [] ).filter( ( p ) => p.text.trim() !== '' && !p.question );
        if ( !transcript.length ) {
            throw new Error( 'nothing dictated yet' );
        }
        const text = picture( transcript );
        // a place the conversation does not ask for is not filled from the dictation either: on a fillable form
        // that is a section bar or an office note the geometry took for a field (seen 11 October 2026 in a
        // tester's dictation: "3 Anstellung" held a date, the footer the first sentences)
        const unasked = new Set( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => u.skip ).flatMap( ( u ) => u.fields ) );
        // nor is a list of entries: it stays open and is asked entry by entry. Tried 11 October 2026 on made-up
        // dictations with none to three further claims beside the claim itself: read with the other fields, all
        // nine rows came back filled, with the claim itself where no further one was said; read alone, one entry
        // still came back where none was said.
        const lists = new Set( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => u.repeat ).flatMap( ( u ) => u.fields ) );
        const open = job.fields.filter( ( f ) => f.kind !== 'signature' && !kept.has( f.id ) && !unasked.has( f.id ) && !lists.has( f.id ) && !( f.source && f.source.how === 'entered' && !f.source.review ) );
        // a field with values is asked alone, with its list; the others in their bundles
        // a date printed as three boxes is read as one date, where all three are open
        const dated = new Map( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => u.parts === 'date' && u.fields.every( ( id ) => open.some( ( f ) => f.id === id ) ) )
            .flatMap( ( u ) => u.fields.map( ( id ) => [ id, u ] ) ) );
        const fields = open.filter( ( f ) => !f.values && !dated.has( f.id ) );
        for ( const u of new Set( dated.values() ) ) {
            fields.push( asDate( u, u.fields.map( ( id ) => job.fields.find( ( f ) => f.id === id ) ) ) );
        }
        const asked = {};
        let n = 0;
        for ( const f of open.filter( ( x ) => x.values ) ) {
            await saveRun( job.id, Object.assign( state, { page: ++n, at: now() } ) );
            await pick( client, f, text, transcript, job, 'pick ' + f.id );
        }
        for ( const bundle of chunks( fields, BUNDLE ) ) {
            await saveRun( job.id, Object.assign( state, { page: ++n, at: now() } ) );
            Object.assign( asked, await round( client, bundle, text, job ) );
        }
        // the follow-up: fields without a line, once more, at most one bundle
        const again = fields.filter( ( f ) => !asked[ f.id ] ).slice( 0, BUNDLE );
        if ( again.length ) {
            await saveRun( job.id, Object.assign( state, { page: ++n, at: now() } ) );
            Object.assign( asked, await round( client, again, text, job ) );
        }
        // the hints anew, except what the model said about an answer that stays
        for ( const f of job.fields ) {
            const stay = open.includes( f ) ? [] : ( f.hints || [] ).filter( ( h ) => h.kind === 'incomplete' );
            if ( stay.length ) {
                f.hints = stay;
            } else {
                delete f.hints;
            }
        }
        for ( const f of fields ) {
            const got = asked[ f.id ];
            if ( !got || NONE.test( got.value ) ) {
                for ( const t of f.parts || [ f ] ) {
                    t.value = '';
                    delete t.source;
                }
                continue;
            }
            if ( f.parts ) {
                const date = judge( f, got, transcript );
                spreadDate( f.parts, date.value, date.source );
            } else {
                Object.assign( f, judge( f, got, transcript ) );
            }
        }
        oneOf( job.fields );
        // hints: by code always; legal ones only where the form has a catalogue, the vague judgement one call per field
        const catalogue = await loadCatalogue( job );
        const vague = catalogue ? await judgeVague( job, catalogue, client ) : [];
        await suggest( job, vague, transcript, client );
        const all = [ ...hints( job, catalogue ), ...vague ];
        for ( const h of all ) {
            const f = job.fields.find( ( x ) => x.id === h.field );
            const { field, ...hint } = h;
            ( f.hints = f.hints || [] ).push( hint );
            // one of two fields took what belongs to the other: a person says which
            if ( h.kind === 'double' && f.source ) {
                f.source.approve = true;
            }
        }
        job.status = 'filled';
        record( job, 'filled', open.filter( ( f ) => f.value ).length + ' of ' + open.length + ' fields' );
        await saveJob( job );
        state.step = 'done';
    } catch ( error ) {
        state.step = 'error';
        state.error = error.message;
    }
    await saveRun( job.id, Object.assign( state, { at: now() } ) );
    return job;
}

// The answer to one question goes into the fields of its unit and nowhere else: the model reads the question with
// the answer, the code takes what comes back for these fields only and holds it against the answer alone. A unit
// with one field needs no name on the line: the model names a field by its label as often as by its id
// ("gläubiger:" for glaeubiger) or splits it into parts, and the whole answer belongs to that field anyway.
// Measured 9 October 2026 on the walk-through (tests/answers.js): no value in a field it was not said for,
// against 2 of 16 from the free dictation, and one to two right answers kept by the binding.
// pieces: the transcript pieces said in reply to the unit. only: the ids of the fields the answer is for, where
// it is not the whole unit: one entry of a list goes into one row of its table. Returns the fields it was for.
export async function fillUnit( job, unit, pieces, client, only = null ) {
    const fields = ( only || unit.fields ).map( ( id ) => job.fields.find( ( f ) => f.id === id ) ).filter( Boolean );
    const ask = asked( job, unit );
    const text = picture( pieces.map( ( p ) => ( { n: p.n, text: ( ask ? 'Frage: ' + ask + '\nAntwort: ' : '' ) + p.text } ) ) );
    for ( const f of fields ) {
        f.value = '';
        delete f.source;
    }
    if ( unit.parts === 'date' && !only ) {
        const line = asDate( unit, fields );
        const answer = await client.ask( prompt( [ line ], text, foreign( job ) ), { room: room( 1 ), log: jobDir( job.id ) + '/model', tag: 'answer ' + unit.id } );
        const got = answer ? parse( answer.text, [ line ] )[ line.id ] || whole( answer.text ) : null;
        if ( got && !NONE.test( got.value ) ) {
            const date = judge( line, got, pieces );
            spreadDate( fields, date.value, date.source );
        }
        return fields;
    }
    for ( const f of fields.filter( ( x ) => x.values ) ) {
        await pick( client, f, text, pieces, job, 'pick ' + unit.id + ' ' + f.id );
    }
    for ( const bundle of chunks( fields.filter( ( x ) => !x.values ), BUNDLE ) ) {
        const answer = await client.ask( prompt( bundle, text, foreign( job ) ), { room: room( bundle.length ), log: jobDir( job.id ) + '/model', tag: 'answer ' + unit.id } );
        const got = answer ? parse( answer.text, bundle ) : {};
        if ( answer && fields.length === 1 && !got[ fields[ 0 ].id ] ) {
            got[ fields[ 0 ].id ] = whole( answer.text );
        }
        for ( const f of bundle ) {
            if ( got[ f.id ] && !NONE.test( got[ f.id ].value ) ) {
                Object.assign( f, judge( f, got[ f.id ], pieces ) );
            }
        }
    }
    oneOf( fields );
    return fields;
}

// An answer to a list of entries can name one entry or several, and which it is the model says: it writes a
// block per entry, the word EINTRAG and a line per column. Tried 11 October 2026 on seven made-up answers with
// none to three entries, to two lists: the number of entries came back right for all seven, 42 of 43 cells
// right. In front of a value the model puts the number of the column, or its label, or the words of the
// question for it; so a block is read by the order of its lines and not by what stands in front. Reading the
// same lists out of a whole dictation failed (an entry came back where none was said): there the list stays open.
export function entriesPrompt( cells, text, spoken = null ) {
    return 'Unten steht eine Frage zu einem Formular und was eine Person darauf geantwortet hat. Jedes Stück der Aufnahme beginnt mit seiner Kennung in eckigen Klammern, zum Beispiel [p1].\n\n'
        + '-----\n' + text + '\n-----\n\n'
        + 'Die Frage gehört zu einer Liste mit mehreren gleichen Zeilen. Jeder Eintrag der Liste hat diese Angaben:\n' + cells.map( ( f, i ) => ( i + 1 ) + ': ' + f.label ).join( '\n' ) + '\n\n'
        + 'Lies aus der Antwort ab, wie viele Einträge die Person genannt hat und was zu jedem gehört. Schreibe für jeden Eintrag zuerst eine Zeile mit dem Wort EINTRAG und darunter je Angabe eine Zeile in der Form "Nummer: Wert"; '
        + 'fehlt eine Angabe, schreibe als Wert einen Strich (-). Erfinde nichts. Hat die Person keinen Eintrag genannt, antworte nur mit dem Wort KEINE.'
        // not tried in another language than the form's
        + ( spoken ? '\nDie Person spricht ' + LANGUAGE[ spoken ] + '. Schreibe jeden Wert so, wie er gesagt wurde, auf ' + LANGUAGE[ spoken ] + '; übersetze nichts.' : '' );
}

// The entries of an answer of the model: one array of values per entry, a value per column, '' for none.
export function entries( answer, columns ) {
    const out = [];
    for ( const line of ( answer || '' ).split( /\r?\n/ ) ) {
        const m = line.match( /^[^:]{1,80}:\s*(.*)$/ );
        if ( /^\s*\**\s*EINTRAG/i.test( line ) ) {
            out.push( [] );
        } else if ( m && out.length && out[ out.length - 1 ].length < columns ) {
            const value = m[ 1 ].replace( /\s*\[\s*p\d+\s*\]\s*$/, '' ).trim();
            out[ out.length - 1 ].push( NONE.test( value ) ? '' : value );
        }
    }
    return out.map( ( row ) => Array.from( { length: columns }, ( _, i ) => row[ i ] || '' ) ).filter( ( row ) => row.some( Boolean ) );
}

// What a person said in reply to a list goes into its rows from row `from` on (counted from 1), an entry a row:
// one call. Returns { fields, entries, left }: the fields of the rows that were written, how many entries the
// model named, and how many of them the table had no row for.
export async function fillEntries( job, unit, pieces, client, from ) {
    const rows = rowsOf( unit ).slice( from - 1 ).map( ( row ) => row.map( ( id ) => job.fields.find( ( f ) => f.id === id ) ) );
    const ask = asked( job, unit );
    const text = picture( pieces.map( ( p ) => ( { n: p.n, text: ( ask ? 'Frage: ' + ask + '\nAntwort: ' : '' ) + p.text } ) ) );
    const answer = await client.ask( entriesPrompt( rows[ 0 ], text, foreign( job ) ), { room: room( unit.fields.length ), log: jobDir( job.id ) + '/model', tag: 'entries ' + unit.id } );
    const found = answer ? entries( answer.text, unit.columns ) : [];
    const fields = [];
    found.slice( 0, rows.length ).forEach( ( values, r ) => {
        rows[ r ].forEach( ( f, c ) => {
            f.value = '';
            delete f.source;
            if ( values[ c ] ) {
                Object.assign( f, judge( f, { value: values[ c ], cited: pieces.map( ( p ) => p.n ) }, pieces ) );
            }
            fields.push( f );
        } );
    } );
    return { fields, entries: found.length, left: Math.max( 0, found.length - rows.length ) };
}

// A date into the three boxes it is printed with: day, month, year, each as a number ("3", "11", "2025"), all
// with the origin of the date they came from. What is no date goes into the first box as it was said, and a
// person looks. Returns whether it was a date.
export function spreadDate( fields, value, source ) {
    const iso = day( value );
    if ( !iso ) {
        fields[ 0 ].value = value;
        fields[ 0 ].source = { ...source, approve: true };
        return false;
    }
    const [ y, m, d ] = iso.split( '-' );
    [ d, m, y ].forEach( ( part, i ) => {
        fields[ i ].value = String( Number( part ) );
        fields[ i ].source = { ...source };
    } );
    return true;
}

// the one line a date in three boxes is read with: a date, under the id of its first box
const asDate = ( unit, fields ) => ( { id: fields[ 0 ].id, label: unit.label, kind: 'date', parts: fields } );

// Every line of an answer as one value, whatever name stands in front: { value, cited }, or null for none.
function whole( text ) {
    const values = [];
    for ( const line of text.split( /\r?\n/ ) ) {
        const value = line.replace( /^[\s\-*]*[\p{L}\p{N} _-]{1,40}?\s*:\s*/u, '' ).replace( /\s*\[\s*p\d+\s*\]/g, '' ).trim().replace( /^["'`]+|["'`]+$/g, '' );
        if ( value && !NONE.test( value ) ) {
            values.push( value );
        }
    }
    const cited = [ ...text.matchAll( /\[\s*p(\d+)\s*\]/g ) ].map( ( m ) => Number( m[ 1 ] ) );
    return values.length ? { value: values.join( ', ' ), cited: [ ...new Set( cited ) ] } : null;
}

// The questions a dictation in one go is read with, by field; none where the person speaks another language
// than the form's: that wording was measured without them and not tried with them.
function questionsOf( job ) {
    if ( foreign( job ) || !job.dialogue ) {
        return null;
    }
    return new Map( job.dialogue.units.filter( ( u ) => u.question ).flatMap( ( u ) => u.fields.map( ( id ) => [ id, u.question ] ) ) );
}

async function round( client, bundle, text, job ) {
    const answer = await client.ask( prompt( bundle, text, foreign( job ), questionsOf( job ) ), { room: room( bundle.length ), log: jobDir( job.id ) + '/model', tag: 'fill ' + bundle.map( ( f ) => f.id ).join( ',' ) } );
    return answer ? parse( answer.text, bundle ) : {};
}

// Options that exclude each other take one tick. Where what was said left two of them ticked (each is read as
// "yes or no" by itself), nobody chose: both ask for a look, and the person taps the one that holds. Seen
// 11 October 2026 in a tester's dictation: two positions in a company ticked at once.
function oneOf( fields ) {
    const groups = new Map();
    for ( const f of fields.filter( ( x ) => x.kind === 'radio' && x.group && x.value ) ) {
        groups.set( f.group, [ ...( groups.get( f.group ) || [] ), f ] );
    }
    for ( const ticked of [ ...groups.values() ].filter( ( g ) => g.length > 1 ) ) {
        for ( const f of ticked ) {
            f.source = { ...( f.source || { how: 'composed' } ), approve: true };
        }
    }
}

// A value that begins with the name of its own field is what was said about the field, not what goes into it:
// "Adresse des Betreibungsamtes ist Aare Strasse 1" is the address, "Schuldner: Urs Meier" the debtor. The
// name is the label up to its first bracket, colon or semicolon; it falls away with the "ist" or the colon
// behind it. Anything else stays: "Strasse 5" is a street.
export function unnamed( f, value ) {
    const name = ( ( f.label || '' ).match( /^[^(:;]+/ ) || [ '' ] )[ 0 ].trim();
    if ( name.length < 3 || !value.toLowerCase().startsWith( name.toLowerCase() ) ) {
        return value;
    }
    const rest = value.slice( name.length );
    const says = rest.match( /^\s*(?::|(?:ist|sind|lautet|lauten|heisst|heißt)(?![\p{L}])\s*:?)\s*/iu );
    return says && rest.slice( says[ 0 ].length ).trim() ? rest.slice( says[ 0 ].length ).trim() : value;
}

// The value with its origin and whether a person should look.
function judge( f, got, transcript ) {
    const mark = f.kind === 'checkbox' || f.kind === 'radio';
    // what was said as a question is no statement ("Verheiratet?"): written without the question mark, and a
    // person looks
    const question = !mark && /\?\s*$/.test( got.value );
    const said = mark ? got.value : unnamed( f, got.value ).replace( /\s*\?+\s*$/, '' );
    let value = got.value;
    if ( mark ) {
        if ( !YES.test( value ) ) {
            return { value: '' };
        }
        value = 'x';
    }
    // the way the form takes it: a date as a day, digits said one by one as one number, a number without the unit
    // its label names; what is none of its kind stays as it was said, and a person looks
    if ( !mark ) {
        value = write( f.kind, said );
    }
    const pieces = transcript.filter( ( p ) => got.cited.includes( p.n ) );
    // literal: the value, or for a mark its option, stands in a piece; the piece that holds it is the source
    const needle = mark ? ( f.option || f.label ) : said;
    const literal = transcript.find( ( p ) => within( needle, p.text ) ) || null;
    let how = 'composed';
    let piece = literal || pieces[ 0 ] || null;
    if ( literal ) {
        how = 'literal';
    } else if ( pieces.length && covers( needle, pieces.map( ( p ) => p.text ).join( ' ' ) ) ) {
        how = 'derived';
    } else if ( pieces.length ) {
        how = 'cited';
    }
    const source = { how, approve: !( how === 'literal' || how === 'derived' ) || !!( piece && piece.approve ) || ( !mark && !fits( f.kind, value ) ) || question };
    if ( piece ) {
        source.piece = piece.n;
        source.quote = how === 'literal' || how === 'derived' ? needle : excerpt( piece.text, needle );
    }
    return { value, source };
}

// a stretch of the piece around the first word of the value that occurs in it, for the person to read
function excerpt( text, value ) {
    const words = plainWords( value ).split( /\s+/ ).filter( ( w ) => w.length >= 4 );
    const low = text.toLowerCase();
    for ( const w of words ) {
        const i = low.indexOf( w );
        if ( i >= 0 ) {
            const from = Math.max( 0, i - 60 );
            const to = Math.min( text.length, i + w.length + 60 );
            return ( from > 0 ? '…' : '' ) + text.slice( from, to ).trim() + ( to < text.length ? '…' : '' );
        }
    }
    return '';
}

function chunks( list, size ) {
    const out = [];
    for ( let i = 0; i < list.length; i += size ) {
        out.push( list.slice( i, i + size ) );
    }
    return out;
}

function now() {
    return new Date().toISOString();
}
