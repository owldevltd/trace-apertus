import { FORMS } from './mock/forms.js';
import { BLOCKS } from './mock/blocks.js';
import { DIALOGUES } from './mock/dialogues.js';
import { api } from './api.js';

// What the screens draw: a form view with name, pages, sections of fields, blocks, the dialogue (the fields in
// units, each with its printed label and, where one holds, a plain question) and what was dictated. It comes
// from a mocked form of the walk-through or from a job of the server; the screens do not care which.
// A saved entry names one of the two: formId for a mock, jobId for a job.

// a mocked form as a view
function fromMock( f ) {
    return { ...f, sizes: [ f.page ], blocks: BLOCKS[ f.id ] || [], dialogue: DIALOGUES[ f.id ] || null };
}

// a job of the server as a view: one section per page, the fields and blocks as the pipeline found them;
// after the filling every field carries its value with state and note: ok, unclear (a person should look),
// missing (required, nothing said), empty. lang: the language of the app. Where it is not the form's, the
// dialogue is shown in its translation, and the view says what is still to translate: the dialogue itself, or
// the values the person gave.
export function fromJob( job, t, lang ) {
    const own = job.dialogue && lang !== job.form.language ? ( job.dialogue.translations || {} )[ lang ] || null : null;
    const translating = job.language && job.language !== job.form.language;
    const sections = job.pages.map( ( p ) => ( {
        title: t( 'page', { n: p.n } ),
        fields: job.fields.filter( ( f ) => f.page === p.n ).map( ( f ) => ( {
            id: f.id,
            label: f.label || t( 'field.unlabelled', { n: f.id.replace( /\D/g, '' ) } ),
            bare: !f.label,
            kind: f.kind,
            page: f.page,
            x: f.x,
            y: f.y,
            w: f.width,
            h: f.height,
            hints: f.hints || [],
            ...( f.group ? { group: f.group, option: f.option } : {} ),
        } ) ),
    } ) ).filter( ( s ) => s.fields.length );
    const filled = job.status === 'filled' || job.status === 'reviewed' || job.status === 'sent';
    // before that, question by question: the fields of every unit that was answered, or left empty by a person
    const replied = new Set( ( job.transcript || [] ).filter( ( p ) => p.text.trim() !== '' ).map( ( p ) => p.question ).filter( Boolean ) );
    const touched = new Set( job.fields.filter( ( f ) => f.value || f.source ).map( ( f ) => f.id ) );
    const answered = new Set( ( job.dialogue ? job.dialogue.units : [] ).filter( ( u ) => replied.has( u.id ) || u.fields.some( ( id ) => touched.has( id ) ) ).flatMap( ( u ) => u.fields ) );
    const values = {};
    if ( filled || answered.size ) {
        for ( const f of job.fields.filter( ( x ) => filled || answered.has( x.id ) ) ) {
            const missing = ( f.hints || [] ).some( ( h ) => h.kind === 'missing' );
            // what the model found wanting: against the catalogue, or against the question itself
            const vague = ( f.hints || [] ).find( ( h ) => h.kind === 'vague' || h.kind === 'incomplete' );
            const open = f.source && f.source.approve && !f.source.review;
            const state = f.kind === 'signature' ? 'sign' : f.value ? ( open || vague ? 'unclear' : 'ok' ) : missing ? 'missing' : 'empty';
            // what the person gave before the translation, where the value is no longer that
            const said = f.source && f.source.said && f.source.said.value !== f.value ? f.source.said.value : '';
            const note = vague ? ( vague.kind === 'incomplete' ? t( 'hint.incomplete', { m: vague.text } ) : vague.text )
                : open ? ( said ? t( 'v.translated', { q: said } ) : f.source.quote ? t( 'v.said', { q: f.source.quote } ) : t( 'v.notliteral' ) ) : missing ? t( 'hint.missing' ) : '';
            values[ f.id ] = [ f.value || '', state, note, said ];
        }
    }
    const laws = [];
    for ( const f of job.fields ) {
        for ( const h of f.hints || [] ) {
            if ( h.kind === 'legal' ) {
                laws.push( { fields: [ f.id ], art: h.article, text: h.text, source: h.catalogue } );
            }
        }
    }
    return {
        id: 'job:' + job.id,
        jobId: job.id,
        name: job.form.name,
        issuer: job.form.issuer || '',
        pages: job.pages.length,
        sizes: job.pages.map( ( p ) => ( { w: p.width, h: p.height } ) ),
        kind: 'captured',
        recipient: '',
        subject: job.form.name,
        sections,
        blocks: job.blocks.map( ( b ) => ( { type: b.type, page: b.page, x: b.x, y: b.y, w: b.width, h: b.height, content: b.content, fontSize: b.fontSize, color: b.color, background: b.background } ) ),
        dialogue: job.dialogue ? job.dialogue.units.map( ( u ) => ( own ? { ...u, question: own.units[ u.id ]?.question, ask: own.units[ u.id ]?.label, options: own.units[ u.id ]?.options } : u ) ) : null,
        language: job.form.language,
        // the dialogue is not in the language of the app yet
        untranslated: !!job.dialogue && lang !== job.form.language && !own,
        // written values still in the language of the person
        toTranslate: translating ? job.fields.filter( ( f ) => f.value && f.kind !== 'checkbox' && f.kind !== 'radio' && f.kind !== 'signature' && !( f.source && f.source.said ) ).length : 0,
        transcript: ( job.transcript || [] ).map( ( p ) => ( { t: clock( p.start ), section: p.approve ? t( 'tr.listen' ) : '', summary: p.text, raw: p.raw } ) ),
        values: filled || answered.size ? values : null,
        status: job.status,
        laws,
    };
}

function clock( sec ) {
    const s = Math.round( sec || 0 );
    return Math.floor( s / 60 ) + ':' + String( s % 60 ).padStart( 2, '0' );
}

// lang(): the language of the app at the moment
export function createModel( t, lang ) {
    const jobs = new Map();
    return {
        mocks: FORMS,
        // the view for an entry, when it is at hand
        formOf( entry ) {
            if ( entry.jobId ) {
                return jobs.get( entry.jobId ) || null;
            }
            const f = FORMS.find( ( x ) => x.id === entry.formId );
            return f ? fromMock( f ) : null;
        },
        // the view for an entry, fetched from the server when it is a job not seen yet
        async loadForm( entry ) {
            if ( entry.jobId && !jobs.has( entry.jobId ) ) {
                const { job } = await api.job( entry.jobId );
                jobs.set( job.id, fromJob( job, t, lang() ) );
            }
            return this.formOf( entry );
        },
        // a view fresh from a job the app just ran
        keep( job ) {
            const view = fromJob( job, t, lang() );
            jobs.set( job.id, view );
            return view;
        },
        // drop a cached job so the next load fetches it anew
        forget( id ) {
            jobs.delete( id );
        },
        // drop them all: the language of the app changed, and with it how a job is shown
        clear() {
            jobs.clear();
        },
    };
}

// the fields of a view in one list, without the ones a person unticked
export const fieldsOf = ( form, off = [] ) => form.sections.flatMap( ( s ) => s.fields.filter( ( f ) => !off.includes( f.id ) ) );
