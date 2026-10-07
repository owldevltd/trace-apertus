import { jobDir, saveJob, saveRun, record } from '../job.js';
import { hints, loadCatalogue, judgeVague } from '../review/hints.js';
import { MONTHS, day, swiss } from './dates.js';

// Values from the dictation into the fields. The transcript is the text the model reads from, every piece with
// its id in front ("[p1] …"); the fields go in bundles of six with the kind of each as the given, and the answer
// is one line per field, "name: value [piece]". What comes back is taken by code only with its origin: literal
// (it stands in the transcript as is), derived (every word stands in the named piece), cited (the piece is named
// but the words are not there), composed (nothing to hold it to). Not literal or derived means a person looks.
// Measured on the sibling track: six per call answer every line most reliably; the schema excerpt per field cut
// missing lines from 35 to 2.

export const BUNDLE = 6;

// room for the answer: tokens per field, at least this many
const ROOM = [ 50, 400 ];

// instead of the dash the model sometimes spells out that nothing was said
const NONE = /^[\-–—\s]*$|nicht angegeben|keine angabe|nicht vorhanden|nicht genannt|nicht gesagt|nicht ersichtlich|unbekannt|TT\.MM\.JJJJ/i;

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

// The transcript as the text the model reads: every piece with its id.
export function picture( transcript ) {
    return transcript.map( ( p ) => '[p' + p.n + '] ' + p.text.trim() ).join( '\n\n' );
}

export function prompt( fields, text ) {
    const lines = fields.map( ( f ) => '- ' + f.id + ': ' + ( f.label || 'Feld ' + f.id ) + ( f.option && f.option !== f.label ? ' (' + f.option + ')' : '' ) + ' — Vorgabe: ' + ( KIND[ f.kind ] || KIND.text ) );
    return 'Unten steht, was eine Person zu einem Formular gesagt hat, als Text. Jedes Stück der Aufnahme beginnt mit seiner Kennung in eckigen Klammern, zum Beispiel [p1].\n\n'
        + '-----\n' + text + '\n-----\n\n'
        + 'Lies daraus ab, was in diese Felder des Formulars gehört:\n' + lines.join( '\n' ) + '\n\n'
        + 'Wurde zu einem Feld nichts gesagt, schreibe dafür einen Strich (-). Erfinde nichts. Bei einem Kästchen schreibe ja oder nein. '
        + 'Antworte mit genau einer Zeile je Feld, in der Form "name: wert [Kennung des Stücks, aus dem der Wert stammt]", ohne weiteren Text.';
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
                    out[ f.id ] = { value: raw.replace( /\s*\[\s*p\d+\s*\]/g, '' ).trim().replace( /^["'`]+|["'`]+$/g, '' ), cited: [ ...new Set( cited ) ] };
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
        const transcript = ( job.transcript || [] ).filter( ( p ) => p.text.trim() !== '' );
        if ( !transcript.length ) {
            throw new Error( 'nothing dictated yet' );
        }
        const text = picture( transcript );
        const fields = job.fields.filter( ( f ) => f.kind !== 'signature' );
        const asked = {};
        let n = 0;
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
        for ( const f of fields ) {
            const got = asked[ f.id ];
            delete f.hints;
            if ( !got || NONE.test( got.value ) ) {
                f.value = '';
                delete f.source;
                continue;
            }
            Object.assign( f, judge( f, got, transcript ) );
        }
        // hints: by code always; legal ones only where the form has a catalogue, the vague judgement one call per field
        const catalogue = await loadCatalogue( job );
        const all = [ ...hints( job, catalogue ), ...( catalogue ? await judgeVague( job, catalogue, client ) : [] ) ];
        for ( const h of all ) {
            const f = job.fields.find( ( x ) => x.id === h.field );
            const { field, ...hint } = h;
            ( f.hints = f.hints || [] ).push( hint );
        }
        job.status = 'filled';
        record( job, 'filled', fields.filter( ( f ) => f.value ).length + ' of ' + fields.length + ' fields' );
        await saveJob( job );
        state.step = 'done';
    } catch ( error ) {
        state.step = 'error';
        state.error = error.message;
    }
    await saveRun( job.id, Object.assign( state, { at: now() } ) );
    return job;
}

async function round( client, bundle, text, job ) {
    const answer = await client.ask( prompt( bundle, text ), { room: room( bundle.length ), log: jobDir( job.id ) + '/model', tag: 'fill ' + bundle.map( ( f ) => f.id ).join( ',' ) } );
    return answer ? parse( answer.text, bundle ) : {};
}

// The value with its origin and whether a person should look.
function judge( f, got, transcript ) {
    const mark = f.kind === 'checkbox' || f.kind === 'radio';
    let value = got.value;
    if ( mark ) {
        if ( !YES.test( value ) ) {
            return { value: '' };
        }
        value = 'x';
    }
    if ( f.kind === 'date' ) {
        value = swiss( got.value );
    }
    const pieces = transcript.filter( ( p ) => got.cited.includes( p.n ) );
    // literal: the value, or for a mark its option, stands in a piece; the piece that holds it is the source
    const needle = mark ? ( f.option || f.label ) : got.value;
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
    const source = { how, approve: !( how === 'literal' || how === 'derived' ) || !!( piece && piece.approve ) };
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
