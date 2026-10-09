// The catalogue of a form: per field what the law or the practice requires, with the source where there is a
// sure one. Built once per form by the large model from the form's text with the wording the measurement used
// (3 October 2026: 8 forms, every catalogue valid JSON; the small model, judging only from the catalogue, invented
// no source any more). The sources are then checked against the statute text by a person and the catalogue
// carries that stamp in `verified`. A catalogue is data, not knowledge of the model at run time.
// A form a person photographs or uploads gets its catalogue in the same way, as a step of its capture, and that
// one is nobody's checked work: it has no stamp, and every hint from it says so.

export const LARGE = 'swiss-ai/Apertus-v1.5-70B';

export function prompt( text ) {
    return 'Hier ist der Text eines Schweizer Formulars. Erstelle einen Katalog der rechtlichen und fachlichen Vorgaben je Feld, das ausgefüllt werden muss:\n'
        + '- welches Gesetz oder welche Verordnung gilt (Name, SR-Nummer, Artikel), falls es eine gibt\n'
        + '- was genau angegeben werden muss (Inhalt, Form, Genauigkeit, Fristen)\n'
        + 'Nenne nur Quellen, bei denen du sicher bist; sonst schreibe "keine sichere Quelle". Erfinde keine Artikelnummern.\n'
        + 'Antworte nur als JSON: {"formular": "...", "felder": [{"feld": "...", "vorgabe": "...", "quelle": "...", "sicherheit": "hoch|mittel|niedrig"}]}'
        + '\n\nFormulartext:\n' + text;
}

// The form's text for the model: the labels of its fields and its text blocks, in reading order.
export function formText( job ) {
    const lines = [];
    for ( const b of job.blocks || [] ) {
        if ( b.type === 'text' && b.content ) {
            lines.push( b.content.replace( /\s+/g, ' ' ).trim() );
        }
    }
    // the labels of the fields where no block carries them: a job without blocks, a label set by hand
    for ( const f of job.fields ) {
        if ( f.label && ( !lines.length || !f.labelBlock ) ) {
            lines.push( f.label );
        }
    }
    return lines.join( '\n' );
}

// Room for the answer: 40 entries came to about 3 000 tokens (7 October 2026); a form with a hundred fields
// needs twice that, or the JSON is cut and the call wasted.
const ROOM = 7000;

// Asks the large model and returns the catalogue in the repository's shape, unverified.
export async function buildCatalogue( job, client, log = null ) {
    const answer = await client.ask( prompt( formText( job ) ), { room: ROOM, model: LARGE, log, tag: 'catalogue ' + job.form.name } );
    const raw = parse( answer ? answer.text : '' );
    if ( !raw || !Array.isArray( raw.felder ) ) {
        throw new Error( 'the model returned no catalogue' );
    }
    return fromMeasured( raw, { built: new Date().toISOString().slice( 0, 10 ), model: LARGE } );
}

// Entries for fields a person added or named anew, so that these get hints as well: the large model is asked
// with the same wording and the whole form in front of it, for these fields only. An entry is taken when it
// names one of the fields and the catalogue has none for it yet; it carries `added`, and with it the mark that
// nobody checked it, whatever stamp the catalogue has. Returns how many entries were added.
export async function extendCatalogue( job, catalogue, labels, client, log = null ) {
    const plain = ( t ) => ( t || '' ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, '' );
    const open = labels.filter( ( l ) => plain( l ) && !catalogue.fields.some( ( e ) => plain( e.field ) === plain( l ) ) );
    if ( !open.length ) {
        return 0;
    }
    const answer = await client.ask( prompt( formText( job ) ) + '\n\nGib nur die Einträge für diese Felder zurück:\n' + open.map( ( l ) => '- ' + l ).join( '\n' ),
        { room: Math.min( ROOM, 200 * open.length + 300 ), model: LARGE, log, tag: 'catalogue for ' + open.length + ' fields' } );
    const raw = parse( answer ? answer.text : '' );
    const today = new Date().toISOString().slice( 0, 10 );
    let added = 0;
    for ( const e of raw && Array.isArray( raw.felder ) ? fromMeasured( raw ).fields : [] ) {
        if ( open.some( ( l ) => plain( l ) === plain( e.field ) ) && !catalogue.fields.some( ( x ) => plain( x.field ) === plain( e.field ) ) ) {
            catalogue.fields.push( { ...e, added: today } );
            added++;
        }
    }
    return added;
}

// A catalogue as the measurement wrote it (German keys) → the repository's shape (English keys).
export function fromMeasured( raw, meta = {} ) {
    return {
        form: raw.formular || '',
        built: meta.built || null,
        model: meta.model || LARGE,
        verified: meta.verified || null,
        fields: ( raw.felder || [] ).map( ( e ) => ( {
            field: e.feld || '',
            requirement: e.vorgabe || '',
            source: e.quelle || 'keine sichere Quelle',
            certainty: { hoch: 'high', mittel: 'medium', niedrig: 'low' }[ e.sicherheit ] || e.sicherheit || 'low',
        } ) ),
    };
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
