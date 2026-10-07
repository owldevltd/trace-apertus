import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { day } from '../fields/dates.js';

// Hints for the person: what to look at before sending. missing and format come from code; legal and vague come
// from the catalogue of the form, the only source of legal text. The small model judges an entry only with the
// catalogue in front of it and names only sources that stand there (measured 3 October 2026: 0 invented
// sources with the catalogue, 4 without). The hint says "please look here", never "not allowed".

// Code hints over all fields: a required field without a value, a date that is none.
export function hints( job, catalogue = null ) {
    const out = [];
    for ( const f of job.fields ) {
        const entry = catalogue ? find( catalogue, f ) : null;
        const required = f.required || ( entry && entry.required );
        if ( required && !f.value ) {
            out.push( { field: f.id, kind: 'missing', text: 'Pflichtangabe, nichts gesagt.' } );
        }
        if ( f.kind === 'date' && f.value && !day( f.value ) ) {
            out.push( { field: f.id, kind: 'format', text: 'Kein lesbares Datum.' } );
        }
        if ( entry && entry.source && entry.source !== 'keine sichere Quelle' ) {
            out.push( { field: f.id, kind: 'legal', text: entry.requirement, article: entry.source, catalogue: catalogue.file + ' · ' + ( catalogue.verified || 'unverified' ) } );
        }
    }
    return out;
}

// The catalogue of a form, when there is one: data/catalogues/<form>.json.
export async function loadCatalogue( job ) {
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

// the catalogue entry for a field: same label, or the entry's field name inside the label
function find( catalogue, f ) {
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
        const entry = find( catalogue, f );
        if ( !entry || !f.value || f.kind === 'checkbox' || f.kind === 'radio' ) {
            continue;
        }
        const p = 'Du prüfst eine Angabe in einem Schweizer Formular.\nFormular: ' + job.form.name + '\nFeld: ' + f.label + '\nGesprochene Angabe: "' + f.value + '"\n\n'
            + 'Für dieses Formular liegt ein vorab erstellter Katalog der Vorgaben je Feld vor. Stütze dich auf diesen Katalog; nenne nur Quellen, die darin stehen.\n\nKatalog:\n' + text + '\n\n'
            + '1. Reicht die Angabe für dieses Feld aus?\n2. Welche Vorgabe aus dem Katalog gilt dafür?\n3. Nenne die Quelle aus dem Katalog (Gesetz, SR-Nummer, Artikel). Steht im Katalog keine sichere Quelle, sage das.\n\n'
            + 'Antworte nur als JSON: {"ausreichend": "ja|nein|unklar", "hinweis": "...", "vorgabe": "...", "quelle": "...", "sicherheit": "hoch|mittel|niedrig"}';
        const answer = await client.ask( p, { room: 600, log: path.join( config.storageDir, job.id, 'model' ), tag: 'vague ' + f.id } );
        const a = parse( answer ? answer.text : '' );
        if ( a && a.ausreichend && a.ausreichend !== 'ja' ) {
            out.push( { field: f.id, kind: 'vague', text: a.hinweis || a.vorgabe || '', article: a.quelle || '', catalogue: catalogue.file + ' · ' + ( catalogue.verified || 'unverified' ) } );
        }
    }
    return out;
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
